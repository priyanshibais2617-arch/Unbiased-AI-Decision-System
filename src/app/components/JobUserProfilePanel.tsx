import { X, User, Mail, Phone, MapPin, UploadCloud, FileText, Target, Award, List, Bookmark, Settings, LogOut, Download, Activity, CheckCircle2, AlertCircle, ChevronRight, Share, Zap, Shield, Bell, Globe, Briefcase, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

export function JobUserProfilePanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Slide-in Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out`}>
        
        {/* Header & Avatar */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-6 text-white relative flex-shrink-0 z-10 shadow-lg">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4 mt-2 relative">
             {/* Avatar with Progress Ring */}
             <div className="relative h-18 w-18 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                   <circle cx="36" cy="36" r="34" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                   <circle cx="36" cy="36" r="34" stroke="#A78BFA" strokeWidth="3" fill="none" strokeDasharray="213" strokeDashoffset="42.6" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="h-14 w-14 rounded-full bg-white text-indigo-700 flex items-center justify-center text-xl font-black shadow-lg z-10">
                   VK
                </div>
             </div>
             <div>
                <h2 className="text-xl font-bold tracking-tight">Vikram Kumar</h2>
                <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mt-1">
                   <Mail className="h-3 w-3 text-indigo-300" /> vikram.k@example.com
                </div>
                <div className="flex items-center gap-2 text-indigo-100 text-[11px] mt-0.5 opacity-80 font-mono">
                   <Phone className="h-3 w-3" /> +91 98765 43210 <span className="mx-1">•</span> <MapPin className="h-3 w-3" /> Bangalore, IN
                </div>
             </div>
          </div>
          
          <div className="mt-5 bg-white/10 backdrop-blur-md rounded-xl p-3 flex justify-between items-center border border-white/20">
             <div>
                <div className="flex items-center gap-2">
                   <p className="text-[11px] uppercase tracking-wider font-bold text-indigo-200">Profile Strength</p>
                   <Badge className="bg-purple-500/30 text-purple-100 hover:bg-purple-500/30 border-purple-400/40 text-[9px] py-0 px-1.5 h-4 flex items-center gap-1 shadow-inner rounded"><Zap className="h-3 w-3 text-yellow-300" fill="currentColor"/> AI Analyzed Profile</Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                   <p className="font-black text-sm">80%</p>
                   <p className="text-[10px] text-indigo-200">+20% needed for top tier</p>
                </div>
             </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 space-y-5 pt-5 px-5 relative z-0">
           
           {/* Section 2: Resume Status */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="p-4 bg-indigo-50/50 flex justify-between items-start border-b border-indigo-50">
                 <div>
                    <h3 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">Resume Status</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><FileText className="h-4 w-4 text-indigo-600" /> Resume_Vikram_V4.pdf</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Last updated: 2 days ago</span>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">AI Score</span>
                    <span className="text-base font-black text-indigo-600">85/100</span>
                 </div>
              </div>
              <div className="p-3">
                 <Button variant="outline" className="w-full text-xs font-bold border-dashed border-2 border-slate-200 text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl transition-all shadow-sm">
                    <UploadCloud className="h-4 w-4 mr-2" /> Update Resume
                 </Button>
              </div>
           </div>

           {/* Section 3: AI Analysis Summary */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute right-0 top-0 h-full w-1 bg-purple-500 rounded-r-2xl"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Activity className="h-4 w-4"/> AI Market Analysis</h3>
              
              <div className="flex items-center gap-4 mb-4">
                 <div className="h-16 w-16 rounded-full bg-purple-50 border-4 border-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-black text-purple-700">75%</span>
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight mb-1">Overall Match Score</p>
                    <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">"Your profile matches 75% of the average requirements for Senior React Developer roles."</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Skills Match</span>
                       <span className="text-[10px] font-bold text-slate-700">8/10 matched</span>
                    </div>
                    <Progress value={80} className="h-1.5 [&>div]:bg-green-500 bg-slate-100" />
                 </div>
                 
                 <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Recommended to Learn</span>
                    <div className="flex flex-wrap gap-1.5">
                       <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50"><AlertCircle className="h-3 w-3 mr-1" /> GraphQL</Badge>
                       <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50"><AlertCircle className="h-3 w-3 mr-1" /> AWS Services</Badge>
                    </div>
                 </div>
              </div>
           </div>

           {/* Section 4: Application History */}
           <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><List className="h-4 w-4"/> Recent Applications</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-4">
                 <div className="flex gap-3 relative border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                       <Share className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                       <p className="text-xs font-bold text-slate-800">Frontend Lead</p>
                       <p className="text-[10px] font-medium text-slate-500">TechCorp Solutions • Applied 2d ago</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-0 shadow-none text-[9px] uppercase tracking-wider h-fit shrink-0">Under Review</Badge>
                 </div>
                 <div className="flex gap-3 relative border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="h-10 w-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                       <Share className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                       <p className="text-xs font-bold text-slate-800">Senior UI Engineer</p>
                       <p className="text-[10px] font-medium text-slate-500">InnovateX Inc • Applied 1w ago</p>
                    </div>
                    <Badge className="bg-rose-100 text-rose-700 border-0 shadow-none text-[9px] uppercase tracking-wider h-fit shrink-0">Rejected</Badge>
                 </div>
              </div>
           </div>

           {/* Section 5: Saved Jobs / Recommendations */}
           <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Bookmark className="h-4 w-4"/> AI Recommended For You</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-4 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 bg-purple-50 rounded-bl-xl border-b border-l border-purple-100">
                   <Target className="h-4 w-4 text-purple-500" />
                 </div>
                 
                 <div className="pr-8">
                    <p className="text-xs font-bold text-slate-800">Principal React Developer</p>
                    <p className="text-[10px] font-medium text-slate-500">Fintech Global • ₹30L - ₹45L</p>
                 </div>
                 
                 <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2">
                       <Badge className="bg-green-100 text-green-700 border-0 text-[9px] shadow-none">92% Match</Badge>
                       <span className="text-[10px] text-slate-400 font-medium">Remote</span>
                    </div>
                    <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold shadow-sm">Quick Apply</Button>
                 </div>
              </div>
           </div>

           <div className="h-px bg-slate-200 w-full"></div>

           {/* Section 6: Settings Section */}
           <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Settings className="h-4 w-4"/> Settings & Preferences</h3>
              <div className="space-y-1 bg-white rounded-2xl p-2 border border-slate-100 shadow-sm">
                 <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all group border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                       <User className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-xs font-semibold">Edit Profile Info</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all group border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                       <Shield className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-xs font-semibold">Security Settings</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all group border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                       <Bell className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-xs font-semibold">Notifications</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all group border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                       <Globe className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-xs font-semibold">Language</span>
                    </div>
                    <div className="flex gap-1">
                       <span className="text-[9px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded">EN</span>
                       <span className="text-[9px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">HI</span>
                    </div>
                 </button>
                 <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all group border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                       <FileText className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-xs font-semibold">Resume Preferences</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all group border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                       <Briefcase className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-xs font-semibold">Job Preferences</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all group border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                       <HelpCircle className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                       <span className="text-xs font-semibold">Help & Support</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
              </div>
           </div>

        </div>

        {/* Section 7: Action Buttons (Footer) */}
        <div className="flex-shrink-0 p-5 bg-white border-t border-slate-100 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10">
           <div className="flex gap-3">
              <Button className="flex-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold border-0 shadow-none text-xs h-10 rounded-xl border border-purple-100">
                 <Target className="h-4 w-4 mr-1.5" /> Full Analysis
              </Button>
              <Button className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200 text-xs h-10 rounded-xl border border-indigo-700">
                 <Download className="h-4 w-4 mr-1.5" /> Resume Report
              </Button>
           </div>
           <Button variant="outline" className="w-full h-10 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition-colors border-rose-100">
              <LogOut className="h-4 w-4" /> Logout from Session
           </Button>
        </div>

      </div>
    </>
  );
}
