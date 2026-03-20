import { useColorScheme } from 'react-native';
import { useAppStore } from '@/store/appStore';
import { light, dark } from '@/theme/colors';

export function useAppTheme() {
  const themeSetting = useAppStore((s) => s.theme);
  const systemColorScheme = useColorScheme();

  const activeTheme = themeSetting === 'system' ? (systemColorScheme || 'light') : themeSetting;
  const colors = activeTheme === 'dark' ? dark : light;

  return {
    theme: activeTheme,
    themeSetting,
    colors,
    isDark: activeTheme === 'dark',
  };
}
