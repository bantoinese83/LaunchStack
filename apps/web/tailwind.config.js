/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F3F4F1',
        surface: '#FFFFFF',
        ink: '#141714',
        muted: '#5A635C',
        line: '#C9CEC6',
        accent: {
          DEFAULT: '#0F6E56',
          hover: '#0B5844',
          soft: '#E3F0EB',
        },
        danger: '#B42318',
        success: '#027A48',
        background: '#F3F4F1',
        foreground: '#141714',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Syne', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        md: '6px',
        sm: '4px',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        draw: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [],
};
