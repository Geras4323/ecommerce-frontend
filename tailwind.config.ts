import daisyThemes from "daisyui/src/theming/themes";
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xxs: "480px",
        xs: "560px",
      },
      size: {
        104: "26rem",
        120: "30rem",
        128: "32rem",
        144: "36rem",
        152: "38rem",
        160: "40rem",
      },
      width: {
        104: "26rem",
        120: "30rem",
        128: "32rem",
        144: "36rem",
        152: "38rem",
        160: "40rem",
      },
      minWidth: {
        "screen-xxs": "480px",
        "screen-xs": "560px",
        "screen-sm": "640px",
        "screen-md": "768px",
        "screen-lg": "1024px",
      },
      height: {
        104: "26rem",
        120: "30rem",
        128: "32rem",
        136: "34rem",
        144: "36rem",
        152: "38rem",
        160: "40rem",
      },
      maxHeight: {
        104: "26rem",
        120: "30rem",
        128: "32rem",
        136: "34rem",
        144: "36rem",
        152: "38rem",
        160: "40rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        marqueeSlow: "marquee 25s linear infinite",
        marqueeMed: "marquee 20s linear infinite",
        marqueeFast: "marquee 15s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(calc(-100% - 12px))" },
        },
      },
      boxShadow: {
        button: "0 3px 3px rgba(0,0,0, .1), 0 5px 10px rgba(0,0,0, .05)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        "inner-sm": "inset 0 2px 4px 0 rgb(0 0 0 / 0.10)",
        "inner-md": "inset 0 2px 4px 0 rgb(0 0 0 / 0.15)",
        "inner-lg": "inset 0 2px 4px 0 rgb(0 0 0 / 0.20)",
      },
    },
  },
  daisyui: {
    logs: false,
    themes: [
      {
        dark: {
          ...daisyThemes["[data-theme=business]"],
          primary: "#FFFFFF",
          secondary: "#888",
          accent: "#EA6947",
          neutral: "#292524",
          "base-100": "#0B1215",
          "base-300": "#0B1017",
          info: "#0070f3",
          success: "#50e3c2",
          warning: "#f5a623",
          error: "#e00",
          // "--btn-text-case": "none", // set default text transform for buttons
          // "--rounded-box": "0.2rem",
          // "--rounded-btn": "0.15rem",
          // "--rounded-badge": "0.15rem",
        },
      },
      {
        light: {
          ...daisyThemes["[data-theme=business]"],
          primary: "hsl(41, 18%, 20%)",
          secondary: "hsl(40, 20%, 40%)",
          "btn-primary": "hsl(41, 18%, 20%)",
          "btn-secondary": "hsl(41, 18%, 20%)",
          accent: "#67CBA0",
          neutral: "#000",
          "base-100": "hsl(39, 15%, 90%)",
          "base-300": "hsl(39, 25%, 85%)",
          info: "#0070f3",
          success: "#50e3c2",
          warning: "#f5a623",
          error: "#e00",
          // "--btn-text-case": "none", // set default text transform for buttons
          // "--rounded-box": "0.2rem",
          // "--rounded-btn": "0.15rem",
          // "--rounded-badge": "0.15rem",
        },
      },
    ],
  },
  plugins: [
    require("daisyui"),
    require("tailwindcss-animate"),
    require("tailwindcss-3d"),
  ],
};
export default config;
