import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { ChevronDown, User, Menu, X } from "lucide-react";
import logo from "./figma/logo.png";
import { Button } from "./ui/button";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsServicesDropdownOpen(false);
    setIsAdminDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (path: string) => location.pathname === path || (path === '/' && location.pathname === '/home');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setIsServicesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[86px] bg-[#f5f9ff]/95 border-b border-blue-100/70 shadow-[0_2px_18px_rgba(37,99,235,0.06)] backdrop-blur-xl flex items-center px-4 md:px-10">
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between">
        
        {/* Left Section: Branding */}
        <div 
          className="flex items-center cursor-pointer group shrink-0"
          onClick={() => handleNavClick('/')}
        >
          <img 
            src={logo} 
            alt="Unbiased AI" 
            className="h-[58px] md:h-[68px] w-auto object-contain mix-blend-multiply transition-transform group-hover:scale-105" 
          />
        </div>

        {/* Center Section: Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-10">
          <button
            onClick={() => handleNavClick('/')}
            className={`text-[15px] font-black transition-all relative py-1 ${isActive('/') ? 'text-[#0457d8]' : 'text-[#0F172A] hover:text-[#0457d8]'}`}
          >
            Home
            {isActive('/') && <motion.div layoutId="nav-underline" className="absolute -bottom-2 left-0 w-full h-[3px] bg-[#0457d8] rounded-full" />}
          </button>

          <button
            onClick={() => handleNavClick('/services')}
            className={`text-[15px] font-black transition-all relative py-1 flex items-center gap-1.5 ${isActive('/services') ? 'text-[#0457d8]' : 'text-[#0F172A] hover:text-[#0457d8]'}`}
          >
            Services
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => handleNavClick('/about')}
            className={`text-[15px] font-black transition-all relative py-1 ${isActive('/about') ? 'text-[#0457d8]' : 'text-[#0F172A] hover:text-[#0457d8]'}`}
          >
            About
          </button>

          <button
            onClick={() => handleNavClick('/contact')}
            className={`text-[15px] font-black transition-all relative py-1 ${isActive('/contact') ? 'text-[#0457d8]' : 'text-[#0F172A] hover:text-[#0457d8]'}`}
          >
            Contact
          </button>
        </nav>

        {/* Right Section: User Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleNavClick('/login')} 
            className="hidden sm:flex items-center gap-2 text-[#0F172A] hover:text-[#0457d8] font-black text-[15px] px-2 transition-all"
          >
            <User className="h-4 w-4" />
            Continue as User
          </button>
          
          <div className="relative" ref={adminDropdownRef}>
            <Button 
              size="sm" 
              onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
              className="flex items-center gap-2 bg-[#075bea] hover:bg-[#054fd0] text-white rounded-full font-black px-8 h-[50px] shadow-[0_14px_28px_rgba(37,99,235,0.24)] transition-all border-0"
            >
              Continue as Admin
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            <AnimatePresence>
              {isAdminDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-sm z-[60]"
                >
                  <button onClick={() => handleNavClick('/admin/education')} className="w-full text-left px-5 py-4 hover:bg-[#EFF6FF] text-slate-700 hover:text-[#1D4ED8] font-bold transition-colors flex items-center gap-3">
                    <span className="text-[#1D4ED8]">🏫</span> Education Admin
                  </button>
                  <div className="h-px bg-slate-100 mx-4"></div>
                  <button onClick={() => handleNavClick('/admin/loan')} className="w-full text-left px-5 py-4 hover:bg-[#EFF6FF] text-slate-700 hover:text-[#1D4ED8] font-bold transition-colors flex items-center gap-3">
                    <span className="text-[#1D4ED8]">💰</span> Loan Department
                  </button>
                  <div className="h-px bg-slate-100 mx-4"></div>
                  <button onClick={() => handleNavClick('/admin/hr')} className="w-full text-left px-5 py-4 hover:bg-[#EFF6FF] text-slate-700 hover:text-[#1D4ED8] font-bold transition-colors flex items-center gap-3">
                    <span className="text-[#1D4ED8]">💼</span> Job Hiring Admin
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            className="lg:hidden p-2 text-slate-600 hover:text-[#2563EB] rounded-lg hover:bg-slate-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-[75px] left-0 right-0 bg-white border-b border-slate-100 shadow-xl lg:hidden flex flex-col p-6 gap-4 z-40 overflow-hidden"
          >
            <button onClick={() => handleNavClick('/')} className="text-left font-bold text-slate-700 py-2">Home</button>
            <button onClick={() => handleNavClick('/services')} className="text-left font-bold text-slate-700 py-2">Services</button>
            <button onClick={() => handleNavClick('/about')} className="text-left font-bold text-slate-700 py-2">About</button>
            <button onClick={() => handleNavClick('/contact')} className="text-left font-bold text-slate-700 py-2">Contact</button>
            <div className="h-px bg-slate-100 my-2"></div>
            <Button 
              variant="outline" 
              onClick={() => handleNavClick('/login')} 
              className="flex items-center gap-2 justify-center rounded-full h-12"
            >
              <User className="h-4 w-4" /> Continue as User
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
