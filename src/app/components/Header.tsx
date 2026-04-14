import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Shield, ChevronDown, User, ShieldCheck, Globe, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useUser, Language } from "./UserContext";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserRole, language, setLanguage } = useUser();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const handleUserLogin = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleAdminClick = (path: string) => {
    setIsAdminDropdownOpen(false);
    navigate(path);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languageOptions: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
  ];

  const navItems = [
    { name: 'Home', path: '/home' }
  ];

  const isActive = (path: string) => location.pathname === path || (path === '/home' && location.pathname === '/');

  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-300 shadow-sm relative">
      <div className="container mx-auto px-4 py-3 max-w-6xl flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => handleNavClick('/')}
        >
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg group-hover:shadow-md transition-shadow">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent hidden sm:block group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
            Unbiased AI
          </span>
        </div>

        {/* Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.path)}
              className={`font-semibold transition-colors relative group py-1 ${isActive(item.path) ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
            >
              {item.name}
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 transform origin-left transition-transform duration-300 ${isActive(item.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <div className="relative" ref={langDropdownRef}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="gap-2 text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden lg:inline">Language</span>
              <span className="inline lg:hidden font-bold">{language.toUpperCase()}</span>
            </Button>
            
            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden text-sm animate-in fade-in slide-in-from-top-2">
                {languageOptions.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors ${language === opt.code ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-700 font-medium'}`}
                  >
                    <span>{opt.label}</span>
                    {language === opt.code && <span className="h-2 w-2 rounded-full bg-blue-600"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={handleUserLogin} className="gap-2 hidden lg:flex text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors font-bold">
            <User className="h-4 w-4" />
            Continue as User
          </Button>
          
          <div className="relative" ref={dropdownRef}>
            <Button 
              size="sm" 
              onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline font-bold">Admin Portal</span>
              <span className="sm:hidden font-bold">Admin</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {isAdminDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden text-sm animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Select Department
                </div>
                <button onClick={() => handleAdminClick('/admin/education')} className="w-full text-left px-5 py-3 hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-semibold transition-colors flex items-center gap-3">
                  <span className="text-xl">🏫</span> Education Admin
                </button>
                <div className="h-px bg-slate-50 mx-4"></div>
                <button onClick={() => handleAdminClick('/admin/loan')} className="w-full text-left px-5 py-3 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-semibold transition-colors flex items-center gap-3">
                  <span className="text-xl">💰</span> Loan Department
                </button>
                <div className="h-px bg-slate-50 mx-4"></div>
                <button onClick={() => handleAdminClick('/admin/hr')} className="w-full text-left px-5 py-3 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold transition-colors flex items-center gap-3">
                  <span className="text-xl">💼</span> Job Hiring (HR)
                </button>
                <div className="h-px bg-slate-50 mx-4"></div>
                <button onClick={() => handleAdminClick('/admin/document')} className="w-full text-left px-5 py-3 hover:bg-green-50 text-slate-700 hover:text-green-700 font-semibold transition-colors flex items-center gap-3">
                  <span className="text-xl">📄</span> Document Verification
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg z-40 animate-in slide-in-from-top-2">
          <nav className="flex flex-col py-2 max-h-[80vh] overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center w-full px-6 py-4 font-bold transition-colors ${isActive(item.path) ? 'text-blue-700 bg-blue-50/50 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600 border-l-4 border-transparent'}`}
              >
                {item.name}
              </button>
            ))}
            <div className="h-px bg-slate-100 w-full my-2"></div>
            <button
              onClick={handleUserLogin}
              className="flex items-center gap-3 w-full px-6 py-4 font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors border-l-4 border-transparent"
            >
              <User className="h-5 w-5 text-slate-400" />
              Continue as User Login
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
