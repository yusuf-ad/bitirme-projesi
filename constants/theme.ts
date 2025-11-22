/**
 * Color palette extracted from Figma design system
 * Organized with semantic naming for better maintainability
 */

export const Colors = {
  // Primary Lilac Scale
  lilac: {
    100: "#F2EEF8", // Lightest lilac - backgrounds, subtle highlights
    200: "#E1D9EE", // Very light lilac - light backgrounds
    300: "#D2C6E6", // Light lilac - borders, dividers
    400: "#C3B1E1", // Medium light lilac - inactive states
    500: "#B49CDA", // Medium lilac - secondary actions
    600: "#A587D3", // Base lilac - primary brand color
    700: "#9673CC", // Medium dark lilac - hover states
    800: "#875EC5", // Dark lilac - active states
    900: "#7849B6", // Darkest lilac - primary brand color
  },

  // Secondary Green Scale
  green: {
    100: "#F2F8EF", // Lightest green - success backgrounds
    200: "#E1EFDB", // Very light green - light success states
    300: "#D2E6CE", // Light green - success borders
    400: "#A8D8C0", // Medium light green - success highlights
    500: "#97C9AE", // Medium green - success secondary
    600: "#87B99D", // Base green - success primary
    700: "#76A98C", // Medium dark green - success hover
    800: "#659A7B", // Dark green - success active
    900: "#548A6A", // Darkest green - primary brand color
  },

  // Neutral/Dark Scale
  purple: {
    100: "#F2F0F4", // Lightest neutral - light backgrounds
    200: "#E1DDE6", // Very light neutral - subtle backgrounds
    300: "#D1CADD", // Light neutral - borders, dividers
    400: "#5A4D6A", // Medium neutral - secondary text
    500: "#52465F", // Medium dark neutral - body text
    600: "#4A3F55", // Base neutral - primary text
    700: "#41384A", // Dark neutral - headings
    800: "#393140", // Darkest neutral - emphasis text
    900: "#312A35", // Darkest neutral - primary brand color
  },

  // Beige Scale
  beige: {
    100: "#FDFBF9", // Lightest beige - backgrounds
    200: "#FBF7F2", // Very light beige - subtle backgrounds
    300: "#FAF5ED", // Light beige - borders, dividers
    400: "#F8F2E6", // Medium light beige - secondary text
    500: "#E9E0D4", // Medium beige - body text
    600: "#DAD9C3", // Medium dark beige - primary text
    700: "#CBC2B2", // Dark beige - headings
    800: "#BCAA91", // Darker beige - emphasis text
    900: "#AFA280", // Darkest beige - primary brand color
  },

  // Accent Colors
  accent: {
    lilac: "#7849B6", // Primary accent lilac
    green: "#548A6A", // Success accent green
    dark: "#312A35", // Dark accent for contrast
    light: "#AFA280", // Light accent for highlights
  },

  // Semantic Colors
  semantic: {
    // Success colors (using green scale)
    success: {
      light: "#E7F6E5",
      main: "#0DA500",
      dark: "#074302",
    },

    // Error colors (red scale)
    error: {
      light: "#FFE5E5",
      main: "#FF0000",
      dark: "#400000",
    },

    // Warning colors (yellow scale)
    warning: {
      light: "#FFFCE5",
      main: "#FFE600",
      dark: "#403900",
    },

    // Info colors (using lilac scale)
    info: {
      light: "#F2EEF8",
      main: "#875EC5",
      dark: "#5200B7",
    },
  },

  // Gray Scale
  gray: {
    100: "#ECEDEE", // Lightest gray - backgrounds
    200: "#D0D1D4", // Very light gray - borders
    300: "#A1A4AA", // Light gray - disabled text
    400: "#737780", // Medium gray - secondary text
    500: "#444955", // Medium dark gray - body text
    600: "#333740", // Base gray - primary text
    700: "#22252B", // Dark gray - headings
    800: "#111215", // Darkest gray - emphasis
  },

  // Background Colors
  background: {
    primary: "#ffff", // Main background
    secondary: "#f8f9fa", // Secondary background
    tertiary: "#E1DDE6", // Tertiary background
    dark: "#111215", // Dark background
    surface: "#FFFFFF", // Surface/card background
    overlay: "rgba(0, 0, 0, 0.5)", // Modal overlay
  },

  // Text Colors
  text: {
    primary: "#393140", // Primary text
    secondary: "#52465F", // Secondary text
    tertiary: "#737780", // Tertiary text
    disabled: "#A1A4AA", // Disabled text
    inverse: "#FFFFFF", // Text on dark backgrounds
    accent: "#7849B6", // Accent text (lilac)
  },

  // Border Colors
  border: {
    light: "#D1CADD", // Light borders
    medium: "#A1A4AA", // Medium borders
    dark: "#52465F", // Dark borders
    focus: "#875EC5", // Focus border (lilac)
  },
};

