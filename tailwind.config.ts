import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "2rem",
        lg: "2.5rem",
      },
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "'Helvetica Neue'", "Arial", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        wd: {
          navy: "hsl(var(--wd-navy))",
          "navy-mid": "hsl(var(--wd-navy-mid))",
          midnight: "hsl(var(--wd-midnight))",
          blue: "hsl(var(--wd-blue))",
          cyan: "hsl(var(--wd-cyan))",
          "cyan-bright": "hsl(var(--wd-cyan-bright))",
          ice: "hsl(var(--wd-ice))",
          muted: "hsl(var(--wd-muted-text))",
          cream: "hsl(var(--wd-cream))",
          stone: "hsl(var(--wd-stone))",
          "warm-grey": "hsl(var(--wd-warm-grey))",
          "navy-text": "hsl(var(--wd-navy-text))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 0 1px hsl(0 0% 0% / 0.03), 0 1px 1px -0.5px hsl(0 0% 0% / 0.03), 0 3px 3px -1.5px hsl(0 0% 0% / 0.03), 0 6px 6px -3px hsl(0 0% 0% / 0.04), 0 12px 12px -6px hsl(0 0% 0% / 0.05), 0 24px 24px -12px hsl(0 0% 0% / 0.06)",
        "glow-cyan": "0 0 20px hsl(190 100% 45% / 0.15), 0 0 60px hsl(190 100% 45% / 0.05)",
        "glow-gold": "0 0 20px hsl(38 70% 50% / 0.15), 0 0 60px hsl(38 70% 50% / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
