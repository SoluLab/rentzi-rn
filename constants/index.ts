// Central export file for all design system constants
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadow } from './shadow';
import { elevation } from './elevation';
import { opacity } from './opacity';
import { staticText } from './staticText';
import { animations } from './animations';
export { colors, typography, spacing, radius, shadow, elevation, opacity, staticText, animations };
// Design system theme object
export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadow,
  elevation,
  opacity,
  staticText,
  animations,
};
// Type definitions for the design system
export type Theme = typeof theme;
export type Colors = typeof theme.colors;
export type Typography = typeof theme.typography;
export type Spacing = typeof theme.spacing;
export type StaticText = typeof theme.staticText;