/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary palette
        crimson: {
          50:  '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#ff6b6b',
          500: '#f83b3b',
          600: '#e51d1d',
          700: '#c0392b',
          800: '#9f1a1a',
          900: '#841c1c',
          950: '#480a0a',
        },
        // Near-black base
        base: {
          50:  '#f5f5f7',
          100: '#e8e8ed',
          200: '#c8c8d0',
          300: '#9898a8',
          400: '#6b6b80',
          500: '#4a4a5a',
          600: '#333340',
          700: '#222230',
          800: '#16161e',
          900: '#0f0f14',
          950: '#08080c',
        },
        // Electric blue for AI elements
        electric: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Semantic status colors
        available:  '#22c55e',
        low:        '#f59e0b',
        critical:   '#ef4444',
        // Surface hierarchy (used as CSS vars in globals.css)
        surface: {
          primary:   'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          card:      'var(--surface-card)',
          overlay:   'var(--surface-overlay)',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['4.5rem',  { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        'h1':      ['3rem',    { lineHeight: '1.1',  letterSpacing: '-0.025em', fontWeight: '700' }],
        'h2':      ['2rem',    { lineHeight: '1.2',  letterSpacing: '-0.02em', fontWeight: '600' }],
        'h3':      ['1.5rem',  { lineHeight: '1.3',  letterSpacing: '-0.015em', fontWeight: '600' }],
        'body':    ['1rem',    { lineHeight: '1.6' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '68': '17rem',
        '76': '19rem',
        '84': '21rem',
        '88': '22rem',
        '92': '23rem',
      },
      borderRadius: {
        'pill':  '9999px',
        'card':  '16px',
        'input': '10px',
        'badge': '6px',
      },
      boxShadow: {
        'glass':   '0 8px 32px 0 rgba(0,0,0,0.37)',
        'glow-red':   '0 0 20px rgba(192,57,43,0.4)',
        'glow-blue':  '0 0 20px rgba(37,99,235,0.4)',
        'glow-green': '0 0 20px rgba(34,197,94,0.3)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.4)',
        'elevated':   '0 4px 24px rgba(0,0,0,0.25)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'ticker':       'ticker 30s linear infinite',
        'pulse-ring':   'pulseRing 2s ease-out infinite',
        'shimmer':      'shimmer 1.5s infinite',
        'float':        'float 6s ease-in-out infinite',
        'gradient-x':   'gradientX 8s ease infinite',
        'spin-slow':    'spin 8s linear infinite',
        'bounce-soft':  'bounceSoft 2s ease-in-out infinite',
        'fade-in':      'fadeIn 0.5s ease-out forwards',
        'slide-up':     'slideUp 0.5s ease-out forwards',
        'count-up':     'countUp 0.5s ease-out forwards',
        'marquee':      'marquee 25s linear infinite',
        'flip-clock':   'flipClock 0.5s ease-in-out',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(192,57,43,0.7)' },
          '70%':  { transform: 'scale(1)',    boxShadow: '0 0 0 20px rgba(192,57,43,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(192,57,43,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%':   { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        flipClock: {
          '0%':   { transform: 'rotateX(0deg)' },
          '100%': { transform: 'rotateX(-90deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient':    'radial-gradient(at 40% 20%, hsla(0,85%,40%,0.4) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(220,80%,50%,0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(350,90%,30%,0.3) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(220,70%,35%,0.2) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(0,75%,25%,0.25) 0px, transparent 50%)',
      },
      zIndex: {
        '60':  '60',
        '70':  '70',
        '80':  '80',
        '90':  '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};
