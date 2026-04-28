import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Upload, ArrowLeft, Shield, FileCheck, CheckCircle, Lock, ServerOff, MessageSquare, Plus, FileText, Image as ImageIcon, Briefcase, GraduationCap, IndianRupee, Cpu, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { DocumentUserProfilePanel } from "./DocumentUserProfilePanel";
import { apiFetch } from "../api";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  docType: string;
}

const TABS = [
  { id: "ID Proof", icon: FileCheck },
  { id: "Marksheet", icon: GraduationCap },
  { id: "Experience Letter", icon: Briefcase },
  { id: "Salary Slip", icon: IndianRupee }
];

export function DocumentVerification() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isHoveringDrop, setIsHoveringDrop] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHoveringDrop(true);
  };

  const handleDragLeave = () => {
    setIsHoveringDrop(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHoveringDrop(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      docType: activeTab
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const currentFiles = files.filter(f => f.docType === activeTab);

  const processDocuments = async () => {
    if (!files.length) {
      toast.error("Please upload at least one document.");
      return;
    }
    setIsProcessing(true);
    try {
      const body = new FormData();
      body.append("service_type", "document");
      body.append("payload", JSON.stringify({}));
      const docTypes: string[] = [];
      files.forEach((item) => {
        body.append("files", item.file);
        docTypes.push(item.docType);
      });
      body.append("doc_types", JSON.stringify(docTypes));
      const response = await apiFetch("/services/analyze", {
        method: "POST",
        body,
      });
      setVerificationResult(response.data);
      toast.success("Document verification analysis complete.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Document verification failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans text-slate-900 flex flex-col items-center">

      {/* Floating Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mt-6 px-4 z-20"
      >
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-3xl py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white/60 hover:bg-white text-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-white/80 group"
                  >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-semibold text-xs rounded-xl px-3 py-1.5 shadow-xl border-white/20 bg-white/90 text-slate-800 backdrop-blur-md">
                  Go Back
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-[#2563eb]/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tight text-slate-800 leading-none">DocuGuard Vault</h1>
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#2563eb]/80 mt-1">Military-Grade AI Authentication</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2563eb] to-[#38bdf8] text-white font-bold text-sm shadow-md flex items-center justify-center hover:scale-105 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all cursor-pointer relative"
          >
            AR
          </button>
        </div>
      </motion.nav>
      
      <DocumentUserProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl px-4 flex flex-col items-center justify-center py-12 z-10 relative">
        
        {/* Document Tabs */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-10 w-full"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const hasFile = files.some(f => f.docType === tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3 rounded-full flex items-center gap-2.5 transition-all duration-300 border text-sm font-bold overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white border-transparent shadow-[0_8px_20px_rgba(37,99,235,0.25)] -translate-y-0.5' 
                    : 'bg-white/40 text-slate-600 border-white/60 hover:bg-white/70 hover:shadow-lg hover:border-white/80'
                }`}
              >
                {/* Active Tab Background Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#60a5fa] to-[#38bdf8] opacity-0 hover:opacity-20 transition-opacity" />
                )}
                <tab.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#2563eb]'}`} />
                <span className="relative z-10 whitespace-nowrap">{tab.id}</span>
                {hasFile && (
                  <CheckCircle className={`h-3.5 w-3.5 ml-1 ${isActive ? 'text-blue-100' : 'text-blue-500'}`} />
                )}
              </button>
            )
          })}
        </motion.div>

        {/* Upload Card */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full"
        >
          <div className="bg-white/50 backdrop-blur-2xl border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group/card shadow-blue-900/5">
            {/* Card inner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#60a5fa]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Secure Upload</h2>
              <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">Upload <span className="text-[#2563eb] font-bold">{activeTab}</span> documents for AI-based tampering analysis.</p>
            </div>

            {/* Upload Area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => currentFiles.length === 0 && fileInputRef.current?.click()}
              className={`relative z-10 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center justify-center ${
                currentFiles.length > 0 
                  ? 'border-transparent bg-transparent' 
                  : isHoveringDrop
                    ? 'border-[#2563eb] border-solid bg-[#e0f2fe]/50 scale-[1.02] shadow-[0_0_30px_rgba(37,99,235,0.15)]' 
                    : 'border-[#60a5fa] border-dashed bg-white/40 hover:bg-white/60 hover:border-[#2563eb] hover:shadow-lg cursor-pointer py-16'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.png,.jpg,.jpeg" 
                onChange={handleFileSelect} 
                multiple 
              />
              
              {currentFiles.length === 0 ? (
                <div className="flex flex-col items-center pointer-events-none">
                  <div className={`p-5 rounded-2xl mb-5 transition-transform duration-500 ${isHoveringDrop ? 'bg-[#e0f2fe] scale-110 shadow-md' : 'bg-white shadow-sm group-hover/card:-translate-y-1 group-hover/card:shadow-md'}`}>
                    <Upload className="h-8 w-8 text-[#2563eb]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Drag & Drop Documents Here</h3>
                  <p className="text-sm font-medium text-slate-400">Support for PDF, JPG, PNG up to <span className="text-[#2563eb]">10MB</span></p>
                  
                  <div className="mt-8">
                     <span className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] transition-shadow pointer-events-auto cursor-pointer">
                        Browse Files
                     </span>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <AnimatePresence>
                    {currentFiles.map((f, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                        key={f.id} 
                        className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-[#e0f2fe] border border-[#60a5fa] flex items-center justify-center shrink-0 overflow-hidden relative">
                              {f.previewUrl ? (
                                <img src={f.previewUrl} className="w-full h-full object-cover" />
                              ) : (
                                <FileText className="h-5 w-5 text-[#2563eb]" />
                              )}
                              <div className="absolute inset-0 bg-[#2563eb]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                           </div>
                           <div className="flex flex-col">
                              <h4 className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{f.file.name}</h4>
                              <p className="text-xs font-semibold text-slate-400 mt-0.5">{(f.file.size / 1024 / 1024).toFixed(2)} MB • {f.file.name.split('.').pop()?.toUpperCase()}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="bg-blue-50 text-blue-600 p-1.5 rounded-full">
                              <CheckCircle className="h-4 w-4" />
                           </div>
                           <button 
                             onClick={(e) => removeFile(f.id, e)} 
                             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                           >
                              <X className="h-4 w-4" />
                           </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <div className="flex items-center justify-center gap-4 pt-4">
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="text-sm font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1.5 bg-[#e0f2fe] px-4 py-2 rounded-xl border border-[#60a5fa] transition-colors cursor-pointer hover:shadow-sm"
                     >
                       <Plus className="h-4 w-4" /> Add More
                     </button>
                     <button 
                       onClick={processDocuments}
                       className="text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-6 py-2 rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-colors cursor-pointer"
                     >
                       {isProcessing ? "Processing..." : `Process Document${files.length > 1 ? 's' : ''}`}
                     </button>
                  </div>
                </div>
              )}
            </div>

            {verificationResult && (
              <div className="relative z-10 mt-8 rounded-3xl bg-white/80 border border-blue-100 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-black text-slate-900">AI Verification Result</h3>
                    <p className="text-sm font-semibold text-slate-500">Overall confidence: {verificationResult.overallConfidence}%</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black">
                    {verificationResult.overallConfidence}
                  </div>
                </div>
                <div className="space-y-3">
                  {verificationResult.documents?.map((doc: any, index: number) => (
                    <div key={`${doc.fileName}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-800">{doc.docType}: {doc.fileName}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-1">
                            Format {doc.checks.fileFormat} · Keyword hits {doc.checks.keywordHits} · Text extracted {doc.checks.textExtracted ? "yes" : "limited"}
                          </p>
                        </div>
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${doc.status === "verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {doc.status === "verified" ? "Verified" : "Review Needed"} · {doc.confidence}%
                        </span>
                      </div>
                      {doc.issues?.length > 0 && (
                        <ul className="mt-3 text-xs font-semibold text-amber-700 space-y-1">
                          {doc.issues.map((issue: string) => <li key={issue}>{issue}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Soft decorative blur inside card */}
            <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-[#60a5fa]/15 rounded-full blur-[80px] pointer-events-none" />
          </div>
        </motion.div>
      </main>

      {/* Floating Bottom Security Strip */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-2xl"
      >
        <div className="bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-full px-6 py-3 flex items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs font-bold text-slate-500 flex-wrap">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-[#2563eb]" />
            256-BIT SSL ENCRYPTED
          </div>
          <div className="h-3 w-px bg-slate-300 hidden sm:block" />
          <div className="flex items-center gap-2">
            <ServerOff className="h-3.5 w-3.5 text-[#38bdf8]" />
            NO SERVER LOGS KEPT
          </div>
          <div className="h-3 w-px bg-slate-300 hidden md:block" />
          <div className="items-center gap-2 hidden md:flex">
            <Cpu className="h-3.5 w-3.5 text-[#38bdf8]" />
            SECURE AI PROCESSING
          </div>
        </div>
      </motion.div>

      {/* Floating Chat/Help Button */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] shadow-[0_10px_25px_rgba(37,99,235,0.4)] flex items-center justify-center group overflow-hidden cursor-pointer"
      >
        <div className="absolute inset-0 bg-white/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageSquare className="h-6 w-6 text-white relative z-10" />
      </motion.button>
      
    </div>
  );
}
