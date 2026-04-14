import { createContext, useContext } from 'react';

export type Language = 'en' | 'hi';

interface UserContextType {
  userRole: 'user' | 'admin' | null;
  setUserRole: (role: 'user' | 'admin' | null) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const UserContext = createContext<UserContextType>({
  userRole: null,
  setUserRole: () => {},
  language: 'en',
  setLanguage: () => {},
});

export const useUser = () => useContext(UserContext);
