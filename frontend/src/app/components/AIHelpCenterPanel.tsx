import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, MessageSquare, FileText, HelpCircle, Send, AlertCircle,
  ListChecks, ChevronDown, CheckCircle2, Upload, ClipboardList,
  PenLine, UserCheck, Edit3, Save, Loader2, Wrench, GraduationCap,
  BookOpen, FilePlus, Sparkles, CheckCircle, RefreshCcw
} from "lucide-react";
import { Button } from "./ui/button";

// ─── Fix Issue Toast ──────────────────────────────────────────────────────────
function FixToast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2800); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-2xl text-sm whitespace-nowrap"
    >
      <CheckCircle2 className="h-5 w-5 shrink-0" />
      {msg}
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </motion.div>
  );
}

// ─── Fix Issue Modal ──────────────────────────────────────────────────────────
const FIX_ISSUES = [
  {
    id: 0,
    title: "Missing academic transcripts",
    desc: "Academic transcripts haven't been uploaded.",
    icon: Upload,
    type: "document",
    items: ["Upload Transcript", "Upload Certificate"]
  },
  {
    id: 1,
    title: "Low core subject scores",
    desc: "Weak performance in core subjects detected.",
    icon: ClipboardList,
    type: "improvement",
    items: ["Improve subject scores", "Complete practice modules"]
  },
  {
    id: 2,
    title: "Incomplete admission/scholarship details",
    desc: "Form has empty required fields.",
    icon: Edit3,
    type: "form",
    items: ["Scholarship info", "Admission details"]
  },
];

