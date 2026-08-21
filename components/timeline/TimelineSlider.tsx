'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ALL_YEARS, TIMELINE_END, TIMELINE_START, eraForYear } from '@/lib/eras';

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

  const maxDensity = useMemo(() => Math.max(1, ...Object.values(density)), [density]);

  /* ------------------------------------------------------------- dragging */
  const pctFromClientX = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  const beginDrag = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      // Some browsers throw on an unrecognised pointer id. Capture is an
      // optimisation, not a requirement, so never let it abort the drag.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
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
      const next = yearForPct(pct);
      if (next !== year) onYearChange(next);
    },
    [dragging, pctFromClientX, onYearChange, year],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      } catch {}

      const width = trackRef.current?.getBoundingClientRect().width ?? 1;
      const pts = samples.current;
      let coastPx = 0;

      if (pts.length >= 2) {
        const last = pts[pts.length - 1];
        // Only the tail of the gesture counts, so a pause kills the throw.
        const first = pts.find((p) => last.t - p.t <= 110) ?? pts[0];
        const dt = last.t - first.t;
        if (dt > 0) {
          const velocity = (last.x - first.x) / dt;
          const cap = width * MAX_COAST_RATIO;
          coastPx = Math.max(-cap, Math.min(cap, velocity * COAST_MS));
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
    <section
      className="shrink-0 border-b border-hairline bg-surface/80 px-4 pb-2.5 pt-2.5 backdrop-blur sm:px-7 lg:px-10"
      aria-label="Timeline"
    >
      {/* ------------------------------------------------ year + live count */}
      <div className="mb-1.5 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-3">
          {/* Keyed remount gives a clean fade, with no text sliding around. */}
          <motion.span
            key={year}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="font-display text-[1.75rem] font-semibold leading-none tabular-nums tracking-[-0.01em] text-white sm:text-[2.1rem]"
          >
            {year}
          </motion.span>
          <span className="hidden h-3 w-px bg-hairline sm:block" aria-hidden="true" />
          <span className="truncate font-body text-[0.66rem] uppercase tracking-[0.2em] text-plum-300 sm:text-[0.7rem]">
            {era.label}
          </span>
        </div>

        <div className="shrink-0">
          {loading ? (
            <span className="block h-6 w-24 animate-pulse rounded-full bg-plum-800" />
          ) : (
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-body text-xs transition-colors duration-300 ${
                count > 0
                  ? 'border-plum-500/50 bg-plum-700/40 text-plum-100'
                  : 'border-hairline bg-plum-900/60 text-plum-400'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${count > 0 ? 'bg-plum-300' : 'bg-plum-600'}`}
              />
              <span className="font-semibold tabular-nums">{count}</span>
              <span>{count === 1 ? 'event' : 'events'}</span>
            </span>
          )}
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
        className="relative h-11 cursor-grab touch-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-plum-300/70 active:cursor-grabbing"
      >
        <div className="absolute left-0 right-0 top-4 h-px bg-hairline" />
        <motion.div
          className="absolute left-0 top-4 h-px w-full origin-left bg-gradient-to-r from-plum-500 to-plum-300"
          animate={{ scaleX: thumbPct }}
          transition={dragging ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 34 }}
        />

        {/* decade ticks */}
        {decades.map((d) => (
          <div
            key={d}
            className={`absolute top-[0.85rem] -translate-x-1/2 ${d % 20 !== 0 ? 'hidden sm:block' : ''}`}
            style={{ left: `${pctForYear(d) * 100}%` }}
          >
            <div className="mx-auto h-2 w-px bg-plum-700" />
            <span className="mt-1 block font-body text-[0.58rem] tabular-nums tracking-wider text-plum-500">
              {d}
            </span>
          </div>
        ))}

        {/* Purple dot per year that holds records, so gaps are visible at a glance. */}
        {ALL_YEARS.map((y) => {
          const n = density[y] ?? 0;
          if (n === 0) return null;
          const size = 4 + Math.min(3.5, (n / maxDensity) * 3.5);
          const active = y === year;
          return (
            <span
              key={y}
              className={`absolute -translate-x-1/2 rounded-full transition-colors duration-200 ${
                active ? 'bg-white' : 'bg-plum-400'
              }`}
              style={{
                left: `${pctForYear(y) * 100}%`,
                top: `calc(1rem - ${size / 2}px)`,
                width: size,
                height: size,
              }}
            />
          );
        })}

        {/* thumb */}
        <motion.div
          className="pointer-events-none absolute top-4 z-10 -translate-x-1/2 -translate-y-1/2"
          animate={{ left: `${thumbPct * 100}%` }}
          transition={dragging ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 30 }}
        >
          <motion.div
            animate={{ scale: dragging ? 1.25 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="grid h-5 w-5 place-items-center rounded-full border border-plum-300/60 bg-plum-950 shadow-glow"
          >
            <span className="h-2 w-2 rounded-full bg-plum-200" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
