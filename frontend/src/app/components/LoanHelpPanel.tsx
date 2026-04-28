import { useState, useEffect, useRef } from "react";
import { ArrowLeft, HelpCircle, Mail, MessageCircle, AlertCircle, ChevronDown, ChevronUp, Send, X } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const ISSUE_TYPES = ['Login Issue','Report Download Issue','Loan Summary Issue','Profile Update Issue','Other'];

const DUMMY_REPLIES = [
  "Thank you for reaching out! Our team will look into this right away.",
  "I understand your concern. Let me check that for you.",
  "Great question! This is usually resolved within 24 hours.",
  "Could you provide a bit more detail? We want to make sure we help you correctly.",
  "I've escalated this to our loan support team. You'll hear back soon!"
];

export function LoanHelpPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<'main'|'chat'|'email'|'issue'>('main');

  // Chat state
  const [messages, setMessages] = useState<{from:'user'|'support'; text:string}[]>([
    { from: 'support', text: "Hi! How can we help you with your loan account?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Email state
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });

  // Issue state
  const [issueForm, setIssueForm] = useState({ type: '', description: '', file: false });

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => { setMounted(false); setView('main'); }, 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleClose = () => { setVisible(false); setTimeout(() => { setMounted(false); onClose(); }, 320); };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages(m => [...m, { from: 'user', text }]);
    setChatInput('');
    setTimeout(() => {
      const reply = DUMMY_REPLIES[Math.floor(Math.random() * DUMMY_REPLIES.length)];
      setMessages(m => [...m, { from: 'support', text: reply }]);
    }, 900);
  };

  const sendEmail = () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) { toast.error('Please fill all fields'); return; }
    toast.success('Support email submitted successfully');
    setEmailForm({ subject: '', message: '' });
    setView('main');
  };

  const submitIssue = () => {
    if (!issueForm.type || !issueForm.description.trim()) { toast.error('Please fill all fields'); return; }
    toast.success('Issue reported successfully');
    setIssueForm({ type: '', description: '', file: false });
    setView('main');
  };

  if (!mounted) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }} onClick={handleClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out" style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-6 text-white relative flex-shrink-0 shadow-lg">
          <button onClick={view === 'main' ? handleClose : () => setView('main')} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="mt-2">
            <h2 className="text-xl font-bold tracking-tight">
              {view === 'main' ? 'Help & Support' : view === 'chat' ? 'Live Chat' : view === 'email' ? 'Email Support' : 'Report an Issue'}
            </h2>
            <p className="text-indigo-200 text-sm mt-0.5">
              {view === 'main' ? 'Need help with your loan? We\'re here for you.' : view === 'chat' ? 'Chat with our support team' : view === 'email' ? 'Send us your query' : 'Let us know what went wrong'}
            </p>
          </div>
        </div>

        {/* ── MAIN VIEW ── */}
        {view === 'main' && (
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">

            {/* 3 action cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Live Chat', icon: MessageCircle, color: 'bg-indigo-50 text-indigo-600', view: 'chat' as const },
                { label: 'Email Support', icon: Mail, color: 'bg-purple-50 text-purple-600', view: 'email' as const },
                { label: 'Report Issue', icon: AlertCircle, color: 'bg-amber-50 text-amber-600', view: 'issue' as const },
              ].map(item => (
                <button key={item.label} onClick={() => setView(item.view)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer">
                  <div className={`h-11 w-11 ${item.color} rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Frequently Asked Questions</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { q: "How is my loan approval chance calculated?", a: "Our AI processes your CIBIL score, monthly income, employment state, and existing liabilities to predict approval probabilities instantly." },
                  { q: "Can I update my employment details later?", a: "Yes, use Edit Profile Info in the Settings section. Any changes may trigger a recalculation of your loan offers." },
                  { q: "Why is my EMI higher than expected?", a: "EMI is affected by the interest rate and tenure selected. Try extending the tenure in the EMI calculator for a smaller monthly deduction." },
                ].map((faq, idx) => {
                  const [open, setOpen] = useState(idx === 0);
                  return (
                    <div key={idx} className="p-4">
                      <button onClick={() => setOpen(o => !o)} className="w-full flex justify-between items-center text-left">
                        <span className="text-sm font-semibold text-slate-700 pr-3">{faq.q}</span>
                        {open ? <ChevronUp className="h-4 w-4 text-indigo-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                      </button>
                      {open && <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">{faq.a}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── LIVE CHAT VIEW ── */}
        {view === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.from === 'support' && (
                    <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0 mr-2 mt-0.5">S</div>
                  )}
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                    msg.from === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                  }`}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
              <input
                value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
              />
              <button onClick={sendChat} className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {/* ── EMAIL SUPPORT VIEW ── */}
        {view === 'email' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                <input type="text" value={emailForm.subject} onChange={e => setEmailForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Issue with my loan report"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                <textarea rows={6} value={emailForm.message} onChange={e => setEmailForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" />
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-medium">
                📧 Our support team typically responds within 24 hours on business days.
              </div>
            </div>
            <div className="p-5 bg-white border-t border-slate-100 shrink-0">
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setView('main')} className="flex-1 h-11 rounded-xl font-bold">Cancel</Button>
                <Button onClick={sendEmail} className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  <Send className="h-4 w-4 mr-2" /> Send Email
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── REPORT ISSUE VIEW ── */}
        {view === 'issue' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Type</label>
                <select value={issueForm.type} onChange={e => setIssueForm(p => ({ ...p, type: e.target.value }))}
                  className="appearance-none w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800">
                  <option value="">Select issue type…</option>
                  {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea rows={5} value={issueForm.description} onChange={e => setIssueForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the issue you're experiencing..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" />
              </div>
              <div
                onClick={() => setIssueForm(p => ({ ...p, file: !p.file }))}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${issueForm.file ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${issueForm.file ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{issueForm.file ? '✅ Screenshot attached' : 'Attach Screenshot (optional)'}</p>
                  <p className="text-xs text-slate-400">{issueForm.file ? 'Click to remove' : 'Click to simulate file attach'}</p>
                </div>
              </div>
            </div>
            <div className="p-5 bg-white border-t border-slate-100 shrink-0">
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setView('main')} className="flex-1 h-11 rounded-xl font-bold">Cancel</Button>
                <Button onClick={submitIssue} className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold">Submit Issue</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
