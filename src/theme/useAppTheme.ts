import { useTheme } from 'react-native-paper';
import type { AppTheme } from './theme';

/** Typed accessor for the extended palette (success / warning / card / ...). */
export const useAppTheme = () => useTheme<AppTheme>();
