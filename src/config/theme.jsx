// src/config/theme.js
export const theme = {
  colors: {
    primary: "#06b6d4", // cyan-500
    primaryHover: "#0891b2", // cyan-600
    primaryLight: "#67e8f9", // cyan-300
    secondary: "#f97316", // orange-500
    secondaryHover: "#ea580c", // orange-600
    background: "#111827", // gray-900 (Main background)
    surface: "#1f2937", // gray-800 (Cards, modals, etc.)
    surfaceLight: "#374151", // gray-700 (Inputs, lighter surfaces)
    surfaceDarker: "#0f172a", // gray-950 (Footer, very dark elements)
    border: "#4b5563", // gray-600 (Slightly darker for better contrast on gray-700 inputs)
    text: "#f3f4f6", // gray-100 (General text)
    textLighter: "#9ca3af", // gray-400 (Subtle text, placeholders)
    textDark: "#e5e7eb", // gray-300 (Slightly darker than main text)
    textInverse: "#1f2937", // For text on light backgrounds if any
    white: "#ffffff",
    black: "#000000",
    error: "#ef4444", // red-500
    success: "#22c55e", // green-500
    warning: "#f59e0b", // amber-500
    disabled: "#4b5563", // gray-600
    disabledText: "#9ca3af", // gray-400
  },
  fonts: {
    main: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
    headings: "'Montserrat', sans-serif",
  },
  fontSizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },
  spacing: {
    0: "0",
    px: "1px",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    16: "4rem", // 64px
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem", // 2px
    base: "0.25rem", // 4px (rounded)
    md: "0.375rem", // 6px (rounded-md)
    lg: "0.5rem", // 8px (rounded-lg)
    xl: "0.75rem", // 12px
    full: "9999px",
  },
  breakpoints: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  zIndices: {
    dropdown: 10,
    sticky: 20,
    overlay: 40,
    modal: 50,
  },
  transitions: {
    short: "all 0.15s ease-in-out",
    base: "all 0.3s ease-in-out",
  },
};
