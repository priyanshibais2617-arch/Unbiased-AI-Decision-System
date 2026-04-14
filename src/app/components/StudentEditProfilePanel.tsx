import { ArrowLeft, Camera, Check, Shield, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useState } from "react";

export function StudentEditProfilePanel({ onBack }: { onBack: () => void }) {
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10 animate-in slide-in-from-right-full duration-300">
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 text-white flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold">Edit Profile</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
        {showToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4 z-50">
            <Check className="h-4 w-4 text-teal-400" /> Profile updated successfully
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-5">
           <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-700">Profile Completion</span>
              <span className="text-sm font-bold text-teal-600">92%</span>
           </div>
           <Progress value={92} className="h-2 [&>div]:bg-teal-500 bg-slate-100" />
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer">
            <div className="h-24 w-24 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-3xl font-black shadow-md border-4 border-white">
              AR
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-2 hover:text-teal-600 cursor-pointer">Change Photo</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
            <input type="text" defaultValue="Aisha Rahman" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
          </div>
          
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-slate-500 ml-1">Email ID</label>
            <div className="relative">
              <input type="email" defaultValue="aisha.r@university.edu" readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">
                <Shield className="h-3 w-3" /> Verified
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1">Phone Number</label>
            <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1">Institution Name</label>
            <input type="text" defaultValue="Global Tech University" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">Course / Stream</label>
              <input type="text" defaultValue="B.Tech CS" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">Year / Semester</label>
              <input type="text" defaultValue="3rd Year / 6th Sem" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
            </div>
          </div>
        </div>

      </div>
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <Button onClick={handleSave} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 rounded-xl text-sm shadow-sm">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
