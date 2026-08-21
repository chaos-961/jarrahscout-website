import type { Config } from 'tailwindcss';

/**
 * Heritage/archive palette. Every brand colour is a token here, so swapping in
 * the real scout colours later is a change to this file alone — no component
 * hunts for hex codes.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Warm paper tones — the background of the whole site. */
        paper: {
          50: '#FDFBF7',
          100: '#FAF6EE',
          200: '#F4EEE1',
          300: '#EAE1CE',
          400: '#DACEB4',
          DEFAULT: '#FAF6EE',
        },
        /* Deep charcoal with a warm bias, so it sits on paper without buzzing. */
        ink: {
          DEFAULT: '#1E1C17',
          soft: '#413D34',
          muted: '#6A6458',
          faint: '#9A9281',
        },
        /* Primary accent. */
        forest: {
          50: '#EDF3F0',
          100: '#D2E2DA',
          200: '#A3C4B4',
          300: '#6E9C86',
          400: '#3F7359',
          500: '#1B4332',
          600: '#163828',
          700: '#112B1F',
          800: '#0C1F17',
          900: '#08150F',
          DEFAULT: '#1B4332',
        },
        /* Secondary accent — badges, ticks, highlights. */
        gold: {
          50: '#FBF6E6',
          100: '#F4E8C2',
          200: '#E8D18B',
          300: '#DBBA55',
          400: '#C9A227',
          500: '#A8871F',
          600: '#866B18',
          700: '#635013',
          DEFAULT: '#C9A227',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(30,28,23,0.04), 0 8px 24px -8px rgba(30,28,23,0.12)',
        panel: '-8px 0 48px -12px rgba(30,28,23,0.22)',
        sheet: '0 -8px 48px -12px rgba(30,28,23,0.22)',
        pin: '0 2px 6px rgba(30,28,23,0.28)',
      },
      transitionTimingFunction: {
        heritage: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
