'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ALL_YEARS, ERAS, TIMELINE_END, TIMELINE_START, eraForYear } from '@/lib/eras';

const SPAN = TIMELINE_END - TIMELINE_START;

/** How long a flick keeps travelling after the finger leaves, in ms. */
const COAST_MS = 105;
/** A flick can never throw further than this share of the track. */
const MAX_COAST_RATIO = 0.22;

const pctForYear = (year: number) => (year - TIMELINE_START) / SPAN;
const yearForPct = (pct: number) =>
  Math.round(Math.min(1, Math.max(0, pct)) * SPAN) + TIMELINE_START;

interface TimelineSliderProps {
  year: number;
  onYearChange: (year: number) => void;
  /** True while a finger or mouse is down, so the map can hold its framing. */
  onScrubbingChange: (scrubbing: boolean) => void;
  density: Record<number, number>;
  count: number;
  loading: boolean;
}

export default function TimelineSlider({
  year,
  onYearChange,
  onScrubbingChange,
  density,
  count,
  loading,
}: TimelineSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragPct, setDragPct] = useState<number | null>(null);
  const samples = useRef<{ t: number; x: number }[]>([]);

  const dragging = dragPct !== null;
  const thumbPct = dragging ? dragPct : pctForYear(year);
  const era = eraForYear(year);

  const maxDensity = useMemo(
    () => Math.max(1, ...Object.values(density)),
    [density],
  );

  /* ------------------------------------------------------------- dragging */
  const pctFromClientX = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  const beginDrag = useCallback(
    (e: React.PointerEvent) => {
      // Ignore secondary buttons so a right click does not grab the rail.
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.currentTarget.setPointerCapture(e.pointerId);
      samples.current = [{ t: performance.now(), x: e.clientX }];
      const pct = pctFromClientX(e.clientX);
      setDragPct(pct);
      onScrubbingChange(true);
      const next = yearForPct(pct);
      if (next !== year) onYearChange(next);
    },
    [pctFromClientX, onScrubbingChange, onYearChange, year],
  );

  const moveDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      samples.current.push({ t: performance.now(), x: e.clientX });
      if (samples.current.length > 6) samples.current.shift();

      const pct = pctFromClientX(e.clientX);
      setDragPct(pct);
      // The year updates live so pins and the counter track the finger.
      const next = yearForPct(pct);
      if (next !== year) onYearChange(next);
    },
    [dragging, pctFromClientX, onYearChange, year],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      e.currentTarget.releasePointerCapture?.(e.pointerId);

      const width = trackRef.current?.getBoundingClientRect().width ?? 1;
      const pts = samples.current;
      let coastPx = 0;

      if (pts.length >= 2) {
        const last = pts[pts.length - 1];
        // Only the tail of the gesture counts, so a pause kills the throw.
        const first = pts.find((p) => last.t - p.t <= 110) ?? pts[0];
        const dt = last.t - first.t;
        if (dt > 0) {
          const velocity = (last.x - first.x) / dt; // px per ms
          coastPx = velocity * COAST_MS;
          const cap = width * MAX_COAST_RATIO;
          coastPx = Math.max(-cap, Math.min(cap, coastPx));
        }
      }

      const settled = yearForPct(dragPct + coastPx / width);
      samples.current = [];
      setDragPct(null);
      onScrubbingChange(false);
      if (settled !== year) onYearChange(settled);
    },
    [dragging, dragPct, onScrubbingChange, onYearChange, year],
  );

  /* ------------------------------------------------------------- keyboard */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = (delta: number) => {
        e.preventDefault();
        const next = Math.min(TIMELINE_END, Math.max(TIMELINE_START, year + delta));
        if (next !== year) onYearChange(next);
      };
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          return step(-1);
        case 'ArrowRight':
        case 'ArrowUp':
          return step(1);
        case 'PageDown':
          return step(-10);
        case 'PageUp':
          return step(10);
        case 'Home':
          return step(TIMELINE_START - year);
        case 'End':
          return step(TIMELINE_END - year);
      }
    },
    [year, onYearChange],
  );

  /* Release the scrub flag if the pointer is lost outside the window. */
  useEffect(() => {
    if (!dragging) return;
    const cancel = () => {
      setDragPct(null);
      onScrubbingChange(false);
    };
    window.addEventListener('pointercancel', cancel);
    return () => window.removeEventListener('pointercancel', cancel);
  }, [dragging, onScrubbingChange]);

  const decades = ALL_YEARS.filter((y) => y % 10 === 0);

  return (
    <section className="select-none px-5 pb-3 pt-5 sm:px-8 lg:px-12" aria-label="Timeline">
      {/* ------------------------------------------------- year + live count */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="relative h-[clamp(3.2rem,9vw,5.4rem)] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.h2
                key={year}
                initial={{ y: '58%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-58%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 font-display text-[clamp(3.2rem,9vw,5.4rem)] font-semibold leading-none tracking-[-0.02em] text-ink"
              >
                {year}
              </motion.h2>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={era.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              className="mt-1 font-body text-[0.7rem] uppercase tracking-[0.22em] text-ink-muted sm:text-xs"
            >
              {era.label}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="shrink-0 pb-1">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-paper-300 bg-paper-50/80 px-3.5 py-2 shadow-card backdrop-blur">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                count > 0 ? 'bg-forest' : 'bg-ink-faint'
              }`}
            />
            {loading ? (
              <span className="h-3.5 w-24 animate-pulse rounded-full bg-paper-300" />
            ) : (
              <span className="flex items-baseline gap-1.5 font-body text-xs text-ink-soft sm:text-sm">
                <span className="relative inline-block h-[1.15em] w-[1.4em] overflow-hidden text-right tabular-nums">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={count}
                      initial={{ y: '90%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: '-90%', opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                      className="absolute inset-0 font-semibold text-ink"
                    >
                      {count}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span>{count === 1 ? 'event' : 'events'}</span>
                <span className="text-ink-faint">&middot;</span>
                <span className="tabular-nums">{year}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- the rail */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Year"
        aria-valuemin={TIMELINE_START}
        aria-valuemax={TIMELINE_END}
        aria-valuenow={year}
        aria-valuetext={`${year}, ${count} ${count === 1 ? 'event' : 'events'}`}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onKeyDown={onKeyDown}
        className="relative h-16 cursor-grab touch-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-gold/70 active:cursor-grabbing sm:h-[4.5rem]"
      >
        {/* base line */}
        <div className="absolute left-0 right-0 top-7 h-px bg-paper-400" />
        {/* travelled portion */}
        <motion.div
          className="absolute left-0 top-7 h-px origin-left bg-forest/50"
          animate={{ scaleX: thumbPct }}
          style={{ width: '100%' }}
          transition={dragging ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 34 }}
        />

        {/* decade ticks */}
        {decades.map((d) => (
          <div
            key={d}
            className={`absolute top-[1.4rem] -translate-x-1/2 ${
              d % 20 !== 0 ? 'hidden sm:block' : ''
            }`}
            style={{ left: `${pctForYear(d) * 100}%` }}
          >
            <div className="mx-auto h-3 w-px bg-paper-400" />
            <span className="mt-1.5 block font-body text-[0.6rem] tabular-nums tracking-wider text-ink-faint">
              {d}
            </span>
          </div>
        ))}

        {/* density: one dot per year that has history */}
        {ALL_YEARS.map((y) => {
          const n = density[y] ?? 0;
          if (n === 0) return null;
          const size = 4 + Math.min(3, (n / maxDensity) * 3);
          const active = y === year;
          return (
            <span
              key={y}
              className={`absolute -translate-x-1/2 rounded-full transition-colors duration-200 ${
                active ? 'bg-gold' : 'bg-forest/45'
              }`}
              style={{
                left: `${pctForYear(y) * 100}%`,
                top: `calc(1.75rem - ${size / 2}px)`,
                width: size,
                height: size,
              }}
            />
          );
        })}

        {/* thumb */}
        <motion.div
          className="pointer-events-none absolute top-7 z-10 -translate-x-1/2 -translate-y-1/2"
          animate={{ left: `${thumbPct * 100}%` }}
          transition={dragging ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 30 }}
        >
          <motion.div
            animate={{ scale: dragging ? 1.22 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="grid h-6 w-6 place-items-center rounded-full border border-forest/25 bg-paper-50 shadow-card"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-forest" />
          </motion.div>
        </motion.div>
      </div>

      {/* era bands, desktop only: the mobile rail needs the vertical room */}
      <div className="relative mt-1 hidden h-4 lg:block" aria-hidden="true">
        {ERAS.map((e) => {
          const left = pctForYear(e.from) * 100;
          const width = ((e.to - e.from) / SPAN) * 100;
          const isCurrent = year >= e.from && year <= e.to;
          return (
            <div
              key={e.label}
              className="absolute top-0 flex items-center justify-center border-l border-paper-400 px-2"
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              <span
                className={`truncate font-body text-[0.62rem] uppercase tracking-[0.18em] transition-colors duration-300 ${
                  isCurrent ? 'text-forest' : 'text-ink-faint'
                }`}
              >
                {e.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
