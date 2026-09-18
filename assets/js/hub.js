/* Lovewell Member Hub: the gate, the community feed, comments, the
   healthcare directory, and profile editing.

   Everything here reads and writes through RLS — the policies in
   supabase/migrations decide what a member may see or change, not this
   file. The checks here are for a coherent UI, not for security. */
(function () {
  const loading = document.getElementById("hub-loading");
  const gate = document.getElementById("hub-gate");
  const content = document.getElementById("hub-content");
  const feed = document.getElementById("feed");

  let me = null;      // the signed-in member's profile row
  let session = null;

  /* ---------------------------------------------------------------- */
  /* Gate                                                              */
  /* ---------------------------------------------------------------- */

  async function start() {
    if (!PSS.isConfigured) {
      loading.hidden = true;
      gate.hidden = false;
      return;
    }

    session = await PSS.getSession();
    loading.hidden = true;

    if (!session) {
      gate.hidden = false;
      return;
    }

    me = await PSS.getProfile();

    /* A session with no profile row means the sign-up trigger did not run
       (or the row was deleted). Posting would fail on me.id, so say so
       plainly rather than rendering a hub whose buttons quietly do
       nothing. */
    if (!me) {
      gate.hidden = false;
      const msg = gate.querySelector("p");
      PSS.setText(msg, "We couldn't load your member profile. Please log out and back in, " +
        "or contact us if this keeps happening.");
      return;
    }

    content.hidden = false;
    await PSS.paintAuthState();

    const since = document.getElementById("member-since");
    PSS.setText(since, "Lovewell member since " +
      PSS.formatDate(me.member_since, { month: "long", year: "numeric" }));
    fillProfileForm(me);

    wirePostForm();
    wireProfileForm();
    document.getElementById("refresh-feed").addEventListener("click", loadFeed);
    document.getElementById("sign-out").addEventListener("click", () => PSS.signOut());

    loadFeed();
    loadProviders();
  }

  /* ---------------------------------------------------------------- */
  /* Community feed                                                    */
  /* ---------------------------------------------------------------- */

  function emptyFeed(message) {
    feed.innerHTML = "";
    const box = document.createElement("div");
    box.className = "border border-dashed border-outline-variant rounded-xl p-10 text-center";
    const p = document.createElement("p");
    p.className = "font-body-lg text-body-lg text-on-surface-variant";
    PSS.setText(p, message);
    box.appendChild(p);
    feed.appendChild(box);
  }

  function avatar(name) {
    const el = document.createElement("div");
    el.className =
      "w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center " +
      "font-label-sm text-label-sm flex-shrink-0";
    el.setAttribute("aria-hidden", "true");
    el.textContent = PSS.initials(name);
    return el;
  }

  function postCard(post) {
    const author = post.author || {};
    const card = document.createElement("article");
    card.className = "bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4";

    /* Header: who and when */
    const head = document.createElement("div");
    head.className = "flex items-center gap-3";
    head.appendChild(avatar(author.display_name));

    const meta = document.createElement("div");
    meta.className = "flex-1 min-w-0";
    const nameLine = document.createElement("p");
    nameLine.className = "font-label-sm text-label-sm text-on-background";
    PSS.setText(nameLine, author.display_name || "Member");
    if (author.pronouns) {
      const pr = document.createElement("span");
      pr.className = "text-on-surface-variant font-normal ml-2";
      PSS.setText(pr, "(" + author.pronouns + ")");
      nameLine.appendChild(pr);
    }
    const when = document.createElement("p");
    when.className = "font-body-md text-xs text-on-surface-variant";
    PSS.setText(when, [PSS.timeAgo(post.created_at), author.neighborhood].filter(Boolean).join(" · "));
    meta.append(nameLine, when);
    head.appendChild(meta);

    /* A member can delete their own post. Moderators can too, but the
       button is only offered to the author to keep the UI simple. */
    if (me && post.author_id === me.id) {
      const del = document.createElement("button");
      del.type = "button";
      del.className = "text-on-surface-variant hover:text-error transition-colors";
      del.setAttribute("aria-label", "Delete your post");
      const icon = document.createElement("span");
      icon.className = "material-symbols-outlined text-[20px]";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "delete";
      del.appendChild(icon);
      del.addEventListener("click", async () => {
        if (!window.confirm("Delete this post?")) return;
        const { error } = await PSS.client.from("posts").delete().eq("id", post.id);
        if (!error) loadFeed();
      });
      head.appendChild(del);
    }
    card.appendChild(head);

    /* Body — member-written, so textContent with preserved line breaks. */
    const body = document.createElement("p");
    body.className = "font-body-md text-body-md text-on-background whitespace-pre-wrap break-words";
    PSS.setText(body, post.body);
    card.appendChild(body);

    /* Comments */
    const comments = Array.isArray(post.post_comments) ? post.post_comments.slice() : [];
    comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const thread = document.createElement("div");
    thread.className = "flex flex-col gap-3 pl-4 border-l-2 border-outline-variant";
    comments.forEach((c) => thread.appendChild(commentRow(c)));
    if (comments.length) card.appendChild(thread);

    /* Reply box */
    const replyForm = document.createElement("form");
    replyForm.className = "flex gap-2 items-start";
    const input = document.createElement("input");
    input.type = "text";
    input.required = true;
    input.maxLength = 2000;
    input.className = "field flex-1";
    input.placeholder = "Add a comment…";
    input.setAttribute("aria-label", "Add a comment");
    const send = document.createElement("button");
    send.type = "submit";
    send.className = "px-5 py-2 border-2 border-primary text-primary rounded-full font-label-sm text-label-sm hover:bg-primary hover:text-on-primary transition-colors";
    send.textContent = "Reply";
    replyForm.append(input, send);

    replyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      send.disabled = true;
      const { data, error } = await PSS.client
        .from("post_comments")
        .insert({ post_id: post.id, author_id: me.id, body: text })
        .select("*")
        .single();
      send.disabled = false;
      if (error) return;
      input.value = "";
      /* Append locally rather than refetching the whole feed, so the
         member does not lose their place. */
      data.author = me;
      if (!thread.isConnected) card.insertBefore(thread, replyForm);
      thread.appendChild(commentRow(data));
    });

    card.appendChild(replyForm);
    return card;
  }

  function commentRow(comment) {
    const author = comment.author || {};
    const row = document.createElement("div");
    row.className = "flex flex-col gap-1";

    const line = document.createElement("p");
    line.className = "font-body-md text-xs text-on-surface-variant";
    PSS.setText(line, (author.display_name || "Member") + " · " + PSS.timeAgo(comment.created_at));

    const text = document.createElement("p");
    text.className = "font-body-md text-body-md text-on-background whitespace-pre-wrap break-words";
    PSS.setText(text, comment.body);

    row.append(line, text);
    return row;
  }

  async function loadFeed() {
    feed.innerHTML = "";
    /* One round trip for posts, their authors, and their comments. The
       embedded profiles come from the foreign keys on author_id. */
    const { data, error } = await PSS.client
      .from("posts")
      .select(
        "id, body, status, created_at, author_id," +
        "author:profiles!posts_author_id_fkey(id, display_name, pronouns, neighborhood)," +
        "post_comments(id, body, created_at, author_id," +
        "author:profiles!post_comments_author_id_fkey(id, display_name))"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      emptyFeed("We couldn't load the feed just now. Please refresh in a moment.");
      return;
    }
    if (!data || data.length === 0) {
      emptyFeed("No posts yet — be the first to share something with your neighbors.");
      return;
    }
    data.forEach((post) => feed.appendChild(postCard(post)));
  }

  function wirePostForm() {
    const form = document.getElementById("post-form");
    const body = document.getElementById("post-body");
    const count = document.getElementById("post-count");
    const status = document.getElementById("post-status");

    body.addEventListener("input", () => { count.textContent = String(body.value.length); });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = body.value.trim();
      if (!text) return;
      PSS.setText(status, "Posting…");
      const { error } = await PSS.client
        .from("posts")
        .insert({ author_id: me.id, body: text });
      if (error) {
        PSS.setText(status, "Sorry, that didn't post. Please try again.");
        return;
      }
      form.reset();
      count.textContent = "0";
      PSS.setText(status, "Posted.");
      loadFeed();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Healthcare directory                                              */
  /* ---------------------------------------------------------------- */

  async function loadProviders() {
    const box = document.getElementById("providers");
    box.innerHTML = "";

    const { data, error } = await PSS.client
      .from("health_providers")
      .select("*")
      .eq("status", "published")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      const p = document.createElement("p");
      p.className = "font-body-md text-body-md text-on-surface-variant";
      p.innerHTML = "<strong>Healthcare providers coming soon!</strong>";
      box.appendChild(p);
      return;
    }

    const list = document.createElement("ul");
    list.className = "flex flex-col gap-4";
    data.forEach((provider) => {
      const li = document.createElement("li");
      li.className = "border-b border-outline-variant pb-4 last:border-0 last:pb-0";

      const name = document.createElement("p");
      name.className = "font-label-sm text-label-sm text-on-background";
      PSS.setText(name, provider.name);
      li.appendChild(name);

      const where = [provider.address, provider.neighborhood].filter(Boolean).join(", ");
      if (where) {
        const p = document.createElement("p");
        p.className = "font-body-md text-sm text-on-surface-variant";
        PSS.setText(p, where);
        li.appendChild(p);
      }
      if (provider.phone) {
        const a = document.createElement("a");
        a.className = "font-body-md text-sm text-primary hover:text-secondary";
        a.href = "tel:" + provider.phone;
        PSS.setText(a, provider.phone);
        li.appendChild(a);
      }
      if (provider.website) {
        const a = document.createElement("a");
        a.className = "font-body-md text-sm text-primary hover:text-secondary block";
        a.href = provider.website;
        a.rel = "noopener";
        a.textContent = "Visit website";
        li.appendChild(a);
      }
      list.appendChild(li);
    });
    box.appendChild(list);
  }

  /* ---------------------------------------------------------------- */
  /* Profile                                                           */
  /* ---------------------------------------------------------------- */

  function fillProfileForm(profile) {
    document.getElementById("pf-name").value = profile.display_name || "";
    document.getElementById("pf-pronouns").value = profile.pronouns || "";
    document.getElementById("pf-hood").value = profile.neighborhood || "";
    document.getElementById("pf-bio").value = profile.bio || "";
  }

  function wireProfileForm() {
    const form = document.getElementById("profile-form");
    const status = document.getElementById("profile-status");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      PSS.setText(status, "Saving…");
      const patch = {
        display_name: fd.get("display_name"),
        pronouns: fd.get("pronouns") || null,
        neighborhood: fd.get("neighborhood") || null,
        bio: fd.get("bio") || null
      };
      const { data, error } = await PSS.client
        .from("profiles")
        .update(patch)
        .eq("id", me.id)
        .select("*")
        .single();
      if (error) {
        PSS.setText(status, "Sorry, that didn't save. Please try again.");
        return;
      }
      me = data;
      /* The cached copy in auth.js is now stale — drop it so the header
         picks up a renamed member. */
      PSS.clearProfileCache();
      await PSS.paintAuthState();
      PSS.setText(status, "Profile saved.");
      loadFeed();
    });
  }

  document.addEventListener("DOMContentLoaded", start);
})();
