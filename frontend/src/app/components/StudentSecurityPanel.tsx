import { ArrowLeft, Lock, Shield, Smartphone, AlertTriangle, Monitor, LogOut, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useNavigate } from "react-router";

export function StudentSecurityPanel({ onBack }: { onBack: () => void }) {
  const [twoFactor, setTwoFactor] = useState(true);
  const [timeoutSetting, setTimeoutSetting] = useState("15");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10 animate-in slide-in-from-right-full duration-300">
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 text-white flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold">Security Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
        
        {/* Change Password */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock className="h-4 w-4 text-slate-400" /> Change Password</h3>
          <div className="space-y-3">
            <input type="password" placeholder="Current Password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
            <input type="password" placeholder="New Password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
            <input type="password" placeholder="Confirm New Password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
            <Button className="w-full mt-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl h-10 text-xs font-bold">Update Password</Button>
          </div>
        </div>

        {/* 2FA & Session */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Shield className="h-4 w-4 text-green-500" /> Two-Factor Auth</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Extra layer of security</p>
            </div>
            <button 
              onClick={() => setTwoFactor(!twoFactor)}
              className={`w-11 h-6 rounded-full transition-colors relative ${twoFactor ? 'bg-green-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${twoFactor ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">Session Timeout</h3>
            <p className="text-[11px] text-slate-500 mb-3">Auto-logout after inactivity</p>
            <div className="flex gap-2">
              {['5', '15', '30'].map(val => (
                <button 
                  key={val}
                  onClick={() => setTimeoutSetting(val)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${timeoutSetting === val ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                  {val} mins
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Login Activity */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Smartphone className="h-4 w-4 text-slate-400" /> Login Activity</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-50 rounded-lg text-teal-600 shrink-0"><Monitor className="h-4 w-4" /></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Windows PC • Chrome</p>
                <p className="text-[10px] text-slate-500">Active Now • Mumbai, India</p>
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Active</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 shrink-0"><Smartphone className="h-4 w-4" /></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">iPhone 13 • Safari</p>
                <p className="text-[10px] text-slate-500">2 hours ago • Delhi, India</p>
              </div>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full mt-4 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 rounded-xl h-10 text-xs font-bold flex items-center gap-2">
            <LogOut className="h-3 w-3" /> Logout from all devices
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
           <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4" /> Danger Zone</h3>
           <div className="space-y-3">
              <button className="w-full bg-white text-slate-700 border border-slate-200 hover:border-slate-300 py-2.5 rounded-xl text-xs font-bold transition-colors">
                Deactivate Account
              </button>
              
              {showDeleteConfirm ? (
                <div className="bg-white p-3 rounded-xl border border-rose-200 animate-in fade-in">
                  <p className="text-xs text-slate-700 font-medium mb-3">Are you sure? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-bold transition-colors">Cancel</button>
                    <button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">Yes, Delete</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowDeleteConfirm(true)} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm">
                  Delete Account
                </button>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
