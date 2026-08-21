import Link from 'next/link';
import { Logo } from './Logo';
import { TIMELINE_END, TIMELINE_START } from '@/lib/eras';

const COLUMNS = [
  {
    title: 'The archive',
    links: [
      { href: '/timeline', label: 'Timeline map' },
      { href: '/submit', label: 'Add an event' },
      { href: '/about', label: 'About' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-hairline bg-surface">
      {/* One soft plum bloom so the footer does not read as a flat slab. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-50"
        style={{
          background: 'radial-gradient(60% 100% at 50% 0%, rgba(126,79,198,0.22), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-[92rem] gap-10 px-4 py-12 sm:px-7 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="h-11 w-auto" />
            <div>
              <p className="font-display text-base font-semibold text-white">Jarrah Scouts</p>
              <p className="font-body text-xs text-plum-400" dir="rtl" lang="ar">
                جمعية كشافة الجرّاح في لبنان
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-plum-300">
            {TIMELINE_START} to {TIMELINE_END}, mapped year by year. A living record of where the
            group has camped, walked and served.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title}>
            <p className="mb-3 font-body text-[0.66rem] uppercase tracking-[0.2em] text-plum-500">
              {col.title}
            </p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-body text-sm text-plum-300 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <p className="mb-3 font-body text-[0.66rem] uppercase tracking-[0.2em] text-plum-500">
            Motto
          </p>
          <p className="font-display text-lg text-plum-100" dir="rtl" lang="ar">
            كن مستعداً
          </p>
          <p className="mt-1 font-body text-sm text-plum-400">Be Prepared</p>
        </div>
      </div>

      <div className="relative border-t border-hairline/70">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
          <p className="font-body text-[0.7rem] text-plum-500">
            Placeholder content throughout. Records shown are not yet verified group history.
          </p>
          <p className="font-body text-[0.7rem] text-plum-500">Beirut, Lebanon</p>
        </div>
      </div>
    </footer>
  );
}
