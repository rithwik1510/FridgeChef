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
        // Enhanced Kitchen Table color palette
        cream: {
          lightest: '#FFFCF7',
          DEFAULT: '#FBF8F3',
          dark: '#F0E9DC',
          darker: '#E5DBC8',
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
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'stagger': 'fadeIn 0.3s ease-out backwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.3s ease-in-out',
        'shimmer': 'shimmer 2s infinite linear',
        'bounce-subtle': 'bounceSubtle 0.4s ease-out',
        'spin-slow': 'spin 2s linear infinite',
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
