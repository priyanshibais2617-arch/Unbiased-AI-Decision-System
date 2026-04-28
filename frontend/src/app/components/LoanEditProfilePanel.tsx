import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Phone, Briefcase, Target, Check } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const LOAN_STORAGE_KEY = 'loanSetupProfile';
const EMPLOYMENT_TYPES = ['Salaried','Self-Employed / Business','Freelancer','Government Employee','Retired'];
const LOAN_PURPOSES = ['Home Loan','Personal Loan','Car / Vehicle Loan','Education Loan','Business Loan','Medical Emergency','Debt Consolidation','Travel Loan'];

export function LoanEditProfilePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', employment: '', purpose: '' });

  useEffect(() => {
    if (isOpen) {
      // Load from localStorage
      const saved = localStorage.getItem(LOAN_STORAGE_KEY);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          setForm({ fullName: p.fullName || '', email: p.email || '', mobile: p.mobile || '', employment: p.employment || '', purpose: p.purpose || '' });
        } catch {}
      } else {
        setForm({
          fullName: localStorage.getItem('userFullName') || '',
          email: localStorage.getItem('userEmail') || '',
          mobile: '', employment: '', purpose: '',
        });
      }
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleClose = () => { setVisible(false); setTimeout(() => { setMounted(false); onClose(); }, 320); };

  const handleSave = () => {
    const saved = localStorage.getItem(LOAN_STORAGE_KEY);
    const existing = saved ? JSON.parse(saved) : {};
    localStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify({ ...existing, ...form }));
    localStorage.setItem('userFullName', form.fullName);
    toast.success('Profile details updated successfully');
    handleClose();
  };

  if (!mounted) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }} onClick={handleClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out" style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-6 text-white relative flex-shrink-0 shadow-lg">
          <button onClick={handleClose} className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold tracking-tight mt-1">Edit Profile Info</h2>
          <p className="text-indigo-200 text-sm mt-0.5">Update your loan setup details</p>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                placeholder="Your full name"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
          </div>

          {/* Mobile */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 bg-gray-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 shrink-0">+91</span>
              <div className="relative flex-1">
                <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="tel" value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                  placeholder="98765 43210" maxLength={10}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Employment Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employment Type</label>
            <div className="relative">
              <Briefcase className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select value={form.employment} onChange={e => setForm(p => ({ ...p, employment: e.target.value }))}
                className="appearance-none w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800">
                <option value="">Select type…</option>
                {EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Loan Purpose */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loan Purpose</label>
            <div className="relative">
              <Target className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}
                className="appearance-none w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800">
                <option value="">Select purpose…</option>
                {LOAN_PURPOSES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Check className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-xs text-indigo-700 font-medium">Changes will update your saved loan setup details and reflect across the platform.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1 h-12 rounded-xl font-bold border-slate-200 text-slate-600">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Save Changes</Button>
          </div>
        </div>
      </div>
    </>
  );
}
