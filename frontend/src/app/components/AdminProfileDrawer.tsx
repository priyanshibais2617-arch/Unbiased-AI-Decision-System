import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, CheckCircle2, Lock, Bell, Shield, Edit3, LogOut, Eye, EyeOff,
  Zap, Save, Toggle3dOff
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
export type AdminType = "education" | "job" | "loan";

export interface AdminProfileConfig {
  type: AdminType;
  name: string;
  initials: string;
  email: string;
  role: string;
  gradientHeader: string;   // tailwind classes for header gradient
  accentColor: string;      // e.g. "teal" | "blue" | "purple"
  aiTag: string;
  profileInfo: { label: string; value: string; span?: boolean }[];
  metrics: { label: string; value: string; color: string }[];
  notifications: { id: string; text: string; sub: string; time: string; read: boolean }[];
  settingsLabel: string;
  settingsItems: { key: string; label: string; desc: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold shadow-xl text-sm">
      <CheckCircle2 className="h-5 w-5 shrink-0" />{msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </motion.div>
  );
}

// ─── Main Drawer ───────────────────────────────────────────────────────────────
export function AdminProfileDrawer({
  config, open, onClose, onLogout, onUpdate
}: {
  config: AdminProfileConfig;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  onUpdate?: (data: any) => void;
}) {
  const ac = config.accentColor;

  // Panel state
  const [panel, setPanel] = useState<"menu" | "edit" | "settings" | "notifications" | "security" | "logout">("menu");
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Edit profile state
  const [editData, setEditData] = useState({
    name: config.name, mobile: "", department: "", role: config.role, location: ""
  });

  // Settings toggles
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(config.settingsItems.map(s => [s.key, false]))
  );

  // Notifications
  const [notifs, setNotifs] = useState(config.notifications);

  // Security
  const [twoFA, setTwoFA] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const unread = notifs.filter(n => !n.read).length;

  const go = (p: typeof panel) => setPanel(p);
  const back = () => setPanel("menu");

  const handleSaveProfile = () => {
    if (onUpdate) onUpdate(editData);
    showToast("Profile updated successfully");
    back();
  };

