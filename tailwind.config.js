const tokens = require('./theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        bg: tokens.bg,
        surface: tokens.surface,
        'surface-soft': tokens.surfaceSoft,
        border: tokens.border,
        divider: {
          DEFAULT: tokens.divider,
          soft: tokens.dividerSoft,
        },

        primary: {
          DEFAULT: tokens.primary,
          hover: tokens.primaryHover,
          active: tokens.primaryActive,
        },

        accent: tokens.accent,

        text: {
          DEFAULT: tokens.text,
          secondary: tokens.textSecondary,
          muted: tokens.textMuted,
        },

        success: tokens.success,
        warning: tokens.warning,
        danger: tokens.danger,
        info: tokens.info,
      },
    },
  },
};
