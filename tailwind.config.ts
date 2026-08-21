import type { Config } from 'tailwindcss';

/**
 * Jarrah Scouts palette: deep purple through to white.
 *
 * Every brand colour is a token here. The emblem keeps its own green and red,
 * which is why nothing in the ramp competes with them.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#F7F3FD',
          100: '#EDE3FA',
          200: '#D9C6F4',
          300: '#BC9DE9',
          400: '#9C73DA',
          500: '#7E4FC6',
          600: '#6537A8',
          700: '#4E2984',
          800: '#361C5D',
          900: '#231038',
          950: '#150920',
        },
        /* Named roles, so components never reach for a number they have to
           re-pick when the brand shifts. */
        canvas: '#150920',
        surface: '#1D0C2C',
        raised: '#271139',
        hairline: '#3A2150',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.30), 0 16px 40px -20px rgba(0,0,0,0.65)',
        panel: '-12px 0 60px -16px rgba(0,0,0,0.75)',
        sheet: '0 -12px 60px -16px rgba(0,0,0,0.75)',
        pin: '0 4px 14px rgba(0,0,0,0.55)',
        glow: '0 0 0 1px rgba(188,157,233,0.25), 0 8px 32px -8px rgba(126,79,198,0.55)',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        /* Two columns of tiles, offset by half, give a seamless loop. */
        driftUp: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(0,-50%,0)' },
        },
        driftDown: {
          '0%': { transform: 'translate3d(0,-50%,0)' },
          '100%': { transform: 'translate3d(0,0,0)' },
        },
        /* The hero's scroll cue. */
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(5px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        'drift-up': 'driftUp linear infinite',
        'drift-down': 'driftDown linear infinite',
        bob: 'bob 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
