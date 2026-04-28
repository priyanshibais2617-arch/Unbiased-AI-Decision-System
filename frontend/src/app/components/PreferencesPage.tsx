import React, { useState } from "react";
import { User, FileText, Shield, Bell, HelpCircle, ChevronRight, UploadCloud, Eye, Trash2, Download, Search, AlertCircle, LogOut, CheckCircle, Camera, Lock, Plus, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

export function PreferencesPage() {
  const [activeTab, setActiveTab] = useState<string>("account");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const tabs = [
    { id: "account", label: "Account Profile", icon: User },
    { id: "assets", label: "Asset Management", icon: FileText },
    { id: "privacy", label: "Privacy Core", icon: Shield },
    { id: "alerts", label: "Alerts & Notifications", icon: Bell },
    { id: "help", label: "Help & Guidance", icon: HelpCircle }
  ];

  const handleLogout = () => {
    setShowLogoutModal(false);
    // Add real logout logic here later if needed
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "#F5F7FB" }}>
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        
        <header className="mb-8">
           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Preferences</h1>
           <p className="text-slate-500 font-medium mt-1">Manage your professional identity and workspace settings.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
           {/* Sidebar Menu */}
           <div className="w-full md:w-1/3 flex flex-col gap-6">
              <div className="bg-white rounded-[20px] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-1">
                 {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                       <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${isActive ? 'bg-indigo-50/80 text-indigo-700 shadow-sm' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'} relative overflow-hidden`}
                       >
                          {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-md"></div>}
                          <div className="flex items-center gap-3.5 z-10">
                             <div className={`p-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100/80 text-slate-400 group-hover:bg-white group-hover:text-indigo-500 group-hover:shadow-sm'}`}>
                                <tab.icon className="h-5 w-5" />
                             </div>
                             <span className="font-bold text-[15px]">{tab.label}</span>
                          </div>
                          <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'text-indigo-500 translate-x-1' : 'text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1'}`} />
                       </button>
                    );
                 })}
              </div>

              {/* Sign Out Button */}
              <button 
                 onClick={() => setShowLogoutModal(true)}
                 className="mt-auto flex items-center justify-center gap-2 p-4 rounded-[20px] bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all shadow-md group border border-slate-700"
              >
                 <LogOut className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors" />
                 Secure Sign Out
              </button>
           </div>

           {/* Content Area */}
           <div className="w-full md:w-2/3">
              <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 min-h-[500px]">
                 {activeTab === "account" && <AccountProfile />}
                 {activeTab === "assets" && <AssetManagement />}
                 {activeTab === "privacy" && <PrivacyCore />}
                 {activeTab === "alerts" && <AlertsNotifications />}
                 {activeTab === "help" && <HelpGuidance />}
              </div>
           </div>
        </div>

      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-slate-100 animate-in zoom-in-95 duration-300">
               <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-5 border-4 border-rose-50">
                  <AlertCircle className="h-6 w-6 text-rose-500" />
               </div>
               <h3 className="text-xl font-black text-slate-800 mb-2">Secure Sign Out</h3>
               <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">Are you sure you want to securely sign out of your account? You will need to re-authenticate to access your vault.</p>
               <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl font-bold h-11 border-slate-200" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
                  <Button className="flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold h-11" onClick={handleLogout}>Confirm Out</Button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

// 1. Account Profile
function AccountProfile() {
   const [toast, setToast] = useState(false);
   const [email, setEmail] = useState("alexa.rivers@example.com");
   const [emailError, setEmailError] = useState("");

   const handleSave = () => {
      // Validation logic
      if (!email || !email.includes("@")) {
         setEmailError("Please enter a valid email address.");
         return;
      }
      setEmailError("");
      setToast(true);
      setTimeout(() => setToast(false), 3000);
   };

   return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
         {toast && (
            <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-2 z-10">
               <CheckCircle className="h-4 w-4" /> Profile Details Saved
            </div>
         )}
         
         <h2 className="text-2xl font-black text-slate-800 mb-8">Profile Details Page</h2>
         
         <div className="flex items-center gap-6 mb-8">
            <div className="relative group cursor-pointer">
               <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 text-3xl font-black shadow-inner border border-slate-200">
                  AR
               </div>
               <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
               </div>
               <div className="absolute bottom-0 right-0 bg-indigo-600 h-8 w-8 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                  <Plus className="h-4 w-4 text-white" />
               </div>
            </div>
            <div>
               <h3 className="font-bold text-slate-800 text-lg mb-0.5">Profile Photo</h3>
               <p className="text-sm text-slate-500 font-medium">Upload a new photo (Max 5MB)</p>
            </div>
         </div>

         <div className="space-y-5 max-w-lg">
            <div>
               <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Full Name</label>
               <input type="text" defaultValue="Alexa Rivers" className="mt-1.5 w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all hover:bg-white" />
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Address</label>
               <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1.5 w-full bg-slate-50/50 border ${emailError ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'} rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 transition-all hover:bg-white`} 
               />
               {emailError && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{emailError}</p>}
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Phone Number</label>
               <input type="tel" defaultValue="+1 (555) 000-0000" className="mt-1.5 w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all hover:bg-white" />
            </div>
            
            <div className="pt-2">
               <Button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-bold shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] transition-all">
                  Save Changes
               </Button>
            </div>
         </div>
      </div>
   )
}

