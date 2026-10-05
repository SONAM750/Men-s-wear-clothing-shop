/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f6f6f7',
          100: '#e8e8ea',
          200: '#d1d1d5',
          300: '#a8a8b0',
          400: '#7a7a85',
          500: '#565661',
          600: '#3f3f48',
          700: '#2d2d34',
          800: '#1e1e24',
          900: '#131318',
          950: '#0a0a0d',
        },
        accent: {
          50: '#fffaeb',
          100: '#fff0c6',
          200: '#ffe088',
          300: '#ffc94a',
          400: '#ffb31f',
          500: '#f99007',
          600: '#dd6a02',
          700: '#b74a06',
          800: '#94380c',
          900: '#7a2f0d',
          950: '#461602',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
