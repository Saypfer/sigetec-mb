/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#1e293b",
        panel: "#ffffff",
        line: "#dbe3ea",
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          500: "#1479d1",
          600: "#0e64b0",
          700: "#0b4e8b",
        },
      },
      boxShadow: {
        soft: "0 16px 40px rgba(31, 41, 55, 0.08)",
      },
    },
  },
  plugins: [],
};
