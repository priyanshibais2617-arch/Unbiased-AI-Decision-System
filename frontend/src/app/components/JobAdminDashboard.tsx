import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LogOut, Users, Bell, Search, ChevronDown, CheckCircle2,
  XCircle, ArrowLeft, BarChart3, Clock, Download, TrendingUp, TrendingDown,
  Briefcase, Star, AlertTriangle, Calendar, FileText, Mail, Tag, RefreshCw, Zap,
  Eye, ThumbsUp, ThumbsDown, Video, MapPin, Award, Activity, Target, Sparkles,
  X, Copy, Check, Loader2, MoreHorizontal, Edit3, Shield
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUser } from "./UserContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { AdminProfileDrawer, AdminProfileConfig } from "./AdminProfileDrawer";
import { apiFetch } from "../api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Candidate {
  id: string; name: string; email: string; role: string;
  experience: string; resumeScore: number; matchPct: number;
  status: "New"|"Reviewed"|"Shortlisted"|"Rejected";
  tag: "High Potential"|"Needs Improvement"|"Average"|null;
  matchedSkills: string[]; missingSkills: string[];
  aiSummary: string; appliedDate: string; daysAgo: number;
}
interface Interview {
  id: string; candidate: string; role: string; date: string;
  time: string; mode: "Online"|"Offline";
  status: "Scheduled"|"Completed"|"Cancelled"|"Rescheduled";
  link?: string; location?: string; interviewer?: string; daysAgo: number;
}
interface AlertItem { id: string; type: "new"|"high-match"|"pending"; message: string; sub: string; time: string; read: boolean; }
interface ActivityLog  { id: string; candidate: string; action: string; time: string; badge: string; badgeColor: string; daysAgo: number; }

// ─── Mock Data ────────────────────────────────────────────────────────────────
const SEED_CANDIDATES: Candidate[] = [
  { id:"HR-001", name:"Arjun Mehta",     email:"arjun.m@example.com",  role:"Senior Frontend Developer", experience:"5 yrs", resumeScore:91, matchPct:94, status:"New",        tag:"High Potential",    matchedSkills:["React","TypeScript","Node.js","Problem Solving","UI/UX"], missingSkills:["AWS","Docker"],                        aiSummary:"Exceptional frontend profile. Strong React & TypeScript expertise with demonstrated UI/UX leadership. Minor cloud skill gaps easily addressed.", appliedDate:"2 hrs ago",  daysAgo:0 },
  { id:"HR-002", name:"Priya Nair",      email:"priya.n@example.com",  role:"Full Stack Developer",       experience:"3 yrs", resumeScore:78, matchPct:82, status:"Reviewed",    tag:"High Potential",    matchedSkills:["React","Node.js","MongoDB","REST APIs"],                missingSkills:["Kubernetes","Docker","AWS"],               aiSummary:"Strong full-stack match with solid backend foundation. Cloud infrastructure knowledge missing but core skills align well with the role.", appliedDate:"5 hrs ago",  daysAgo:0 },
  { id:"HR-003", name:"Rahul Das",       email:"rahul.d@example.com",  role:"Senior Frontend Developer", experience:"2 yrs", resumeScore:55, matchPct:47, status:"Reviewed",    tag:"Needs Improvement", matchedSkills:["React","HTML/CSS","JavaScript"],                        missingSkills:["TypeScript","Node.js","AWS","Docker","Kubernetes"], aiSummary:"Limited seniority for role requirements. Core React skills present but significant gaps in TypeScript, backend, and cloud technologies.", appliedDate:"1 day ago",  daysAgo:1 },
  { id:"HR-004", name:"Sneha Kulkarni", email:"sneha.k@example.com",  role:"React Developer",            experience:"4 yrs", resumeScore:88, matchPct:90, status:"Shortlisted", tag:"High Potential",    matchedSkills:["React","TypeScript","Redux","GraphQL","Node.js"],        missingSkills:["Kubernetes"],                                     aiSummary:"Near-perfect match. Excellent React + TypeScript proficiency with GraphQL exposure. Highly recommended for immediate interview scheduling.", appliedDate:"1 day ago",  daysAgo:1 },
  { id:"HR-005", name:"Vikram Joshi",   email:"vikram.j@example.com", role:"Backend Engineer",           experience:"6 yrs", resumeScore:62, matchPct:58, status:"Rejected",    tag:"Average",           matchedSkills:["Node.js","MongoDB","REST APIs"],                         missingSkills:["React","TypeScript","GraphQL","AWS"],              aiSummary:"Strong backend experience but applied for a frontend-heavy role. Significant frontend skill gaps detected. Consider for backend-specific positions.", appliedDate:"2 days ago", daysAgo:2 },
  { id:"HR-006", name:"Anika Singh",    email:"anika.s@example.com",  role:"Full Stack Developer",       experience:"4 yrs", resumeScore:84, matchPct:87, status:"New",          tag:"High Potential",    matchedSkills:["React","Node.js","TypeScript","Docker","AWS"],           missingSkills:["Kubernetes"],                                     aiSummary:"Excellent full-stack profile with cloud skills. Strong DevOps exposure. Minor Kubernetes experience gap is easily trainable.", appliedDate:"3 hrs ago",  daysAgo:0 },
];

const SEED_INTERVIEWS: Interview[] = [
  { id:"IV-001", candidate:"Sneha Kulkarni", role:"React Developer",            date:"Apr 22, 2026", time:"10:30 AM", mode:"Online",  status:"Scheduled",  link:"https://meet.google.com/abc-defg-hij", interviewer:"Aisha Sharma", daysAgo:0 },
  { id:"IV-002", candidate:"Arjun Mehta",    role:"Senior Frontend Developer",  date:"Apr 23, 2026", time:"02:00 PM", mode:"Online",  status:"Scheduled",  link:"https://zoom.us/j/9876543210",         interviewer:"Rohit Patel",  daysAgo:0 },
  { id:"IV-003", candidate:"Priya Nair",     role:"Full Stack Developer",       date:"Apr 20, 2026", time:"11:00 AM", mode:"Offline", status:"Completed",  location:"Room 202, Block B, Bangalore HQ",  interviewer:"Meera Nair",   daysAgo:1 },
];

const SEED_ALERTS: AlertItem[] = [
  { id:"A1", type:"new",        message:"3 New Applications Received",    sub:"Arjun Mehta, Anika Singh, and 1 more applied for Senior Frontend Developer.", time:"2 hrs ago", read:false },
  { id:"A2", type:"high-match", message:"High Match Candidate Detected",  sub:"Sneha Kulkarni scored 90% match for React Developer position.",               time:"5 hrs ago", read:false },
  { id:"A3", type:"pending",    message:"4 Pending Reviews",              sub:"Applications HR-002, HR-003 awaiting recruiter review for over 24 hours.",     time:"1 day ago", read:true  },
];

