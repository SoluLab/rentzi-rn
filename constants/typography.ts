import { Text } from 'react-native';
export const typography = {
  // Font families
  fontFamily: {
    primary: "System", // Will use Inter when available
    secondary: "System",
    mono: "Courier New",
  },
  
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 36,
    "6xl": 48,
    "7xl": 60,
  },
  
  // Font weights
  fontWeight: {
    thin: "100" as const,
    light: "300" as const,
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
    black: "900" as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
  
  // Text variants for luxury theme
  variants: {
    display: {
      fontSize: 48,
      fontWeight: "700" as const,
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    h1: {
      fontSize: 36,
      fontWeight: "700" as const,
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 32,
      fontWeight: "600" as const,
      lineHeight: 1.3,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 28,
      fontWeight: "600" as const,
      lineHeight: 1.3,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 24,
      fontWeight: "600" as const,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    h5: {
      fontSize: 20,
      fontWeight: "500" as const,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    h6: {
      fontSize: 18,
      fontWeight: "500" as const,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    subtitle1: {
      fontSize: 16,
      fontWeight: "500" as const,
      lineHeight: 1.5,
      letterSpacing: 0.15,
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: "500" as const,
      lineHeight: 1.5,
      letterSpacing: 0.1,
    },
    body: {
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 1.5,
      letterSpacing: 0.15,
    },
    body2: {
      fontSize: 14,
      fontWeight: "400" as const,
      lineHeight: 1.5,
      letterSpacing: 0.25,
    },
    caption: {
      fontSize: 12,
      fontWeight: "400" as const,
      lineHeight: 1.4,
      letterSpacing: 0.4,
    },
    label: {
      fontSize: 10,
      fontWeight: "500" as const,
      lineHeight: 1.4,
      letterSpacing: 0.5,
    },
    overline: {
      fontSize: 10,
      fontWeight: "500" as const,
      lineHeight: 1.4,
      letterSpacing: 1.5,
      textTransform: "uppercase" as const,
    },
  },
};