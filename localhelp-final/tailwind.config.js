/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['DM Sans', 'system-ui', 'sans-serif'] },
      colors: {
        ink: { DEFAULT: '#0A0A0F', soft: '#16161F', muted: '#2A2A38' },
        accent: { DEFAULT: '#2563EB', light: '#EFF6FF', hover: '#1D4ED8', subtle: '#DBEAFE' },
        surface: { DEFAULT: '#F8F8FA', card: '#FFFFFF', muted: '#F2F2F8', hover: '#EEEEF8' },
        border: { DEFAULT: '#E4E4F0', strong: '#CACAD8' },
        text: { primary: '#0A0A0F', secondary: '#5A5A78', muted: '#9090AC' },
        success: '#10B981', warning: '#F59E0B', danger: '#EF4444',
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.10)',
        'button': '0 1px 3px rgba(37,99,235,0.35), 0 4px 16px rgba(37,99,235,0.25)',
        'button-dark': '0 2px 6px rgba(0,0,0,0.25), 0 8px 20px rgba(0,0,0,0.15)',
        'xl2': '0 20px 60px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
