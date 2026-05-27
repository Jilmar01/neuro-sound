/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#f7f9fb",
        "surface-dim": "#d8dadc",
        "surface-bright": "#f7f9fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "on-surface": "#191c1e",
        "on-surface-variant": "#43474a",
        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eff1f3",
        "outline": "#73787b",
        "outline-variant": "#c3c7cb",
        "surface-tint": "#526069",
        "primary": "#526069",
        "on-primary": "#ffffff",
        "primary-container": "#e3f2fd",
        "on-primary-container": "#606f78",
        "inverse-primary": "#bac9d3",
        "secondary": "#516161",
        "on-secondary": "#ffffff",
        "secondary-container": "#d4e6e5",
        "on-secondary-container": "#576867",
        "tertiary": "#625f4d",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#f7f0d9",
        "on-tertiary-container": "#716d5b",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "primary-fixed": "#d6e5ef",
        "primary-fixed-dim": "#bac9d3",
        "on-primary-fixed": "#0f1d25",
        "on-primary-fixed-variant": "#3b4951",
        "secondary-fixed": "#d4e6e5",
        "secondary-fixed-dim": "#b8cac9",
        "on-secondary-fixed": "#0e1e1e",
        "on-secondary-fixed-variant": "#3a4a49",
        "tertiary-fixed": "#e9e2cc",
        "tertiary-fixed-dim": "#ccc6b1",
        "on-tertiary-fixed": "#1e1c0e",
        "on-tertiary-fixed-variant": "#4a4737",
        "background": "#f7f9fb",
        "on-background": "#191c1e",
        "surface-variant": "#e0e3e5"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "sm": "0.5rem",
        "md": "1.5rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "unit": "8px",
        "container-padding-mobile": "24px",
        "container-padding-desktop": "64px",
        "gutter": "24px",
        "section-gap": "80px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-lg-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-sm": ["13px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }]
      }
    },
  },
  plugins: [],
}
