import { useState } from "react";
import { ArrowLeft, Camera, Check, ShieldCheck, Mail, Phone, Home, Briefcase, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

export function LoanEditProfilePanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="bg-gradient-to-br from-indigo-800 to-purple-900 p-6 text-white relative flex-shrink-0 shadow-lg">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full transition-colors" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="mt-2">
            <h2 className="text-xl font-bold tracking-tight">Edit Profile</h2>
            <p className="text-indigo-200 text-sm mt-0.5">Manage your personal and loan details</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative space-y-6">
          {showToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4 z-50">
              <Check className="h-4 w-4 text-green-400" /> Changes saved successfully
            </div>
          )}

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
             <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Profile Completion</p>
                <div className="flex items-center gap-2">
                   <p className="font-bold text-sm text-slate-800">85%</p>
                   <span className="bg-green-100 text-green-700 border-green-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> AI Verified Profile</span>
                </div>
             </div>
             <Progress value={85} className="w-24 h-2 [&>div]:bg-indigo-600 bg-slate-100" />
          </div>

          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <div className="h-24 w-24 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl font-black shadow-md border-4 border-white">
                VK
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-2 hover:text-indigo-600 cursor-pointer">Change Photo</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <input type="text" defaultValue="Vikram Kumar" className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800" />
                <ArrowLeft className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-0" />
              </div>
            </div>
            
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email ID</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><Mail className="h-4 w-4 text-slate-400" /></div>
                <input type="email" defaultValue="vikram.k@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-24 py-3 text-sm font-medium text-slate-600" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Verified</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><Phone className="h-4 w-4 text-slate-400" /></div>
                <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">PAN / Aadhaar</label>
              <div className="flex gap-3">
                 <div className="relative flex-1">
                   <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><FileText className="h-4 w-4 text-slate-400" /></div>
                   <input type="text" defaultValue="ABCPE****F" className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800" />
                 </div>
                 <div className="relative flex-1">
                   <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><FileText className="h-4 w-4 text-slate-400" /></div>
                   <input type="text" defaultValue="XXXX XXXX 1234" className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800" />
                 </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Home Address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-4"><Home className="h-4 w-4 text-slate-400" /></div>
                <textarea rows={2} defaultValue="Sector 14, Hiranandani Estate, Mumbai, 400076" className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 block">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Employment</label>
                <div className="relative">
                  <select className="appearance-none w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800">
                    <option>Salaried</option>
                    <option>Self-Employed</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Monthly Income</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                  <input type="text" defaultValue="5,39,500" className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800" />
                </div>
              </div>
            </div>
            <div className="h-4"></div>
          </div>
        </div>

        <div className="p-5 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10">
          <Button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl text-sm shadow-md">
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
}
