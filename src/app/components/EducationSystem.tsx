import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Mic, Loader2, CheckCircle, XCircle, FileText, ArrowLeft, GraduationCap, PlayCircle, BookOpen, Compass, Search, Award, TrendingUp, HelpCircle, Trophy, Target, Star, Volume2, Link as LinkIcon, Send, AlignLeft, RefreshCw, Download, Share2, MessageCircle, Moon, Sun, Clock, Zap, FileSearch, Check, ShieldAlert, History, AlertCircle } from "lucide-react";
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
  const [isDark, setIsDark] = useState(false);
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

  const themeClasses = isDark ? "bg-[#0B1120] text-slate-100" : "bg-gray-50 text-gray-900";
  const cardClasses = isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-100";
  const textMuted = isDark ? "text-slate-400" : "text-gray-500";

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

  const handleDocumentUpload = () => {
    toast.success("Document OCR simulated. Text extracted successfully.");
    setAnswerText("The extracted text from the handwritten image reveals a comprehensive understanding of the topic, though it lacks clear formatting in paragraph 2.");
  };

  const handleEvaluate = () => {
    if (!answerText.trim()) return toast.error("Please enter an answer to evaluate.");
    setIsAnalyzing(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 20) + Math.min(80, (liveGrade.score + 10)); // Boost a bit
      const content = Math.min(10, Math.round((score / 100) * 10 + 1));
      const structure = Math.min(10, Math.round((score / 100) * 10));
      const grammar = Math.min(10, Math.round((score / 100) * 10 - 1));
      
      const res: GradeResult = {
        score,
        content,
        structure,
        grammar,
        explanation: `Your answer achieved ${score}% because the core arguments were well-presented, but it lacked deeper structural flow and had minor grammatical inconsistencies in complex sentences. The content aligns closely with the grading rubric expectations.`,
        feedback: [
          { text: "Improve the introduction to grab attention.", priority: "high" },
          { text: "Use more real-life examples to substantiate claims.", priority: "high" },
          { text: "Grammar mistakes: 2 run-on sentences detected.", priority: "medium" },
          { text: "Enhance vocabulary related to technical terms.", priority: "low" }
        ]
      };
      setEvalHistory(prev => [...prev, res]);
      setShowResult(true);
      setIsAnalyzing(false);
      toast.success("Evaluation Complete");
    }, 2500);
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

  const handleCheckPlag = () => {
    if (!plagText.trim()) return;
    setIsCheckingPlag(true);
    setTimeout(() => {
      setPlagResult({ similarity: 32 });
      setIsCheckingPlag(false);
      toast.error("Possible Plagiarism Detected");
    }, 2000);
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
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      
      {/* Header */}
      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-20 shadow-sm`}>
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className={isDark ? "hover:bg-slate-800" : ""}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg shadow-sm">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight">AI Education System</h1>
                  <p className={`text-xs md:text-sm font-medium ${textMuted}`}>Smart Tutor & Unbiased Evaluator</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={`hidden md:flex font-bold tracking-widest uppercase px-3 py-1 ${isDark ? 'bg-indigo-900/50 text-indigo-300':'bg-indigo-50 text-indigo-700'}`}>
                1,250 XP
              </Badge>
              <Button variant="outline" size="icon" onClick={() => setIsDark(!isDark)} className={`rounded-xl ${isDark ? 'border-slate-700 hover:bg-slate-800':'border-gray-200'}`}>
                {isDark ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
              </Button>
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="h-10 w-10 ml-2 rounded-full border-2 border-slate-200 hover:border-teal-500 overflow-hidden flex items-center justify-center bg-teal-100 text-teal-700 font-bold transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500/50"
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
          <div className="overflow-x-auto pb-4 hide-scrollbar">
            <TabsList className={`flex w-max min-w-full h-auto p-1.5 gap-2 rounded-2xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100 shadow-sm'}`}>
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
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all data-[state=active]:bg-teal-500 data-[state=active]:text-white ${isDark ? 'data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-slate-800' : 'data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:bg-gray-50'}`}
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
                <Card className={`lg:col-span-2 shadow-sm rounded-2xl overflow-hidden ${cardClasses}`}>
                  <CardHeader className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-50 bg-gray-50/50'} pb-4`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">Interactive AI Editor</CardTitle>
                        <CardDescription className="mt-1">Write your answer or upload a handwritten assignment via OCR.</CardDescription>
                      </div>
                      <Badge variant="outline" className={`font-bold flex items-center gap-1.5 px-3 py-1 bg-transparent ${isDark?'border-slate-700 text-slate-300':'text-gray-600'}`}>
                         <Zap className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500"/>
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
                        className={`min-h-[350px] border-0 rounded-none focus-visible:ring-0 text-base leading-relaxed p-6 resize-none ${isDark ? 'bg-slate-900 placeholder:text-slate-600 text-slate-200' : 'bg-white'}`}
                      />
                      {/* Live Predictions Overlay */}
                      {answerText.length > 0 && (
                        <div className="absolute right-4 top-4 flex flex-col gap-2 items-end pointer-events-none">
                          <div className={`px-3 py-1.5 rounded-lg shadow-sm border backdrop-blur-md flex items-center gap-2 transition-all ${liveGrade.score > 75 ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'}`}>
                             <span className="text-[11px] font-bold uppercase tracking-wider">Est. Score</span>
                             <span className="font-black">{liveGrade.score}%</span>
                          </div>
                          {liveGrade.msgs.map((msg, i) => (
                             <AnimatePresence key={i}>
                               <motion.div initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, scale:0.95}} className={`px-3 py-2 rounded-lg shadow-sm border max-w-[200px] text-xs font-medium leading-tight backdrop-blur-md ${isDark ? 'bg-indigo-900/40 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50/80 border-indigo-200 text-indigo-800'}`}>
                                 {msg}
                               </motion.div>
                             </AnimatePresence>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className={`p-4 flex flex-wrap gap-3 items-center justify-between border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'bg-gray-50'}`}>
                    <div className="flex gap-2">
                      <input type="file" id="ocr-upload" className="hidden" onChange={handleDocumentUpload} />
                      <label htmlFor="ocr-upload">
                        <Button variant="outline" size="sm" asChild className={`gap-2 ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700':'bg-white'}`}>
                          <span className="cursor-pointer"><Upload className="h-4 w-4" /> OCR Image</span>
                        </Button>
                      </label>
                      <Button variant={isListening ? "default" : "outline"} size="sm" onClick={toggleVoice} className={`gap-2 ${isListening ? 'bg-red-500 hover:bg-red-600 text-white border-0' : isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700':'bg-white'}`}>
                        {isListening ? <AlignLeft className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />} 
                        {isListening ? "Listening..." : "Dictate"}
                      </Button>
                    </div>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md gap-2 px-6" onClick={handleEvaluate} disabled={!answerText.trim()}>
                      <CheckCircle className="h-5 w-5" />
                      Evaluate Answer
                    </Button>
                  </CardFooter>
                </Card>

                {/* Info Sidebar */}
                <div className="space-y-6">
                  <Card className={`shadow-sm rounded-2xl border-0 overflow-hidden ${isDark ? 'bg-slate-800/50 ring-1 ring-slate-800' : 'bg-gradient-to-br from-indigo-50 to-blue-50 ring-1 ring-indigo-100/50'}`}>
                    <CardHeader className="pb-3 border-b border-indigo-100/20">
                      <CardTitle className={`text-base flex items-center gap-2 ${isDark ? 'text-indigo-400' : 'text-indigo-900'}`}>
                         <Key className="h-4 w-4" /> Grading Criteria
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-indigo-800'}`}>Content Accuracy</span>
                        <span className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-indigo-400'}`}>10 pts</span>
                      </div>
                      <Progress value={100} className="h-1.5 [&>div]:bg-indigo-400 bg-indigo-100" />
                      <div className="flex justify-between items-center mt-3">
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-indigo-800'}`}>Structure & Flow</span>
                        <span className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-indigo-400'}`}>10 pts</span>
                      </div>
                      <Progress value={100} className="h-1.5 [&>div]:bg-teal-400 bg-teal-100" />
                      <div className="flex justify-between items-center mt-3">
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-indigo-800'}`}>Grammar</span>
                        <span className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-indigo-400'}`}>10 pts</span>
                      </div>
                      <Progress value={100} className="h-1.5 [&>div]:bg-purple-400 bg-purple-100" />
                    </CardContent>
                  </Card>
                </div>

              </motion.div>
            ) : isAnalyzing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                <Loader2 className="h-16 w-16 text-teal-600 animate-spin mb-6" />
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>AI Processing</h3>
                <p className={`mb-6 font-medium ${textMuted}`}>Running 14-point unbiased evaluation metric...</p>
                <div className="w-full max-w-[200px] bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                  <motion.div className="h-full bg-teal-500" initial={{width: "0%"}} animate={{width: "100%"}} transition={{duration: 2.5, ease: "linear"}} />
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Result Main Card */}
                  <Card className={`flex-1 shadow-lg border-x-0 border-t-0 border-b-[6px] rounded-2xl ${cardClasses} ${evalHistory[evalHistory.length-1].score >= 80 ? 'border-b-green-500' : 'border-b-yellow-500'}`}>
                    <CardContent className="p-8">
                       <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                         <div>
                            <Badge variant="outline" className={`mb-3 bg-transparent ${isDark?'text-slate-400 border-slate-700':'text-gray-500'}`}>Eval ID: #{(Math.random()*10000).toFixed(0)}</Badge>
                            <h2 className="text-4xl font-black tabular-nums tracking-tighter mb-2">
                               {evalHistory[evalHistory.length-1].score}<span className={`text-2xl font-bold ${textMuted}`}>/100</span>
                            </h2>
                            <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">Total Score</p>
                            
                            {/* Confidence Score Addon */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                               <ShieldAlert className="h-4 w-4 text-emerald-500" />
                               <span className={`text-xs font-bold ${textMuted}`}>AI Confidence Score: 98.4%</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 border-l-2 pl-6 border-gray-100 dark:border-slate-800">
                            <div className="text-center">
                              <span className="block text-2xl font-bold">{(evalHistory[evalHistory.length-1].content)}</span>
                              <span className={`text-[10px] uppercase tracking-wider font-bold ${textMuted}`}>Content</span>
                            </div>
                            <div className="text-center">
                              <span className="block text-2xl font-bold">{(evalHistory[evalHistory.length-1].structure)}</span>
                              <span className={`text-[10px] uppercase tracking-wider font-bold ${textMuted}`}>Structure</span>
                            </div>
                            <div className="text-center">
                              <span className="block text-2xl font-bold">{(evalHistory[evalHistory.length-1].grammar)}</span>
                              <span className={`text-[10px] uppercase tracking-wider font-bold ${textMuted}`}>Grammar</span>
                            </div>
                         </div>
                       </div>

                       <div className="mt-8">
                         <div className="flex justify-between items-center mb-3">
                           <h3 className="text-lg font-bold flex items-center gap-2"><HelpCircle className="h-5 w-5 text-teal-500"/> Why this score?</h3>
                           <Button variant="ghost" size="sm" className="h-8 rounded-full" onClick={() => playTTS(evalHistory[evalHistory.length-1].explanation)}>
                              <Volume2 className="h-4 w-4 mr-2" /> Listen
                           </Button>
                         </div>
                         <p className={`text-sm leading-relaxed p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                           {evalHistory[evalHistory.length-1].explanation}
                         </p>
                       </div>
                    </CardContent>
                  </Card>

                  <div className="md:w-1/3 flex flex-col gap-6">
                     {/* Feedback Generator List */}
                     <Card className={`shadow-sm rounded-2xl flex-1 ${cardClasses}`}>
                       <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-800">
                         <CardTitle className="text-base flex items-center gap-2"><Target className="h-5 w-5 text-purple-500"/> Actionable Feedback</CardTitle>
                       </CardHeader>
                       <CardContent className="pt-4">
                          <ul className="space-y-4">
                            {evalHistory[evalHistory.length-1].feedback.map((f, i) => (
                              <li key={i} className="flex gap-3 items-start">
                                <div className={`mt-0.5 shrink-0 h-2 w-2 rounded-full ${f.priority === 'high' ? 'bg-red-500' : f.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                                <div>
                                   <p className="text-[13px] font-medium leading-snug">{f.text}</p>
                                   <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{f.priority} Priority</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                       </CardContent>
                     </Card>
                     
                     {/* Interactive Options below Result */}
                     <div className="flex flex-col items-center justify-between p-4 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3 w-full mb-3">
                           <div className={`p-2 rounded-xl shrink-0 ${isDark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                              <RefreshCw className="h-5 w-5" />
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-semibold">Ready to improve?</p>
                           </div>
                        </div>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2" onClick={handleStartNewAttempt} disabled={isStartingNew}>
                           {isStartingNew ? <Loader2 className="h-4 w-4 animate-spin"/> : null}
                           Start New Attempt
                        </Button>
                     </div>
                  </div>
                </div>
                
                {/* 🌟 New Mistake Review Panel Below Result */}
                <Card className={`shadow-sm rounded-2xl ${cardClasses}`}>
                   <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-800">
                      <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-red-500"/> Mistake Review Panel</CardTitle>
                   </CardHeader>
                   <CardContent className="pt-6 space-y-6">
                      <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                         <h4 className={`text-xs font-bold ${textMuted} mb-3 uppercase tracking-wider`}>Your Submitted Answer</h4>
                         <p className="text-sm leading-relaxed">
                            {answerText || `The mitochondria is the powerhouse of the cell.`} 
                            {" "}
                            {/* Dummy Mistake Highlight Simulation */}
                            <span className="bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-200 px-1.5 py-0.5 rounded relative group cursor-pointer inline-block border-b-2 border-red-500 transition-colors hover:bg-red-300 dark:hover:bg-red-900">
                               it make
                               <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] whitespace-normal bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl z-20 font-medium">
                                  <strong>AI Note:</strong> Grammar: Subject-verb agreement error. Should be 'makes' (singular subject).
                               </span>
                            </span>
                            {" "}energy for the cell.
                         </p>
                      </div>
                      <div className="flex gap-4">
                         <Button onClick={handleReattempt} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 flex-1 shadow-sm h-12 rounded-xl text-md font-semibold transition-all active:scale-95">
                            <RefreshCw className="h-4 w-4"/> Re-attempt
                         </Button>
                      </div>
                   </CardContent>
                </Card>

                {/* 🌟 New Past Submissions History */}
                <Card className={`shadow-sm rounded-2xl ${cardClasses}`}>
                   <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-800">
                      <CardTitle className="text-base flex items-center gap-2"><History className="h-5 w-5 text-blue-500"/> Past Submissions History</CardTitle>
                   </CardHeader>
                   <CardContent className="pt-0">
                      <div className="divide-y divide-gray-100 dark:divide-slate-800">
                         {pastSubmissions.map((sub, idx) => (
                            <div key={idx} className="py-4 flex justify-between items-center group cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors -mx-6 px-6">
                               <div>
                                  <div className="flex items-center gap-3 mb-1">
                                     <span className={`font-black text-lg ${sub.score < 50 ? 'text-red-500' : sub.score < 80 ? 'text-yellow-500' : 'text-green-500'}`}>{sub.score}%</span>
                                     <span className="font-semibold">{sub.topic}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs opacity-60 font-medium">
                                     <span>{sub.date}</span>
                                     <span>• ID: {sub.id}</span>
                                  </div>
                               </div>
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={() => handleReviewFeedback(sub)} 
                                 className="opacity-0 group-hover:opacity-100 transition-opacity min-w-[130px]"
                                 disabled={isLoadingFeedback && selectedHistoryItem?.id === sub.id}
                               >
                                  {isLoadingFeedback && selectedHistoryItem?.id === sub.id ? <Loader2 className="h-4 w-4 animate-spin"/> : "Review Feedback"}
                               </Button>
                            </div>
                         ))}
                      </div>
                   </CardContent>
                </Card>
                
                {/* Visual Chart if Resubmitted */}
                {evalHistory.length > 1 && (
                  <Card className={`shadow-sm rounded-2xl ${cardClasses}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">Improvement Trend (Before vs After)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={evalHistory.map((e,i)=>({name: `Attempt ${i+1}`, score: e.score, grammar: e.grammar*10}))} margin={{top:10, right:10, left:-20, bottom:0}}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark?"#334155":"#e2e8f0"} />
                             <XAxis dataKey="name" tick={{fill: isDark?'#94a3b8':'#64748b'}} axisLine={false} tickLine={false} />
                             <YAxis tick={{fill: isDark?'#94a3b8':'#64748b'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                             <RechartsTooltip contentStyle={{backgroundColor:isDark?'#1e293b':'#fff', borderRadius:'8px', border:'none'}} />
                             <Bar dataKey="score" fill="#0d9488" radius={[4,4,0,0]} barSize={40} name="Total Score" />
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
          <TabsContent value="plagiarism" className="mt-4 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className={`lg:col-span-2 shadow-sm rounded-2xl ${cardClasses}`}>
                 <CardHeader className={`border-b ${isDark ? 'border-slate-800' : 'border-gray-50'}`}>
                    <CardTitle className="flex items-center gap-2"><FileSearch className="h-5 w-5 text-red-500" /> Deep Text Scan</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-6 space-y-4">
                    <Textarea 
                       value={plagText}
                       onChange={e=>setPlagText(e.target.value)}
                       className={`min-h-[250px] resize-none ${isDark ? 'bg-slate-950 border-slate-800 focus-visible:ring-slate-700' : 'bg-gray-50'}`}
                    />
                    <Button onClick={handleCheckPlag} disabled={isCheckingPlag} className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl text-md font-bold">
                       {isCheckingPlag ? <Loader2 className="h-5 w-5 animate-spin"/> : "Initiate Advanced Scan"}
                    </Button>
                 </CardContent>
              </Card>

              {plagResult && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}}>
                  <Card className={`shadow-sm rounded-2xl h-full border-t-[6px] border-t-red-500 ${cardClasses}`}>
                     <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                        <div className="relative inline-flex items-center justify-center mx-auto mb-6">
                           <svg className="w-32 h-32 transform -rotate-90">
                             <circle cx="64" cy="64" r="56" fill="transparent" stroke={isDark?"#334155":"#f1f5f9"} strokeWidth="12" />
                             <circle cx="64" cy="64" r="56" fill="transparent" stroke="#ef4444" strokeWidth="12" strokeDasharray={351} strokeDashoffset={351 - (351 * plagResult.similarity) / 100} strokeLinecap="round" className="transition-all duration-1000" />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-3xl font-black text-red-500">{plagResult.similarity}%</span>
                           </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Similarity Index</h3>
                        <p className={`text-sm ${textMuted} mb-4`}>High probability of copied content. Please review highlighted instances.</p>
                        
                        <div className={`p-4 rounded-xl text-left border ${isDark ? 'bg-red-950/20 border-red-900/30 text-red-200' : 'bg-red-50 border-red-100 text-red-800'}`}>
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
               <Card className={`mt-6 shadow-sm rounded-2xl ${cardClasses}`}>
                  <CardHeader><CardTitle className="text-base">Affected Segments</CardTitle></CardHeader>
                  <CardContent>
                     <p className="leading-relaxed text-base">
                        The mitochondria is the powerhouse of the cell. <span className="bg-red-500/20 text-red-700 dark:text-red-300 px-1 py-0.5 rounded cursor-help" title="Source: Wikipedia">According to Wikipedia, it generates most of the cell's supply of ATP.</span> This energy is used for various cellular processes.
                     </p>
                  </CardContent>
               </Card>
            )}
          </TabsContent>

          {/* 3. Smart Learning Path */}
          <TabsContent value="learning" className="mt-4 outline-none">
            
            {/* 🌟 New Insight Text Panel */}
            <div className={`mb-8 p-5 rounded-2xl border ${isDark ? 'bg-indigo-900/20 border-indigo-500/50 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800'} flex gap-4 items-start shadow-sm`}>
               <div className="p-2.5 bg-indigo-500 rounded-xl shrink-0">
                  <Zap className="h-5 w-5 text-white fill-white"/>
               </div>
               <div>
                  <h4 className="font-bold text-sm mb-1 text-inherit opacity-90">AI Smart Insight</h4>
                  <p className="text-sm leading-relaxed">
                     Based on your past performance and recent evaluations, we recommend focusing intensely on <strong>Advanced Structuring</strong> (P.E.E.L paragraphs) to improve your overall scoring potential by up to 15%.
                  </p>
               </div>
            </div>

            <Card className={`shadow-sm rounded-2xl ${cardClasses} overflow-hidden`}>
              <div className={`h-2 w-full bg-gradient-to-r from-teal-400 to-indigo-500`} />
              <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Compass className="h-6 w-6 text-indigo-500"/> AI Recommended Roadmap</CardTitle>
                 <CardDescription>Generated specifically for your weak points identified in previous evaluations.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                 
                 {/* 🌟 Redesigned Modules with Assignments & Progress */}
                 <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-12 pl-8 pb-8">
                    
                    {/* Module 1: Completed */}
                    <div className="relative">
                       <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-sm">
                          <Check className="h-3 w-3 text-white" />
                       </span>
                       <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Module 1: Foundational Syntax</h3>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 shadow-none"><Check className="h-3 w-3 mr-1"/> Completed</Badge>
                       </div>
                       <p className={`text-sm mb-4 ${textMuted}`}>Strengthen complex grammatical bindings.</p>
                       <div className="flex gap-2 mb-4">
                          <Badge variant="outline" className={`bg-transparent py-1 ${isDark?'text-emerald-400 border-emerald-900/50':'text-emerald-700 border-emerald-200'}`}><Star className="h-3 w-3 mr-1 fill-emerald-500"/> Assignment Score: 92%</Badge>
                       </div>
                       
                       <div className={`p-4 rounded-xl border opacity-70 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center gap-3">
                             <FileText className="h-6 w-6 text-emerald-500" />
                             <div>
                                <h4 className="font-semibold text-sm">Assignment: Basic Sentences</h4>
                                <p className={`text-xs ${textMuted}`}>Submitted on Oct 12</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Module 2: Current/Pending */}
                    <div className="relative">
                       <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-sm ring-offset-2 ring-offset-indigo-50 dark:ring-offset-slate-900">
                          <CircleDot className="h-3 w-3 text-white" />
                       </span>
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">Module 2: Advanced Structuring</h3>
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 shadow-none animate-pulse">Pending</Badge>
                       </div>
                       <p className={`text-sm mb-5 ${textMuted}`}>Focus on structural coherence based on your last 3 low-scoring submissions.</p>
                       
                       <div className={`p-5 rounded-2xl border shadow-sm ${isDark ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-white border-indigo-100'} space-y-5`}>
                          <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                   <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                   <h4 className="font-bold text-sm tracking-tight">Assignment: Argumentative Essay</h4>
                                   <p className={`text-xs mt-0.5 ${textMuted}`}>Min passing score: 75% • Est. Time: 25m</p>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex gap-3">
                             <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-md transition-all active:scale-95">
                                <PlayCircle className="h-4 w-4 mr-2"/> Start Assignment
                             </Button>
                             <Button variant="outline" className={`flex-1 shrink-0 ${isDark?'border-slate-700 bg-slate-800 text-slate-500':'bg-gray-50 text-gray-400'}`} disabled>
                                Submit Assignment
                             </Button>
                          </div>
                       </div>
                    </div>

                    {/* Module 3: Locked */}
                    <div className="relative opacity-60">
                       <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center ring-4 ring-white dark:ring-slate-900" />
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">Module 3: Vocabulary Expansion</h3>
                          <Badge variant="outline" className={`border-slate-300 text-slate-500 ${isDark?'border-slate-700 bg-slate-800':''}`}>Locked</Badge>
                       </div>
                       <p className={`text-sm ${textMuted}`}>Unlock this module by reaching the performance threshold in Module 2.</p>
                       
                       <div className={`mt-4 p-4 rounded-xl border opacity-50 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center gap-3">
                             <FileText className="h-6 w-6 text-slate-400" />
                             <div>
                                <h4 className="font-semibold text-sm">Assignment: Vocabulary Quiz</h4>
                                <p className={`text-xs ${textMuted}`}>Requires Mod 2 completion</p>
                             </div>
                          </div>
                       </div>
                    </div>

                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. Visual Analytics & Gamification */}
          <TabsContent value="analytics" className="mt-4 outline-none">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Gamification Sidebar */}
                <div className="md:col-span-1 space-y-6">
                   <Card className={`rounded-2xl border-0 bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg overflow-hidden relative`}>
                     <div className="absolute -right-4 -top-4 opacity-10"><Trophy className="h-32 w-32"/></div>
                     <CardContent className="p-6">
                        <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-1">Total Points</p>
                        <h3 className="text-4xl font-black mb-4">1,250<span className="text-lg font-bold text-indigo-200 ml-1">XP</span></h3>
                        <div className="space-y-3">
                           <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-semibold">Top 5% Performer</span>
                           </div>
                           <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                              <Zap className="h-4 w-4 text-orange-400 fill-orange-400" />
                              <span className="text-sm font-semibold">12 Day Streak!</span>
                           </div>
                        </div>
                     </CardContent>
                   </Card>
                </div>

                {/* Charts */}
                <div className="md:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <Card className={`rounded-2xl shadow-sm ${cardClasses}`}>
                      <CardHeader><CardTitle className="text-base text-center">Skill Proficiency Matrix</CardTitle></CardHeader>
                      <CardContent>
                         <div className="h-[250px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                               <PolarGrid stroke={isDark?"#334155":"#e2e8f0"} />
                               <PolarAngleAxis dataKey="subject" tick={{fill: isDark?'#94a3b8':'#64748b', fontSize: 12}} />
                               <Radar name="Student" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                             </RadarChart>
                           </ResponsiveContainer>
                         </div>
                      </CardContent>
                   </Card>

                   <Card className={`rounded-2xl shadow-sm ${cardClasses}`}>
                      <CardHeader><CardTitle className="text-base">Weekly Growth Trend</CardTitle></CardHeader>
                      <CardContent>
                         <div className="h-[250px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={historyData} margin={{top:10, right:10, left:-20, bottom:0}}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark?"#334155":"#e2e8f0"} />
                                 <XAxis dataKey="day" tick={{fill: isDark?'#94a3b8':'#64748b'}} axisLine={false} tickLine={false} />
                                 <YAxis tick={{fill: isDark?'#94a3b8':'#64748b'}} domain={[50, 100]} axisLine={false} tickLine={false} />
                                 <RechartsTooltip contentStyle={{backgroundColor:isDark?'#1e293b':'#fff', borderRadius:'8px', border:'none'}} />
                                 <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} activeDot={{r:8}} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                              </LineChart>
                           </ResponsiveContainer>
                         </div>
                      </CardContent>
                   </Card>
                </div>
             </div>
          </TabsContent>

          {/* 5. Certificate Generator */}
          <TabsContent value="certificate" className="mt-4 outline-none">
             <div className="max-w-3xl mx-auto">
                <Card className={`rounded-2xl shadow-sm ${cardClasses} p-2`}>
                   <div className="border-[8px] border-double border-amber-200 dark:border-amber-900/30 rounded-xl p-8 md:p-16 text-center bg-amber-50/50 dark:bg-amber-950/10 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-100 dark:bg-amber-900/30 rounded-br-full opacity-50"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-100 dark:bg-amber-900/30 rounded-tl-full opacity-50"></div>
                      
                      <Award className="h-16 w-16 text-amber-500 mx-auto mb-6" />
                      <h2 className={`text-4xl md:text-5xl font-black mb-4 uppercase tracking-widest ${isDark?'text-slate-100':'text-slate-900'}`} style={{fontFamily: 'serif'}}>Certificate of Excellence</h2>
                      <p className={`text-lg mb-8 font-serif italic ${textMuted}`}>This is proudly presented to</p>
                      <p className="text-3xl font-bold border-b-2 border-slate-300 dark:border-slate-700 inline-block px-12 pb-2 mb-8" style={{fontFamily: 'cursive'}}>Aisha Rahman</p>
                      <p className={`text-sm md:text-base leading-relaxed max-w-lg mx-auto font-medium ${isDark?'text-slate-300':'text-gray-700'}`}>
                         For outstanding performance and achieving top 5% proficiency in advanced AI-evaluated modules, demonstrating critical thinking and exceptional language mastery.
                      </p>
                      <div className="mt-16 flex justify-between items-end px-4 md:px-12">
                         <div className="text-center">
                            <div className="w-32 border-b-2 border-slate-400 dark:border-slate-600 mb-2"></div>
                            <p className={`text-xs font-bold uppercase ${textMuted}`}>AI Director</p>
                         </div>
                         <div className="text-center">
                            <div className="w-32 border-b-2 border-slate-400 dark:border-slate-600 mb-2"></div>
                            <p className={`text-xs font-bold uppercase ${textMuted}`}>Date Issued</p>
                         </div>
                      </div>
                   </div>
                </Card>
                <div className="flex justify-center gap-4 mt-8">
                   <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 px-6 rounded-xl h-12 shadow-md dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
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
        <div className={`mt-10 p-5 text-center flex items-center justify-center gap-3 rounded-xl border border-dashed ${isDark ? 'border-indigo-900/50 bg-indigo-950/20 text-indigo-300' : 'border-indigo-200 bg-indigo-50/50 text-indigo-600'} text-xs font-semibold uppercase tracking-wider`}>
           <ShieldAlert className="h-4 w-4" />
           This analysis is generated by AI and is designed to be unbiased and fair.
        </div>

      </div>

      {/* Floating Doubt Solver Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div initial={{opacity:0, y:20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:20, scale:0.95}} className="mb-4">
              <Card className={`w-[340px] md:w-[380px] shadow-2xl border-0 overflow-hidden ${isDark ? 'bg-slate-900 ring-1 ring-slate-800' : 'bg-white'}`}>
                <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-5 w-5"/> AI Doubt Solver</CardTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20 rounded-full" onClick={() => setIsChatOpen(false)}>
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className={`p-4 h-[350px] overflow-y-auto space-y-4 ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
                  {chatMsgs.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-[85%] text-[13px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-teal-600 text-white rounded-br-sm' : isDark ? 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}`}>
                         {m.text}
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className={`p-3 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'bg-white'}`}>
                  <form onSubmit={sendChat} className="flex gap-2 w-full">
                    <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask why your score was low..." className={`flex-1 px-3 py-2 text-sm rounded-xl outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100 border-0'}`} />
                    <Button type="submit" size="icon" className="shrink-0 bg-teal-600 hover:bg-teal-700 rounded-xl" disabled={!chatInput.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        {!isChatOpen && (
          <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl bg-teal-600 hover:bg-teal-700" onClick={() => setIsChatOpen(true)}>
             <HelpCircle className="h-6 w-6 text-white" />
          </Button>
        )}
      </div>

      <StudentProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* 🌟 Feedback Modal Overlay */}
      <AnimatePresence>
         {isReviewModalOpen && selectedHistoryItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm px-4">
               <motion.div initial={{opacity:0, scale:0.95, y:20}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:20}} className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900 border border-slate-800 text-slate-200' : 'bg-white text-gray-900'}`}>
                  <div className={`p-5 flex justify-between items-center border-b ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-gray-100 bg-gray-50'}`}>
                     <div>
                        <h3 className="font-bold flex items-center gap-2 text-lg"><History className="h-5 w-5 text-blue-500"/> Sub ID: {selectedHistoryItem.id}</h3>
                        <p className={`text-xs mt-1 ${textMuted}`}>{selectedHistoryItem.topic} • {selectedHistoryItem.date}</p>
                     </div>
                     <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsReviewModalOpen(false)}>
                        <XCircle className="h-6 w-6 text-slate-400 hover:text-red-500 transition-colors"/>
                     </Button>
                  </div>
                  <div className="p-6 space-y-6">
                     <div className={`flex justify-between items-center p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-gray-100'}`}>
                        <div className="text-center w-1/4 border-r border-slate-200 dark:border-slate-800">
                           <span className="block text-3xl font-black text-indigo-600 dark:text-indigo-400">{selectedHistoryItem.score}%</span>
                           <span className="text-xs font-bold uppercase text-slate-500">Overall</span>
                        </div>
                        <div className="text-center w-1/4">
                           <span className="block text-xl font-bold">8.5</span>
                           <span className="text-xs font-bold uppercase text-slate-500">Content</span>
                        </div>
                        <div className="text-center w-1/4">
                           <span className="block text-xl font-bold">6.0</span>
                           <span className="text-xs font-bold uppercase text-slate-500">Structure</span>
                        </div>
                        <div className="text-center w-1/4">
                           <span className="block text-xl font-bold">7.0</span>
                           <span className="text-xs font-bold uppercase text-slate-500">Grammar</span>
                        </div>
                     </div>
                     <div>
                        <h4 className="text-xs tracking-wider font-bold uppercase mb-3 text-slate-500">Submitted Answer</h4>
                        <div className={`p-4 rounded-xl text-sm leading-relaxed border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                           The mitochondria is the <span className="text-red-500 font-medium border-b-2 border-red-500 cursor-help" title="Feedback: Cliché. Use 'primary energy generator'">powerhouse</span> of the cell... it <span className="text-yellow-500 font-medium border-b-2 border-yellow-500 cursor-help" title="Feedback: Grammar Subject-verb mismatch">make</span> energy.
                        </div>
                     </div>
                     <div>
                        <h4 className="text-xs tracking-wider font-bold uppercase mb-3 text-slate-500">AI Detailed Feedback</h4>
                        <ul className="space-y-3 text-sm">
                           <li className="flex gap-3 items-start"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0"/> Good core understanding of the topic and cell functions.</li>
                           <li className="flex gap-3 items-start"><AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0"/> Multiple grammatical errors detected (Subject-verb discord).</li>
                           <li className="flex gap-3 items-start"><AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0"/> Structure could be improved using P.E.E.L method to organize paragraphs.</li>
                        </ul>
                     </div>
                  </div>
                  <div className={`p-4 border-t flex justify-end gap-3 ${isDark ? 'border-slate-800 bg-slate-800/50' : 'bg-gray-50 border-gray-100'}`}>
                     <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-gray-200 px-6 rounded-xl" onClick={() => setIsReviewModalOpen(false)}>Close Review</Button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}

// Dummy lucide icons needed that weren't imported standardly
function Key(props:any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>; }
function PenTool(props:any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>; }
function CircleDot(props:any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></svg>; }
