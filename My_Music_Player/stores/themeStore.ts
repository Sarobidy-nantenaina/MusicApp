import { create } from 'zustand';
import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';

export type FontSize = 'small' | 'medium' | 'large';
export type FontFamily = 
  | 'Inter' 
  | 'Inter_Medium' 
  | 'Inter_SemiBold' 
  | 'Inter_Bold' 
  | 'Inter_Italic'
  | 'Inter_Light'
  | 'Inter_ExtraLight'
  | 'Inter_Black';

export type BackgroundTheme = 
  | 'default'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'aurora'
  | 'midnight';

type ThemeStore = {
  theme: ColorSchemeName;
  fontSize: FontSize;
  fontFamily: FontFamily;
  backgroundTheme: BackgroundTheme;
  setTheme: (theme: ColorSchemeName) => void;
  setFontSize: (size: FontSize) => void;
  setFontFamily: (family: FontFamily) => void;
  setBackgroundTheme: (theme: BackgroundTheme) => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'system',
  fontSize: 'medium',
  fontFamily: 'Inter',
  backgroundTheme: 'default',
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setBackgroundTheme: (backgroundTheme) => set({ backgroundTheme }),
}));

export const useColorScheme = () => {
  const systemScheme = _useColorScheme();
  const { theme } = useThemeStore();
  return theme === 'system' ? systemScheme : theme;
};

export const getFontSizeValue = (size: FontSize) => {
  switch (size) {
    case 'small':
      return 0.85;
    case 'large':
      return 1.15;
    default:
      return 1;
  }
};

export const getFontStyleValue = (family: FontFamily) => {
  switch (family) {
    case 'Inter_Light':
      return { fontWeight: '300' };
    case 'Inter_ExtraLight':
      return { fontWeight: '200' };
    case 'Inter_Medium':
      return { fontWeight: '500' };
    case 'Inter_SemiBold':
      return { fontWeight: '600' };
    case 'Inter_Bold':
      return { fontWeight: '700' };
    case 'Inter_Black':
      return { fontWeight: '900' };
    case 'Inter_Italic':
      return { fontStyle: 'italic' };
    default:
      return { fontWeight: '400' };
  }
};

export const getBackgroundColors = (theme: BackgroundTheme) => {
  switch (theme) {
    case 'sunset':
      return ['#FF512F', '#DD2476', '#FF0080'];
    case 'ocean':
      return ['#2E3192', '#1BFFFF', '#D4FFFF'];
    case 'forest':
      return ['#134E5E', '#71B280', '#2ECC71'];
    case 'aurora':
      return ['#1D976C', '#93F9B9', '#2ECC71'];
    case 'midnight':
      return ['#232526', '#414345', '#000000'];
    default:
      return ['#4A148C', '#311B92', '#1A237E'];
  }
};