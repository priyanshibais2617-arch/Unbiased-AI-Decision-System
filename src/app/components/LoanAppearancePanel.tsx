import { ArrowLeft, Sun, Moon, LayoutGrid, LayoutList, Type } from "lucide-react";
import { useState } from "react";

export function LoanAppearancePanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [density, setDensity] = useState("comfortable");
  const [fontSize, setFontSize] = useState("medium");

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="bg-gradient-to-br from-indigo-800 to-purple-900 p-6 text-white relative flex-shrink-0 shadow-lg">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <div className="mt-2 text-white">
             <h2 className="text-xl font-bold tracking-tight">Appearance</h2>
             <p className="text-indigo-200 text-sm mt-0.5">Customize your dashboard look & feel</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all border-indigo-500 bg-indigo-50 text-indigo-700`}
              >
                <Sun className="h-6 w-6 mb-2" />
                <span className="text-xs font-bold">Light Mode</span>
                <span className="text-[9px] mt-1 uppercase font-bold tracking-wider text-indigo-400">Current</span>
              </button>
              <button 
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 text-slate-400 cursor-not-allowed`}
              >
                <Moon className="h-6 w-6 mb-2" />
                <span className="text-xs font-bold">Dark Mode</span>
                <span className="text-[9px] mt-1 uppercase font-bold tracking-wider opacity-60">Not Available</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">UI Density</h3>
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl">
              <button 
                onClick={() => setDensity('comfortable')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${density === 'comfortable' ? 'bg-white shadow border border-slate-200 font-bold text-indigo-700' : 'text-slate-500 font-semibold hover:text-slate-800'}`}
              >
                <LayoutGrid className="h-4 w-4" /> <span className="text-sm">Comfortable</span>
              </button>
              <button 
                onClick={() => setDensity('compact')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${density === 'compact' ? 'bg-white shadow border border-slate-200 font-bold text-indigo-700' : 'text-slate-500 font-semibold hover:text-slate-800'}`}
              >
                <LayoutList className="h-4 w-4" /> <span className="text-sm">Compact</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
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
                  className={`flex-1 py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${fontSize === font.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <Type className={`${fontSize === font.id ? 'text-indigo-600' : 'text-slate-400'} ${font.id === 'small'? 'h-4': font.id === 'medium' ? 'h-5' : 'h-6'}`} />
                  <span className={`font-bold ${fontSize === font.id ? 'text-indigo-800' : 'text-slate-600'} text-xs mt-1`}>{font.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
