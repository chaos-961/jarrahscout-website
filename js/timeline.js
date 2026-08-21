/* ------------------------------------------------------------
   Timeline rail.

   A year scrubber built on pointer events, so mouse, pen and
   touch all take the same path. Tick density is recomputed from
   the rail's real width, which is what keeps it legible at 360px
   and at 1920px without a second layout.

   Timeline({ els..., from, to, playMs, onChange }) -> { set, get, stop }
   ------------------------------------------------------------ */
window.Timeline = function (o) {

  const rail = o.rail, thumb = o.thumb, fill = o.fill;
  const ticksEl = o.ticksEl, labelsEl = o.labelsEl;
  const yearEl = o.yearEl;
  const prevBtn = o.prevBtn, nextBtn = o.nextBtn, playBtn = o.playBtn;

  const from = o.from, to = o.to;
  const n = to - from + 1;

  let idx = 0;
  let timer = null;
  let dragging = false;
  let padX = 0;      /* rail side padding, re-read on resize */
  let usable = 1;    /* travel width the thumb actually has */

  const pct = i => (n > 1 ? (i / (n - 1)) * 100 : 0);

  /* ---- one tick per year, drawn once ---- */
  const ticks = [];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'tick';
    s.style.left = pct(i) + '%';
    ticksEl.appendChild(s);
    ticks.push(s);
  }

  /* ---- labels: as many as the current width can hold ---- */
  function measure() {
    padX = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
    usable = Math.max(1, rail.clientWidth - padX * 2);
  }

  function layoutLabels() {
    const perLabel = 48;
    const room = Math.max(2, Math.floor(usable / perLabel));

    let step = Math.max(1, Math.ceil((n - 1) / (room - 1)));
    for (const k of [1, 2, 5, 10, 25, 50]) { if (k >= step) { step = k; break; } }

    const picks = [];
    for (let i = 0; i < n; i += step) picks.push(i);
    const last = n - 1;
    if (picks[picks.length - 1] !== last) {
      /* Drop the penultimate label if the final one would crowd it. */
      if (last - picks[picks.length - 1] < step * 0.6) picks.pop();
      picks.push(last);
    }

    ticks.forEach(t => t.classList.remove('tick--major'));
    labelsEl.textContent = '';
    picks.forEach(i => {
      ticks[i].classList.add('tick--major');
      const el = document.createElement('span');
      el.className = 'rlabel';
      el.style.left = pct(i) + '%';
      el.textContent = String(from + i);
      labelsEl.appendChild(el);
    });
  }

  /* ---- state ---- */
  function paint() {
    const p = pct(idx);
    fill.style.width = p + '%';
    thumb.style.left = (padX + (p / 100) * usable) + 'px';
    yearEl.textContent = String(from + idx);

    rail.setAttribute('aria-valuenow', String(idx));
    rail.setAttribute('aria-valuetext', String(from + idx));

    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === n - 1;
  }

  function set(year, opts) {
    const i = Math.min(n - 1, Math.max(0, Math.round(year - from)));
    const changed = i !== idx;
    idx = i;
    paint();
    if (changed || (opts && opts.force)) o.onChange(from + idx);
  }

  const setIndex = i => set(from + i);

  /* ---- pointer scrubbing ---- */
  function indexFromX(clientX) {
    const r = rail.getBoundingClientRect();
    if (usable <= 0) return idx;
    const t = (clientX - r.left - padX) / usable;
    return Math.round(Math.min(1, Math.max(0, t)) * (n - 1));
  }

  rail.addEventListener('pointerdown', function (e) {
    stop();
    dragging = true;
    rail.classList.add('is-dragging');
    rail.setPointerCapture(e.pointerId);
    setIndex(indexFromX(e.clientX));
    e.preventDefault();
  });

  rail.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    setIndex(indexFromX(e.clientX));
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    rail.classList.remove('is-dragging');
    if (e && rail.hasPointerCapture && rail.hasPointerCapture(e.pointerId)) {
      rail.releasePointerCapture(e.pointerId);
    }
  }
  rail.addEventListener('pointerup', endDrag);
  rail.addEventListener('pointercancel', endDrag);

  /* ---- keyboard ---- */
  rail.addEventListener('keydown', function (e) {
    const jump = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -5, PageUp: 5 };
    if (e.key in jump) { stop(); setIndex(idx + jump[e.key]); e.preventDefault(); }
    else if (e.key === 'Home') { stop(); setIndex(0); e.preventDefault(); }
    else if (e.key === 'End') { stop(); setIndex(n - 1); e.preventDefault(); }
  });

  /* ---- transport ---- */
  prevBtn.addEventListener('click', function () { stop(); setIndex(idx - 1); });
  nextBtn.addEventListener('click', function () { stop(); setIndex(idx + 1); });

  function play() {
    if (timer) return;
    if (idx === n - 1) setIndex(0);
    playBtn.setAttribute('aria-pressed', 'true');
    timer = setInterval(function () { setIndex(idx >= n - 1 ? 0 : idx + 1); }, o.playMs);
  }
  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    playBtn.setAttribute('aria-pressed', 'false');
  }
  playBtn.addEventListener('click', function () { timer ? stop() : play(); });

  /* ---- responsive ---- */
  rail.setAttribute('aria-valuemin', '0');
  rail.setAttribute('aria-valuemax', String(n - 1));
  function relayout() { measure(); layoutLabels(); paint(); }

  relayout();
  /* ResizeObserver is driven by the rendering loop, so a window listener
     backs it up for the cases where frames are throttled or suppressed. */
  new ResizeObserver(relayout).observe(rail);
  window.addEventListener('resize', relayout);
  window.addEventListener('orientationchange', relayout);
  window.addEventListener('load', relayout);

  return { set: set, get: () => from + idx, stop: stop };
};