function FixApplicationModal({
  isOpen,
  onClose,
  onAllFixed,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAllFixed: () => void;
}) {
  const [fixedIds, setFixedIds] = useState<number[]>([]);
  const [fixingId, setFixingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isRechecking, setIsRechecking] = useState(false);
  const [status, setStatus] = useState<"issue" | "ready">("issue");

  const showToast = (msg: string) => setToast(msg);

  const handleFix = (issueId: number, msg: string) => {
    setFixingId(issueId);
    setTimeout(() => {
      setFixingId(null);
      setFixedIds(prev => [...prev, issueId]);
      showToast(msg);
    }, 1500);
  };

  const handleRecheck = () => {
    setIsRechecking(true);
    setTimeout(() => {
      setIsRechecking(false);
      setStatus("ready");
      onAllFixed();
    }, 2000);
  };

  if (!isOpen) return null;

  const progress = Math.round((fixedIds.length / FIX_ISSUES.length) * 100);
  const allFixed = fixedIds.length === FIX_ISSUES.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100 max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-slate-900 p-8 text-white relative shrink-0">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Wrench className="h-24 w-24" /></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-400" /> AI Application Fix Assistant
                </h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">Step-by-step resolution of detected issues</p>
              </div>
              <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Section */}
            <div className="mt-8 relative z-10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Fix Progress</span>
                <span className="text-sm font-black text-amber-400">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div 
            className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50"
            style={{ maxHeight: 'calc(90vh - 200px)' }}
          >
            {status === "ready" ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Application Improved!</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-xs">Your application status has been updated from <span className="text-red-500 font-bold">Rejected</span> to <span className="text-emerald-600 font-bold">Ready</span>.</p>
                <Button onClick={onClose} className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl">Close Assistant</Button>
              </motion.div>
            ) : allFixed ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200">
                  <CheckCircle2 className="h-10 w-10 text-amber-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Application Fixed Successfully ✅</h3>
                <p className="text-slate-500 font-medium mb-8">All detected issues have been resolved. Run a final check to update your status.</p>
                <Button 
                  onClick={handleRecheck}
                  disabled={isRechecking}
                  className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {isRechecking ? <><Loader2 className="h-5 w-5 animate-spin" /> Re-checking...</> : <><RefreshCcw className="h-5 w-5" /> Re-check Application</>}
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Auto-detected Issues</h4>
                {FIX_ISSUES.map(issue => {
                  const isFixed = fixedIds.includes(issue.id);
                  const isFixing = fixingId === issue.id;
                  const Icon = issue.icon;
                  return (
                    <motion.div 
                      key={issue.id}
                      layout
                      className={`p-5 rounded-2xl border transition-all duration-300 ${isFixed ? "bg-white border-emerald-100 opacity-60" : "bg-white border-slate-200 shadow-sm"}`}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isFixed ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}>
                          {isFixed ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <h5 className={`text-sm font-bold ${isFixed ? "text-slate-400 line-through" : "text-slate-900"}`}>{issue.title}</h5>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{issue.desc}</p>
                        </div>
                        {isFixed && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">✔ Fixed</span>}
                      </div>

                      {!isFixed && (
                        <div className="space-y-3">
                          {issue.type === "document" && (
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Required Documents</p>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleFix(issue.id, "Document uploaded")} disabled={!!fixingId} variant="outline" className="flex-1 text-[10px] font-bold h-9 bg-white border-slate-200 hover:bg-slate-50">
                                  <FilePlus className="h-3.5 w-3.5 mr-1" /> Upload Transcript
                                </Button>
                                <Button size="sm" onClick={() => handleFix(issue.id, "Document uploaded")} disabled={!!fixingId} variant="outline" className="flex-1 text-[10px] font-bold h-9 bg-white border-slate-200 hover:bg-slate-50">
                                  <FilePlus className="h-3.5 w-3.5 mr-1" /> Upload Certificate
                                </Button>
                              </div>
                            </div>
                          )}
                          {issue.type === "improvement" && (
                            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 flex flex-col items-center text-center">
                              <GraduationCap className="h-8 w-8 text-blue-500 mb-2" />
                              <h6 className="text-xs font-bold text-blue-900">Personalized Improvement Plan</h6>
                              <div className="flex flex-wrap justify-center gap-2 mt-2">
                                {issue.items.map(it => <span key={it} className="text-[9px] bg-white text-blue-700 px-2 py-1 rounded-lg border border-blue-100 font-bold">{it}</span>)}
                              </div>
                              <Button onClick={() => handleFix(issue.id, "Application improved")} disabled={!!fixingId} className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 text-[11px] rounded-lg">Start Improvement Plan</Button>
                            </div>
                          )}
                          {issue.type === "form" && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                {issue.items.map(it => (
                                  <div key={it}>
                                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">{it}</label>
                                    <input type="text" placeholder="Enter details..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-400 focus:border-purple-400" />
                                  </div>
                                ))}
                              </div>
                              <Button onClick={() => handleFix(issue.id, "Details updated")} disabled={!!fixingId} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 text-xs rounded-xl shadow-lg shadow-purple-500/20">Complete Details</Button>
                            </div>
                          )}
                          {isFixing && (
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 pt-2">
                              <Loader2 className="h-3 w-3 animate-spin" /> Applying Fix...
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Toast */}
      {toast && <FixToast msg={toast} onClose={() => setToast(null)} />}
    </AnimatePresence>
  );
}

export type UserRole = "Student" | "Job Seeker" | "Loan Applicant";

export function AIHelpCenterPanel({ 
  isOpen, 
  onClose, 
  initialTab = "guidelines",
  userRole = "Student" 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  initialTab?: string,
  userRole?: UserRole
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [fixModalOpen, setFixModalOpen] = useState(false);
  const [appFixed, setAppFixed] = useState(false);
  
  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  const roleData = {
    "Student": {
      actionButtons: [
        { label: "Check Academic Documents", tab: "guidelines", className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
        { label: "Build Student Resume", tab: "formatting", className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
        { label: "Ask Study AI", tab: "chat", className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
      ],
      rejectionReasons: [
        "Missing previous academic transcripts or certificates",
        "Low core subject scores or attendance missing",
        "Incomplete scholarship/admission form details"
      ],
      formattingTips: [
        "Highlight your academic projects and relevant coursework.",
        "Include any extracurricular activities, clubs, or volunteer work.",
        "Keep your student resume strictly to one page, clean and concise."
      ],
      faqs: [
        { q: "How to improve scholarship chances?", a: "Ensure you maintain a good academic record and attach all required essays and recommendations." },
        { q: "What documents are required for admission?", a: "You generally need past marksheets, ID proof, and any applicable standardized test scores." },
        { q: "Why was my application delayed?", a: "Usually due to missing academic transcripts or pending verification from your previous institution." }
      ],
      chatResponses: {
        "reject": "Possible reasons for student application rejection:\n• Missing transcripts\n• Low academic score\n• Incomplete application form",
        "format": "Ensure you highlight relevant coursework, maintain clear headings, and avoid typos in your statement of purpose.",
        "document": "Required documents: Previous Marksheets, ID Proof, Recommendation Letters.",
        "improve": "To improve your chances, ensure high academic standing and clearly describe your extracurricular activities."
      },
      missingNotice: "We noticed some missing academic transcripts in your profile doc-vault."
    },
    "Job Seeker": {
      actionButtons: [
        { label: "Improve Resume", tab: "formatting", className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
        { label: "Check Application Status", tab: "guidelines", className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
        { label: "Career Guidance", tab: "chat", className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
      ],
      rejectionReasons: [
        "Lack of relevant professional experience for the role",
        "Poor resume formatting, typos, or unstructured layout",
        "Skill gap identified in the initial ATS screening"
      ],
      formattingTips: [
        "Use clear headings for Experience, Education, and Skills.",
        "Avoid long paragraphs. Use action-oriented bullet points.",
        "Tailor your resume keywords for the specific job description."
      ],
      faqs: [
        { q: "How to improve interview chances?", a: "Tailor your resume to the job description and practice common behavioral and technical questions." },
        { q: "What should I include in my portfolio?", a: "Include your best projects, clear descriptions of your role in them, and links to live demos or code." },
        { q: "Why is my application rejected quickly?", a: "Usually due to ATS (Applicant Tracking System) not finding matching keywords, or poor formatting." }
      ],
      chatResponses: {
        "reject": "Possible reasons for job rejection:\n• Lack of required skills\n• Poor resume formatting\n• Failed technical assessment",
        "format": "Use concise bullet points, add quantifiable achievements, and tailor keywords to the job description.",
        "document": "Required documents: Updated Resume, Cover Letter, Work Portfolio or GitHub link.",
        "improve": "To improve your chances, network with professionals, tailor your resume, and practice mock interviews."
      },
      missingNotice: "We detected that your 'Projects' section is empty. Filling it increases profile strength by 30%."
    },
    "Loan Applicant": {
      actionButtons: [
        { label: "Check Financial Docs", tab: "guidelines", className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
        { label: "Loan Eligibility Help", tab: "formatting", className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
        { label: "EMI Guidance", tab: "chat", className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" }
      ],
      rejectionReasons: [
        "Low credit score or high existing debt-to-income ratio",
        "Missing bank statements or unverifiable income proof",
        "Mismatched employment details or incomplete KYC"
      ],
      formattingTips: [
        "Ensure all financial documents are clearly scanned and legible.",
        "Double-check that your stated income matches your tax returns.",
        "Highlight stable employment history in your application form."
      ],
      faqs: [
        { q: "How to improve loan approval chances?", a: "Maintain a high credit score and provide clear, verifiable income proofs." },
        { q: "What documents are required?", a: "Identity Proof, Address Proof, 6 months Bank Statements, and recent Salary Slips." },
        { q: "Why was my loan application rejected?", a: "Common reasons include a low credit score, high debt-to-income ratio, or unverifiable income sources." }
      ],
      chatResponses: {
        "reject": "Possible reasons for loan rejection:\n• Low credit score\n• High debt-to-income ratio\n• Missing bank statements",
        "format": "Ensure clear scans of bank statements, verifiable income proof, and accurate personal details.",
        "document": "Required documents: Identity Proof, Address Proof, Recent Salary Slips, 6 Months Bank Statements.",
        "improve": "To improve loan approval chances, reduce existing debts, pay credit bills on time, and provide accurate income documents."
      },
      missingNotice: "Your recent 3-month bank statements are blurry or missing. Please re-upload for faster processing."
    }
  };

  const currentData = roleData[userRole];

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatMessages([
      { role: 'ai', text: `Hello! I am your AI assistant. How can I help you regarding your ${userRole} applications or profiling?` }
    ]);
  }, [userRole]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = { role: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput("");
    
    setTimeout(() => {
      let aiResponse = "I'm sorry, I don't understand. Could you please rephrase?";
      const lowerInput = newMsg.text.toLowerCase();
      
      const responses = currentData.chatResponses;

      if (lowerInput.includes("reject")) {
          aiResponse = responses["reject"];
      } else if (lowerInput.includes("format") || lowerInput.includes("resume") || lowerInput.includes("application")) {
          aiResponse = responses["format"];
      } else if (lowerInput.includes("document") || lowerInput.includes("require") || lowerInput.includes("proof")) {
          aiResponse = responses["document"];
      } else if (lowerInput.includes("improve") || lowerInput.includes("chance")) {
          aiResponse = responses["improve"];
      } else {
          aiResponse = `Thank you for querying about your ${userRole} profile. Please check our Guidelines or FAQ sections for more detailed information.`;
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }, 600);
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-stretch justify-end bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      >
        <motion.div
           initial={{ x: '100%' }}
           animate={{ x: 0 }}
           exit={{ x: '100%' }}
           transition={{ type: "spring", damping: 25, stiffness: 200 }}
           className="w-full max-w-md bg-gray-50 h-full shadow-2xl flex flex-col border-l border-gray-200"
           onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900"><MessageSquare className="h-5 w-5 text-indigo-600"/> AI Help Center</h2>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5 bg-indigo-50 inline-block px-2 py-0.5 rounded-full">{userRole} Mode</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:bg-gray-100 rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Action Buttons */}
          <div className="bg-white px-4 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
             {currentData.actionButtons.map((btn, idx) => (
                <Button key={idx} variant="outline" size="sm" className={`shrink-0 text-xs rounded-full ${btn.className}`} onClick={() => setActiveTab(btn.tab)}>
                  {btn.label}
                </Button>
             ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white shrink-0">
             <button className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider ${activeTab === 'guidelines' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('guidelines')}><FileText className="h-3.5 w-3.5 mx-auto mb-1"/> Guidelines</button>
             <button className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider ${activeTab === 'chat' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('chat')}><MessageSquare className="h-3.5 w-3.5 mx-auto mb-1"/> AI Chat</button>
             <button className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider ${activeTab === 'formatting' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('formatting')}><ListChecks className="h-3.5 w-3.5 mx-auto mb-1"/> Formatting</button>
             <button className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider ${activeTab === 'faq' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('faq')}><HelpCircle className="h-3.5 w-3.5 mx-auto mb-1"/> FAQs</button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-gray-50">
             
             {/* Guidelines Tab */}
             {activeTab === 'guidelines' && (
                <div className="space-y-6">
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 shadow-sm">
                     <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                     <p className="text-sm text-blue-900 font-medium leading-relaxed">
                       <span className="font-bold block text-blue-800 mb-1">AI Smart Suggestion:</span>
                       {currentData.missingNotice}
                     </p>
                   </div>

                   <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" /> Common Rejection Reasons</h3>
                      <ul className="space-y-2.5">
                         {currentData.rejectionReasons.map((reason, idx) => (
                           <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                              <span className="text-red-500 mt-0.5">✖</span> {reason}
                           </li>
                         ))}
                      </ul>
                   </div>
                   
                   <Button 
                     onClick={() => setFixModalOpen(true)}
                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-bold shadow-md"
                   >
                     👉 Fix My Application
                   </Button>
                </div>
             )}

             {/* Chat Tab */}
             {activeTab === 'chat' && (
                <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px] bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                   <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/50">
                      {chatMessages.map((msg, i) => (
                         <div key={i} className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'ai' ? 'bg-white border border-gray-100 text-gray-700 self-start shadow-sm' : 'bg-indigo-600 text-white ml-auto rounded-tr-sm'}`}>
                            {msg.text.split('\n').map((line, j) => <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>)}
                         </div>
                      ))}
                      <div ref={chatEndRef} />
                   </div>
                   <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                      <input 
                         type="text" 
                         value={chatInput}
                         onChange={e => setChatInput(e.target.value)}
                         placeholder="e.g. Why was I rejected?" 
                         className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Button type="submit" size="icon" className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700 rounded-xl shrink-0">
                         <Send className="h-4 w-4" />
                      </Button>
                   </form>
                </div>
             )}

             {/* Formatting Tips Tab */}
             {activeTab === 'formatting' && (
                <div className="space-y-4">
                   <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3 shadow-sm">
                     <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                     <p className="text-sm text-amber-900 font-medium leading-relaxed">
                       <span className="font-bold block text-amber-800 mb-1">Formatting Check:</span>
                       We detected inconsistent formatting in your latest draft. Applying these tips can increase review speed by 40%.
                     </p>
                   </div>

                   <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><ListChecks className="h-5 w-5 text-purple-600" /> Best Practices</h3>
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                         <ul className="space-y-3">
                            {currentData.formattingTips.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-sm text-purple-900 font-medium leading-relaxed">
                                 <span className="bg-purple-200 text-purple-700 rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">{idx + 1}</span> 
                                 {tip}
                              </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </div>
             )}

             {/* FAQs Tab */}
             {activeTab === 'faq' && (
                <div className="space-y-3">
                   {currentData.faqs.map((faq, i) => (
                      <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                         <button 
                            className="w-full px-4 py-3 text-left flex justify-between items-center font-bold text-sm text-gray-800 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150"
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                         >
                            <span className="pr-4">{faq.q}</span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180 text-indigo-500' : ''}`} />
                         </button>
                         {openFaq === i && (
                            <div className="px-4 pb-4 pt-1 text-sm text-gray-600 font-medium leading-relaxed border-t border-gray-50 bg-gray-50/50">
                               {faq.a}
                            </div>
                         )}
                      </div>
                   ))}
                </div>
             )}
          </div>
        </motion.div>
      </motion.div>

      {/* Fix Application Modal — rendered at z-[80] so it floats above the panel */}
      <FixApplicationModal
        isOpen={fixModalOpen}
        onClose={() => setFixModalOpen(false)}
        onAllFixed={() => setAppFixed(true)}
      />
    </AnimatePresence>
  );
}

