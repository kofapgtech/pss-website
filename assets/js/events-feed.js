/* Renders the community calendar from the `events` table.
   Used by index.html (a 3-up teaser) and events.html (the full list).

   Any element with id "home-events" or "calendar-events" is filled. The
   optional data-events-limit attribute caps how many are shown. Events
   are world-readable, so this works logged out. */
(function () {
  const client = window.PSS && window.PSS.client;

  function card(evt) {
    const el = document.createElement("article");
    el.className =
      "bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col bento-shadow";

    const media = document.createElement("div");
    media.className = "aspect-video bg-surface-variant overflow-hidden";
    if (evt.image_url) {
      const img = document.createElement("img");
      img.className = "w-full h-full object-cover";
      img.loading = "lazy";
      img.src = evt.image_url;
      img.alt = "";
      media.appendChild(img);
    } else {
      media.className += " photo-slot";
    }
    el.appendChild(media);

    const body = document.createElement("div");
    body.className = "p-6 flex flex-col gap-2 flex-1";

    if (evt.category) {
      const tag = document.createElement("span");
      tag.className =
        "w-fit bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rounded-md font-label-sm text-xs";
      PSS.setText(tag, evt.category);
      body.appendChild(tag);
    }

    const when = document.createElement("p");
    when.className = "font-label-sm text-label-sm text-primary";
    const timePart = PSS.formatTime(evt.starts_at);
    PSS.setText(when, PSS.formatDate(evt.starts_at) + (timePart ? " · " + timePart : ""));
    body.appendChild(when);

    const title = document.createElement("h3");
    title.className = "font-headline-md text-headline-md text-on-background text-xl";
    PSS.setText(title, evt.title);
    body.appendChild(title);

    if (evt.venue_name || evt.neighborhood) {
      const place = document.createElement("p");
      place.className = "font-body-md text-sm text-on-surface-variant flex items-center gap-1";
      const icon = document.createElement("span");
      icon.className = "material-symbols-outlined text-[16px]";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "location_on";
      place.appendChild(icon);
      place.appendChild(
        document.createTextNode([evt.venue_name, evt.neighborhood].filter(Boolean).join(", "))
      );
      body.appendChild(place);
    }

    if (evt.summary) {
      const p = document.createElement("p");
      p.className = "font-body-md text-body-md text-on-surface-variant";
      PSS.setText(p, evt.summary);
      body.appendChild(p);
    }

    if (evt.external_url) {
      const link = document.createElement("a");
      link.className =
        "mt-auto pt-4 font-label-sm text-label-sm text-primary hover:text-secondary inline-flex items-center gap-1";
      link.href = evt.external_url;
      link.textContent = "Event details";
      body.appendChild(link);
    }

    el.appendChild(body);
    return el;
  }

  function emptyState(container, message) {
    const box = document.createElement("div");
    box.className =
      "col-span-full border border-dashed border-outline-variant rounded-xl p-10 text-center";
    const p = document.createElement("p");
    p.className = "font-body-lg text-body-lg text-on-surface-variant";
    PSS.setText(p, message);
    box.appendChild(p);
    container.appendChild(box);
  }

  async function fill(container) {
    container.innerHTML = "";
    if (!client) {
      emptyState(container, "Community events coming soon!");
      return;
    }

    const limit = parseInt(container.dataset.eventsLimit || "24", 10);
    /* Only forward-looking events, soonest first. Anything that already
       happened stays out of the calendar. */
    const { data, error } = await client
      .from("events")
      .select("*")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(limit);

    if (error) {
      emptyState(container, "We couldn't load the calendar just now. Please try again shortly.");
      return;
    }
    if (!data || data.length === 0) {
      emptyState(container, "Community events coming soon! Check back for gatherings around town.");
      return;
    }
    data.forEach((evt) => container.appendChild(card(evt)));
  }

  document.addEventListener("DOMContentLoaded", () => {
    ["home-events", "calendar-events"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) fill(el);
    });
  });
})();
