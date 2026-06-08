/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Two serifs at different jobs (display vs. reading) + a mono for
        // instrument labels and tabular data. font-serif maps to the reading
        // face so existing `font-serif` usages render Crimson Text, not the
        // browser default.
        display: ['EB Garamond', 'Georgia', 'serif'],
        serif: ['Crimson Text', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['EB Garamond', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand identity surfaced as tokens so components stop hard-coding hex.
        // The channel-backed gray ramp lives in :root (index.css).
        paper: '#fdfbf7',
        ink: {
          DEFAULT: '#1a1a1a',
          bg: '#16181c',
          surface: '#1e2127',
          raised: '#23272f',
          border: '#313742',
        },
        oxford: {
          DEFAULT: '#002147',
          hover: '#003366',
          soft: '#7da7d9',   // dark-mode accent: same hue, lifted
        },
        gray: {
          50: 'rgb(var(--gray-50) / <alpha-value>)',
          100: 'rgb(var(--gray-100) / <alpha-value>)',
          200: 'rgb(var(--gray-200) / <alpha-value>)',
          300: 'rgb(var(--gray-300) / <alpha-value>)',
          400: 'rgb(var(--gray-400) / <alpha-value>)',
          500: 'rgb(var(--gray-500) / <alpha-value>)',
          600: 'rgb(var(--gray-600) / <alpha-value>)',
          700: 'rgb(var(--gray-700) / <alpha-value>)',
          800: 'rgb(var(--gray-800) / <alpha-value>)',
          900: 'rgb(var(--gray-900) / <alpha-value>)',
          950: 'rgb(var(--gray-950) / <alpha-value>)',
        },
      },
      zIndex: {
        dropdown: '1000',
        sticky: '1100',
        modal: '1300',
        toast: '1400',
        tooltip: '1500',
      },
    },
  },
  plugins: [],
}
