import { useState, useEffect } from "react";
import { X, User, Mail, Shield, CheckCircle2, AlertTriangle, Lock, FileText, FileCheck, Clock, XCircle, UploadCloud, Download, Settings, LogOut, ChevronRight, Fingerprint, History, ArrowLeft, Eye, Trash2, Send, Activity, ChevronDown, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const DUMMY_DOCS = [
  { id: 1, name: 'Aadhaar_Card.pdf', type: 'Aadhaar Card', date: 'Today, 10:42 AM', status: 'Verified', confidence: '99.8%' },
  { id: 2, name: 'PAN_Card.pdf', type: 'PAN Card', date: 'Today, 10:45 AM', status: 'Verified', confidence: '98.2%' },
  { id: 3, name: 'Salary_Slip_Mar.pdf', type: 'Salary Slip', date: 'Yesterday', status: 'Pending', confidence: '87.1%' },
  { id: 4, name: 'Bank_Statement.pdf', type: 'Bank Statement', date: '2 days ago', status: 'Verified', confidence: '95.6%' },
  { id: 5, name: 'Degree_Certificate.pdf', type: 'Degree Certificate', date: '3 days ago', status: 'Rejected', confidence: '41.3%' },
];

const DOC_TYPE_OPTIONS = ['Aadhaar Card','PAN Card','Passport','Driving License','Voter ID','Marksheet','Degree Certificate','Salary Slip','Bank Statement','Address Proof'];

export function DocumentUserProfilePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [view, setView] = useState('main');
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [docs, setDocs] = useState(DUMMY_DOCS);
  const [uploadType, setUploadType] = useState('');
  const [uploadFile, setUploadFile] = useState('');
  const [twoFA, setTwoFA] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [totalUploaded, setTotalUploaded] = useState(18);
  const [pending, setPending] = useState(3);

  const [docPF, setDocPF] = useState({ fullName: '', email: '', mobile: '', docTypes: [] as string[], prefTypes: '', address: '' });
  const [docTypeSearch, setDocTypeSearch] = useState('');
  const [docTypeOpen, setDocTypeOpen] = useState(false);

  useEffect(() => {
    const registeredName = localStorage.getItem('userFullName') || localStorage.getItem('userName') || '';
    const registeredEmail = localStorage.getItem('userEmail') || '';
    setUserName(registeredName || 'User');
    setUserEmail(registeredEmail || '');

    const saved = localStorage.getItem('docVerificationProfile');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setDocPF({
          fullName: registeredName || p.fullName || '',
          email: registeredEmail || p.email || '',
          mobile: p.mobile || '',
          docTypes: p.docTypes || [],
          prefTypes: p.prefTypes || '',
          address: p.address || ''
        });
      } catch {}
    } else {
      setDocPF({ fullName: registeredName, email: registeredEmail, mobile: '', docTypes: [], prefTypes: '', address: '' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
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

  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase() || 'U';
  const handleClose = () => { setVisible(false); setTimeout(() => { setMounted(false); onClose(); }, 320); };
  const handleSignOut = () => { setShowSignOut(false); handleClose(); toast.success('Signed out successfully'); setTimeout(() => navigate('/dashboard'), 350); };

  const handleDownloadReport = () => {
    const content = `DOCUMENT VERIFICATION REPORT\nGenerated: ${new Date().toLocaleString()}\n\nUSER DETAILS\nName: ${userName}\nEmail: ${userEmail}\n\nDOCUMENTS\n${docs.map(d => `- ${d.name} | ${d.type} | ${d.status} | AI Confidence: ${d.confidence}`).join('\n')}\n\nSUMMARY\nTotal Uploaded: ${totalUploaded}\nVerified: 14\nPending: ${pending}\nRejected: 1\n\nRISK SUMMARY\nNo major tampering detected. 3 documents pending review.\nAI Confidence Average: 91.2%`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'verification_report.txt'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Verification report downloaded successfully');
  };

  const handleUploadDoc = () => {
    if (!uploadType || !uploadFile) { toast.error('Please select document type and file'); return; }
    const newDoc = { id: Date.now(), name: uploadFile, type: uploadType, date: 'Just now', status: 'Pending', confidence: '—' };
    setDocs(d => [newDoc, ...d]);
    setTotalUploaded(t => t + 1);
    setPending(p => p + 1);
    toast.success('Document uploaded successfully');
    setUploadType(''); setUploadFile('');
    setView('main');
  };

  const handleUpdatePassword = () => {
    if (!pw.current) { toast.error('Enter your current password'); return; }
    if (pw.next.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pw.next !== pw.confirm) { toast.error('Passwords do not match'); return; }
    toast.success('Password updated successfully');
    setPw({ current: '', next: '', confirm: '' });
  };

  if (!mounted) return null;

  const SubHeader = ({ title }: { title: string }) => (
    <div className="bg-gradient-to-r from-[#0f172a] via-[#123b7a] to-[#075bea] p-4 text-white flex items-center gap-3 shrink-0">
      <button onClick={() => setView('main')} className="p-2 hover:bg-white/20 rounded-full cursor-pointer transition-colors"><ArrowLeft className="h-5 w-5"/></button>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );

  const PrefBtn = ({ label, icon: Icon, action }: { label: string; icon: any; action: () => void }) => (
    <button onClick={action} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-[#075bea] hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group cursor-pointer">
      <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-slate-400 group-hover:text-[#075bea]"/><span className="text-sm font-semibold">{label}</span></div>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#075bea] group-hover:translate-x-1 transition-all"/>
    </button>
  );

  const statusColor = (s: string) => s === 'Verified' ? 'text-[#075bea] bg-blue-50' : s === 'Pending' ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }} onClick={handleClose}/>
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[100] flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-100" style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* ── MAIN ── */}
        {view === 'main' && (<>
          <div className="bg-gradient-to-br from-[#0f172a] via-[#123b7a] to-[#075bea] p-6 text-white relative flex-shrink-0">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full cursor-pointer" onClick={handleClose}><X className="h-5 w-5"/></Button>
            <div className="flex items-center gap-4 mt-2">
              <div className="relative shrink-0">
                <div className="h-16 w-16 rounded-full bg-white text-[#075bea] flex items-center justify-center text-xl font-black shadow-lg ring-4 ring-white/20">{initials}</div>
                <div className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 bg-sky-400 border-2 border-white rounded-full"/>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight truncate flex items-center gap-2">{userName} <Shield className="h-4 w-4 text-cyan-300 shrink-0"/></h2>
                <div className="flex items-center gap-1.5 text-blue-100 text-sm font-medium mt-1"><Mail className="h-3 w-3 shrink-0"/><span className="truncate">{userEmail}</span></div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[['✅','Verified'],['⏳','Pending Review'],['🔒','Secure Storage']].map(([icon, label]) => (
                    <span key={label} className="text-[10px] font-bold bg-white/15 border border-white/20 text-white px-2 py-0.5 rounded-full">{icon} {label}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 bg-white/10 backdrop-blur-md rounded-xl p-3 flex justify-between items-center border border-white/20">
              <div><p className="text-[11px] uppercase tracking-wider font-bold text-blue-100">Verification Strength</p><div className="flex items-center gap-2 mt-0.5"><p className="font-bold text-sm">92%</p><Shield className="h-3 w-3 text-sky-300"/></div></div>
              <Progress value={92} className="w-24 h-2 [&>div]:bg-white bg-blue-950/50"/>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 custom-scrollbar pb-6 space-y-5 pt-5">
            {/* Overview Cards */}
            <div className="px-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FileCheck className="h-4 w-4 text-[#075bea]"/> Verification Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                {[{label:'Total Uploaded',val:totalUploaded,color:'text-blue-600'},{label:'Verified',val:14,color:'text-[#075bea]'},{label:'Pending',val:pending,color:'text-amber-600'},{label:'Rejected',val:1,color:'text-rose-600'}].map((c,i)=>(
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{c.label}</span>
                    <span className={`text-2xl font-black tracking-tight ${c.color}`}>{c.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="px-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Fingerprint className="h-4 w-4"/> AI Document Insights</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
                {[{icon:CheckCircle2,bg:'bg-blue-100',ic:'text-[#075bea]',msg:'No tampering detected in ID Proof',sub:'AI Confidence: 99.8%'},{icon:Shield,bg:'bg-blue-100',ic:'text-[#075bea]',msg:'Bank Statement verified successfully',sub:'Cryptographic Match'},{icon:Clock,bg:'bg-amber-100',ic:'text-amber-600',msg:'Salary Slip under review',sub:'Manual inspection required'}].map((item,i)=>(
                  <div key={i} className="flex items-center gap-3">
                    <div className={`h-9 w-9 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}><item.icon className={`h-4 w-4 ${item.ic}`}/></div>
                    <div><span className="text-sm font-bold text-slate-800 block">{item.msg}</span><span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{item.sub}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security & Activity */}
            <div className="px-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><History className="h-4 w-4"/> Security & Activity</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 space-y-1">
                {[{icon:UploadCloud,bg:'bg-blue-50',ic:'text-blue-600',label:'Last Upload Date',val:'Today, 10:42 AM'},{icon:Shield,bg:'bg-purple-50',ic:'text-purple-600',label:'Recent Status',val:'Verified'},{icon:Lock,bg:'bg-slate-100',ic:'text-slate-600',label:'Login Activity',val:'Active'}].map((row,i)=>(
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3"><div className={`h-9 w-9 rounded-xl ${row.bg} ${row.ic} flex items-center justify-center`}><row.icon className="h-4 w-4"/></div><span className="text-sm font-semibold text-slate-700">{row.label}</span></div>
                    <span className="text-xs font-bold text-slate-500">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-200 w-full"/>

            {/* Actions */}
            <div className="px-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Settings className="h-4 w-4"/> Actions</h3>
              <div className="space-y-1">
                <PrefBtn label="Edit Profile Info" icon={User} action={() => setView('editprofile')}/>
                <PrefBtn label="View All Documents" icon={FileText} action={() => setView('docs')}/>
                <PrefBtn label="Upload New Document" icon={UploadCloud} action={() => setView('upload')}/>
                <PrefBtn label="Download Verification Report" icon={Download} action={handleDownloadReport}/>
                <PrefBtn label="Security Settings" icon={Settings} action={() => setView('security')}/>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 p-5 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <Button variant="outline" onClick={() => setShowSignOut(true)} className="w-full h-11 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center gap-2 font-bold shadow-sm transition-colors cursor-pointer">
              <LogOut className="h-4 w-4"/> Sign Out
            </Button>
          </div>
        </>)}
        {/* ── EDIT PROFILE ── */}
        {view === 'editprofile' && (
          <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10">
            <SubHeader title="Edit Profile Information"/>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                <input type="text" value={docPF.fullName} onChange={e => setDocPF(p => ({...p, fullName: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#075bea] transition-all"/>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                <div className="relative">
                  <input type="email" value={docPF.email} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed"/>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-[#075bea] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    <CheckCircle2 className="h-3 w-3"/> Verified
                  </span>
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Mobile Number</label>
                <input type="tel" value={docPF.mobile} onChange={e => setDocPF(p => ({...p, mobile: e.target.value.replace(/\D/g,'').slice(0,10)}))} placeholder="98765 43210" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#075bea] transition-all"/>
              </div>

              {/* Document Types Multi-select */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Document Types Selected</label>
                <div 
                  className={`w-full bg-white border rounded-xl px-3 py-2 flex flex-wrap gap-1.5 min-h-[46px] cursor-text transition-all ${docTypeOpen ? 'border-[#075bea] ring-2 ring-blue-500/10' : 'border-slate-200'}`}
                  onClick={() => setDocTypeOpen(true)}
                >
                  {docPF.docTypes.map(dt => (
                    <span key={dt} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#075bea] text-[11px] font-bold border border-blue-100">
                      {dt}
                      <button type="button" onClick={e => { e.stopPropagation(); setDocPF(p => ({...p, docTypes: p.docTypes.filter(d => d !== dt)})); }} className="hover:text-rose-500 transition-colors ml-0.5"><X className="h-3 w-3"/></button>
                    </span>
                  ))}
                  <input 
                    value={docTypeSearch}
                    onChange={e => { setDocTypeSearch(e.target.value); setDocTypeOpen(true); }}
                    onFocus={() => setDocTypeOpen(true)}
                    onBlur={() => setTimeout(() => setDocTypeOpen(false), 200)}
                    placeholder={docPF.docTypes.length === 0 ? "Select document types..." : "Add more..."}
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 py-0.5"
                  />
                  <ChevronDown className={`h-4 w-4 self-center text-slate-400 shrink-0 transition-transform ${docTypeOpen ? 'rotate-180' : ''}`}/>
                </div>
                {docTypeOpen && (
                  <div className="relative z-50">
                    <div className="absolute mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {DOC_TYPE_OPTIONS.filter(t => t.toLowerCase().includes(docTypeSearch.toLowerCase()) && !docPF.docTypes.includes(t)).map(opt => (
                        <button key={opt} type="button" onClick={() => { setDocPF(p => ({...p, docTypes: [...p.docTypes, opt]})); setDocTypeSearch(''); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pref Types */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Preferred Verification Types</label>
                <input type="text" value={docPF.prefTypes} onChange={e => setDocPF(p => ({...p, prefTypes: e.target.value}))} placeholder="e.g. In-person, Online AI" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#075bea] transition-all"/>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Address</label>
                <textarea rows={3} value={docPF.address} onChange={e => setDocPF(p => ({...p, address: e.target.value}))} placeholder="Your residential address" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#075bea] transition-all resize-none"/>
              </div>
            </div>
            <div className="p-5 bg-white border-t border-slate-100 shrink-0 flex gap-3">
              <Button variant="outline" onClick={() => setView('main')} className="flex-1 h-11 rounded-xl font-bold">Cancel</Button>
              <Button 
                onClick={() => {
                  localStorage.setItem('docVerificationProfile', JSON.stringify(docPF));
                  localStorage.setItem('userFullName', docPF.fullName);
                  setUserName(docPF.fullName);
                  toast.success('Profile updated successfully');
                  setView('main');
                }} 
                className="flex-1 h-11 rounded-xl bg-[#075bea] hover:bg-[#054fd0] text-white font-bold shadow-md shadow-blue-200"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* ── VIEW ALL DOCS ── */}
        {view === 'docs' && (
          <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10">
            <SubHeader title="All Documents"/>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {docs.map(doc => (
                <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{doc.type} · {doc.date}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${statusColor(doc.status)}`}>{doc.status}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold">AI Confidence: {doc.confidence}</span>
                    <div className="flex gap-2">
                      <button onClick={() => toast.success(`Previewing ${doc.name}`)} className="text-xs font-bold text-[#075bea] hover:underline cursor-pointer flex items-center gap-1"><Eye className="h-3 w-3"/>Preview</button>
                      <button onClick={() => { const b = new Blob([`Document: ${doc.name}\nType: ${doc.type}\nStatus: ${doc.status}\nConfidence: ${doc.confidence}`], {type:'text/plain'}); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download=doc.name+'.txt'; a.click(); URL.revokeObjectURL(u); toast.success('Download started'); }} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"><Download className="h-3 w-3"/>Download</button>
                      <button onClick={() => { setDocs(d => d.filter(x => x.id !== doc.id)); setTotalUploaded(t => t-1); toast.success('Document removed'); }} className="text-xs font-bold text-rose-500 hover:underline cursor-pointer flex items-center gap-1"><Trash2 className="h-3 w-3"/>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── UPLOAD ── */}
        {view === 'upload' && (
          <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10">
            <SubHeader title="Upload New Document"/>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document Type</label>
                <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="appearance-none w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#075bea] transition-all text-slate-800">
                  <option value="">Select type…</option>
                  {DOC_TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div onClick={() => setUploadFile(uploadFile ? '' : 'document_' + Date.now() + '.pdf')}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${uploadFile ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}>
                <UploadCloud className={`h-10 w-10 mb-3 ${uploadFile ? 'text-[#075bea]' : 'text-slate-300'}`}/>
                <p className="text-sm font-bold text-slate-700">{uploadFile ? '✅ ' + uploadFile : 'Click to select file'}</p>
                <p className="text-xs text-slate-400 mt-1">{uploadFile ? 'Click to remove' : 'PDF, JPG, PNG supported (demo)'}</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 font-medium">
                📋 Document will be queued for AI verification. Results appear within minutes.
              </div>
            </div>
            <div className="p-5 bg-white border-t border-slate-100 shrink-0">
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setView('main')} className="flex-1 h-11 rounded-xl font-bold">Cancel</Button>
                <Button onClick={handleUploadDoc} className="flex-1 h-11 rounded-xl bg-[#075bea] hover:bg-[#054fd0] text-white font-bold"><UploadCloud className="h-4 w-4 mr-2"/>Upload</Button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECURITY ── */}
        {view === 'security' && (
          <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10">
            <SubHeader title="Security Settings"/>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {/* Change Password */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1"><div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center"><Lock className="h-4 w-4 text-indigo-600"/></div><h3 className="text-sm font-bold text-slate-800">Change Password</h3></div>
                {[{field:'current',label:'Current Password',ph:'Current password'},{field:'next',label:'New Password',ph:'Min. 6 characters'},{field:'confirm',label:'Confirm New Password',ph:'Repeat new password'}].map(({field,label,ph})=>(
                  <div key={field} className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                    <input type="password" value={pw[field as keyof typeof pw]} onChange={e => setPw(p => ({...p, [field]: e.target.value}))} placeholder={ph} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#075bea] transition-all"/>
                  </div>
                ))}
                <Button onClick={handleUpdatePassword} className="w-full h-11 rounded-xl bg-[#075bea] hover:bg-[#054fd0] text-white font-bold">Update Password</Button>
              </div>
              {/* 2FA */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center"><Activity className="h-4 w-4 text-purple-600"/></div><div><p className="text-sm font-bold text-slate-800">Two-Factor Authentication</p><p className="text-xs text-slate-400">{twoFA ? 'Enabled' : 'Disabled'}</p></div></div>
                  <button onClick={() => { const n = !twoFA; setTwoFA(n); toast.success(n ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled'); }} className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${twoFA ? 'bg-[#075bea]' : 'bg-slate-200'}`}><div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform ${twoFA ? 'translate-x-5' : 'translate-x-0'}`}/></button>
                </div>
              </div>
              {/* Login Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-4"><div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center"><History className="h-4 w-4 text-[#075bea]"/></div><h3 className="text-sm font-bold text-slate-800">Login Activity</h3></div>
                {[['Last Login','Today, 12:40 PM','text-[#075bea]'],['Device','Chrome on Windows','text-slate-700'],['Location','India 🇮🇳','text-slate-700']].map(([k,v,c])=>(
                  <div key={k} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{k}</span><span className={`text-sm font-semibold ${c}`}>{v}</span></div>
                ))}
                <div className="mt-3 p-2.5 bg-blue-50 border border-blue-100 rounded-xl"><p className="text-xs text-[#075bea] font-semibold flex items-center gap-1.5"><Shield className="h-3.5 w-3.5"/>No suspicious activity detected</p></div>
              </div>
              {/* Secure Logout */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-3"><div className="h-8 w-8 bg-rose-100 rounded-lg flex items-center justify-center"><LogOut className="h-4 w-4 text-rose-500"/></div><h3 className="text-sm font-bold text-slate-800">Secure Logout</h3></div>
                <p className="text-xs text-slate-500 font-medium mb-3">Sign out from all devices and clear your session.</p>
                <Button variant="outline" onClick={() => { toast.success('Logged out successfully'); handleClose(); }} className="w-full h-11 rounded-xl font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border-rose-200"><LogOut className="h-4 w-4 mr-2"/>Sign Out from All Devices</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sign Out Modal */}
      {showSignOut && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowSignOut(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-7 text-center">
              <div className="h-14 w-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4"><LogOut className="h-7 w-7 text-rose-500"/></div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Are you sure?</h2>
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
