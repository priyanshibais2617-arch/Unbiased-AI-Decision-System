import { useState, useEffect } from "react";
import { 
  X, ShieldCheck, Lock, Smartphone, Globe, Mail, AlertTriangle, 
  Download, Trash2, Eye, EyeOff, Activity, CheckCircle, 
  Clock, LogOut, Bell, ShieldAlert, Cpu
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { useNavigate } from "react-router";

export function SecuritySettingsPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Toggles state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [authMethod, setAuthMethod] = useState<'sms' | 'email'>('sms');
  const [alertsSuspicious, setAlertsSuspicious] = useState(true);
  const [alertsNewDevice, setAlertsNewDevice] = useState(true);
  const [alertsLoan, setAlertsLoan] = useState(false);
  const [maskData, setMaskData] = useState(true);
  const [allowAI, setAllowAI] = useState(true);
  const [autoLogout, setAutoLogout] = useState('15');
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    onClose();
    navigate("/login");
  };

  const [activeSession, setActiveSession] = useState(15 * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      interval = setInterval(() => {
        setActiveSession(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!mounted) return null;

  return (
    <>
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out" style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-800 to-purple-900 p-6 text-white relative flex-shrink-0 shadow-lg">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full transition-colors" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4 mt-2">
             <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <ShieldCheck className="h-8 w-8 text-green-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold tracking-tight">Security Settings</h2>
                <p className="text-indigo-200 text-sm mt-0.5">Manage your account safety and privacy</p>
             </div>
          </div>
          
          {/* Security Score */}
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 group hover:bg-white/15 transition-all">
             <div className="flex justify-between items-end mb-2">
                <div>
                   <p className="text-[11px] uppercase tracking-wider font-bold text-indigo-200 flex items-center gap-1.5">
                     Security Score <ShieldAlert className="h-3 w-3" />
                   </p>
                   {is2FAEnabled ? (
                      <p className="text-xs text-green-300 font-medium mt-1">Great! Your account is highly secure.</p>
                   ) : (
                      <p className="text-xs text-amber-300 font-medium mt-1">Enable 2FA to improve account security</p>
                   )}
                </div>
                <div className="text-right">
                   <p className="font-black text-2xl leading-none">{is2FAEnabled ? '95%' : '80%'}</p>
                </div>
             </div>
             <Progress value={is2FAEnabled ? 95 : 80} className={`h-2 ${is2FAEnabled ? '[&>div]:bg-green-400' : '[&>div]:bg-amber-400'} bg-indigo-900/50`} />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-8 space-y-6 pt-5 px-5">
           
           {/* Section 1: Change Password */}
           <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4"/> Password Updates
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4 hover:shadow-md transition-shadow">
                 
                 <div className="space-y-3">
                    <div className="relative">
                       <input 
                         type={showCurrentPassword ? "text" : "password"} 
                         placeholder="Current Password" 
                         className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700"
                       />
                       <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </button>
                    </div>

                    <div className="relative">
                       <input 
                         type={showNewPassword ? "text" : "password"} 
                         placeholder="New Password" 
                         className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700"
                       />
                       <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </button>
                    </div>

                    <div className="relative">
                       <input 
                         type="password" 
                         placeholder="Confirm New Password" 
                         className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700"
                       />
                    </div>
                 </div>

                 <p className="text-[10px] text-slate-500 font-medium">Helper text: Use a strong password (minimum 8 characters, include numbers and symbols).</p>
                 
                 <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold shadow-sm transition-transform active:scale-[0.98]">
                    Update Password
                 </Button>
              </div>
           </section>

           {/* Section 2: Two-Factor Authentication */}
           <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4"/> Two-Factor Authentication (2FA)
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                 <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                       <p className="text-sm font-bold text-slate-800">Require 2FA for Login</p>
                       <p className="text-xs text-slate-500 font-medium mt-0.5">
                         Status: {is2FAEnabled ? <span className="text-green-600 font-bold">Enabled</span> : <span className="text-slate-400 font-bold">Disabled</span>}
                       </p>
                    </div>
                    <Switch checked={is2FAEnabled} onCheckedChange={setIs2FAEnabled} className="data-[state=checked]:bg-green-500" />
                 </div>
                 
                 <div className={`p-5 transition-all duration-300 ${is2FAEnabled ? 'opacity-100 h-auto' : 'opacity-50 pointer-events-none'}`}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Preferred Method</p>
                    <div className="flex gap-3">
                       <div 
                         onClick={() => setAuthMethod('sms')}
                         className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${authMethod === 'sms' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                       >
                          <Smartphone className="h-5 w-5" />
                          <span className="text-sm font-bold">SMS OTP</span>
                       </div>
                       <div 
                         onClick={() => setAuthMethod('email')}
                         className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${authMethod === 'email' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                       >
                          <Mail className="h-5 w-5" />
                          <span className="text-sm font-bold">Email OTP</span>
                       </div>
                    </div>
                 </div>
              </div>
           </section>

           {/* Section 3: Login Activity / Devices */}
           <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4"/> Login Activity
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                 <div className="space-y-4">
                    <div className="flex items-start gap-3 relative pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                       <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                          <Globe className="h-4 w-4" />
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <p className="text-sm font-bold text-slate-800">Chrome on Windows</p>
                             <Badge className="bg-green-100 text-green-700 border-0 text-[9px] uppercase tracking-wider px-1.5 py-0">Current</Badge>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">Mumbai, India (IP: 192.168.1.1)</p>
                          <p className="text-[10px] text-slate-400 mt-1">Active Now</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-3 relative border-slate-100 last:border-0 last:pb-0">
                       <div className="bg-slate-100 p-2 rounded-lg text-slate-600 shrink-0">
                          <Smartphone className="h-4 w-4" />
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800">Loan App on iPhone 13</p>
                          <p className="text-xs text-slate-500 font-medium">Delhi, India</p>
                          <p className="text-[10px] text-slate-400 mt-1">Yesterday, 14:30 PM</p>
                       </div>
                    </div>
                 </div>

                 <Button onClick={handleLogout} variant="outline" className="w-full mt-5 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    Logout from all devices
                 </Button>
              </div>
           </section>

           {/* Section 4: Account Alerts */}
           <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4"/> Account Alerts
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <p className="text-sm font-semibold text-slate-700">Suspicious login alerts</p>
                    <Switch checked={alertsSuspicious} onCheckedChange={setAlertsSuspicious} />
                 </div>
                 <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <p className="text-sm font-semibold text-slate-700">New device login alerts</p>
                    <Switch checked={alertsNewDevice} onCheckedChange={setAlertsNewDevice} />
                 </div>
                 <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <p className="text-sm font-semibold text-slate-700">Loan activity alerts</p>
                    <Switch checked={alertsLoan} onCheckedChange={setAlertsLoan} />
                 </div>
              </div>
           </section>

           {/* Section 5: Data Privacy Controls */}
           <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4"/> Data Privacy
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                 <div className="p-2 border-b border-slate-100">
                    <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                       <div>
                         <p className="text-sm font-semibold text-slate-700">Mask sensitive data</p>
                         <p className="text-[10px] text-slate-400 group-hover:text-slate-500 transition-colors">Hide PAN / Aadhaar in dashboard</p>
                       </div>
                       <Switch checked={maskData} onCheckedChange={setMaskData} className="data-[state=checked]:bg-indigo-600" />
                    </div>
                    <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                       <div>
                         <p className="text-sm font-semibold text-slate-700">Allow AI data processing</p>
                         <p className="text-[10px] text-slate-400 group-hover:text-slate-500 transition-colors">Used for loan chance prediction</p>
                       </div>
                       <Switch checked={allowAI} onCheckedChange={setAllowAI} className="data-[state=checked]:bg-indigo-600" />
                    </div>
                 </div>
                 <div className="p-4 bg-slate-50/50">
                    <Button variant="outline" className="w-full bg-white rounded-xl border-slate-200 text-indigo-700 font-bold hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-800 transition-colors flex items-center justify-center gap-2">
                       <Download className="h-4 w-4" /> Download Personal Data
                    </Button>
                 </div>
              </div>
           </section>

           {/* Section 6: Session Management */}
           <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4"/> Session Management
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Auto logout after inactivity</p>
                    </div>
                    <div className="relative">
                      <select 
                        className="appearance-none bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-lg pl-3 pr-8 py-1.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        value={autoLogout}
                        onChange={(e) => setAutoLogout(e.target.value)}
                      >
                        <option value="5">5 min</option>
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                      </select>
                      <ChevronDown className="h-3 w-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                 </div>
                 
                 <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-indigo-700">
                       <Cpu className="h-4 w-4 animate-pulse" />
                       <span className="text-xs font-bold uppercase tracking-wider">Active Session</span>
                    </div>
                    <span className="text-sm font-black text-indigo-900 font-mono tracking-tight">{formatTime(activeSession)}</span>
                 </div>
              </div>
           </section>

           {/* Section 7: Danger Zone */}
           <section className="pt-2">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4"/> Danger Zone
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-2 overflow-hidden">
                 <button className="w-full text-left p-4 hover:bg-rose-50 rounded-xl transition-colors group">
                    <p className="text-sm font-bold text-slate-700 group-hover:text-rose-700 transition-colors">Deactivate Account</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 group-hover:text-rose-500/70">Temporarily disable your account</p>
                 </button>
                 <div className="h-px bg-rose-50 mx-4"></div>
                 <button className="w-full flex items-center justify-between p-4 hover:bg-rose-50 rounded-xl transition-colors group">
                    <div>
                       <p className="text-sm font-bold text-rose-600">Delete Account</p>
                       <p className="text-xs text-rose-500/70 font-medium mt-0.5">Permanently remove all data</p>
                    </div>
                    <Trash2 className="h-4 w-4 text-rose-400 group-hover:scale-110 transition-transform" />
                 </button>
              </div>
           </section>

           {/* Bottom Padding */}
           <div className="h-4"></div>
        </div>
      </div>
    </>
  );
}
