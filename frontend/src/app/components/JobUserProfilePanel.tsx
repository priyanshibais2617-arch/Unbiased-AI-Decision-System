import { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Shield, Sparkles, CheckCircle, ChevronRight, MessageCircle, LogOut, Activity, Target, Briefcase, Code, FileText, Upload, Bell, HelpCircle, ArrowLeft, Send, List, Settings, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export function JobUserProfilePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState('main');
  const [showSignOut, setShowSignOut] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [faqOpen, setFaqOpen] = useState(-1);
  const [jobPF, setJobPF] = useState({fullName:'',email:'',mobile:'',skills:'',experience:'',role:'',company:'',location:'',qualification:''});
  const [pw, setPw] = useState({current:'',next:'',confirm:''});
  const [twoFA, setTwoFA] = useState(false);
  const [helpView, setHelpView] = useState('main');
  const [helpMsgs, setHelpMsgs] = useState([{from:'support',text:'Hi! How can we help you with your job search?'}]);
  const [helpInput, setHelpInput] = useState('');
  const [emailF, setEmailF] = useState({subject:'',message:''});
  const [issueF, setIssueF] = useState({type:'',desc:'',file:false});
  const [chatInput, setChatInput] = useState('');
  const [msgs, setMsgs] = useState([
    { from: 'recruiter', name: 'Ananya (Google)', text: 'Hi! We reviewed your profile. Are you open to a Frontend Lead role?', time: '10:42 AM' },
    { from: 'system', name: 'System', text: 'Your application to Infosys has moved to Round 2.', time: 'Yesterday' },
    { from: 'recruiter', name: 'Rahul (Infosys)', text: 'Please confirm your availability for the technical interview.', time: '2 days ago' },
  ]);
  const [alerts, setAlerts] = useState([
    { id: 1, read: false, icon: '💼', title: 'New Job Match Found', sub: 'Frontend Lead at Google — 94% match' },
    { id: 2, read: false, icon: '📊', title: 'Resume Score Updated', sub: 'Your resume score improved to 88/100' },
    { id: 3, read: false, icon: '🗓️', title: 'Interview Reminder', sub: 'Tomorrow 10:00 AM — Infosys round 2' },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUserName(localStorage.getItem('userFullName') || localStorage.getItem('userName') || 'Candidate');
      setUserEmail(localStorage.getItem('userEmail') || '');
      const _jp = (() => { try { return JSON.parse(localStorage.getItem('jobHiringProfile')||'{}'); } catch { return {}; } })();
      setJobPF({fullName:_jp.fullName||localStorage.getItem('userFullName')||'',email:_jp.email||localStorage.getItem('userEmail')||'',mobile:_jp.mobile||'',skills:_jp.skills||'',experience:_jp.experience||'',role:_jp.role||'',company:_jp.company||'',location:_jp.location||'',qualification:_jp.qualification||''});
      setHelpView('main');
      setMounted(true);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      document.body.style.overflow = '';
      const t = setTimeout(() => { setMounted(false); setView('main'); }, 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'C';
  const handleClose = () => { setVisible(false); setTimeout(() => { setMounted(false); onClose(); }, 320); };
  const handleSignOut = () => { setShowSignOut(false); handleClose(); toast.success('Signed out successfully'); setTimeout(() => navigate('/dashboard'), 350); };
  const jobP = (() => { try { return JSON.parse(localStorage.getItem('jobHiringProfile') || '{}'); } catch { return {}; } })();

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMsgs(m => [...m, { from: 'me', name: 'You', text: chatInput.trim(), time: 'Just now' }]);
    setChatInput('');
    setTimeout(() => setMsgs(m => [...m, { from: 'system', name: 'System', text: 'Message received. A recruiter will respond shortly.', time: 'Just now' }]), 900);
  };

  if (!mounted) return null;

  const SubHeader = ({ title }: { title: string }) => (
    <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 text-white flex items-center gap-3 shrink-0 shadow-sm shadow-blue-500/10">
      <button onClick={() => setView('main')} className="p-2 hover:bg-white/20 rounded-full cursor-pointer transition-colors"><ArrowLeft className="h-5 w-5" /></button>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );

  const PrefBtn = ({ label, icon: Icon, action }: { label: string; icon: any; action: () => void }) => (
    <button onClick={action} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-blue-600 hover:shadow-[0_4px_20px_rgba(59,130,246,0.08)] border border-transparent hover:border-blue-50 transition-all group cursor-pointer text-slate-700">
      <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-slate-400 group-hover:text-blue-500" /><span className="text-sm font-semibold">{label}</span></div>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }} onClick={handleClose} />
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[100] flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-100" style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* ── MAIN ── */}
        {view === 'main' && (<>
          <div className="bg-gradient-to-br from-blue-700 to-blue-600 p-6 text-white relative flex-shrink-0 shadow-lg shadow-blue-900/10">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full cursor-pointer" onClick={handleClose}><X className="h-5 w-5" /></Button>
            <div className="flex items-center gap-4 mt-2">
              <div className="relative shrink-0">
                <div className="h-16 w-16 rounded-full bg-white text-blue-700 flex items-center justify-center text-xl font-black shadow-lg ring-4 ring-white/20">{initials}</div>
                <div className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight truncate">{userName}</h2>
                <div className="flex items-center gap-1.5 text-blue-100 text-sm font-medium mt-1"><Mail className="h-3 w-3 shrink-0" /><span className="truncate">{userEmail}</span></div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Strong Resume', 'Skill Match', 'Mid-Senior'].map(b => (
                    <span key={b} className="text-[10px] font-bold bg-white/15 border border-white/20 text-white px-2 py-0.5 rounded-full">{b}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 bg-white/10 backdrop-blur-md rounded-xl p-3 flex justify-between items-center border border-white/20">
              <div><p className="text-[11px] uppercase tracking-wider font-bold text-blue-200">Profile Quality Score</p><div className="flex items-center gap-2 mt-0.5"><p className="font-bold text-sm">92%</p><Sparkles className="h-3 w-3 text-cyan-300" /></div></div>
              <Progress value={92} className="w-24 h-2 [&>div]:bg-white bg-blue-900/30" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-blue-50 text-slate-800 custom-scrollbar pb-6 space-y-5 pt-5 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.1] pointer-events-none" />
            <div className="px-5 relative z-10">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4" />Career Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Resume Score', icon: Activity, bg: 'bg-blue-50', ic: 'text-blue-500', val: '88', sub: '/100' },
                  { label: 'Skill Match', icon: Target, bg: 'bg-blue-50', ic: 'text-blue-500', val: '94%', sub: '' },
                  { label: 'Experience', icon: Briefcase, bg: 'bg-blue-50', ic: 'text-blue-500', val: '3+ Yrs', sub: '' },
                  { label: 'Top Role', icon: Code, bg: 'bg-blue-50', ic: 'text-blue-500', val: 'Frontend', sub: '' },
                ].map((c, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-blue-50 flex flex-col justify-center hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)] transition-all">
                    <div className="flex items-center gap-2 mb-1"><div className={`p-1.5 rounded-lg ${c.bg}`}><c.icon className={`h-3.5 w-3.5 ${c.ic}`} /></div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.label}</span></div>
                    <div className="flex items-end gap-1"><span className="text-xl font-black text-slate-900">{c.val}</span>{c.sub && <span className="text-xs font-bold text-slate-400 mb-0.5">{c.sub}</span>}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 relative z-10">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Settings className="h-4 w-4" />System Settings</h3>
              <div className="space-y-1">
                <PrefBtn label="Edit Profile Info" icon={User} action={() => setView('editprofile')} />
                <PrefBtn label="Security Settings" icon={Lock} action={() => setView('security')} />
                <PrefBtn label="Notifications" icon={Bell} action={() => setView('notifications')} />
                <PrefBtn label="Help & Support" icon={HelpCircle} action={() => setView('help')} />
              </div>
            </div>

            <div className="px-5 relative z-10">
              <div className="relative bg-slate-900 rounded-2xl p-5 border border-slate-800 overflow-hidden shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-[30px] pointer-events-none" />
                <div className="flex gap-3 items-start relative z-10">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-400 p-2 rounded-xl text-white shrink-0 shadow-lg mt-0.5"><Shield className="h-4 w-4" /></div>
                  <div>
                    <h4 className="text-sm font-black text-white mb-1 flex items-center gap-2">AI Ethics Engine <Sparkles className="h-3 w-3 text-amber-300" /></h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Evaluates candidates on <span className="text-blue-300 font-bold">merit, skills & experience</span> — eliminating systemic bias.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 p-5 bg-white border-t border-slate-100 space-y-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] relative z-20">
            <div className="flex gap-3">
              <Button onClick={() => setView('messages')} className="flex-1 h-11 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold border-0 shadow-none cursor-pointer"><MessageCircle className="h-4 w-4 mr-2" />Messages</Button>
              <Button onClick={() => setShowSignOut(true)} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500 font-bold shadow-lg shadow-blue-200 cursor-pointer transition-all"><LogOut className="h-4 w-4 mr-2" />Sign Out</Button>
            </div>
          </div>
        </>)}


        {/* ── EDIT PROFILE ── */}
        {view === 'editprofile' && (
          <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10">
            <SubHeader title="Edit Profile Info" />
            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {[['fullName','Full Name','text'],['email','Email Address','email'],['mobile','Mobile Number','tel']].map(([k,l,t]) => (
                <div key={k}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{l}</label>
                  <input type={t} value={jobPF[k as keyof typeof jobPF]} onChange={e => setJobPF(p => ({...p,[k]:e.target.value}))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all text-slate-700"/>
                </div>
              ))}
              {[['skills','Skills'],['experience','Experience'],['role','Preferred Role'],['company','Preferred Company'],['location','Current Location'],['qualification','Highest Qualification']].map(([k,l]) => (
                <div key={k}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{l}</label>
                  <input type="text" value={jobPF[k as keyof typeof jobPF]} onChange={e => setJobPF(p => ({...p,[k]:e.target.value}))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all text-slate-700"/>
                </div>
              ))}
            </div>
            <div className="p-5 bg-white border-t border-slate-100 shrink-0 flex gap-3 relative z-10">
              <Button variant="outline" onClick={() => setView('main')} className="flex-1 h-11 rounded-xl font-bold border-slate-200 text-slate-600">Cancel</Button>
              <Button onClick={() => { localStorage.setItem('jobHiringProfile', JSON.stringify(jobPF)); localStorage.setItem('userFullName', jobPF.fullName); setUserName(jobPF.fullName); toast.success('Profile updated successfully'); setView('main'); }} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold shadow-md shadow-blue-100">Save Changes</Button>
            </div>
          </div>
        )}

        {/* ── SECURITY ── */}
        {view === 'security' && (
          <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10">
            <SubHeader title="Security Settings" />
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-blue-50 p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1"><div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center"><Lock className="h-4 w-4 text-blue-600"/></div><h3 className="text-sm font-bold text-slate-800">Change Password</h3></div>
                {[['current','Current Password','Current password'],['next','New Password','Min. 6 characters'],['confirm','Confirm Password','Repeat new password']].map(([f,l,ph]) => (
                  <div key={f}><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{l}</label><input type="password" value={pw[f as keyof typeof pw]} onChange={e => setPw(p => ({...p,[f]:e.target.value}))} placeholder={ph} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all text-slate-700"/></div>
                ))}
                <Button onClick={() => { if(!pw.current){toast.error('Enter current password');return;} if(pw.next.length<6){toast.error('Min 6 characters required');return;} if(pw.next!==pw.confirm){toast.error('Passwords do not match');return;} toast.success('Password updated successfully'); setPw({current:'',next:'',confirm:''}); }} className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-blue-100">Update Password</Button>
              </div>
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-blue-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center"><Activity className="h-4 w-4 text-blue-600"/></div><div><p className="text-sm font-bold text-slate-800">Two-Factor Auth</p><p className="text-xs text-slate-400 font-medium">{twoFA?'Enabled':'Disabled'}</p></div></div>
                <button onClick={() => { const n=!twoFA; setTwoFA(n); toast.success(n?'Two-factor authentication enabled':'Two-factor authentication disabled'); }} className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${twoFA?'bg-blue-600':'bg-slate-200'}`}><div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform ${twoFA?'translate-x-5':''}`}/></button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-center gap-2 mb-3"><div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-600"/></div><h3 className="text-sm font-bold text-slate-800">Recent Login Activity</h3></div>
                {[['Last Login','Today, 12:40 PM','text-green-600'],['Device','Chrome on Windows','text-slate-700'],['Location','India 🇮🇳','text-slate-700']].map(([k,v,c]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-slate-100 last:border-0"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{k}</span><span className={`text-sm font-semibold ${c}`}>{v}</span></div>
                ))}
                <div className="mt-3 p-2.5 bg-green-50 border border-green-100 rounded-xl"><p className="text-xs text-green-700 font-semibold">🛡️ No suspicious activity detected</p></div>
              </div>
              <Button variant="outline" onClick={() => { toast.success('Signed out successfully'); handleClose(); }} className="w-full h-11 rounded-xl font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border-rose-200 flex items-center justify-center gap-2"><LogOut className="h-4 w-4"/>Secure Logout</Button>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {view === 'notifications' && (
          <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10">
            <SubHeader title="Notifications" />
            <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500">{alerts.filter(a => !a.read).length} unread</span>
              <div className="flex gap-3">
                <button onClick={() => setAlerts(a => a.map(x => ({...x,read:true})))} className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">Mark all read</button>
                <button onClick={() => setAlerts([])} className="text-xs font-bold text-rose-500 hover:underline cursor-pointer">Clear all</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {alerts.length === 0 && <div className="text-center py-12 text-slate-400 font-semibold text-sm">No notifications available</div>}
              {alerts.map(a => (
                <div key={a.id} onClick={() => setAlerts(al => al.map(x => x.id===a.id?{...x,read:true}:x))} className={`rounded-2xl p-4 border cursor-pointer transition-all ${a.read?'bg-white border-slate-100':'bg-indigo-50 border-indigo-100'}`}>
                  <div className="flex items-start gap-3"><span className="text-xl">{a.icon}</span><div className="flex-1 min-w-0"><p className={`text-sm font-bold ${a.read?'text-slate-600':'text-slate-800'}`}>{a.title}</p><p className="text-xs text-slate-500 font-medium mt-0.5">{a.sub}</p></div>{!a.read&&<div className="h-2 w-2 rounded-full bg-indigo-500 mt-1 shrink-0"/>}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HELP & SUPPORT ── */}
        {view === 'help' && (
          <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 text-white flex items-center gap-3 shrink-0 shadow-md">
              <button onClick={() => { if(helpView==='main') setView('main'); else setHelpView('main'); }} className="p-2 hover:bg-white/20 rounded-full cursor-pointer transition-colors"><ArrowLeft className="h-5 w-5"/></button>
              <h2 className="text-lg font-bold">{helpView==='main'?'Help & Support':helpView==='chat'?'Live Chat':helpView==='email'?'Email Support':'Report an Issue'}</h2>
            </div>
            {helpView==='main' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                <div className="grid grid-cols-3 gap-3">
                  {[{label:'Live Chat',icon:MessageCircle,bg:'bg-indigo-50 text-indigo-600',v:'chat'},{label:'Email Support',icon:Send,bg:'bg-purple-50 text-purple-600',v:'email'},{label:'Report Issue',icon:HelpCircle,bg:'bg-amber-50 text-amber-600',v:'issue'}].map(item => (
                    <button key={item.label} onClick={() => setHelpView(item.v)} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-blue-50 hover:border-blue-200 hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)] cursor-pointer transition-all group">
                      <div className={`h-10 w-10 ${item.bg} rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm`}><item.icon className="h-5 w-5"/></div>
                      <span className="text-xs font-bold text-slate-700 text-center leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
                {[{q:'How is my match score calculated?',a:'AI compares your skills, experience, and role preference against job requirements — no personal data used.'},{q:'Can I edit my profile after setup?',a:'Yes, use Edit Profile Info in System Settings to update your details.'},{q:'Why was I not matched for a role?',a:'A match score below 70% means skill gaps. Update your profile and skills.'}].map((faq,i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4">
                    <button onClick={() => setFaqOpen(faqOpen===i?-1:i)} className="w-full flex justify-between items-center text-left"><span className="text-sm font-semibold text-slate-700 pr-3">{faq.q}</span><ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${faqOpen===i?'rotate-90':''}`}/></button>
                    {faqOpen===i && <p className="text-xs text-slate-500 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{faq.a}</p>}
                  </div>
                ))}
              </div>
            )}
            {helpView==='chat' && (<>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {helpMsgs.map((m: any, i: number) => (
                  <div key={i} className={`flex ${m.from==='me'?'justify-end':'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${m.from==='me'?'bg-indigo-600 text-white rounded-br-sm':'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'}`}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-white border-t border-blue-50 flex gap-2 shrink-0">
                <input value={helpInput} onChange={e => setHelpInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter'&&helpInput.trim()){const t=helpInput.trim();setHelpMsgs((m:any)=>[...m,{from:'me',text:t}]);setHelpInput('');setTimeout(()=>setHelpMsgs((m:any)=>[...m,{from:'support',text:'Thanks for reaching out! Our team will respond shortly.'}]),900);}}} placeholder="Type your message..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-400 text-slate-700"/>
                <button onClick={() => { if(!helpInput.trim())return; const t=helpInput.trim(); setHelpMsgs((m:any)=>[...m,{from:'me',text:t}]); setHelpInput(''); setTimeout(()=>setHelpMsgs((m:any)=>[...m,{from:'support',text:'Thanks for reaching out! Our team will respond shortly.'}]),900); }} className="h-10 w-10 bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl text-white flex items-center justify-center cursor-pointer hover:from-blue-600 hover:to-blue-500 transition-all shadow-md shadow-blue-100"><Send className="h-4 w-4"/></button>
              </div>
            </>)}
            {helpView==='email' && (<>
              <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar">
                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject</label><input value={emailF.subject} onChange={e => setEmailF(p=>({...p,subject:e.target.value}))} placeholder="e.g. Issue with my job match" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-400 transition-all text-slate-700"/></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Message</label><textarea rows={5} value={emailF.message} onChange={e => setEmailF(p=>({...p,message:e.target.value}))} placeholder="Describe your issue or question..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-400 transition-all resize-none text-slate-700"/></div>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-medium">📧 We typically respond within 24 hours on business days.</div>
              </div>
              <div className="p-5 bg-white border-t border-blue-50 shrink-0 flex gap-3">
                <Button variant="outline" onClick={() => setHelpView('main')} className="flex-1 h-11 rounded-xl font-bold border-slate-200 text-slate-600">Cancel</Button>
                <Button onClick={() => { if(!emailF.subject.trim()||!emailF.message.trim()){toast.error('Fill all fields');return;} toast.success('Support request submitted successfully'); setEmailF({subject:'',message:''}); setHelpView('main'); }} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold shadow-md shadow-blue-100"><Send className="h-4 w-4 mr-2"/>Send Email</Button>
              </div>
            </>)}
            {helpView==='issue' && (<>
              <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar">
                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Issue Type</label><select value={issueF.type} onChange={e => setIssueF(p=>({...p,type:e.target.value}))} className="appearance-none w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-400 text-slate-800 transition-all"><option value="">Select issue type…</option>{['Profile Issue','Job Match Issue','Resume Upload Issue','Notification Issue','Other'].map(t=><option key={t}>{t}</option>)}</select></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label><textarea rows={4} value={issueF.desc} onChange={e => setIssueF(p=>({...p,desc:e.target.value}))} placeholder="Describe the issue you are experiencing..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-400 resize-none transition-all"/></div>
                <div onClick={() => setIssueF(p=>({...p,file:!p.file}))} className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${issueF.file?'border-indigo-400 bg-indigo-50':'border-slate-200 hover:border-indigo-300 bg-white'}`}>
                  <HelpCircle className={`h-5 w-5 ${issueF.file?'text-indigo-500':'text-slate-300'}`}/>
                  <div><p className="text-sm font-bold text-slate-700">{issueF.file?'✅ Screenshot attached':'Attach Screenshot (optional)'}</p><p className="text-xs text-slate-400">{issueF.file?'Click to remove':'Click to simulate file attach'}</p></div>
                </div>
              </div>
              <div className="p-5 bg-white border-t border-slate-100 shrink-0 flex gap-3">
                <Button variant="outline" onClick={() => setHelpView('main')} className="flex-1 h-11 rounded-xl font-bold">Cancel</Button>
                <Button onClick={() => { if(!issueF.type||!issueF.desc.trim()){toast.error('Fill all fields');return;} toast.success('Issue reported successfully'); setIssueF({type:'',desc:'',file:false}); setHelpView('main'); }} className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold">Submit Issue</Button>
              </div>
            </>)}
          </div>
        )}


        {/* ── MESSAGES ── */}
        {view === 'messages' && (
          <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10">
            <SubHeader title="Messages" />
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {msgs.map((msg, i) => (
                <div key={i} className={`rounded-2xl p-4 border ${msg.from === 'me' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-1"><span className="text-xs font-black text-slate-700">{msg.name}</span><span className="text-[10px] text-slate-400 font-medium">{msg.time}</span></div>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{msg.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-blue-50 flex gap-2 shrink-0">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Type a message..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 text-slate-700" />
              <button onClick={sendChat} className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white flex items-center justify-center cursor-pointer shadow-md shadow-blue-100 transition-all"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        )}

      </div>

      {/* ── SIGN OUT MODAL ── */}
      {showSignOut && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowSignOut(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-7 text-center">
              <div className="h-14 w-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4"><LogOut className="h-7 w-7 text-rose-500" /></div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Sign Out?</h2>
              <p className="text-sm text-slate-500 font-medium">You will be returned to the dashboard.</p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <Button variant="outline" onClick={() => setShowSignOut(false)} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
              <Button onClick={handleSignOut} className="flex-1 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-md">Sign Out</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
