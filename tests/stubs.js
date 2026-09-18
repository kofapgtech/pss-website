/* Test doubles injected into the page before any of its own scripts run.
   They stand in for supabase-js and Leaflet, which the test environment
   cannot reach over the network. Everything below runs inside the browser.

   Exported as a string-producing function so Playwright can hand it to
   page.addInitScript(). */
function installStubs(config) {
  const { signedIn, tables, oauthFails } = config;

  /* Mirrored into sessionStorage so a successful log-in, which navigates
     to the hub, does not erase what the test needs to assert. */
  window.__calls = [];      // every write the page attempts
  window.__oauth = [];      // OAuth attempts
  window.__markers = [];    // pins the page drops on a map

  const record = (entry) => {
    window.__calls.push(entry);
    try {
      const prior = JSON.parse(sessionStorage.getItem('__calls') || '[]');
      prior.push(entry);
      sessionStorage.setItem('__calls', JSON.stringify(prior));
    } catch (e) { /* private mode: in-memory list is enough */ }
  };

  const session = signedIn
    ? { user: { id: 'me-1', email: 'ada@example.com' } }
    : null;

  /* --- supabase-js ------------------------------------------------- */
  function builder(table) {
    let rows = (tables[table] || []).slice();
    const b = {
      select() { return b; },
      eq() { return b; }, gte() { return b; }, lte() { return b; },
      contains() { return b; }, order() { return b; }, limit() { return b; },
      insert(v) { record({ op: 'insert', table, value: v });
                  rows = [Object.assign({ id: 'new-row' }, v)]; return b; },
      update(v) { record({ op: 'update', table, value: v });
                  rows = [Object.assign({}, rows[0] || {}, v)]; return b; },
      delete()  { record({ op: 'delete', table }); rows = []; return b; },
      single()      { return Promise.resolve({ data: rows[0] || null, error: null }); },
      maybeSingle() { return Promise.resolve({ data: rows[0] || null, error: null }); },
      then(res, rej) { return Promise.resolve({ data: rows, error: null }).then(res, rej); }
    };
    return b;
  }

  window.supabase = {
    createClient() {
      return {
        from: builder,
        auth: {
          getSession: () => Promise.resolve({ data: { session } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
          signUp: (args) => {
            record({ op: 'signUp', value: args });
            return Promise.resolve({ data: { session, user: { id: 'me-1' } }, error: null });
          },
          signInWithPassword: (args) => {
            record({ op: 'signIn', value: args });
            return Promise.resolve({ data: { session }, error: null });
          },
          signInWithOAuth: (args) => {
            window.__oauth.push(args);
            return Promise.resolve(oauthFails
              ? { data: null, error: { message: 'Unsupported provider: provider is not enabled' } }
              : { data: { url: 'https://example.test/oauth' }, error: null });
          },
          resetPasswordForEmail: (email) => {
            record({ op: 'reset', value: email });
            return Promise.resolve({ error: null });
          },
          signOut: () => { record({ op: 'signOut' }); return Promise.resolve({ error: null }); }
        }
      };
    }
  };

  /* --- Leaflet ------------------------------------------------------
     Just enough of the API for the page to believe a map exists, while
     recording every marker so tests can assert what got pinned. */
  const chain = (extra) => Object.assign({
    addTo() { return this; }, bindPopup(c) { this.__popup = c; return this; },
    getBounds() { return { pad: () => 'bounds' }; }
  }, extra || {});

  window.L = {
    map(el) {
      const m = {
        __el: el, __view: null, __fit: null,
        setView(c, z) { m.__view = [c, z]; return m; },
        fitBounds(b) { m.__fit = b; return m; },
        removeLayer(layer) {
          window.__markers = window.__markers.filter((x) => x !== layer);
          return m;
        },
        invalidateSize() { return m; }
      };
      return m;
    },
    tileLayer() { return chain(); },
    marker(latlng) {
      const mk = chain({ __latlng: latlng });
      window.__markers.push(mk);
      return mk;
    },
    featureGroup() { return chain(); }
  };
}

module.exports = { installStubs };
