import { useState, useEffect } from "react";
import { X, User, Mail, Phone, ShieldCheck, Settings, Lock, Bell, HelpCircle, LogOut, Download, FileText, Activity, TrendingUp, CheckCircle, ChevronRight, Check, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { LoanSecurityPanel } from "./LoanSecurityPanel";
import { LoanEditProfilePanel } from "./LoanEditProfilePanel";
import { LoanNotificationsPanel } from "./LoanNotificationsPanel";
import { LoanHelpPanel } from "./LoanHelpPanel";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const LOAN_STORAGE_KEY = 'loanSetupProfile';

export function LoanUserProfilePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [showLoanSummary, setShowLoanSummary] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Profile data from localStorage
  const [profile, setProfile] = useState({ fullName: '', email: '', mobile: '', employment: '', purpose: '' });

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(LOAN_STORAGE_KEY);
      if (saved) {
        try { setProfile(JSON.parse(saved)); } catch {}
      } else {
        setProfile({
          fullName: localStorage.getItem('userFullName') || 'User',
          email: localStorage.getItem('userEmail') || '',
          mobile: '', employment: 'Salaried', purpose: 'Personal Loan',
        });
      }
      setMounted(true);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      document.body.style.overflow = '';
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(() => { setMounted(false); onClose(); }, 320); };

  const initials = profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'U';

  // Download Full Report
  const handleDownloadReport = () => {
    const content = `LOAN FULL REPORT\nGenerated: ${new Date().toLocaleString()}\n\n` +
      `PROFILE\nName: ${profile.fullName}\nEmail: ${profile.email}\nMobile: +91 ${profile.mobile}\nEmployment: ${profile.employment}\nLoan Purpose: ${profile.purpose}\n\n` +
      `FINANCIAL HEALTH\nCredit Score: 785 (Excellent)\nDTI Ratio: 8.5%\nFinancial Health Score: 85/100\n\n` +
      `AI ASSESSMENT\nApproval Probability: 92%\nRisk Level: Low Risk\nStatus: Approved\n\n` +
      `SELECTED BANK\nBank: HDFC Bank\nInterest Rate: 8.5% p.a.\nTenure: 5 Years\nMonthly EMI: ₹85,940\nTotal Payable: ₹51,56,400\nProcessing Fee: ₹1,200\n\n` +
      `AI RECOMMENDATION\nLowest rate + premium partner. Best debt-to-income ratio match for your profile.\n\n` +
      `DOCUMENT STATUS\nIdentity Proof: Uploaded\nAddress Proof: Uploaded\nSalary Slips: Uploaded\nBank Statements: Uploaded\nEmployment Proof: Uploaded`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'loan_full_report.txt'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Full report downloaded successfully');
  };

  // Download Loan Summary
  const handleDownloadSummary = () => {
    const content = `LOAN SUMMARY\nGenerated: ${new Date().toLocaleString()}\n\n` +
      `Loan Purpose: ${profile.purpose || 'Personal Loan'}\nSelected Bank: HDFC Bank\nEstimated Amount: ₹41,50,000\nInterest Rate: 8.5% p.a.\nTenure: 5 Years\nMonthly EMI: ₹85,940\nTotal Payable: ₹51,56,400\nCurrent Status: Approved`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'loan_summary.txt'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Loan summary downloaded successfully');
  };

  // Confirm Logout
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    handleClose();
    toast.success('Logged out successfully');
    setTimeout(() => navigate('/dashboard'), 350);
  };

  if (!mounted) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }} onClick={handleClose} />
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[100] flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-100" style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-6 text-white relative flex-shrink-0">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full cursor-pointer" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4 mt-2">
            <div className="h-16 w-16 rounded-full bg-white text-indigo-700 flex items-center justify-center text-xl font-black shadow-lg ring-4 ring-white/20 shrink-0">{initials}</div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight truncate flex items-center gap-2">{profile.fullName || 'User'} <ShieldCheck className="h-4 w-4 text-green-400 shrink-0" /></h2>
              <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mt-1"><Mail className="h-3 w-3 shrink-0" /><span className="truncate">{profile.email}</span></div>
              {profile.mobile && <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mt-0.5"><Phone className="h-3 w-3 shrink-0" />+91 {profile.mobile}</div>}
            </div>
          </div>
          <div className="mt-5 bg-white/10 backdrop-blur-md rounded-xl p-3 flex justify-between items-center border border-white/20">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-indigo-200">Profile Completion</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-bold text-sm">85%</p>
                <Badge className="bg-green-500/20 text-green-200 hover:bg-green-500/20 border-green-400/30 text-[10px] py-0 px-1.5 h-4 flex items-center">AI Verified</Badge>
              </div>
            </div>
            <Progress value={85} className="w-24 h-2 [&>div]:bg-white bg-indigo-900/50" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 custom-scrollbar pb-6 space-y-5 pt-5">

          {/* Loan Details Card */}
          <div className="px-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Employment</span>
                  <span className="text-sm font-semibold text-slate-800">{profile.employment || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Loan Purpose</span>
                  <span className="text-sm font-semibold text-slate-800">{profile.purpose || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="px-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4"/> Financial Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Credit Score', val: '785', sub: 'Excellent', valColor: 'text-green-600' },
                { label: 'DTI Ratio', val: '8.5%', sub: 'Low', valColor: 'text-indigo-600' },
                { label: 'Health Score', val: '85/100', sub: '+4 pts', valColor: 'text-slate-800' },
                { label: 'Risk Level', val: 'Low', sub: 'AI Assessed', valColor: 'text-green-600' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{item.label}</span>
                  <span className={`text-lg font-black tracking-tight ${item.valColor}`}>{item.val}</span>
                  <span className="text-[10px] text-slate-400 font-bold block">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Application */}
          <div className="px-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Activity className="h-4 w-4"/> Current Application</h3>
            <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-sm border border-indigo-100 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-500 block mb-0.5">Status</span>
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-500" /> Approved</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Approval Chance</span>
                  <span className="text-sm font-black text-slate-800">92%</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-indigo-100/50">
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">Low Risk</span>
                <span className="text-[10px] font-bold text-slate-400">Updated: 2 hrs ago</span>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="px-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4"/> AI Insights</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
              <p className="text-xs text-slate-600 mb-3 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 font-medium leading-relaxed italic">"Your profile shows strong repayment capacity with low risk. Income stability and low EMI load are key strengths."</p>
              {['High Income Stability','Low EMI Load','Excellent Credit Behavior'].map(s => (
                <div key={s} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" /><span className="text-xs font-semibold text-slate-700">{s}</span></div>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-200 w-full" />

          {/* Settings */}
          <div className="px-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Settings className="h-4 w-4"/> Settings</h3>
            <div className="space-y-1">
              {[
                { label: 'Edit Profile Info', icon: User, action: () => setIsEditProfileOpen(true) },
                { label: 'Security Settings', icon: Lock, action: () => setIsSecurityOpen(true) },
                { label: 'Notification Preferences', icon: Bell, action: () => setIsNotificationsOpen(true) },
                { label: 'Help & Support', icon: HelpCircle, action: () => setIsHelpOpen(true) },
              ].map((item, i) => (
                <button key={i} onClick={item.action} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3"><item.icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" /><span className="text-sm font-semibold">{item.label}</span></div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-5 bg-white border-t border-slate-100 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3">
            <Button onClick={() => setShowFullReport(true)} className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 font-bold border-0 shadow-none cursor-pointer">
              <FileText className="h-4 w-4 mr-2" /> Full Report
            </Button>
            <Button onClick={() => setShowLoanSummary(true)} className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200 cursor-pointer">
              <Download className="h-4 w-4 mr-2" /> Loan Summary
            </Button>
          </div>
          <Button variant="outline" onClick={() => setShowLogoutConfirm(true)} className="w-full h-11 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center gap-2 font-bold shadow-sm transition-colors cursor-pointer">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>

        {/* Sub-panels */}
        <LoanSecurityPanel isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
        <LoanEditProfilePanel isOpen={isEditProfileOpen} onClose={() => { setIsEditProfileOpen(false); const s = localStorage.getItem(LOAN_STORAGE_KEY); if(s) try { setProfile(JSON.parse(s)); } catch {} }} />
        <LoanNotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        <LoanHelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>

      {/* ── FULL REPORT MODAL ── */}
      {showFullReport && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowFullReport(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white flex-shrink-0">
              <div className="flex justify-between items-start">
                <div><h2 className="text-xl font-black">Loan Full Report</h2><p className="text-indigo-200 text-sm mt-0.5">Complete AI-generated assessment</p></div>
                <button onClick={() => setShowFullReport(false)} className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center cursor-pointer"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {/* Profile */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Profile Details</h3>
                {[['Name', profile.fullName || '—'],['Email', profile.email || '—'],['Mobile', profile.mobile ? `+91 ${profile.mobile}` : '—'],['Employment', profile.employment || '—'],['Loan Purpose', profile.purpose || '—']].map(([k,v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-bold text-slate-500">{k}</span>
                    <span className="text-xs font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
              {/* Financial */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Financial Health</h3>
                {[['Health Score','85/100'],['Credit Score','785 (Excellent)'],['DTI Ratio','8.5%'],['Approval Probability','92%'],['Risk Level','Low Risk']].map(([k,v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-bold text-slate-500">{k}</span>
                    <span className="text-xs font-semibold text-indigo-700">{v}</span>
                  </div>
                ))}
              </div>
              {/* Bank & EMI */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Selected Bank & EMI</h3>
                {[['Bank','HDFC Bank'],['Interest Rate','8.5% p.a.'],['Tenure','5 Years'],['Monthly EMI','₹85,940'],['Total Payable','₹51,56,400'],['Processing Fee','₹1,200']].map(([k,v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-bold text-slate-500">{k}</span>
                    <span className="text-xs font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
              {/* AI Rec */}
              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">AI Recommendation</h3>
                <p className="text-xs text-indigo-800 font-medium leading-relaxed">"Lowest rate + premium partner. Best debt-to-income ratio match for your profile. Your income stability and low EMI load make you a strong candidate."</p>
              </div>
              {/* Docs */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Document Status</h3>
                {['Identity Proof','Address Proof','Salary Slips (3–6 months)','Bank Statements (6 months)','Employment Proof'].map(doc => (
                  <div key={doc} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{doc}</span>
                    <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Uploaded</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3 flex-shrink-0">
              <Button variant="outline" onClick={() => setShowFullReport(false)} className="flex-1 h-11 rounded-xl font-bold">Close</Button>
              <Button onClick={handleDownloadReport} className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                <Download className="h-4 w-4 mr-2" /> Download Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOAN SUMMARY MODAL ── */}
      {showLoanSummary && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowLoanSummary(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-5 text-white flex justify-between items-start flex-shrink-0">
              <div><h2 className="text-lg font-black">Loan Summary</h2><p className="text-indigo-200 text-xs mt-0.5">Quick overview of your loan</p></div>
              <button onClick={() => setShowLoanSummary(false)} className="h-7 w-7 rounded-full hover:bg-white/20 flex items-center justify-center cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-1">
              {[
                ['Loan Purpose', profile.purpose || 'Personal Loan'],
                ['Selected Bank', 'HDFC Bank'],
                ['Estimated Amount', '₹41,50,000'],
                ['Interest Rate', '8.5% p.a.'],
                ['Tenure', '5 Years'],
                ['Monthly EMI', '₹85,940'],
                ['Total Payable', '₹51,56,400'],
                ['Current Status', 'Approved ✅'],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-bold text-slate-500">{k}</span>
                  <span className="text-sm font-bold text-slate-800">{v}</span>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <Button variant="outline" onClick={() => setShowLoanSummary(false)} className="flex-1 h-11 rounded-xl font-bold">Close</Button>
              <Button onClick={() => { handleDownloadSummary(); setShowLoanSummary(false); }} className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOGOUT CONFIRMATION ── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-7 text-center">
              <div className="h-14 w-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="h-7 w-7 text-rose-500" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Are you sure?</h2>
              <p className="text-sm text-slate-500 font-medium">You will be returned to the dashboard.</p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <Button variant="outline" onClick={() => setShowLogoutConfirm(false)} className="flex-1 h-12 rounded-xl font-bold border-slate-200">Cancel</Button>
              <Button onClick={handleConfirmLogout} className="flex-1 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-md">Logout</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
