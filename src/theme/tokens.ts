export const Colors = {
  // Primary palette
  black:            '#000000',
  white:            '#FFFFFF',
  offWhite:         '#F5F5F5',

  // Grays
  gray100:          '#F7F7F7',
  gray200:          '#E5E5E5',
  gray400:          '#AAAAAA',
  gray600:          '#666666',
  gray800:          '#333333',

  // Semantic
  error:            '#D32F2F',
  success:          '#388E3C',
  wishlistActive:   '#E53935',   // filled heart
  wishlistInactive: '#080606',   // outline heart

  // Overlay
  overlay:          'rgba(0,0,0,0.4)',
} as const;

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium:  'System',
    bold:    'System',
  },
  fontSize: {
    xs:  11,
    sm:  13,
    base: 15,
    md:  17,
    lg:  20,
    xl:  24,
    xxl: 30,
  },
  lineHeight: {
    tight:  1.2,
    normal: 1.5,
    loose:  1.8,
  },
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm:   4,
  md:   8,
  lg:   12,
  full: 9999,
} as const;
