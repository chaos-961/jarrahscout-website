import Link from 'next/link';
import PhotoWall from './PhotoWall';
import CountUp from './CountUp';
import Reveal from '@/components/ui/Reveal';
import Footer from '@/components/ui/Footer';
import { Logo } from '@/components/ui/Logo';
import { getEvents, getFeaturedEvents } from '@/lib/events';
import { lodUrl } from '@/lib/images';
import { CATEGORY_LABELS } from '@/lib/types';
import { ERAS, TIMELINE_END, TIMELINE_START } from '@/lib/eras';

/** Tiles are small: the wall is texture, not a gallery. */
const TILE = [300, 400] as const;

export default async function HomeView() {
  const [events, featured] = await Promise.all([getEvents(), getFeaturedEvents(3)]);

  /* Capped: the pool is serialised into the page payload, and the wall only
     ever shows thirty tiles at once. Sixty is plenty of variety to swap from
     without carrying the whole corpus through the payload. */
  const wallSource = events.slice(0, 60).map((e) => lodUrl(e.photoUrl, TILE[0], TILE[1]));

  const places = new Set(events.map((e) => e.locationName)).size;
  const years = new Set(events.map((e) => e.year)).size;

  const stats = [
    { value: events.length, label: 'Records mapped' },
    { value: years, label: 'Years with history' },
    { value: places, label: 'Places visited' },
    { value: TIMELINE_END - TIMELINE_START + 1, label: 'Years covered' },
  ];

  /* Each era card carries its own weight in the archive. */
  const eraCards = ERAS.map((era) => ({
    ...era,
    count: events.filter((e) => e.year >= era.from && e.year <= era.to).length,
  }));
  const eraMax = Math.max(1, ...eraCards.map((e) => e.count));

  return (
    <>
      <main id="main" tabIndex={-1}>
          {/* ---------------------------------------------------------- hero */}
        <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-14">
          <PhotoWall pool={wallSource} />

          {/* Scrims, kept deliberately light: the wall is meant to read as
              photographs, not wallpaper. Below sm the copy runs nearly full
              width and gets its own plate instead; from sm up the wash is
              weighted left and the right of the wall stays clear. */}
          <div className="pointer-events-none absolute inset-0 bg-canvas/30 sm:bg-canvas/[0.18]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-canvas/80 via-transparent via-[20%] to-transparent sm:hidden" />
          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-canvas from-[4%] via-canvas/70 via-[50%] to-transparent to-[82%] sm:block" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canvas via-canvas/55 to-transparent" />

          <div className="relative mx-auto w-full max-w-[92rem] px-4 py-16 sm:px-7 lg:px-10">
            <div className="relative max-w-2xl lg:max-w-[46rem]">
              {/* Phone only. A soft plate under the words buys back the contrast
                  that the lighter scrim gives away. */}
              <div
                className="pointer-events-none absolute -inset-x-8 -inset-y-10 rounded-[3rem] bg-canvas/70 blur-2xl sm:hidden"
                aria-hidden="true"
              />

              <div className="relative">
                <Logo
                  size="lg"
                  className="rise-in mb-7 h-24 w-auto drop-shadow-[0_6px_24px_rgba(21,9,32,0.7)] sm:h-28"
                />

                <p
                  className="rise-in on-photo font-body text-[0.7rem] uppercase tracking-[0.24em] text-plum-300"
                  style={{ animationDelay: '90ms' }}
                >
                  Jarrah Scouts Association
                  <span className="mx-2 hidden text-plum-500 sm:inline">/</span>
                  <span dir="rtl" lang="ar" className="mt-1.5 block w-fit font-arabic sm:mt-0 sm:inline">
                    جمعية كشافة الجرّاح
                  </span>
                </p>

                <h1
                  className="rise-in mt-4 font-display text-[clamp(2.4rem,5.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white drop-shadow-[0_4px_22px_rgba(21,9,32,0.8)]"
                  style={{ animationDelay: '160ms' }}
                >
                  Ninety years of scouting,
                  <br />
                  <span className="bg-gradient-to-r from-plum-100 via-plum-200 to-plum-400 bg-clip-text text-transparent">
                    on a single map.
                  </span>
                </h1>

                <p
                  className="rise-in on-photo mt-6 max-w-xl font-body text-base leading-relaxed text-plum-100 sm:text-lg"
                  style={{ animationDelay: '240ms' }}
                >
                  Every camp, hike, promise and service day the group has recorded since{' '}
                  {TIMELINE_START}, placed where it happened. Drag through the years and watch the
                  archive move across Lebanon.
                </p>

                <div
                  className="rise-in mt-9 flex flex-wrap items-center gap-3"
                  style={{ animationDelay: '320ms' }}
                >
                  <Link href="/timeline" className="btn-primary group px-6 py-3 text-[0.95rem]">
                    Open the timeline
                    <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h13M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                  <Link href="/submit" className="btn-ghost px-6 py-3 text-[0.95rem] backdrop-blur">
                    Add an event
                  </Link>
                </div>

                <p
                  className="rise-in on-photo mt-8 w-fit font-arabic text-base text-plum-200"
                  style={{ animationDelay: '400ms' }}
                  dir="rtl"
                  lang="ar"
                >
                  كن مستعداً
                </p>
              </div>
            </div>
          </div>

          {/* Scroll cue. Hidden on short viewports, where it would land on top
              of the buttons rather than below them. */}
          <a
            href="#archive"
            aria-label="Skip to the archive"
            className="group absolute inset-x-0 bottom-6 mx-auto hidden w-fit flex-col items-center gap-2 rounded-full px-4 py-2 [@media(min-height:680px)]:flex"
          >
            <span className="on-photo font-body text-[0.62rem] uppercase tracking-[0.28em] text-plum-300 transition-colors group-hover:text-white">
              Scroll
            </span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-bob text-plum-300 drop-shadow-[0_2px_6px_rgba(21,9,32,0.9)] transition-colors group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </a>
        </section>

        {/* ----------------------------------------------------------- stats */}
        <section id="archive" className="scroll-mt-14 border-y border-hairline bg-surface/60">
          <div className="mx-auto grid max-w-[92rem] grid-cols-2 px-4 sm:px-7 md:grid-cols-4 lg:px-10">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={[
                  'py-9 md:py-11',
                  i % 2 === 1 ? 'border-l border-hairline pl-5' : '',
                  i > 1 ? 'border-t border-hairline md:border-t-0' : '',
                  i > 0 ? 'md:border-l md:border-hairline md:pl-5' : '',
                ].join(' ')}
              >
                <p className="font-display text-[2.4rem] font-semibold leading-none tabular-nums text-white">
                  <CountUp value={s.value} />
                </p>
                <p className="mt-2 font-body text-xs uppercase tracking-[0.16em] text-plum-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------- featured */}
        <section className="mx-auto max-w-[92rem] px-4 py-20 sm:px-7 lg:px-10">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-2xl">
                <p className="font-body text-[0.7rem] uppercase tracking-[0.24em] text-plum-400">
                  From the archive
                </p>
                <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-tight tracking-[-0.02em] text-white">
                  A first promise, and everything after it
                </h2>
              </div>
              <Link href="/timeline" className="btn-ghost shrink-0">
                See them on the map
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e, i) => (
              <Reveal key={e.id} delay={i * 90}>
                <Link
                  href={`/timeline?year=${e.year}`}
                  className="group surface-card flex h-full flex-col overflow-hidden transition-colors duration-300 hover:border-plum-500/60"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-plum-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lodUrl(e.photoUrl, 640, 480)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.05]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/15 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-canvas/70 px-2.5 py-1 font-body text-[0.68rem] tabular-nums tracking-wider text-plum-100 backdrop-blur">
                      {e.year}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="font-display text-lg font-semibold leading-snug text-white">
                      {e.title}
                    </p>
                    <p className="mt-1.5 font-body text-xs text-plum-400">
                      {CATEGORY_LABELS[e.category]}
                      <span className="mx-1.5 text-plum-600">&bull;</span>
                      {e.locationName}
                    </p>
                    <p className="mt-3 line-clamp-3 font-body text-sm leading-relaxed text-plum-300">
                      {e.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 pt-1 font-body text-xs text-plum-300 transition-colors group-hover:text-white">
                      Open {e.year} on the map
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ eras */}
        <section className="border-t border-hairline bg-surface/40">
          <div className="mx-auto max-w-[92rem] px-4 py-20 sm:px-7 lg:px-10">
            <Reveal>
              <div className="max-w-2xl">
                <p className="font-body text-[0.7rem] uppercase tracking-[0.24em] text-plum-400">
                  The shape of it
                </p>
                <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-tight tracking-[-0.02em] text-white">
                  Five stretches, each with its own character
                </h2>
                <p className="mt-4 font-body leading-relaxed text-plum-300">
                  The timeline is not evenly full. Some decades are dense with camps and rallies,
                  others hold almost nothing. Both tell you something.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {eraCards.map((era, i) => (
                <Reveal key={era.label} delay={i * 70}>
                  <Link
                    href={`/timeline?year=${era.from}`}
                    className="group surface-card relative flex h-full flex-col overflow-hidden p-5 transition-colors duration-300 hover:border-plum-500/60"
                  >
                    <span
                      className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
                      style={{
                        background: `linear-gradient(90deg, transparent, rgba(188,157,233,${0.25 + i * 0.14}), transparent)`,
                      }}
                    />
                    <div className="relative flex h-full flex-col">
                      <p className="font-body text-xs tabular-nums tracking-wider text-plum-400">
                        {era.from} to {era.to}
                      </p>
                      <p className="mt-2 font-display text-lg font-semibold leading-snug text-white">
                        {era.label}
                      </p>
                      <p className="mt-1 font-body text-xs tabular-nums text-plum-400">
                        {era.count} records
                      </p>

                      {/* How full this stretch is, against the fullest one. */}
                      <span className="mt-4 block h-1 w-full overflow-hidden rounded-full bg-plum-950">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-plum-600 to-plum-300"
                          style={{ width: `${Math.round((era.count / eraMax) * 100)}%` }}
                        />
                      </span>

                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-body text-xs text-plum-300 transition-colors group-hover:text-white">
                        Open
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- cta */}
        <section className="mx-auto max-w-[92rem] px-4 py-24 sm:px-7 lg:px-10">
          <Reveal>
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
                  A photograph, a date and a place is enough. Everything submitted is checked before
                  it goes on the map.
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
          </Reveal>
        </section>

      </main>

      <Footer />
    </>
  );
}
