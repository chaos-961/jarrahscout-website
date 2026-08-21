import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/ui/Footer';
import { FleurDeLis } from '@/components/map/ScoutMarker';
import { ERAS, TIMELINE_END, TIMELINE_START } from '@/lib/eras';

export const metadata: Metadata = {
  title: 'About',
  description:
    'What this archive is, where the records come from, and how to add something the map is missing.',
};

export default function AboutPage() {
  return (
    <>
      <main className="min-h-[100dvh] pt-14">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <header className="mb-14">
            <span className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-forest text-paper-50">
              <FleurDeLis className="h-6 w-6" />
            </span>
            <p className="font-body text-[0.7rem] uppercase tracking-[0.22em] text-ink-faint">
              About the archive
            </p>
            <h1 className="mt-2 font-display text-[clamp(2.4rem,6vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
              Ninety years, one map
            </h1>
            <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-ink-soft">
              Placeholder copy. This is where the group tells its own story: how it started, who
              kept it going, and why the records are worth gathering in one place.
            </p>
          </header>

          <section className="space-y-5 border-t border-paper-300 pt-10">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink">
              Why a map
            </h2>
            <p className="font-body leading-relaxed text-ink-soft">
              Placeholder text. A list of dates tells you when things happened. A map tells you
              where, and the where turns out to matter: the same handful of hillsides, harbours and
              cedar groves come back decade after decade.
            </p>
            <p className="font-body leading-relaxed text-ink-soft">
              Placeholder text. Drag the timeline and the pattern shows itself, including the years
              where nothing was recorded at all. Those gaps are part of the story too.
            </p>
          </section>

          <section className="mt-14 space-y-5 border-t border-paper-300 pt-10">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink">
              The eras
            </h2>
            <p className="font-body leading-relaxed text-ink-soft">
              The timeline is split into five stretches, each with its own character.
            </p>
            <ul className="mt-6 space-y-3">
              {ERAS.map((era) => (
                <li
                  key={era.label}
                  className="flex items-baseline gap-4 rounded-xl border border-paper-300 bg-paper-50 px-4 py-3 transition-colors hover:border-paper-400"
                >
                  <span className="w-24 shrink-0 font-body text-xs tabular-nums tracking-wider text-ink-faint">
                    {era.from} to {era.to}
                  </span>
                  <span className="font-display text-base font-semibold text-ink">{era.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14 space-y-5 border-t border-paper-300 pt-10">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink">
              Where the records come from
            </h2>
            <p className="font-body leading-relaxed text-ink-soft">
              Placeholder text. Logbooks, photograph albums, and the memories of people who were
              there. Everything currently on the map is sample content while the real archive is
              gathered, covering {TIMELINE_START} to {TIMELINE_END}.
            </p>
            <p className="font-body leading-relaxed text-ink-soft">
              Placeholder text. If you have something that belongs here, add it. Submissions are
              read and checked before they go on the map.
            </p>
            <div className="pt-3">
              <Link href="/submit" className="btn-primary">
                Add an event
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
