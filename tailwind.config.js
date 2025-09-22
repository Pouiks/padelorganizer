/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'padel-green': '#10B981',
        'padel-blue': '#3B82F6',
      }
    },
  },
  plugins: [],
}
