/* Shared Tailwind CDN config for every Pride South Side page.
   Load AFTER the Tailwind CDN script and BEFORE any markup renders.
   Colors track the Pride South Side logo: the six dots are yellow,
   orange, red, purple, blue and green. */
if (typeof tailwind !== "undefined") tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-primary": "#ffffff", "surface-tint": "#145a82", "on-tertiary": "#ffffff",
        "on-background": "#16181c", "surface-container-lowest": "#ffffff", "surface-variant": "#e4e4e7",
        "secondary-container": "#ff6b61", "primary-fixed-dim": "#7cc1ea", "on-tertiary-fixed-variant": "#653e00",
        "on-secondary-fixed": "#5c0a08", "secondary": "#e31e24", "on-primary-fixed": "#0b3b57",
        "on-tertiary-container": "#fffbff", "tertiary-container": "#a65d00", "surface-container-high": "#e8e8e8",
        "on-surface-variant": "#52525b", "on-tertiary-fixed": "#2a1700", "primary-fixed": "#dceefb",
        "error-container": "#ffdad6", "on-secondary-fixed-variant": "#a3241b", "tertiary-fixed-dim": "#ffb95f",
        "on-error-container": "#93000a", "secondary-fixed": "#ffd9d6", "primary": "#1a75bc",
        "surface-dim": "#e0e0e0", "inverse-primary": "#7cc1ea", "surface": "#fafafa", "outline": "#71717a",
        "on-primary-container": "#fffbff", "on-secondary-container": "#7a1410", "background": "#fafafa",
        "tertiary-fixed": "#fbe4c0", "inverse-surface": "#23252b", "surface-bright": "#fafafa",
        "on-primary-fixed-variant": "#145a82", "on-error": "#ffffff", "on-secondary": "#ffffff",
        "inverse-on-surface": "#f4f4f5", "secondary-fixed-dim": "#ffb0cd", "surface-container-highest": "#e0e0e0",
        "error": "#ba1a1a", "on-surface": "#16181c", "surface-container-low": "#f5f5f5", "tertiary": "#a65d00",
        "outline-variant": "#d4d4d8", "surface-container": "#f0f0f0", "primary-container": "#3b93ce",
        "success": "#00a14b", "pride-yellow": "#ffdd19", "pride-orange": "#fcb042",
        "pride-red": "#ed1c24", "pride-purple": "#7f4097", "pride-blue": "#1a75bc", "pride-green": "#00a14b"
      },
      borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
      spacing: { base: "8px", gutter: "24px", "margin-desktop": "48px", "section-gap": "80px", "container-max": "1280px", "margin-mobile": "16px" },
      fontFamily: {
        "headline-lg-mobile": ["Fredoka"], "body-lg": ["Atkinson Hyperlegible Next"],
        "label-sm": ["Atkinson Hyperlegible Next"], "headline-md": ["Fredoka"],
        "display-lg": ["Fredoka"], "headline-lg": ["Fredoka"], "body-md": ["Atkinson Hyperlegible Next"]
      },
      fontSize: {
        "headline-lg-mobile": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-sm": ["14px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" }],
        "headline-md": ["28px", { lineHeight: "1.3", fontWeight: "600" }],
        "display-lg": ["56px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["40px", { lineHeight: "1.2", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }]
      }
    }
  }
}
