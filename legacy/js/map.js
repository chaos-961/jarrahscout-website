/* ------------------------------------------------------------
   Map adapter.

   One public surface, two engines behind it:
     - Google Maps JS API, used when config.googleMapsApiKey is set
     - Leaflet + CARTO raster tiles, the keyless default

   Public API:
     JSMap.create(el, { focus, onReady }) -> { engine, render(events), reset() }

   focus is the box the view opens on and returns to. The wider country
   box in config stays the pan limit, so the user can still roam.

   The map itself only pans and zooms. It never re-centres on a
   year change, so the view the user set is the view they keep.
   ------------------------------------------------------------ */
window.JSMap = (function () {

  const CFG = window.JS_CONFIG;
  const darkQ = window.matchMedia('(prefers-color-scheme: dark)');
  const smallQ = window.matchMedia('(max-width: 560px)');

  const TILES = {
    light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };
  const ATTRIB = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const dotSize = () => (smallQ.matches ? 20 : 17);

  function popupHtml(ev) {
    return '<div class="pop__k">placeholder</div>' +
           '<div class="pop__t">' + ev.title + '</div>' +
           '<div class="pop__m">' + ev.year + ' &middot; ' +
           ev.lat.toFixed(4) + ', ' + ev.lng.toFixed(4) + '</div>';
  }

  /* ---------------- Leaflet engine ---------------- */

  function createLeaflet(el, focus, onReady) {
    const limit = L.latLngBounds(CFG.bounds);
    const home = L.latLngBounds(focus);

    const map = L.map(el, {
      zoomControl: false,
      attributionControl: true,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 110,
      minZoom: CFG.minZoom,
      maxZoom: CFG.maxZoom,
      maxBounds: limit.pad(0.45),
      maxBoundsViscosity: 0.75,
      worldCopyJump: false,
      inertia: true
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const tiles = L.tileLayer(darkQ.matches ? TILES.dark : TILES.light, {
      subdomains: 'abcd',
      maxZoom: 20,
      detectRetina: true,
      attribution: ATTRIB
    }).addTo(map);

    /* Follow the OS theme without a reload. */
    const onScheme = () => tiles.setUrl(darkQ.matches ? TILES.dark : TILES.light);
    if (darkQ.addEventListener) darkQ.addEventListener('change', onScheme);
    else darkQ.addListener(onScheme);

    map.fitBounds(home, { padding: [CFG.fitPadding, CFG.fitPadding] });

    /* Lift the veil once the first tiles paint, with a timeout so a slow
       or blocked CDN never leaves the app stuck behind a spinner. */
    let fired = false;
    const fireReady = function () {
      if (fired) return;
      fired = true;
      if (onReady) onReady();
    };
    tiles.once('load', fireReady);
    setTimeout(fireReady, 2500);

    /* Keep the frame honest when the bar rewraps or the phone rotates.
       ResizeObserver rides the rendering loop, so window events back it up. */
    const resync = function () { map.invalidateSize({ pan: false }); };
    new ResizeObserver(resync).observe(el);
    window.addEventListener('resize', resync);
    window.addEventListener('orientationchange', resync);

    let layer = L.layerGroup().addTo(map);
    let active = null;

    function render(events) {
      /* Fade the outgoing set, then drop it. */
      const old = layer;
      old.eachLayer(function (m) {
        const node = m.getElement();
        if (node) node.classList.add('is-out');
      });
      setTimeout(function () { map.removeLayer(old); }, 210);

      active = null;
      layer = L.layerGroup().addTo(map);

      const size = dotSize();
      events.forEach(function (ev, i) {
        const delay = Math.min(i * 26, 340);
        const marker = L.marker([ev.lat, ev.lng], {
          keyboard: false,
          riseOnHover: true,
          icon: L.divIcon({
            className: 'pin',
            html: '<span class="pin__dot" style="--d:' + delay + 'ms"></span>',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -(size / 2 + 4)]
          })
        });

        marker.bindPopup(popupHtml(ev), { closeButton: true, offset: [0, 0] });
        marker.on('popupopen', function () {
          if (active && active.getElement()) active.getElement().classList.remove('is-active');
          active = marker;
          if (marker.getElement()) marker.getElement().classList.add('is-active');
        });
        marker.on('popupclose', function () {
          if (marker.getElement()) marker.getElement().classList.remove('is-active');
          if (active === marker) active = null;
        });

        marker.addTo(layer);
      });
    }

    function reset() {
      map.flyToBounds(home, {
        padding: [CFG.fitPadding, CFG.fitPadding],
        duration: 0.7
      });
    }

    return { engine: 'leaflet', render: render, reset: reset };
  }

  /* ---------------- Google engine ---------------- */

  function createGoogle(el, focus, onReady) {
    const api = { engine: 'google', render: null, reset: function () {} };
    let map = null, markers = [], info = null, bounds = null, pending = null;

    /* Until the SDK is up, render() just parks the latest year. */
    api.render = function (events) { pending = events; };

    window.__jsMapBoot = function () {
      bounds = new google.maps.LatLngBounds(
        { lat: focus[0][0], lng: focus[0][1] },
        { lat: focus[1][0], lng: focus[1][1] }
      );
      const limit = new google.maps.LatLngBounds(
        { lat: CFG.bounds[0][0], lng: CFG.bounds[0][1] },
        { lat: CFG.bounds[1][0], lng: CFG.bounds[1][1] }
      );

      map = new google.maps.Map(el, {
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        rotateControl: false,
        scaleControl: false,
        clickableIcons: false,
        gestureHandling: 'greedy',
        minZoom: CFG.minZoom,
        maxZoom: CFG.maxZoom,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
        restriction: { latLngBounds: limit, strictBounds: false }
      });

      map.fitBounds(bounds, CFG.fitPadding);
      info = new google.maps.InfoWindow();

      api.render = renderGoogle;
      api.reset = function () { map.fitBounds(bounds, CFG.fitPadding); };

      google.maps.event.addListenerOnce(map, 'idle', function () {
        if (onReady) onReady();
      });

      if (pending) { renderGoogle(pending); pending = null; }
    };

    function markerIcon() {
      const css = getComputedStyle(document.documentElement);
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: smallQ.matches ? 8 : 7,
        fillColor: css.getPropertyValue('--dot').trim() || '#1c7a5b',
        fillOpacity: 1,
        strokeColor: css.getPropertyValue('--dot-core').trim() || '#ffffff',
        strokeWeight: 2.5
      };
    }

    function renderGoogle(events) {
      markers.forEach(function (m) { m.setMap(null); });
      markers = [];
      info.close();

      const icon = markerIcon();
      events.forEach(function (ev, i) {
        const m = new google.maps.Marker({
          position: { lat: ev.lat, lng: ev.lng },
          map: map,
          icon: icon,
          visible: false,
          optimized: false
        });
        /* Stagger the reveal so a year change reads as an arrival. */
        setTimeout(function () { m.setVisible(true); }, Math.min(i * 26, 340));
        m.addListener('click', function () {
          info.setContent(popupHtml(ev));
          info.open({ anchor: m, map: map });
        });
        markers.push(m);
      });
    }

    const s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' +
            encodeURIComponent(CFG.googleMapsApiKey) +
            '&v=weekly&loading=async&callback=__jsMapBoot';
    s.async = true;
    s.onerror = function () {
      console.warn('[map] Google Maps failed to load. Falling back to Leaflet.');
      const fb = createLeaflet(el, focus, onReady);
      api.engine = 'leaflet';
      api.render = fb.render;
      api.reset = fb.reset;
      if (pending) { fb.render(pending); pending = null; }
    };
    document.head.appendChild(s);

    return api;
  }

  /* ---------------- entry ---------------- */

  function create(el, opts) {
    opts = opts || {};
    const focus = opts.focus || CFG.bounds;
    return CFG.googleMapsApiKey
      ? createGoogle(el, focus, opts.onReady)
      : createLeaflet(el, focus, opts.onReady);
  }

  return { create: create };
})();
