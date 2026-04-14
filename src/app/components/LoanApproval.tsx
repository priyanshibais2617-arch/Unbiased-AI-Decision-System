import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Upload, ArrowLeft, Loader2, CheckCircle, XCircle, Building2, TrendingUp, RefreshCw, BarChart4, Variable, Mic, Bookmark, Award, ShieldCheck, Zap, FileCheck, LineChart as LineChartIcon, Edit2, CheckSquare, Eye, Trash2, Plus, Download, Percent, ChevronRight, Activity, ThumbsUp, Star, FileText, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { LoanUserProfilePanel } from "./LoanUserProfilePanel";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, LineChart, Line } from "recharts";

interface LoanResult {
  decision: "approved" | "denied";
  approvedAmount?: number;
  interestRate?: number;
  tenure?: number;
  reason: string;
  recommendations: string[];
  riskScore: number;
}

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
};

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
         <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Risk Level</span>
      </div>
    </div>
  );
}

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
  const [documents, setDocuments] = useState<{id: string, name: string}[]>([]);
  const [resultTenure, setResultTenure] = useState(5);

  const calculateEMI = (principal: number, rate: number, tenureYears: number) => {
    const r = rate / 12 / 100;
    const n = tenureYears * 12;
    if (r === 0) return principal / n;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  useEffect(() => {
    if (formData.monthlyIncome === 0) {
      setProbability(0);
      setRiskScore(100);
      return;
    }
    
    const maxEMI = (formData.monthlyIncome * 0.5) - formData.existingLoans;
    const approxEMI = formData.loanAmount / (formData.tenure * 12);
    
    let prob = 50;
    if (approxEMI <= maxEMI && approxEMI > 0) {
      prob = 50 + ((maxEMI - approxEMI) / maxEMI) * 40;
    } else {
      prob = Math.max(5, 50 - ((approxEMI - maxEMI) / Math.max(approxEMI, 1)) * 50);
    }
    
    prob += 5; 
    
    prob = Math.max(2, Math.min(98, Math.round(prob)));
    setProbability(prob);
    setRiskScore(100 - prob);
  }, [formData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newDocs = Array.from(files).map(file => ({
         id: Math.random().toString(36).substr(2, 9),
         name: file.name
      }));
      setDocuments(prev => [...prev, ...newDocs]);
      toast.success(`${files.length} document(s) uploaded successfully!`);
    }
  };

  const saveApplication = () => {
    setSavedApps(prev => [...prev, { id: Date.now(), amount: formData.loanAmount, probability, risk: riskScore }]);
    toast.success("Scenario saved for comparison!");
  };

  const startVoiceInput = () => {
    toast.info("Voice input simulated: 'I want an 80 lakh loan'");
    setFormData(prev => ({ ...prev, loanAmount: 8000000 }));
  };

  const analyzeLoan = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const isApproved = probability >= 50;
      setResult(isApproved
        ? {
            decision: "approved",
            approvedAmount: formData.loanAmount,
            interestRate: 7.5,
            tenure: formData.tenure,
            reason: "Your financial profile meets our lending criteria with a well-balanced debt-to-income ratio.",
            recommendations: [
              "Maintain consistent monthly income",
              "Keep debt-to-income ratio below 40%",
              "Make timely EMI payments to improve credit score",
            ],
            riskScore,
          }
        : {
            decision: "denied",
            reason: probability < 30 
              ? "The requested loan amount presents a high financial burden compared to your income."
              : "Existing debt obligations limit our ability to approve this request right now.",
            recommendations: [
              "Consider applying for a lower loan amount",
              "Increase your monthly income through additional sources",
              "Pay off existing loans to reduce debt burden",
              "Build a stronger credit history",
            ],
            riskScore,
          });
      setResultTenure(formData.tenure);
      setIsAnalyzing(false);
      toast.success("Analysis complete!");
    }, 2500);
  };

  const barData = [
    { factor: 'Income Stability', contribution: probability > 50 ? 25 : -15 },
    { factor: 'Existing Loans', contribution: formData.existingLoans > 0 ? -20 : 5 },
    { factor: 'Credit Value', contribution: riskScore < 40 ? 15 : -30 },
  ];

  const creditHistoryData = [
    { month: 'Jan', score: 710 },
    { month: 'Feb', score: 715 },
    { month: 'Mar', score: 730 },
    { month: 'Apr', score: 750 },
    { month: 'May', score: 765 },
    { month: 'Jun', score: 785 },
  ];

  const aiSuggestions = [
    { text: "We recommend improving your credit score by paying off active debt.", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
    { text: "Provide additional identity documents for faster verification.", icon: FileCheck, color: "text-blue-600", bg: "bg-blue-100" },
    { text: "Reduce existing EMI values to substantially improve probability.", icon: Zap, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  const requiredDocuments = [
     "Identity Proof (Aadhaar / PAN)",
     "Address Proof",
     "Salary Slips (Last 3–6 months)",
     "Bank Statements (Last 6 months)",
     "Employment Proof / Offer Letter",
     "ITR (for self-employed)"
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-[1400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-gray-600 hover:text-gray-900 border border-gray-200 shadow-sm">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-sm">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Advanced Loan System</h1>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Explainable AI & Interactive Assessment</p>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="rounded-full h-10 w-10 p-0 border border-gray-200 overflow-hidden shadow-sm hover:scale-105 transition-transform" onClick={() => setIsProfileOpen(true)}>
              <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                VK
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with added top padding for proper spacing */}
      <div className="container mx-auto px-4 pt-8 pb-12 max-w-[1400px] mt-4">
        {/* INPUT PHASE: ONLY Simulator, Approval Chance, Risk, OCR */}
        {!result && !isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Left Column: Simulator */}
            <div className="space-y-6 flex flex-col h-full">
              <Card className="shadow-md border-0 ring-1 ring-gray-100 flex-1 flex flex-col rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-white pb-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2"><Variable className="h-5 w-5 text-purple-600"/> What-If Simulator</CardTitle>
                      <CardDescription>Adjust variables or enter exact values to test outcomes.</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={startVoiceInput} className="rounded-full shadow-sm hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors" title="Use Voice Input">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 flex-1 flex flex-col justify-between">
                  
                  {/* Loan Amount */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-base text-gray-700">Loan Amount</Label>
                      {editMode.loan ? (
                         <div className="flex items-center gap-2">
                           <span className="font-bold text-purple-700">₹</span>
                           <Input 
                              type="number" 
                              className="w-[120px] h-8 text-right font-bold text-purple-700 bg-purple-50 border-purple-200"
                              value={formData.loanAmount}
                              onChange={(e) => setFormData({...formData, loanAmount: Number(e.target.value)})}
                              onBlur={() => setEditMode({...editMode, loan: false})}
                              onKeyDown={(e) => { if(e.key === 'Enter') setEditMode({...editMode, loan: false}) }}
                              autoFocus
                           />
                         </div>
                      ) : (
                         <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditMode({...editMode, loan: true})}>
                           <span className="font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg border border-purple-100 shadow-sm">{formatINR(formData.loanAmount)}</span>
                           <Edit2 className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                         </div>
                      )}
                    </div>
                    {!editMode.loan && (
                       <input 
                         type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                         min="100000" max="20000000" step="50000" 
                         value={formData.loanAmount} onChange={(e) => setFormData({...formData, loanAmount: Number(e.target.value)})}
                       />
                    )}
                  </div>

                  {/* Monthly Income */}
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-base text-gray-700">Monthly Income</Label>
                      {editMode.income ? (
                         <div className="flex items-center gap-2">
                           <span className="font-bold text-blue-700">₹</span>
                           <Input 
                              type="number" 
                              className="w-[120px] h-8 text-right font-bold text-blue-700 bg-blue-50 border-blue-200"
                              value={formData.monthlyIncome}
                              onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})}
                              onBlur={() => setEditMode({...editMode, income: false})}
                              onKeyDown={(e) => { if(e.key === 'Enter') setEditMode({...editMode, income: false}) }}
                              autoFocus
                           />
                         </div>
                      ) : (
                         <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditMode({...editMode, income: true})}>
                           <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 shadow-sm">{formatINR(formData.monthlyIncome)}</span>
                           <Edit2 className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                         </div>
                      )}
                    </div>
                    {!editMode.income && (
                       <input 
                         type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                         min="25000" max="1500000" step="5000" 
                         value={formData.monthlyIncome} onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})}
                       />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Tenure (Yrs)</Label>
                        <span className="font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">{formData.tenure}</span>
                      </div>
                      <input 
                        type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-700"
                        min="1" max="30" step="1" 
                        value={formData.tenure} onChange={(e) => setFormData({...formData, tenure: Number(e.target.value)})}
                      />
                    </div>
                    
                    {/* Existing EMI */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Existing EMI</Label>
                        {editMode.currentEMI ? (
                           <Input 
                              type="number" 
                              className="w-[90px] h-8 text-right font-bold text-orange-700 bg-orange-50 border-orange-200"
                              value={formData.existingLoans}
                              onChange={(e) => setFormData({...formData, existingLoans: Number(e.target.value)})}
                              onBlur={() => setEditMode({...editMode, currentEMI: false})}
                              onKeyDown={(e) => { if(e.key === 'Enter') setEditMode({...editMode, currentEMI: false}) }}
                              autoFocus
                           />
                        ) : (
                           <div className="flex items-center gap-1 group cursor-pointer" onClick={() => setEditMode({...editMode, currentEMI: true})}>
                             <span className="font-semibold text-orange-700 truncate max-w-[80px]">{formatINR(formData.existingLoans)}</span>
                             <Edit2 className="h-3.5 w-3.5 text-gray-400 group-hover:text-orange-600 transition-colors shrink-0" />
                           </div>
                        )}
                      </div>
                      {!editMode.currentEMI && (
                         <input 
                           type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                           min="0" max="500000" step="5000" 
                           value={formData.existingLoans} onChange={(e) => setFormData({...formData, existingLoans: Number(e.target.value)})}
                         />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-6 mt-auto">
                     <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg rounded-xl h-14 text-base font-bold transition-transform active:scale-[0.98]" onClick={analyzeLoan}>
                       <CheckCircle className="h-5 w-5" /> Analyze Loan Request
                     </Button>
                     <Button variant="outline" className="w-full gap-2 rounded-xl h-12 border-gray-300 bg-white shadow-sm" onClick={saveApplication}>
                       <Bookmark className="h-5 w-5 text-gray-600" /> Save Scenario
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: AI Analytics & Docs ONLY */}
            <div className="space-y-6 flex flex-col">
              {/* Real-time Probability Card */}
              <Card className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 text-white border-0 shadow-lg relative overflow-hidden rounded-2xl shrink-0">
                <div className="absolute top-0 right-0 p-3 opacity-20"><RefreshCw className="h-24 w-24" /></div>
                <CardContent className="p-6 relative z-10">
                  <h3 className="text-indigo-200 font-semibold mb-2 uppercase tracking-wider text-xs">Real-Time Approval Chance</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-black tabular-nums tracking-tighter">{probability}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2.5 mb-5 shadow-inner overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-[800ms] ease-out ${probability > 70 ? 'bg-green-400' : probability > 40 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${probability}%` }} />
                  </div>
                  
                  <div className="border-t border-white/10 pt-4 pb-2">
                     <RiskGauge risk={riskScore} />
                  </div>
                </CardContent>
              </Card>

              {/* Document Upload */}
              <Card className="shadow-md rounded-2xl border border-gray-100 flex-1 flex flex-col bg-white">
                <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
                  <CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4 text-indigo-600"/> Smart Document Upload & Auto-Fill</CardTitle>
                  <CardDescription className="text-xs">Upload financial documents to auto-fill your loan details instantly.</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 flex-1 flex flex-col relative space-y-4">
                  <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors group cursor-pointer relative overflow-hidden">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} multiple />
                    <div className="p-3 bg-white rounded-full w-fit mx-auto mb-3 shadow-sm group-hover:scale-110 group-hover:-translate-y-1 transition-all">
                       <Upload className="h-6 w-6 text-indigo-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">Tap to upload financial documents</p>
                    <p className="text-[11px] text-gray-500 mt-1">Accepts PDF, JPG, PNG (Max 5MB)</p>
                  </div>

                  {documents.length > 0 && (
                     <div className="space-y-2 mt-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence>
                           {documents.map((doc) => (
                             <motion.div key={doc.id} initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}}>
                               <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-xl group/item">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                     <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0"><FileCheck className="h-4 w-4 text-green-600" /></div>
                                     <p className="text-sm font-semibold text-gray-700 truncate">{doc.name}</p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 group-hover/item:opacity-100 transition-opacity">
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-100"><Eye className="h-4 w-4" /></Button>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-100" onClick={() => setDocuments(docs => docs.filter(d => d.id !== doc.id))}><Trash2 className="h-4 w-4" /></Button>
                                  </div>
                               </div>
                             </motion.div>
                           ))}
                        </AnimatePresence>
                     </div>
                  )}

                  <div className="flex justify-center pt-2">
                     <Button variant="outline" className="w-full rounded-xl border-dashed border-indigo-300 text-indigo-700 font-bold bg-white hover:bg-indigo-50 relative overflow-hidden h-10">
                       <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileUpload} multiple />
                       <Plus className="h-4 w-4 mr-2" /> Upload More Documents
                     </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Required Documents List */}
              <Card className="shadow-sm rounded-2xl border border-gray-100 bg-white shrink-0">
                 <CardHeader className="py-3 border-b border-gray-50 bg-amber-50/50">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-900"><CheckSquare className="h-4 w-4 text-amber-600" /> Required Documents Check</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                       {requiredDocuments.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-2 relative pl-5">
                             <div className="absolute left-0 top-1 h-3 w-3 rounded-full border border-gray-300 bg-white shrink-0 shadow-sm" />
                             <p className="text-[11px] font-semibold text-gray-600 leading-tight block truncate w-full" title={doc}>{doc}</p>
                          </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Analyzing State */}
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
            <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Generating Intelligence Report</h3>
            <p className="text-gray-500 mb-8 font-medium">Running advanced fairness checks and building predictive models...</p>
          </motion.div>
        )}

        {/* Modern Clean Results View */}
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[1200px] mx-auto space-y-8 pb-12">
             
             <div className="flex justify-between items-center mb-4 px-2">
                <Button variant="ghost" onClick={() => setResult(null)} className="gap-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-xl font-bold bg-white shadow-sm border border-gray-200">
                   <ArrowLeft className="h-4 w-4" /> Back to Assessment
                </Button>
             </div>

             {/* TOP SECTION: APPROVAL & HEALTH */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Approval Card */}
                <Card className={`md:col-span-2 border-0 shadow-lg rounded-3xl relative overflow-hidden ${result.decision === "approved" ? "bg-gradient-to-br from-green-500 to-emerald-700 text-white" : "bg-gradient-to-br from-red-500 to-rose-700 text-white"}`}>
                   <div className="absolute top-0 right-0 p-8 opacity-10">{result.decision === "approved" ? <ThumbsUp className="h-48 w-48" /> : <XCircle className="h-48 w-48" />}</div>
                   <CardContent className="p-10 relative z-10 flex flex-col justify-center h-full">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            {result.decision === "approved" ? <CheckCircle className="h-10 w-10 text-white" /> : <XCircle className="h-10 w-10 text-white" />}
                         </div>
                         <div>
                            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md mb-2">
                               <ShieldCheck className="h-3.5 w-3.5" /> Bias-Free AI Assessed
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">{result.decision === "approved" ? "Loan Approved" : "Loan Denied"}</h2>
                         </div>
                      </div>
                      <p className={`text-lg font-medium max-w-lg mt-2 ${result.decision === "approved" ? "text-green-50" : "text-red-50"}`}>
                         {result.decision === "approved" 
                            ? "Your financial profile meets our lending criteria." 
                            : result.reason}
                      </p>
                   </CardContent>
                </Card>

                {/* Score Card */}
                <Card className="border-0 shadow-lg rounded-3xl bg-white overflow-hidden flex flex-col justify-center relative">
                   <CardContent className="p-8">
                       <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-blue-500" /> Financial Health</h3>
                       <div className="flex items-end gap-2 mb-3">
                          <span className="text-6xl font-black text-gray-900 tracking-tighter">85</span>
                          <span className="text-xl text-gray-400 font-bold mb-1.5">/100</span>
                       </div>
                       <div className="w-full bg-gray-100 rounded-full h-3 mb-4 shadow-inner">
                          <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: '85%' }} />
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +4 Pts</span>
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">Risk: Low</span>
                       </div>
                   </CardContent>
                </Card>
             </div>

             {/* MIDDLE SECTION: OFFERS & EMI */}
             {result.decision === "approved" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   
                   {/* Best Offer */}
                   <Card className="lg:col-span-1 border-2 border-indigo-500 shadow-xl rounded-3xl bg-white relative overflow-hidden flex flex-col hover:shadow-2xl transition-shadow">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2 text-sm font-bold tracking-wide flex items-center justify-center gap-1.5">
                         <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> Best for You
                      </div>
                      <CardContent className="p-8 flex flex-col flex-1">
                         <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                               <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                  <Building2 className="h-6 w-6 text-indigo-600" />
                               </div>
                               <div>
                                  <h3 className="text-xl font-bold text-gray-900">HDFC Bank</h3>
                                  <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-0.5 inline-block">Premium Partner</p>
                               </div>
                            </div>
                         </div>
                         
                         <div className="space-y-5 flex-1">
                            <div>
                               <p className="text-sm font-semibold text-gray-500 mb-1">Approved Amount</p>
                               <p className="text-3xl font-black text-gray-900">{formatINR(formData.loanAmount)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                                  <p className="text-xs font-semibold text-gray-500 mb-0.5">Interest Rate</p>
                                  <p className="text-lg font-bold text-indigo-600">8.5% p.a.</p>
                               </div>
                               <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                                  <p className="text-xs font-semibold text-gray-500 mb-0.5">Tenure</p>
                                  <p className="text-lg font-bold text-gray-800">{resultTenure} Years</p>
                               </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 mt-2">
                                <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center justify-between">Monthly EMI <span className="text-xs font-medium text-gray-400 lowercase">approx</span></p>
                                <p className="text-3xl font-black text-gray-900">{formatINR(calculateEMI(formData.loanAmount, 8.5, resultTenure))}</p>
                            </div>
                         </div>
                         
                         <Button className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-14 text-lg font-bold shadow-[0_8px_16px_-4px_rgba(79,70,229,0.4)] transition-transform active:scale-[0.98]">
                            Apply Now <ChevronRight className="h-5 w-5 ml-1" />
                         </Button>
                      </CardContent>
                   </Card>

                   {/* Bank Comparison & Calculator */}
                   <div className="lg:col-span-2 flex flex-col gap-6">
                      
                      {/* Bank Comparison */}
                      <div className="flex flex-col gap-3">
                         <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-1"><Building2 className="h-5 w-5 text-indigo-500"/> Other Top Options</h3>
                         
                         {[
                           { bank: 'State Bank of India', rate: 8.7, fee: '₹1,500', logo: 'bg-blue-50 text-blue-600' },
                           { bank: 'ICICI Bank', rate: 8.9, fee: '₹2,000', logo: 'bg-orange-50 text-orange-600' }
                         ].map((offer, i) => (
                           <Card key={i} className="border border-gray-200 shadow-sm rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all bg-white group cursor-pointer">
                              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                 <div className="flex items-center gap-4 min-w-[200px]">
                                    <div className={`h-14 w-14 rounded-2xl ${offer.logo} border border-gray-100 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                                       <Building2 className={`h-6 w-6`} />
                                    </div>
                                    <div>
                                       <h4 className="text-lg font-bold text-gray-900">{offer.bank}</h4>
                                       <p className="text-xs font-medium text-gray-500 mt-0.5">Processing Fee: {offer.fee}</p>
                                    </div>
                                 </div>
                                 
                                 <div className="flex flex-row items-center sm:gap-10 justify-between w-full sm:w-auto mt-2 sm:mt-0 flex-1">
                                    <div className="text-center sm:text-left">
                                       <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Interest</p>
                                       <p className="text-lg font-bold text-gray-900">{offer.rate}%</p>
                                    </div>
                                    <div className="text-center sm:text-left">
                                       <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">EMI</p>
                                       <p className="text-lg font-bold text-gray-900">{formatINR(calculateEMI(formData.loanAmount, offer.rate, resultTenure))}</p>
                                    </div>
                                    <Button variant="outline" className="hidden sm:flex rounded-xl font-bold border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 shadow-sm ml-auto">
                                       Apply
                                    </Button>
                                 </div>
                              </CardContent>
                           </Card>
                         ))}
                      </div>

                      {/* EMI Calculator */}
                      <Card className="border border-gray-100 shadow-md rounded-3xl bg-white flex-1 flex flex-col">
                         <CardContent className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                            <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2"><Percent className="h-5 w-5 text-purple-500"/> Interactive EMI Breakdown</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center h-full">
                               <div className="space-y-8">
                                  <div>
                                     <div className="flex justify-between mb-3 items-center">
                                        <Label className="font-semibold text-gray-600 text-sm">Adjust Tenure</Label>
                                        <span className="font-bold text-indigo-700 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-sm">{resultTenure} Years</span>
                                     </div>
                                     <input 
                                        type="range" className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        min="1" max="15" step="1" 
                                        value={resultTenure} onChange={(e) => setResultTenure(Number(e.target.value))}
                                     />
                                     <div className="flex justify-between mt-2 text-xs font-bold text-gray-400 px-1">
                                         <span>1 Yr</span>
                                         <span>15 Yrs</span>
                                     </div>
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-4 w-4 text-amber-500" />
                                        <p className="text-sm font-bold text-gray-700">Smart AI Recommendation</p>
                                     </div>
                                     <p className="text-sm font-medium text-gray-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50 leading-relaxed shadow-sm">
                                        "Based on your income, a tenure of 4-5 years gives you the best debt-to-income balance. We recommend a loan between ₹4–6 lakh."
                                     </p>
                                  </div>
                               </div>
                               
                               <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative overflow-hidden h-full flex flex-col justify-center">
                                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]"><Activity className="h-48 w-48"/></div>
                                  <div className="space-y-5 relative z-10">
                                     <div className="flex justify-between items-end">
                                        <span className="text-sm font-semibold text-gray-500">Monthly EMI</span>
                                        <span className="text-2xl font-black text-gray-900">{formatINR(calculateEMI(formData.loanAmount, 8.5, resultTenure))}</span>
                                     </div>
                                     <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                                        <span className="text-sm font-semibold text-gray-500">Total Interest</span>
                                        <span className="text-base font-bold text-gray-600">{formatINR((calculateEMI(formData.loanAmount, 8.5, resultTenure) * resultTenure * 12) - formData.loanAmount)}</span>
                                     </div>
                                     <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                                        <span className="text-sm font-bold text-gray-600">Total Amount Payable</span>
                                        <span className="text-xl font-black text-indigo-700">{formatINR(calculateEMI(formData.loanAmount, 8.5, resultTenure) * resultTenure * 12)}</span>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </CardContent>
                      </Card>
                   </div>
                </div>
             )}

             {/* BOTTOM SECTION: TIPS & ACTIONS */}
             {result.decision === "approved" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="border border-gray-100 shadow-sm rounded-3xl bg-white">
                      <CardContent className="p-6 md:p-8">
                         <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500"/> Steps to Finalize</h3>
                         <ul className="space-y-4">
                            <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                               <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                               </div>
                               <span className="text-sm font-semibold text-gray-700">Improve credit score by paying off active debts</span>
                            </li>
                            <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                               <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                                  <Upload className="h-4 w-4 text-blue-600" />
                               </div>
                               <span className="text-sm font-semibold text-gray-700">Upload documents for faster processing</span>
                            </li>
                            <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                               <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 shadow-sm">
                                  <TrendingUp className="h-4 w-4 text-purple-600" />
                               </div>
                               <span className="text-sm font-semibold text-gray-700">Reduce existing EMI obligations</span>
                            </li>
                         </ul>
                      </CardContent>
                   </Card>
                   
                   <div className="flex flex-col gap-4 justify-center">
                      <Button variant="outline" className="h-[72px] rounded-2xl border-gray-200 text-gray-700 text-base font-bold hover:bg-gray-50 shadow-sm bg-white hover:border-blue-200 hover:text-blue-700 transition-colors">
                         <FileText className="h-6 w-6 mr-3 text-blue-500" /> Compare All Plans
                      </Button>
                      <Button variant="outline" className="h-[72px] rounded-2xl border-gray-200 text-gray-700 text-base font-bold hover:bg-gray-50 shadow-sm bg-white hover:border-indigo-200 hover:text-indigo-700 transition-colors">
                         <Download className="h-6 w-6 mr-3 text-indigo-500" /> Download Report
                      </Button>
                   </div>
                </div>
             )}

             {/* DISCLAIMER NOTE SECTION */}
             <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 mt-8 shadow-sm">
                <div className="p-1.5 bg-blue-100/80 rounded-full shrink-0">
                   <Info className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600 leading-relaxed pt-0.5">
                   "This system provides an AI-based approval recommendation. Final loan processing and agreement will take place between the user and the bank."
                </p>
             </div>

          </motion.div>
        )}
      </div>

      <LoanUserProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
