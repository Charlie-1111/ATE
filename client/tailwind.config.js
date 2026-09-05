/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#000000',
          surface: '#111111',
          card: '#1a1a1a',
        },
        accent: {
          gold: '#FFD700',
          goldDark: '#B8860B',
          platinum: '#C0C0C0',
          purple: '#9400D3',
          red: '#FF0000',
          cyan: '#00CED1',
        },
        text: {
          DEFAULT: '#FFFFFF',
          muted: '#999999',
          gold: '#FFD700',
        },
        danger: '#FF0000',
        success: '#00FF00',
      },
      fontFamily: {
        display: ['Impact', 'Arial Black', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
      borderWidth: {
        '4': '4px',
        '6': '6px',
      },
    },
  },
  plugins: [],
}
