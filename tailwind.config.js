// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
        "*.{js,ts,jsx,tsx,mdx}"
    ],
  theme: {
    extend: {
      colors: {
        "gs-green": "#007935",  // GS 칼텍스 CI 그린
        "gs-gray": "#333333",   // GS 다크 그레이
      },
    },
  },
  plugins: [],
}
