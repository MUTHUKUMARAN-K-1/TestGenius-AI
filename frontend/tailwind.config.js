/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cn: {
          bg: 'var(--cn-bg)',
          surface: 'var(--cn-surface)',
          'surface-elevated': 'var(--cn-surface-elevated)',
          border: 'var(--cn-border)',
          'border-strong': 'var(--cn-border-strong)',
          text: 'var(--cn-text)',
          muted: 'var(--cn-muted)',
          accent: 'var(--cn-accent)',
          'accent-hover': 'var(--cn-accent-hover)',
          success: 'var(--cn-success)',
          danger: 'var(--cn-danger)',
          warn: 'var(--cn-warn)',
          info: 'var(--cn-info)',
          purple: 'var(--cn-purple)',
        },
        primary: { DEFAULT: '#2563eb', dark: '#1d4ed8' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: { cn: '0.875rem' },
      boxShadow: {
        cn: 'var(--cn-shadow)',
        'cn-md': 'var(--cn-shadow-md)',
        'cn-lg': 'var(--cn-shadow-lg)',
      },
    },
  },
  plugins: [],
}
