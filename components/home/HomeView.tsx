import Link from 'next/link';
import PhotoWall from './PhotoWall';
import Footer from '@/components/ui/Footer';
import { Logo } from '@/components/ui/Logo';
import { getEvents } from '@/lib/events';
import { lodUrl } from '@/lib/images';
import { ERAS, TIMELINE_END, TIMELINE_START } from '@/lib/eras';

/** Tiles are small: the wall is texture, not a gallery. */
const TILE = [300, 400] as const;

export default async function HomeView() {
  const events = await getEvents();

  /* Capped: the pool is serialised into the page payload, and the wall only
     ever shows thirty tiles at once. */
  const wallSource = events.slice(0, 90).map((e) => lodUrl(e.photoUrl, TILE[0], TILE[1]));

  const places = new Set(events.map((e) => e.locationName)).size;
  const years = new Set(events.map((e) => e.year)).size;

  const stats = [
    { value: String(events.length), label: 'Records mapped' },
    { value: String(years), label: 'Years with history' },
    { value: String(places), label: 'Places visited' },
    { value: `${TIMELINE_END - TIMELINE_START + 1}`, label: 'Years covered' },
  ];

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-14">
        <PhotoWall pool={wallSource} />

        {/* Scrim: the wall has to stay readable as texture behind the words. */}
        <div className="pointer-events-none absolute inset-0 bg-canvas/75" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-canvas via-canvas/85 to-canvas/45" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-canvas to-transparent" />

        <div className="relative mx-auto w-full max-w-[92rem] px-4 py-16 sm:px-7 lg:px-10">
          <div className="max-w-2xl">
            <Logo size="lg" className="mb-7 h-24 w-auto sm:h-28" />

            <p className="font-body text-[0.7rem] uppercase tracking-[0.24em] text-plum-400">
              Jarrah Scouts Association
              <span className="mx-2 text-plum-600">/</span>
              <span dir="rtl" lang="ar">
                جمعية كشافة الجرّاح
              </span>
            </p>

            <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
              Ninety years of scouting,
              <br />
              <span className="bg-gradient-to-r from-plum-200 via-plum-300 to-plum-400 bg-clip-text text-transparent">
                on a single map.
              </span>
            </h1>

            <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-plum-200 sm:text-lg">
              Every camp, hike, promise and service day the group has recorded since{' '}
              {TIMELINE_START}, placed where it happened. Drag through the years and watch the
              archive move across Lebanon.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/timeline" className="btn-primary px-6 py-3 text-[0.95rem]">
                Open the timeline
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h13M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link href="/submit" className="btn-ghost px-6 py-3 text-[0.95rem]">
                Add an event
              </Link>
            </div>

            <p className="mt-8 font-display text-lg text-plum-300" dir="rtl" lang="ar">
              كن مستعداً
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- stats */}
      <section className="border-y border-hairline bg-surface/60">
        <div className="mx-auto grid max-w-[92rem] grid-cols-2 gap-px overflow-hidden px-4 sm:px-7 md:grid-cols-4 lg:px-10">
          {stats.map((s) => (
            <div key={s.label} className="py-8 md:py-10">
              <p className="font-display text-[2.4rem] font-semibold leading-none tabular-nums text-white">
                {s.value}
              </p>
              <p className="mt-2 font-body text-xs uppercase tracking-[0.16em] text-plum-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ eras */}
      <section className="mx-auto max-w-[92rem] px-4 py-20 sm:px-7 lg:px-10">
        <div className="max-w-2xl">
          <p className="font-body text-[0.7rem] uppercase tracking-[0.24em] text-plum-400">
            The shape of it
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-tight tracking-[-0.02em] text-white">
            Five stretches, each with its own character
          </h2>
          <p className="mt-4 font-body leading-relaxed text-plum-300">
            The timeline is not evenly full. Some decades are dense with camps and rallies, others
            hold almost nothing. Both tell you something.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {ERAS.map((era, i) => (
            <Link
              key={era.label}
              href="/timeline"
              className="group surface-card relative overflow-hidden p-5 transition-colors duration-300 hover:border-plum-500/60"
            >
              <span
                className="absolute inset-x-0 top-0 h-px opacity-60"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(188,157,233,${0.25 + i * 0.14}), transparent)`,
                }}
              />
              <p className="font-body text-xs tabular-nums tracking-wider text-plum-400">
                {era.from} to {era.to}
              </p>
              <p className="mt-2 font-display text-lg font-semibold leading-snug text-white">
                {era.label}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-body text-xs text-plum-300 transition-colors group-hover:text-white">
                Open
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="mx-auto max-w-[92rem] px-4 pb-24 sm:px-7 lg:px-10">
        <div className="surface-card relative overflow-hidden px-6 py-14 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(70% 120% at 50% 0%, rgba(126,79,198,0.28), transparent 65%)',
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight tracking-[-0.02em] text-white">
              There are gaps in the record. You might be able to fill one.
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body leading-relaxed text-plum-300">
              A photograph, a date and a place is enough. Everything submitted is checked before it
              goes on the map.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/submit" className="btn-primary px-6 py-3">
                Add an event
              </Link>
              <Link href="/about" className="btn-ghost px-6 py-3">
                About the archive
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
