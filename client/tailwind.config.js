/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        asba: {
          50: '#faf7ff',
          100: '#f3ecff',
          200: '#e9dbff',
          300: '#d6bcff',
          400: '#bc8eff',
          500: '#9f5afd',
          600: '#8532f2',
          700: '#6f1ed6',
          800: '#4c1d95',
          900: '#2e1065',
          950: '#1a063b'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
};

