import { useState, useEffect } from "react";
import { ArrowLeft, Lock, Shield, Activity, Eye, EyeOff, LogOut, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function LoanSecurityPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  // Password fields
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

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

  const handleClose = () => { setVisible(false); setTimeout(() => { setMounted(false); onClose(); }, 320); };

  const handleUpdatePassword = () => {
    if (!pw.current) { toast.error('Enter your current password'); return; }
    if (pw.next.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pw.next !== pw.confirm) { toast.error('Passwords do not match'); return; }
    toast.success('Password updated successfully');
    setPw({ current: '', next: '', confirm: '' });
  };

  const toggleTwoFA = () => {
    const next = !twoFA;
    setTwoFA(next);
    toast.success(next ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled');
  };

  if (!mounted) return null;

  const PwInput = ({ field, label, placeholder }: { field: 'current'|'next'|'confirm'; label: string; placeholder: string }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type={showPw[field] ? 'text' : 'password'}
          value={pw[field]}
          onChange={e => setPw(p => ({ ...p, [field]: e.target.value }))}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        <button type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
          {showPw[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }} onClick={handleClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out" style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-6 text-white relative flex-shrink-0 shadow-lg">
          <button onClick={handleClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="mt-2">
            <h2 className="text-xl font-bold tracking-tight">Security Settings</h2>
            <p className="text-indigo-200 text-sm mt-0.5">Manage your account security</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Lock className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Change Password</h3>
            </div>
            <PwInput field="current" label="Current Password" placeholder="Enter current password" />
            <PwInput field="next" label="New Password" placeholder="Min. 6 characters" />
            <PwInput field="confirm" label="Confirm New Password" placeholder="Repeat new password" />
            <Button onClick={handleUpdatePassword} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold mt-1">
              Update Password
            </Button>
          </div>

          {/* Two-Factor Auth */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-400 font-medium">{twoFA ? 'Currently enabled' : 'Currently disabled'}</p>
                </div>
              </div>
              <button
                onClick={toggleTwoFA}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${twoFA ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform ${twoFA ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {twoFA && (
              <p className="mt-3 text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 font-medium animate-in fade-in slide-in-from-top-2">
                ✅ 2FA is active. A verification code will be required on next login.
              </p>
            )}
          </div>

          {/* Login Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Login Activity</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Last Login', value: 'Today, 12:40 PM', color: 'text-green-600' },
                { label: 'Device', value: 'Chrome on Windows', color: 'text-slate-700' },
                { label: 'Location', value: 'India 🇮🇳', color: 'text-slate-700' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2.5 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-xs text-green-700 font-semibold flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> No suspicious activity detected
              </p>
            </div>
          </div>

          {/* Secure Logout */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <LogOut className="h-4 w-4 text-rose-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Secure Logout</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-3">Sign out from all devices and clear your session data.</p>
            <Button
              onClick={() => { toast.success('Logged out successfully'); handleClose(); }}
              variant="outline"
              className="w-full h-11 rounded-xl font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border-rose-200 transition-colors">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out from All Devices
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
