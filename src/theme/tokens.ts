import { scale, vs, ms } from '../utils/scale';

export const Colors = {
  black:            '#000000',
  white:            '#FFFFFF',
  offWhite:         '#F5F5F5',
  gray100:          '#F7F7F7',
  gray200:          '#E5E5E5',
  gray400:          '#AAAAAA',
  gray600:          '#666666',
  gray800:          '#333333',
  error:            '#D32F2F',
  success:          '#388E3C',
  wishlistActive:   '#E53935',
  wishlistInactive: '#080606',
  overlay:          'rgba(0,0,0,0.4)',
} as const;

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium:  'System',
    bold:    'System',
  },
  fontSize: {
    xs:   ms(11),
    sm:   ms(13),
    base: ms(15),
    md:   ms(17),
    lg:   ms(20),
    xl:   ms(24),
    xxl:  ms(30),
  },
  lineHeight: {
    tight:  1.2,
    normal: 1.5,
    loose:  1.8,
  },
} as const;

export const Spacing = {
  xs:  scale(4),
  sm:  scale(8),
  md:  scale(16),
  lg:  scale(24),
  xl:  scale(32),
  xxl: scale(48),
} as const;

export const BorderRadius = {
  sm:   scale(4),
  md:   scale(8),
  lg:   scale(12),
  xl:   scale(24),
  full: 9999,
} as const;