  const handleChangePw = () => {
    if (!oldPw || !newPw) return;
    showToast("Password changed successfully");
    setOldPw(""); setNewPw("");
  };

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotifs = () => setNotifs([]);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose} />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-[380px] max-w-[95vw] bg-white shadow-2xl z-[101] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* ── Gradient Header ── */}
            <div className={`${config.gradientHeader} px-6 py-6 text-white relative shrink-0`}>
              <button onClick={onClose}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-black">
                    {config.initials}
                  </div>
                  <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 bg-emerald-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg leading-tight">{editData.name || config.name}</p>
                  <p className="text-white/70 text-xs font-medium mt-0.5 truncate">{config.email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[11px] font-semibold text-white/80">Online</span>
                  </div>
                </div>
                {unread > 0 && (
                  <span className="h-5 w-5 bg-red-500 rounded-full border-2 border-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {unread}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {[`${config.type === "education" ? "🎓" : config.type === "job" ? "💼" : "🏦"} ${config.type === "education" ? "Education Admin" : config.type === "job" ? "Hiring Admin" : "Loan Admin"}`, "🟢 Verified", "⚡ Active"].map(b => (
                  <span key={b} className="bg-white/20 border border-white/30 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">{b}</span>
                ))}
              </div>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto">

              {/* ── MENU PANEL ── */}
              {panel === "menu" && (
                <div className="p-4 space-y-4">

                  {/* Profile Info Cards */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Profile Overview</p>
                    <div className="grid grid-cols-2 gap-2">
                      {config.profileInfo.map(item => (
                        <div key={item.label} className={`bg-slate-50 rounded-xl p-3 border border-slate-100 ${item.span ? "col-span-2" : ""}`}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                          <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Metrics</p>
                    <div className="grid grid-cols-3 gap-2">
                      {config.metrics.map(m => (
                        <div key={m.label} className={`bg-${m.color}-50 border border-${m.color}-100 rounded-xl p-2.5 text-center`}>
                          <p className={`text-base font-black text-${m.color}-700`}>{m.value}</p>
                          <p className={`text-[10px] font-semibold text-${m.color}-600 mt-0.5 leading-tight`}>{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Tag */}
                  <div className={`flex items-center gap-2 bg-${ac}-50 border border-${ac}-200 rounded-xl px-3 py-2.5`}>
                    <Zap className={`h-3.5 w-3.5 text-${ac}-500 shrink-0`} />
                    <p className={`text-[11px] font-bold text-${ac}-700`}>{config.aiTag}</p>
                    <span className={`ml-auto h-1.5 w-1.5 bg-${ac}-500 rounded-full animate-pulse`} />
                  </div>

                  {/* Action Menu */}
                  <div className="space-y-0.5">
                    {[
                      { icon: Edit3, label: "Edit Profile", action: () => go("edit") },
                      { icon: Shield, label: config.settingsLabel, action: () => go("settings") },
                      { icon: Bell, label: "Notifications", action: () => go("notifications"), badge: unread > 0 ? unread : undefined },
                      { icon: Lock, label: "Security Settings", action: () => go("security") },
                    ].map(item => (
                      <button key={item.label} onClick={item.action}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-${ac}-50 hover:text-${ac}-700 transition-all text-left group`}>
                        <item.icon className={`h-4 w-4 text-slate-400 group-hover:text-${ac}-500 shrink-0`} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && <span className="h-5 w-5 bg-red-500 rounded-full text-[10px] text-white font-black flex items-center justify-center">{item.badge}</span>}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button onClick={() => go("logout")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all text-left group">
                        <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── EDIT PROFILE ── */}
              {panel === "edit" && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={back} className="text-slate-400 hover:text-slate-700 transition-colors">← Back</button>
                    <h3 className="text-sm font-bold text-slate-700">Edit Profile</h3>
                  </div>
                  {[
                    { key: "name", label: "Full Name", placeholder: "Your name" },
                    { key: "mobile", label: "Mobile Number", placeholder: "+91 98765 43210" },
                    { key: "department", label: "Department", placeholder: "e.g. Computer Science" },
                    { key: "role", label: "Role", placeholder: "Your role" },
                    { key: "location", label: "Work Location", placeholder: "City, State" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{f.label}</label>
                      <input type="text"
                        value={editData[f.key as keyof typeof editData]}
                        onChange={e => setEditData(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-${ac}-400/30 focus:border-${ac}-400 transition-all`}
                      />
                    </div>
                  ))}
                  <button onClick={handleSaveProfile}
                    className={`w-full mt-2 bg-gradient-to-r from-${ac}-500 to-${ac}-600 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-md`}>
                    <Save className="h-4 w-4" /> Save Changes
                  </button>
                </div>
              )}

              {/* ── SETTINGS ── */}
              {panel === "settings" && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={back} className="text-slate-400 hover:text-slate-700 transition-colors">← Back</button>
                    <h3 className="text-sm font-bold text-slate-700">{config.settingsLabel}</h3>
                  </div>
                  {config.settingsItems.map(item => (
                    <div key={item.key} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{item.label}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
                      </div>
                      <button onClick={() => setToggles(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`w-11 h-6 rounded-full relative transition-all duration-200 ${toggles[item.key] ? `bg-${ac}-500` : "bg-slate-200"}`}>
                        <span className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow-sm transition-all duration-200 ${toggles[item.key] ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {panel === "notifications" && (
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <button onClick={back} className="text-slate-400 hover:text-slate-700">← Back</button>
                      <h3 className="text-sm font-bold text-slate-700">Notifications</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={markAllRead} className={`text-[11px] font-bold text-${ac}-600 hover:text-${ac}-800`}>Mark all read</button>
                      <button onClick={clearNotifs} className="text-[11px] font-bold text-red-400 hover:text-red-600">Clear</button>
                    </div>
                  </div>
                  {notifs.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-sm font-medium">No notifications</div>
                  )}
                  {notifs.map(n => (
                    <div key={n.id} className={`p-3.5 rounded-xl border transition-all ${n.read ? "bg-white border-slate-100 opacity-60" : `bg-${ac}-50 border-${ac}-100`}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800 leading-tight">{n.text}</p>
                        {!n.read && <span className={`h-2 w-2 bg-${ac}-500 rounded-full shrink-0 mt-1`} />}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">{n.sub}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── SECURITY ── */}
              {panel === "security" && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={back} className="text-slate-400 hover:text-slate-700">← Back</button>
                    <h3 className="text-sm font-bold text-slate-700">Security Settings</h3>
                  </div>

                  {/* Change Password */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Change Password</p>
                    {[
                      { label: "Current Password", val: oldPw, set: setOldPw, show: showOldPw, toggle: () => setShowOldPw(v => !v) },
                      { label: "New Password", val: newPw, set: setNewPw, show: showNewPw, toggle: () => setShowNewPw(v => !v) },
                    ].map(f => (
                      <div key={f.label} className="relative">
                        <input type={f.show ? "text" : "password"} placeholder={f.label}
                          value={f.val} onChange={e => f.set(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 pr-10" />
                        <button onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                          {f.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    ))}
                    <button onClick={handleChangePw}
                      className={`w-full bg-${ac}-500 text-white font-bold rounded-xl py-2.5 text-sm hover:opacity-90 transition-all`}>
                      Update Password
                    </button>
                  </div>

                  {/* 2FA */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Two-Factor Authentication</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Extra layer of account security</p>
                    </div>
                    <button onClick={() => { setTwoFA(v => !v); showToast(twoFA ? "2FA disabled" : "2FA enabled"); }}
                      className={`w-11 h-6 rounded-full relative transition-all duration-200 ${twoFA ? `bg-${ac}-500` : "bg-slate-200"}`}>
                      <span className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow-sm transition-all duration-200 ${twoFA ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>

                  {/* Recent logins */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Recent Login Activity</p>
                    {[
                      { device: "Chrome · Windows", location: "Indore, India", time: "Just now", current: true },
                      { device: "Safari · iPhone", location: "Mumbai, India", time: "2 days ago", current: false },
                    ].map(l => (
                      <div key={l.time} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="text-xs font-bold text-slate-700">{l.device}</p>
                          <p className="text-[10px] text-slate-400">{l.location} · {l.time}</p>
                        </div>
                        {l.current && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Current</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── LOGOUT CONFIRM ── */}
              {panel === "logout" && (
                <div className="p-6 flex flex-col items-center text-center gap-5 mt-8">
                  <div className="h-16 w-16 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center">
                    <LogOut className="h-7 w-7 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">Logout?</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Are you sure you want to logout from the admin portal?</p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button onClick={back} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                    <button onClick={() => { onClose(); onLogout(); showToast("Logged out successfully"); }}
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all shadow-md shadow-red-200 active:scale-[0.98]">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}
