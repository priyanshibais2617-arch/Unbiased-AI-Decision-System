import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Mic, Loader2, CheckCircle, XCircle, FileText, ArrowLeft, GraduationCap, PlayCircle, BookOpen, Compass, Search, Award, TrendingUp, HelpCircle, Trophy, Target, Star, Volume2, Link as LinkIcon, Send, AlignLeft, RefreshCw, Download, Share2, MessageCircle, Moon, Sun, Clock, Zap, FileSearch, Check, ShieldAlert, History, AlertCircle, CircleDot } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Legend } from "recharts";
import { toast } from "sonner";
import { StudentProfilePanel } from "./StudentProfilePanel";
import { useUser } from "./UserContext";
import { apiFetch } from "../api";

interface GradeResult {
  score: number;
  content: number;
  structure: number;
  grammar: number;
  explanation: string;
  feedback: { text: string; priority: "high" | "medium" | "low" }[];
}

export function EducationSystem() {
  const navigate = useNavigate();
  const { language } = useUser();
    const [activeTab, setActiveTab] = useState("eval");

  // Core Eval State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evalHistory, setEvalHistory] = useState<GradeResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveGrade, setLiveGrade] = useState({ score: 0, msgs: [] as string[] });
  
  // Feedback Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [isStartingNew, setIsStartingNew] = useState(false);

  // Plagiarism State
  const [plagText, setPlagText] = useState("The mitochondria is the powerhouse of the cell. According to Wikipedia, it generates most of the cell's supply of ATP. This energy is used for various cellular processes.");
  const [isCheckingPlag, setIsCheckingPlag] = useState(false);
  const [plagResult, setPlagResult] = useState<{ similarity: number } | null>(null);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<{role:'bot'|'user', text:string}[]>([
    {role: 'bot', text: 'Hi! I am your AI Tutor. Wondering why your answer was weak, or how to improve? Ask away!'}
  ]);
  const [chatInput, setChatInput] = useState("");

      
  // Simulate typing analysis
  useEffect(() => {
    if (answerText.length === 0) {
      setLiveGrade({ score: 0, msgs: [] });
      return;
    }
    const score = Math.min(100, Math.floor(answerText.length / 4) + 40);
    const msgs = [];
    if (answerText.length > 20 && !answerText.includes("example")) msgs.push("Suggestion: Use real-life examples");
    if (answerText.toLowerCase().includes("bad") || answerText.toLowerCase().includes("good")) msgs.push("Vocabulary: Try 'phenomenal' instead of 'good'");
    setLiveGrade({ score, msgs });
  }, [answerText]);

  const toggleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast.info("Listening (Simulated) ... speak now.");
      setTimeout(() => {
        setAnswerText(prev => prev + (prev ? " " : "") + "This is a detailed explanation of the concept utilizing structured arguments and references.");
        setIsListening(false);
        toast.success("Voice transcribed.");
      }, 3000);
    }
  };

  const handleDocumentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const body = new FormData();
      body.append("service_type", "education");
      body.append("payload", JSON.stringify({ answer_text: "" }));
      body.append("files", file);
      body.append("doc_types", JSON.stringify(["Assignment"]));
      const response = await apiFetch("/services/analyze", {
        method: "POST",
        body,
      });
      const extracted = response.data.extractedPreview || "";
      if (extracted) {
        setAnswerText(extracted);
        toast.success("Assignment document extracted and analyzed.");
      } else {
        toast.warning("Document uploaded, but readable text was limited. Please paste the answer text for best accuracy.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Document analysis failed.");
    }
  };

  const handleEvaluate = async () => {
    if (!answerText.trim()) return toast.error("Please enter an answer to evaluate.");
    setIsAnalyzing(true);
    try {
      const body = new FormData();
      body.append("service_type", "education");
      body.append("payload", JSON.stringify({ answer_text: answerText }));
      const response = await apiFetch("/services/analyze", {
        method: "POST",
        body,
      });
      const res = response.data as GradeResult;
      setEvalHistory(prev => [...prev, res]);
      setShowResult(true);
      setIsAnalyzing(false);
      toast.success("Evaluation Complete");
    } catch (error) {
      setIsAnalyzing(false);
      toast.error(error instanceof Error ? error.message : "Evaluation failed.");
    }
  };

  const handleStartNewAttempt = () => {
    setIsStartingNew(true);
    setTimeout(() => {
      setAnswerText("");
      setShowResult(false);
      setIsStartingNew(false);
      toast.success("New attempt started", { icon: <RefreshCw className="h-4 w-4 text-white"/> });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  const handleReattempt = () => {
    setShowResult(false);
    toast.success("Loaded previous answer for editing", { icon: <FileText className="h-4 w-4"/> });
    setTimeout(() => {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleReviewFeedback = (sub: any) => {
    setSelectedHistoryItem(sub);
    setIsLoadingFeedback(true);
    setTimeout(() => {
      setIsLoadingFeedback(false);
      setIsReviewModalOpen(true);
      toast.success("Feedback loaded successfully");
    }, 800);
  };

  const handleCheckPlag = async () => {
    if (!plagText.trim()) return;
    setIsCheckingPlag(true);
    try {
      const body = new FormData();
      body.append("service_type", "plagiarism");
      body.append("payload", JSON.stringify({ text: plagText }));
      const response = await apiFetch("/services/analyze", {
        method: "POST",
        body,
      });
      setPlagResult({ similarity: response.data.similarity });
      setIsCheckingPlag(false);
      toast[response.data.similarity >= 45 ? "error" : "success"](
        response.data.similarity >= 45 ? "Possible plagiarism detected." : "Similarity risk is acceptable."
      );
    } catch (error) {
      setIsCheckingPlag(false);
      toast.error(error instanceof Error ? error.message : "Plagiarism check failed.");
    }
  };

  const playTTS = (text: string) => {
    toast.info("Reading aloud...", { icon: <Volume2 className="h-4 w-4 animate-pulse text-indigo-500" /> });
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMsgs(prev => [...prev, { role: 'user', text: chatInput }]);
    const query = chatInput;
    setChatInput("");
    setTimeout(() => {
      let reply = "That's an insightful question. Focusing on structuring your paragraphs with clear topic sentences will greatly enhance readability.";
      if (query.toLowerCase().includes("weak")) reply = "Based on your recent eval, your answer is weak primarily in 'Structure'. Try using P.E.E.L (Point, Evidence, Explanation, Link) paragraphs.";
      setChatMsgs(prev => [...prev, { role: 'bot', text: reply }]);
    }, 1000);
  };

  // Gamification Data
  const radarData = [
    { subject: 'Math', A: 85, fullMark: 100 },
    { subject: 'Physics', A: 65, fullMark: 100 },
    { subject: 'English', A: 90, fullMark: 100 },
    { subject: 'Computer Sci', A: 95, fullMark: 100 },
    { subject: 'History', A: 70, fullMark: 100 },
  ];
  const historyData = [
    { day: 'Mon', score: 65 }, { day: 'Tue', score: 72 }, { day: 'Wed', score: 68 }, { day: 'Thu', score: 85 }, { day: 'Fri', score: 92 }
  ];

  const pastSubmissions = [
    ...(evalHistory.length > 0 ? [{ date: "Just now", score: evalHistory[evalHistory.length-1].score, topic: "Current Assignment", id: "EV-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0') }] : []),
    { date: "Yesterday, 4:30 PM", score: 68, topic: "Cellular Biology Basics", id: "EV-948" },
    { date: "Oct 12, 10:15 AM", score: 45, topic: "Cellular Biology Basics (Draft 1)", id: "EV-231" }
  ];
  return (
    <div className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-teal-100/50 border-b sticky top-0 z-20 shadow-sm relative">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-teal-50 hover:text-teal-600 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#14B8A6] to-[#10B981] rounded-lg shadow-lg shadow-teal-500/20">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">AI Education System</h1>
                  <p className="text-xs md:text-sm font-bold text-teal-600/70">Smart Tutor & Unbiased Evaluator</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              
              
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="h-10 w-10 ml-2 rounded-full border-2 border-teal-100 hover:border-teal-500 overflow-hidden flex items-center justify-center bg-teal-50 text-teal-600 font-bold transition-all hover:shadow-[0_0_15px_rgba(20,184,166,0.3)] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              >
                AR
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Custom Tabs List that scrolls linearly on mobile */}
          <div className="overflow-x-auto pb-4 hide-scrollbar relative z-10">
            <TabsList className="flex w-max min-w-full h-auto p-1.5 gap-2 rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100/50 shadow-sm">
              {[
                {id: 'eval', icon: FileSearch, label: 'Eval Workspace'},
                {id: 'plagiarism', icon: Search, label: 'Plagiarism Tracker'},
                {id: 'learning', icon: Compass, label: 'Learning Path'},
                {id: 'analytics', icon: TrendingUp, label: 'Visual Analytics'},
                {id: 'certificate', icon: Award, label: 'Certificates'},
              ].map(tab => (
                 <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#14B8A6] data-[state=active]:to-[#10B981] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-teal-50 data-[state=inactive]:hover:text-teal-600"
                 >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                 </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* 1. Core Evaluation Workflow */}
          <TabsContent value="eval" className="mt-4 outline-none">
            
            {!isAnalyzing && !showResult ? (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Editor Area */}
                <Card className="lg:col-span-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden border-teal-50 bg-white relative z-10">
                  <CardHeader className="border-b border-teal-50 bg-slate-50/50 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2 text-slate-900">Interactive AI Editor</CardTitle>
                        <CardDescription className="mt-1 text-slate-500">Write your answer or upload a handwritten assignment via OCR.</CardDescription>
                      </div>
                      <Badge variant="outline" className="font-black flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm">
                         <Zap className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500"/>
                         AI Assistant Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative">
                      <Textarea 
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer here..."
                        className={`min-h-[350px] border-0 rounded-none focus-visible:ring-0 text-base leading-relaxed p-6 resize-none bg-white`}
                      />
                      {/* Live Predictions Overlay */}
                      {answerText.length > 0 && (
                        <div className="absolute right-4 top-4 flex flex-col gap-2 items-end pointer-events-none">
                          <div className={`px-3 py-1.5 rounded-lg shadow-sm border backdrop-blur-md flex items-center gap-2 transition-all ${liveGrade.score > 75 ? 'bg-teal-500/10 border-teal-500/20 text-teal-600' : 'bg-blue-500/10 border-blue-500/20 text-blue-600'}`}>
                             <span className="text-[11px] font-bold uppercase tracking-wider">Est. Score</span>
                             <span className="font-black">{liveGrade.score}%</span>
                          </div>
                          {liveGrade.msgs.map((msg, i) => (
                             <AnimatePresence key={i}>
                               <motion.div initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, scale:0.95}} className="px-3 py-2 rounded-lg shadow-sm border max-w-[200px] text-xs font-medium leading-tight backdrop-blur-md bg-teal-50/90 border-teal-100 text-teal-800">
                                 {msg}
                               </motion.div>
                             </AnimatePresence>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 flex flex-wrap gap-3 items-center justify-between border-t border-teal-50 bg-slate-50/30">
                    <div className="flex gap-2">
                      <input type="file" id="ocr-upload" className="hidden" onChange={handleDocumentUpload} />
                      <label htmlFor="ocr-upload">
                        <Button variant="outline" size="sm" asChild className="gap-2 bg-white border-teal-100 text-teal-700 hover:bg-teal-50">
                          <span className="cursor-pointer"><Upload className="h-4 w-4" /> OCR Image</span>
                        </Button>
                      </label>
                      <Button variant={isListening ? "default" : "outline"} size="sm" onClick={toggleVoice} className={`gap-2 ${isListening ? 'bg-red-500 hover:bg-red-600 text-white border-0 shadow-md shadow-red-200' : 'bg-white border-teal-100 text-teal-700 hover:bg-teal-50'}`}>
                        {isListening ? <AlignLeft className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />} 
                        {isListening ? "Listening..." : "Dictate"}
                      </Button>
                    </div>
                    <Button className="bg-gradient-to-r from-[#14B8A6] to-[#10B981] hover:shadow-lg hover:shadow-teal-500/40 text-white font-black shadow-md shadow-teal-500/20 transition-all gap-2 px-8 py-6 rounded-xl border-0 active:scale-95" onClick={handleEvaluate} disabled={!answerText.trim()}>
                      <CheckCircle className="h-5 w-5" />
                      Evaluate Answer
                    </Button>
                  </CardFooter>
                </Card>

                {/* Info Sidebar */}
                <div className="space-y-6 relative z-10">
                  <Card className="shadow-lg rounded-2xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm ring-1 ring-teal-100">
                    <CardHeader className="pb-3 border-b border-teal-50">
                      <CardTitle className="text-base font-black flex items-center gap-2 text-slate-800">
                         <Search className="h-4 w-4 text-teal-500" /> Grading Criteria
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">Content Accuracy</span>
                        <span className="text-xs font-black text-teal-600">10 pts</span>
                      </div>
                      <Progress value={100} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-teal-400 [&>div]:to-teal-500 bg-teal-50 border border-teal-100" />
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm font-bold text-slate-600">Structure & Flow</span>
                        <span className="text-xs font-black text-emerald-600">10 pts</span>
                      </div>
                      <Progress value={100} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-500 bg-emerald-50 border border-emerald-100" />
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm font-bold text-slate-600">Grammar</span>
                        <span className="text-xs font-black text-teal-600">10 pts</span>
                      </div>
                      <Progress value={100} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-teal-500 [&>div]:to-teal-600 bg-teal-50 border border-teal-100" />
                    </CardContent>
                  </Card>
                </div>

              </motion.div>
            ) : isAnalyzing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 rounded-2xl border-2 border-dashed border-teal-100 bg-white/50 backdrop-blur-sm relative z-10">
                <Loader2 className="h-16 w-16 text-teal-500 animate-spin mb-6" />
                <h3 className="text-2xl font-bold mb-2 text-slate-900">AI Processing</h3>
                <p className="mb-6 font-medium text-slate-500">Running 14-point unbiased evaluation metric...</p>
                <div className="w-full max-w-[200px] bg-teal-50 rounded-full h-1.5 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-teal-500 to-teal-400" initial={{width: "0%"}} animate={{width: "100%"}} transition={{duration: 2.5, ease: "linear"}} />
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 relative z-10">
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Result Main Card */}
                  <Card className={`flex-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-x-0 border-t-0 border-b-[6px] rounded-2xl bg-white ${evalHistory[evalHistory.length-1].score >= 80 ? 'border-b-teal-500' : 'border-b-emerald-400'}`}>
                    <CardContent className="p-8">
                       <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                         <div>
                            <Badge variant="outline" className="mb-3 bg-teal-50/50 text-teal-600 border-teal-100">Eval ID: #{(Math.random()*10000).toFixed(0)}</Badge>
                            <h2 className="text-4xl font-black tabular-nums tracking-tighter mb-2 text-slate-900">
                               {evalHistory[evalHistory.length-1].score}<span className="text-2xl font-bold text-slate-400">/100</span>
                            </h2>
                            <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">Total Score</p>
                            
                            {/* Confidence Score Addon */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-teal-50">
                               <ShieldAlert className="h-4 w-4 text-teal-500" />
                               <span className="text-xs font-bold text-slate-500">AI Confidence Score: 98.4%</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 border-l-2 pl-6 border-teal-50">
                            <div className="text-center">
                              <span className="block text-2xl font-bold text-slate-900">{(evalHistory[evalHistory.length-1].content)}</span>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Content</span>
                            </div>
                            <div className="text-center">
                              <span className="block text-2xl font-bold text-slate-900">{(evalHistory[evalHistory.length-1].structure)}</span>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Structure</span>
                            </div>
                            <div className="text-center">
                              <span className="block text-2xl font-bold text-slate-900">{(evalHistory[evalHistory.length-1].grammar)}</span>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Grammar</span>
                            </div>
                         </div>
                       </div>

                       <div className="mt-8">
                         <div className="flex justify-between items-center mb-3">
                           <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900"><HelpCircle className="h-5 w-5 text-teal-500"/> Why this score?</h3>
                           <Button variant="ghost" size="sm" className="h-8 rounded-full text-teal-600 hover:bg-teal-50 font-black text-[10px] uppercase tracking-widest" onClick={() => playTTS(evalHistory[evalHistory.length-1].explanation)}>
                              <Volume2 className="h-4 w-4 mr-2" /> Listen
                           </Button>
                         </div>
                         <p className="text-sm leading-relaxed p-4 rounded-xl bg-teal-50/50 text-slate-700 border border-teal-100/50">
                           {evalHistory[evalHistory.length-1].explanation}
                         </p>
                       </div>
                    </CardContent>
                  </Card>

                  <div className="md:w-1/3 flex flex-col gap-6">
                     {/* Feedback Generator List */}
                     <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl flex-1 bg-white border-teal-50">
                       <CardHeader className="pb-3 border-b border-teal-50">
                         <CardTitle className="text-base flex items-center gap-2 text-slate-900"><Target className="h-5 w-5 text-teal-500"/> Actionable Feedback</CardTitle>
                       </CardHeader>
                       <CardContent className="pt-4">
                          <ul className="space-y-4">
                            {evalHistory[evalHistory.length-1].feedback.map((f, i) => (
                              <li key={i} className="flex gap-3 items-start">
                                <div className={`mt-0.5 shrink-0 h-2 w-2 rounded-full ${f.priority === 'high' ? 'bg-red-500' : f.priority === 'medium' ? 'bg-amber-500' : 'bg-teal-500'}`} />
                                <div>
                                   <p className="text-[13px] font-medium leading-snug text-slate-700">{f.text}</p>
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{f.priority} Priority</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                       </CardContent>
                     </Card>
                     
                     {/* Interactive Options below Result */}
                     <div className="flex flex-col items-center justify-between p-4 rounded-2xl border border-dashed border-teal-200 bg-teal-50/30">
                        <div className="flex items-center gap-3 w-full mb-3">
                           <div className="p-2 rounded-xl shrink-0 bg-teal-100 text-teal-600">
                              <RefreshCw className="h-5 w-5" />
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-700">Ready to improve?</p>
                           </div>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-[#14B8A6] to-[#10B981] hover:shadow-lg hover:shadow-teal-500/40 text-white shadow-md shadow-teal-500/20 flex items-center gap-2 border-0 h-12 rounded-xl font-black transition-all active:scale-95" onClick={handleStartNewAttempt} disabled={isStartingNew}>
                            {isStartingNew ? <Loader2 className="h-4 w-4 animate-spin"/> : null}
                            Start New Attempt
                         </Button>
                     </div>
                  </div>
                </div>
                
                {/* 🌟 New Mistake Review Panel Below Result */}
                <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl bg-white border-teal-50">
                   <CardHeader className="pb-3 border-b border-teal-50">
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900"><Target className="h-5 w-5 text-red-500"/> Mistake Review Panel</CardTitle>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-6">
                      <div className="p-5 rounded-xl border bg-teal-50/30 border-teal-100">
                         <h4 className="text-xs font-bold text-teal-600 mb-3 uppercase tracking-wider">Your Submitted Answer</h4>
                         <p className="text-sm leading-relaxed text-slate-700">
                            {answerText || `The mitochondria is the powerhouse of the cell.`} 
                            {" "}
                            {/* Dummy Mistake Highlight Simulation */}
                            <span className="bg-red-100 text-red-900 px-1.5 py-0.5 rounded relative group cursor-pointer inline-block border-b-2 border-red-500 transition-colors hover:bg-red-200">
                               it make
                               <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] whitespace-normal bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl z-20 font-medium">
                                  <strong>AI Note:</strong> Grammar: Subject-verb agreement error. Should be 'makes' (singular subject).
                               </span>
                            </span>
                            {" "}energy for the cell.
                         </p>
                      </div>
                      <div className="flex gap-4">
                         <Button onClick={handleReattempt} className="bg-gradient-to-r from-[#14B8A6] to-[#10B981] hover:shadow-lg hover:shadow-teal-500/40 text-white gap-2 flex-1 shadow-md shadow-teal-500/20 h-14 rounded-xl text-lg font-black transition-all active:scale-95 border-0">
                             <RefreshCw className="h-5 w-5"/> Re-attempt Assignment
                          </Button>
                      </div>
                   </CardContent>
                </Card>

                {/* 🌟 New Past Submissions History */}
                <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl bg-white border-teal-50">
                    <CardHeader className="pb-3 border-b border-teal-50">
                       <CardTitle className="text-base font-black flex items-center gap-2 text-slate-800 tracking-tight uppercase"><History className="h-5 w-5 text-teal-500"/> Submission History</CardTitle>
                    </CardHeader>
                   <CardContent className="pt-0">
                      <div className="divide-y divide-teal-50">
                         {pastSubmissions.map((sub, idx) => (
                            <div key={idx} className="py-4 flex justify-between items-center group cursor-pointer hover:bg-teal-50/30 transition-colors -mx-6 px-6">
                               <div>
                                   <div className="flex items-center gap-3 mb-1">
                                      <span className={`font-black text-lg ${sub.score < 50 ? 'text-rose-500' : sub.score < 80 ? 'text-teal-500' : 'text-emerald-500'}`}>{sub.score}%</span>
                                      <span className="font-black text-slate-800 tracking-tight">{sub.topic}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                     <span>{sub.date}</span>
                                     <span>• ID: {sub.id}</span>
                                  </div>
                               </div>
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={() => handleReviewFeedback(sub)} 
                                 className="opacity-0 group-hover:opacity-100 transition-opacity min-w-[130px] text-teal-600 hover:bg-teal-50 font-black text-xs uppercase tracking-widest"
                                 disabled={isLoadingFeedback && selectedHistoryItem?.id === sub.id}
                               >
                                  {isLoadingFeedback && selectedHistoryItem?.id === sub.id ? <Loader2 className="h-4 w-4 animate-spin"/> : "Review Analysis"}
                               </Button>
                            </div>
                         ))}
                      </div>
                   </CardContent>
                </Card>
                
                {/* Visual Chart if Resubmitted */}
                {evalHistory.length > 1 && (
                   <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl bg-white border-teal-50">
                     <CardHeader>
                       <CardTitle className="text-lg text-slate-900">Improvement Trend (Before vs After)</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="h-[250px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={evalHistory.map((e,i)=>({name: `Attempt ${i+1}`, score: e.score, grammar: e.grammar*10}))} margin={{top:10, right:10, left:-20, bottom:0}}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={"#f1f5f9"} />
                              <XAxis dataKey="name" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                              <YAxis tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                              <RechartsTooltip contentStyle={{backgroundColor:'#fff', borderRadius:'12px', border:'1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                              <Bar dataKey="score" fill="#14b8a6" radius={[6,6,0,0]} barSize={40} name="Total Score" />
                            </BarChart>
                         </ResponsiveContainer>
                       </div>
                     </CardContent>
                   </Card>
                )}
              </motion.div>
            )}
          </TabsContent>

          {/* ... (Plagiarism, Learning Path, Analytics, and Certificate sections remain identical) ... */}
          {/* 2. Plagiarism Detection */}
          <TabsContent value="plagiarism" className="mt-4 outline-none relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl bg-white border-teal-50">
                 <CardHeader className="border-b border-teal-50 bg-slate-50/50">
                    <CardTitle className="flex items-center gap-2 text-slate-900"><FileSearch className="h-5 w-5 text-red-500" /> Deep Text Scan</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-6 space-y-4">
                    <Textarea 
                       value={plagText}
                       onChange={e=>setPlagText(e.target.value)}
                       className="min-h-[250px] resize-none bg-teal-50/30 border-teal-100/50 text-slate-700"
                    />
                    <Button onClick={handleCheckPlag} disabled={isCheckingPlag} className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white h-12 rounded-xl text-md font-bold shadow-md shadow-red-200 border-0">
                       {isCheckingPlag ? <Loader2 className="h-5 w-5 animate-spin"/> : "Initiate Advanced Scan"}
                    </Button>
                 </CardContent>
              </Card>

              {plagResult && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}}>
                  <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl h-full border-t-[6px] border-t-red-500 bg-white border-teal-50">
                     <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                        <div className="relative inline-flex items-center justify-center mx-auto mb-6">
                           <svg className="w-32 h-32 transform -rotate-90">
                             <circle cx="64" cy="64" r="56" fill="transparent" stroke={"#f1f5f9"} strokeWidth="12" />
                             <circle cx="64" cy="64" r="56" fill="transparent" stroke="#ef4444" strokeWidth="12" strokeDasharray={351} strokeDashoffset={351 - (351 * plagResult.similarity) / 100} strokeLinecap="round" className="transition-all duration-1000" />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-3xl font-black text-red-500">{plagResult.similarity}%</span>
                           </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">Similarity Index</h3>
                        <p className="text-sm text-slate-500 mb-4">High probability of copied content. Please review highlighted instances.</p>
                        
                        <div className="p-4 rounded-xl text-left border bg-red-50 border-red-100 text-red-800">
                           <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Sources Found</p>
                           <a href="#" className="flex items-center gap-2 text-sm font-medium hover:underline"><LinkIcon className="h-3.5 w-3.5"/> Wikipedia.org</a>
                        </div>
                     </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
            {/* Highlighted text preview would go below */}
            {plagResult && (
               <Card className="mt-6 shadow-sm rounded-2xl bg-white border-teal-50">
                  <CardHeader><CardTitle className="text-base text-slate-900">Affected Segments</CardTitle></CardHeader>
                  <CardContent>
                     <p className="leading-relaxed text-base">
                        The mitochondria is the powerhouse of the cell. <span className="bg-red-500/20 text-red-700 dark:text-red-300 px-1 py-0.5 rounded cursor-help" title="Source: Wikipedia">According to Wikipedia, it generates most of the cell's supply of ATP.</span> This energy is used for various cellular processes.
                     </p>
                  </CardContent>
               </Card>
            )}
          </TabsContent>

          {/* 3. Smart Learning Path */}
          <TabsContent value="learning" className="mt-4 outline-none relative z-10">
            
            {/* 🌟 New Insight Text Panel */}
            <div className="mb-8 p-6 rounded-2xl border bg-emerald-50 border-emerald-100 text-emerald-800 flex gap-4 items-start shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <Zap className="h-24 w-24" />
               </div>
               <div className="p-3 bg-gradient-to-br from-[#14B8A6] to-[#10B981] rounded-xl shrink-0 shadow-lg shadow-teal-500/20">
                  <Zap className="h-5 w-5 text-white fill-white"/>
               </div>
               <div>
                  <h4 className="font-black text-sm mb-1 text-emerald-900 uppercase tracking-widest">AI Learning Insight</h4>
                  <p className="text-sm font-bold leading-relaxed text-emerald-800/80">
                     Based on your past performance and recent evaluations, we recommend focusing intensely on <strong>Advanced Structuring</strong> (P.E.E.L paragraphs) to improve your overall scoring potential by up to 15%.
                  </p>
               </div>
            </div>

            <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl bg-white border-teal-50 overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-teal-500 to-[#10B981]" />
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-slate-900"><Compass className="h-6 w-6 text-teal-600"/> AI Recommended Roadmap</CardTitle>
                 <CardDescription className="text-slate-500">Generated specifically for your weak points identified in previous evaluations.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                 
                 {/* 🌟 Redesigned Modules with Assignments & Progress */}
                 <div className="relative border-l-2 border-slate-100 ml-4 space-y-12 pl-8 pb-8">
                    
                    {/* Module 1: Completed */}
                    <div className="relative">
                       <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center ring-4 ring-white shadow-sm">
                          <Check className="h-3 w-3 text-white" />
                       </span>
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-slate-800">Module 1: Foundational Syntax</h3>
                          <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-0 shadow-none"><Check className="h-3 w-3 mr-1"/> Completed</Badge>
                       </div>
                       <p className="text-sm mb-4 text-slate-500">Strengthen complex grammatical bindings.</p>
                       <div className="flex gap-2 mb-4">
                          <Badge variant="outline" className="bg-transparent py-1 text-teal-700 border-teal-200"><Star className="h-3 w-3 mr-1 fill-teal-500"/> Assignment Score: 92%</Badge>
                       </div>
                       
                       <div className="p-4 rounded-xl border opacity-70 bg-slate-50 border-slate-100">
                          <div className="flex items-center gap-3">
                             <FileText className="h-6 w-6 text-teal-500" />
                             <div>
                                <h4 className="font-semibold text-sm text-slate-800">Assignment: Basic Sentences</h4>
                                <p className="text-xs text-slate-400">Submitted on Oct 12</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Module 2: Current/Pending */}
                    <div className="relative">
                        <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center ring-4 ring-white shadow-sm ring-offset-2 ring-offset-teal-50">
                           <CircleDot className="h-3 w-3 text-white" />
                        </span>
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="font-black text-lg text-teal-600 uppercase tracking-tight">Module 2: Advanced Structuring</h3>
                           <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 shadow-none animate-pulse font-black text-[10px]">CURRENT</Badge>
                        </div>
                        <p className="text-sm mb-5 font-bold text-slate-500">Focus on structural coherence based on your last 3 low-scoring submissions.</p>
                       
                        <div className="p-5 rounded-2xl border shadow-md bg-white border-teal-100 space-y-5 group hover:border-teal-300 transition-all">
                           <div className="flex justify-between items-center bg-teal-50/50 p-4 rounded-xl border border-teal-100/50 transition-colors group-hover:bg-teal-50">
                              <div className="flex items-center gap-4">
                                 <div className="p-3 bg-teal-100 rounded-lg text-teal-600 shadow-sm border border-teal-200">
                                    <FileText className="h-6 w-6" />
                                 </div>
                                 <div>
                                    <h4 className="font-black text-sm tracking-tight text-slate-800 uppercase tracking-wider">Assignment: Argumentative Essay</h4>
                                    <p className="text-xs mt-0.5 font-bold text-slate-500">Min passing score: 75% • Est. Time: 25m</p>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex gap-3">
                              <Button className="flex-1 bg-gradient-to-r from-[#14B8A6] to-[#10B981] hover:shadow-lg hover:shadow-teal-500/40 text-white shrink-0 shadow-md shadow-teal-500/20 transition-all active:scale-95 border-0 h-12 rounded-xl font-black">
                                 <PlayCircle className="h-4 w-4 mr-2"/> Start Assignment
                              </Button>
                              <Button variant="outline" className="flex-1 shrink-0 bg-slate-50 text-slate-300 border-slate-100 rounded-xl h-12 font-black" disabled>
                                 Submit Assignment
                              </Button>
                           </div>
                        </div>
                    </div>

                    {/* Module 3: Locked */}
                    <div className="relative opacity-60">
                       <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center ring-4 ring-white" />
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-slate-400">Module 3: Vocabulary Expansion</h3>
                          <Badge variant="outline" className="border-slate-200 text-slate-400">Locked</Badge>
                       </div>
                       <p className="text-sm text-slate-400">Unlock this module by reaching the performance threshold in Module 2.</p>
                       
                       <div className="mt-4 p-4 rounded-xl border opacity-50 bg-slate-50 border-slate-100">
                          <div className="flex items-center gap-3">
                             <FileText className="h-6 w-6 text-slate-300" />
                             <div>
                                <h4 className="font-semibold text-sm text-slate-400">Assignment: Vocabulary Quiz</h4>
                                <p className="text-xs text-slate-300">Requires Mod 2 completion</p>
                             </div>
                          </div>
                       </div>
                    </div>

                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. Visual Analytics & Gamification */}
          <TabsContent value="analytics" className="mt-4 outline-none relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Gamification Sidebar */}
                <div className="md:col-span-1">
                   <Card className="rounded-2xl border-0 bg-gradient-to-br from-[#14B8A6] to-[#10B981] text-white shadow-xl overflow-hidden relative group">
                      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform"><Trophy className="h-32 w-32"/></div>
                      <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.1] pointer-events-none"></div>
                      <CardContent className="p-8 relative z-10">
                        <p className="text-teal-50 font-black uppercase tracking-widest text-[10px] mb-1">Lifetime Achievement</p>
                        <h3 className="text-5xl font-black mb-6 tabular-nums">1,250<span className="text-xl font-bold text-teal-100 ml-1">XP</span></h3>
                        <div className="space-y-3">
                           <div className="flex items-center gap-3 bg-white/20 rounded-2xl p-3 backdrop-blur-md border border-white/10 shadow-sm">
                              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center shadow-inner"><Star className="h-4 w-4 text-yellow-300 fill-yellow-300 shadow-sm" /></div>
                              <span className="text-sm font-black tracking-tight">Top 5% Performer</span>
                           </div>
                           <div className="flex items-center gap-3 bg-white/20 rounded-2xl p-3 backdrop-blur-md border border-white/10 shadow-sm">
                              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center shadow-inner"><Zap className="h-4 w-4 text-orange-400 fill-orange-400" /></div>
                              <span className="text-sm font-black tracking-tight">12 Day Streak!</span>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="md:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <Card className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border-teal-50">
                      <CardHeader><CardTitle className="text-base text-center text-slate-900">Skill Proficiency Matrix</CardTitle></CardHeader>
                      <CardContent>
                         <div className="h-[250px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                               <PolarGrid stroke={"#f1f5f9"} />
                               <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 12}} />
                               <Radar name="Student" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.4} />
                             </RadarChart>
                           </ResponsiveContainer>
                         </div>
                      </CardContent>
                   </Card>

                   <Card className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border-teal-50">
                      <CardHeader><CardTitle className="text-base text-slate-900 text-center">Weekly Growth Trend</CardTitle></CardHeader>
                      <CardContent>
                         <div className="h-[250px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={historyData} margin={{top:10, right:10, left:-20, bottom:0}}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={"#f1f5f9"} />
                                 <XAxis dataKey="day" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                 <YAxis tick={{fill: '#94a3b8'}} domain={[50, 100]} axisLine={false} tickLine={false} />
                                 <RechartsTooltip contentStyle={{backgroundColor:'#fff', borderRadius:'12px', border:'1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                 <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={4} activeDot={{r:8}} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                              </LineChart>
                           </ResponsiveContainer>
                         </div>
                      </CardContent>
                   </Card>
                </div>
             </div>
          </TabsContent>

          {/* 5. Certificate Generator */}
          <TabsContent value="certificate" className="mt-4 outline-none relative z-10">
             <div className="max-w-3xl mx-auto">
                <Card className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border-teal-50 p-2">
                   <div className="border-[8px] border-double border-teal-100 rounded-xl p-8 md:p-16 text-center bg-teal-50/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-teal-100/50 rounded-br-full opacity-50"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100/50 rounded-tl-full opacity-50"></div>
                      
                      <Award className="h-16 w-16 text-teal-500 mx-auto mb-6" />
                      <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-widest text-slate-900" style={{fontFamily: 'serif'}}>Certificate of Excellence</h2>
                      <p className="text-lg mb-8 font-serif italic text-slate-500">This is proudly presented to</p>
                      <p className="text-3xl font-bold border-b-2 border-teal-200 inline-block px-12 pb-2 mb-8 text-slate-800" style={{fontFamily: 'cursive'}}>Aisha Rahman</p>
                      <p className="text-sm md:text-base leading-relaxed max-w-lg mx-auto font-medium text-slate-600">
                         For outstanding performance and achieving top 5% proficiency in advanced AI-evaluated modules, demonstrating critical thinking and exceptional language mastery.
                      </p>
                      <div className="mt-16 flex justify-between items-end px-4 md:px-12">
                         <div className="text-center">
                            <div className="w-32 border-b-2 border-teal-200 mb-2"></div>
                            <p className="text-xs font-bold uppercase text-slate-400">AI Director</p>
                         </div>
                         <div className="text-center">
                            <div className="w-32 border-b-2 border-teal-200 mb-2"></div>
                            <p className="text-xs font-bold uppercase text-slate-400">Date Issued</p>
                         </div>
                      </div>
                   </div>
                </Card>
                <div className="flex justify-center gap-4 mt-8">
                   <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 px-6 rounded-xl h-12 shadow-lg shadow-slate-200 transition-all active:scale-95 border-0">
                      <Download className="h-5 w-5" /> Download PDF
                   </Button>
                   <Button className="bg-[#0a66c2] hover:bg-[#004182] text-white gap-2 px-6 rounded-xl h-12 shadow-md">
                      <Share2 className="h-5 w-5" /> Share on LinkedIn
                   </Button>
                </div>
             </div>
          </TabsContent>

        </Tabs>
        
        {/* 🌟 Global AI Transparency Note */}
        <div className="mt-10 p-5 text-center flex items-center justify-center gap-3 rounded-xl border border-dashed border-teal-200 bg-teal-50/50 text-teal-600 text-xs font-semibold uppercase tracking-wider relative z-10">
           <ShieldAlert className="h-4 w-4" />
           This analysis is generated by AI and is designed to be unbiased and fair.
        </div>

      </div>

      {/* Floating Doubt Solver Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div initial={{opacity:0, y:20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:20, scale:0.95}} className="mb-4">
              <Card className="w-[340px] md:w-[380px] shadow-[0_20px_50px_rgba(20,184,166,0.15)] border-0 overflow-hidden bg-white rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-[#14B8A6] to-[#10B981] text-white p-5 shadow-lg border-b border-teal-400/20">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-black flex items-center gap-2 uppercase tracking-widest"><MessageCircle className="h-5 w-5 shadow-sm"/> AI Tutor Chat</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full transition-all" onClick={() => setIsChatOpen(false)}>
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 h-[350px] overflow-y-auto space-y-4 bg-slate-50/50">
                  {chatMsgs.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-[85%] text-[13px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-teal-600 text-white rounded-br-sm shadow-teal-500/20' : 'bg-white text-slate-800 rounded-bl-sm border border-teal-50'}`}>
                         {m.text}
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="p-4 border-t border-teal-50 bg-white">
                  <form onSubmit={sendChat} className="flex gap-2 w-full">
                    <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask how to improve your score..." className="flex-1 px-4 py-3 text-sm rounded-xl outline-none focus:ring-4 focus:ring-teal-500/10 transition-all bg-slate-50 border border-teal-100 text-slate-700 font-bold" />
                    <Button type="submit" size="icon" className="shrink-0 bg-gradient-to-br from-[#14B8A6] to-[#10B981] hover:shadow-lg hover:shadow-teal-500/30 text-white rounded-xl shadow-md shadow-teal-500/20 border-0 h-11 w-11 transition-all active:scale-90">
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        {!isChatOpen && (
          <Button size="icon" className="h-14 w-14 rounded-full shadow-[0_10px_30px_rgba(20,184,166,0.3)] bg-teal-600 hover:bg-teal-700 hover:scale-110 transition-all border-0" onClick={() => setIsChatOpen(true)}>
             <HelpCircle className="h-6 w-6 text-white" />
          </Button>
        )}
      </div>

      <StudentProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

       {/* 🌟 Feedback Modal Overlay */}
       <AnimatePresence>
          {isReviewModalOpen && selectedHistoryItem && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-md px-4">
                <motion.div initial={{opacity:0, scale:0.95, y:20}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:20}} className="w-full max-w-2xl rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] overflow-hidden bg-white text-slate-900 border border-teal-50">
                   <div className="p-5 flex justify-between items-center border-b border-teal-50 bg-slate-50/50">
                      <div>
                         <h3 className="font-black flex items-center gap-2 text-lg text-slate-900 uppercase tracking-tight"><History className="h-5 w-5 text-teal-500"/> Sub ID: {selectedHistoryItem.id}</h3>
                         <p className="text-xs mt-1 font-bold text-teal-600/70">{selectedHistoryItem.topic} • {selectedHistoryItem.date}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500" onClick={() => setIsReviewModalOpen(false)}>
                         <XCircle className="h-6 w-6"/>
                      </Button>
                   </div>
                   <div className="p-6 space-y-6">
                      <div className="flex justify-between items-center p-4 rounded-2xl border bg-teal-50/30 border-teal-100">
                         <div className="text-center w-1/4 border-r border-teal-100">
                            <span className="block text-3xl font-black text-teal-600">{selectedHistoryItem.score}%</span>
                            <span className="text-xs font-bold uppercase text-slate-400">Overall</span>
                         </div>
                         <div className="text-center w-1/4">
                            <span className="block text-xl font-bold text-slate-800">8.5</span>
                            <span className="text-xs font-bold uppercase text-slate-400">Content</span>
                         </div>
                         <div className="text-center w-1/4">
                            <span className="block text-xl font-bold text-slate-800">6.0</span>
                            <span className="text-xs font-bold uppercase text-slate-400">Structure</span>
                         </div>
                         <div className="text-center w-1/4">
                            <span className="block text-xl font-bold text-slate-800">7.0</span>
                            <span className="text-xs font-bold uppercase text-slate-400">Grammar</span>
                         </div>
                      </div>
                      <div>
                         <h4 className="text-xs tracking-wider font-bold uppercase mb-3 text-slate-400">Submitted Answer</h4>
                         <div className="p-4 rounded-xl text-sm leading-relaxed border bg-slate-50 border-teal-50 text-slate-700">
                            The mitochondria is the <span className="text-teal-600 font-black border-b-2 border-teal-500 cursor-help" title="Feedback: Cliché. Use 'primary energy generator'">powerhouse</span> of the cell... it <span className="text-emerald-500 font-black border-b-2 border-emerald-500 cursor-help" title="Feedback: Grammar Subject-verb mismatch">make</span> energy.
                         </div>
                      </div>
                      <div>
                         <h4 className="text-xs tracking-wider font-bold uppercase mb-3 text-slate-400">AI Detailed Feedback</h4>
                         <ul className="space-y-3 text-sm">
                            <li className="flex gap-3 items-start"><CheckCircle className="h-5 w-5 text-teal-500 mt-0.5 shrink-0"/> Good core understanding of the topic and cell functions.</li>
                            <li className="flex gap-3 items-start"><AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0"/> Multiple grammatical errors detected (Subject-verb discord).</li>
                            <li className="flex gap-3 items-start"><AlertCircle className="h-5 w-5 text-teal-500 mt-0.5 shrink-0"/> Structure could be improved using P.E.E.L method to organize paragraphs.</li>
                         </ul>
                      </div>
                   </div>
                   <div className="p-4 border-t flex justify-end gap-3 bg-slate-50/50 border-teal-50">
                      <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 rounded-xl border-0 shadow-lg shadow-slate-200 font-black transition-all active:scale-95" onClick={() => setIsReviewModalOpen(false)}>Close Analysis</Button>
                   </div>
                </motion.div>
             </div>
          )}
       </AnimatePresence>

    </div>
  );
}
