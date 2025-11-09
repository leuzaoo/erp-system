module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  extends: {
    colors: {
      lighter: "#f5f7fa",
      light: "var(--foreground)",
      pattern: "var(--color-soft-blue)",
      darker: "var(--color-navy-dark)",
    },
  },
};
