import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Upload, ArrowLeft, Loader2, CheckCircle, XCircle, Building2, TrendingUp, RefreshCw, BarChart4, Variable, Mic, Bookmark, Award, ShieldCheck, Zap, FileCheck, LineChart as LineChartIcon, Edit2, CheckSquare, Eye, Trash2, Plus, Download, Percent, ChevronRight, Activity, ThumbsUp, Star, FileText, Info, Calendar, X, ArrowUpDown, SortAsc, ClipboardCheck, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { LoanUserProfilePanel } from "./LoanUserProfilePanel";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, LineChart, Line } from "recharts";
import { apiFetch } from "../api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoanResult {
  decision: "approved" | "denied";
  approvedAmount?: number;
  interestRate?: number;
  tenure?: number;
  reason: string;
  recommendations: string[];
  riskScore: number;
}

interface BankPlan {
  bank: string;
  rate: number;
  fee: string;
  feeNum: number;
  logoClass: string;
  approvalChance: number;
  tag: string;
  reason: string;
  isRecommended?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BANK_PLANS: BankPlan[] = [
  {
    bank: "HDFC Bank", rate: 8.5, fee: "₹1,200", feeNum: 1200,
    logoClass: "bg-indigo-50 text-indigo-600", approvalChance: 94,
    tag: "Best for You", isRecommended: true,
    reason: "Lowest rate + premium partner. Best debt-to-income ratio match for your profile.",
  },
  {
    bank: "State Bank of India", rate: 8.7, fee: "₹1,500", feeNum: 1500,
    logoClass: "bg-blue-50 text-blue-600", approvalChance: 88,
    tag: "Trusted",
    reason: "Stable government bank. Slightly higher rate but easier documentation & wide branch network.",
  },
  {
    bank: "ICICI Bank", rate: 8.9, fee: "₹2,000", feeNum: 2000,
    logoClass: "bg-orange-50 text-orange-600", approvalChance: 82,
    tag: "Fast Processing",
    reason: "Quick digital approval. Higher rate but shortest end-to-end processing time.",
  },
];

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

// ─── RiskGauge ────────────────────────────────────────────────────────────────

const RiskGauge = ({ risk }: { risk: number }) => {
  const radius = 60;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (risk / 100) * circumference;
  const color = risk < 30 ? "#10B981" : risk < 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="relative w-48 h-[110px] mx-auto flex items-end justify-center">
      <svg className="w-48 h-24 absolute top-0" viewBox="0 0 160 80">
        <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke="#f3f4f6" strokeWidth="20" strokeLinecap="round" />
        <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke={color} strokeWidth="20" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="text-center mt-20 relative z-10">
        <span className="text-3xl font-black drop-shadow-sm" style={{ color }}>{risk}%</span>
        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Risk Level</span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function LoanApproval() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<LoanResult | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [formData, setFormData] = useState({
    loanAmount: 4150000,
    monthlyIncome: 539500,
    tenure: 5,
    existingLoans: 41500,
  });

  const [editMode, setEditMode] = useState<{loan: boolean; income: boolean; currentEMI: boolean}>({
    loan: false, income: false, currentEMI: false
  });

  const [probability, setProbability] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [savedApps, setSavedApps] = useState<{ id: number, amount: number, probability: number, risk: number }[]>([]);
  const [resultTenure, setResultTenure] = useState(5);

  const [userType, setUserType] = useState<"salaried" | "business">("salaried");
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [uploadedDocFiles, setUploadedDocFiles] = useState<Record<string, File>>({});
  const [showMissingDocsModal, setShowMissingDocsModal] = useState(false);

  // ── New interactive state ──
  const [selectedPlan, setSelectedPlan] = useState<BankPlan | null>(null);
  const [bankModalPlan, setBankModalPlan] = useState<BankPlan | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showApplyNowModal, setShowApplyNowModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState<{id: string; bank: string; date: string} | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<"submitted" | "under_review">("submitted");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmingPlan, setIsConfirmingPlan] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "csv">("pdf");
  const [downloadOptions, setDownloadOptions] = useState({
    loanSummary: true, emiBreakdown: true, comparedPlans: true, aiRec: true, steps: false,
  });
  const [compareSortBy, setCompareSortBy] = useState<"emi" | "rate" | "approval">("approval");

  const salariedDocs = [
    { id: "identity", name: "Identity Proof (Aadhaar / PAN)", desc: "Used to verify your identity" },
    { id: "address", name: "Address Proof", desc: "Used to verify your residence" },
    { id: "salary", name: "Salary Slips (Last 3–6 months)", desc: "Used to verify your income stability" },
    { id: "bank", name: "Bank Statements (Last 6 months)", desc: "Used to verify your cash flow" },
    { id: "employment", name: "Employment Proof / Offer Letter", desc: "Used to verify your employment" },
  ];

  const businessDocs = [
    { id: "identity", name: "Identity Proof (Aadhaar / PAN)", desc: "Used to verify your identity" },
    { id: "address", name: "Address Proof", desc: "Used to verify your residence" },
    { id: "itr", name: "ITR (Last 2–3 years)", desc: "Used to verify your income stability" },
    { id: "business", name: "Business Proof (GST / License / Registration)", desc: "Used to verify entity status" },
    { id: "bank_biz", name: "Bank Statements (Last 6–12 months)", desc: "Used to verify business cash flow" },
    { id: "pnl", name: "Profit & Loss Statement", desc: "Used to verify business performance" },
    { id: "balance", name: "Balance Sheet", desc: "Used to verify business assets" },
  ];

  const currentDocs = userType === "salaried" ? salariedDocs : businessDocs;
  const uploadedCount = currentDocs.filter(d => uploadedDocs[d.id]).length;

