/* ------------------------------------------------------------
   Wiring. The timeline owns the year, the map owns the view,
   and the only thing that crosses between them is a year change.
   ------------------------------------------------------------ */
(function () {

  const CFG = window.JS_CONFIG;
  const $ = id => document.getElementById(id);

  const boot = $('boot');
  const countText = $('countText');

  /* Leaflet comes off a CDN. If it never arrives there is no map to build,
     so say that plainly rather than leaving a spinner turning forever. */
  if (!CFG.googleMapsApiKey && typeof L === 'undefined') {
    boot.innerHTML = '<p class="boot__msg">Map library did not load.<br>Check the connection and reload.</p>';
    return;
  }

  const map = window.JSMap.create($('map'), {
    focus: window.Data.extent(),
    onReady: function () {
      boot.classList.add('is-gone');
      setTimeout(function () { boot.remove(); }, 500);
    }
  });

  const timeline = window.Timeline({
    rail: $('rail'),
    thumb: $('railThumb'),
    fill: $('railFill'),
    ticksEl: $('railTicks'),
    labelsEl: $('railLabels'),
    yearEl: $('yearNum'),
    prevBtn: $('prevBtn'),
    nextBtn: $('nextBtn'),
    playBtn: $('playBtn'),
    from: CFG.years.from,
    to: CFG.years.to,
    playMs: CFG.playMs,

    onChange: function (year) {
      const events = window.Data.forYear(year);
      map.render(events);
      countText.textContent = events.length + ' locations in ' + year;
    }
  });

  timeline.set(CFG.startYear, { force: true });

  $('homeBtn').addEventListener('click', function () { map.reset(); });

  /* Page-level shortcuts, only while nothing else has focus. */
  document.addEventListener('keydown', function (e) {
    if (e.target !== document.body) return;
    if (e.code === 'Space') { $('playBtn').click(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { $('prevBtn').click(); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { $('nextBtn').click(); e.preventDefault(); }
  });

  /* Pause the reel when the tab is hidden so it does not run away. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) timeline.stop();
  });
})();
