import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/ui/Footer';
import Reveal from '@/components/ui/Reveal';
import { Logo } from '@/components/ui/Logo';
import { getEvents } from '@/lib/events';
import { ERAS, TIMELINE_END, TIMELINE_START } from '@/lib/eras';

export const metadata: Metadata = {
  title: 'About',
  description:
    'What this archive is, where the records come from, and how to add something the map is missing.',
};

export default async function AboutPage() {
  const events = await getEvents();
  const eraRows = ERAS.map((era) => ({
    ...era,
    count: events.filter((e) => e.year >= era.from && e.year <= era.to).length,
  }));

  return (
    <>
      <main id="main" tabIndex={-1} className="min-h-[100dvh] pt-14">
        {/* Soft plum bloom behind the opening, so the page does not start flat. */}
        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] opacity-70"
            style={{
              background:
                'radial-gradient(50% 100% at 30% 0%, rgba(126,79,198,0.30), transparent 70%)',
            }}
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-7 sm:py-24">
            <header className="mb-16">
              <Logo size="lg" className="mb-8 h-24 w-auto" />
              <p className="font-body text-[0.7rem] uppercase tracking-[0.24em] text-plum-400">
                About the archive
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
                Ninety years, one map
              </h1>
              <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-plum-200">
                Placeholder copy. This is where the Jarrah Scouts Association tells its own story:
                how it started, who kept it going, and why the records are worth gathering in one
                place.
              </p>
            </header>

            <Reveal>
              <section className="space-y-5 border-t border-hairline pt-12">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-white">
                  Why a map
                </h2>
                <p className="font-body leading-relaxed text-plum-300">
                  Placeholder text. A list of dates tells you when things happened. A map tells you
                  where, and the where turns out to matter: the same handful of hillsides, harbours
                  and cedar groves come back decade after decade.
                </p>
                <p className="font-body leading-relaxed text-plum-300">
                  Placeholder text. Drag the timeline and the pattern shows itself, including the
                  years where nothing was recorded at all. Those gaps are part of the story too.
                </p>
              </section>
            </Reveal>

            <Reveal>
              <section className="mt-16 space-y-5 border-t border-hairline pt-12">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-white">
                  The eras
                </h2>
                <p className="font-body leading-relaxed text-plum-300">
                  The timeline is split into five stretches, each with its own character.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {eraRows.map((era) => (
                    <li key={era.label}>
                      <Link
                        href={`/timeline?year=${era.from}`}
                        className="group surface-card flex items-baseline gap-4 px-4 py-3.5 transition-colors hover:border-plum-500/60"
                      >
                        <span className="w-24 shrink-0 font-body text-xs tabular-nums tracking-wider text-plum-400">
                          {era.from} to {era.to}
                        </span>
                        <span className="font-display text-base font-semibold text-white">
                          {era.label}
                        </span>
                        <span className="ml-auto shrink-0 font-body text-xs tabular-nums text-plum-500 transition-colors group-hover:text-plum-200">
                          {era.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            <Reveal>
              <section className="mt-16 space-y-5 border-t border-hairline pt-12">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-white">
                  Where the records come from
                </h2>
                <p className="font-body leading-relaxed text-plum-300">
                  Placeholder text. Logbooks, photograph albums, and the memories of people who were
                  there. Everything currently on the map is sample content while the real archive is
                  gathered, covering {TIMELINE_START} to {TIMELINE_END}.
                </p>
                <p className="font-body leading-relaxed text-plum-300">
                  Placeholder text. If you have something that belongs here, add it. Submissions are
                  read and checked before they go on the map.
                </p>
                <div className="flex flex-wrap gap-3 pt-3">
                  <Link href="/submit" className="btn-primary">
                    Add an event
                  </Link>
                  <Link href="/timeline" className="btn-ghost">
                    Open the timeline
                  </Link>
                </div>
              </section>
            </Reveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
