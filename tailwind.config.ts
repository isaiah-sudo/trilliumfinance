import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS configuration for Trillium Finance modern app.
 * Colors and design tokens are derived from the Visual Style Guide.
 */
const config: Config = {
  darkMode: 'class', // enable dark mode via .dark on <html>
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light mode base colors
        slate: {
          50: '#f8fafc', // bg-slate-50
          100: '#f1f5f9', // used for hover bg in light mode
          200: '#e2e8f0', // border-slate-200
          300: '#d1d5db', // toggle off bg
          400: '#9ca3af',
          500: '#6b7280',
          600: '#2563eb', // primary blue
          700: '#334155', // border-slate-700 / hover dark
          800: '#1e293b', // card dark bg
          900: '#0f172a', // body dark bg
        },
        blue: {
          500: '#3b82f6', // badge highlight
          600: '#2563eb', // primary button
          700: '#1d4ed8',
        },
        red: {
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
      },
      borderRadius: {
        // Custom large radius used for the navbar/panel
        '2xl': '2rem', // matches rounded-[2rem]
      },
    },
  },
  plugins: [],
};

export default config;
