/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
        fontSize: {
        base: '1rem',     // 16px
        sm: '0.9rem',
        lg: '1.125rem',
        xl: '1.25rem',
      },
    },
  },
  plugins: [],
};
