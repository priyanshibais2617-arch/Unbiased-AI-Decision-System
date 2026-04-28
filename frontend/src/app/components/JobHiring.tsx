import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { JobUserProfilePanel } from "./JobUserProfilePanel";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, ArrowLeft, ArrowRight, Loader2, CheckCircle, XCircle, Lightbulb, Briefcase, TrendingUp, Target, FileCheck, FileCode2, Trash2, BrainCircuit, ScanLine, Sparkles, Terminal } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { apiFetch } from "../api";

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
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

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
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file format. Please upload PDF, DOCX, or JPG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
    
    setResumeText("");
    setResumeFile(file);
    if (file.type === "text/plain") {
      file.text()
        .then((text) => setResumeText(text))
        .catch(() => toast.error("Could not read resume text. Please paste it manually."));
    }

    // Simulate upload progress
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFileDetails({ name: file.name, size: (file.size / (1024*1024)).toFixed(2) + " MB" });
          toast.success(file.type === "text/plain" ? "Resume uploaded and parsed" : "Resume uploaded. Paste resume text below for accurate scoring.");
          return 100;
        }
        return prev + 15;
      });
    }, 100);
  };

  const simulateSample = () => {
    setFileDetails({ name: "Alex_Johnson_SoftwareEngineer_Resume.pdf", size: "1.2 MB" });
    setResumeText("Alex Johnson Software Engineer. Skills: React, TypeScript, Node.js, JavaScript, UI/UX implementation, REST API, Git, problem solving, collaborative teamwork. Built scalable web applications for 3+ years.");
    setJobDescription("We are looking for a Software Engineer with deep expertise in React, TypeScript, and Node.js. The ideal candidate will have 3+ years of experience building scalable web applications. Familiarity with Docker, Kubernetes, and AWS is a huge plus. Must be passionate about problem-solving, UI/UX implementation, and collaborative teamwork.");
    toast.info("Sample Resume & Job Description loaded!");
  };

  const startAnalysis = async () => {
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
           runBackendAnalysis();
        }
      }, 100);
    }, 2000); // 2 sec parse time
  };

  const runBackendAnalysis = async () => {
    try {
      const formData = new FormData();
      formData.append("service_type", "job");
      formData.append("payload", JSON.stringify({ resume_text: resumeText, job_description: jobDescription }));
      if (resumeFile) {
        formData.append("files", resumeFile);
        formData.append("doc_types", JSON.stringify(["Resume"]));
      }
      const response = await apiFetch("/services/analyze", {
        method: "POST",
        body: formData,
      });
      setResult(response.data as AnalysisResult);
      setCurrentStep(4);
      toast.success("AI resume analysis complete.");
    } catch (error) {
      setCurrentStep(1);
      toast.error(error instanceof Error ? error.message : "Resume analysis failed.");
    }
  };

  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ");

  const skillPatterns: Array<{ label: string; aliases: string[] }> = [
    { label: "React", aliases: ["react", "react.js", "reactjs"] },
    { label: "TypeScript", aliases: ["typescript", "type script"] },
    { label: "Node.js", aliases: ["node.js", "nodejs", "node js"] },
    { label: "JavaScript", aliases: ["javascript", "java script", "js"] },
    { label: "HTML/CSS", aliases: ["html", "css", "tailwind"] },
    { label: "Python", aliases: ["python"] },
    { label: "Java", aliases: ["java"] },
    { label: "SQL", aliases: ["sql", "mysql", "postgresql"] },
    { label: "MongoDB", aliases: ["mongodb", "mongo db"] },
    { label: "AWS", aliases: ["aws", "amazon web services"] },
    { label: "Docker", aliases: ["docker"] },
    { label: "Kubernetes", aliases: ["kubernetes", "k8s"] },
    { label: "FastAPI", aliases: ["fastapi", "fast api"] },
    { label: "Machine Learning", aliases: ["machine learning", "ml", "ai"] },
    { label: "Data Analysis", aliases: ["data analysis", "analytics", "pandas"] },
    { label: "REST API", aliases: ["rest api", "api"] },
    { label: "Git", aliases: ["git", "github"] },
    { label: "UI/UX", aliases: ["ui/ux", "ui ux", "user interface", "user experience"] },
    { label: "Problem Solving", aliases: ["problem solving", "troubleshooting"] },
    { label: "Communication", aliases: ["communication"] },
    { label: "Teamwork", aliases: ["teamwork", "collaboration", "collaborative"] },
  ];

  const extractSkills = (text: string) => {
    const lower = normalize(text);
    return skillPatterns
      .filter((skill) => skill.aliases.some((alias) => lower.includes(normalize(alias).trim())))
      .map((skill) => skill.label);
  };

  const finishAnalysis = () => {
    const requiredSkills = extractSkills(jobDescription);
    const resumeSkills = extractSkills(resumeText);
    const matchedSkills = requiredSkills.filter((skill) => resumeSkills.includes(skill));
    const missingSkills = requiredSkills.filter((skill) => !resumeSkills.includes(skill));
    const readableResume = resumeText.trim().length >= 30;
    const matchRatio = requiredSkills.length ? matchedSkills.length / requiredSkills.length : 0;
    const textCoverage = readableResume ? Math.min(15, Math.floor(resumeText.trim().length / 80)) : 0;
    const score = readableResume
      ? Math.max(8, Math.min(96, Math.round(matchRatio * 85 + textCoverage)))
      : Math.min(22, requiredSkills.length * 2);
    const isSelected = readableResume && score >= 65 && matchedSkills.length >= Math.max(2, Math.ceil(requiredSkills.length * 0.5));

    setResult({
      decision: isSelected ? "selected" : "rejected",
      score,
      matchedSkills: matchedSkills.length ? matchedSkills : ["No clear JD skill match found"],
      missingSkills: missingSkills.length ? missingSkills : ["No major gaps detected"],
      recommendations: isSelected ? [
        `Matched ${matchedSkills.length} of ${requiredSkills.length || "the"} key JD skills.`,
        "Resume text contains enough relevant keywords for the target role.",
        "Add measurable achievements to improve the score further."
      ] : [
        readableResume
          ? `Only ${matchedSkills.length} of ${requiredSkills.length || "the"} key JD skills were found in the resume text.`
          : "Resume content could not be read from this file. Paste resume text for accurate analysis.",
        missingSkills.length ? `Missing key skills: ${missingSkills.slice(0, 5).join(", ")}.` : "Add more role-specific keywords from the JD.",
        "Update the resume with relevant skills, projects, and measurable experience before applying."
      ],
      suggestedRoles: isSelected ? [] : ["Entry Level Frontend Developer", "Junior Developer", "Internship / Trainee Role"]
    });
    setCurrentStep(4);
    toast.success("Analysis complete!");
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setFileDetails(null);
    setResumeFile(null);
    setResumeText("");
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
    <div className="min-h-screen bg-white pb-16 flex flex-col relative">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate(-1)} 
                      className="h-10 w-10 p-0 rounded-full text-slate-500 hover:text-slate-900 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all duration-200"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="font-semibold text-xs rounded-xl px-3 py-1.5 shadow-md">
                    Go Back
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex items-center gap-3 ml-2">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg shadow-sm shadow-blue-500/20">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Job Match Analyzer</h1>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">Evaluate resumes against descriptions using deep AI.</p>
                </div>
              </div>
            </div>

            {/* Profile trigger button */}
            <Button
              onClick={() => setIsProfileOpen(true)}
              variant="outline"
              className="h-10 w-10 p-0 rounded-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm flex items-center justify-center font-bold text-sm shrink-0"
            >
              VK
            </Button>
          </div>
          
          {/* Progress Stepper */}
          <div className="mt-10 mb-2">
            <div className="flex items-center justify-between relative">
               <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
               <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full z-0 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`}}></div>
               
               {steps.map((step) => {
                 const isCompleted = currentStep > step.id;
                 const isCurrent = currentStep === step.id;
                 return (
                   <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                     <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm border-2 ${
                        isCompleted ? "bg-gradient-to-r from-blue-600 to-blue-500 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]" : 
                        isCurrent ? "bg-white border-blue-500 text-blue-600 ring-4 ring-blue-100 shadow-[0_0_10px_rgba(96,165,250,0.3)]" : 
                        "bg-white border-slate-300 text-slate-400"
                     }`}>
                        {isCompleted ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : step.id}
                     </div>
                     <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block ${isCurrent ? "text-blue-600" : isCompleted ? "text-slate-900" : "text-slate-400"}`}>
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
                  <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden ring-1 ring-blue-100 bg-white min-h-[400px] flex flex-col relative z-10">
                    <CardHeader className="bg-gradient-to-r from-blue-50/80 to-white border-b border-blue-50 pb-5">
                      <CardTitle className="text-xl flex items-center gap-2 text-slate-900"><Upload className="h-6 w-6 text-blue-500"/> Resume Document</CardTitle>
                      <CardDescription className="text-sm font-medium text-slate-500">Drag your CV or select it directly for deep AI analysis.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex-1 flex flex-col justify-center relative">
                      {/* background pattern */}
                      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                      
                      {!fileDetails ? (
                        <div 
                          className="relative z-10 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/80 transition-all cursor-pointer group flex-1"
                          onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                        >
                          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.jpg,.jpeg,.txt" onChange={handleFileSelect} />
                          <div className="p-5 bg-white rounded-[2rem] w-fit mx-auto mb-6 shadow-[0_4px_20px_rgba(59,130,246,0.15)] group-hover:scale-110 group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)] transition-all duration-300">
                             <FileText className="h-10 w-10 text-blue-500" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Drag & Drop Resume Here</h3>
                          <p className="text-sm font-medium text-slate-500 mb-6">or click to browse local files</p>
                          <div className="flex items-center justify-center gap-3">
                             <Badge variant="outline" className="bg-white px-3 py-1 text-xs border-blue-200 text-slate-600 hidden sm:flex">.PDF</Badge>
                             <Badge variant="outline" className="bg-white px-3 py-1 text-xs border-blue-200 text-slate-600 hidden sm:flex">.DOCX</Badge>
                             <Badge variant="outline" className="bg-white px-3 py-1 text-xs border-blue-200 text-slate-600 hidden sm:flex">.JPG</Badge>
                             <Badge variant="outline" className="bg-white px-3 py-1 text-xs border-blue-200 text-slate-600 hidden sm:flex">.TXT</Badge>
                             <span className="text-xs font-bold text-slate-400 ml-2">5MB MAX</span>
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
                             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white text-red-500 hover:text-red-600 hover:bg-red-50 shadow-sm" onClick={() => { setFileDetails(null); setResumeText(""); }}><Trash2 className="h-5 w-5"/></Button>
                           </div>
                        </div>
                      )}
                      {fileDetails && (
                        <div className="relative z-10 mt-4">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Resume Text For Accurate AI Match</label>
                          <Textarea
                            placeholder="Paste resume text here. If this is unrelated/wrong resume, the score will drop based on missing JD skills."
                            className="min-h-[120px] resize-none border-blue-100 bg-white focus-visible:ring-blue-500 rounded-2xl p-4 text-sm leading-relaxed shadow-inner text-slate-700"
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Col: JD Zone (Col Span 2) */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden ring-1 ring-blue-100 h-full flex flex-col bg-white/80 backdrop-blur-md relative z-10">
                    <CardHeader className="bg-blue-50/30 border-b border-blue-50 pb-5">
                      <CardTitle className="text-xl flex items-center gap-2 text-slate-900"><Target className="h-6 w-6 text-blue-500"/> Target Job Description</CardTitle>
                      <CardDescription className="text-sm font-medium text-slate-500">Paste the JD text to allow algorithmic gap-matching.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <Textarea 
                         placeholder="Paste Job Description here... E.g. 'Looking for a Senior Frontend Developer with 5+ years of React and Node.js experience...'"
                         className="flex-1 min-h-[260px] resize-none border-blue-100 bg-white/80 focus-visible:ring-blue-500 rounded-2xl p-5 text-sm leading-relaxed shadow-inner text-slate-700"
                         value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

               {/* Action Bar */}
               <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 border-t border-blue-100 relative z-10">
                  <Button variant="outline" className="h-12 px-6 rounded-xl font-bold bg-white border-blue-200 text-blue-600 hover:bg-blue-50 w-full sm:w-auto transition-colors" onClick={simulateSample}>
                     <Lightbulb className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />
                     Try with Sample Resume
                  </Button>
                  <Button className="h-12 px-8 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_4px_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] w-full sm:w-auto text-base group transition-all" onClick={startAnalysis}>
                     Analyze Resume
                     <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>

               {/* Features Section */}
               <div className="pt-10">
                  <div className="text-center mb-8">
                     <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 mb-3 px-3 py-1 font-bold tracking-widest text-[10px] uppercase shadow-sm">Why Choose Us</Badge>
                     <h3 className="text-2xl font-bold text-slate-900">Advanced AI Matching Modules</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                     {features.map((feat, i) => (
                        <Card key={i} className="border-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] ring-1 ring-blue-50 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_40px_rgba(59,130,246,0.12)] hover:ring-blue-200 hover:scale-[1.02] cursor-default rounded-2xl group">
                           <CardContent className="p-6 text-center">
                              <div className="h-14 w-14 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:from-blue-600 group-hover:to-blue-500 transition-colors shadow-sm group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                                 <feat.icon className="h-6 w-6 text-blue-500 group-hover:text-white transition-colors" />
                              </div>
                              <h4 className="font-bold text-slate-900 mb-2">{feat.title}</h4>
                              <p className="text-sm text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
                           </CardContent>
                        </Card>
                     ))}
                  </div>
               </div>

            </motion.div>
          )}

          {/* STEP 2 & 3: LOADING STATES */}
          {(currentStep === 2 || currentStep === 3) && (
            <motion.div key="step-23" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 px-4 md:py-28 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-blue-100 relative z-10">
               
               <div className="relative mb-10 z-10 w-full max-w-lg flex flex-col items-center">
                  {currentStep === 2 ? (
                     <div className="relative flex items-center justify-center h-28 w-28">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-50 border-t-blue-500 animate-spin shadow-[0_0_15px_rgba(59,130,246,0.2)]"></div>
                        <ScanLine className="h-10 w-10 text-blue-600 relative z-10" />
                     </div>
                  ) : (
                     <div className="relative flex items-center justify-center h-28 w-28">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-50 border-t-blue-500 animate-spin duration-700 shadow-[0_0_15px_rgba(59,130,246,0.2)]"></div>
                        <BrainCircuit className="h-10 w-10 text-blue-600 relative z-10" />
                     </div>
                  )}
               </div>

               <div className="z-10 text-center space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-3">
                     {currentStep === 2 ? "Extracting Entities" : "Neural Pattern Matching"}
                     <span className="flex space-x-1">
                        <span className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></span>
                     </span>
                  </h3>
                  
                  <div className="flex items-center justify-center">
                     <p className="text-slate-500 font-medium text-center max-w-sm text-sm">
                        {currentStep === 2 ? "Parsing document semantics & structuring history..." : "Operating deep comparison algorithms against targeted JD..."}
                     </p>
                  </div>
               </div>

               {currentStep === 3 && (
                  <div className="w-full max-w-md mt-8 z-10 relative">
                     <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 tracking-widest uppercase">
                        <span>Analysis Processing</span>
                        <span>{analysisProgress}%</span>
                     </div>
                     <div className="w-full bg-blue-50/50 rounded-full h-2.5 overflow-hidden shadow-inner ring-1 ring-blue-100/50">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${analysisProgress}%` }} />
                     </div>
                  </div>
               )}
            </motion.div>
          )}

          {/* STEP 4: RESULTS */}
          {currentStep === 4 && result && (
            <motion.div key="step-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
              
              <AlertBanner decision={result.decision} score={result.score} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Match Score Card */}
                 <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden border-0 ring-1 ring-blue-100 lg:col-span-1 bg-white">
                    <CardHeader className="bg-blue-50/30 border-b border-blue-50 pb-4 text-center">
                       <CardTitle className="text-lg text-slate-900">Match Percentage</CardTitle>
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
                             <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">AI Match</span>
                          </div>
                       </div>
                       <p className="text-sm font-semibold text-slate-500 text-center mt-4">Calculated via empirical JD keyword alignment & density checks.</p>
                    </CardContent>
                 </Card>

                 {/* Keyword Gap Matrix */}
                 <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border-0 ring-1 ring-blue-100 lg:col-span-2 flex flex-col bg-white">
                    <CardHeader className="bg-blue-50/30 border-b border-blue-50 pb-4">
                       <CardTitle className="text-lg flex items-center gap-2 text-slate-900"><Target className="h-5 w-5 text-blue-500"/> Keyword Gap Analysis</CardTitle>
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
                 <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl border-0 ring-1 ring-blue-100 bg-white flex flex-col">
                    <CardHeader className="bg-transparent border-b border-blue-50 pb-5">
                       <CardTitle className="text-lg flex items-center gap-2 text-slate-900"><Sparkles className="h-5 w-5 text-blue-500"/> Actionable Insights</CardTitle>
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
                 <Button className="h-14 rounded-full px-10 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold tracking-wide shadow-[0_10px_20px_rgba(15,23,42,0.2)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.3)] transition-all hover:-translate-y-1" onClick={resetFlow}>
                    Start New Analysis
                 </Button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <JobUserProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
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
             <h2 className="text-2xl font-black text-slate-900">{isOk ? "Strong Match Profile! ✅" : "Skill Gaps Detected ⚠️"}</h2>
             <p className="font-semibold mt-1 text-slate-600">
                {isOk ? "Your resume structure aligns exceptionally well with the target role." : "Your profile requires adjustments before submitting to ATS systems."}
             </p>
          </div>
       </div>
    </div>
  )
}
