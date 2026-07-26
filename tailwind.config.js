/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        examBlue: "#e0f2fe",
        examBlueDark: "#0369a1",
        examOrange: "#ffedd5",
        examOrangeDark: "#c2410c",
        examGreen: "#dcfce7",
        examGreenDark: "#15803d",
        examPurple: "#f3e8ff",
        examPurpleDark: "#7e22ce",
        examYellow: "#fef9c3",
        examYellowDark: "#a16207",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  corePlugins: {
    // Disable preflight to prevent conflicts with Material UI (MUI) defaults
    preflight: false,
  },
  plugins: [],
}
