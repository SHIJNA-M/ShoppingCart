/**
 * Responsive scaling — base design 390×844 (iPhone 14 / Figma standard).
 * Uses useWindowDimensions hook for live updates on resize/orientation.
 * Static helpers use Dimensions for StyleSheet (computed once at load).
 */
import { Dimensions, PixelRatio } from 'react-native';

const BASE_W = 390;
const BASE_H = 844;

const { width: W, height: H } = Dimensions.get('window');

const round = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n));

/** Scale horizontal values (padding, margin, width) */
export const scale = (size: number): number => round((W / BASE_W) * size);

/** Scale vertical values (height, vertical padding) */
export const vs = (size: number): number => round((H / BASE_H) * size);

/**
 * Moderate scale for font sizes.
 * factor=0.4 → less aggressive than full scale, prevents huge fonts on tablets.
 */
export const ms = (size: number, factor = 0.4): number =>
  round(size + (scale(size) - size) * factor);

/** Clamp a value between min and max */
export const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max);

/** Font size clamped — never too small or too large */
export const fs = (size: number): number =>
  clamp(ms(size), size * 0.85, size * 1.25);
