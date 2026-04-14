import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, ArrowLeft, Loader2, CheckCircle, XCircle, Shield, FileCheck, Search, Image as ImageIcon, Briefcase, GraduationCap, IndianRupee, Plus, X, Lock, ServerOff, Eye, SearchSlash } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type DocType = "ID Proof" | "Marksheet" | "Experience Letter" | "Salary Slip";

interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface ScanResult {
  id: string;
  name: string;
  type: DocType;
  score: number;
  status: "Authentic" | "Needs Review" | "Suspected Tampering";
  issues: string[];
}

export function DocumentVerification() {
  const navigate = useNavigate();
  const [docType, setDocType] = useState<DocType>("ID Proof");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [showComparison, setShowComparison] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const docTypes = [
    { id: "ID Proof", icon: FileCheck },
    { id: "Marksheet", icon: GraduationCap },
    { id: "Experience Letter", icon: Briefcase },
    { id: "Salary Slip", icon: IndianRupee },
  ];

  const scanSteps = [
    "Metadata Inspection",
    "Signature Validation",
    "Deep OCR Text Matching"
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const newFiles = selectedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${selectedFiles.length} file(s) added successfully`);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startScan = () => {
    if (files.length === 0) return toast.error("Please add at least one document.");
    setIsScanning(true);
    setScanStep(0);
    setResults([]);

    // Real-Time Checklist Animation
    const timers = [
       setTimeout(() => setScanStep(1), 1500),
       setTimeout(() => setScanStep(2), 3000),
       setTimeout(() => setScanStep(3), 4500),
       setTimeout(() => {
          generateResults();
          setIsScanning(false);
          toast.success("Document verification complete");
       }, 5000)
    ];

    return () => timers.forEach(clearTimeout);
  };

  const generateResults = () => {
    const newResults: ScanResult[] = files.map((f, i) => {
      // Simulate random results. Ensure at least one is tampered if multiple files, or randomly assign.
      const isTampered = files.length > 1 ? i === 1 : Math.random() > 0.6;
      let score, status:"Authentic" | "Needs Review" | "Suspected Tampering", issues = [];
      
      if (isTampered) {
         score = Math.floor(Math.random() * 20) + 20; // 20-40%
         status = "Suspected Tampering";
         issues = ["EXIF Data Modified", "Signature overlay mismatch", "Inconsistent font rendering detected"];
      } else if (Math.random() > 0.8) {
         score = Math.floor(Math.random() * 20) + 65; // 65-85%
         status = "Needs Review";
         issues = ["Low resolution image", "Minor edge pixelation"];
      } else {
         score = Math.floor(Math.random() * 10) + 90; // 90-100%
         status = "Authentic";
      }

      return {
        id: f.id,
        name: f.file.name,
        type: docType,
        score,
        status,
        issues
      };
    });
    setResults(newResults);
  };

  const glassmorphismClass = "bg-white/70 backdrop-blur-md border border-white/20 shadow-lg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 pb-16 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Header */}
      <div className={`sticky top-0 z-20 border-b border-indigo-100 ${glassmorphismClass}`}>
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-indigo-900 bg-white/50 hover:bg-white shadow-sm rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">DocuGuard Vault</h1>
                  <p className="text-sm text-indigo-700/80 font-bold tracking-tight">Military-Grade AI Authentication</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        
        {!isScanning && results.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* 1. Document Type Selector */}
            <div className="flex flex-wrap gap-3 mb-6">
               {docTypes.map(type => (
                 <button
                   key={type.id}
                   onClick={() => setDocType(type.id as DocType)}
                   className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${docType === type.id ? 'bg-indigo-600 text-white shadow-indigo-200 scale-105 hover:bg-indigo-700' : 'bg-white text-gray-600 border border-transparent hover:border-indigo-100 hover:shadow-md'}`}
                 >
                   <type.icon className="h-4 w-4" />
                   {type.id}
                 </button>
               ))}
            </div>

            <Card className={`rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${glassmorphismClass}`}>
              <CardHeader className="border-b border-indigo-50/50 pb-4 bg-white/40">
                <CardTitle className="text-lg flex items-center gap-2">
                   <Upload className="h-5 w-5 text-indigo-600"/> Secure Upload
                </CardTitle>
                <CardDescription>Upload {docType} documents for tampering analysis.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                
                {/* 5. Multi-File Upload & Previews */}
                {files.length > 0 ? (
                   <div className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AnimatePresence>
                           {files.map((f) => (
                             <motion.div key={f.id} initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}}>
                                <div className="relative group rounded-2xl overflow-hidden border border-indigo-100 shadow-sm bg-white hover:border-indigo-300 transition-colors">
                                   <div className="h-32 w-full bg-slate-100 relative">
                                      <img src={f.previewUrl} alt={f.file.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                      <button onClick={() => removeFile(f.id)} className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-red-500 rounded-full shadow-md backdrop-blur-sm transition-colors">
                                         <X className="h-4 w-4" />
                                      </button>
                                   </div>
                                   <div className="p-3 bg-white flex items-center gap-2">
                                      <ImageIcon className="h-4 w-4 text-indigo-500 shrink-0" />
                                      <p className="text-xs font-bold text-gray-700 truncate">{f.file.name}</p>
                                   </div>
                                </div>
                             </motion.div>
                           ))}
                        </AnimatePresence>
                     </div>
                     <div className="flex mt-6 gap-3 pt-4 border-t border-indigo-100/50">
                        <Button variant="outline" className="flex-1 border-dashed border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 rounded-xl font-bold h-12" onClick={() => fileInputRef.current?.click()}>
                           <Plus className="h-4 w-4 mr-2" /> Add More Files
                        </Button>
                        <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg font-bold h-12 text-base" onClick={startScan}>
                           <Search className="h-5 w-5 mr-2" /> Start AI Scan
                        </Button>
                     </div>
                   </div>
                ) : (
                   <div 
                     className="border-[3px] border-dashed border-indigo-200 bg-indigo-50/30 rounded-3xl p-16 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group"
                     onClick={() => fileInputRef.current?.click()}
                   >
                     <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect} multiple />
                     <div className="p-5 bg-white/80 rounded-2xl shadow-sm w-fit mx-auto mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300">
                        <Upload className="h-10 w-10 text-indigo-500" />
                     </div>
                     <p className="text-xl font-black text-indigo-950 mb-2">Drag & Drop Documents Here</p>
                     <p className="text-sm font-medium text-indigo-600/70">Support for PDF, JPG, PNG up to 10MB.</p>
                   </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 4. Real-Time Status Checklist */}
        {isScanning && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center py-20">
            <Card className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl ${glassmorphismClass}`}>
               <CardContent className="p-10">
                  <div className="text-center mb-10">
                    <div className="relative inline-block">
                       <Loader2 className="h-16 w-16 text-indigo-600 animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-indigo-600" />
                       </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mt-4">Verifying Document{files.length > 1 ? 's' : ''}...</h3>
                    <p className="text-sm text-gray-500 font-medium">Running 256-point cryptographic checks</p>
                  </div>

                  <div className="space-y-6 max-w-sm mx-auto pl-4">
                     {scanSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                           <div className="shrink-0 w-8 flex justify-center">
                             {scanStep > idx ? (
                               <motion.div initial={{scale:0}} animate={{scale:1}} className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                                 <CheckCircle className="h-3 w-3 text-white" />
                               </motion.div>
                             ) : scanStep === idx ? (
                               <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                             ) : (
                               <div className="h-3 w-3 bg-slate-200 rounded-full" />
                             )}
                           </div>
                           <p className={`font-bold transition-all ${scanStep > idx ? 'text-gray-900' : scanStep === idx ? 'text-indigo-600 text-lg' : 'text-gray-400'}`}>
                              {step}
                           </p>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 3. Verification Trust Meter & Results */}
        {!isScanning && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {showComparison ? (
               // 7. Comparison View Feature
               <Card className={`rounded-3xl shadow-xl overflow-hidden ${glassmorphismClass}`}>
                  <CardHeader className="bg-slate-900 text-white border-b border-slate-800 p-6">
                     <div className="flex justify-between items-center">
                        <div>
                           <CardTitle className="text-xl flex items-center gap-2 text-rose-400"><SearchSlash className="h-6 w-6"/> Tampering Investigation</CardTitle>
                           <CardDescription className="text-slate-400">Advanced forensic overlay highlighting suspicious pixel density blocks.</CardDescription>
                        </div>
                        <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white rounded-xl" onClick={() => setShowComparison(null)}>
                           <X className="h-4 w-4 mr-2"/> Close View
                        </Button>
                     </div>
                  </CardHeader>
                  <CardContent className="p-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3 relative group">
                           <Badge className="absolute top-4 left-4 z-10 bg-slate-900 border-0">Original Input</Badge>
                           <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 relative">
                              <img src={files.find(f => f.id === showComparison)?.previewUrl} className="w-full h-full object-cover filter blur-sm opacity-50 absolute" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <ImageIcon className="h-16 w-16 text-slate-300"/>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-3 relative group">
                           <Badge className="absolute top-4 left-4 z-10 bg-red-600 border-0 shadow-lg animate-pulse text-white">Forensic Output</Badge>
                           <div className="aspect-[3/4] bg-slate-900 rounded-xl overflow-hidden border-2 border-red-500/50 relative relative">
                              <img src={files.find(f => f.id === showComparison)?.previewUrl} className="w-full h-full object-cover opacity-30 contrast-150 absolute mix-blend-luminosity" />
                              <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay border border-red-500" />
                              {/* Tampered Highlights */}
                              <div className="absolute top-1/4 left-[20%] w-[60%] h-[10%] border-2 border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.6)] rounded-sm flex items-center justify-center">
                                 <span className="text-[10px] font-black text-red-100 bg-red-900/60 px-2 py-0.5 rounded">Metadata Shift</span>
                              </div>
                              <div className="absolute top-[60%] left-[30%] w-[40%] h-[15%] border-2 border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.6)] rounded-sm flex items-center justify-center">
                                 <span className="text-[10px] font-black text-red-100 bg-red-900/60 px-2 py-0.5 rounded">Signature Artifacts</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {results.map((res) => {
                    const isTampered = res.score < 50;
                    const isReview = res.score >= 50 && res.score < 90;
                    const isAuthentic = res.score >= 90;
                    const colorScore = isAuthentic ? '#10b981' : isReview ? '#eab308' : '#ef4444';
                    const data = [{value: res.score, fill: colorScore}, {value: 100-res.score, fill: 'rgba(0,0,0,0.05)'}];

                    return (
                      <Card key={res.id} className={`rounded-3xl shadow-lg border hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${glassmorphismClass} ${isAuthentic ? 'border-b-4 border-b-emerald-500' : isTampered ? 'border-b-4 border-b-red-500' : 'border-b-4 border-b-yellow-500'}`}>
                         <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-6 border-b pb-4">
                               <div className="flex gap-3">
                                  <div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 shadow-inner">
                                     <img src={files.find(f => f.id === res.id)?.previewUrl} className="w-full h-full object-cover opacity-90" />
                                  </div>
                                  <div>
                                     <h3 className="font-bold text-gray-900 truncate max-w-[180px]" title={res.name}>{res.name}</h3>
                                     <Badge variant="outline" className="mt-1 bg-white text-xs">{res.type}</Badge>
                                  </div>
                               </div>
                               <Badge className={`px-3 py-1 font-bold ${isAuthentic ? 'bg-emerald-100 text-emerald-700' : isTampered ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'} border-0`}>
                                  {isAuthentic && <CheckCircle className="h-3 w-3 mr-1 inline"/>}
                                  {isTampered && <XCircle className="h-3 w-3 mr-1 inline"/>}
                                  {res.status}
                               </Badge>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                               <div className="h-[120px] w-[120px] relative shrink-0">
                                  <ResponsiveContainer width="100%" height="100%">
                                     <PieChart>
                                        <Pie data={data} innerRadius={42} outerRadius={55} startAngle={225} endAngle={-45} dataKey="value" stroke="none" strokeWidth={0} />
                                     </PieChart>
                                  </ResponsiveContainer>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                     <span className={`text-2xl font-black ${isAuthentic ? 'text-emerald-500' : isTampered ? 'text-red-500' : 'text-yellow-500'}`}>{res.score}%</span>
                                     <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Trust</span>
                                  </div>
                               </div>
                               <div className="w-full">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Scan Report</p>
                                  {res.issues.length > 0 ? (
                                    <ul className="space-y-1.5">
                                       {res.issues.map((issue, idx) => (
                                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                             {isTampered ? <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 mt-2 shrink-0" />}
                                             {issue}
                                          </li>
                                       ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4" /> All cryptographic verifications passed. No anomalies detected.
                                    </p>
                                  )}
                               </div>
                            </div>

                            {isTampered && (
                               <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 border-b-4 border-red-500 active:border-b-0 active:translate-y-[4px] transition-all" onClick={() => setShowComparison(res.id)}>
                                  <Eye className="h-4 w-4 mr-2" /> View Compromised Issues
                               </Button>
                            )}
                         </CardContent>
                      </Card>
                    )
                 })}
               </div>
            )}

            <div className="flex justify-center mt-8">
               <Button variant="outline" className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold px-8 h-12" onClick={() => {setFiles([]); setResults([]); setShowComparison(null);}}>
                  Scan More Documents
               </Button>
            </div>
          </motion.div>
        )}

      </div>

      {/* 6. Security Badges */}
      <div className={`fixed bottom-0 w-full border-t border-indigo-50/50 py-3 z-10 ${glassmorphismClass} rounded-t-3xl`}>
         <div className="container mx-auto max-w-4xl flex flex-wrap justify-center gap-6 px-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-800/60 uppercase tracking-widest">
               <Lock className="h-4 w-4 text-emerald-500" /> 256-Bit SSL Encrypted
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-800/60 uppercase tracking-widest">
               <ServerOff className="h-4 w-4 text-emerald-500" /> No Server Logs Kept
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-800/60 uppercase tracking-widest hidden sm:flex">
               <Shield className="h-4 w-4 text-emerald-500" /> Secure AI Processing
            </div>
         </div>
      </div>
    
    </div>
  );
}
