'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FleurDeLis } from '@/components/map/ScoutMarker';

const LINKS = [
  { href: '/', label: 'Timeline' },
  { href: '/submit', label: 'Add an event' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
        scrolled
          ? 'border-b border-paper-300/80 bg-paper-50/80 backdrop-blur-md'
          : 'border-b border-transparent bg-paper-50/45 backdrop-blur-sm'
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-[92rem] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-gold/70"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-paper-50 transition-transform duration-300 group-hover:scale-105">
            <FleurDeLis className="h-[1.05rem] w-[1.05rem]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[0.98rem] font-semibold tracking-[-0.01em] text-ink">
              Jarrah Scouts
            </span>
            <span className="mt-0.5 font-body text-[0.6rem] uppercase tracking-[0.2em] text-ink-faint">
              Heritage archive
            </span>
          </span>
        </Link>

        <ul className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative rounded-full px-3 py-1.5 font-body text-[0.8rem] transition-colors duration-200 sm:text-sm ${
                    active ? 'text-forest' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gold" aria-hidden="true" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
