import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, ArrowLeft, Loader2, CheckCircle, XCircle, Lightbulb, Briefcase, TrendingUp, Target, FileCheck, FileCode2, Trash2, BrainCircuit, ScanLine, Sparkles, Terminal } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface AnalysisResult {
  decision: "selected" | "rejected";
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  suggestedRoles: string[];
}

export function JobHiring() {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<1|2|3|4>(1);
  const [fileDetails, setFileDetails] = useState<{name: string, size: string} | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 1, label: "Resume Upload" },
    { id: 2, label: "Parsing Data" },
    { id: 3, label: "AI Analysis" },
    { id: 4, label: "Final Report" }
  ];

  const features = [
    { icon: FileCheck, title: "ATS Friendly Check", desc: "Instantly verify if your resume structure aligns with standard ATS algorithmic parsing." },
    { icon: Target, title: "Skill Gap Analysis", desc: "Identify exactly what keywords and skills you are missing from the targeted Job Description." },
    { icon: TrendingUp, title: "Score Prediction", desc: "Get an empirical match percentage out of 100 based on complex machine learning criteria." }
  ];

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file format. Please upload PDF, DOCX, or JPG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
    
    // Simulate upload progress
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFileDetails({ name: file.name, size: (file.size / (1024*1024)).toFixed(2) + " MB" });
          toast.success("Resume uploaded successfully");
          return 100;
        }
        return prev + 15;
      });
    }, 100);
  };

  const simulateSample = () => {
    setFileDetails({ name: "Alex_Johnson_SoftwareEngineer_Resume.pdf", size: "1.2 MB" });
    setJobDescription("We are looking for a Software Engineer with deep expertise in React, TypeScript, and Node.js. The ideal candidate will have 3+ years of experience building scalable web applications. Familiarity with Docker, Kubernetes, and AWS is a huge plus. Must be passionate about problem-solving, UI/UX implementation, and collaborative teamwork.");
    toast.info("Sample Resume & Job Description loaded!");
  };

  const startAnalysis = () => {
    if (!fileDetails) return toast.error("Please upload a resume first.");
    if (!jobDescription.trim()) return toast.error("Please paste the Target Job Description.");

    setCurrentStep(2); // Parsing
    
    setTimeout(() => {
      setCurrentStep(3); // Analysis
      
      let prog = 0;
      const progInterval = setInterval(() => {
        prog += 5;
        setAnalysisProgress(prog);
        if (prog >= 100) {
           clearInterval(progInterval);
           finishAnalysis();
        }
      }, 100);
    }, 2000); // 2 sec parse time
  };

  const finishAnalysis = () => {
    const isSelected = Math.random() > 0.3;
    const score = Math.floor(Math.random() * 20) + (isSelected ? 75 : 50);
    
    setResult(
      isSelected ? {
        decision: "selected",
        score,
        matchedSkills: ["React", "TypeScript", "Node.js", "Problem Solving", "UI/UX"],
        missingSkills: ["AWS", "Kubernetes", "Docker"],
        recommendations: [
          "Strong technical match with core requirements (React, Node.js).",
          "Demonstrated problem-solving ability in resume achievements aligns with JD.",
          "Good structural formatting. ATS parse success rate: 94%."
        ],
        suggestedRoles: []
      } : {
        decision: "rejected",
        score,
        matchedSkills: ["React", "HTML/CSS", "JavaScript"],
        missingSkills: ["TypeScript", "Node.js", "AWS", "Docker", "Kubernetes"],
        recommendations: [
          "Significant skill gap detected regarding Backend (Node.js) and Cloud architecture.",
          "Missing explicit mention of 'TypeScript' which is a core JD keyword.",
          "Consider expanding on your problem-solving metrics."
        ],
        suggestedRoles: ["Frontend Developer", "Junior UI Developer", "React Developer Intern"]
      }
    );
    setCurrentStep(4);
    toast.success("Analysis complete!");
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setFileDetails(null);
    setJobDescription("");
    setUploadProgress(0);
    setAnalysisProgress(0);
    setResult(null);
  };

  // Pie chart data structure for score
  const scoreData = result ? [
    { name: 'Match', value: result.score, color: result.decision === 'selected' ? '#10b981' : '#f59e0b' },
    { name: 'Gap', value: 100 - result.score, color: '#f3f4f6' }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-gray-600 hover:text-gray-900 border border-gray-200 bg-white shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-sm">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Job Match Analyzer</h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Evaluate resumes against descriptions using deep AI.</p>
              </div>
            </div>
          </div>
          
          {/* Progress Stepper */}
          <div className="mt-10 mb-2">
            <div className="flex items-center justify-between relative">
               <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
               <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500" style={{width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`}}></div>
               
               {steps.map((step) => {
                 const isCompleted = currentStep > step.id;
                 const isCurrent = currentStep === step.id;
                 return (
                   <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                     <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm border-2 ${
                        isCompleted ? "bg-blue-600 border-blue-600 text-white" : 
                        isCurrent ? "bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100" : 
                        "bg-white border-gray-300 text-gray-400"
                     }`}>
                        {isCompleted ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : step.id}
                     </div>
                     <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block ${isCurrent ? "text-blue-700" : isCompleted ? "text-gray-800" : "text-gray-400"}`}>
                        {step.label}
                     </span>
                   </div>
                 )
               })}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 pt-6 pb-8 max-w-5xl flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: UPLOAD & JD */}
          {currentStep === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-10">
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Col: Upload Zone (Col Span 3) */}
                <div className="lg:col-span-3 space-y-6">
                  <Card className="border-0 shadow-lg rounded-3xl overflow-hidden ring-1 ring-gray-100 bg-white min-h-[400px] flex flex-col">
                    <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent border-b border-gray-100 pb-5">
                      <CardTitle className="text-xl flex items-center gap-2"><Upload className="h-6 w-6 text-blue-600"/> Resume Document</CardTitle>
                      <CardDescription className="text-sm font-medium">Drag your CV or select it directly for deep AI analysis.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex-1 flex flex-col justify-center relative">
                      {/* background pattern */}
                      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                      
                      {!fileDetails ? (
                        <div 
                          className="relative z-10 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/80 transition-all cursor-pointer group flex-1"
                          onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                        >
                          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.jpg,.jpeg" onChange={handleFileSelect} />
                          <div className="p-5 bg-white rounded-[2rem] w-fit mx-auto mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                             <FileText className="h-10 w-10 text-blue-500" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">Drag & Drop Resume Here</h3>
                          <p className="text-sm font-medium text-gray-500 mb-6">or click to browse local files</p>
                          <div className="flex items-center justify-center gap-3">
                             <Badge variant="outline" className="bg-white px-3 py-1 text-xs border-gray-200 text-gray-600 hidden sm:flex">.PDF</Badge>
                             <Badge variant="outline" className="bg-white px-3 py-1 text-xs border-gray-200 text-gray-600 hidden sm:flex">.DOCX</Badge>
                             <Badge variant="outline" className="bg-white px-3 py-1 text-xs border-gray-200 text-gray-600 hidden sm:flex">.JPG</Badge>
                             <span className="text-xs font-bold text-gray-400 ml-2">5MB MAX</span>
                          </div>
                          
                          {uploadProgress > 0 && uploadProgress < 100 && (
                             <div className="w-full max-w-xs mx-auto mt-8">
                                <Progress value={uploadProgress} className="h-2" />
                                <p className="text-xs text-blue-600 mt-2 font-bold animate-pulse">Uploading securely... {uploadProgress}%</p>
                             </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative z-10 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm overflow-hidden group">
                           <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:scale-110 transition-transform"><FileCode2 className="h-32 w-32 text-emerald-600" /></div>
                           <div className="relative z-20 flex items-center justify-between">
                             <div className="flex items-center gap-5">
                                <div className="p-4 bg-white shadow-sm text-emerald-600 rounded-xl"><FileCheck className="h-8 w-8"/></div>
                                <div>
                                   <p className="text-lg font-bold text-gray-900 truncate max-w-[220px]" title={fileDetails.name}>{fileDetails.name}</p>
                                   <p className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5"/> {fileDetails.size} • Ready for Analysis</p>
                                </div>
                             </div>
                             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white text-red-500 hover:text-red-600 hover:bg-red-50 shadow-sm" onClick={() => setFileDetails(null)}><Trash2 className="h-5 w-5"/></Button>
                           </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Col: JD Zone (Col Span 2) */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-0 shadow-lg rounded-3xl overflow-hidden ring-1 ring-gray-100 h-full flex flex-col bg-white/60 backdrop-blur-md">
                    <CardHeader className="bg-indigo-50/30 border-b border-indigo-50/50 pb-5">
                      <CardTitle className="text-xl flex items-center gap-2"><Target className="h-6 w-6 text-indigo-600"/> Target Job Description</CardTitle>
                      <CardDescription className="text-sm font-medium">Paste the JD text to allow algorithmic gap-matching.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <Textarea 
                         placeholder="Paste Job Description here... E.g. 'Looking for a Senior Frontend Developer with 5+ years of React and Node.js experience...'"
                         className="flex-1 min-h-[260px] resize-none border-indigo-100 bg-white/80 focus-visible:ring-indigo-500 rounded-2xl p-5 text-sm leading-relaxed shadow-inner"
                         value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

               {/* Action Bar */}
               <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 border-t border-gray-200">
                  <Button variant="outline" className="h-12 px-6 rounded-xl font-bold bg-white border-blue-200 text-blue-700 hover:bg-blue-50 w-full sm:w-auto transition-colors" onClick={simulateSample}>
                     <Lightbulb className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />
                     Try with Sample Resume
                  </Button>
                  <Button className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg w-full sm:w-auto text-base group" onClick={startAnalysis}>
                     Analyze Resume
                     <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>

               {/* Features Section */}
               <div className="pt-10">
                  <div className="text-center mb-8">
                     <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mb-3 px-3 py-1 font-bold tracking-widest text-[10px] uppercase">Why Choose Us</Badge>
                     <h3 className="text-2xl font-bold text-gray-900">Advanced AI Matching Modules</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {features.map((feat, i) => (
                        <Card key={i} className="border-0 shadow-sm ring-1 ring-gray-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:scale-[1.02] cursor-default rounded-2xl group">
                           <CardContent className="p-6 text-center">
                              <div className="h-14 w-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:from-blue-600 group-hover:to-indigo-600 transition-colors">
                                 <feat.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                              </div>
                              <h4 className="font-bold text-gray-900 mb-2">{feat.title}</h4>
                              <p className="text-sm text-gray-500 leading-relaxed font-medium">{feat.desc}</p>
                           </CardContent>
                        </Card>
                     ))}
                  </div>
               </div>

            </motion.div>
          )}

          {/* STEP 2 & 3: LOADING STATES */}
          {(currentStep === 2 || currentStep === 3) && (
            <motion.div key="step-23" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 px-4 md:py-28 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl shadow-xl border border-indigo-900 overflow-hidden relative">
               
               {/* Animated Background Grids */}
               <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
               
               <div className="relative mb-10 z-10 w-full max-w-lg flex flex-col items-center">
                  {currentStep === 2 ? (
                     <div className="relative flex items-center justify-center">
                        <div className="absolute h-32 w-32 rounded-full border border-indigo-500/30 animate-ping" />
                        <div className="h-28 w-28 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin bg-slate-900/50 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                           <ScanLine className="h-10 w-10 text-indigo-400" />
                        </div>
                     </div>
                  ) : (
                     <div className="relative flex items-center justify-center">
                        <div className="absolute h-32 w-32 rounded-full border border-blue-500/30 animate-pulse" />
                        <div className="h-28 w-28 rounded-full border-2 border-blue-500/20 border-t-blue-400 animate-spin bg-slate-900/50 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] duration-700">
                           <BrainCircuit className="h-10 w-10 text-blue-400" />
                        </div>
                     </div>
                  )}
               </div>

               <div className="z-10 text-center space-y-4">
                  <h3 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-3">
                     {currentStep === 2 ? "Extracting Entities" : "Neural Pattern Matching"}
                     <span className="flex space-x-1">
                        <span className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-white rounded-full animate-bounce"></span>
                     </span>
                  </h3>
                  
                  <div className="h-12 flex items-center justify-center">
                     <p className="text-indigo-200/80 font-medium text-center max-w-sm text-sm">
                        {currentStep === 2 ? "> Parsing document semantics & structuring history..." : "> Operating deep comparison algorithms against targeted JD..."}
                     </p>
                  </div>
               </div>

               {currentStep === 3 && (
                  <div className="w-full max-w-md mt-8 z-10 relative">
                     <div className="flex justify-between text-xs font-bold text-blue-300 mb-2 tracking-widest uppercase">
                        <span>Analysis Processing</span>
                        <span>{analysisProgress}%</span>
                     </div>
                     <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden ring-1 ring-white/10 shadow-inner">
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${analysisProgress}%` }} />
                     </div>
                  </div>
               )}
            </motion.div>
          )}

          {/* STEP 4: RESULTS */}
          {currentStep === 4 && result && (
            <motion.div key="step-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              <AlertBanner decision={result.decision} score={result.score} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Match Score Card */}
                 <Card className="shadow-md rounded-2xl overflow-hidden border-0 ring-1 ring-gray-100 lg:col-span-1">
                    <CardHeader className="bg-gray-50/50 border-b pb-4 text-center">
                       <CardTitle className="text-lg">Match Percentage</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center justify-center">
                       <div className="h-[200px] w-[200px] relative">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie data={scoreData} innerRadius={70} outerRadius={90} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                                   {scoreData.map((e,i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                             </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className={`text-4xl font-black ${result.decision === 'selected'?'text-emerald-500':'text-amber-500'}`}>{result.score}%</span>
                             <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1">AI Match</span>
                          </div>
                       </div>
                       <p className="text-sm font-semibold text-gray-500 text-center mt-4">Calculated via empirical JD keyword alignment & density checks.</p>
                    </CardContent>
                 </Card>

                 {/* Keyword Gap Matrix */}
                 <Card className="shadow-md rounded-2xl border-0 ring-1 ring-gray-100 lg:col-span-2 flex flex-col">
                    <CardHeader className="bg-gray-50/50 border-b pb-4">
                       <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-indigo-600"/> Keyword Gap Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                          <div>
                             <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2"><CheckCircle className="h-4 w-4"/> Matched Skills</h4>
                             <div className="flex flex-wrap gap-2">
                                {result.matchedSkills.map((sk,i) => (
                                   <Badge key={i} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 font-semibold">{sk}</Badge>
                                ))}
                             </div>
                          </div>
                          <div>
                             <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 mb-3 flex items-center gap-2"><XCircle className="h-4 w-4"/> Missing Skills (Gaps)</h4>
                             <div className="flex flex-wrap gap-2">
                                {result.missingSkills.map((sk,i) => (
                                   <Badge key={i} variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 px-3 py-1 font-semibold">{sk}</Badge>
                                ))}
                             </div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              </div>

              {/* Actionable Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="shadow-lg rounded-3xl border-0 ring-1 ring-gray-100 bg-gradient-to-b from-white to-gray-50 flex flex-col">
                    <CardHeader className="bg-transparent border-b border-gray-100/80 pb-5">
                       <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500"/> Actionable Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                       <ul className="space-y-4">
                          {result.recommendations.map((rec, i) => (
                             <li key={i} className="flex gap-4 items-start p-4 bg-white shadow-sm hover:shadow-md rounded-2xl transition-all duration-200 ring-1 ring-gray-100">
                                <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5"><Terminal className="h-4 w-4 text-indigo-600" /></div>
                                <span className="text-sm font-semibold text-gray-700 leading-relaxed pt-0.5">{rec}</span>
                             </li>
                          ))}
                       </ul>
                    </CardContent>
                 </Card>

                 {result.decision === 'rejected' && result.suggestedRoles.length > 0 ? (
                    <Card className="shadow-lg rounded-3xl border-0 ring-1 ring-purple-100 bg-gradient-to-br from-purple-50 to-fuchsia-50">
                       <CardContent className="p-8">
                          <div className="mb-6">
                             <div className="h-12 w-12 rounded-2xl bg-purple-200/50 flex items-center justify-center mb-4">
                                <Briefcase className="h-6 w-6 text-purple-700"/>
                             </div>
                             <h4 className="text-xl font-bold text-purple-900 mb-2">Realigned Job Suggestions</h4>
                             <p className="text-sm text-purple-700/80 font-medium">Based on extracted competencies, these alternate roles maintain an over 80% match probability.</p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                             {result.suggestedRoles.map((role, i) => (
                                <Badge key={i} variant="secondary" className="bg-white hover:bg-white text-purple-800 px-5 py-2.5 text-sm shadow-sm font-bold ring-1 ring-purple-200/50 rounded-xl">{role}</Badge>
                             ))}
                          </div>
                       </CardContent>
                    </Card>
                 ) : (
                    <Card className="shadow-lg rounded-3xl border-0 ring-1 ring-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                       <CardContent className="p-8 text-center">
                          <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                             <CheckCircle className="h-8 w-8 text-emerald-500" />
                          </div>
                          <h4 className="text-xl font-bold text-emerald-900 mb-2">Ready to Apply</h4>
                          <p className="text-sm text-emerald-700/80 font-medium max-w-sm mx-auto">Your resume is highly optimized. Use this report's findings as talking points during your interview.</p>
                       </CardContent>
                    </Card>
                 )}
              </div>

              <div className="flex justify-center pt-8 pb-4">
                 <Button className="h-14 rounded-full px-10 bg-gray-900 hover:bg-black text-white text-lg font-bold tracking-wide shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1" onClick={resetFlow}>
                    Start New Analysis
                 </Button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
}

function AlertBanner({ decision, score } : { decision: string, score: number }) {
  const isOk = decision === 'selected';
  return (
    <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-6 justify-between shadow-sm ${isOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
       <div className="flex items-center gap-4">
          <div className={`p-4 rounded-full ${isOk ? 'bg-emerald-100' : 'bg-amber-100'}`}>
             {isOk ? <CheckCircle className="h-8 w-8 text-emerald-600" /> : <XCircle className="h-8 w-8 text-amber-600" />}
          </div>
          <div>
             <h2 className={`text-2xl font-black ${isOk ? 'text-emerald-900' : 'text-amber-900'}`}>{isOk ? "Strong Match Profile! ✅" : "Skill Gaps Detected ⚠️"}</h2>
             <p className={`font-semibold mt-1 ${isOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isOk ? "Your resume structure aligns exceptionally well with the target role." : "Your profile requires adjustments before submitting to ATS systems."}
             </p>
          </div>
       </div>
    </div>
  )
}
