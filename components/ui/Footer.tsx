import Link from 'next/link';
import { FleurDeLis } from '@/components/map/ScoutMarker';
import { TIMELINE_END, TIMELINE_START } from '@/lib/eras';

export default function Footer() {
  return (
    <footer className="border-t border-paper-300 bg-paper-100">
      <div className="mx-auto flex max-w-[92rem] flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-paper-50">
            <FleurDeLis className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-ink">Jarrah Scouts</p>
            <p className="font-body text-xs text-ink-faint">
              {TIMELINE_START} to {TIMELINE_END}. A living archive.
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/" className="font-body text-sm text-ink-muted transition-colors hover:text-forest">
            Timeline
          </Link>
          <Link href="/submit" className="font-body text-sm text-ink-muted transition-colors hover:text-forest">
            Add an event
          </Link>
          <Link href="/about" className="font-body text-sm text-ink-muted transition-colors hover:text-forest">
            About
          </Link>
        </nav>
      </div>

      <div className="border-t border-paper-300/70">
        <div className="mx-auto max-w-[92rem] px-5 py-4 sm:px-8 lg:px-12">
          <p className="font-body text-[0.7rem] text-ink-faint">
            Placeholder content throughout. Records shown are not yet verified group history.
          </p>
        </div>
      </div>
    </footer>
  );
}
