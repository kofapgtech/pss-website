/* Shared Supabase client, session handling, and the auth-aware bits of
   the header. Every page loads this; only join.html and hub.html do more
   than read from it.

   Expects, in order: the supabase-js UMD bundle, config.js, then this. */
(function () {
  const cfg = window.PSS_CONFIG || {};
  const ready = Boolean(window.supabase && cfg.supabaseUrl && cfg.supabaseKey);

  const client = ready
    ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey)
    : null;

  /* Cache of the signed-in member's profile row, so a page that needs the
     display name several times does not re-query for each use. */
  let profileCache = null;

  const PSS = {
    client,
    /* False when Supabase could not be reached or configured. Callers use
       this to show an explanatory message instead of a silent dead form. */
    isConfigured: ready,

    async getSession() {
      if (!client) return null;
      const { data } = await client.auth.getSession();
      return data.session;
    },

    async getProfile() {
      if (!client) return null;
      if (profileCache) return profileCache;
      const session = await PSS.getSession();
      if (!session) return null;
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      if (error) return null;
      profileCache = data;
      return data;
    },

    clearProfileCache() { profileCache = null; },

    async signOut() {
      if (!client) return;
      await client.auth.signOut();
      profileCache = null;
      window.location.href = "index.html";
    },

    /* Send a visitor to the sign-in page, remembering where they were
       headed so join.html can bounce them back after login. */
    redirectToJoin(returnTo) {
      const target = returnTo || window.location.pathname.split("/").pop() || "index.html";
      window.location.href = "join.html?next=" + encodeURIComponent(target);
    },

    /* Reveal [data-auth-only] or [data-guest-only] elements to match the
       current session, and fill any [data-member-name] slots. Both groups
       ship with the `hidden` attribute set so the wrong one never flashes
       before the session resolves. */
    async paintAuthState(root) {
      const scope = root || document;
      const session = await PSS.getSession();
      const signedIn = Boolean(session);

      scope.querySelectorAll("[data-auth-only]").forEach((el) => {
        el.hidden = !signedIn;
      });
      scope.querySelectorAll("[data-guest-only]").forEach((el) => {
        el.hidden = signedIn;
      });

      if (signedIn) {
        const nameSlots = scope.querySelectorAll("[data-member-name]");
        if (nameSlots.length) {
          const profile = await PSS.getProfile();
          const name = (profile && profile.display_name) || session.user.email;
          nameSlots.forEach((el) => { el.textContent = name; });
        }
      }
      return session;
    },

    /* Turn a timestamp into something readable without pulling in a date
       library. Falls back to the raw value if parsing fails. */
    formatDate(value, opts) {
      const d = new Date(value);
      if (isNaN(d)) return String(value || "");
      return d.toLocaleDateString(undefined, opts || {
        weekday: "short", month: "long", day: "numeric", year: "numeric"
      });
    },

    formatTime(value) {
      const d = new Date(value);
      if (isNaN(d)) return "";
      return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    },

    /* Relative time for the community feed ("4h ago"). */
    timeAgo(value) {
      const then = new Date(value).getTime();
      if (isNaN(then)) return "";
      const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
      if (secs < 60) return "just now";
      const mins = Math.round(secs / 60);
      if (mins < 60) return mins + "m ago";
      const hours = Math.round(mins / 60);
      if (hours < 24) return hours + "h ago";
      const days = Math.round(hours / 24);
      if (days < 7) return days + "d ago";
      return PSS.formatDate(value, { month: "short", day: "numeric", year: "numeric" });
    },

    /* Everything member-written goes through here before it reaches the
       DOM. Set text, never innerHTML, on untrusted strings. */
    setText(el, value) { if (el) el.textContent = value == null ? "" : String(value); },

    initials(name) {
      const parts = String(name || "?").trim().split(/\s+/).slice(0, 2);
      return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
    },

    /* Shared mailing-list handler: index.html and lovewell.html both use it. */
    wireNewsletter(formId, statusId, source) {
      const form = document.getElementById(formId);
      const status = document.getElementById(statusId);
      if (!form) return;
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = new FormData(form).get("email");
        if (!client) {
          PSS.setText(status, "Mailing list is not connected yet. Please check back soon.");
          return;
        }
        PSS.setText(status, "Adding you to the list…");
        const { error } = await client
          .from("newsletter_signups")
          .insert({ email, source: source || "site" });
        /* 23505 is a duplicate email — already subscribed is a success
           from the visitor's point of view, not an error. */
        if (error && error.code !== "23505") {
          PSS.setText(status, "Sorry, that didn't go through. Please try again.");
          return;
        }
        PSS.setText(status, "You're on the list. Watch your inbox for South Side news.");
        form.reset();
      });
    }
  };

  window.PSS = PSS;

  /* Keep the header honest when a session starts or ends in another tab. */
  if (client) {
    client.auth.onAuthStateChange(() => {
      profileCache = null;
      PSS.paintAuthState();
    });
  }

  document.addEventListener("DOMContentLoaded", () => { PSS.paintAuthState(); });
})();
