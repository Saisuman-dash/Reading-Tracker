/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#121212',
          surface: '#1e1e1e',
          card: '#2a2a2a',
          border: '#3a3a3a',
          text: {
            primary: '#ffffff',
            secondary: '#a0a0a0',
            muted: '#666666',
          }
        },
        accent: {
          blue: '#38bdf8',
          violet: '#7c3aed',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        heatmap: {
          0: '#1e1e1e',
          1: '#1e3a8a30',
          2: '#1e3a8a50',
          3: '#1e3a8a70',
          4: '#1e3a8a90',
          5: '#1e3a8a',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #38bdf8' },
          '100%': { boxShadow: '0 0 20px #38bdf8, 0 0 30px #38bdf8' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
};