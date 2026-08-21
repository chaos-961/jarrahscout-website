'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Reports when an element has been scrolled up to the edge of the viewport.
 *
 * It starts true, so server markup, no-JS and reduced-motion all render the
 * finished state, and it only arms itself for an element that mounts below the
 * fold. That is the whole reason it watches scroll rather than reaching for an
 * IntersectionObserver: an element that starts below the fold can only be
 * reached by scrolling, so a scroll listener is sufficient, and it still fires
 * in embedded views where the observer's rendering step never runs.
 */
export function useApproach<T extends HTMLElement>(threshold = 0.92) {
  const ref = useRef<T>(null);
  const [reached, setReached] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const near = () => el.getBoundingClientRect().top < window.innerHeight * threshold;
    if (near()) return;

    setReached(false);
    const check = () => {
      if (!near()) return;
      setReached(true);
      stop();
    };
    const stop = () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };

    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return stop;
  }, [threshold]);

  return [ref, reached] as const;
}
