'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * The drifting wall of photographs behind the hero.
 *
 * Movement is a pure CSS transform on each column, so it runs on the compositor
 * and costs no main-thread work no matter how long the page sits open. Columns
 * hold two copies of their tiles and travel exactly half their height, which is
 * what makes the loop seamless.
 *
 * The initial set is passed in from the server so the markup matches on hydrate.
 * Only after mount does it start swapping in random photographs.
 */

const COLUMN_COUNT = 5;
const PER_COLUMN = 6;
const SWAP_MS = 2800;

function Tile({ url }: { url: string }) {
  const [shown, setShown] = useState(url);
  const [visible, setVisible] = useState(true);

  /* Fade out, swap the source behind the fade, fade back in. */
  useEffect(() => {
    if (url === shown) return;
    setVisible(false);
    const t = window.setTimeout(() => {
      setShown(url);
      setVisible(true);
    }, 320);
    return () => window.clearTimeout(t);
  }, [url, shown]);

  return (
    <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-xl bg-plum-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shown}
        alt=""
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

export default function PhotoWall({ pool }: { pool: string[] }) {
  /* Deterministic first fill, so the server markup and the first client render
     agree. Randomising only starts after mount. */
  const [urls, setUrls] = useState(() => pool.slice(0, COLUMN_COUNT * PER_COLUMN));

  useEffect(() => {
    if (pool.length === 0) return;
    const id = window.setInterval(() => {
      setUrls((prev) => {
        if (prev.length === 0) return prev;
        const next = prev.slice();
        const slot = Math.floor(Math.random() * next.length);
        const candidate = pool[Math.floor(Math.random() * pool.length)];
        // Do not swap a tile for a picture already on the wall.
        if (!next.includes(candidate)) next[slot] = candidate;
        return next;
      });
    }, SWAP_MS);
    return () => window.clearInterval(id);
  }, [pool]);

  const columns = useMemo(() => {
    const cols: string[][] = Array.from({ length: COLUMN_COUNT }, () => []);
    urls.forEach((u, i) => cols[i % COLUMN_COUNT].push(u));
    return cols;
  }, [urls]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="grid h-full grid-cols-3 gap-2.5 p-2.5 sm:grid-cols-4 lg:grid-cols-5">
        {columns.map((col, i) => (
          <div
            key={i}
            className={`flex flex-col gap-2.5 will-change-transform ${
              i % 2 === 0 ? 'animate-drift-up' : 'animate-drift-down'
            } ${i === 3 ? 'hidden sm:flex' : ''} ${i === 4 ? 'hidden lg:flex' : ''}`}
            style={{ animationDuration: `${52 + i * 9}s` }}
          >
            {[...col, ...col].map((url, j) => (
              <Tile key={`${i}-${j}`} url={url} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