// 2. Asset Management
function AssetManagement() {
   const [uploading, setUploading] = useState(false);
   const [progress, setProgress] = useState(0);

   const handleUpload = () => {
      setUploading(true);
      let p = 0;
      const int = setInterval(() => {
         p += 20;
         setProgress(p);
         if (p >= 100) {
            clearInterval(int);
            setTimeout(() => { setUploading(false); setProgress(0); }, 500);
         }
      }, 300);
   };

   return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
         <h2 className="text-2xl font-black text-slate-800 mb-8">Documents / Assets Page</h2>
         
         {/* Upload Zone */}
         <div onClick={handleUpload} className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 rounded-[20px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group mb-8 relative overflow-hidden h-48">
            {uploading && (
               <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            )}
            <div className={`h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 transition-transform duration-300 ${uploading ? 'scale-110 shadow-md' : 'group-hover:scale-110 group-hover:shadow-md'}`}>
               <UploadCloud className={`h-7 w-7 text-indigo-500 ${uploading ? 'animate-bounce' : ''}`} />
            </div>
            <h3 className="font-bold text-slate-800 mb-1.5">{uploading ? 'Uploading your document...' : 'Click or drop files to upload'}</h3>
            <p className="text-xs text-slate-500 font-medium">Supports PDF, DOCX, PNG (Max 10MB)</p>
         </div>

         <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-1.5">Your Vault Files</h3>
            {[
               { name: "Resume_2026_Final.pdf", tag: "Verified", tagColor: "bg-emerald-50 text-emerald-600 border-emerald-100", ext: "PDF" },
               { name: "Identity_Proof.jpg", tag: "Pending", tagColor: "bg-amber-50 text-amber-600 border-amber-100", ext: "IMG" }
            ].map((doc, i) => (
               <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-[16px] hover:border-indigo-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition-all bg-white group gap-4">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 shrink-0">
                        {doc.ext}
                     </div>
                     <div>
                        <h4 className="font-bold text-sm text-slate-800 mb-1 truncate">{doc.name}</h4>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border inline-block ${doc.tagColor}`}>{doc.tag}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                     <button className="p-2.5 hover:bg-indigo-50 text-indigo-500 rounded-lg transition-colors"><Eye className="h-4 w-4" /></button>
                     <button className="p-2.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"><Download className="h-4 w-4" /></button>
                     <button className="p-2.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

// 3. Privacy Core
function PrivacyCore() {
   const [toggles, setToggles] = useState({ vis: true, share: false, ai: true });

   return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800">Privacy Settings Page</h2>
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 shadow-inner">
               <Lock className="h-6 w-6 text-slate-400" />
            </div>
         </div>

         <div className="space-y-4 mb-10">
            <ToggleItem 
               title="Profile Visibility (Public / Private)" 
               desc="Allow external platforms and recruiters to view your verified assets." 
               checked={toggles.vis} 
               onChange={() => setToggles({...toggles, vis: !toggles.vis})} 
            />
            <ToggleItem 
               title="Data Sharing" 
               desc="Opt-in to anonymous usage data sharing to help improve Vault metrics." 
               checked={toggles.share} 
               onChange={() => setToggles({...toggles, share: !toggles.share})} 
            />
            <ToggleItem 
               title="AI Analysis Permission" 
               desc="Grant the AI Ethics Engine permission to parse your profile data." 
               checked={toggles.ai} 
               onChange={() => setToggles({...toggles, ai: !toggles.ai})} 
            />
         </div>

         <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-6">
            <h3 className="font-bold text-slate-800 mb-2 text-sm">Account Security</h3>
            <p className="text-xs text-slate-500 mb-5 font-medium leading-relaxed">Ensure your account uses a secure password. We recommend updating it every 90 days.</p>
            <Button variant="outline" className="rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-white bg-slate-50 shadow-sm h-11 px-6">
               Change Password
            </Button>
         </div>
      </div>
   );
}

// 4. Alerts & Notifications
function AlertsNotifications() {
   const [toggles, setToggles] = useState({ email: true, sms: false, push: true });

   return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
         <h2 className="text-2xl font-black text-slate-800 mb-8">Notification Settings</h2>
         
         <div className="space-y-4 mb-10">
            <ToggleItem 
               title="Email Notifications" 
               desc="Receive account activity, digests, and system warnings directly to your inbox." 
               checked={toggles.email} 
               onChange={() => setToggles({...toggles, email: !toggles.email})} 
            />
            <ToggleItem 
               title="SMS Alerts" 
               desc="Get instantly notified for urgent matters and critical verifications." 
               checked={toggles.sms} 
               onChange={() => setToggles({...toggles, sms: !toggles.sms})} 
            />
            <ToggleItem 
               title="Push Notifications" 
               desc="Receive real-time popup alerts while using the web application." 
               checked={toggles.push} 
               onChange={() => setToggles({...toggles, push: !toggles.push})} 
            />
         </div>

         <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Preview</h3>
         <div className="bg-white border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] rounded-[16px] p-4 flex gap-4 max-w-sm ml-2">
            <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
               <Bell className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
               <h4 className="font-bold text-slate-800 text-sm mb-1">New Match Found!</h4>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">Your resume was just matched with a Senior Developer role with 94% accuracy.</p>
            </div>
         </div>
      </div>
   );
}

// 5. Help & Guidance
function HelpGuidance() {
   const [openFaq, setOpenFaq] = useState<number | null>(0);

   const faqs = [
      { q: "How does the AI verify documents?", a: "The AI cross-references your uploaded documents securely and evaluates them without systemic bias using our ethics engine." },
      { q: "Can I manage multiple resumes?", a: "Yes. In the Asset Management tab, you can upload and tag multiple documents for different contexts." },
      { q: "How do I reset my password?", a: "Navigate to the Privacy Core settings menu, and click on 'Change Password' to trigger the secure reset process." }
   ];

   return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[500px] flex flex-col">
         <h2 className="text-2xl font-black text-slate-800 mb-8">Help Center Page</h2>
         
         <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input type="text" placeholder="Search your issue..." className="w-full bg-slate-50 border border-slate-200 rounded-[16px] pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" />
         </div>

         <div className="space-y-3 mb-10">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-2 pl-1">Frequently Asked Questions</h3>
            {faqs.map((faq, i) => (
               <div key={i} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <button 
                     onClick={() => setOpenFaq(openFaq === i ? null : i)}
                     className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                  >
                     <span className="font-bold text-sm text-slate-800">{faq.q}</span>
                     <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 border-t border-slate-100 opacity-100' : 'max-h-0 opacity-0'}`}>
                     <div className="p-4 bg-slate-50 text-sm text-slate-600 font-medium leading-relaxed">
                        {faq.a}
                     </div>
                  </div>
               </div>
            ))}
         </div>

         <div className="mt-auto pointer-events-none">
            {/* The wrapper handles layout positioning, button is interactive */}
         </div>
         <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-14 font-bold shadow-md text-base mt-auto">
            Contact Support
         </Button>

         {/* Floating Chatbot Icon */}
         <div className="absolute bottom-16 -right-2 md:bottom-2 md:-right-2 h-14 w-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full shadow-[0_8px_25px_rgba(79,70,229,0.4)] border-4 border-white flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all z-10 group">
            <MessageCircle className="h-6 w-6 text-white group-hover:animate-pulse" />
         </div>
      </div>
   );
}

// Reusable UI Component
function ToggleItem({ title, desc, checked, onChange }: { title: string, desc: string, checked: boolean, onChange: () => void }) {
   return (
      <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors bg-white shadow-sm">
         <div className="pr-4">
            <h4 className="font-bold text-sm text-slate-800">{title}</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{desc}</p>
         </div>
         <button 
            onClick={onChange}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none ${checked ? 'bg-indigo-500' : 'bg-slate-200'}`}
         >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
         </button>
      </div>
   )
}
