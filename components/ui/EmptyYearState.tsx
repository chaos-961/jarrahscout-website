'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface EmptyYearStateProps {
  year: number;
  /** Closest year on either side that does have records, if there is one. */
  nearestYear: number | null;
  onJump: (year: number) => void;
}

export default function EmptyYearState({ year, nearestYear, onJump }: EmptyYearStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="pointer-events-auto w-[min(25rem,calc(100vw-2rem))] rounded-2xl border border-hairline bg-surface/92 p-6 text-center shadow-card backdrop-blur-md"
    >
      <span className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full bg-plum-800 text-plum-300">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H18a1 1 0 0 1 1 1v13.5" />
          <path d="M6.5 20H19M6.5 20A2.5 2.5 0 0 1 4 17.5V6.5" />
          <path d="M9 9.5h6" />
        </svg>
      </span>

      <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-white">
        Nothing recorded in {year}
      </h3>
      <p className="mx-auto mt-2 max-w-[21rem] font-body text-sm leading-relaxed text-plum-300">
        The archive has a gap here. If you know of something that happened this year, it belongs on
        the map.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        <Link href="/submit" className="btn-primary">
          Add an event
        </Link>
        {nearestYear !== null && (
          <button type="button" onClick={() => onJump(nearestYear)} className="btn-ghost">
            Jump to {nearestYear}
          </button>
        )}
      </div>
    </motion.div>
  );
}
