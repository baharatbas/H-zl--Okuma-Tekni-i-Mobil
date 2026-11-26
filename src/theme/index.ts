import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/appStore';

/**
 * Tasarım sistemi. Sakin, sade ve yüksek kontrastlı: tek ana renk (koyu turkuaz),
 * sıcak nötr zemin, ince kenarlıklar, gölge yok.
 */
export interface Colors {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  border: string;
  success: string;
  danger: string;
  warning: string;
  accentStar: string;
  paper: string;
  paperInk: string;
  margin: string;
}

export const palettes: Record<'light' | 'dark', Colors> = {
  light: {
    background: '#F6F6F4',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEEEB',
    text: '#1D1F22',
    textMuted: '#6A6E75',
    primary: '#1F6F78',
    primarySoft: '#E3F0F1',
    onPrimary: '#FFFFFF',
    border: '#DEDED9',
    success: '#2E7D57',
    danger: '#B4453C',
    warning: '#9A6A1F',
    accentStar: '#D4A03A',
    paper: '#FFFEF8',
    paperInk: '#1D1F22',
    margin: '#D98A85',
  },
  dark: {
    background: '#111316',
    surface: '#1A1D21',
    surfaceAlt: '#23272C',
    text: '#EDEEEF',
    textMuted: '#A0A6AE',
    primary: '#6CC0C6',
    primarySoft: '#1E3436',
    onPrimary: '#0E1517',
    border: '#2E3339',
    success: '#6CC596',
    danger: '#E58A82',
    warning: '#E3B765',
    accentStar: '#E3B765',
    paper: '#25241D',
    paperInk: '#F2F0E6',
    margin: '#D98A85',
  },
};

/** Minimum dokunma alanı (44 pt). Çocuklar ve yaşlılar için büyük tutulur. */
export const MIN_TOUCH = 48;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

/** Yazı ölçeği: tek tutarlı skala. */
export const type = {
  display: { size: 30, weight: '700' as const, lineHeight: 36 },
  title: { size: 24, weight: '700' as const, lineHeight: 30 },
  heading: { size: 18, weight: '600' as const, lineHeight: 24 },
  body: { size: 16, weight: '400' as const, lineHeight: 24 },
  label: { size: 14, weight: '600' as const, lineHeight: 20 },
  caption: { size: 13, weight: '400' as const, lineHeight: 18 },
};

export interface Theme {
  scheme: 'light' | 'dark';
  colors: Colors;
  fontScale: number;
  reducedMotion: boolean;
  scale: (size: number) => number;
}

/** Ayarlardaki tema ve erişilebilirlik tercihlerinden aktif temayı üretir. */
export function useTheme(): Theme {
  const system = useColorScheme();
  const settings = useAppStore((s) => s.settings);
  const scheme: 'light' | 'dark' =
    settings.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : settings.theme;
  return {
    scheme,
    colors: palettes[scheme],
    fontScale: settings.fontScale,
    reducedMotion: settings.reducedMotion,
    scale: (size: number) => Math.round(size * settings.fontScale),
  };
}
