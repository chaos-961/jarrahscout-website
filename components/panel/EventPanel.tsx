'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDate } from '@/lib/format';
import { lodUrl } from '@/lib/images';
import { useIsDesktop } from '@/lib/use-media-query';
import { CATEGORY_LABELS, type ScoutEvent } from '@/lib/types';

interface EventPanelProps {
  event: ScoutEvent | null;
  onClose: () => void;
}

/**
 * The opened event. This is the only place a full resolution photo is ever
 * requested; the map only ever pulls thumbnails.
 */
export default function EventPanel({ event, onClose }: EventPanelProps) {
  const isDesktop = useIsDesktop();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => setLoaded(false), [event?.id]);

  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 80);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [event, onClose]);

  const enterFrom = isDesktop ? { x: '100%', y: 0 } : { x: 0, y: '100%' };

  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-plum-950/70 backdrop-blur-[3px] lg:hidden"
            aria-hidden="true"
          />

          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={event.title}
            initial={enterFrom}
            animate={{ x: 0, y: 0 }}
            exit={enterFrom}
            transition={{ type: 'spring', stiffness: 340, damping: 36, mass: 0.9 }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col overflow-hidden rounded-t-2xl border-t border-hairline bg-surface shadow-sheet lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[27rem] lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-panel"
          >
            <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-plum-700 lg:hidden" />

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="absolute right-3.5 top-3.5 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-plum-950/70 text-plum-100 backdrop-blur transition-colors hover:bg-plum-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-300 lg:top-4"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {/* Photo first, with the title sitting on it. */}
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-plum-900">
                {!loaded && (
                  <div className="absolute inset-0 overflow-hidden bg-plum-900">
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-plum-700/50 to-transparent" />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lodUrl(event.photoUrl, 1200, 900)}
                  alt={event.title}
                  onLoad={() => setLoaded(true)}
                  onError={() => setLoaded(true)}
                  className={`h-full w-full object-cover transition-opacity duration-500 ${
                    loaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="mb-2 inline-block rounded-full bg-plum-950/75 px-2.5 py-1 font-body text-[0.62rem] font-medium uppercase tracking-[0.16em] text-plum-200 backdrop-blur">
                    {CATEGORY_LABELS[event.category]}
                  </span>
                  <h3 className="font-display text-[1.6rem] font-semibold leading-tight tracking-[-0.01em] text-white [text-shadow:0_2px_12px_rgba(21,9,32,0.8)]">
                    {event.title}
                  </h3>
                </div>
              </div>

              <div className="px-6 pb-8 pt-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-xs text-plum-300">
                  <span className="tabular-nums">{formatDate(event.date)}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    {event.locationName}
                  </span>
                </div>

                <p className="mt-4 font-body text-[0.95rem] leading-relaxed text-plum-100/85">
                  {event.description}
                </p>

                <div className="mt-6 border-t border-hairline pt-4">
                  <p className="font-body text-xs text-plum-400">
                    Contributed by <span className="text-plum-200">{event.submittedBy}</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
