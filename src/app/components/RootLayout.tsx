import { Outlet } from "react-router";
import { useState, useEffect } from "react";
import { UserContext, Language } from "./UserContext";
import { ChatAssistant } from "./ChatAssistant";

export function RootLayout() {
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <UserContext.Provider value={{ userRole, setUserRole, language, setLanguage }}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 transition-colors duration-300">
        <Outlet />
        <ChatAssistant />
      </div>
    </UserContext.Provider>
  );
}
