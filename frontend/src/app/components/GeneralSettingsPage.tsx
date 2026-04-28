import { useState } from "react";
import { ArrowLeft, Sun, Moon, LayoutGrid, LayoutList, Type, Globe, CheckCircle2, Save, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "./UserContext";
import { Button } from "./ui/button";

export function GeneralSettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme, density, setDensity, fontSize, setFontSize, language, setLanguage } = useUser();
  const [saveMessage, setSaveMessage] = useState("");

  const handleSave = () => {
    setSaveMessage("Settings saved successfully.");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-800 shadow-sm rounded-lg">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">System Settings</h1>
              <p className="text-xs text-slate-500 font-medium">Manage your display and localization preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Appearance Settings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-indigo-500" /> Appearance
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Theme */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                >
                  <Sun className="h-6 w-6 mb-2" />
                  <span className="text-xs font-bold">Light Mode</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-indigo-500 bg-slate-800 text-indigo-400' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                >
                  <Moon className="h-6 w-6 mb-2" />
                  <span className="text-xs font-bold">Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Layout Density */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">UI Density</h3>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button 
                  onClick={() => setDensity('comfortable')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-all ${density === 'comfortable' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 font-medium hover:text-slate-700'}`}
                >
                  <LayoutGrid className="h-4 w-4" /> <span className="text-sm">Comfortable</span>
                </button>
                <button 
                  onClick={() => setDensity('compact')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-all ${density === 'compact' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 font-medium hover:text-slate-700'}`}
                >
                  <LayoutList className="h-4 w-4" /> <span className="text-sm">Compact</span>
                </button>
              </div>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 mt-6">Font Size</h3>
              <div className="flex gap-3">
                {[
                  { id: 'small', label: 'Small' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'large', label: 'Large' }
                ].map(font => (
                  <button 
                    key={font.id}
                    onClick={() => setFontSize(font.id as any)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${fontSize === font.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                  >
                    <Type className={`${fontSize === font.id ? 'text-indigo-600' : 'text-slate-400'} ${font.id === 'small'? 'h-3':'h-5'}`} />
                    <span className={`font-bold ${fontSize === font.id ? 'text-indigo-800' : 'text-slate-600'} text-xs`}>{font.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Language Preferences */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Globe className="h-5 w-5 text-teal-500" /> Language Preferences
          </h2>
          <div className="space-y-4 max-w-xl">
            <button 
              onClick={() => setLanguage('en')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${language === 'en' ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">🇺🇸</div>
                <div className="text-left">
                  <h3 className={`text-base font-bold ${language === 'en' ? 'text-teal-900' : 'text-slate-800'}`}>English (US)</h3>
                  <p className="text-sm text-slate-500">Default global language</p>
                </div>
              </div>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center ${language === 'en' ? 'text-teal-500' : 'text-slate-200'}`}>
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </button>

            <button 
              onClick={() => setLanguage('hi')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${language === 'hi' ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">🇮🇳</div>
                <div className="text-left">
                  <h3 className={`text-base font-bold ${language === 'hi' ? 'text-teal-900' : 'text-slate-800'}`}>हिंदी (Hindi)</h3>
                  <p className="text-sm text-slate-500">Local language support</p>
                </div>
              </div>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center ${language === 'hi' ? 'text-teal-500' : 'text-slate-200'}`}>
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4 mt-8 pt-4 border-t border-slate-200">
          {saveMessage && <span className="text-emerald-600 font-bold text-sm animate-in fade-in">{saveMessage}</span>}
          <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-12 font-bold shadow-md">
            <Save className="h-4 w-4 mr-2" /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
