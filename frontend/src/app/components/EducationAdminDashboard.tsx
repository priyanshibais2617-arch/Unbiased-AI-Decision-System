import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users, FileText, AlertCircle,
  Search, Clock, Bell, GraduationCap,
  Shield, Activity, CheckCircle2,
  AlertTriangle, CheckSquare, Download, Loader2,
  ArrowLeft, History, Trophy, Book, RefreshCw, X, Eye, StickyNote, CheckCheck, MessageSquare,
  ChevronDown
} from "lucide-react";
import { AdminProfileDrawer, AdminProfileConfig } from "./AdminProfileDrawer";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUser } from "./UserContext";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend
} from "recharts";
import { apiFetch } from "../api";

// ─── Inline Toast ─────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success"|"info"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl text-white font-black shadow-xl shadow-teal-500/20 text-sm ${
        type === "success" ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-teal-600 to-blue-600"
      }`}
    >
      <CheckCircle2 className="h-5 w-5 shrink-0" />
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </motion.div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Student {
  id: number;
  name: string;
  course: string;
  performance: string;
  score: number;
  action: string;
}

interface Evaluation {
  id: string;
  studentName: string;
  course: string;
  assignmentName: string;
  submittedTime: string;
  evaluatedTime?: string;
  completedTime?: string;
  status: 'Pending' | 'Evaluated' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  score?: number;
  evaluationType?: 'AI' | 'Manual';
}

// ─── Static data ──────────────────────────────────────────────────────────────
const STUDENTS: Student[] = [
  { id: 1, name: "Aarav Sharma",  course: "Computer Science", performance: "Excellent", score: 92, action: "Keep monitoring progress" },
  { id: 2, name: "Priya Patel",   course: "Data Science",     performance: "Good",      score: 78, action: "Encourage advanced topics" },
  { id: 3, name: "Rohan Kumar",   course: "Machine Learning", performance: "At Risk",   score: 45, action: "Schedule counselling session" },
  { id: 4, name: "Sneha Gupta",   course: "Computer Science", performance: "Average",   score: 65, action: "Assign extra practice modules" },
  { id: 5, name: "Kabir Singh",   course: "Data Science",     performance: "Critical",  score: 32, action: "Immediate intervention required" },
];

const ACTIVITY_DATA = [
  { day: "Mon", submissions: 120, activeStudents: 450, evaluations: 110 },
  { day: "Tue", submissions: 250, activeStudents: 520, evaluations: 180 },
  { day: "Wed", submissions: 340, activeStudents: 610, evaluations: 280 },
  { day: "Thu", submissions: 280, activeStudents: 580, evaluations: 260 },
  { day: "Fri", submissions: 420, activeStudents: 690, evaluations: 350 },
  { day: "Sat", submissions: 80,  activeStudents: 210, evaluations: 120 },
  { day: "Sun", submissions: 50,  activeStudents: 180, evaluations: 90  },
];

const SUBJECT_SCORES = [
  { subject: "Data Structures",  score: 85 },
  { subject: "Machine Learning", score: 72 },
  { subject: "Physics",          score: 65 },
  { subject: "AI Ethics",        score: 90 },
];

const INITIAL_EVALUATIONS: Evaluation[] = [
  { id: "EV-001", studentName: "Rohan Kumar", course: "Machine Learning", assignmentName: "Neural Networks Basics", submittedTime: "10 min ago", status: "Pending", priority: "High" },
  { id: "EV-002", studentName: "Sneha Gupta", course: "Computer Science", assignmentName: "Data Structures Lab 4", submittedTime: "25 min ago", status: "Pending", priority: "Medium" },
  { id: "EV-003", studentName: "Kabir Singh", course: "Data Science", assignmentName: "Statistical Analysis", submittedTime: "1 hour ago", status: "Pending", priority: "High" },
  { id: "EV-004", studentName: "Aarav Sharma", course: "Computer Science", assignmentName: "Algorithm Design", submittedTime: "3 hours ago", evaluatedTime: "2 hours ago", status: "Evaluated", priority: "Low", score: 88, evaluationType: "AI" },
  { id: "EV-005", studentName: "Priya Patel", course: "Data Science", assignmentName: "Python for Data Science", submittedTime: "5 hours ago", evaluatedTime: "4 hours ago", status: "Evaluated", priority: "Medium", score: 76, evaluationType: "Manual" },
  { id: "EV-006", studentName: "Ananya Iyer", course: "Computer Science", assignmentName: "Operating Systems", submittedTime: "Yesterday", evaluatedTime: "Yesterday", completedTime: "Today", status: "Completed", priority: "Low", score: 92, evaluationType: "AI" },
];

const INITIAL_RECENT_ACTIVITY = [
  { id: 1, title: "Assignment Submitted",    time: "10 min ago",  icon: FileText,     status: "completed" },
  { id: 2, title: "AI Evaluation Completed", time: "1 hour ago",  icon: CheckCircle2, status: "completed" },
  { id: 3, title: "System Update: Sync",     time: "2 hours ago", icon: RefreshCw,    status: "info"      },
  { id: 4, title: "Batch Grading Pending",   time: "4 hours ago", icon: Clock,        status: "pending"   },
];

const INSIGHTS = { averageMarks: 72, topPerformers: 145, atRisk: 32, dropoutRisk: 8 };

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Excellent: "bg-green-100 text-green-700",
    Good:      "bg-blue-100 text-blue-700",
    Average:   "bg-slate-100 text-slate-600",
    "At Risk": "bg-yellow-100 text-yellow-700",
    Critical:  "bg-red-100 text-red-700",
  };
  return (
    <Badge className={`border-none px-2.5 py-1 text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function EducationAdminDashboard() {
  const navigate = useNavigate();
  const { setUserRole } = useUser();

  // Core modals
  const [searchTerm,      setSearchTerm]      = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reviewedIds,     setReviewedIds]     = useState<number[]>([]);

  // Evaluation Queue states
  const [showEvalQueue, setshowEvalQueue] = useState(false);
  const [activeEvalTab, setActiveEvalTab] = useState<'Pending' | 'Evaluated' | 'Completed'>('Pending');
  const [evaluations, setEvaluations] = useState<Evaluation[]>(INITIAL_EVALUATIONS);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [showEvalDetailModal, setShowEvalDetailModal] = useState(false);
  const [showManualReviewModal, setShowManualReviewModal] = useState(false);
  const [manualScore, setManualScore] = useState("");
  const [manualFeedback, setManualFeedback] = useState("");
  const [isGrading, setIsGrading] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState(INITIAL_RECENT_ACTIVITY);

  useEffect(() => {
    apiFetch("/admin/service-analyses?service_type=education")
      .then((response) => {
        const analyses = Array.isArray(response.data) ? response.data : [];
        if (!analyses.length) return;
        const mapped = analyses.slice(0, 50).map((item: any, index: number): Evaluation => {
          const result = item.result || {};
          const email = item.created_by || `student${index + 1}@example.com`;
          const studentName = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
          const score = Number(result.score || 0);
          return {
            id: `EV-AI-${String(index + 1).padStart(3, "0")}`,
            studentName,
            course: "AI Education System",
            assignmentName: "Uploaded Assignment Analysis",
            submittedTime: "Backend analysis",
            evaluatedTime: "Just now",
            status: "Evaluated",
            priority: score < 50 ? "High" : score < 75 ? "Medium" : "Low",
            score,
            evaluationType: "AI",
          };
        });
        setEvaluations(mapped);
        setRecentActivity(mapped.slice(0, 10).map((evaluation, index) => ({
          id: index + 1,
          title: `Real AI Evaluation: ${evaluation.studentName}`,
          time: "Backend analysis",
          icon: CheckCircle2,
          status: "completed",
        })));
      })
      .catch(() => showToast("Could not load real education analyses", "info"));
  }, []);

  // Dynamic stats
  const pendingCount = evaluations.filter(e => e.status === "Pending").length;
  const evaluatedCount = evaluations.filter(e => e.status === "Evaluated" || e.status === "Completed").length;
  const assignmentStats = { 
    total: 1250, 
    pendingDev: 340 + pendingCount, 
    autoGraded: 850 + evaluations.filter(e => e.status === "Evaluated").length, 
    manualGraded: 60 + evaluations.filter(e => e.status === "Completed").length 
  };

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success"|"info" } | null>(null);
  const showToast = (msg: string, type: "success"|"info" = "success") => setToast({ msg, type });

  // Profile drawer
  const [profileOpen, setProfileOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleBackToHome = () => {
    setIsExiting(true);
    setTimeout(() => navigate("/"), 400);
  };

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("eduAdminProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleUpdateProfile = (newData: any) => {
    const updated = { ...profile, ...newData };
    setProfile(updated);
    localStorage.setItem("eduAdminProfile", JSON.stringify(updated));
  };

  // Notification panel
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "1", text: "New assignment submitted", sub: "Rohan Kumar submitted DS Assignment 3.", time: "10 min ago", read: false },
    { id: "2", text: "Pending evaluations increased", sub: "340 assignments are now awaiting AI evaluation.", time: "1 hr ago", read: false },
    { id: "3", text: "Student report generated", sub: "Batch report for Computer Science Dept generated.", time: "2 hrs ago", read: true },
    { id: "4", text: "AI evaluation completed", sub: "850 assignments auto-graded successfully.", time: "3 hrs ago", read: true },
  ]);

  const EDU_ADMIN_CONFIG: AdminProfileConfig = {
    type: "education",
    name: profile?.fullName || profile?.name || "Dr. Aristhaman Sahai",
    initials: (profile?.fullName || profile?.name || "AS").split(" ").map((n: string) => n[0]).join("").slice(0, 2),
    email: profile?.email || "sahai.aris@edu.gov.in",
    role: profile?.adminRole || profile?.role || "Education Director",
    gradientHeader: "bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700",
    accentColor: "emerald",
    aiTag: "AI Fairness Engine Active",
    profileInfo: [
      { label: "Institution",  value: profile?.orgName || "Ministry of Education", span: true },
      { label: "Department",   value: profile?.department || "Higher Education" },
      { label: "Role",         value: profile?.adminRole || profile?.role || "Director" },
      { label: "Employee ID",  value: profile?.employeeId || "EDU-2024-089" },
      { label: "Experience",   value: (profile?.yearsOfExperience ? `${profile.yearsOfExperience} Years` : "12+ Years") },
    ],
    metrics: [
      { label: "Reviewed",    value: "1,420", color: "emerald" },
      { label: "Bias Alerts", value: "3",     color: "amber" },
      { label: "Fairness",    value: "98.2%", color: "blue" },
    ],
    notifications: [
      { id: "1", text: "New admissions request",  sub: "342 candidates awaiting review.",           time: "2 hrs ago", read: false },
      { id: "2", text: "Fairness alert triggered", sub: "Discrepancy found in scholarship module.", time: "5 hrs ago", read: false },
      { id: "3", text: "System update",            sub: "AI Fairness Engine v2.4 deployed.",        time: "1 day ago", read: true },
    ],
    settingsLabel: "Education Settings",
    settingsItems: [
      { key: "autoReview",  label: "Auto-Review",       desc: "Enable AI for initial screening" },
      { key: "biasCheck",   label: "Strict Bias Check", desc: "Flag minor discrepancies" },
      { key: "notifs",      label: "Email Notifs",      desc: "Receive alerts via email" },
      { key: "auditLog",    label: "Audit Logging",     desc: "Keep detailed history" },
    ],
  };

  // Student Notes
  const [studentNotes,   setStudentNotes]   = useState<Record<number, string>>({});
  const [noteTimes,      setNoteTimes]      = useState<Record<number, string>>({});
  const [showNoteModal,  setShowNoteModal]  = useState(false);
  const [noteTarget,     setNoteTarget]     = useState<Student | null>(null);
  const [noteText,       setNoteText]       = useState("");
  const [viewNoteTarget, setViewNoteTarget] = useState<Student | null>(null);

  // Policy download loading
  const [policyDownloading, setPolicyDownloading] = useState(false);

  const handleLogout = () => { setUserRole(null); navigate("/"); };

  const atRiskStudents   = STUDENTS.filter(s => s.performance === "At Risk" || s.performance === "Critical");
  const filteredStudents = STUDENTS.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleReviewed = (id: number) =>
    setReviewedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Open note modal
  const openNoteModal = (student: Student) => {
    setNoteTarget(student);
    setNoteText(studentNotes[student.id] ?? "");
    setShowNoteModal(true);
  };

  // Save note
  const saveNote = () => {
    if (!noteTarget || !noteText.trim()) return;
    const isEdit = !!studentNotes[noteTarget.id];
    setStudentNotes(prev => ({ ...prev, [noteTarget.id]: noteText.trim() }));
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setNoteTimes(prev => ({ ...prev, [noteTarget.id]: now }));
    showToast(isEdit ? "Note updated successfully" : "Note added successfully");
    setShowNoteModal(false);
  };

  // Download Policy
  const handleDownloadPolicy = () => {
    setPolicyDownloading(true);
    setTimeout(() => {
      const lines = [
        "AI FAIRNESS POLICY",
        "Unbiased AI Decision System — Education Module",
        "=".repeat(55),
        "",
        "1. UNBIASED DATASETS",
        "   AI models are trained exclusively on verified, diverse, and balanced",
        "   academic datasets with no demographic skew.",
        "",
        "2. NO SENSITIVE ATTRIBUTES",
        "   No personal attributes such as gender, religion, caste, or",
        "   socioeconomic status are used in any scoring or evaluation decision.",
        "",
        "3. TRANSPARENT SCORING SYSTEM",
        "   Every AI-generated score is accompanied by an explainable breakdown",
        "   that faculty can audit and override at any time.",
        "",
        "4. HUMAN REVIEW AVAILABLE",
        "   All flagged or borderline cases are escalated for mandatory human",
        "   review before any final decision is recorded.",
        "",
        "5. REGULAR BIAS AUDITS",
        "   The system undergoes quarterly third-party audits to detect and",
        "   mitigate any emerging bias patterns.",
        "",
        "=".repeat(55),
        `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        "Unbiased AI Decision System — Confidential",
      ];
      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "AI_Fairness_Policy.txt";
      a.click();
      URL.revokeObjectURL(url);
      setPolicyDownloading(false);
      showToast("Policy downloaded successfully");
    }, 1500);
  };

  const handleAutoGrade = (evalId: string) => {
    setIsGrading(evalId);
    setTimeout(() => {
      setEvaluations(prev => prev.map(e => e.id === evalId ? { 
        ...e, 
        status: "Evaluated", 
        score: Math.floor(Math.random() * 20) + 75, 
        evaluationType: "AI",
        evaluatedTime: "Just now" 
      } : e));
      setIsGrading(null);
      showToast("Evaluation completed by AI", "success");
    }, 2000);
  };

  const handleManualReviewSubmit = () => {
    if (!selectedEval || !manualScore) return;
    setEvaluations(prev => prev.map(e => e.id === selectedEval.id ? { 
      ...e, 
      status: "Evaluated", 
      score: parseInt(manualScore), 
      evaluationType: "Manual",
      evaluatedTime: "Just now" 
    } : e));
    showToast("Manual evaluation saved", "success");
    setShowManualReviewModal(false);
    setManualScore("");
    setManualFeedback("");
  };

  const handleMarkCompleted = (evalId: string) => {
    const evaluation = evaluations.find(e => e.id === evalId);
    if (!evaluation) return;
    setEvaluations(prev => prev.map(e => e.id === evalId ? { 
      ...e, 
      status: "Completed",
      completedTime: "Just now"
    } : e));
    
    // Add to recent activity
    const newActivity = {
      id: Date.now(),
      title: `Evaluation Completed: ${evaluation.studentName}`,
      time: "Just now",
      icon: CheckCircle2,
      status: "completed"
    };
    setRecentActivity(prev => [newActivity, ...prev]);
    showToast("Evaluation marked as completed", "success");
  };

  const handleReevaluate = (evalId: string) => {
    setEvaluations(prev => prev.map(e => e.id === evalId ? { 
      ...e, 
      status: "Pending",
      score: undefined,
      evaluationType: undefined,
      evaluatedTime: undefined
    } : e));
    showToast("Item moved back to pending for re-evaluation", "info");
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 text-slate-900 pb-12 font-sans"
      onClick={() => { setProfileOpen(false); setNotifOpen(false); }}
    >

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 py-3 max-w-[1600px] flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Back Button with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleBackToHome}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group border border-slate-200"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-900 text-white font-bold text-[10px] py-1 px-2 rounded-lg shadow-xl">
                  Back to Home
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#14B8A6] to-[#10B981] rounded-lg shadow-lg shadow-teal-500/20">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">Education Control Center</h1>
              <p className="text-xs text-slate-500 font-medium">Academic monitoring &amp; performance tracking</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>

            {/* Bell with notification dropdown */}
            <div className="relative">
              <Button variant="ghost" size="icon"
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-xl relative h-10 w-10"
              >
                <Bell className="h-5 w-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </Button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-teal-500" /> Notifications
                        {notifications.some(n => !n.read) && (
                          <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 font-bold">
                            {notifications.filter(n => !n.read).length}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                          className="text-[11px] font-bold text-teal-600 hover:text-teal-800 transition-colors">Mark all read</button>
                        <span className="text-slate-300 text-xs">|</span>
                        <button onClick={() => setNotifications([])}
                          className="text-[11px] font-bold text-slate-500 hover:text-red-600 transition-colors">Clear all</button>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-400 font-medium">No notifications available</div>
                      ) : notifications.map(n => (
                        <div key={n.id}
                          onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                          className={`p-3 flex gap-3 hover:bg-teal-50/30 transition-colors cursor-pointer ${n.read ? "opacity-60" : ""}`}
                        >
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.read ? "bg-slate-100" : "bg-teal-50"}`}>
                            <Bell className={`h-4 w-4 ${n.read ? "text-slate-400" : "text-teal-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 leading-tight">{n.text}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">{n.sub}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">{n.time}</p>
                          </div>
                          {!n.read && <div className="h-2 w-2 bg-red-500 rounded-full shrink-0 mt-1.5" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden md:block mx-1" />

            {/* Circular profile avatar → opens drawer */}
            <button
              onClick={e => { e.stopPropagation(); setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="relative h-10 w-10 rounded-full focus:outline-none group"
              title="Aisha Rahman – Academic Coordinator"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                  {EDU_ADMIN_CONFIG.initials}
                </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-white" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!showEvalQueue ? (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 lg:px-8 py-8 max-w-[1600px] space-y-6"
          >

        {/* ── OVERVIEW CARDS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Students",        value: "2,450", icon: Users,     bg: "bg-teal-50",   ic: "text-teal-600"   },
            { label: "Assignments Submitted",  value: "1,250", icon: FileText,  bg: "bg-emerald-50", ic: "text-emerald-600" },
            { label: "Pending Evaluations",   value: (340 + pendingCount).toString(),   icon: Clock,     bg: "bg-amber-50", ic: "text-amber-600" },
            { label: "Average Score",         value: "72%",   icon: Activity,  bg: "bg-teal-50",  ic: "text-teal-600"  },
          ].map(card => (
            <Card key={card.label} className="bg-white border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 ${card.bg} group-hover:opacity-80 transition-colors rounded-xl shrink-0`}>
                  <card.icon className={`h-6 w-6 ${card.ic}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-6">

            {/* System Activity Chart */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-xl flex flex-col h-[400px]">
              <CardHeader className="border-b border-slate-100 p-6 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight uppercase">
                  <Activity className="h-5 w-5 text-teal-600" /> System Activity
                </CardTitle>
                <select className="bg-slate-50 text-sm font-black text-slate-600 border border-slate-200 rounded-xl px-4 py-2 outline-none hover:border-teal-300 transition-colors cursor-pointer">
                  <option>Last 7 Days</option><option>Last 30 Days</option>
                </select>
              </CardHeader>
              <CardContent className="p-6 pt-4 flex-1 flex flex-col min-h-[0]">
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ACTIVITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSub"  x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#14B8A6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}   />
                        </linearGradient>
                        <linearGradient id="colorEval" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day"  tick={{ fill:"#64748B", fontSize:13, fontWeight:500 }} axisLine={false} tickLine={false} dy={10}  />
                      <YAxis tick={{ fill:"#64748B", fontSize:13, fontWeight:500 }} axisLine={false} tickLine={false} dx={-10} />
                      <RechartsTooltip contentStyle={{ backgroundColor:"#FFF", border:"1px solid #E2E8F0", borderRadius:"8px", fontWeight:500, fontSize:"13px", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize:"13px", fontWeight:500, paddingTop:"10px" }} />
                      <Area type="monotone" dataKey="submissions" name="Assignments Submitted" stroke="#14B8A6" strokeWidth={4} fill="url(#colorSub)"  />
                      <Area type="monotone" dataKey="evaluations" name="Evaluations Completed" stroke="#10B981" strokeWidth={4} fill="url(#colorEval)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Top Performers */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200">
                <CardHeader className="p-6 pb-4 border-b border-teal-50">
                  <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Trophy className="h-5 w-5 text-teal-600" /> Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {STUDENTS.filter(s => s.performance === "Excellent" || s.performance === "Good").map((student, idx) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-teal-50/50 hover:bg-teal-50 transition-all rounded-2xl border border-teal-100/50 group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#10B981] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform">{idx + 1}</div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 line-clamp-1">{student.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{student.course}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">{student.score}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Subject Averages */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200">
                <CardHeader className="p-6 pb-4 border-b border-emerald-50">
                  <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Book className="h-5 w-5 text-emerald-600" /> Subject Averages
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 pt-1">
                    {SUBJECT_SCORES.map(sub => (
                      <div key={sub.subject} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{sub.subject}</span>
                          <span className="font-bold text-slate-900">{sub.score}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div className={`h-full transition-all duration-700 rounded-full ${sub.score < 70 ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"}`} style={{ width: `${sub.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Students Requiring Attention */}
              <Card className="bg-white border-slate-200 shadow-sm rounded-xl md:col-span-2 hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-rose-50 rounded-2xl shrink-0 border border-rose-100 shadow-sm">
                      <AlertTriangle className="h-8 w-8 text-rose-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">Attention Required</h4>
                      <p className="text-sm font-bold text-slate-500 mt-1">Students needing immediate academic intervention</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                    <p className="text-5xl font-black text-rose-600 tabular-nums">{INSIGHTS.atRisk}</p>
                    <Button variant="outline" onClick={() => setShowReviewModal(true)}
                      className="w-full sm:w-auto border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 font-black transition-all gap-2 h-12 px-6 rounded-xl shadow-sm hover:shadow-md">
                      <Eye className="h-4 w-4" /> Review Students
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Directory */}
            <Card id="student-directory" className="bg-white border-slate-200 shadow-sm rounded-xl flex flex-col min-h-[300px]">
              <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-500" /> Student Directory
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="Search..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-400 w-[140px] transition-colors font-medium placeholder:font-normal" />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto max-h-[300px]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 z-10 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3 text-center">Course</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map(student => (
                      <tr key={student.id} onClick={() => setSelectedStudent(student)}
                        title="Click to view student details"
                        className={`cursor-pointer transition-colors ${
                          student.performance === "At Risk"   ? "hover:bg-yellow-50"
                          : student.performance === "Critical" ? "hover:bg-red-50"
                          : "hover:bg-slate-50"
                        }`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">{student.name}</p>
                            {studentNotes[student.id] && (
                              <span title={`Note: ${studentNotes[student.id]}`}>
                                <MessageSquare className="h-3.5 w-3.5 text-teal-400" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center"><p className="text-xs text-slate-500">{student.course}</p></td>
                        <td className="px-6 py-4 text-center"><StatusBadge status={student.performance} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-sm text-slate-500 font-medium">No students found.</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-6">

            {/* Evaluation Overview */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300">
              <CardHeader className="p-6 pb-4 border-b border-teal-50 flex flex-col items-center">
                <CardTitle className="text-lg font-black text-slate-900 flex justify-center items-center gap-2 uppercase tracking-tight">
                  <CheckSquare className="h-5 w-5 text-teal-600" /> Evaluation Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6 flex flex-col items-center">
                <div className="w-full">
                  <div className="flex justify-between items-end mb-2 w-full">
                    <span className="text-sm font-medium text-slate-600">Auto vs Manual</span>
                    <span className="text-sm font-bold text-slate-900">Total: {assignmentStats.autoGraded + assignmentStats.manualGraded}</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 rounded-full flex overflow-hidden border border-slate-200/50">
                    <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${(assignmentStats.autoGraded  / (assignmentStats.autoGraded + assignmentStats.manualGraded)) * 100}%` }} />
                    <div className="bg-teal-500  h-full transition-all duration-700" style={{ width: `${(assignmentStats.manualGraded / (assignmentStats.autoGraded + assignmentStats.manualGraded)) * 100}%` }} />
                  </div>
                  <div className="flex justify-center mt-6 gap-6 text-sm font-black text-slate-500">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" />Auto-Graded</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal-500"  />Manual</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-center">
                    <p className="text-3xl font-bold text-slate-900">{assignmentStats.autoGraded + assignmentStats.manualGraded}</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">Evaluated</p>
                  </div>
                  <div className="bg-yellow-50 p-5 rounded-xl text-center border border-yellow-100">
                    <p className="text-3xl font-bold text-yellow-800">{assignmentStats.pendingDev}</p>
                    <p className="text-sm font-semibold text-yellow-700 mt-1">Pending</p>
                  </div>
                </div>
                {assignmentStats.pendingDev > 100 && (
                  <div className="text-xs font-semibold text-red-600 flex items-center justify-center gap-1.5 w-full bg-red-50 py-2 rounded-lg border border-red-100">
                    <AlertCircle className="h-4 w-4" /> High pending evaluations – action recommended
                  </div>
                )}
                <Button 
                  onClick={() => { setshowEvalQueue(true); showToast("Evaluation queue opened", "info"); }}
                  className="w-full bg-gradient-to-r from-[#14B8A6] to-[#10B981] hover:from-[#10B981] hover:to-[#14B8A6] text-white font-black py-7 text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-1 transition-all duration-300 rounded-2xl uppercase tracking-wider"
                >
                  Go to Evaluation Queue
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200">
              <CardHeader className="p-6 pb-4 border-b border-teal-50">
                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <History className="h-5 w-5 text-teal-600" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4 relative group">
                      {index !== recentActivity.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-[-24px] w-[2px] bg-slate-100" />
                      )}
                      <div className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        activity.status === "completed" ? "bg-emerald-100 text-emerald-600"
                        : activity.status === "info"    ? "bg-teal-100 text-teal-600"
                        : "bg-amber-100 text-amber-600"
                      }`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="pt-1.5 flex-1 group-hover:-translate-y-0.5 transition-transform">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-slate-200 text-slate-500">{activity.status}</Badge>
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Fairness & Transparency */}
            <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow duration-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="p-6 pb-4 border-b border-emerald-50 bg-emerald-50/10">
                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <Shield className="h-5 w-5 text-emerald-600" /> AI Fairness Check
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <ul className="space-y-4">
                  {[
                    "All evaluations are conducted using unbiased AI models trained on diverse datasets.",
                    "No personal or demographic data is used in grading decisions.",
                    "Human review is available for flagged cases.",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{text}</p>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" onClick={() => setShowPolicyModal(true)}
                  className="w-full border-teal-200 font-black text-teal-700 bg-teal-50 hover:bg-teal-100 hover:border-teal-300 transition-all gap-2 h-12 rounded-xl shadow-sm">
                  <Shield className="h-4 w-4" /> View Detailed Policy
                </Button>
              </CardContent>
            </Card>
          </div>
          </div>
        </motion.main>
      ) : (
        <motion.main
          key="queue"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 lg:px-8 py-8 max-w-[1600px] space-y-6"
        >
          {/* Queue Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Evaluation Queue</h2>
              <p className="text-sm text-slate-500 font-medium">Manage and review pending student assignments</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setshowEvalQueue(false)}
              className="border-slate-200 text-slate-600 font-bold hover:bg-slate-100 gap-2 self-start"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </div>

          {/* Queue Filters */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
            {['Pending', 'Evaluated', 'Completed'].map((tab) => (
              <Badge 
                key={tab}
                onClick={() => setActiveEvalTab(tab as any)}
                className={`px-5 py-2 rounded-xl cursor-pointer transition-all border-none font-black text-xs uppercase tracking-wider ${
                  activeEvalTab === tab ? "bg-gradient-to-r from-[#14B8A6] to-[#10B981] text-white shadow-lg shadow-teal-500/20" : "bg-slate-100/50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {tab === 'Pending' ? 'Pending Queue' : tab}
              </Badge>
            ))}
          </div>

          {/* Queue Table */}
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Course / Assignment</th>
                      {activeEvalTab === 'Pending' && <th className="px-6 py-4">Submitted</th>}
                      {activeEvalTab === 'Evaluated' && <th className="px-6 py-4">Evaluated Time</th>}
                      {activeEvalTab === 'Completed' && <th className="px-6 py-4">Completed Time</th>}
                      {activeEvalTab === 'Pending' && <th className="px-6 py-4">Status</th>}
                      {activeEvalTab === 'Evaluated' && <th className="px-6 py-4">Score</th>}
                      {activeEvalTab === 'Evaluated' && <th className="px-6 py-4">Type</th>}
                      {activeEvalTab === 'Completed' && <th className="px-6 py-4">Final Score</th>}
                      {activeEvalTab === 'Completed' && <th className="px-6 py-4">Status</th>}
                      {activeEvalTab === 'Pending' && <th className="px-6 py-4">Priority</th>}
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {evaluations.filter(e => e.status === activeEvalTab).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                          No records found in this category.
                        </td>
                      </tr>
                    ) : evaluations.filter(e => e.status === activeEvalTab).map((ev) => (
                      <tr key={ev.id} className={`group transition-colors ${ev.status === 'Pending' ? 'bg-teal-50/20 hover:bg-teal-50/40' : 'hover:bg-slate-50/50'}`}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{ev.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">{ev.id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-700">{ev.course}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{ev.assignmentName}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {activeEvalTab === 'Pending' ? ev.submittedTime : activeEvalTab === 'Evaluated' ? ev.evaluatedTime : ev.completedTime}
                        </td>
                        
                        {activeEvalTab === 'Pending' && (
                          <td className="px-6 py-4">
                            <Badge className="bg-amber-100 text-amber-700 border-none rounded-full px-3 py-0.5 text-[10px] font-bold">
                              {ev.status}
                            </Badge>
                          </td>
                        )}

                          <td className="px-6 py-4">
                            <span className={`font-black text-sm ${ev.score && ev.score >= 80 ? "text-emerald-600" : "text-teal-600"}`}>
                              {ev.score}%
                            </span>
                          </td>

                        {activeEvalTab === 'Evaluated' && (
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="border-slate-200 text-slate-500 text-[10px] font-bold">
                              {ev.evaluationType === 'AI' ? 'AI Evaluated' : 'Manual Evaluated'}
                            </Badge>
                          </td>
                        )}

                          <td className="px-6 py-4">
                            <Badge className="bg-emerald-100 text-emerald-700 border-none rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tight">
                              Completed
                            </Badge>
                          </td>

                        {activeEvalTab === 'Pending' && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${
                                ev.priority === 'High' ? 'bg-red-500' :
                                ev.priority === 'Medium' ? 'bg-amber-500' :
                                'bg-green-500'
                              }`} />
                              <span className="font-bold text-slate-700">{ev.priority}</span>
                            </div>
                          </td>
                        )}

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Actions for Pending */}
                            {activeEvalTab === 'Pending' && (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={() => { setSelectedEval(ev); setShowEvalDetailModal(true); }} className="h-8 w-8 rounded-lg hover:bg-white border border-slate-200">
                                        <Eye className="h-4 w-4 text-slate-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs">Review</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" size="icon" disabled={isGrading === ev.id} onClick={() => handleAutoGrade(ev.id)}
                                        className="h-8 w-8 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-100"
                                      >
                                        {isGrading === ev.id ? <Loader2 className="h-4 w-4 animate-spin text-green-600" /> : <RefreshCw className="h-4 w-4 text-green-600" />}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs">Auto Grade</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button onClick={() => { setSelectedEval(ev); setShowManualReviewModal(true); }} className="h-9 w-9 rounded-xl hover:bg-teal-50 border border-transparent hover:border-teal-100 flex items-center justify-center transition-colors">
                                        <StickyNote className="h-4 w-4 text-teal-600" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-white font-black text-[10px] py-1 px-2 rounded-lg">Manual Review</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}

                            {/* Actions for Evaluated */}
                            {activeEvalTab === 'Evaluated' && (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={() => showToast("Viewing evaluation report...", "info")} className="h-8 w-8 rounded-lg hover:bg-white border border-slate-200">
                                        <FileText className="h-4 w-4 text-slate-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs">View Report</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={() => handleMarkCompleted(ev.id)} className="h-8 w-8 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-100">
                                        <CheckCheck className="h-4 w-4 text-emerald-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs">Mark Completed</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={() => handleReevaluate(ev.id)} className="h-8 w-8 rounded-lg hover:bg-amber-50 border border-transparent hover:border-amber-100">
                                        <RefreshCw className="h-4 w-4 text-amber-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs">Re-evaluate</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}

                            {/* Actions for Completed */}
                            {activeEvalTab === 'Completed' && (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button onClick={() => showToast("Opening certificate...", "info")} className="h-9 w-9 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 flex items-center justify-center transition-colors">
                                        <Trophy className="h-4 w-4 text-emerald-600" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-white font-black text-[10px] py-1 px-2 rounded-lg">View Certificate</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={() => showToast("Downloading report...", "info")} className="h-8 w-8 rounded-lg hover:bg-white border border-slate-200">
                                        <Download className="h-4 w-4 text-slate-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs">Download Report</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.main>
      )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          MODAL: Review Students
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showReviewModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowReviewModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
                onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-5 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-black flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Students Needing Attention</h2>
                    <p className="text-yellow-100 text-sm mt-0.5 font-medium">Showing At Risk and Critical students</p>
                  </div>
                  <button onClick={() => setShowReviewModal(false)} className="rounded-full p-1.5 hover:bg-white/20 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  {atRiskStudents.map(student => {
                    const isReviewed = reviewedIds.includes(student.id);
                    const hasNote    = !!studentNotes[student.id];
                    return (
                      <div key={student.id}
                        className={`rounded-xl border p-4 transition-all ${
                          student.performance === "Critical" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
                        } ${isReviewed ? "opacity-60" : ""}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{student.course}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={student.performance} />
                            <span className="text-sm font-black text-slate-700">{student.score}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 italic mb-3 font-medium">Suggested: {student.action}</p>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost"
                            onClick={() => setSelectedStudent(student)}
                            className="flex-1 h-8 text-xs font-bold border border-slate-200 hover:bg-white gap-1">
                            <Eye className="h-3 w-3" /> View Details
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => toggleReviewed(student.id)}
                            className={`flex-1 h-8 text-xs font-bold gap-1 ${isReviewed ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 border" : "border border-slate-200 hover:bg-white"}`}>
                            {isReviewed ? <><CheckCheck className="h-3 w-3" /> Reviewed</> : <><CheckCircle2 className="h-3 w-3" /> Mark Reviewed</>}
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => openNoteModal(student)}
                            className={`flex-1 h-8 text-xs font-black gap-1 ${hasNote ? "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200 border" : "border border-slate-200 hover:bg-white"}`}>
                            <StickyNote className="h-3 w-3" />
                            {hasNote ? "Edit Note" : "Add Note"}
                          </Button>
                        </div>

                        {/* Note badge + view link */}
                        {hasNote && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[11px] font-black text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full uppercase tracking-tight">
                              <MessageSquare className="h-3 w-3" /> Note Added
                            </span>
                            <button onClick={() => setViewNoteTarget(student)}
                              className="text-[11px] font-black text-slate-500 hover:text-teal-600 transition-colors underline underline-offset-4">
                              View Note
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 pb-4">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold h-10" onClick={() => setShowReviewModal(false)}>Close</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          MODAL: AI Fairness Policy
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPolicyModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowPolicyModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
                onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-[#14B8A6] to-[#10B981] text-white px-6 py-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight"><Shield className="h-5 w-5" /> AI Fairness Policy</h2>
                    <p className="text-teal-50 text-xs mt-1 font-bold">Unbiased evaluation framework</p>
                  </div>
                  <button onClick={() => setShowPolicyModal(false)} className="rounded-full p-1.5 hover:bg-white/20 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
                  {[
                    { title: "Unbiased Datasets",       desc: "AI models are trained exclusively on verified, diverse, and balanced academic datasets with no demographic skew." },
                    { title: "No Sensitive Attributes", desc: "No personal attributes such as gender, religion, caste, or socioeconomic status are used in any scoring or evaluation decision." },
                    { title: "Transparent Scoring",     desc: "Every AI-generated score is accompanied by an explainable breakdown that faculty can audit and override at any time." },
                    { title: "Human Review Available",  desc: "All flagged or borderline cases are escalated for mandatory human review before any final decision is recorded." },
                    { title: "Regular Bias Audits",     desc: "The system undergoes quarterly third-party audits to detect and mitigate any emerging bias patterns." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 flex gap-3 border-t border-slate-100">
                  <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold border-slate-200 gap-2" onClick={() => setShowPolicyModal(false)}>
                    <X className="h-4 w-4" /> Close
                  </Button>
                  <Button
                    onClick={handleDownloadPolicy}
                    disabled={policyDownloading}
                    className="flex-1 h-12 rounded-xl font-black bg-gradient-to-r from-[#14B8A6] to-[#10B981] hover:shadow-lg hover:shadow-teal-500/20 text-white gap-2 disabled:opacity-70 uppercase tracking-wider text-xs">
                    {policyDownloading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                      : <><Download className="h-4 w-4" /> Download Policy</>}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          MODAL: Student Detail
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setSelectedStudent(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100"
                onClick={e => e.stopPropagation()}>
                <div className={`text-white px-6 py-5 flex justify-between items-center ${
                  selectedStudent.performance === "Critical" ? "bg-gradient-to-r from-red-600 to-rose-600"
                  : selectedStudent.performance === "At Risk" ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                  : selectedStudent.performance === "Average" ? "bg-gradient-to-r from-slate-600 to-slate-700"
                  : "bg-gradient-to-r from-[#14B8A6] to-[#10B981]"
                }`}>
                  <div>
                    <h2 className="text-xl font-black">{selectedStudent.name}</h2>
                    <p className="text-white/80 text-sm mt-0.5 font-medium">{selectedStudent.course}</p>
                  </div>
                  <button onClick={() => setSelectedStudent(null)} className="rounded-full p-1.5 hover:bg-white/20 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Status",   value: selectedStudent.performance },
                      { label: "AI Score", value: `${selectedStudent.score}%` },
                      { label: "Course",   value: selectedStudent.course },
                      { label: "Trend",    value: selectedStudent.score > 60 ? "Stable ↑" : "Declining ↓" },
                    ].map(item => (
                      <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Suggested Action</p>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{selectedStudent.action}</p>
                  </div>
                  {studentNotes[selectedStudent.id] && (
                    <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
                      <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Admin Note</p>
                      <p className="text-sm text-slate-700 font-bold leading-relaxed">{studentNotes[selectedStudent.id]}</p>
                      <p className="text-[10px] text-slate-400 mt-3 font-bold italic">Last updated at {noteTimes[selectedStudent.id]}</p>
                    </div>
                  )}
                  <Button className="w-full h-10 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white" onClick={() => setSelectedStudent(null)}>Close</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          MODAL: Add / Edit Student Note
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showNoteModal && noteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setShowNoteModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
                onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-[#14B8A6] to-[#10B981] text-white px-6 py-5 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight"><StickyNote className="h-4 w-4" /> {studentNotes[noteTarget.id] ? "Edit" : "Add"} Student Note</h2>
                    <p className="text-teal-50 text-xs mt-1 font-bold">{noteTarget.name} · {noteTarget.course}</p>
                  </div>
                  <button onClick={() => setShowNoteModal(false)} className="rounded-full p-1.5 hover:bg-white/20 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6">
                  <textarea
                    rows={4}
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Write academic observation, support suggestion, or follow-up note..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 resize-none leading-relaxed"
                  />
                </div>
                <div className="p-4 flex gap-3 border-t border-slate-100">
                  <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold border-slate-200" onClick={() => setShowNoteModal(false)}>Cancel</Button>
                  <Button
                    onClick={saveNote}
                    disabled={!noteText.trim()}
                    className="flex-1 h-12 rounded-xl font-black bg-gradient-to-r from-[#14B8A6] to-[#10B981] text-white disabled:opacity-50 gap-2 uppercase tracking-wider text-xs">
                    <CheckCircle2 className="h-4 w-4" /> Save Note
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          POPUP: View Note
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewNoteTarget && studentNotes[viewNoteTarget.id] && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
              onClick={() => setViewNoteTarget(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100"
                onClick={e => e.stopPropagation()}>
                <div className="bg-teal-50 border-b border-teal-100 px-6 py-5 flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-black text-teal-900 flex items-center gap-2 uppercase tracking-tight"><MessageSquare className="h-4 w-4" /> Admin Note</h2>
                    <p className="text-xs text-teal-600 font-bold mt-1">{viewNoteTarget.name}</p>
                  </div>
                  <button onClick={() => setViewNoteTarget(null)} className="rounded-full p-1.5 hover:bg-indigo-100 transition-colors text-indigo-600"><X className="h-4 w-4" /></button>
                </div>
                <div className="p-6 space-y-3">
                  <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                    {studentNotes[viewNoteTarget.id]}
                  </p>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Last updated at {noteTimes[viewNoteTarget.id]}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" className="flex-1 h-9 rounded-xl font-bold text-xs border-slate-200" onClick={() => setViewNoteTarget(null)}>Close</Button>
                    <Button className="flex-1 h-10 rounded-xl font-black text-[10px] bg-gradient-to-r from-[#14B8A6] to-[#10B981] text-white gap-2 uppercase tracking-wider"
                      onClick={() => { openNoteModal(viewNoteTarget); setViewNoteTarget(null); }}>
                      <StickyNote className="h-3 w-3" /> Edit Note
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          MODAL: Evaluation Detail
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEvalDetailModal && selectedEval && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowEvalDetailModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
                onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-[#14B8A6] to-[#10B981] text-white px-6 py-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Evaluation Detail</h2>
                    <p className="text-teal-50 text-xs mt-1 font-bold">{selectedEval.studentName} · {selectedEval.id}</p>
                  </div>
                  <button onClick={() => setShowEvalDetailModal(false)} className="rounded-full p-1.5 hover:bg-white/20 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Assignment", value: selectedEval.assignmentName },
                      { label: "Course",     value: selectedEval.course },
                      { label: "Submitted",  value: selectedEval.submittedTime },
                      { label: "Priority",   value: selectedEval.priority },
                    ].map(item => (
                      <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">AI Fairness Check</p>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">No bias detected in this submission. Demographic factors were excluded from the evaluation process.</p>
                  </div>
                  <Button className="w-full h-10 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white" onClick={() => setShowEvalDetailModal(false)}>Close</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          MODAL: Manual Review
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showManualReviewModal && selectedEval && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setShowManualReviewModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
                onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-[#14B8A6] to-[#10B981] text-white px-6 py-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight"><StickyNote className="h-5 w-5" /> Manual Evaluation</h2>
                    <p className="text-teal-50 text-xs mt-1 font-bold">{selectedEval.studentName} · {selectedEval.assignmentName}</p>
                  </div>
                  <button onClick={() => setShowManualReviewModal(false)} className="rounded-full p-1.5 hover:bg-white/20 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Score (0-100)</label>
                    <input 
                      type="number" 
                      value={manualScore}
                      onChange={e => setManualScore(e.target.value)}
                      placeholder="Enter score..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Feedback</label>
                    <textarea
                      rows={4}
                      value={manualFeedback}
                      onChange={e => setManualFeedback(e.target.value)}
                      placeholder="Provide qualitative feedback..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 resize-none leading-relaxed"
                    />
                  </div>
                </div>
                <div className="p-4 flex gap-3 border-t border-slate-100">
                  <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold border-slate-200" onClick={() => setShowManualReviewModal(false)}>Cancel</Button>
                  <Button
                    onClick={handleManualReviewSubmit}
                    disabled={!manualScore || !manualFeedback}
                    className="flex-1 h-12 rounded-xl font-black bg-gradient-to-r from-[#14B8A6] to-[#10B981] text-white disabled:opacity-50 gap-2 uppercase tracking-wider text-xs">
                    <CheckCircle2 className="h-4 w-4" /> Submit Review
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── TOAST ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <AdminProfileDrawer
        config={EDU_ADMIN_CONFIG}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLogout={handleLogout}
        onUpdate={handleUpdateProfile}
      />
    </motion.div>
  );
}
