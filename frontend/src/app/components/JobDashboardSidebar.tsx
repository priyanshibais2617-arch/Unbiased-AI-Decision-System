import { useState } from "react";
import { 
  ProfileIcon, 
  ResumeStatusIcon, 
  AnalysisIcon, 
  HistoryIcon, 
  SettingsAppIcon, 
  LogoutIcon, 
  EditProfileIcon, 
  SecurityIcon, 
  NotificationIcon, 
  ReferenceIcon, 
  ResumePrefsIcon, 
  JobPrefsIcon, 
  AppearanceIcon, 
  HelpIcon,
  GradientDefs
} from "./JobDashboardIconsPack";
import { UserCog } from "lucide-react";

export function JobDashboardSidebar() {
  const [activeSection, setActiveSection] = useState("profile");

  const dashboardIcons = [
    { id: "profile", label: "Basic Profile", icon: ProfileIcon },
    { id: "status", label: "Resume Status", icon: ResumeStatusIcon },
    { id: "analysis", label: "Analysis Summary", icon: AnalysisIcon },
    { id: "history", label: "History Section", icon: HistoryIcon },
    { id: "settings", label: "Settings", icon: SettingsAppIcon },
  ];

  const settingsIcons = [
    { id: "edit-profile", label: "Edit Profile Info", icon: EditProfileIcon },
    { id: "security", label: "Security Settings", icon: SecurityIcon },
    { id: "notifications", label: "Notifications", icon: NotificationIcon },
    { id: "reference", label: "References", icon: ReferenceIcon },
    { id: "resume-prefs", label: "Resume Preferences", icon: ResumePrefsIcon },
    { id: "job-prefs", label: "Job Preferences", icon: JobPrefsIcon },
    { id: "appearance", label: "Appearance", icon: AppearanceIcon },
    { id: "help", label: "Help & Support", icon: HelpIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-50/50">
      <GradientDefs />
      {/* 
        This is a standalone React + Tailwind Sidebar Component 
        with all the requested AI-themed icons and hover effects.
      */}
      <aside className="w-80 h-full bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* Header Label */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/20">
              <ProfileIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 tracking-tight">AI Jobs</h2>
              <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Portal</p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          
          {/* Main Dashboard Section */}
          <div className="mb-8">
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 px-2">Dashboard</p>
            <nav className="space-y-2">
              {dashboardIcons.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-300 group relative ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm border border-blue-100/50" 
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && (
                       <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    )}

                    <div className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm ${
                      isActive 
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-purple-500/30 scale-110" 
                        : "bg-white border border-gray-100 text-gray-400 group-hover:scale-105 group-hover:border-blue-200 group-hover:shadow-md"
                    }`}>
                      <div className={`transition-colors duration-300 ${isActive ? '[&>svg]:stroke-white' : '[&>svg]:stroke-[url(#ai-gradient)]'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <span className={`font-semibold text-sm transition-colors ${isActive ? "text-blue-900" : "text-gray-600 group-hover:text-gray-900"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

          {/* Settings Section */}
          <div>
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 px-2">Settings Panel</p>
            <nav className="space-y-2">
              {settingsIcons.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-300 group relative ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm border border-blue-100/50" 
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                     {isActive && (
                       <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    )}

                    <div className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm ${
                      isActive 
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-purple-500/30 scale-110" 
                        : "bg-white border border-gray-100 text-gray-400 group-hover:scale-105 group-hover:border-blue-200 group-hover:shadow-md"
                    }`}>
                      <div className={`transition-colors duration-300 ${isActive ? '[&>svg]:stroke-white' : '[&>svg]:stroke-[url(#ai-gradient)]'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <span className={`font-semibold text-sm transition-colors ${isActive ? "text-purple-900" : "text-gray-600 group-hover:text-gray-900"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

        {/* Footer / Logout */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/30">
          <button className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-rose-50 transition-all duration-300 group border border-transparent hover:border-rose-100">
            <div className="p-2.5 rounded-xl bg-white text-gray-400 border border-gray-100 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-rose-100 group-hover:border-rose-200">
              <LogoutIcon className="h-5 w-5 text-rose-500 group-hover:text-rose-600 mb-0" />
            </div>
            <span className="font-semibold text-gray-600 text-sm group-hover:text-rose-700 transition-colors">Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (Placeholder for Context) */}
      <main className="flex-1 p-10 flex flex-col items-center justify-center text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[2rem] shadow-xl border border-gray-100 ring-4 ring-gray-50">
          <div className="h-20 w-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner ring-1 ring-white">
            <UserCog className="h-10 w-10 text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Active Section: <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 capitalize">{activeSection.replace('-', ' ')}</span></h1>
          <p className="text-gray-500 font-medium">Select items from the sidebar to test out the modern AI-themed hover effects and active states.</p>
        </div>
      </main>
    </div>
  );
}
