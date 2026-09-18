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

    wireTabs();
    loadFeed();
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
  /* Maps                                                              */
  /* ---------------------------------------------------------------- */

  /* Leaflet + OpenStreetMap: no API key, no account, and it degrades to
     a plain message if the CDN is unreachable. Chicago is the default
     view so an empty map still shows the right city. */
  const CHICAGO = [41.8000, -87.6100];
  const mapInstances = {};

  function renderMap(elId, noteId, points, emptyNote) {
    const el = document.getElementById(elId);
    const note = document.getElementById(noteId);
    if (!el) return;

    if (typeof L === "undefined") {
      el.classList.add("photo-slot");
      PSS.setText(note, "Map unavailable — could not load the map library.");
      return;
    }

    if (!mapInstances[elId]) {
      mapInstances[elId] = L.map(el, { scrollWheelZoom: false }).setView(CHICAGO, 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(mapInstances[elId]);
    }
    const map = mapInstances[elId];

    /* Drop the previous pins so a filter change does not stack markers. */
    (map.__pins || []).forEach((m) => map.removeLayer(m));
    map.__pins = [];

    const mappable = points.filter((p) => p.latitude != null && p.longitude != null);
    mappable.forEach((p) => {
      const marker = L.marker([p.latitude, p.longitude]).addTo(map);
      /* bindPopup takes HTML, so build the node and let the DOM escape. */
      const wrap = document.createElement("div");
      const name = document.createElement("strong");
      PSS.setText(name, p.name);
      wrap.appendChild(name);
      if (p.address) {
        const addr = document.createElement("div");
        PSS.setText(addr, p.address);
        wrap.appendChild(addr);
      }
      marker.bindPopup(wrap);
      map.__pins.push(marker);
    });

    if (mappable.length) {
      map.fitBounds(L.featureGroup(map.__pins).getBounds().pad(0.2));
      PSS.setText(note, mappable.length + (mappable.length === 1 ? " location" : " locations") + " on the map.");
    } else {
      map.setView(CHICAGO, 11);
      PSS.setText(note, emptyNote);
    }
    /* The map is laid out while its tab may be hidden; recalculate once
       it is actually on screen. */
    setTimeout(() => map.invalidateSize(), 0);
  }

  /* ---------------------------------------------------------------- */
  /* Care directory                                                    */
  /* ---------------------------------------------------------------- */

  let careCategories = [];
  let activeConcerns = new Set();
  let allProviders = [];

  async function loadCareDirectory() {
    const [cats, provs] = await Promise.all([
      PSS.client.from("care_categories").select("*")
        .eq("status", "published").order("sort_order", { ascending: true }),
      PSS.client.from("health_providers").select("*")
        .eq("status", "published").order("name", { ascending: true })
    ]);

    careCategories = (cats && cats.data) || [];
    allProviders = (provs && provs.data) || [];

    renderFilters();
    renderProviders();
  }

  function renderFilters() {
    const box = document.getElementById("care-filters");
    box.innerHTML = "";

    if (!careCategories.length) {
      const p = document.createElement("p");
      p.className = "font-body-md text-body-md text-on-surface-variant";
      PSS.setText(p, "Filters coming soon!");
      box.appendChild(p);
      return;
    }

    careCategories.forEach((cat) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.dataset.concern = cat.slug;
      chip.setAttribute("aria-pressed", "false");
      chip.className = chipClass(false);
      PSS.setText(chip, cat.label);
      chip.addEventListener("click", () => {
        if (activeConcerns.has(cat.slug)) activeConcerns.delete(cat.slug);
        else activeConcerns.add(cat.slug);
        chip.setAttribute("aria-pressed", String(activeConcerns.has(cat.slug)));
        chip.className = chipClass(activeConcerns.has(cat.slug));
        renderProviders();
      });
      box.appendChild(chip);
    });

    const clear = document.createElement("button");
    clear.type = "button";
    clear.id = "care-clear";
    clear.className = "px-4 py-2 rounded-full font-label-sm text-label-sm text-primary underline";
    clear.textContent = "Clear filters";
    clear.addEventListener("click", () => {
      activeConcerns.clear();
      renderFilters();
      renderProviders();
    });
    box.appendChild(clear);
  }

  function chipClass(active) {
    return "px-4 py-2 rounded-full font-label-sm text-label-sm border transition-colors " +
      (active
        ? "bg-primary text-on-primary border-primary"
        : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-primary");
  }

  /* A provider matches when it offers EVERY selected concern, so stacking
     filters narrows rather than widens the list. */
  function matchesFilters(provider) {
    if (!activeConcerns.size) return true;
    const services = Array.isArray(provider.services) ? provider.services : [];
    for (const slug of activeConcerns) {
      if (!services.includes(slug)) return false;
    }
    return true;
  }

  function renderProviders() {
    const box = document.getElementById("providers");
    const count = document.getElementById("care-count");
    box.innerHTML = "";

    const shown = allProviders.filter(matchesFilters);

    if (!allProviders.length) {
      PSS.setText(count, "");
      box.appendChild(emptyCard("Healthcare providers coming soon!",
        "We're building the directory of FQHCs and queer-affirming clinics now."));
    } else if (!shown.length) {
      PSS.setText(count, "No providers match those filters yet.");
      box.appendChild(emptyCard("No matches",
        "Try removing a filter to see more providers."));
    } else {
      PSS.setText(count, shown.length + (shown.length === 1 ? " provider" : " providers"));
      shown.forEach((p) => box.appendChild(providerCard(p)));
    }

    renderMap("care-map", "care-map-note", shown,
      allProviders.length ? "None of these providers have a mapped location yet."
                          : "Provider locations coming soon!");
  }

  function emptyCard(heading, detail) {
    const box = document.createElement("div");
    box.className = "border border-dashed border-outline-variant rounded-xl p-10 text-center";
    const h = document.createElement("p");
    h.className = "font-headline-md text-headline-md text-on-background text-xl mb-2";
    PSS.setText(h, heading);
    const p = document.createElement("p");
    p.className = "font-body-md text-body-md text-on-surface-variant";
    PSS.setText(p, detail);
    box.append(h, p);
    return box;
  }

  function providerCard(provider) {
    const card = document.createElement("article");
    card.className = "bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-2";
    card.dataset.provider = provider.id;

    const name = document.createElement("h3");
    name.className = "font-headline-md text-headline-md text-on-background text-lg";
    PSS.setText(name, provider.name);
    card.appendChild(name);

    const where = [provider.address, provider.neighborhood].filter(Boolean).join(", ");
    if (where) {
      const p = document.createElement("p");
      p.className = "font-body-md text-body-md text-on-surface-variant";
      PSS.setText(p, where);
      card.appendChild(p);
    }

    const tags = Array.isArray(provider.services) ? provider.services : [];
    if (tags.length) {
      const row = document.createElement("div");
      row.className = "flex flex-wrap gap-2 mt-1";
      tags.forEach((slug) => {
        const cat = careCategories.find((c) => c.slug === slug);
        const tag = document.createElement("span");
        tag.className = "bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded-md font-label-sm text-xs";
        PSS.setText(tag, cat ? cat.label : slug);
        row.appendChild(tag);
      });
      card.appendChild(row);
    }

    const links = document.createElement("div");
    links.className = "flex flex-wrap gap-4 mt-2";
    if (provider.phone) {
      const a = document.createElement("a");
      a.className = "font-label-sm text-label-sm text-primary hover:text-secondary";
      a.href = "tel:" + provider.phone;
      PSS.setText(a, provider.phone);
      links.appendChild(a);
    }
    if (provider.website) {
      const a = document.createElement("a");
      a.className = "font-label-sm text-label-sm text-primary hover:text-secondary";
      a.href = provider.website;
      a.rel = "noopener";
      a.textContent = "Website";
      links.appendChild(a);
    }
    if (provider.latitude != null && provider.longitude != null) {
      const a = document.createElement("a");
      a.className = "font-label-sm text-label-sm text-primary hover:text-secondary";
      a.href = "https://www.openstreetmap.org/?mlat=" + provider.latitude +
               "&mlon=" + provider.longitude + "#map=17/" + provider.latitude + "/" + provider.longitude;
      a.rel = "noopener";
      a.textContent = "Directions";
      links.appendChild(a);
    }
    if (links.children.length) card.appendChild(links);

    return card;
  }

  /* ---------------------------------------------------------------- */
  /* Discounts and vendors                                             */
  /* ---------------------------------------------------------------- */

  async function loadDiscounts() {
    const [coupRes, vendRes] = await Promise.all([
      PSS.client.from("coupons").select("*, vendor:vendors(id, name, address, neighborhood, website)")
        .eq("status", "published").order("created_at", { ascending: false }),
      PSS.client.from("vendors").select("*")
        .eq("status", "published").order("name", { ascending: true })
    ]);

    renderCoupons((coupRes && coupRes.data) || []);
    renderVendors((vendRes && vendRes.data) || []);
  }

  function renderCoupons(coupons) {
    const box = document.getElementById("coupons");
    box.innerHTML = "";

    /* Hide coupons whose window has closed; an unset window never expires. */
    const now = Date.now();
    const live = coupons.filter((c) => {
      if (c.valid_until && new Date(c.valid_until).getTime() < now) return false;
      if (c.valid_from && new Date(c.valid_from).getTime() > now) return false;
      return true;
    });

    if (!live.length) {
      const card = emptyCard("Member discounts coming soon!",
        "Your Lovewell discounts will appear here once participating vendors are signed up.");
      card.className += " md:col-span-2";
      box.appendChild(card);
      return;
    }

    live.forEach((coupon) => box.appendChild(couponCard(coupon)));
  }

  function couponCard(coupon) {
    const card = document.createElement("article");
    card.className = "bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-3 bento-shadow";
    card.dataset.coupon = coupon.id;

    if (coupon.discount_text) {
      const badge = document.createElement("span");
      badge.className = "w-fit bg-secondary text-on-secondary px-3 py-1 rounded-full font-label-sm text-label-sm";
      PSS.setText(badge, coupon.discount_text);
      card.appendChild(badge);
    }

    const title = document.createElement("h3");
    title.className = "font-headline-md text-headline-md text-on-background text-xl";
    PSS.setText(title, coupon.title);
    card.appendChild(title);

    if (coupon.vendor && coupon.vendor.name) {
      const v = document.createElement("p");
      v.className = "font-body-md text-body-md text-on-surface-variant";
      PSS.setText(v, "At " + coupon.vendor.name +
        (coupon.vendor.neighborhood ? " · " + coupon.vendor.neighborhood : ""));
      card.appendChild(v);
    }

    if (coupon.description) {
      const d = document.createElement("p");
      d.className = "font-body-md text-body-md text-on-surface-variant";
      PSS.setText(d, coupon.description);
      card.appendChild(d);
    }

    if (coupon.code) {
      const code = document.createElement("p");
      code.className = "font-label-sm text-label-sm text-on-background bg-surface-container px-3 py-2 rounded-lg w-fit tracking-widest";
      PSS.setText(code, coupon.code);
      card.appendChild(code);
    }

    if (coupon.valid_until) {
      const exp = document.createElement("p");
      exp.className = "font-body-md text-xs text-on-surface-variant";
      PSS.setText(exp, "Valid through " + PSS.formatDate(coupon.valid_until,
        { month: "long", day: "numeric", year: "numeric" }));
      card.appendChild(exp);
    }

    const actions = document.createElement("div");
    actions.className = "flex flex-wrap gap-3 mt-auto pt-2";

    /* Apple Wallet: only offered when a signed .pkpass actually exists.
       Generating one needs an Apple Pass Type ID certificate and a
       server-side signer, so until that is set up the button would be a
       dead end — we say so instead of shipping one. */
    if (coupon.wallet_pass_url) {
      const wallet = document.createElement("a");
      wallet.className = "inline-flex items-center gap-2 px-5 py-2 bg-inverse-surface text-surface-bright rounded-full font-label-sm text-label-sm hover:opacity-90 transition-opacity";
      wallet.href = coupon.wallet_pass_url;
      wallet.dataset.wallet = coupon.id;
      /* .pkpass must be handed to the OS, not opened in a tab. */
      wallet.setAttribute("download", "");
      wallet.type = "application/vnd.apple.pkpass";
      const icon = document.createElement("span");
      icon.className = "material-symbols-outlined text-[18px]";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "wallet";
      wallet.append(icon, document.createTextNode("Add to Apple Wallet"));
      actions.appendChild(wallet);
    } else {
      const soon = document.createElement("p");
      soon.className = "font-body-md text-xs text-on-surface-variant";
      soon.dataset.walletPending = coupon.id;
      soon.textContent = "Apple Wallet pass coming soon!";
      actions.appendChild(soon);
    }

    if (coupon.redeem_url) {
      const redeem = document.createElement("a");
      redeem.className = "inline-flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-full font-label-sm text-label-sm hover:bg-primary-container transition-colors";
      redeem.href = coupon.redeem_url;
      redeem.rel = "noopener";
      redeem.dataset.redeem = coupon.id;
      redeem.textContent = "Redeem discount";
      actions.appendChild(redeem);
    }

    card.appendChild(actions);

    if (coupon.terms) {
      const terms = document.createElement("p");
      terms.className = "font-body-md text-xs text-on-surface-variant";
      PSS.setText(terms, coupon.terms);
      card.appendChild(terms);
    }
    return card;
  }

  function renderVendors(vendors) {
    const box = document.getElementById("vendors");
    const count = document.getElementById("vendor-count");
    box.innerHTML = "";

    if (!vendors.length) {
      PSS.setText(count, "");
      box.appendChild(emptyCard("Participating vendors coming soon!",
        "Vendors honouring Lovewell member discounts will be listed and mapped here."));
    } else {
      PSS.setText(count, vendors.length + (vendors.length === 1 ? " vendor" : " vendors"));
      vendors.forEach((v) => {
        const card = document.createElement("article");
        card.className = "bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-2";
        card.dataset.vendor = v.id;

        const name = document.createElement("h3");
        name.className = "font-headline-md text-headline-md text-on-background text-lg";
        PSS.setText(name, v.name);
        card.appendChild(name);

        const where = [v.address, v.neighborhood].filter(Boolean).join(", ");
        if (where) {
          const p = document.createElement("p");
          p.className = "font-body-md text-body-md text-on-surface-variant";
          PSS.setText(p, where);
          card.appendChild(p);
        }
        if (!v.is_participating) {
          const flag = document.createElement("p");
          flag.className = "font-body-md text-xs text-on-surface-variant";
          flag.textContent = "Not currently offering member discounts.";
          card.appendChild(flag);
        }
        if (v.website) {
          const a = document.createElement("a");
          a.className = "font-label-sm text-label-sm text-primary hover:text-secondary";
          a.href = v.website;
          a.rel = "noopener";
          a.textContent = "Website";
          card.appendChild(a);
        }
        box.appendChild(card);
      });
    }

    renderMap("vendor-map", "vendor-map-note", vendors,
      vendors.length ? "None of these vendors have a mapped location yet."
                     : "Vendor locations coming soon!");
  }

  /* ---------------------------------------------------------------- */
  /* Tabs                                                              */
  /* ---------------------------------------------------------------- */

  const TAB_ACTIVE = "px-5 py-3 font-label-sm text-label-sm whitespace-nowrap border-b-2 transition-colors border-primary text-primary";
  const TAB_IDLE = "px-5 py-3 font-label-sm text-label-sm whitespace-nowrap border-b-2 transition-colors border-transparent text-on-surface-variant hover:text-primary";
  const loadedTabs = {};

  function wireTabs() {
    const tabs = [...document.querySelectorAll("[data-tab]")];
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => selectTab(tab.dataset.tab));
    });
    selectTab("community");
  }

  function selectTab(name) {
    document.querySelectorAll("[data-tab]").forEach((tab) => {
      const on = tab.dataset.tab === name;
      tab.className = on ? TAB_ACTIVE : TAB_IDLE;
      tab.setAttribute("aria-selected", String(on));
      const panel = document.getElementById("panel-" + tab.dataset.tab);
      if (panel) panel.hidden = !on;
    });

    /* Fetch each section the first time it is opened, not on page load. */
    if (name === "care" && !loadedTabs.care) { loadedTabs.care = true; loadCareDirectory(); }
    if (name === "discounts" && !loadedTabs.discounts) { loadedTabs.discounts = true; loadDiscounts(); }
    /* A Leaflet map sized while hidden renders grey; nudge it on show. */
    Object.values(mapInstances).forEach((m) => setTimeout(() => m.invalidateSize(), 0));
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
