import { ArrowLeft, Globe, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export function LoanLanguagePanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [language, setLanguage] = useState("en");
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => { setMounted(false); onClose(); }, 320);
  };

  if (!mounted) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }} onClick={handleClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out" style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>
        <div className="bg-gradient-to-br from-indigo-800 to-purple-900 p-6 text-white relative flex-shrink-0 shadow-lg">
          <button onClick={handleClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <div className="mt-2 text-white">
             <h2 className="text-xl font-bold tracking-tight">Language Preferences</h2>
             <p className="text-indigo-200 text-sm mt-0.5">Choose your application language</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
          <div className="absolute top-6 right-6">
            <Globe className="h-24 w-24 text-slate-200/50" />
          </div>

          <div className="relative z-10 pt-4">
            <div className="space-y-4">
              <button 
                onClick={() => setLanguage('en')}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${language === 'en' ? 'border-indigo-500 bg-white shadow-md' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm opacity-70'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl bg-indigo-50 h-14 w-14 rounded-full flex items-center justify-center">🇺🇸</div>
                  <div className="text-left">
                    <h3 className={`text-base font-bold ${language === 'en' ? 'text-indigo-900' : 'text-slate-800'}`}>English</h3>
                    <p className="text-xs font-semibold text-slate-500">EN - Global Standard</p>
                  </div>
                </div>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${language === 'en' ? 'text-indigo-600' : 'text-slate-200'}`}>
                  <CheckCircle2 className="h-8 w-8" />
                </div>
              </button>

              <button 
                onClick={() => setLanguage('hi')}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${language === 'hi' ? 'border-indigo-500 bg-white shadow-md' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm opacity-70'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl bg-orange-50 h-14 w-14 rounded-full flex items-center justify-center">🇮🇳</div>
                  <div className="text-left">
                    <h3 className={`text-base font-bold ${language === 'hi' ? 'text-indigo-900' : 'text-slate-800'}`}>हिंदी (Hindi)</h3>
                    <p className="text-xs font-semibold text-slate-500">HI - Regional Default</p>
                  </div>
                </div>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${language === 'hi' ? 'text-indigo-600' : 'text-slate-200'}`}>
                  <CheckCircle2 className="h-8 w-8" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