  const calculateEMI = (principal: number, rate: number, tenureYears: number) => {
    const r = rate / 12 / 100;
    const n = tenureYears * 12;
    if (r === 0) return principal / n;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  useEffect(() => {
    if (formData.monthlyIncome === 0) { setProbability(0); setRiskScore(100); return; }
    const maxEMI = (formData.monthlyIncome * 0.5) - formData.existingLoans;
    const approxEMI = formData.loanAmount / (formData.tenure * 12);
    let prob = 50;
    if (approxEMI <= maxEMI && approxEMI > 0) prob = 50 + ((maxEMI - approxEMI) / maxEMI) * 40;
    else prob = Math.max(5, 50 - ((approxEMI - maxEMI) / Math.max(approxEMI, 1)) * 50);
    prob = Math.max(2, Math.min(98, Math.round(prob + 5)));
    setProbability(prob);
    setRiskScore(100 - prob);
  }, [formData]);

  // ── Handlers ──

  const handleSpecificUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadedDocs(prev => ({ ...prev, [id]: true }));
      setUploadedDocFiles(prev => ({ ...prev, [id]: files[0] }));
      const docName = currentDocs.find(d => d.id === id)?.name || "Document";
      toast.success(`${docName} uploaded successfully!`);
    }
  };

  const removeDoc = (id: string) => {
    setUploadedDocs(prev => { const next = { ...prev }; delete next[id]; return next; });
    setUploadedDocFiles(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  const saveApplication = () => {
    setSavedApps(prev => [...prev, { id: Date.now(), amount: formData.loanAmount, probability, risk: riskScore }]);
    toast.success("Scenario saved for comparison!");
  };

  const startVoiceInput = () => {
    toast.info("Voice input simulated: 'I want an 80 lakh loan'");
    setFormData(prev => ({ ...prev, loanAmount: 8000000 }));
  };

  const analyzeLoan = async () => {
    const missingDocs = currentDocs.filter(d => !uploadedDocs[d.id]);
    if (missingDocs.length > 0) { setShowMissingDocsModal(true); return; }
    setIsAnalyzing(true);
    try {
      const body = new FormData();
      body.append("service_type", "loan");
      body.append("payload", JSON.stringify({
        ...formData,
        userType,
        requiredDocs: currentDocs.map((doc) => doc.id),
      }));
      const docTypes: string[] = [];
      currentDocs.forEach((doc) => {
        const file = uploadedDocFiles[doc.id];
        if (file) {
          body.append("files", file);
          docTypes.push(doc.id);
        }
      });
      body.append("doc_types", JSON.stringify(docTypes));
      const response = await apiFetch("/services/analyze", {
        method: "POST",
        body,
      });
      setResult(response.data as LoanResult);
      setResultTenure(formData.tenure);
      setIsAnalyzing(false);
      toast.success("Financial document analysis complete!");
    } catch (error) {
      setIsAnalyzing(false);
      toast.error(error instanceof Error ? error.message : "Loan analysis failed.");
    }
  };

  // Apply button — opens bank details modal
  const handleApply = (plan: BankPlan) => {
    setBankModalPlan(plan);
    setShowBankModal(true);
  };

  // Confirm selection inside bank modal
  const handleConfirmPlan = () => {
    if (!bankModalPlan) return;
    setIsConfirmingPlan(true);
    setTimeout(() => {
      setSelectedPlan(bankModalPlan);
      setShowBankModal(false);
      setIsConfirmingPlan(false);
      setBankModalPlan(null);
      toast.success(`${bankModalPlan.bank} plan selected successfully!`);
    }, 900);
  };

  // Apply Now — validate then open confirmation modal
  const handleApplyNow = () => {
    const profileComplete = true; // assume profile complete for demo
    if (!selectedPlan) { toast.warning("Please select a bank plan first."); return; }
    if (uploadedCount < currentDocs.length) { toast.warning("Please upload all required documents before applying."); return; }
    if (!profileComplete) { toast.warning("Please complete your profile before applying."); return; }
    setConfirmChecked(false);
    setShowApplyNowModal(true);
  };

  // Submit Application
  const handleSubmitApplication = () => {
    if (!confirmChecked) { toast.warning("Please confirm that the submitted information is correct."); return; }
    setIsSubmitting(true);
    setTimeout(() => {
      const appId = "LN" + Date.now().toString().slice(-8);
      const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      setApplicationSubmitted({ id: appId, bank: selectedPlan!.bank, date: today });
      setApplicationStatus("submitted");
      setShowApplyNowModal(false);
      setIsSubmitting(false);
      toast.success(`Your application has been successfully submitted to ${selectedPlan!.bank}.`);
      setTimeout(() => setApplicationStatus("under_review"), 3000);
    }, 1500);
  };

  // Select plan from Compare modal
  const handleSelectFromCompare = (plan: BankPlan) => {
    setSelectedPlan(plan);
    setShowCompareModal(false);
    toast.success(`${plan.bank} plan selected successfully!`);
  };

  // Download Report
  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const active = selectedPlan || BANK_PLANS[0];
      const emi = calculateEMI(formData.loanAmount, active.rate, resultTenure);
      const totalInterest = (emi * resultTenure * 12) - formData.loanAmount;
      const totalPayable = emi * resultTenure * 12;

      if (downloadFormat === "csv") {
        const rows = [
          ["Loan Summary Report"],
          ["Generated", new Date().toLocaleString()],
          [],
          ["Field", "Value"],
          ["Loan Amount", formatINR(formData.loanAmount)],
          ["Selected Bank", active.bank],
          ["Interest Rate", `${active.rate}%`],
          ["Tenure", `${resultTenure} Years`],
          ["Monthly EMI", formatINR(emi)],
          ["Total Interest", formatINR(totalInterest)],
          ["Total Payable", formatINR(totalPayable)],
          ["Processing Fee", active.fee],
          ["Approval Chance", `${active.approvalChance}%`],
          [],
          ["AI Recommendation", active.reason],
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "loan_report.csv"; a.click();
        URL.revokeObjectURL(url);
      } else {
        // PDF-style plain text download
        const content = `LOAN ANALYSIS REPORT\nGenerated: ${new Date().toLocaleString()}\n\n` +
          `LOAN SUMMARY\nLoan Amount: ${formatINR(formData.loanAmount)}\nSelected Bank: ${active.bank}\n` +
          `Interest Rate: ${active.rate}% p.a.\nTenure: ${resultTenure} Years\nMonthly EMI: ${formatINR(emi)}\n` +
          `Total Interest: ${formatINR(totalInterest)}\nTotal Payable: ${formatINR(totalPayable)}\n` +
          `Processing Fee: ${active.fee}\nApproval Chance: ${active.approvalChance}%\n\n` +
          `AI RECOMMENDATION\n${active.reason}\n\n` +
          `BANK COMPARISON\n${BANK_PLANS.map(p => `${p.bank}: ${p.rate}% | EMI ${formatINR(calculateEMI(formData.loanAmount, p.rate, resultTenure))} | Approval ${p.approvalChance}%`).join("\n")}`;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "loan_report.txt"; a.click();
        URL.revokeObjectURL(url);
      }

      setIsDownloading(false);
      setShowDownloadModal(false);
      toast.success("Report downloaded successfully!");
    }, 1200);
  };

  // Sort plans for compare modal
  const sortedPlans = [...BANK_PLANS].sort((a, b) => {
    if (compareSortBy === "emi") return calculateEMI(formData.loanAmount, a.rate, resultTenure) - calculateEMI(formData.loanAmount, b.rate, resultTenure);
    if (compareSortBy === "rate") return a.rate - b.rate;
    return b.approvalChance - a.approvalChance;
  });

  const activePlan = selectedPlan || BANK_PLANS[0];

  const barData = [
    { factor: "Income Stability", contribution: probability > 50 ? 25 : -15 },
    { factor: "Existing Loans", contribution: formData.existingLoans > 0 ? -20 : 5 },
    { factor: "Credit Value", contribution: riskScore < 40 ? 15 : -30 },
  ];

  const aiSuggestions = [
    { text: "We recommend improving your credit score by paying off active debt.", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
    { text: "Provide additional identity documents for faster verification.", icon: FileCheck, color: "text-blue-600", bg: "bg-blue-100" },
    { text: "Reduce existing EMI values to substantially improve probability.", icon: Zap, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 relative overflow-hidden pb-12">

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm border-purple-100">
        <div className="container mx-auto px-4 py-4 max-w-[1400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                title="Go back"
                className="h-9 w-9 flex items-center justify-center rounded-full text-slate-500 hover:text-purple-600 hover:bg-purple-50 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg shadow-lg shadow-purple-200">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight tracking-tight">Advanced Loan System</h1>
                  <p className="text-xs md:text-sm text-slate-500 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-purple-500" /> Explainable AI & Interactive Assessment
                  </p>
                </div>
              </div>
            </div>
            <Button variant="ghost" className="rounded-full h-10 w-10 p-0 border border-purple-100 overflow-hidden shadow-sm hover:scale-105 hover:border-purple-300 transition-all" onClick={() => setIsProfileOpen(true)}>
              <div className="h-full w-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">VK</div>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 pb-12 max-w-[1400px] mt-4 relative z-10">

        {/* INPUT PHASE */}
        {!result && !isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Left Column: Simulator */}
            <div className="space-y-6 flex flex-col h-full">
              <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 ring-1 ring-purple-100/50 flex-1 flex flex-col rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-white/50 pb-4 border-b border-purple-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2"><Variable className="h-5 w-5 text-purple-600"/> What-If Simulator</CardTitle>
                      <CardDescription className="font-medium text-slate-500">Adjust variables or enter exact values to test outcomes.</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={startVoiceInput} className="rounded-full shadow-sm hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 border-purple-100 transition-all active:scale-95" title="Use Voice Input">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 flex-1 flex flex-col justify-between">
                  {/* Loan Amount */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-bold text-slate-700">Loan Amount</Label>
                      {editMode.loan ? (
                        <div className="flex items-center gap-2">
                          <span className="font-black text-purple-600">₹</span>
                          <Input type="number" className="w-[140px] h-9 text-right font-black text-purple-600 bg-purple-50 border-purple-200 rounded-xl" value={formData.loanAmount} onChange={e => setFormData({...formData, loanAmount: Number(e.target.value)})} onBlur={() => setEditMode({...editMode, loan: false})} onKeyDown={e => { if(e.key==="Enter") setEditMode({...editMode, loan:false}) }} autoFocus />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditMode({...editMode, loan: true})}>
                          <span className="font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-xl border border-purple-100 shadow-sm group-hover:bg-purple-100 transition-colors">{formatINR(formData.loanAmount)}</span>
                          <Edit2 className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                        </div>
                      )}
                    </div>
                    {!editMode.loan && (
                      <div className="relative pt-1">
                        <input type="range" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600" min="100000" max="20000000" step="50000" value={formData.loanAmount} onChange={e => setFormData({...formData, loanAmount: Number(e.target.value)})} />
                      </div>
                    )}
                  </div>
                  {/* Monthly Income */}
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-bold text-slate-700">Monthly Income</Label>
                      {editMode.income ? (
                        <div className="flex items-center gap-2">
                          <span className="font-black text-indigo-600">₹</span>
                          <Input type="number" className="w-[140px] h-9 text-right font-black text-indigo-600 bg-indigo-50 border-indigo-200 rounded-xl" value={formData.monthlyIncome} onChange={e => setFormData({...formData, monthlyIncome: Number(e.target.value)})} onBlur={() => setEditMode({...editMode, income: false})} onKeyDown={e => { if(e.key==="Enter") setEditMode({...editMode, income:false}) }} autoFocus />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditMode({...editMode, income: true})}>
                          <span className="font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl border border-indigo-100 shadow-sm group-hover:bg-indigo-100 transition-colors">{formatINR(formData.monthlyIncome)}</span>
                          <Edit2 className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      )}
                    </div>
                    {!editMode.income && <input type="range" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500" min="25000" max="1500000" step="5000" value={formData.monthlyIncome} onChange={e => setFormData({...formData, monthlyIncome: Number(e.target.value)})} />}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-purple-50">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="font-bold text-slate-600">Tenure (Yrs)</Label>
                        <span className="font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 text-sm">{formData.tenure}</span>
                      </div>
                      <input type="range" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-500" min="1" max="30" step="1" value={formData.tenure} onChange={e => setFormData({...formData, tenure: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="font-bold text-slate-600">Existing EMI</Label>
                        {editMode.currentEMI ? (
                          <Input type="number" className="w-[100px] h-9 text-right font-black text-purple-600 bg-purple-50 border-purple-200 rounded-xl" value={formData.existingLoans} onChange={e => setFormData({...formData, existingLoans: Number(e.target.value)})} onBlur={() => setEditMode({...editMode, currentEMI: false})} onKeyDown={e => { if(e.key==="Enter") setEditMode({...editMode, currentEMI:false}) }} autoFocus />
                        ) : (
                          <div className="flex items-center gap-1 group cursor-pointer" onClick={() => setEditMode({...editMode, currentEMI: true})}>
                            <span className="font-black text-purple-600 truncate max-w-[100px] bg-purple-50/50 px-2 py-1 rounded-lg border border-purple-50 group-hover:bg-purple-100 transition-colors">{formatINR(formData.existingLoans)}</span>
                            <Edit2 className="h-3.5 w-3.5 text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                          </div>
                        )}
                      </div>
                      {!editMode.currentEMI && <input type="range" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-400" min="0" max="500000" step="5000" value={formData.existingLoans} onChange={e => setFormData({...formData, existingLoans: Number(e.target.value)})} />}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-6 mt-auto">
                    <Button
                      className={`w-full gap-2 text-white shadow-[0_10px_20px_-5px_rgba(124,58,237,0.4)] rounded-2xl h-14 text-base font-black transition-all active:scale-[0.98] ${uploadedCount === currentDocs.length ? "bg-gradient-to-r from-purple-600 to-indigo-700 hover:shadow-purple-200 hover:-translate-y-0.5" : "bg-slate-300 cursor-not-allowed shadow-none"}`}
                      onClick={uploadedCount === currentDocs.length ? analyzeLoan : () => setShowMissingDocsModal(true)}
                    >
                      <CheckCircle className="h-5 w-5" /> Analyze Loan Request
                    </Button>
                    {uploadedCount === currentDocs.length
                      ? <p className="text-xs font-bold text-center text-emerald-600 -mt-1 w-full flex justify-center items-center gap-1.5 bg-emerald-50 py-1.5 rounded-lg border border-emerald-100/50 shadow-sm"><CheckCircle className="h-3 w-3" /> All documents verified. Ready for analysis</p>
                      : <p className="text-xs font-bold text-center text-purple-500 -mt-1 w-full flex justify-center items-center gap-1.5 bg-purple-50 py-1.5 rounded-lg border border-purple-100/50 shadow-sm"><Info className="h-3 w-3" /> Please upload all {currentDocs.length} required documents to proceed</p>
                    }
                    <Button variant="outline" className="w-full gap-2 rounded-2xl h-12 border-purple-100 bg-white shadow-sm font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-all" onClick={saveApplication}>
                      <Bookmark className="h-5 w-5 text-purple-500" /> Save Scenario
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: AI Analytics & Docs */}
            <div className="space-y-6 flex flex-col">
              <Card className="bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 text-white border-0 shadow-2xl shadow-indigo-200/50 relative overflow-hidden rounded-2xl shrink-0">
                <div className="absolute top-0 right-0 p-3 opacity-10"><RefreshCw className="h-32 w-32" /></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[60px]" />
                <CardContent className="p-7 relative z-10">
                  <h3 className="text-purple-200 font-black mb-2 uppercase tracking-widest text-[10px]">Real-Time Approval Chance</h3>
                  <div className="flex items-end gap-2 mb-5">
                    <span className="text-6xl font-black tabular-nums tracking-tighter drop-shadow-md">{probability}%</span>
                    <span className="text-sm font-bold text-purple-300 mb-2 uppercase tracking-wide">Confidence</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 mb-6 shadow-inner overflow-hidden border border-white/5 p-0.5">
                    <div className={`h-full rounded-full transition-all duration-[1000ms] ease-out shadow-[0_0_15px_rgba(255,255,255,0.3)] ${probability > 70 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : probability > 40 ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-rose-400 to-red-600"}`} style={{ width: `${probability}%` }} />
                  </div>
                  <div className="border-t border-white/10 pt-6 pb-2"><RiskGauge risk={riskScore} /></div>
                </CardContent>
              </Card>

              {/* Document Check & Upload */}
              <Card id="upload-section" className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border border-purple-50 flex-1 flex flex-col bg-white overflow-hidden">
                <CardHeader className="pb-3 border-b border-purple-50 bg-slate-50/50">
                  <div className="flex justify-between items-center relative z-10 mb-4">
                    <div>
                      <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2"><Upload className="h-4 w-4 text-purple-600"/> Document Verification</CardTitle>
                      <CardDescription className="text-[11px] font-semibold text-slate-500 mt-1 hidden sm:block">Upload all required files to proceed.</CardDescription>
                    </div>
                    <div className="text-right flex flex-col justify-center items-end">
                      <div className={`text-xl font-black tracking-tighter ${uploadedCount === currentDocs.length ? "text-emerald-600" : "text-purple-600"}`}>{uploadedCount} <span className="text-sm font-bold text-slate-300">/ {currentDocs.length}</span></div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Completed</div>
                    </div>
                  </div>
                  <div className="flex bg-slate-100/50 p-1 rounded-xl w-full mb-3 border border-slate-200/50 shadow-inner">
                    <button onClick={() => setUserType("salaried")} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${userType === "salaried" ? "bg-white text-purple-700 shadow-md border border-purple-100" : "text-slate-500 hover:text-slate-700"}`}>Salaried</button>
                    <button onClick={() => setUserType("business")} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${userType === "business" ? "bg-white text-purple-700 shadow-md border border-purple-100" : "text-slate-500 hover:text-slate-700"}`}>Business</button>
                  </div>
                  <Progress value={(uploadedCount / currentDocs.length) * 100} className="h-2 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-indigo-600 shadow-inner" />
                </CardHeader>
                <CardContent className="p-0 flex flex-col max-h-[400px] overflow-y-auto bg-white/50">
                  <div className="flex flex-col">
                    {currentDocs.map(doc => {
                      const isUploaded = !!uploadedDocs[doc.id];
                      return (
                        <div key={doc.id} className={`flex items-center justify-between p-4 border-b border-purple-50 last:border-b-0 transition-all duration-300 ${isUploaded ? "bg-emerald-50/30" : "bg-white/50 hover:bg-purple-50/40"}`}>
                          <div className="flex items-center gap-4 w-2/3 pr-2">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${isUploaded ? "bg-emerald-100 shadow-lg shadow-emerald-100/50" : "bg-slate-100"}`}>
                              {isUploaded ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <div className="h-2 w-2 rounded-full bg-slate-300" />}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-[13px] font-black truncate ${isUploaded ? "text-emerald-800" : "text-slate-800"}`} title={doc.name}>{doc.name}</p>
                              <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{doc.desc}</p>
                              <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isUploaded ? "text-emerald-500" : "text-slate-400"}`}>{isUploaded ? "Verified" : "Pending"}</p>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center justify-end w-24">
                            {!isUploaded ? (
                              <Button variant="outline" size="sm" className="h-9 text-xs font-black w-full relative overflow-hidden border-purple-100 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50/50 shadow-sm transition-all text-slate-600 gap-2 rounded-xl">
                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleSpecificUpload(doc.id, e)} />
                                <Upload className="h-3.5 w-3.5" /> Upload
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 shrink-0 rounded-xl" onClick={() => removeDoc(doc.id)} title="Remove file">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Missing Documents Modal */}
        <AnimatePresence>
          {showMissingDocsModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4" onClick={() => setShowMissingDocsModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500"/> Incomplete Documents</h2>
                  </div>
                  <p className="text-sm rounded-lg text-gray-600 mb-4 font-medium leading-relaxed">Please upload all required financial documents before proceeding with your personalized loan analysis.</p>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6 space-y-2">
                    <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3">Missing Files:</p>
                    {currentDocs.filter(d => !uploadedDocs[d.id]).map(d => (
                      <div key={d.id} className="flex items-start gap-2.5 text-sm font-semibold text-red-700"><span className="text-red-500 mt-0.5">❌</span> {d.name}</div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="w-1/3 hover:bg-gray-100 text-gray-600 font-bold" onClick={() => setShowMissingDocsModal(false)}>Cancel</Button>
                    <Button className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-bold" onClick={() => { setShowMissingDocsModal(false); document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" }); }}>👉 Upload Now</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyzing State */}
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
            <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Generating Intelligence Report</h3>
            <p className="text-gray-500 mb-8 font-medium">Running advanced fairness checks and building predictive models...</p>
          </motion.div>
        )}

        {/* ── Application Submitted / Under Review State ── */}
        {applicationSubmitted && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-8">
              <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className={`${applicationStatus === "under_review" ? "bg-gradient-to-r from-purple-500 to-indigo-600" : "bg-gradient-to-r from-emerald-500 to-teal-600"} text-white p-10 text-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10"><ClipboardCheck className="h-64 w-64 mx-auto mt-4" /></div>
                  <div className="relative z-10">
                    <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm shadow-xl">
                      {applicationStatus === "under_review" ? <Clock className="h-10 w-10 text-white" /> : <CheckCircle className="h-10 w-10 text-white" />}
                    </div>
                    <h2 className="text-4xl font-black mb-2 tracking-tight">{applicationStatus === "under_review" ? "Under Review" : "Submitted!"}</h2>
                    <p className="text-white/80 font-bold">{applicationStatus === "under_review" ? "Your application is being reviewed by our team." : `Successfully submitted to ${applicationSubmitted.bank}`}</p>
                  </div>
                </div>
                <CardContent className="p-8 space-y-6 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Application ID", value: applicationSubmitted.id },
                      { label: "Bank", value: applicationSubmitted.bank },
                      { label: "Submitted", value: applicationSubmitted.date },
                      { label: "Status", value: applicationStatus === "under_review" ? "Under Review 🔍" : "Submitted ✅" },
                    ].map(item => (
                      <div key={item.label} className="bg-slate-50 rounded-2xl p-4 border border-purple-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="font-black text-slate-800 text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <Button className="flex-1 h-14 rounded-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-100 hover:-translate-y-0.5 transition-all">
                      <Activity className="h-5 w-5 mr-2" /> Track Status
                    </Button>
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black border-purple-100 text-slate-700 hover:bg-purple-50" onClick={() => { setApplicationSubmitted(null); setResult(null); setSelectedPlan(null); }}>
                      <RefreshCw className="h-5 w-5 mr-2" /> New Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Results View */}
        {result && !applicationSubmitted && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[1200px] mx-auto space-y-8 pb-12">

            <div className="flex justify-between items-center mb-6 px-2">
              <Button variant="ghost" onClick={() => setResult(null)} className="gap-2 text-slate-500 hover:bg-purple-50 hover:text-purple-700 rounded-2xl font-black bg-white shadow-sm border border-purple-100 px-5">
                <ArrowLeft className="h-4 w-4" /> Back to Assessment
              </Button>
              {selectedPlan && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-2.5 shadow-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shadow-sm" />
                  <span className="text-sm font-black text-emerald-700 tracking-tight">Selected: {selectedPlan.bank}</span>
                </div>
              )}
            </div>

            {/* TOP SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className={`md:col-span-2 border-0 shadow-2xl rounded-3xl relative overflow-hidden ${result.decision === "approved" ? "bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-100" : "bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-rose-100"}`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">{result.decision === "approved" ? <ThumbsUp className="h-48 w-48" /> : <XCircle className="h-48 w-48" />}</div>
                <CardContent className="p-10 relative z-10 flex flex-col justify-center h-full">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md shadow-lg">
                      {result.decision === "approved" ? <CheckCircle className="h-10 w-10 text-white" /> : <XCircle className="h-10 w-10 text-white" />}
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md mb-2 shadow-sm border border-white/10">
                        <ShieldCheck className="h-3.5 w-3.5" /> Bias-Free AI Assessed
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-md">{result.decision === "approved" ? "Loan Approved" : "Loan Not Approved"}</h2>
                    </div>
                  </div>
                  <p className={`text-lg font-bold max-w-lg mt-2 ${result.decision === "approved" ? "text-emerald-50" : "text-rose-50"}`}>
                    {result.decision === "approved" ? "Your financial profile meets our lending criteria with high confidence." : "Your profile does not currently meet our lending criteria."}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-2xl rounded-3xl bg-white overflow-hidden flex flex-col justify-center relative shadow-purple-50 border border-purple-50">
                <CardContent className="p-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-purple-500" /> Financial Health Score</h3>
                  <div className="flex items-end gap-2 mb-4"><span className="text-7xl font-black text-slate-900 tracking-tighter tabular-nums drop-shadow-sm">85</span><span className="text-xl text-slate-300 font-black mb-2 tracking-widest">/100</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-4 mb-5 shadow-inner p-0.5"><div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(124,58,237,0.4)]" style={{ width: "85%" }} /></div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1 shadow-sm"><TrendingUp className="h-3 w-3" /> +4 Points Improvement</span>
                    <span className="font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 flex items-center gap-1 shadow-sm">Risk: Low</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* MIDDLE SECTION */}
            {result.decision === "approved" ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Featured Plan Card — updates when plan is selected */}
                <Card className={`lg:col-span-1 shadow-2xl rounded-3xl bg-white relative overflow-hidden flex flex-col hover:shadow-purple-100 transition-all border-2 ${selectedPlan ? "border-emerald-500" : "border-purple-600 shadow-purple-50"}`}>
                  <div className={`text-white text-center py-2.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm ${selectedPlan ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gradient-to-r from-purple-600 to-indigo-700"}`}>
                    {selectedPlan ? <><CheckCircle className="h-4 w-4 shadow-sm" /> Plan Selected</> : <><Star className="h-4 w-4 fill-amber-300 text-amber-300 shadow-sm" /> Recommended Match</>}
                  </div>
                  <CardContent className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-14 w-14 rounded-2xl border border-slate-100 flex items-center justify-center shadow-lg shadow-slate-100 ${activePlan.logoClass}`}>
                          <Building2 className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{activePlan.bank}</h3>
                          <p className="text-[10px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg mt-1 inline-block uppercase tracking-widest border border-purple-100">{activePlan.tag}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-5 flex-1">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Approved Principal</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums drop-shadow-sm">{formatINR(formData.loanAmount)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Interest Rate</p>
                          <p className="text-xl font-black text-purple-600 tabular-nums">{activePlan.rate}% <span className="text-[10px] font-bold text-purple-400 uppercase">p.a.</span></p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenure</p>
                          <p className="text-xl font-black text-slate-800 tabular-nums">{resultTenure} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Years</span></p>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-slate-100 mt-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">Monthly Installment <span className="text-[10px] font-bold text-slate-300 lowercase italic">estimated EMI</span></p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums drop-shadow-sm">{formatINR(calculateEMI(formData.loanAmount, activePlan.rate, resultTenure))}</p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500 font-black uppercase tracking-widest">Processing Fee</span>
                        <span className="font-black text-slate-800">{activePlan.fee}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-black uppercase tracking-widest">Approval Confidence</span>
                        <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 shadow-sm">{activePlan.approvalChance}% High</span>
                      </div>
                    </div>
                    <Button
                      title="Submit selected loan application"
                      onClick={handleApplyNow}
                      disabled={!selectedPlan}
                      className={`w-full mt-8 text-white rounded-2xl h-16 text-lg font-black shadow-[0_12px_24px_-6px_rgba(124,58,237,0.4)] transition-all active:scale-[0.98] ${selectedPlan ? "bg-gradient-to-r from-purple-600 to-indigo-700 hover:shadow-purple-200 hover:-translate-y-0.5" : "bg-slate-300 cursor-not-allowed shadow-none"}`}
                    >
                      Apply Now <ChevronRight className="h-5 w-5 ml-1" />
                    </Button>
                    {!selectedPlan && <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3 animate-pulse">Select a bank plan below to unlock</p>}
                  </CardContent>
                </Card>

                {/* Bank Comparison & Calculator */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1"><Building2 className="h-5 w-5 text-purple-500"/> Competing Market Offers</h3>
                    {BANK_PLANS.filter(p => p.bank !== activePlan.bank).map((offer, i) => {
                      const isSelected = selectedPlan?.bank === offer.bank;
                      return (
                        <Card key={i} className={`border shadow-lg shadow-slate-100 rounded-3xl hover:shadow-xl transition-all bg-white/80 backdrop-blur-sm group cursor-pointer border-purple-50 ${isSelected ? "ring-2 ring-emerald-400 ring-offset-2 bg-emerald-50/20" : "hover:border-purple-200"}`}>
                          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-5 min-w-[240px]">
                              <div className={`h-16 w-16 rounded-2xl ${offer.logoClass} border border-slate-100 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm`}>
                                <Building2 className="h-8 w-8" />
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <h4 className="text-xl font-black text-slate-900 tracking-tight">{offer.bank}</h4>
                                  {isSelected && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded-lg border border-emerald-200 uppercase tracking-widest flex items-center gap-1 shadow-sm"><CheckCircle className="h-3 w-3" /> Selected</span>}
                                </div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Processing: {offer.fee}</p>
                              </div>
                            </div>
                            <div className="flex flex-row items-center sm:gap-12 justify-between w-full sm:w-auto mt-2 sm:mt-0 flex-1">
                              <div className="text-center sm:text-left">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Interest</p>
                                <p className="text-xl font-black text-purple-600 tabular-nums">{offer.rate}%</p>
                              </div>
                              <div className="text-center sm:text-left">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Monthly EMI</p>
                                <p className="text-xl font-black text-slate-800 tabular-nums">{formatINR(calculateEMI(formData.loanAmount, offer.rate, resultTenure))}</p>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => handleApply(offer)}
                                className={`hidden sm:flex rounded-2xl font-black shadow-sm ml-auto px-6 h-11 transition-all border-purple-100 ${isSelected ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100" : "text-purple-700 hover:bg-purple-50 hover:border-purple-300 shadow-purple-50"}`}
                              >
                                {isSelected ? <><CheckCircle className="h-4 w-4 mr-2 shadow-sm" /> Active</> : "View Details"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* EMI Calculator */}
                  <Card className="border-0 shadow-2xl shadow-slate-100 rounded-3xl bg-white flex-1 flex flex-col ring-1 ring-purple-50">
                    <CardContent className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2"><Percent className="h-5 w-5 text-purple-600"/> Interactive EMI Breakdown</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center h-full">
                        <div className="space-y-10">
                          <div>
                            <div className="flex justify-between mb-4 items-center">
                              <Label className="font-black text-slate-600 text-[11px] uppercase tracking-widest">Adjust Tenure</Label>
                              <span className="font-black text-purple-600 px-4 py-1.5 bg-purple-50 border border-purple-100 rounded-xl text-sm shadow-sm">{resultTenure} <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Years</span></span>
                            </div>
                            <input type="range" className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600" min="1" max="15" step="1" value={resultTenure} onChange={e => setResultTenure(Number(e.target.value))} />
                            <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 px-1 uppercase tracking-widest"><span>Min: 1 Yr</span><span>Max: 15 Yrs</span></div>
                          </div>
                          <div className="group">
                            <div className="flex items-center gap-2 mb-3"><Zap className="h-5 w-5 text-amber-500 shadow-sm" /><p className="text-xs font-black text-slate-800 uppercase tracking-widest">AI Financial Insight</p></div>
                            <p className="text-sm font-bold text-slate-600 bg-amber-50/30 p-4 rounded-2xl border border-amber-100/30 leading-relaxed shadow-sm transition-all group-hover:bg-amber-50">
                              "Based on your income, a tenure of 4-5 years gives you the best debt-to-income balance. We recommend a loan between ₹4–6 lakh."
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-50/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 relative overflow-hidden h-full flex flex-col justify-center shadow-inner">
                          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none"><Activity className="h-64 w-64"/></div>
                          <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-end border-b border-slate-200/50 pb-4"><span className="text-xs font-black text-slate-400 uppercase tracking-widest">Monthly EMI</span><span className="text-3xl font-black text-slate-900 tabular-nums drop-shadow-sm">{formatINR(calculateEMI(formData.loanAmount, activePlan.rate, resultTenure))}</span></div>
                            <div className="flex justify-between items-end border-b border-slate-200/50 pb-4"><span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Interest</span><span className="text-lg font-black text-slate-600 tabular-nums">{formatINR((calculateEMI(formData.loanAmount, activePlan.rate, resultTenure) * resultTenure * 12) - formData.loanAmount)}</span></div>
                            <div className="flex justify-between items-end pt-2"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Repayment</span><span className="text-2xl font-black text-purple-700 tabular-nums drop-shadow-sm">{formatINR(calculateEMI(formData.loanAmount, activePlan.rate, resultTenure) * resultTenure * 12)}</span></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border border-rose-100 shadow-2xl shadow-rose-100/50 rounded-3xl bg-white flex flex-col overflow-hidden">
                  <div className="bg-rose-50/50 text-rose-700 py-4 px-8 border-b border-rose-100 text-xs font-black uppercase tracking-widest flex items-center gap-2"><XCircle className="h-4 w-4" /> Comprehensive Risk Analysis</div>
                  <CardContent className="p-10 flex-1">
                    <div className="mb-10">
                      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><FileText className="h-5 w-5 text-rose-500"/> Critical Risk Factors</h3>
                      <ul className="space-y-4">
                        {[{ title: "Credit Standing Threshold", desc: "Your current risk profile indicates a lower than required credit standing for this specific amount." }, { title: "Debt-to-Income Utilization", desc: "Current financial obligations exceed our algorithmic safety thresholds for additional credit." }, { title: "Income Verification Gap", desc: `For a principal of ${formatINR(formData.loanAmount)}, higher verified liquid cashflow is required.` }].map((item, i) => (
                          <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                            <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-rose-200 group-hover:bg-rose-200 transition-colors"><XCircle className="h-4 w-4 text-rose-600" /></div>
                            <div><p className="text-sm font-black text-slate-800">{item.title}</p><p className="text-xs font-semibold text-slate-500 mt-0.5">{item.desc}</p></div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500"/> Strategic Recommendations</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[{ icon: Activity, label: "Enhance Credit Score" }, { icon: Zap, label: "Optimize Existing EMIs" }, { icon: Award, label: "Verify Additional Assets" }, { icon: Variable, label: "Extend Repayment Cycle" }].map((item, i) => (
                          <div key={i} className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex items-center gap-4 hover:shadow-lg hover:shadow-emerald-100 transition-all cursor-default">
                            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-md text-emerald-600"><item.icon className="h-6 w-6" /></div>
                            <span className="text-sm font-black text-emerald-800 tracking-tight">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-1 border border-purple-100 shadow-2xl shadow-purple-50 rounded-3xl bg-white flex flex-col overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-center py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md"><Zap className="h-4 w-4 shadow-sm" /> Algorithmic Alternatives</div>
                  <CardContent className="p-8 flex-1 flex flex-col gap-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">High Probability Success Paths:</p>
                    <div className="flex flex-col gap-4">
                      {[{ icon: Percent, title: "Reduced Principal Plan", desc: `Lowering request to ${formatINR(formData.loanAmount * 0.6)} increases approval chance to 85%.` }, { icon: Calendar, title: "Max Tenure Extension", desc: "Setting tenure to 20+ years reduces immediate financial stress markers." }, { icon: Building2, title: "Micro-Finance Partners", desc: "Specialized lenders with adaptive eligibility for your specific profile." }].map((item, i) => (
                        <div key={i} className="border border-slate-100 rounded-2xl p-5 bg-slate-50 hover:bg-purple-50/50 hover:border-purple-200 transition-all cursor-pointer group shadow-sm">
                          <h4 className="text-sm font-black text-slate-800 group-hover:text-purple-700 flex items-center gap-2"><item.icon className="h-4 w-4 text-purple-500" /> {item.title}</h4>
                          <p className="text-[11px] font-semibold text-slate-500 mt-2 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* BOTTOM SECTION */}
            {result.decision === "approved" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-purple-50 shadow-xl shadow-slate-100 rounded-3xl bg-white/80 backdrop-blur-sm overflow-hidden group">
                  <CardContent className="p-8 md:p-10">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 transition-colors group-hover:text-purple-500"><Zap className="h-5 w-5 text-amber-500 shadow-sm"/> Optimization Checklist</h3>
                    <ul className="space-y-4">
                      {[{ icon: CheckCircle, color: "bg-emerald-100 text-emerald-600", text: "Maintain debt-to-income ratio below 35%" }, { icon: Upload, color: "bg-purple-100 text-purple-600", text: "Verify identity documents for instant trust" }, { icon: TrendingUp, color: "bg-indigo-100 text-indigo-600", text: "Liquidate small active credit cards if possible" }].map((item, i) => (
                        <li key={i} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all shadow-sm">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${item.color} border border-white`}><item.icon className="h-5 w-5" /></div>
                          <span className="text-sm font-black text-slate-700 tracking-tight">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <div className="flex flex-col gap-5 justify-center">
                  <Button
                    title="Compare all bank offers side by side"
                    variant="outline"
                    onClick={() => setShowCompareModal(true)}
                    className="h-20 rounded-3xl border-purple-100 text-slate-700 text-base font-black hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 shadow-xl shadow-slate-100 bg-white transition-all hover:-translate-y-1 active:scale-95"
                  >
                    <FileText className="h-7 w-7 mr-4 text-purple-500 shadow-sm" /> Compare All Plans
                  </Button>
                  <Button
                    title="Export your loan analysis summary"
                    variant="outline"
                    onClick={() => setShowDownloadModal(true)}
                    className="h-20 rounded-3xl border-purple-100 text-slate-700 text-base font-black hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 shadow-xl shadow-slate-100 bg-white transition-all hover:-translate-y-1 active:scale-95"
                  >
                    <Download className="h-7 w-7 mr-4 text-indigo-500 shadow-sm" /> Download AI Report
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
                <Button className="h-16 rounded-2xl border-0 text-white text-base font-black shadow-[0_10px_20px_-5px_rgba(225,29,72,0.4)] bg-gradient-to-r from-rose-500 to-red-600 hover:shadow-rose-200 transition-all active:scale-[0.98] min-w-[280px]"><RefreshCw className="h-5 w-5 mr-3" /> Optimize & Re-Assess</Button>
                <Button variant="outline" className="h-16 rounded-2xl border-purple-100 text-purple-700 text-base font-black hover:bg-purple-50 shadow-xl shadow-slate-100 bg-white transition-all min-w-[280px]"><Eye className="h-5 w-5 mr-3 text-purple-500" /> Explore Better Matches</Button>
              </div>
            )}

            <div className="bg-purple-50/50 backdrop-blur-md border border-purple-100 rounded-2xl p-5 flex items-start gap-4 mt-12 shadow-sm">
              <div className="p-2 bg-purple-100/80 rounded-xl shrink-0 shadow-inner"><Info className="h-4 w-4 text-purple-600 shadow-sm" /></div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-relaxed pt-1 opacity-80">"Disclaimer: This system utilizes AI-driven algorithms for approval recommendations. Final loan processing and formal agreements are subject to direct verification by the respective banking institutions."</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          MODAL: Bank Details (Apply button)
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showBankModal && bankModalPlan && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowBankModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 280 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 relative overflow-hidden">
                  <div className="absolute right-0 top-0 p-4 opacity-10"><Building2 className="h-24 w-24" /></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center"><Building2 className="h-6 w-6 text-white" /></div>
                    <div><h2 className="text-xl font-black">{bankModalPlan.bank}</h2><p className="text-indigo-200 text-sm font-medium">{bankModalPlan.tag}</p></div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Interest Rate", value: `${bankModalPlan.rate}% p.a.` },
                      { label: "Monthly EMI", value: formatINR(calculateEMI(formData.loanAmount, bankModalPlan.rate, resultTenure)) },
                      { label: "Processing Fee", value: bankModalPlan.fee },
                      { label: "Tenure", value: `${resultTenure} Years` },
                      { label: "Approved Amount", value: formatINR(formData.loanAmount) },
                      { label: "Approval Chance", value: `${bankModalPlan.approvalChance}%` },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="font-black text-gray-900 text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Why This Plan?</p>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{bankModalPlan.reason}</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold border-gray-200" onClick={() => setShowBankModal(false)}>Cancel</Button>
                    <Button disabled={isConfirmingPlan} onClick={handleConfirmPlan} className="flex-1 h-11 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                      {isConfirmingPlan ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Selecting…</> : "Confirm Selection"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          MODAL: Apply Now Confirmation
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showApplyNowModal && selectedPlan && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowApplyNowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 280 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                  <h2 className="text-xl font-black flex items-center gap-2"><ClipboardCheck className="h-6 w-6" /> Application Confirmation</h2>
                  <p className="text-emerald-100 text-sm mt-1 font-medium">Review your details before submitting</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Selected Bank", value: selectedPlan.bank },
                      { label: "Loan Amount", value: formatINR(formData.loanAmount) },
                      { label: "Interest Rate", value: `${selectedPlan.rate}% p.a.` },
                      { label: "Tenure", value: `${resultTenure} Years` },
                      { label: "Monthly EMI", value: formatINR(calculateEMI(formData.loanAmount, selectedPlan.rate, resultTenure)) },
                      { label: "Processing Fee", value: selectedPlan.fee },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="font-bold text-gray-900 text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={confirmChecked} onChange={e => setConfirmChecked(e.target.checked)} className="h-4 w-4 accent-indigo-600 rounded" />
                    <span className="text-sm font-semibold text-gray-700">I confirm that the submitted information is correct and I agree to the terms.</span>
                  </label>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold border-gray-200" onClick={() => setShowApplyNowModal(false)}>Cancel</Button>
                    <Button disabled={isSubmitting || !confirmChecked} onClick={handleSubmitApplication} className="flex-1 h-11 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60">
                      {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</> : "Submit Application"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          MODAL: Compare All Plans
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCompareModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowCompareModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 260 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex justify-between items-center">
                  <div><h2 className="text-xl font-black flex items-center gap-2"><FileText className="h-6 w-6" /> Compare All Plans</h2><p className="text-blue-100 text-sm mt-1 font-medium">Compare bank offers side by side</p></div>
                  <Button variant="ghost" size="icon" onClick={() => setShowCompareModal(false)} className="text-white hover:bg-white/20 rounded-full h-9 w-9"><X className="h-5 w-5" /></Button>
                </div>
                {/* Sort Controls */}
                <div className="flex gap-2 p-4 border-b border-gray-100 bg-gray-50">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center mr-2"><SortAsc className="h-3.5 w-3.5 mr-1" />Sort by:</span>
                  {([["approval", "Highest Approval"], ["emi", "Lowest EMI"], ["rate", "Lowest Rate"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setCompareSortBy(key)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${compareSortBy === key ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"}`}>{label}</button>
                  ))}
                </div>
                {/* Plans Table */}
                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  {sortedPlans.map((plan, i) => {
                    const isSelected = selectedPlan?.bank === plan.bank;
                    const emi = calculateEMI(formData.loanAmount, plan.rate, resultTenure);
                    const highlights = [];
                    if (plan.approvalChance === Math.max(...BANK_PLANS.map(p => p.approvalChance))) highlights.push("Best Match");
                    if (plan.rate === Math.min(...BANK_PLANS.map(p => p.rate))) highlights.push("Lowest Rate");
                    if (emi === Math.min(...BANK_PLANS.map(p => calculateEMI(formData.loanAmount, p.rate, resultTenure)))) highlights.push("Lowest EMI");
                    return (
                      <div key={plan.bank} className={`rounded-2xl border p-5 transition-all ${isSelected ? "border-emerald-400 bg-emerald-50/30" : "border-gray-200 bg-white hover:border-indigo-200"}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-12 w-12 rounded-2xl ${plan.logoClass} border border-gray-100 flex items-center justify-center shrink-0`}><Building2 className="h-5 w-5" /></div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-gray-900">{plan.bank}</h4>
                                {plan.isRecommended && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Best for You</span>}
                                {isSelected && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"><CheckCircle className="h-2.5 w-2.5" />Selected</span>}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {highlights.map(h => <span key={h} className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-100">{h}</span>)}
                              </div>
                            </div>
                          </div>
                          <span className="text-lg font-black text-emerald-600">{plan.approvalChance}% <span className="text-xs font-bold text-gray-400">approval</span></span>
                        </div>
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {[{ label: "Rate", val: `${plan.rate}%` }, { label: "EMI/mo", val: formatINR(emi) }, { label: "Tenure", val: `${resultTenure}y` }, { label: "Fee", val: plan.fee }].map(item => (
                            <div key={item.label} className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 text-center">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</p>
                              <p className="font-black text-gray-900 text-sm mt-0.5">{item.val}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleApply(plan)} className="flex-1 h-9 rounded-xl font-bold text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">View Details</Button>
                          <Button size="sm" onClick={() => handleSelectFromCompare(plan)} className={`flex-1 h-9 rounded-xl font-bold text-xs ${isSelected ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
                            {isSelected ? <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Selected</> : "Select Plan"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          MODAL: Download Report
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDownloadModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowDownloadModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 280 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white p-6 flex justify-between items-center">
                  <div><h2 className="text-xl font-black flex items-center gap-2"><Download className="h-6 w-6" /> Download Report</h2><p className="text-violet-100 text-sm mt-1 font-medium">Export your loan analysis summary</p></div>
                  <Button variant="ghost" size="icon" onClick={() => setShowDownloadModal(false)} className="text-white hover:bg-white/20 rounded-full h-9 w-9"><X className="h-5 w-5" /></Button>
                </div>
                <div className="p-6 space-y-5">
                  {/* Format */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Format</p>
                    <div className="flex gap-2">
                      {(["pdf", "csv"] as const).map(fmt => (
                        <button key={fmt} onClick={() => setDownloadFormat(fmt)} className={`flex-1 py-3 rounded-2xl border-2 font-bold text-sm uppercase tracking-wide transition-all ${downloadFormat === fmt ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-500 hover:border-indigo-200"}`}>
                          <FileText className="h-5 w-5 mx-auto mb-1" />{fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Include Options */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Include in Report</p>
                    <div className="space-y-2">
                      {([
                        { key: "loanSummary", label: "Loan Summary" },
                        { key: "emiBreakdown", label: "EMI Breakdown" },
                        { key: "comparedPlans", label: "Compared Bank Plans" },
                        { key: "aiRec", label: "AI Recommendation" },
                        { key: "steps", label: "Steps to Finalize" },
                      ] as const).map(item => (
                        <label key={item.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-colors">
                          <input type="checkbox" checked={downloadOptions[item.key]} onChange={e => setDownloadOptions(prev => ({ ...prev, [item.key]: e.target.checked }))} className="h-4 w-4 accent-indigo-600 rounded" />
                          <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setShowDownloadModal(false)}>Cancel</Button>
                    <Button disabled={isDownloading} onClick={handleDownload} className="flex-1 h-11 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                      {isDownloading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</> : <><Download className="h-4 w-4 mr-2" />Download Now</>}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LoanUserProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
