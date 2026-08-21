'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDate } from '@/lib/format';
import { useIsDesktop } from '@/lib/use-media-query';
import { CATEGORY_LABELS, type ScoutEvent } from '@/lib/types';

interface EventPanelProps {
  event: ScoutEvent | null;
  onClose: () => void;
}

export default function EventPanel({ event, onClose }: EventPanelProps) {
  const isDesktop = useIsDesktop();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  /* New event, new photo: reset the skeleton so it never flashes stale. */
  useEffect(() => setImageLoaded(false), [event?.id]);

  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Give the panel focus so Escape and Tab land inside it immediately.
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
          {/* Scrim only on mobile, where the sheet covers the map. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px] lg:hidden"
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
            transition={{ type: 'spring', stiffness: 330, damping: 34, mass: 0.9 }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[86vh] flex-col overflow-hidden rounded-t-2xl border-t border-paper-300 bg-paper-50 shadow-sheet lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[27rem] lg:rounded-none lg:rounded-l-2xl lg:border-l lg:border-t-0 lg:shadow-panel"
          >
            {/* Drag affordance, mobile only. */}
            <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-paper-400 lg:hidden" />

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="absolute right-3.5 top-3.5 z-10 grid h-9 w-9 place-items-center rounded-full bg-paper-50/85 text-ink-soft shadow-card backdrop-blur transition-colors hover:bg-paper-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:top-4"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {/* full-bleed photo */}
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-paper-200">
                {!imageLoaded && (
                  <div className="absolute inset-0 overflow-hidden bg-paper-200">
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-paper-50/70 to-transparent" />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.photoUrl}
                  alt={event.title}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                  className={`h-full w-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/45 to-transparent" />

                {/* date badge */}
                <div className="absolute bottom-3.5 left-4 rounded-full bg-paper-50/92 px-3 py-1.5 shadow-card backdrop-blur">
                  <span className="font-body text-xs font-medium tabular-nums text-ink">
                    {formatDate(event.date)}
                  </span>
                </div>
              </div>

              <div className="px-6 pb-8 pt-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 font-body text-[0.65rem] font-medium uppercase tracking-[0.14em] ${
                      event.category === 'anniversary'
                        ? 'bg-gold-50 text-gold-600'
                        : 'bg-forest-50 text-forest'
                    }`}
                  >
                    {CATEGORY_LABELS[event.category]}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-body text-xs text-ink-muted">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    {event.locationName}
                  </span>
                </div>

                <h3 className="font-display text-[1.65rem] font-semibold leading-tight tracking-[-0.01em] text-ink">
                  {event.title}
                </h3>

                <p className="mt-3 font-body text-[0.95rem] leading-relaxed text-ink-soft">
                  {event.description}
                </p>

                <div className="mt-6 border-t border-paper-300 pt-4">
                  <p className="font-body text-xs text-ink-faint">
                    Contributed by <span className="text-ink-muted">{event.submittedBy}</span>
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
