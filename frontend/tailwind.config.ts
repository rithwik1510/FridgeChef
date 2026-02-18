import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Original warm cream palette
        cream: {
          lightest: '#FFFCF7',     // Warm white
          DEFAULT: '#FBF8F3',      // Cream
          dark: '#F0E9DC',         // Light tan
          darker: '#E5DBC8',       // Tan
        },
        charcoal: {
          DEFAULT: '#2D2A26',
          light: '#5A5550',
        },
        terracotta: {
          DEFAULT: '#C4704B',
          light: '#D98B6A',
          dark: '#A85938',
        },
        sage: {
          DEFAULT: '#7D8B6E',
          light: '#A0AE91',
          dark: '#5F6C52',
        },
        butter: {
          DEFAULT: '#E8C547',
          light: '#F0D570',
          dark: '#D4B034',
        },
      },
      fontFamily: {
        fraunces: ['var(--font-fraunces)', 'serif'],
        'source-serif': ['var(--font-source-serif)', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        base: '18px',
      },
      spacing: {
        '128': '32rem',
        'sidebar': '220px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(45, 42, 38, 0.08)',
        'medium': '0 4px 16px rgba(45, 42, 38, 0.12)',
        'strong': '0 8px 24px rgba(45, 42, 38, 0.16)',
        'glow': '0 0 20px rgba(196, 112, 75, 0.3)',
        'inner-soft': 'inset 0 2px 4px rgba(45, 42, 38, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'stagger': 'fadeIn 0.15s ease-out backwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.3s ease-in-out',
        'shimmer': 'shimmer 2s infinite linear',
        'bounce-subtle': 'bounceSubtle 0.4s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'slide-in-bottom': 'slideInBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-out-bottom': 'slideOutBottom 0.3s ease-in forwards',
        'spring-scale': 'springScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'tap-feedback': 'tapFeedback 0.15s ease-out',
        // Page transitions
        'page-enter': 'pageEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'page-exit': 'pageExit 0.3s ease-in forwards',
        // Heart pop for favorites
        'heart-pop': 'heartPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        // Button ripple
        'ripple': 'ripple 0.6s ease-out forwards',
        // Steam animations for cooking pot
        'steam-1': 'steam 2s ease-out infinite',
        'steam-2': 'steam 2s ease-out infinite 0.3s',
        'steam-3': 'steam 2s ease-out infinite 0.6s',
        // Easter egg animations
        'food-rain': 'foodRain 3s linear forwards',
        'confetti': 'confetti 3s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        // Toast animations
        'success-check': 'successCheck 0.4s ease-out forwards',
        'success-ring': 'successRing 0.4s ease-out forwards',
        'error-shake': 'errorShake 0.5s ease-out',
        // Loading dots
        'bounce-dot': 'bounceDot 1.4s ease-in-out infinite',
        'bounce-dot-delay-1': 'bounceDot 1.4s ease-in-out 0.16s infinite',
        'bounce-dot-delay-2': 'bounceDot 1.4s ease-in-out 0.32s infinite',
        // Card shine
        'shine': 'shine 0.6s ease-out',
        // Particle burst for favorites
        'particle-burst': 'particleBurst 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(196, 112, 75, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(196, 112, 75, 0.5)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        springScale: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        tapFeedback: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        // Page transitions
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pageExit: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-10px) scale(0.98)' },
        },
        // Heart pop for favorites
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.3)' },
          '50%': { transform: 'scale(0.9)' },
          '75%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        // Button ripple
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        // Steam animation
        steam: {
          '0%': { opacity: '0', transform: 'translateY(0) scale(1)' },
          '50%': { opacity: '0.7' },
          '100%': { opacity: '0', transform: 'translateY(-20px) scale(1.5)' },
        },
        // Food rain easter egg
        foodRain: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        // Confetti
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        // Float animation
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // Success checkmark
        successCheck: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        // Success ring
        successRing: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        // Error shake
        errorShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        // Bouncing dots
        bounceDot: {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' },
        },
        // Card shine
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        // Particle burst
        particleBurst: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1.5) rotate(180deg)', opacity: '0' },
        },
        slideOutBottom: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
export default config
