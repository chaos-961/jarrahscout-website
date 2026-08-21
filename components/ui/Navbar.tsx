'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';

/**
 * The header is in the root layout, so whatever it imports is on the critical
 * path of every page. A hamburger and a panel that opens are not worth an
 * animation library for that, so both are plain CSS: transforms on the bars,
 * and a grid row travelling 0fr to 1fr, which is how you animate to a height
 * the content decides. The panel stays mounted and goes inert when closed.
 */

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/submit', label: 'Add an event' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Route change closes the sheet; so does Escape. */
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname === '/home' : pathname.startsWith(href);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[60] transition-colors duration-300 ${
        scrolled || open
          ? 'border-b border-hairline bg-canvas/92 backdrop-blur-xl'
          : 'border-b border-transparent bg-canvas/30 backdrop-blur-md'
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-[92rem] items-center justify-between px-4 sm:px-7 lg:px-10">
        <Link href="/" className="group flex items-center gap-2.5 rounded-lg">
          <Logo className="h-9 w-auto transition-transform duration-300 group-hover:scale-105" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[0.95rem] font-semibold tracking-[-0.01em] text-white">
              Jarrah Scouts
            </span>
            <span className="mt-0.5 font-body text-[0.58rem] uppercase tracking-[0.2em] text-plum-400">
              Heritage archive
            </span>
          </span>
        </Link>

        {/* desktop */}
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative rounded-full px-3.5 py-1.5 font-body text-sm transition-colors duration-200 ${
                    active ? 'text-white' : 'text-plum-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-3.5 -bottom-px h-px bg-gradient-to-r from-plum-400 to-plum-200" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-white/[0.04] text-plum-100 transition-colors hover:bg-white/[0.08] md:hidden"
        >
          <span className="relative block h-3.5 w-4" aria-hidden="true">
            <span
              className={`absolute left-0 top-0 block h-[1.5px] w-4 origin-center bg-current transition-transform duration-200 ${
                open ? 'translate-y-[6px] rotate-45' : ''
              }`}
            />
            <span
              className={`absolute left-0 top-[6px] block h-[1.5px] w-4 bg-current transition-opacity duration-150 ${
                open ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`absolute left-0 top-[12px] block h-[1.5px] w-4 origin-center bg-current transition-transform duration-200 ${
                open ? '-translate-y-[6px] -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </nav>

      <div
        id="mobile-menu"
        inert={!open}
        className={`grid overflow-hidden bg-canvas/95 backdrop-blur-xl transition-[grid-template-rows,opacity] duration-300 ease-soft md:hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <ul className="min-h-0 overflow-hidden px-4">
          {LINKS.map((link, i) => {
            const active = isActive(link.href);
            return (
              <li key={link.href} className={i === 0 ? 'mt-3' : ''}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`mb-1 flex items-center justify-between rounded-xl px-3 py-3 font-body text-[0.95rem] transition-colors ${
                    active ? 'bg-white/[0.06] text-white' : 'text-plum-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-plum-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
