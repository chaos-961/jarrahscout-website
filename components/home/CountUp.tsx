'use client';

import { useEffect, useRef, useState } from 'react';
import { useApproach } from '@/lib/use-approach';

const DURATION_MS = 1100;

/**
 * Counts a stat up from zero the first time it scrolls into view.
 *
 * The server renders the finished number, so no-JS and reduced-motion both get
 * the real value immediately, and only a figure still below the fold at mount
 * winds back to zero to run. Nothing animates unless it wound back first.
 *
 * A timer lands on the final value alongside the frame loop. requestAnimationFrame
 * stops in a background tab, and without that backstop a stat could be left
 * sitting at zero.
 */
export default function CountUp({ value, className }: { value: number; className?: string }) {
  const [ref, reached] = useApproach<HTMLSpanElement>(0.85);
  const [shown, setShown] = useState(value);
  const wound = useRef(false);

  useEffect(() => {
    if (!reached) {
      wound.current = true;
      setShown(0);
      return;
    }
    if (!wound.current) return;

    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      // Ease out cubic: fast off the mark, settles rather than stops.
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    const settle = window.setTimeout(() => setShown(value), DURATION_MS + 200);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [reached, value]);

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}
