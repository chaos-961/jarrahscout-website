'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';

import TimelineSlider from '@/components/timeline/TimelineSlider';
import EventPanel from '@/components/panel/EventPanel';
import EmptyYearState from '@/components/ui/EmptyYearState';
import { getEvents, getYearDensity } from '@/lib/events';
import { TIMELINE_END, TIMELINE_START } from '@/lib/eras';
import type { ScoutEvent } from '@/lib/types';

/* WebGL has no business running on the server. */
const HeritageMap = dynamic(() => import('@/components/map/HeritageMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-plum-950">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-plum-800/40 to-transparent" />
    </div>
  );
}

export default function TimelinePage() {
  const [year, setYear] = useState(TIMELINE_START);
  const [scrubbing, setScrubbing] = useState(false);
  const [allEvents, setAllEvents] = useState<ScoutEvent[] | null>(null);
  const [density, setDensity] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<ScoutEvent | null>(null);

  /* Links in from the home page carry the year they want, as ?year=1965.
     Read from the URL rather than useSearchParams: a static export has no
     request to read, so the param only exists in the browser. */
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('year');
    if (!raw) return;
    const wanted = Number(raw);
    if (!Number.isInteger(wanted)) return;
    if (wanted < TIMELINE_START || wanted > TIMELINE_END) return;
    setYear(wanted);
  }, []);

  /* Two reads on mount, then every year change is local. Same shape a small
     Firestore collection would use: fetch once, filter client side. */
  useEffect(() => {
    let cancelled = false;
    Promise.all([getEvents(), getYearDensity()]).then(([events, counts]) => {
      if (cancelled) return;
      setAllEvents(events);
      setDensity(counts);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = allEvents === null;

  const eventsForYear = useMemo(
    () => (allEvents ?? []).filter((e) => e.year === year),
    [allEvents, year],
  );

  /* Closest year in either direction that actually holds records. */
  const nearestYear = useMemo(() => {
    const populated = Object.entries(density)
      .filter(([, n]) => n > 0)
      .map(([y]) => Number(y));
    if (populated.length === 0) return null;
    return populated.reduce((best, y) => (Math.abs(y - year) < Math.abs(best - year) ? y : best));
  }, [density, year]);

  const handleYearChange = useCallback((next: number) => {
    setYear(next);
    // A pin from the old year has no business staying open.
    setSelected(null);
  }, []);

  const showEmptyState = !loading && eventsForYear.length === 0 && !scrubbing;

  return (
    <>
      <main id="main" tabIndex={-1} className="flex h-[100dvh] flex-col overflow-hidden pt-14">
        <TimelineSlider
          year={year}
          onYearChange={handleYearChange}
          onScrubbingChange={setScrubbing}
          density={density}
          count={eventsForYear.length}
          loading={loading}
        />

        <div className="relative min-h-0 flex-1">
          {loading ? (
            <MapSkeleton />
          ) : (
            <HeritageMap
              events={eventsForYear}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
              panelOpen={selected !== null}
              frozen={scrubbing}
            />
          )}

          <div className="pointer-events-none absolute inset-0 grid place-items-center p-4">
            <AnimatePresence>
              {showEmptyState && (
                <EmptyYearState
                  key={year}
                  year={year}
                  nearestYear={nearestYear}
                  onJump={handleYearChange}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <EventPanel event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
