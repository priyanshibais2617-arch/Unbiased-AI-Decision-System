import { ArrowLeft, Sun, Moon, LayoutGrid, LayoutList, Type } from "lucide-react";
import { useUser } from "./UserContext";

export function StudentAppearancePanel({ onBack }: { onBack: () => void }) {
  const { theme, setTheme, density, setDensity, fontSize, setFontSize } = useUser();

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10 animate-in slide-in-from-right-full duration-300">
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 text-white flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold">Appearance</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
        
        {/* Theme */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Theme</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
            >
              <Sun className="h-6 w-6 mb-2" />
              <span className="text-xs font-bold">Light Mode</span>
              <span className="text-[9px] mt-1 opacity-70">Default</span>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-teal-500 bg-slate-800 text-teal-400' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
            >
              <Moon className="h-6 w-6 mb-2" />
              <span className="text-xs font-bold">Dark Mode</span>
              <span className="text-[9px] mt-1 opacity-70">Enabled</span>
            </button>
          </div>
        </div>

        {/* UI Density */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">UI Density</h3>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            <button 
              onClick={() => setDensity('comfortable')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${density === 'comfortable' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 font-medium hover:text-slate-700'}`}
            >
              <LayoutGrid className="h-4 w-4" /> <span className="text-xs">Comfortable</span>
            </button>
            <button 
              onClick={() => setDensity('compact')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${density === 'compact' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 font-medium hover:text-slate-700'}`}
            >
              <LayoutList className="h-4 w-4" /> <span className="text-xs">Compact</span>
            </button>
          </div>
        </div>

        {/* Font Size */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Font Size</h3>
          <div className="flex gap-3">
            {[
              { id: 'small', label: 'Small', sizeClass: 'text-xs' },
              { id: 'medium', label: 'Medium', sizeClass: 'text-sm' },
              { id: 'large', label: 'Large', sizeClass: 'text-base' }
            ].map(font => (
              <button 
                key={font.id}
                onClick={() => setFontSize(font.id)}
                className={`flex-1 py-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${fontSize === font.id ? 'border-teal-500 bg-teal-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
              >
                <div className="h-8 flex items-center justify-center">
                  <Type className={`${fontSize === font.id ? 'text-teal-600' : 'text-slate-400'} ${font.id === 'small'? 'h-3':'h-5'}`} />
                </div>
                <span className={`font-bold ${fontSize === font.id ? 'text-teal-800' : 'text-slate-600'} text-xs`}>{font.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
