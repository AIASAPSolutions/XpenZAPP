import { useColorScheme } from 'react-native';
import { useUiStore } from '../store/uiStore';
import { colors } from '../constants/colors';
import { lightTheme } from '../theme/lightTheme';
import { darkTheme } from '../theme/darkTheme';

export const useTheme = () => {
  const storeTheme = useUiStore((state) => state.theme);
  const systemColorScheme = useColorScheme();
  
  const isDark = storeTheme === 'dark' || (storeTheme === 'system' && systemColorScheme === 'dark');
  
  const activeColors = isDark ? colors.dark : colors.light;
  const activePaperTheme = isDark ? darkTheme : lightTheme;

  return {
    isDark,
    colors: {
      ...colors,
      ...activeColors,
    },
    paperTheme: activePaperTheme,
  };
};
export default useTheme;