const SEED_ACTIVITY: ActivityLog[] = [
  { id:"L1", candidate:"Arjun Mehta",    action:"Applied for Senior Frontend Developer", time:"2 hrs ago",  badge:"Applied",     badgeColor:"blue",    daysAgo:0 },
  { id:"L2", candidate:"Sneha Kulkarni", action:"Shortlisted by Aisha Sharma",           time:"5 hrs ago",  badge:"Shortlisted",  badgeColor:"emerald", daysAgo:0 },
  { id:"L3", candidate:"Priya Nair",     action:"Resume reviewed — Pending decision",    time:"6 hrs ago",  badge:"Reviewed",    badgeColor:"blue",  daysAgo:0 },
  { id:"L4", candidate:"Anika Singh",    action:"Applied for Full Stack Developer",      time:"3 hrs ago",  badge:"Applied",     badgeColor:"blue",    daysAgo:0 },
  { id:"L5", candidate:"Vikram Joshi",   action:"Rejected — Skill gap too wide",         time:"2 days ago", badge:"Rejected",    badgeColor:"red",     daysAgo:2 },
  { id:"L6", candidate:"Rahul Das",      action:"Application marked for review",         time:"1 day ago",  badge:"Reviewed",    badgeColor:"blue",  daysAgo:1 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusColors(status: string) {
  switch(status) {
    case "Shortlisted": return "bg-emerald-100 text-emerald-700 border-0";
    case "Rejected":    return "bg-red-100 text-red-700 border-0";
    case "Reviewed":    return "bg-blue-100 text-blue-700 border-0";
    default:            return "bg-[#0F172A]/10 text-[#0F172A] border-0";
  }
}
function getTagColors(tag: string|null) {
  if(!tag) return "";
  switch(tag) {
    case "High Potential":    return "bg-amber-100 text-amber-700 border-amber-200";
    case "Needs Improvement": return "bg-rose-100 text-rose-700 border-rose-200";
    default:                  return "bg-slate-100 text-slate-600 border-slate-200";
  }
}
function getScoreColor(pct: number) {
  if(pct>=80) return "bg-emerald-500";
  if(pct>=60) return "bg-amber-400";
  return "bg-red-400";
}
function getBadgeColor(color: string) {
  switch(color) {
    case "blue":    return "bg-blue-50 text-blue-700";
    case "emerald": return "bg-emerald-50 text-emerald-700";
    case "red":     return "bg-red-50 text-red-700";
    case "amber":   return "bg-amber-50 text-amber-700";
    default:        return "bg-slate-50 text-slate-600";
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg:string; type:"success"|"error"|"info"; onClose:()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success:"bg-emerald-600", error:"bg-red-600", info:"bg-blue-600" };
  return (
    <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:40}}
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl text-white font-black shadow-xl shadow-blue-500/20 text-sm ${
        type === "success" ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-[#2563EB] to-[#3B82F6]"
      }`}>
      <CheckCircle2 className="h-5 w-5 shrink-0"/>
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="h-4 w-4"/></button>
    </motion.div>
  );
}

// ─── Modal helpers ────────────────────────────────────────────────────────────
function Backdrop({ onClose }: { onClose:()=>void }) {
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50" onClick={onClose}/>;
}
function ModalWrap({ children, onClose, maxW="max-w-lg" }: { children:React.ReactNode; onClose:()=>void; maxW?:string }) {
  return (
    <>
      <Backdrop onClose={onClose}/>
      <motion.div initial={{opacity:0,scale:0.94,y:24}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.94,y:24}}
        transition={{type:"spring",damping:26,stiffness:280}}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-[24px] shadow-2xl w-full ${maxW} overflow-hidden border border-slate-100`} onClick={e=>e.stopPropagation()}>
          {children}
        </div>
      </motion.div>
    </>
  );
}
function ModalHeader({ title, sub, color="blue", onClose }: { title:string; sub?:string; color?:string; onClose:()=>void }) {
  return (
    <div className={`bg-gradient-to-r from-[#2563EB] to-[#0F172A] text-white px-8 py-8 flex justify-between items-start border-b border-white/10`}>
      <div><h2 className="text-xl font-black uppercase tracking-tight">{title}</h2>{sub&&<p className="text-blue-100/70 text-xs mt-2 font-black uppercase tracking-widest">{sub}</p>}</div>
      <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 transition-all hover:rotate-90"><X className="h-5 w-5"/></button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function JobAdminDashboard() {
  const navigate    = useNavigate();
  const { setUserRole } = useUser();

  const [profileOpen, setProfileOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleBackToHome = () => {
    setIsExiting(true);
    setTimeout(() => navigate("/"), 400);
  };

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("jobAdminProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleUpdateProfile = (newData: any) => {
    const updated = { ...profile, ...newData };
    setProfile(updated);
    localStorage.setItem("jobAdminProfile", JSON.stringify(updated));
  };

  const JOB_ADMIN_CONFIG: AdminProfileConfig = {
    type: "job",
    name: profile?.fullName || profile?.name || "Aisha Sharma",
    initials: (profile?.fullName || profile?.name || "AS").split(" ").map((n: string) => n[0]).join("").slice(0, 2),
    email: profile?.email || "aisha.sharma@google.com",
    role: profile?.adminRole || profile?.role || "HR Manager",
    gradientHeader: "bg-gradient-to-br from-[#0F172A] via-[#2563EB] to-[#3B82F6]",
    accentColor: "blue",
    aiTag: "AI Resume Analyzer Active",
    profileInfo: [
      { label: "Organization", value: profile?.orgName || "Google",             span: true },
      { label: "Department",   value: profile?.department || "Talent Acquisition" },
      { label: "Role",         value: profile?.adminRole || profile?.role || "HR Recruiter" },
      { label: "Employee ID",  value: profile?.employeeId || "HR-2024-007" },
      { label: "Experience",   value: (profile?.yearsOfExperience ? `${profile.yearsOfExperience} Years` : "3+ Years") },
    ],
    metrics: [
      { label: "Reviewed",    value: "850", color: "emerald" },
      { label: "Shortlisted", value: "120", color: "blue" },
      { label: "Interviews",  value: "45",  color: "amber" },
    ],
    notifications: [
      { id: "1", text: "3 New Applications Received", sub: "Arjun Mehta, Anika Singh applied for Sr. Frontend.", time: "2 hrs ago", read: false },
      { id: "2", text: "High Match Candidate",        sub: "Sneha Kulkarni scored 90% for React Developer.",    time: "5 hrs ago", read: false },
      { id: "3", text: "4 Pending Reviews",           sub: "HR-002, HR-003 awaiting review for 24+ hours.",     time: "1 day ago", read: true },
    ],
    settingsLabel: "Hiring Settings",
    settingsItems: [
      { key: "autoShortlist", label: "Auto-Shortlist",       desc: "Auto-shortlist candidates above 85% match" },
      { key: "skillMatch",    label: "Skill Match Threshold", desc: "Require 80% skill match minimum" },
      { key: "emailAlerts",   label: "Email Alerts",          desc: "Get notified for new applications" },
      { key: "aiBias",        label: "Bias Detection",        desc: "Flag AI decisions for fairness review" },
    ],
  };
  const [alertsOpen,       setAlertsOpen]        = useState(false);
  const [selectedCandidate,setSelectedCandidate] = useState<Candidate|null>(null);
  const [searchQuery,      setSearchQuery]       = useState("");
  const [filterStatus,     setFilterStatus]      = useState("All");
  const [activityFilter,   setActivityFilter]    = useState("Today");
  const [alerts,           setAlerts]            = useState<AlertItem[]>(SEED_ALERTS);
  const [candidates,       setCandidates]        = useState<Candidate[]>(SEED_CANDIDATES);
  const [interviews,       setInterviews]        = useState<Interview[]>(SEED_INTERVIEWS);
  const [activityLog,      setActivityLog]       = useState<ActivityLog[]>(SEED_ACTIVITY);
  const [logId,            setLogId]             = useState(100);

  // Toast
  const [toast,            setToast]             = useState<{msg:string;type:"success"|"error"|"info"}|null>(null);
  const showToast = (msg:string, type:"success"|"error"|"info"="success") => setToast({msg,type});

  // Candidate confirm
  const [confirm, setConfirm] = useState<{open:boolean;type:"shortlist"|"reject"|"schedule"|null;candidate:Candidate|null}>({open:false,type:null,candidate:null});

  // Add Interview modal
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [ivForm, setIvForm] = useState({ candidate:"", role:"", date:"", time:"", mode:"Online" as "Online"|"Offline", interviewer:"", link:"", location:"", notes:"" });

  // Mode modal
  const [showModeModal,  setShowModeModal]   = useState(false);
  const [modeTarget,     setModeTarget]      = useState<Interview|null>(null);
  const [editMode,       setEditMode]        = useState<"Online"|"Offline">("Online");
  const [copiedLink,     setCopiedLink]      = useState(false);

  // Status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget,    setStatusTarget]    = useState<Interview|null>(null);

  // Export Report modal
  const [showExportModal,  setShowExportModal]  = useState(false);
  const [exportType,       setExportType]       = useState("Interview Schedule Report");
  const [exportRange,      setExportRange]      = useState("Week");
  const [exportFormat,     setExportFormat]     = useState("TXT");
  const [csvLoading,       setCsvLoading]       = useState(false);
  const [reportLoading,    setReportLoading]    = useState(false);
  const [downloading,     setDownloading]      = useState(false);

  useEffect(() => {
    apiFetch("/admin/service-analyses?service_type=job")
      .then((response) => {
        const analyses = Array.isArray(response.data) ? response.data : [];
        if (!analyses.length) return;
        const mapped = analyses.slice(0, 25).map((item: any, index: number): Candidate => {
          const result = item.result || {};
          const email = item.created_by || `candidate${index + 1}@example.com`;
          const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
          const score = Number(result.score || 0);
          return {
            id: `HR-AI-${String(index + 1).padStart(3, "0")}`,
            name,
            email,
            role: "AI Analyzed Candidate",
            experience: "Uploaded Resume",
            resumeScore: score,
            matchPct: score,
            status: score >= 65 ? "Shortlisted" : "Reviewed",
            tag: score >= 80 ? "High Potential" : score >= 60 ? "Average" : "Needs Improvement",
            matchedSkills: result.matchedSkills || [],
            missingSkills: result.missingSkills || [],
            aiSummary: (result.recommendations || []).join(" ") || "AI resume analysis completed from uploaded resume and job description.",
            appliedDate: "Backend analysis",
            daysAgo: 0,
          };
        });
        setCandidates(mapped);
        setActivityLog(mapped.slice(0, 10).map((candidate, index) => ({
          id: `AI-L${index + 1}`,
          candidate: candidate.name,
          action: `Real resume analysis completed with ${candidate.matchPct}% match`,
          time: "Backend analysis",
          badge: candidate.status,
          badgeColor: candidate.status === "Shortlisted" ? "emerald" : "blue",
          daysAgo: 0,
        })));
        setAlerts((current) => [
          {
            id: "AI-JOB",
            type: "high-match",
            message: `${mapped.length} Real Resume Analyses Loaded`,
            sub: "Admin dashboard is showing backend resume analysis results.",
            time: "Just now",
            read: false,
          },
          ...current,
        ]);
      })
      .catch(() => showToast("Could not load real job analyses", "error"));
  }, []);

  // Smart Alert detail modals
  const [showNewApps,     setShowNewApps]      = useState(false);
  const [showHighMatch,   setShowHighMatch]    = useState(false);
  const [showPending,     setShowPending]      = useState(false);

  const handleLogout = () => { setUserRole(null); navigate("/"); };
  const markAllRead  = () => setAlerts(prev => prev.map(a => ({...a, read:true})));
  const unreadCount  = alerts.filter(a => !a.read).length;

  const addLog = (candidate:string, action:string, badge:string, badgeColor:string) => {
    setLogId(n => n+1);
    setActivityLog(prev => [{ id:`L${logId}`, candidate, action, time:"just now", badge, badgeColor, daysAgo:0 }, ...prev]);
  };

  // ── Confirm popup actions ──
  const handleAction = (type:"shortlist"|"reject"|"schedule", c:Candidate) => setConfirm({open:true,type,candidate:c});
  const handleConfirm = () => {
    if(!confirm.candidate || !confirm.type) return;
    if(confirm.type !== "schedule") {
      const newStatus = confirm.type==="shortlist"?"Shortlisted":"Rejected";
      setCandidates(prev => prev.map(c => c.id===confirm.candidate!.id ? {...c,status:newStatus} : c));
      if(selectedCandidate?.id===confirm.candidate.id) setSelectedCandidate(prev => prev ? {...prev,status:newStatus} : prev);
      addLog(confirm.candidate.name, `${newStatus} by Aisha Sharma`, newStatus, confirm.type==="shortlist"?"emerald":"red");
      showToast(`Candidate ${newStatus.toLowerCase()} successfully`,"success");
    }
    setConfirm({open:false,type:null,candidate:null});
  };

  // ── Add Interview ──
  const handleScheduleInterview = () => {
    if(!ivForm.candidate || !ivForm.role || !ivForm.date || !ivForm.time) return;
    const newIv: Interview = {
      id: `IV-00${interviews.length+1}`,
      candidate: ivForm.candidate, role: ivForm.role,
      date: ivForm.date, time: ivForm.time,
      mode: ivForm.mode, status: "Scheduled",
      link: ivForm.link || undefined,
      location: ivForm.location || undefined,
      interviewer: ivForm.interviewer || undefined,
      daysAgo: 0,
    };
    setInterviews(prev => [...prev, newIv]);
    addLog(ivForm.candidate, `Interview scheduled — ${ivForm.role}`, "Scheduled", "amber");
    showToast("Interview scheduled successfully","success");
    setShowAddInterview(false);
    setIvForm({candidate:"",role:"",date:"",time:"",mode:"Online",interviewer:"",link:"",location:"",notes:""});
  };

  // ── Mode save ──
  const handleSaveMode = () => {
    if(!modeTarget) return;
    setInterviews(prev => prev.map(iv => iv.id===modeTarget.id ? {...iv, mode:editMode} : iv));
    addLog(modeTarget.candidate, `Interview mode changed to ${editMode}`, "Updated", "indigo");
    showToast("Interview mode updated successfully","success");
    setShowModeModal(false);
  };

  // ── Status update ──
  const handleStatusUpdate = (newStatus: "Scheduled"|"Completed"|"Cancelled"|"Rescheduled") => {
    if(!statusTarget) return;
    setInterviews(prev => prev.map(iv => iv.id===statusTarget.id ? {...iv, status:newStatus} : iv));
    const msgs: Record<string,string> = {
      Completed: "Interview marked as completed",
      Rescheduled: "Interview rescheduled successfully",
      Cancelled: "Interview cancelled",
      Scheduled: "Interview kept as scheduled",
    };
    const colors: Record<string,string> = { Completed:"emerald", Rescheduled:"indigo", Cancelled:"red", Scheduled:"amber" };
    addLog(statusTarget.candidate, msgs[newStatus], newStatus, colors[newStatus]);
    showToast(msgs[newStatus],"success");
    setShowStatusModal(false);
  };

  // ── Export CSV ──
  const handleExportCSV = () => {
    setCsvLoading(true);
    setTimeout(() => {
      const header = ["ID","Candidate","Role","Date","Time","Mode","Status"].join(",");
      const rows = filteredInterviews.map(iv => [iv.id,`"${iv.candidate}"`,`"${iv.role}"`,iv.date,iv.time,iv.mode,iv.status].join(","));
      const csv = [header,...rows].join("\n");
      const blob = new Blob([csv], {type:"text/csv"});
      const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="interview_schedule.csv"; a.click();
      URL.revokeObjectURL(a.href);
      addLog("Aisha Sharma","CSV exported by recruiter","Exported","indigo");
      showToast("CSV exported successfully","success");
      setCsvLoading(false);
    },1200);
  };

  // ── Export Report ──
  const handleExportReport = () => {
    setReportLoading(true);
    setTimeout(() => {
      const now = new Date().toLocaleString();
      const lines = [
        `${exportType.toUpperCase()}`,
        `Time Range: ${exportRange}  |  Format: ${exportFormat}  |  Generated: ${now}`,
        "=".repeat(60), "",
        "INTERVIEW SCHEDULE",
        "-".repeat(60),
        ...filteredInterviews.map(iv =>
          `[${iv.id}] ${iv.candidate} | ${iv.role} | ${iv.date} ${iv.time} | ${iv.mode} | ${iv.status}`
        ),
        "",
        "CANDIDATE SUMMARY",
        "-".repeat(60),
        ...candidates.map(c =>
          `[${c.id}] ${c.name} | ${c.role} | Score: ${c.resumeScore} | Match: ${c.matchPct}% | Status: ${c.status}`
        ),
        "",
        "=".repeat(60),
        `Generated by: Aisha Sharma (HR Manager) | ${now}`,
      ];
      const blob = new Blob([lines.join("\n")], {type:"text/plain"});
      const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`hiring_report_${exportRange.toLowerCase()}.${exportFormat.toLowerCase()}`; a.click();
      URL.revokeObjectURL(a.href);
      addLog("Aisha Sharma","Report exported successfully","Exported","indigo");
      showToast("Report exported successfully","success");
      setReportLoading(false);
      setShowExportModal(false);
    },1500);
  };

  // ── Download Resume ──
  const handleDownloadResume = (c: Candidate) => {
    setDownloading(true);
    setTimeout(() => {
      const fileName = `${c.name.replace(/\s+/g, "_")}_Resume.pdf`;
      const content = `
RESUME: ${c.name.toUpperCase()}
--------------------------------------------------
Applied Role: ${c.role}
Experience: ${c.experience}
Applied Date: ${c.appliedDate}

AI EVALUATION SUMMARY
--------------------------------------------------
Resume Score: ${c.resumeScore}/100
Match Percentage: ${c.matchPct}%
AI Recommendation: ${c.aiSummary}

SKILL ANALYSIS
--------------------------------------------------
Matched Skills: ${c.matchedSkills.join(", ")}
Missing Skills: ${c.missingSkills.join(", ")}

--------------------------------------------------
Generated by: Unbiased AI Decision System (HR Portal)
Date: ${new Date().toLocaleString()}
      `.trim();

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      addLog(c.name, "Resume downloaded by recruiter", "Downloaded", "blue");
      showToast("Resume downloaded successfully", "success");
      setDownloading(false);
    }, 1000);
  };

  // ── Derived data ──
  const filtered = candidates
    .filter(c => filterStatus==="All" || c.status===filterStatus)
    .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a,b) => b.matchPct-a.matchPct);

  // Activity time filter
  const filterDays = activityFilter==="Today" ? 0 : activityFilter==="Week" ? 7 : 30;
  const filteredActivity = activityLog.filter(l => l.daysAgo <= filterDays);

  // Interview filter for exports respects activityFilter range
  const filteredInterviews = interviews.filter(iv => iv.daysAgo <= filterDays);

  const overviewStats = [
    { title:"Total Applications", value:candidates.length.toString(),                                                      trend:"+8.3%",  isUp:true,  icon:Users,       color:"blue",   suffix:"This Week" },
    { title:"Shortlisted",        value:candidates.filter(c=>c.status==="Shortlisted").length.toString(),                  trend:"+22.1%", isUp:true,  icon:ThumbsUp,    color:"emerald",suffix:"Candidate" },
    { title:"Rejected",           value:candidates.filter(c=>c.status==="Rejected").length.toString(),                     trend:"-5.0%",  isUp:false, icon:ThumbsDown,  color:"rose",   suffix:"Candidate" },
    { title:"Avg Match Score",    value:`${Math.round(candidates.reduce((s,c)=>s+c.matchPct,0)/candidates.length)}%`,      trend:"+3.2%",  isUp:true,  icon:Target,      color:"indigo", suffix:"AI Score"  },
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] pb-16 font-sans text-slate-900"
      onClick={() => { setProfileOpen(false); setAlertsOpen(false); }}>

      {/* ─── Header ─── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex justify-between items-center h-16">
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
            <div className="h-5 w-px bg-slate-200 mx-1"/>
            <div className="p-2 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-xl shadow-lg shadow-blue-500/20">
              <Briefcase className="h-5 w-5 text-white"/>
            </div>
            <div>
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight leading-none uppercase">Hiring Control Center</h1>
              <p className="text-[11px] text-blue-600/70 font-black uppercase tracking-widest mt-1">AI Talent Acquisition Engine</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3" onClick={e=>e.stopPropagation()}>

            {/* Bell */}
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={()=>{setAlertsOpen(!alertsOpen);setProfileOpen(false);}}
                className="relative h-10 w-10 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                <Bell className="h-5 w-5"/>
                {unreadCount>0&&<span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"/>}
              </Button>
              <AnimatePresence>
                {alertsOpen && (
                  <motion.div initial={{opacity:0,y:10,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:10,scale:0.95}} transition={{duration:0.15}}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-blue-500"/> Notifications
                        {unreadCount>0&&<span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 font-bold">{unreadCount}</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={markAllRead} className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">Mark all read</button>
                        <span className="text-slate-300 text-xs">|</span>
                        <button onClick={() => setAlerts([])} className="text-[11px] font-bold text-slate-500 hover:text-red-600 transition-colors">Clear all</button>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-400 font-medium">No notifications available</div>
                      ) : alerts.map(a=>(
                        <div key={a.id} className={`p-3 flex gap-3 hover:bg-blue-50/30 transition-colors cursor-pointer ${a.read?"opacity-60":""}`}>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${a.type==="new"?"bg-blue-50":a.type==="high-match"?"bg-amber-50":"bg-orange-50"}`}>
                            {a.type==="new"?<Users className="h-4 w-4 text-blue-500"/>:a.type==="high-match"?<Star className="h-4 w-4 text-amber-500"/>:<Clock className="h-4 w-4 text-orange-500"/>}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight">{a.message}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">{a.sub}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">{a.time}</p>
                          </div>
                          {!a.read&&<div className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-1.5"/>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile → drawer (circular avatar) */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setProfileOpen(!profileOpen); setAlertsOpen(false); }}
                className="relative h-10 w-10 rounded-full focus:outline-none group"
                title="Aisha Sharma – HR Manager"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#0F172A] flex items-center justify-center text-white font-black text-sm ring-2 ring-white shadow-lg group-hover:scale-110 transition-all duration-200">
                  {JOB_ADMIN_CONFIG.initials}
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">

        {/* ─── Overview Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {overviewStats.map((stat,i)=>(
            <motion.div key={i} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.08}}>
              <Card className="rounded-[24px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-white relative overflow-hidden group">
                <div className={`absolute -right-8 -top-8 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`}/>
                <CardContent className="p-6 flex flex-col h-full relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 shadow-sm`}>
                      <stat.icon className="h-6 w-6"/>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-black px-2.5 py-1.5 rounded-xl ${stat.isUp?"bg-emerald-50 text-emerald-600":"bg-rose-50 text-rose-600"}`}>
                      {stat.isUp?<TrendingUp className="h-3.5 w-3.5"/>:<TrendingDown className="h-3.5 w-3.5"/>} {stat.trend}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter">{stat.value}</h3>
                    <p className="text-xs font-black text-slate-400 mt-2 flex items-center justify-between uppercase tracking-widest">
                      {stat.title}<span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{stat.suffix}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ─── Main Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Applications + Interview Schedule */}
          <motion.div className="lg:col-span-3 space-y-6" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>

            {/* Candidates Table */}
            <Card className="rounded-[32px] border border-slate-200 shadow-2xl shadow-blue-500/5 bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-8 px-8">
                <div>
                  <CardTitle className="text-xl font-black text-[#0F172A] flex items-center gap-3 uppercase tracking-tight"><FileText className="h-6 w-6 text-blue-600"/> Candidate Pipeline</CardTitle>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2">Ranked by AI Match Intelligence · {filtered.length} Applications</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors"/>
                    <input type="text" placeholder="Search talent..."
                      className="pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 w-full sm:w-64 outline-none transition-all shadow-sm font-bold"
                      value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                  </div>
                  <div className="flex items-center gap-1.5 border border-slate-200 rounded-2xl p-1.5 bg-white shadow-sm shrink-0">
                    {["All","New","Reviewed","Shortlisted","Rejected"].map(s=>(
                      <button key={s} onClick={()=>setFilterStatus(s)}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filterStatus===s?"bg-[#2563EB] text-white shadow-lg shadow-blue-500/30":"text-slate-400 hover:text-slate-900 hover:bg-slate-50"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Candidate</th>
                      <th className="px-6 py-4">Role Applied</th>
                      <th className="px-6 py-4 text-center">Resume Score</th>
                      <th className="px-6 py-4 text-center">Match %</th>
                      <th className="px-6 py-4">Experience</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filtered.map(c=>(
                      <tr key={c.id} className="hover:bg-blue-50/30 transition-all group border-b border-slate-50 last:border-0">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-[#2563EB] font-black text-xs border border-blue-100 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                              {c.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                            </div>
                            <div>
                              <p className="font-black text-[#0F172A] leading-tight group-hover:text-blue-700 transition-colors uppercase tracking-tight">{c.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{c.id} · {c.appliedDate}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-black text-slate-600 text-xs leading-tight uppercase tracking-tight">{c.role}</p>
                          {c.tag&&<Badge variant="outline" className={`text-[9px] px-2 py-0.5 mt-2 font-black uppercase tracking-widest ${getTagColors(c.tag)}`}><Tag className="h-2.5 w-2.5 mr-1"/>{c.tag}</Badge>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-sm font-black ${c.resumeScore>=80?"text-emerald-600":c.resumeScore>=60?"text-amber-600":"text-rose-500"}`}>{c.resumeScore}</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30"><div className={`h-full rounded-full ${getScoreColor(c.resumeScore)}`} style={{width:`${c.resumeScore}%`}}/></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-black text-sm ${c.matchPct>=80?"text-emerald-600":c.matchPct>=60?"text-amber-600":"text-rose-500"}`}>{c.matchPct}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30"><div className={`h-full rounded-full ${getScoreColor(c.matchPct)}`} style={{width:`${c.matchPct}%`}}/></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200/50">{c.experience}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap"><Badge className={`font-black uppercase tracking-widest text-[9px] px-2.5 py-1 ${getStatusColors(c.status)}`}>{c.status}</Badge></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <Button onClick={()=>setSelectedCandidate(c)} variant="outline" size="sm" className="h-8 rounded-xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-black shadow-sm text-[10px] px-3 uppercase tracking-widest transition-all hover:scale-105"><Eye className="h-3.5 w-3.5 mr-1.5"/> View</Button>
                          {c.status!=="Shortlisted"&&c.status!=="Rejected"&&(
                            <>
                              <Button variant="ghost" size="sm" onClick={()=>handleAction("shortlist",c)} className="h-8 w-8 rounded-xl text-emerald-600 hover:bg-emerald-50 font-black text-xs p-0 transition-all hover:scale-110"><ThumbsUp className="h-4 w-4"/></Button>
                              <Button variant="ghost" size="sm" onClick={()=>handleAction("reject",c)} className="h-8 w-8 rounded-xl text-rose-500 hover:bg-rose-50 font-black text-xs p-0 transition-all hover:scale-110"><ThumbsDown className="h-4 w-4"/></Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length===0&&<tr><td colSpan={7} className="px-6 py-10 text-center text-slate-500 font-medium">No candidates found.</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Interview Schedule */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
              <Card className="rounded-[32px] border border-slate-200 shadow-xl shadow-blue-500/5 bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/30 py-6 px-8 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-black text-[#0F172A] flex items-center gap-3 uppercase tracking-tight"><Calendar className="h-5 w-5 text-blue-600"/> Interview Pipeline</CardTitle>
                  <Button onClick={()=>setShowAddInterview(true)} variant="outline" size="sm" className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest border-blue-200 text-blue-700 hover:bg-blue-50 transition-all hover:scale-105">
                    <Calendar className="h-3.5 w-3.5 mr-2"/> Add Interview
                  </Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5 text-left">Candidate</th>
                        <th className="px-6 py-3.5 text-left">Role</th>
                        <th className="px-6 py-3.5 text-left">Date &amp; Time</th>
                        <th className="px-6 py-3.5 text-center">Mode</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {interviews.map(iv=>(
                        <tr key={iv.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0 border border-blue-100 shadow-sm">
                                {iv.candidate.split(" ").map(n=>n[0]).join("").slice(0,2)}
                              </div>
                              <span className="font-black text-[#0F172A] text-sm uppercase tracking-tight">{iv.candidate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">{iv.role}</td>
                          <td className="px-6 py-4">
                            <p className="font-black text-[#0F172A] text-xs uppercase tracking-tight">{iv.date}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{iv.time}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={()=>{ setModeTarget(iv); setEditMode(iv.mode); setShowModeModal(true); }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all hover:shadow-lg hover:scale-105 cursor-pointer
                                         focus:outline-none focus:ring-4 focus:ring-blue-400/10
                                         ${iv.mode==='Online'?'bg-blue-50 text-blue-700 border-blue-200':'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {iv.mode==="Online"?<Video className="h-3.5 w-3.5"/>:<MapPin className="h-3.5 w-3.5"/>}
                              {iv.mode}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={()=>{ setStatusTarget(iv); setShowStatusModal(true); }}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-0 transition-all hover:shadow-lg hover:scale-105 cursor-pointer focus:outline-none
                                ${iv.status==="Scheduled"?"bg-amber-100 text-amber-700 shadow-sm shadow-amber-200/50"
                                  :iv.status==="Completed"?"bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-200/50"
                                  :iv.status==="Rescheduled"?"bg-blue-100 text-blue-700 shadow-sm shadow-blue-200/50"
                                  :"bg-rose-100 text-rose-700 shadow-sm shadow-rose-200/50"}`}>
                              {iv.status}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {interviews.length===0&&<tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">No interviews scheduled.</td></tr>}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">

            {/* AI Top Candidates */}
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.25}}>
              <Card className="rounded-[32px] border border-blue-100 shadow-xl shadow-blue-500/5 bg-white overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-blue-50 to-[#EFF6FF] border-b border-blue-100 px-6 pt-6 pb-5">
                  <CardTitle className="text-sm font-black text-blue-900 flex items-center gap-2 uppercase tracking-widest"><Sparkles className="h-5 w-5 text-blue-600"/> AI Top Talent</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {candidates.filter(c=>c.matchPct>=80).sort((a,b)=>b.matchPct-a.matchPct).slice(0,3).map((c,i)=>(
                    <div key={c.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group" onClick={()=>setSelectedCandidate(c)}>
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-md ${i===0?"bg-[#2563EB]":i===1?"bg-blue-400":"bg-sky-400"}`}>#{i+1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[#0F172A] truncate group-hover:text-blue-700 transition-colors uppercase tracking-tight">{c.name}</p>
                        <p className="text-[10px] text-slate-400 truncate font-bold uppercase tracking-widest mt-1">{c.role}</p>
                      </div>
                      <span className="text-sm font-black text-blue-600 shrink-0">{c.matchPct}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Pipeline Summary */}
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.35}}>
              <Card className="rounded-[32px] border border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/30 border-b border-slate-100 px-6 pt-6 pb-5">
                  <CardTitle className="text-sm font-black text-[#0F172A] flex items-center gap-2 uppercase tracking-widest"><Activity className="h-5 w-5 text-blue-600"/> Pipeline Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {([
                    { label:"Applications", count:candidates.filter(c=>c.status==="New").length,        color:"bg-[#0F172A]",   pct:(candidates.filter(c=>c.status==="New").length/candidates.length*100) },
                    { label:"Reviewed",     count:candidates.filter(c=>c.status==="Reviewed").length,   color:"bg-[#2563EB]", pct:(candidates.filter(c=>c.status==="Reviewed").length/candidates.length*100) },
                    { label:"Shortlisted",  count:candidates.filter(c=>c.status==="Shortlisted").length,color:"bg-emerald-500",pct:(candidates.filter(c=>c.status==="Shortlisted").length/candidates.length*100) },
                    { label:"Rejected",     count:candidates.filter(c=>c.status==="Rejected").length,   color:"bg-rose-500",    pct:(candidates.filter(c=>c.status==="Rejected").length/candidates.length*100) },
                  ] as {label:string;count:number;color:string;pct:number}[]).map(item=>(
                    <div key={item.label}>
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2"><span>{item.label}</span><span className="text-[#0F172A]">{item.count}</span></div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${item.pct}%`}} transition={{duration:1,delay:0.5,ease:"easeOut"}} className={`h-full rounded-full ${item.color} shadow-sm`}/>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Export */}
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.4}}>
              <Card className="rounded-[32px] border border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Export Hub</p>
                  <Button onClick={handleExportCSV} disabled={csvLoading} variant="outline" className="w-full h-11 rounded-2xl text-[11px] font-black uppercase tracking-widest border-slate-200 text-slate-700 hover:bg-slate-50 gap-3 disabled:opacity-70 transition-all hover:scale-[1.02]">
                    {csvLoading?<><Loader2 className="h-4 w-4 animate-spin"/> Exporting…</>:<><Download className="h-4 w-4 text-blue-600"/> Export CSV</>}
                  </Button>
                  <Button onClick={()=>setShowExportModal(true)} variant="outline" className="w-full h-11 rounded-2xl text-[11px] font-black uppercase tracking-widest border-blue-200 text-blue-700 hover:bg-blue-50 gap-3 transition-all hover:scale-[1.02]">
                    <FileText className="h-4 w-4"/> Intelligence Report
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ─── Activity Log + Smart Alerts ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-[24px] border border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2"><Clock className="h-5 w-5 text-slate-400"/> Activity Log</CardTitle>
              <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-white shadow-sm">
                {["Today","Week","Month"].map(f=>(
                  <button key={f} onClick={()=>setActivityFilter(f)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${activityFilter===f?"bg-blue-50 text-blue-700 shadow-sm":"text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>{f}</button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-50 font-medium">
                  <AnimatePresence initial={false}>
                    {filteredActivity.length===0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium">No activity found for this time range.</td></tr>
                    ) : filteredActivity.map(log=>(
                      <motion.tr key={log.id} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">{log.candidate.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                            <span className="font-bold text-slate-900 text-xs">{log.candidate}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 text-xs">{log.action}</td>
                        <td className="px-6 py-3.5 text-slate-400 text-[11px] whitespace-nowrap">{log.time}</td>
                        <td className="px-6 py-3.5 text-right"><Badge className={`border-0 text-[10px] font-bold ${getBadgeColor(log.badgeColor)}`}>{log.badge}</Badge></td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Smart Alerts */}
          <Card className="rounded-[24px] border border-amber-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-amber-50/50 border-b border-amber-100 py-5 px-5">
              <CardTitle className="text-base font-bold text-amber-900 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500"/> Smart Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {alerts.map(a=>(
                <div key={a.id} className={`p-3 bg-white border rounded-xl shadow-sm flex gap-3 group hover:border-amber-200 transition-colors cursor-pointer ${a.read?"opacity-60 border-slate-100":"border-slate-100"}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${a.type==="new"?"bg-blue-50":a.type==="high-match"?"bg-amber-50":"bg-orange-50"}`}>
                    {a.type==="new"?<Users className="h-4 w-4 text-blue-500"/>:a.type==="high-match"?<Award className="h-4 w-4 text-amber-500"/>:<Clock className="h-4 w-4 text-orange-500"/>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-tight">{a.message}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">{a.sub}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAlerts(prev => prev.map(x => x.id===a.id ? {...x, read:true} : x));
                        if(a.type==="new") setShowNewApps(true);
                        else if(a.type==="high-match") setShowHighMatch(true);
                        else setShowPending(true);
                      }}
                      className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mt-1.5 hover:text-indigo-800 transition-colors hover:underline"
                    >View Details</button>
                  </div>
                  {!a.read&&<div className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-1"/>}
                </div>
              ))}
              <button onClick={markAllRead} className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 mt-1 transition-colors pt-1">✓ Mark all as read</button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ── Candidate Detail Slide Panel ─────────────────────────────────── */}
      <AnimatePresence>
        {selectedCandidate && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={()=>setSelectedCandidate(null)}/>
            <motion.div initial={{x:"100%",opacity:0.5}} animate={{x:0,opacity:1}} exit={{x:"100%",opacity:0.5}}
              transition={{type:"spring",damping:25,stiffness:200}}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto flex flex-col border-l border-slate-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
                <div><p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-0.5">Candidate Profile · {selectedCandidate.id}</p><h2 className="text-xl font-black text-slate-900">{selectedCandidate.name}</h2></div>
                <Button variant="ghost" size="icon" onClick={()=>setSelectedCandidate(null)} className="h-10 w-10 bg-slate-50 rounded-full hover:bg-slate-200 text-slate-600"><X className="h-5 w-5"/></Button>
              </div>
              <div className="p-6 space-y-5 flex-1 bg-slate-50/30">
                {/* Info */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl ring-4 ring-white shadow-sm">{selectedCandidate.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                      <div><h3 className="text-lg font-bold text-slate-900">{selectedCandidate.name}</h3><p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5"><Mail className="h-3.5 w-3.5"/> {selectedCandidate.email}</p></div>
                    </div>
                    <Badge className={getStatusColors(selectedCandidate.status)}>{selectedCandidate.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[["Experience",selectedCandidate.experience],["Applying For",selectedCandidate.role],["Applied",selectedCandidate.appliedDate]].map(([l,v])=>(
                      <div key={l}><p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{l}</p><p className="font-bold text-slate-700 text-sm">{v}</p></div>
                    ))}
                  </div>
                </div>
                {/* AI panel */}
                <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10"><BarChart3 className="h-40 w-40 translate-x-10 -translate-y-10"/></div>
                  <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-5 flex items-center gap-2 relative z-10"><Zap className="h-4 w-4"/> AI Match Analysis</h3>
                  <div className="grid grid-cols-2 gap-5 mb-5 relative z-10 text-center">
                    <div className="bg-white/10 rounded-xl p-4 border border-white/10"><p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider mb-1">Resume Score</p><p className="text-3xl font-black">{selectedCandidate.resumeScore}<span className="text-base text-indigo-300 font-bold">/100</span></p></div>
                    <div className="bg-white/10 rounded-xl p-4 border border-white/10"><p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider mb-1">Match %</p><p className="text-3xl font-black">{selectedCandidate.matchPct}%</p></div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 relative z-10">
                    <p className="text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">AI Summary</p>
                    <p className="text-sm font-medium leading-relaxed italic border-l-2 border-indigo-400 pl-3">"{selectedCandidate.aiSummary}"</p>
                  </div>
                </div>
                {/* Skills */}
                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${selectedCandidate.matchPct>=80?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
                  <div className={`p-3 rounded-full shrink-0 ${selectedCandidate.matchPct>=80?"bg-emerald-100":"bg-amber-100"}`}>{selectedCandidate.matchPct>=80?<CheckCircle2 className="h-6 w-6 text-emerald-600"/>:<AlertTriangle className="h-6 w-6 text-amber-600"/>}</div>
                  <div>
                    <p className={`font-black text-base ${selectedCandidate.matchPct>=80?"text-emerald-900":"text-amber-900"}`}>{selectedCandidate.matchPct>=80?"Strong Match Profile ✅":"Skill Gaps Detected ⚠️"}</p>
                    <p className={`text-sm font-medium ${selectedCandidate.matchPct>=80?"text-emerald-700":"text-amber-700"}`}>{selectedCandidate.matchPct>=80?"Candidate aligns well with the target role requirements.":"Significant skill gaps detected. Review carefully before shortlisting."}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Target className="h-4 w-4 text-indigo-600"/> Keyword Gap Analysis</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div><h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5"/> Matched Skills</h4><div className="flex flex-wrap gap-2">{selectedCandidate.matchedSkills.map((sk,i)=><Badge key={i} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-1 font-semibold text-xs">{sk}</Badge>)}</div></div>
                    <div><h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-3 flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5"/> Missing Skills</h4><div className="flex flex-wrap gap-2">{selectedCandidate.missingSkills.map((sk,i)=><Badge key={i} variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 px-2.5 py-1 font-semibold text-xs">{sk}</Badge>)}</div></div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600"/> Resume</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-200"><FileText className="h-5 w-5 text-blue-500"/></div>
                      <div><p className="text-sm font-bold text-slate-900">{selectedCandidate.name.replace(" ","_")}_Resume.pdf</p><p className="text-xs text-slate-500 font-medium mt-0.5">Uploaded · {selectedCandidate.appliedDate}</p></div>
                    </div>
                    <Button 
                      onClick={() => handleDownloadResume(selectedCandidate)} 
                      disabled={downloading}
                      variant="outline" size="sm" 
                      className="h-8 rounded-lg text-xs font-bold gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all min-w-[100px]"
                    >
                      {downloading ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin"/> Downloading...</>
                      ) : (
                        <><Download className="h-3.5 w-3.5"/> Download</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 shadow-[0_-4px_20px_rgb(0,0,0,0.05)]">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Recruiter Decision Panel</p>
                <div className="grid grid-cols-3 gap-3">
                  <Button onClick={()=>handleAction("shortlist",selectedCandidate)} className="h-12 w-full text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"><ThumbsUp className="h-4 w-4 mr-2"/> Shortlist</Button>
                  <Button
                    onClick={() => {
                      setIvForm(f => ({ ...f, candidate: selectedCandidate.name, role: selectedCandidate.role }));
                      setShowAddInterview(true);
                    }}
                    variant="outline" className="h-12 w-full text-sm font-bold border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
                  ><Calendar className="h-4 w-4 mr-2"/> Schedule</Button>
                  <Button onClick={()=>handleAction("reject",selectedCandidate)} className="h-12 w-full text-sm font-bold bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl shadow-sm"><ThumbsDown className="h-4 w-4 mr-2"/> Reject</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}

      {/* Confirm Popup */}
      <AnimatePresence>
        {confirm.open && (
          <ModalWrap onClose={()=>setConfirm({open:false,type:null,candidate:null})}>
            <ModalHeader
              title={confirm.type==="shortlist"?"Shortlist Candidate?":confirm.type==="reject"?"Reject Candidate?":"Schedule Interview?"}
              color={confirm.type==="shortlist"?"emerald":confirm.type==="reject"?"red":"blue"}
              onClose={()=>setConfirm({open:false,type:null,candidate:null})}/>
            <div className="p-6">
              <p className="text-sm text-slate-600 font-medium">
                {confirm.type==="shortlist"?`Shortlist ${confirm.candidate?.name}? An invite will be sent to their email.`
                  :confirm.type==="reject"?`Reject ${confirm.candidate?.name}? This will notify the candidate.`
                  :`Schedule an interview with ${confirm.candidate?.name}?`}
              </p>
            </div>
            <div className="p-4 flex gap-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold" onClick={()=>setConfirm({open:false,type:null,candidate:null})}>Cancel</Button>
              <Button className={`flex-1 h-10 rounded-xl font-bold text-white ${confirm.type==="shortlist"?"bg-emerald-600 hover:bg-emerald-700":confirm.type==="reject"?"bg-red-600 hover:bg-red-700":"bg-blue-600 hover:bg-blue-700"}`} onClick={handleConfirm}>
                {confirm.type==="shortlist"?"Shortlist":confirm.type==="reject"?"Reject":"Schedule"}
              </Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Add Interview Modal */}
      <AnimatePresence>
        {showAddInterview && (
          <ModalWrap onClose={()=>setShowAddInterview(false)}>
            <ModalHeader title="Add Interview" sub="Schedule a new interview session" color="indigo" onClose={()=>setShowAddInterview(false)}/>
            <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto">
              {[
                ["Candidate Name","candidate","text","Candidate full name"],
                ["Role","role","text","Job role"],
                ["Interviewer Name","interviewer","text","Interviewer name"],
              ].map(([label,field,type,placeholder])=>(
                <div key={field}>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 block">{label}</label>
                  <input type={type} placeholder={placeholder as string} value={(ivForm as any)[field]}
                    onChange={e=>setIvForm(prev=>({...prev,[field]:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"/>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 block">Date</label>
                  <input type="date" value={ivForm.date} onChange={e=>setIvForm(p=>({...p,date:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 block">Time</label>
                  <input type="time" value={ivForm.time} onChange={e=>setIvForm(p=>({...p,time:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 block">Interview Mode</label>
                <div className="flex gap-2">
                  {(["Online","Offline"] as const).map(m=>(
                    <button key={m} onClick={()=>setIvForm(p=>({...p,mode:m}))}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${ivForm.mode===m?"bg-indigo-50 border-indigo-300 text-indigo-700":"border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                      {m==="Online"?<Video className="h-4 w-4 inline mr-1.5"/>:<MapPin className="h-4 w-4 inline mr-1.5"/>}{m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 block">{ivForm.mode==="Online"?"Meeting Link":"Office Location"}</label>
                <input type="text" placeholder={ivForm.mode==="Online"?"https://meet.google.com/...":"Building, Room, City"}
                  value={ivForm.mode==="Online"?ivForm.link:ivForm.location}
                  onChange={e=>setIvForm(p=>ivForm.mode==="Online"?{...p,link:e.target.value}:{...p,location:e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"/>
              </div>
            </div>
            <div className="p-4 flex gap-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold" onClick={()=>setShowAddInterview(false)}>Cancel</Button>
              <Button disabled={!ivForm.candidate||!ivForm.role||!ivForm.date||!ivForm.time} onClick={handleScheduleInterview}
                className="flex-1 h-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 gap-2">
                <Calendar className="h-4 w-4"/> Schedule Interview
              </Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Mode Modal */}
      <AnimatePresence>
        {showModeModal && modeTarget && (
          <ModalWrap onClose={()=>setShowModeModal(false)}>
            <ModalHeader title="Interview Mode" sub={`${modeTarget.candidate} — ${modeTarget.id}`} color="blue" onClose={()=>setShowModeModal(false)}/>
            <div className="p-6 space-y-4">
              {/* Mode Info */}
              {modeTarget.mode==="Online" ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Online Meeting Details</p>
                  {[["Platform","Google Meet"],["Interview ID",modeTarget.id],["Meeting Link",modeTarget.link||"https://meet.google.com/abc-defg-hij"]].map(([l,v])=>(
                    <div key={l} className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-500">{l}</span>
                      <span className="font-bold text-slate-900 text-right max-w-[200px] truncate">{v}</span>
                    </div>
                  ))}
                  <button onClick={()=>{navigator.clipboard.writeText(modeTarget.link||"https://meet.google.com/abc-defg-hij");setCopiedLink(true);setTimeout(()=>setCopiedLink(false),2000);}}
                    className="mt-2 flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                    {copiedLink?<><Check className="h-3.5 w-3.5 text-emerald-500"/> Copied!</>:<><Copy className="h-3.5 w-3.5"/> Copy Meeting Link</>}
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Offline Location Details</p>
                  {[["Location",modeTarget.location||"Bangalore HQ"],["Interview Room","Room 202, Block B"],["Address","MG Road, Bangalore 560001"]].map(([l,v])=>(
                    <div key={l} className="flex justify-between items-center text-sm"><span className="font-semibold text-slate-500">{l}</span><span className="font-bold text-slate-900">{v}</span></div>
                  ))}
                </div>
              )}
              {/* Change mode */}
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Change Mode</p>
                <div className="flex gap-2">
                  {(["Online","Offline"] as const).map(m=>(
                    <button key={m} onClick={()=>setEditMode(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${editMode===m?"bg-blue-50 border-blue-300 text-blue-700":"border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                      {m==="Online"?<Video className="h-4 w-4 inline mr-1.5"/>:<MapPin className="h-4 w-4 inline mr-1.5"/>}{m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 flex gap-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold" onClick={()=>setShowModeModal(false)}>Cancel</Button>
              <Button className="flex-1 h-10 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleSaveMode}>Save Mode</Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Status Modal */}
      <AnimatePresence>
        {showStatusModal && statusTarget && (
          <ModalWrap onClose={()=>setShowStatusModal(false)}>
            <ModalHeader title="Update Interview Status" sub={`${statusTarget.candidate} — ${statusTarget.role}`} color="indigo" onClose={()=>setShowStatusModal(false)}/>
            <div className="p-6 space-y-2">
              <p className="text-xs font-semibold text-slate-500 mb-3">Current status: <Badge className={`border-0 ml-1 ${statusTarget.status==="Scheduled"?"bg-amber-100 text-amber-700":statusTarget.status==="Completed"?"bg-emerald-100 text-emerald-700":statusTarget.status==="Rescheduled"?"bg-indigo-100 text-indigo-700":"bg-red-100 text-red-700"}`}>{statusTarget.status}</Badge></p>
              {([
                { status:"Completed"   as const, label:"Mark Completed",    color:"bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700" },
                { status:"Rescheduled" as const, label:"Reschedule",        color:"bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700"   },
                { status:"Cancelled"   as const, label:"Cancel Interview",  color:"bg-red-50 hover:bg-red-100 border-red-200 text-red-700"               },
                { status:"Scheduled"   as const, label:"Keep Scheduled",    color:"bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"       },
              ]).map(opt=>(
                <button key={opt.status} onClick={()=>handleStatusUpdate(opt.status)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border font-bold text-sm transition-all ${opt.color} ${statusTarget.status===opt.status?"ring-2 ring-offset-1 ring-current opacity-70":""}`}>
                  {opt.label}
                  {statusTarget.status===opt.status&&<Badge className="border-0 bg-white/60 text-xs">Current</Badge>}
                </button>
              ))}
            </div>
            <div className="px-4 pb-4">
              <Button variant="outline" className="w-full h-10 rounded-xl font-bold" onClick={()=>setShowStatusModal(false)}>Cancel</Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Export Report Modal */}
      <AnimatePresence>
        {showExportModal && (
          <ModalWrap onClose={()=>setShowExportModal(false)}>
            <ModalHeader title="Export Report" sub="Configure and download your report" color="blue" onClose={()=>setShowExportModal(false)}/>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">Report Type</label>
                <select value={exportType} onChange={e=>setExportType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50">
                  {["Interview Schedule Report","Candidate Activity Report","Hiring Summary"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">Time Range</label>
                <div className="flex gap-2">
                  {["Today","Week","Month"].map(r=>(
                    <button key={r} onClick={()=>setExportRange(r)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${exportRange===r?"bg-blue-50 border-blue-300 text-blue-700":"border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">Format</label>
                <div className="flex gap-2">
                  {["TXT","JSON"].map(f=>(
                    <button key={f} onClick={()=>setExportFormat(f)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${exportFormat===f?"bg-blue-50 border-blue-300 text-blue-700":"border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-500 font-medium">
                <p className="font-bold text-slate-700 mb-1">Report will include:</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>Candidate names, roles, scores</li>
                  <li>Interview details, mode, status</li>
                  <li>Time filter summary ({exportRange})</li>
                </ul>
              </div>
            </div>
            <div className="p-6 flex gap-3 border-t border-slate-100 bg-slate-50/50">
              <Button variant="outline" className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200" onClick={()=>setShowExportModal(false)}>Cancel</Button>
              <Button onClick={handleExportReport} disabled={reportLoading} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-lg shadow-blue-500/20 disabled:opacity-70 gap-2">
                {reportLoading?<><Loader2 className="h-4 w-4 animate-spin"/> Exporting…</>:<><Download className="h-4 w-4"/> Generate Now</>}
              </Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          SMART ALERT MODALS
      ══════════════════════════════════════════════════ */}

      {/* A) New Applications */}
      <AnimatePresence>
        {showNewApps && (() => {
          const newCands = candidates.filter(c => c.status === "New").slice(0,3);
          return (
            <ModalWrap onClose={() => setShowNewApps(false)} maxW="max-w-xl">
              <ModalHeader title="New Applications Received" sub={`${newCands.length} new candidates applied`} color="blue" onClose={() => setShowNewApps(false)}/>
              <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
                {newCands.map(c => (
                  <div key={c.id} className="border border-slate-200 rounded-3xl p-5 bg-white hover:bg-blue-50/30 transition-all hover:shadow-xl hover:shadow-blue-500/5 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[#2563EB] font-black text-xs shrink-0 shadow-sm">
                          {c.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                        </div>
                        <div>
                          <p className="font-black text-[#0F172A] text-sm uppercase tracking-tight">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{c.id} · {c.appliedDate}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 font-black uppercase tracking-tight px-3 py-1 text-[10px]">{c.matchPct}% match</Badge>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mb-3">
                      <span className="font-bold text-slate-700">Role: </span>{c.role}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setSelectedCandidate(c); setShowNewApps(false); }}
                        className="flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all hover:scale-[1.02]"
                      >Review</button>
                      <button
                        onClick={() => {
                          setCandidates(prev => prev.map(x => x.id===c.id ? {...x, status:"Shortlisted"} : x));
                          addLog(c.name, "Shortlisted from alert", "Shortlisted", "emerald");
                          showToast(`${c.name} shortlisted`, "success");
                        }}
                        className="flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:scale-[1.02] transition-all"
                      >Shortlist</button>
                      <button
                        onClick={() => {
                          setCandidates(prev => prev.map(x => x.id===c.id ? {...x, status:"Rejected"} : x));
                          addLog(c.name, "Rejected from alert", "Rejected", "red");
                          showToast(`${c.name} rejected`, "error");
                        }}
                        className="flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:scale-[1.02] transition-all"
                      >Reject</button>
                    </div>
                  </div>
                ))}
                {newCands.length === 0 && <p className="text-center text-slate-500 py-6 text-sm font-medium">No new applications found.</p>}
              </div>
              <div className="p-4 border-t border-slate-100">
                <Button className="w-full h-9 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white text-sm" onClick={() => setShowNewApps(false)}>Close</Button>
              </div>
            </ModalWrap>
          );
        })()}
      </AnimatePresence>

      {/* B) High Match Candidate */}
      <AnimatePresence>
        {showHighMatch && (() => {
          const hm = candidates.filter(c => c.matchPct >= 85).sort((a,b) => b.matchPct - a.matchPct)[0];
          if(!hm) return null;
          return (
            <ModalWrap onClose={() => setShowHighMatch(false)} maxW="max-w-xl">
              <ModalHeader title="High Match Candidate Detected" sub={`${hm.matchPct}% match for ${hm.role}`} color="amber" onClose={() => setShowHighMatch(false)}/>
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Candidate hero */}
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 font-bold text-xl ring-4 ring-white shadow-sm shrink-0">
                    {hm.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 leading-tight">{hm.name}</p>
                    <p className="text-sm font-medium text-slate-500">{hm.role} · {hm.experience}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-3xl font-black text-emerald-600">{hm.matchPct}%</p>
                    <p className="text-xs text-slate-500 font-bold">AI Match</p>
                  </div>
                </div>
                {/* AI Summary */}
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4"/> AI Evaluation Summary</p>
                  <p className="text-sm text-slate-700 font-black leading-relaxed italic tracking-tight">"{hm.aiSummary}"</p>
                </div>
                {/* Skills */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2">✓ Matched Skills</p>
                    <div className="flex flex-wrap gap-1.5">{hm.matchedSkills.map(sk => <span key={sk} className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{sk}</span>)}</div>
                  </div>
                  {hm.missingSkills.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-2">✗ Missing Skills</p>
                      <div className="flex flex-wrap gap-1.5">{hm.missingSkills.map(sk => <span key={sk} className="text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">{sk}</span>)}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/30">
                <button
                  onClick={() => { setSelectedCandidate(hm); setShowHighMatch(false); }}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest border border-blue-200 text-blue-700 rounded-2xl hover:bg-blue-50 transition-all hover:scale-[1.02]"
                >Analysis</button>
                <button
                  onClick={() => {
                    setCandidates(prev => prev.map(x => x.id===hm.id ? {...x, status:"Shortlisted"} : x));
                    addLog(hm.name, "Shortlisted — High Match alert", "Shortlisted", "emerald");
                    showToast(`${hm.name} shortlisted`, "success");
                    setShowHighMatch(false);
                  }}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 text-white rounded-2xl transition-all hover:scale-[1.02]"
                >Shortlist</button>
                <button
                  onClick={() => {
                    setIvForm(f => ({ ...f, candidate: hm.name, role: hm.role }));
                    setShowHighMatch(false);
                    setShowAddInterview(true);
                  }}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-[#2563EB] hover:shadow-lg hover:shadow-blue-500/30 text-white rounded-2xl transition-all hover:scale-[1.02]"
                >Interview</button>
              </div>
            </ModalWrap>
          );
        })()}
      </AnimatePresence>

      {/* C) Pending Reviews */}
      <AnimatePresence>
        {showPending && (() => {
          const pendingCands = candidates.filter(c => c.status === "Reviewed" || c.status === "New");
          return (
            <ModalWrap onClose={() => setShowPending(false)} maxW="max-w-xl">
              <ModalHeader title="Pending Review Queue" sub={`${pendingCands.length} candidates awaiting review`} color="orange" onClose={() => setShowPending(false)}/>
              <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
                {pendingCands.map((c, idx) => (
                  <div key={c.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-orange-50/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-amber-800 font-bold text-xs shrink-0">
                          {c.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{c.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`border-0 font-bold text-[10px] ${c.status==="New" ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700"}`}>{c.status}</Badge>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">{c.daysAgo===0 ? "Today" : `${c.daysAgo}d ago`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${c.matchPct>=80?"bg-emerald-500":c.matchPct>=60?"bg-amber-400":"bg-red-400"}`} style={{width:`${c.matchPct}%`}}/>
                      </div>
                      <span className={`text-xs font-black ${c.matchPct>=80?"text-emerald-600":c.matchPct>=60?"text-amber-600":"text-red-500"}`}>{c.matchPct}%</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setSelectedCandidate(c); setShowPending(false); }}
                        className="flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all hover:scale-[1.02]"
                      >Review</button>
                      <button
                        onClick={() => {
                          addLog(c.name, "Marked priority", "Priority", "amber");
                          showToast(`${c.name} priority set`, "info");
                        }}
                        className="flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 transition-all hover:scale-[1.02]"
                      >Priority</button>
                      <button
                        onClick={() => {
                          addLog("Aisha Sharma", `Assigned to ${c.name}`, "Assigned", "blue");
                          showToast(`Assigned to Aisha`, "info");
                        }}
                        className="flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl bg-[#2563EB] text-white shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-all"
                      >Assign</button>
                    </div>
                  </div>
                ))}
                {pendingCands.length === 0 && <p className="text-center text-slate-500 py-6 text-sm font-medium">No pending reviews found.</p>}
              </div>
              <div className="p-4 border-t border-slate-100">
                <Button className="w-full h-9 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white text-sm" onClick={() => setShowPending(false)}>Close</Button>
              </div>
            </ModalWrap>
          );
        })()}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      </AnimatePresence>
      <AdminProfileDrawer
        config={JOB_ADMIN_CONFIG}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLogout={handleLogout}
        onUpdate={handleUpdateProfile}
      />
    </motion.div>
  );
}
