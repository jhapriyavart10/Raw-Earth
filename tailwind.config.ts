import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-brown': '#5C3D2E',
        'brand-cream': '#F5E6D3',
        'brand-orange': '#F4C89F',
      },
      // ADD THIS SECTION BELOW
      fontFamily: {
        muslone: ['var(--font-muslone)'],
        lora: ['var(--font-lora)', 'serif'],
        manrope: ['var(--font-manrope)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config