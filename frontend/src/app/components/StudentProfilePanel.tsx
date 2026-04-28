import { useState, useEffect } from "react";
import { X, User, Mail, GraduationCap, Building, Trophy, Target, PlayCircle, Award, Compass, Search, TrendingUp, Settings, LogOut, ChartBar, CheckCircle, Clock, Shield, Bell, HelpCircle, Palette, Globe, ChevronRight, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { StudentEditProfilePanel } from "./StudentEditProfilePanel";
import { StudentSecurityPanel } from "./StudentSecurityPanel";
import { StudentNotificationsPanel } from "./StudentNotificationsPanel";
import { StudentHelpPanel } from "./StudentHelpPanel";

export function StudentProfilePanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSettingPanel, setActiveSettingPanel] = useState<string | null>(null);
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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }} onClick={handleClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out" style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>
        
        {/* Header & Avatar */}
        <div className="bg-gradient-to-br from-teal-500 to-indigo-600 p-6 text-white relative flex-shrink-0">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4 mt-4">
             <div className="h-16 w-16 rounded-full bg-white text-teal-600 flex items-center justify-center text-xl font-black shadow-lg ring-4 ring-white/20">
                AR
             </div>
             <div>
                <h2 className="text-xl font-bold tracking-tight">Aisha Rahman</h2>
                <div className="flex items-center gap-2 text-teal-100 text-sm font-medium mt-1">
                   <Mail className="h-3 w-3" /> aisha.r@university.edu
                </div>
             </div>
          </div>
          
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-3 flex justify-between items-center border border-white/20">
             <div>
                <p className="text-xs uppercase tracking-wider font-bold text-teal-100">Profile Strength</p>
                <p className="font-bold">92% Completed</p>
             </div>
             <Progress value={92} className="w-24 h-2 [&>div]:bg-white bg-teal-800/50" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 custom-scrollbar pb-6">
           
           {/* Section: Academic Overview */}
           <div className="p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Building className="h-4 w-4"/> Academic Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center transition-all hover:shadow-md">
                    <span className="text-3xl font-black text-slate-800 tracking-tighter">42</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mt-1"><FileText className="h-3 w-3" /> Total Assignments</span>
                 </div>
                 <div className="grid grid-rows-2 gap-3">
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center transition-all hover:shadow-md">
                       <div>
                          <span className="text-xs font-bold uppercase text-slate-400 block mb-0.5">Average</span>
                          <span className="text-lg font-black text-teal-600">88.5%</span>
                       </div>
                       <ChartBar className="h-6 w-6 text-teal-100" />
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center transition-all hover:shadow-md">
                       <div>
                          <span className="text-xs font-bold uppercase text-slate-400 block mb-0.5">Status</span>
                          <span className="text-sm font-black text-indigo-600">Advanced</span>
                       </div>
                       <Target className="h-6 w-6 text-indigo-100" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Section: Learning Progress */}
           <div className="px-5 pb-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4"/> Learning Progress</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-4">
                 <div>
                    <div className="flex justify-between text-sm mb-1.5"><span className="font-semibold text-slate-700">Advanced Syntax</span><span className="font-bold text-slate-900">85%</span></div>
                    <Progress value={85} className="h-1.5 [&>div]:bg-teal-500 bg-slate-100" />
                 </div>
                 <div>
                    <div className="flex justify-between text-sm mb-1.5"><span className="font-semibold text-slate-700">Analytical Structuring</span><span className="font-bold text-slate-900">60%</span></div>
                    <Progress value={60} className="h-1.5 [&>div]:bg-indigo-500 bg-slate-100" />
                 </div>
                 <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><CheckCircle className="h-3.5 w-3.5 text-teal-500"/> 12 Completed</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Clock className="h-3.5 w-3.5 text-amber-500"/> 3 Pending</div>
                 </div>
              </div>
           </div>

           {/* Section: AI Evaluation Summary */}
           <div className="px-5 pb-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Target className="h-4 w-4"/> AI Evaluation Summary</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                 <div className="flex justify-between items-start mb-3">
                    <div>
                       <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Last Evaluated Base</span>
                       <span className="text-sm font-bold text-slate-800">Advanced Grammar Assessment</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-bold">92/100</Badge>
                 </div>
                 <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium leading-relaxed">
                    "Sophisticated use of transitions. Minor pacing issues in the conclusion. Strong overall adherence to the rubric."
                 </p>
                 <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">👍 Strong Structure</Badge>
                    <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">👍 Grammatically Sound</Badge>
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">⚠️ Word Choice</Badge>
                 </div>
              </div>
           </div>

           {/* Section: Achievements */}
           <div className="px-5 pb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Award className="h-4 w-4"/> Certificates & Achievements</h3>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                 <div className="shrink-0 w-[140px] bg-amber-50 rounded-2xl p-4 border border-amber-100 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                    <Trophy className="h-8 w-8 text-amber-500 mb-2" />
                    <span className="text-[11px] font-bold text-amber-900 block leading-tight">Grammar Mastery Certificate</span>
                 </div>
                 <div className="shrink-0 w-[140px] bg-teal-50 rounded-2xl p-4 border border-teal-100 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                    <TrendingUp className="h-8 w-8 text-teal-500 mb-2" />
                    <span className="text-[11px] font-bold text-teal-900 block leading-tight">Top 5% Performer</span>
                 </div>
                 <div className="shrink-0 w-[140px] bg-white rounded-2xl p-4 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors">
                    <Compass className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-[11px] font-bold block leading-tight">View All 12 Badges</span>
                 </div>
              </div>
           </div>

           <div className="h-px bg-slate-200 w-full mb-6"></div>

           {/* Settings Menu */}
           <div className="px-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Settings className="h-4 w-4"/> System Settings</h3>
              <div className="space-y-1">
                 <button onClick={() => setActiveSettingPanel('editProfile')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-teal-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                       <User className="h-4 w-4 text-slate-400 group-hover:text-teal-500" />
                       <span className="text-sm font-semibold">Edit Profile Info</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button onClick={() => setActiveSettingPanel('security')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-teal-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                       <Shield className="h-4 w-4 text-slate-400 group-hover:text-teal-500" />
                       <span className="text-sm font-semibold">Security Settings</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button onClick={() => setActiveSettingPanel('notifications')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-teal-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                       <Bell className="h-4 w-4 text-slate-400 group-hover:text-teal-500" />
                       <span className="text-sm font-semibold">Notifications</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button onClick={() => setActiveSettingPanel('help')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-teal-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                       <HelpCircle className="h-4 w-4 text-slate-400 group-hover:text-teal-500" />
                       <span className="text-sm font-semibold">Help & Support</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
              </div>
           </div>

        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-5 bg-white border-t border-slate-100 relative z-0">
           <Button variant="outline" className="w-full h-12 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center gap-2 font-bold shadow-sm transition-colors">
              <LogOut className="h-4 w-4" /> Sign Out
           </Button>
        </div>

        {/* Sub-panels conditionally rendered on top via absolute positioning */}
        {activeSettingPanel === 'editProfile' && <StudentEditProfilePanel onBack={() => setActiveSettingPanel(null)} />}
        {activeSettingPanel === 'security' && <StudentSecurityPanel onBack={() => setActiveSettingPanel(null)} />}
        {activeSettingPanel === 'notifications' && <StudentNotificationsPanel onBack={() => setActiveSettingPanel(null)} />}
        {activeSettingPanel === 'help' && <StudentHelpPanel onBack={() => setActiveSettingPanel(null)} />}

      </div>
    </>
  );
}
