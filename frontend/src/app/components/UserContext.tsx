import { createContext, useContext } from 'react';

export type Language = 'en' | 'hi';
export type Theme = 'light' | 'dark';
export type UIDensity = 'comfortable' | 'compact';
export type FontSize = 'small' | 'medium' | 'large';

export interface NotificationsConfig {
  assignments: boolean;
  evaluations: boolean;
  aiFeedback: boolean;
  certificates: boolean;
  email: boolean;
  inApp: boolean;
}

export const defaultNotifications: NotificationsConfig = {
  assignments: true,
  evaluations: true,
  aiFeedback: true,
  certificates: false,
  email: true,
  inApp: true,
};

interface UserContextType {
  userRole: 'user' | 'admin' | null;
  setUserRole: (role: 'user' | 'admin' | null) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  density: UIDensity;
  setDensity: (density: UIDensity) => void;
  fontSize: FontSize;
  setFontSize: (fontSize: FontSize) => void;
  notifications: NotificationsConfig;
  setNotifications: (config: NotificationsConfig | ((prev: NotificationsConfig) => NotificationsConfig)) => void;
}

export const UserContext = createContext<UserContextType>({
  userRole: null,
  setUserRole: () => {},
  language: 'en',
  setLanguage: () => {},
  theme: 'light',
  setTheme: () => {},
  density: 'comfortable',
  setDensity: () => {},
  fontSize: 'medium',
  setFontSize: () => {},
  notifications: defaultNotifications,
  setNotifications: () => {},
});

export const useUser = () => useContext(UserContext);
