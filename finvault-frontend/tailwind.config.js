/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0E14',
          900: '#11151D',
          850: '#161B26',
          800: '#1A1F2B',
          700: '#252B3A',
          600: '#323A4D',
        },
        line: {
          DEFAULT: '#2A3142',
          light: '#E4E1D8',
        },
        paper: {
          DEFAULT: '#F7F6F3',
          raised: '#FFFFFF',
        },
        vault: {
          DEFAULT: '#C9A227',
          dim: '#9C7E1F',
          light: '#E4C158',
        },
        signal: {
          green: '#34C77B',
          red: '#E2574C',
          blue: '#4C8DFF',
          amber: '#E8A53D',
        },
        ledger: {
          dark: {
            primary: '#EDEEF2',
            secondary: '#8B92A5',
            tertiary: '#5C6378',
          },
          light: {
            primary: '#1A1F2B',
            secondary: '#5C6373',
            tertiary: '#8A8F9C',
          },
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': '0.6875rem',
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,14,20,0.04), 0 1px 1px rgba(11,14,20,0.03)',
        'card-dark': '0 1px 2px rgba(0,0,0,0.3)',
        popover: '0 12px 32px rgba(11,14,20,0.16)',
        // Used by the landing page (always-dark marketing surface)
        glow: '0 0 0 1px rgba(201,162,39,0.15), 0 24px 60px -20px rgba(201,162,39,0.25)',
        panel: '0 30px 80px -30px rgba(0,0,0,0.55)',
      },
      backgroundImage: {
        'ledger-grid':
          'linear-gradient(to right, var(--tw-ledger-line) 1px, transparent 1px), linear-gradient(to bottom, var(--tw-ledger-line) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
