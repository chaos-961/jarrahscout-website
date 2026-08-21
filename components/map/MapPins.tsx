'use client';

import { useState } from 'react';
import { lodUrl, type Lod } from '@/lib/images';
import type { ScoutEvent } from '@/lib/types';

/**
 * A pin is the photograph itself.
 *
 * The tile requests exactly the resolution it renders at, so a map holding two
 * hundred events pulls thumbnails rather than full frames. Opening one is what
 * loads the real image.
 */
export function PhotoMarker({
  event,
  lod,
  selected,
}: {
  event: ScoutEvent;
  lod: Lod;
  selected: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = lodUrl(event.photoUrl, lod.fetch, lod.fetch);

  return (
    <span className="pointer-events-none flex flex-col items-center">
      <span
        className={`relative block overflow-hidden rounded-[0.55rem] ring-1 transition-[box-shadow,ring-color] duration-200 ${
          selected
            ? 'shadow-glow ring-2 ring-plum-200'
            : 'shadow-pin ring-plum-300/45 group-hover:ring-plum-200'
        }`}
        style={{ width: lod.size, height: lod.size }}
      >
        {!loaded && <span className="absolute inset-0 animate-pulse bg-plum-700" />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={lod.fetch}
          height={lod.fetch}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <span className="absolute inset-0 bg-gradient-to-t from-plum-950/55 to-transparent" />
      </span>

      {/* Little stem so the tile reads as pinned to a point, not floating. */}
      <span
        className={`-mt-px h-2 w-px ${selected ? 'bg-plum-200' : 'bg-plum-300/60'}`}
        aria-hidden="true"
      />
      <span
        className={`h-1.5 w-1.5 rounded-full ring-2 ring-plum-950/70 ${
          selected ? 'bg-plum-100' : 'bg-plum-300'
        }`}
        aria-hidden="true"
      />

      {lod.showTitle && (
        <span
          className="mt-1 max-w-[9.5rem] truncate rounded-full bg-plum-950/85 px-2 py-0.5 text-center font-body text-[0.62rem] font-medium text-plum-100 backdrop-blur-sm"
          style={{ maxWidth: lod.size * 2 }}
        >
          {event.title}
        </span>
      )}
    </span>
  );
}

/** Below the photo tiers, a pin is just a point of light. */
export function DotPin({ selected }: { selected: boolean }) {
  return (
    <span
      className={`block h-2.5 w-2.5 rounded-full ring-2 transition-colors ${
        selected ? 'bg-plum-100 ring-plum-200/70' : 'bg-plum-300 ring-plum-400/40'
      }`}
    />
  );
}

/** Overlapping events, collapsed to a count. */
export function ClusterPin({ count }: { count: number }) {
  const size = count < 5 ? 38 : count < 15 ? 46 : count < 50 ? 54 : 62;

  return (
    <span
      className="grid place-items-center rounded-full bg-plum-600/90 font-body font-semibold text-white ring-1 ring-plum-200/50 backdrop-blur-sm transition-colors duration-200 group-hover:bg-plum-500"
      style={{ width: size, height: size, fontSize: count > 99 ? 13 : 15 }}
    >
      <span className="absolute inset-0 -z-10 rounded-full bg-plum-400/25 blur-md" />
      {count}
    </span>
  );
}
