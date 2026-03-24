import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        red: { DEFAULT: '#d0021b', dark: '#a30015' },
        muted: '#888888',
        surface: '#fafafa',
        surface2: '#f4f4f4',
        text: '#0a0a0a',
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
export default config