// Dark Mode Theme Colors (for Profile tab - text-heavy content)
export const DarkColors = {
  // Keep the same color scales
  ...Colors,

  // Override background colors for dark mode
  background: {
    primary: "#0F0E13", // Main dark background
    secondary: "#1A1820", // Secondary dark background
    tertiary: "#25222E", // Tertiary dark background
    dark: "#000000", // Darkest background
    surface: "#1E1C24", // Surface/card background
    overlay: "rgba(0, 0, 0, 0.7)", // Modal overlay
  },

  // Override text colors for dark mode
  text: {
    primary: "#F5F5F7", // Primary text on dark
    secondary: "#C4C4C8", // Secondary text on dark
    tertiary: "#8E8E93", // Tertiary text on dark
    disabled: "#636366", // Disabled text on dark
    inverse: "#1E1C24", // Text on light backgrounds in dark mode
    accent: "#A587D3", // Accent text (lighter lilac)
  },

  // Override border colors for dark mode
  border: {
    light: "#38343E", // Light borders on dark
    medium: "#48444E", // Medium borders on dark
    dark: "#58545E", // Dark borders on dark
    focus: "#9673CC", // Focus border (lighter lilac)
  },

  // Card-specific colors for dark mode
  card: {
    background: "#1E1C24",
    backgroundElevated: "#25222E",
    border: "#38343E",
    shadow: "rgba(0, 0, 0, 0.4)",
  },

  // Gradients for premium dark mode aesthetics
  gradients: {
    primary: ["#A587D3", "#7849B6"],
    success: ["#87B99D", "#548A6A"],
    dark: ["#1E1C24", "#0F0E13"],
    card: ["#25222E", "#1E1C24"],
  },
};

// Lighter Dark Mode for Content Tabs (Home, Recipes, Pantry - image/visual-heavy content)
export const ContentDarkColors = {
  // Keep the same color scales
  ...Colors,

  // Lighter backgrounds for better visual content display
  background: {
    primary: "#1C1A22", // Lighter main background
    secondary: "#353147ff", // Lighter secondary background
    tertiary: "#2E2B3A", // Lighter tertiary background
    dark: "#0F0E13", // Darkest background
    surface: "#282634", // Lighter surface/card background
    overlay: "rgba(0, 0, 0, 0.65)", // Slightly lighter overlay
  },

  // Text colors optimized for lighter backgrounds
  text: {
    primary: "#F8F8FA", // Brighter primary text
    secondary: "#D1D1D6", // Brighter secondary text
    tertiary: "#9A9AA0", // Brighter tertiary text
    disabled: "#6C6C70", // Disabled text
    inverse: "#1C1A22", // Text on light backgrounds
    accent: "#B49CDA", // Lighter accent (more visible on lighter bg)
  },

  // Border colors for lighter dark mode
  border: {
    light: "#3E3B48", // Lighter borders
    medium: "#4E4B58", // Medium borders
    dark: "#5E5B68", // Dark borders
    focus: "#A587D3", // Focus border (brighter lilac)
  },

  // Card-specific colors for content dark mode
  card: {
    background: "#282634",
    backgroundElevated: "#2E2B3A",
    border: "#3E3B48",
    shadow: "rgba(0, 0, 0, 0.3)",
  },

  // Gradients for content dark mode
  gradients: {
    primary: ["#B49CDA", "#875EC5"],
    success: ["#97C9AE", "#659A7B"],
    dark: ["#282634", "#1C1A22"],
    card: ["#2E2B3A", "#282634"],
  },
};

// Helper function to get theme colors
export function getThemeColors(isDark: boolean, isContentTab: boolean = false) {
  if (!isDark) return Colors;
  return isContentTab ? ContentDarkColors : DarkColors;
}
