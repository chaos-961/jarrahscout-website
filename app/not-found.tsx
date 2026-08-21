import Link from 'next/link';
import Footer from '@/components/ui/Footer';
import { Logo } from '@/components/ui/Logo';
import { TIMELINE_END, TIMELINE_START } from '@/lib/eras';

/* Pages serves this for any path the export does not cover. It has to work as
   a dead end, so it carries the same way out as every other page. */
export default function NotFound() {
  return (
    <>
      <main id="main" tabIndex={-1} className="relative min-h-[100dvh] overflow-hidden pt-14">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] opacity-70"
          style={{
            background: 'radial-gradient(50% 100% at 40% 0%, rgba(126,79,198,0.28), transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-2xl flex-col justify-center px-4 py-20 sm:px-7">
          {/* self-start, or the flex column stretches it across the full width. */}
          <Logo size="lg" className="mb-8 h-20 w-auto self-start" />
          <p className="font-body text-[0.7rem] uppercase tracking-[0.24em] text-plum-400">
            Nothing filed here
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5.6vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
            This page is not in the archive
          </h1>
          <p className="mt-5 max-w-xl font-body leading-relaxed text-plum-300">
            The address does not match anything the group has recorded. The map holds{' '}
            {TIMELINE_START} to {TIMELINE_END}, so that is the better place to start looking.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/timeline" className="btn-primary px-6 py-3">
              Open the timeline
            </Link>
            <Link href="/" className="btn-ghost px-6 py-3">
              Back to the front
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
