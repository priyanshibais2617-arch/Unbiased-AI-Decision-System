import { Outlet } from "react-router";
import { useState, useEffect } from "react";
import { UserContext, Language, Theme, UIDensity, FontSize, NotificationsConfig, defaultNotifications } from "./UserContext";
import { ChatAssistant } from "./ChatAssistant";

export function RootLayout() {
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  
  // Persisted state from localStorage
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'en');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [density, setDensity] = useState<UIDensity>(() => (localStorage.getItem('density') as UIDensity) || 'comfortable');
  const [fontSize, setFontSize] = useState<FontSize>(() => (localStorage.getItem('fontSize') as FontSize) || 'medium');
  const [notifications, setNotifications] = useState<NotificationsConfig>(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : defaultNotifications;
  });

  // Persist effects
  useEffect(() => localStorage.setItem('language', language), [language]);
  useEffect(() => localStorage.setItem('theme', theme), [theme]);
  useEffect(() => localStorage.setItem('density', density), [density]);
  useEffect(() => localStorage.setItem('fontSize', fontSize), [fontSize]);
  useEffect(() => localStorage.setItem('notifications', JSON.stringify(notifications)), [notifications]);

  // Determine root classes based on settings
  const themeClass = theme === 'dark' ? 'dark bg-slate-900 text-slate-100' : 'bg-[#FFFFFF] text-slate-900';
  const fontClass = fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base';
  // Density might be handled in individual components or by a custom wrapper, but we can set a data attribute
  
  useEffect(() => {
    // Apply dataset for dynamic styling if needed
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-density', density);
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [theme, density, fontSize]);

  return (
    <UserContext.Provider value={{ 
      userRole, setUserRole, 
      language, setLanguage,
      theme, setTheme,
      density, setDensity,
      fontSize, setFontSize,
      notifications, setNotifications
    }}>
      <div className={`min-h-screen transition-all duration-300 ${themeClass} ${fontClass}`}>
        <Outlet />
        <ChatAssistant />
      </div>
    </UserContext.Provider>
  );
}
