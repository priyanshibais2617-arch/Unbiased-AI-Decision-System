import { useState } from "react";
import { X, User, Mail, Phone, Calendar, Building, CreditCard, PieChart, ShieldCheck, Clock, Settings, Lock, Bell, Globe, HelpCircle, LogOut, Download, FileText, Activity, AlertTriangle, TrendingUp, CheckCircle, ChevronRight, Check, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { SecuritySettingsPanel } from "./SecuritySettingsPanel";
import { LoanEditProfilePanel } from "./LoanEditProfilePanel";
import { LoanNotificationsPanel } from "./LoanNotificationsPanel";
import { LoanLanguagePanel } from "./LoanLanguagePanel";
import { LoanAppearancePanel } from "./LoanAppearancePanel";
import { LoanHelpPanel } from "./LoanHelpPanel";

export function LoanUserProfilePanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isSecuritySettingsOpen, setIsSecuritySettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out`}>
        
        {/* Header & Avatar */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-6 text-white relative flex-shrink-0">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4 mt-2">
             <div className="h-16 w-16 rounded-full bg-white text-indigo-700 flex items-center justify-center text-xl font-black shadow-lg ring-4 ring-white/20">
                VK
             </div>
             <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">Vikram Kumar <ShieldCheck className="h-4 w-4 text-green-400" /></h2>
                <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mt-1">
                   <Mail className="h-3 w-3" /> vikram.k@example.com
                </div>
                <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mt-0.5">
                   <Phone className="h-3 w-3" /> +91 98765 43210
                </div>
             </div>
          </div>
          
          <div className="mt-5 bg-white/10 backdrop-blur-md rounded-xl p-3 flex justify-between items-center border border-white/20">
             <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-indigo-200">Profile Completion</p>
                <div className="flex items-center gap-2 mt-0.5">
                   <p className="font-bold text-sm">85%</p>
                   <Badge className="bg-green-500/20 text-green-200 hover:bg-green-500/20 border-green-400/30 text-[10px] py-0 px-1.5 h-4 flex items-center">AI Verified</Badge>
                </div>
             </div>
             <Progress value={85} className="w-24 h-2 [&>div]:bg-white bg-indigo-900/50" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 custom-scrollbar pb-6 space-y-5 pt-5">
           
           {/* Section 1: Basic Profile Info (PAN/Aadhaar) */}
           <div className="px-5">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">PAN Card</span>
                       <span className="text-sm font-semibold text-slate-800">ABCPE****F</span>
                    </div>
                    <div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Aadhaar</span>
                       <span className="text-sm font-semibold text-slate-800">XXXX XXXX 1234</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Section 2: Financial Overview */}
           <div className="px-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4"/> Financial Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Monthly Income</span>
                    <span className="text-xl font-black text-slate-800 tracking-tight">₹5,39,500</span>
                 </div>
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Existing EMI</span>
                    <span className="text-xl font-black text-amber-600 tracking-tight">₹41,500</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                 <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                       <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Credit Score</span>
                       <span className="text-base font-black text-green-600">785</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-bold text-[10px]">Excellent</Badge>
                 </div>
                 <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                       <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">DTI Ratio</span>
                       <span className="text-base font-black text-indigo-600">8.5%</span>
                    </div>
                    <PieChart className="h-5 w-5 text-indigo-200" />
                 </div>
              </div>
           </div>

           {/* Section 3: Loan Application Status */}
           <div className="px-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Activity className="h-4 w-4"/> Current Application</h3>
              <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-sm border border-indigo-100 p-4">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <span className="text-[10px] font-bold uppercase text-indigo-500 block mb-0.5">Status</span>
                       <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-500" /> Approved</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Approval Chance</span>
                       <span className="text-sm font-black text-slate-800">92%</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center pt-3 border-t border-indigo-100/50">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Risk Level</span>
                       <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg w-fit">Low Risk</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">Updated: 2 hrs ago</span>
                 </div>
              </div>
           </div>

           {/* Section 4: AI Insights Summary */}
           <div className="px-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4"/> AI Insights Summary</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                 <p className="text-xs text-slate-600 mb-4 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 font-medium leading-relaxed italic">
                    "Your profile shows strong repayment capacity with low risk. Income stability and low EMI load are key strengths."
                 </p>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2">
                       <Check className="h-3.5 w-3.5 text-green-500" /> <span className="text-xs font-semibold text-slate-700">High Income Stability</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Check className="h-3.5 w-3.5 text-green-500" /> <span className="text-xs font-semibold text-slate-700">Low EMI Load</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Check className="h-3.5 w-3.5 text-green-500" /> <span className="text-xs font-semibold text-slate-700">Excellent Credit Behavior</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Section 5: Loan History */}
           <div className="px-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Clock className="h-4 w-4"/> Loan History</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-4">
                 <div className="flex gap-3 relative">
                    <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-100"></div>
                    <div className="z-10 bg-green-100 p-1 rounded-full h-6 w-6 flex items-center justify-center shrink-0">
                       <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-800">Auto Loan Approved</p>
                       <p className="text-[10px] font-semibold text-slate-400">₹8,00,000 • HDFC Bank</p>
                       <p className="text-[10px] text-slate-400 mt-0.5">Aug 2024</p>
                    </div>
                 </div>
                 <div className="flex gap-3 relative">
                    <div className="z-10 bg-indigo-100 p-1 rounded-full h-6 w-6 flex items-center justify-center shrink-0">
                       <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-800">Personal Loan Closed</p>
                       <p className="text-[10px] font-semibold text-slate-400">₹2,00,000</p>
                       <p className="text-[10px] text-slate-400 mt-0.5">Jan 2023</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="h-px bg-slate-200 w-full"></div>

           {/* Section 6: Settings Section */}
           <div className="px-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Settings className="h-4 w-4"/> Settings</h3>
              <div className="space-y-1">
                 <button onClick={() => setIsEditProfileOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                       <User className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-sm font-semibold">Edit Profile Info</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button onClick={() => setIsSecuritySettingsOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                       <Lock className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-sm font-semibold">Security Settings</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button onClick={() => setIsNotificationsOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                       <Bell className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-sm font-semibold">Notification Preferences</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button onClick={() => setIsLanguageOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                       <Globe className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-sm font-semibold">Language</span>
                    </div>
                    <div className="flex gap-1">
                       <span className="text-[10px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-md">EN</span>
                       <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md hover:bg-slate-300 transition-colors">HI</span>
                    </div>
                 </button>
                 <button onClick={() => setIsAppearanceOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                       <Settings className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-sm font-semibold">Appearance</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button onClick={() => setIsHelpOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                       <HelpCircle className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-sm font-semibold">Help & Support</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
              </div>
           </div>

        </div>

        {/* Section 7: Action Buttons (Footer) */}
        <div className="flex-shrink-0 p-5 bg-white border-t border-slate-100 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <div className="flex gap-3">
              <Button className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 font-bold border-0 shadow-none">
                 <FileText className="h-4 w-4 mr-2" /> Full Report
              </Button>
              <Button className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200">
                 <Download className="h-4 w-4 mr-2" /> Loan Summary
              </Button>
           </div>
           <Button variant="outline" className="w-full h-11 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center gap-2 font-bold shadow-sm transition-colors">
              <LogOut className="h-4 w-4" /> Logout
           </Button>
        </div>
      </div>
      <SecuritySettingsPanel isOpen={isSecuritySettingsOpen} onClose={() => setIsSecuritySettingsOpen(false)} />
      <LoanEditProfilePanel isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <LoanNotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <LoanLanguagePanel isOpen={isLanguageOpen} onClose={() => setIsLanguageOpen(false)} />
      <LoanAppearancePanel isOpen={isAppearanceOpen} onClose={() => setIsAppearanceOpen(false)} />
      <LoanHelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
