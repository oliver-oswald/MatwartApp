const {heroui} = require('@heroui/theme');
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [heroui()],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@heroui/theme/dist/components/(button|dropdown|ripple|spinner|menu|divider|popover).js"
  ],
};