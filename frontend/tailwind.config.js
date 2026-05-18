/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#020818',
          900: '#06112e',
          800: '#0a1a4a',
          700: '#0e2266',
          600: '#122a82',
          500: '#1a3399',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'gradient': 'gradientShift 20s ease infinite',
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'slideInLeft': 'slideInLeft 0.4s ease-out forwards',
        'shimmer': 'shimmer 1.8s infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-24px) rotate(3deg)' },
          '66%': { transform: 'translateY(-12px) rotate(-2deg)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow-purple': '0 0 40px rgba(124, 58, 237, 0.4)',
        'glow-gold': '0 0 40px rgba(245, 158, 11, 0.4)',
        'card': '0 8px 40px rgba(0,0,0,0.4)',
        'card-hover': '0 24px 60px rgba(0,0,0,0.5)',
        'premium': '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      backgroundSize: { '400': '400% 400%' },
    },
  },
  plugins: [],
}
