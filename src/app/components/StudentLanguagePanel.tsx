import { ArrowLeft, Globe, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function StudentLanguagePanel({ onBack }: { onBack: () => void }) {
  const [language, setLanguage] = useState("en");

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10 animate-in slide-in-from-right-full duration-300">
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 text-white flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold">Language Preferences</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
        <div className="absolute top-6 right-6">
          <Globe className="h-24 w-24 text-slate-200/50" />
        </div>

        <div className="relative z-10">
          <p className="text-sm text-slate-500 mb-6 font-medium">Select your preferred language for the dashboard interface and learning materials.</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => setLanguage('en')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${language === 'en' ? 'border-teal-500 bg-teal-50/30 shadow-md scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">🇺🇸</div>
                <div className="text-left">
                  <h3 className={`text-sm font-bold ${language === 'en' ? 'text-teal-900' : 'text-slate-800'}`}>English</h3>
                  <p className="text-xs text-slate-500">Default global language</p>
                </div>
              </div>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${language === 'en' ? 'text-teal-500' : 'text-slate-200'}`}>
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </button>

            <button 
              onClick={() => setLanguage('hi')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${language === 'hi' ? 'border-teal-500 bg-teal-50/30 shadow-md scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">🇮🇳</div>
                <div className="text-left">
                  <h3 className={`text-sm font-bold ${language === 'hi' ? 'text-teal-900' : 'text-slate-800'}`}>हिंदी (Hindi)</h3>
                  <p className="text-xs text-slate-500">Local language support</p>
                </div>
              </div>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${language === 'hi' ? 'text-teal-500' : 'text-slate-200'}`}>
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
