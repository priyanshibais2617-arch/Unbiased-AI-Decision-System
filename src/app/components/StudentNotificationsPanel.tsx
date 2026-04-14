import { ArrowLeft, BookOpen, GraduationCap, Sparkles, Award, Mail, AppWindow } from "lucide-react";
import { useState } from "react";

export function StudentNotificationsPanel({ onBack }: { onBack: () => void }) {
  const [toggles, setToggles] = useState({
    assignments: true,
    evaluations: true,
    aiFeedback: true,
    certificates: false
  });
  const [delivery, setDelivery] = useState({
    email: true,
    inApp: true
  });

  const toggleSetting = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const toggleDelivery = (key: keyof typeof delivery) => {
    setDelivery(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10 animate-in slide-in-from-right-full duration-300">
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 text-white flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold">Notifications</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
        
        {/* Alerts Configuration */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Notification Types</h3>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Assignment Updates</p>
                  <p className="text-[10px] text-slate-500">New assignments, deadlines</p>
                </div>
              </div>
              <button onClick={() => toggleSetting('assignments')} className={`w-10 h-5 rounded-full transition-colors relative ${toggles.assignments ? 'bg-teal-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${toggles.assignments ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><GraduationCap className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Evaluation Results</p>
                  <p className="text-[10px] text-slate-500">Grades, scores, feedback</p>
                </div>
              </div>
              <button onClick={() => toggleSetting('evaluations')} className={`w-10 h-5 rounded-full transition-colors relative ${toggles.evaluations ? 'bg-teal-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${toggles.evaluations ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Sparkles className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">AI Feedback Alerts</p>
                  <p className="text-[10px] text-slate-500">Instant AI analysis complete</p>
                </div>
              </div>
              <button onClick={() => toggleSetting('aiFeedback')} className={`w-10 h-5 rounded-full transition-colors relative ${toggles.aiFeedback ? 'bg-teal-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${toggles.aiFeedback ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Award className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Certificate Notifications</p>
                  <p className="text-[10px] text-slate-500">Earned badges & certificates</p>
                </div>
              </div>
              <button onClick={() => toggleSetting('certificates')} className={`w-10 h-5 rounded-full transition-colors relative ${toggles.certificates ? 'bg-teal-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${toggles.certificates ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>
        </div>

        {/* Delivery Methods */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Delivery Methods</h3>
          <div className="flex flex-col gap-3">
            <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${delivery.email ? 'border-teal-200 bg-teal-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <Mail className={`h-4 w-4 ${delivery.email ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-semibold ${delivery.email ? 'text-teal-900' : 'text-slate-700'}`}>Email Notifications</span>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${delivery.email ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}>
                {delivery.email && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
            </label>

            <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${delivery.inApp ? 'border-teal-200 bg-teal-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <AppWindow className={`h-4 w-4 ${delivery.inApp ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-semibold ${delivery.inApp ? 'text-teal-900' : 'text-slate-700'}`}>In-App Notifications</span>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${delivery.inApp ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}>
                {delivery.inApp && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
