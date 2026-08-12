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
      },
      fontFamily: {
        display: ['var(--font-display)', 'Syne', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        md: '6px',
        sm: '4px',
      },
    },
  },
  plugins: [],
};
