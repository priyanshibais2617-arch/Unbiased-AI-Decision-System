import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LogOut, Users, Activity, Bell,
  Search, Clock, ChevronDown, CheckCircle2,
  XCircle, AlertTriangle, ShieldAlert, BarChart3,
  FileCheck, Building2,
  MoreVertical, RefreshCw, Zap, Upload, TrendingUp, TrendingDown,
  X, CheckCheck, StickyNote, UserCheck, Archive, Eye, Flag, Star,
  IndianRupee, IndianRupee as RupeeIcon, IndianRupee as InrIcon, ArrowLeft,
  FileText, AlertCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUser } from "./UserContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { AdminProfileDrawer, AdminProfileConfig } from "./AdminProfileDrawer";
import { apiFetch } from "../api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatINR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

// ─── Types ────────────────────────────────────────────────────────────────────
interface App {
  id: string; name: string; email: string; amount: number;
  income: number; emai: number; score: number; prob: number;
  risk: string; bank: string; bankRate: number; status: string;
  docs: { identity: string; address: string; income: string };
  aiReason: string;
}
interface LogEntry { id: number; actor: string; action: string; time: string; chip: "Started"|"Processing"|"Completed"|"Escalated" }
interface RiskCase  { id: string; name: string; riskType: string; severity: string; status: string }

// ─── Static seed data ─────────────────────────────────────────────────────────
const SEED_APPS: App[] = [
  { id:"APP-001", name:"Rahul Verma",  email:"rahul.v@example.com",  amount:4500000, income:120000, emai:15000, score:85, prob:92, risk:"Low",   bank:"HDFC Bank",  bankRate:8.5, status:"Pending",     docs:{identity:"Verified",address:"Verified",income:"Verified"}, aiReason:"Stable income and excellent debt-to-income ratio. Strong historical credit." },
  { id:"APP-002", name:"Priya Sharma", email:"priya.s@example.com",  amount:1200000, income:45000,  emai:25000, score:62, prob:45, risk:"Medium",bank:"SBI",        bankRate:8.7, status:"Under Review", docs:{identity:"Verified",address:"Pending", income:"Verified"}, aiReason:"High existing EMI reduces repayment capacity. Address proof needs manual check." },
  { id:"APP-003", name:"Amit Kumar",   email:"amit.k@example.com",   amount:8500000, income:65000,  emai:5000,  score:45, prob:12, risk:"High",  bank:"ICICI Bank", bankRate:8.9, status:"Pending",     docs:{identity:"Failed", address:"Verified",income:"Verified"}, aiReason:"Requested amount disproportionate to declared income. Identity OCR mismatch." },
  { id:"APP-004", name:"Sneha Reddy",  email:"sneha.r@example.com",  amount:2500000, income:95000,  emai:0,     score:92, prob:98, risk:"Low",   bank:"Axis Bank",  bankRate:8.4, status:"Approved",    docs:{identity:"Verified",address:"Verified",income:"Verified"}, aiReason:"Zero existing debt. High steady income. Premium profile." },
  { id:"APP-005", name:"Vikram Singh", email:"vikram.s@example.com", amount:500000,  income:35000,  emai:12000, score:58, prob:25, risk:"High",  bank:"Kotak Bank", bankRate:9.1, status:"Rejected",    docs:{identity:"Verified",address:"Verified",income:"Verified"}, aiReason:"Multiple recent loan inquiries combined with high current debt utilization." },
];

const SEED_LOG: LogEntry[] = [
  { id:1,  actor:"Rahul Verma",   action:"Applied for Loan — APP-001",                time:"2 mins ago",   chip:"Started"    },
  { id:2,  actor:"Sneha Reddy",   action:"Uploaded Income Docs — APP-004",            time:"15 mins ago",  chip:"Processing" },
  { id:3,  actor:"System Admin",  action:"Viewed APP-002 results",                   time:"1 hr ago",     chip:"Completed"  },
  { id:4,  actor:"System",        action:"OCR re-verified for APP-003",               time:"1 hr ago",     chip:"Completed"  },
  { id:5,  actor:"Admin",         action:"Loan approved — APP-004",                  time:"2 hrs ago",    chip:"Completed"  },
  { id:6,  actor:"Amit Kumar",    action:"Loan rejected — High risk score",          time:"2 hrs ago",    chip:"Completed"  },
  { id:7,  actor:"Admin",         action:"Risk case escalated — Identity OCR Mismatch (APP-003)", time:"3 hrs ago", chip:"Escalated" },
  { id:8,  actor:"Priya Sharma",  action:"Additional documents requested — APP-002", time:"3 hrs ago",    chip:"Processing" },
  { id:9,  actor:"Admin",         action:"Officer Priti Bhatt assigned to APP-001",  time:"4 hrs ago",    chip:"Completed"  },
  { id:10, actor:"Deepak Nair",   action:"Applied for Loan — APP-007",               time:"5 hrs ago",    chip:"Started"    },
  { id:11, actor:"Admin",         action:"Deepak Nair marked safe — risk cleared",   time:"5 hrs ago",    chip:"Completed"  },
  { id:12, actor:"Vikram Singh",  action:"Loan rejected — Multiple loan inquiries",  time:"6 hrs ago",    chip:"Completed"  },
  { id:13, actor:"System",        action:"Documents re-verified for APP-005",        time:"6 hrs ago",    chip:"Completed"  },
  { id:14, actor:"Admin",         action:"Risk case escalated — Suspicious Income Docs (APP-009)", time:"7 hrs ago", chip:"Escalated" },
  { id:15, actor:"Kavya Mehta",   action:"Applied for Loan — APP-009",               time:"8 hrs ago",    chip:"Started"    },
  { id:16, actor:"Admin",         action:"Application APP-005 archived",             time:"9 hrs ago",    chip:"Completed"  },
  { id:17, actor:"Arjun Das",     action:"Applied for Loan — APP-012",               time:"10 hrs ago",   chip:"Started"    },
  { id:18, actor:"Admin",         action:"Officer Sandeep Roy assigned to APP-002", time:"11 hrs ago",   chip:"Completed"  },
  { id:19, actor:"System",        action:"Pending Approvals Queue alert triggered",  time:"12 hrs ago",   chip:"Processing" },
  { id:20, actor:"Admin",         action:"Mark Priority set on APP-003",             time:"Yesterday",    chip:"Completed"  },
];

const RISK_CASES: RiskCase[] = [
  { id:"APP-003", name:"Amit Kumar",  riskType:"Identity OCR Mismatch",     severity:"High",   status:"Flagged" },
  { id:"APP-007", name:"Deepak Nair", riskType:"Multiple Loan Inquiries",   severity:"Medium", status:"Flagged" },
  { id:"APP-009", name:"Kavya Mehta", riskType:"Suspicious Income Docs",    severity:"High",   status:"Flagged" },
  { id:"APP-012", name:"Arjun Das",   riskType:"Address Verification Fail", severity:"Medium", status:"Flagged" },
];

const OFFICERS = ["Priti Bhatt", "Sandeep Roy", "Meera Nair", "Arjun Pillai", "Devika Joshi"];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success"|"error"|"info"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success:"bg-emerald-600", error:"bg-red-600", info:"bg-[#7C3AED]" };
  return (
    <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:40}}
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-bold shadow-xl text-sm ${colors[type]}`}>
      {type==="success"?<CheckCircle2 className="h-5 w-5 shrink-0"/>:type==="error"?<XCircle className="h-5 w-5 shrink-0"/>:<AlertCircle className="h-5 w-5 shrink-0"/>}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="h-4 w-4"/></button>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LoanAdminDashboard() {
  const navigate = useNavigate();
  const { setUserRole } = useUser();

  // Core state
  const [apps, setApps]                   = useState<App[]>(SEED_APPS);
  const [activityLog, setActivityLog]     = useState<LogEntry[]>(SEED_LOG);
  const [logCounter, setLogCounter]       = useState(100);
  const [selectedApp, setSelectedApp]     = useState<App | null>(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [filterStatus, setFilterStatus]   = useState("All");
  const [isProfileDDOpen, setIsProfileDDOpen] = useState(false);
  const [loanNotifOpen, setLoanNotifOpen]     = useState(false);
  const [loanNotifications, setLoanNotifications] = useState([
    { id: "1", text: "New loan application received", sub: "Rahul Verma submitted APP-001 — ₹45L Home Loan.", time: "2 min ago", read: false },
    { id: "2", text: "High risk case flagged", sub: "APP-003 — Identity OCR mismatch detected.", time: "1 hr ago", read: false },
    { id: "3", text: "Document mismatch detected", sub: "APP-009 — Suspicious income docs flagged by AI.", time: "3 hrs ago", read: false },
    { id: "4", text: "Pending approval waiting", sub: "12 applications waiting over 2 hours for review.", time: "5 hrs ago", read: true },
  ]);

  const [isExiting, setIsExiting]         = useState(false);
  const [toast, setToast]                 = useState<{msg:string;type:"success"|"error"|"info"}|null>(null);
  const menuRef                           = useRef<HTMLTableSectionElement>(null);
  const [openMenuId, setOpenMenuId]       = useState<string | null>(null);
  const [activeCard, setActiveCard]       = useState<string | null>(null);
  
  // Modal states
  const [showApprove, setShowApprove]     = useState(false);
  const [showReject, setShowReject]       = useState(false);
  const [rejectReason, setRejectReason]   = useState("");
  const [showDocs, setShowDocs]           = useState(false);
  const [docsChecklist, setDocsChecklist] = useState<string[]>([]);
  const [docNote, setDocNote]             = useState("");
  const [showReverify, setShowReverify]   = useState(false);
  const [verifyState, setVerifyState]     = useState<"idle"|"verifying"|"done">("idle");
  const [showAvgModal, setShowAvgModal]   = useState(false);

  useEffect(() => {
    apiFetch("/admin/service-analyses?service_type=loan")
      .then((response) => {
        const analyses = Array.isArray(response.data) ? response.data : [];
        if (!analyses.length) return;
        const mapped = analyses.slice(0, 25).map((item: any, index: number): App => {
          const result = item.result || {};
          const approvedAmount = Number(result.approvedAmount || 0);
          const probability = Number(result.approvalProbability || Math.max(0, 100 - Number(result.riskScore || 100)));
          const riskScore = Number(result.riskScore || 100 - probability);
          const risk = riskScore <= 35 ? "Low" : riskScore <= 65 ? "Medium" : "High";
          const email = item.created_by || `applicant${index + 1}@example.com`;
          const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
          const docs = (result.documentChecks || []).reduce((acc: any, doc: any) => {
            acc[doc.docType] = doc.present ? "Verified" : "Pending";
            return acc;
          }, {});
          return {
            id: `APP-AI-${String(index + 1).padStart(3, "0")}`,
            name,
            email,
            amount: approvedAmount,
            income: 0,
            emai: 0,
            score: probability,
            prob: probability,
            risk,
            bank: "AI Recommended Bank",
            bankRate: Number(result.interestRate || 0),
            status: result.decision === "approved" ? "Approved" : "Under Review",
            docs: { identity: docs.identity || "Verified", address: docs.address || "Verified", income: docs.salary || docs.itr || "Verified" },
            aiReason: result.reason || "AI financial analysis completed from uploaded documents.",
          };
        });
        setApps(mapped);
        setActivityLog(mapped.slice(0, 20).map((app, index) => ({
          id: index + 1,
          actor: app.name,
          action: `Real loan analysis completed - ${app.status} (${app.prob}% probability)`,
          time: "Backend analysis",
          chip: app.status === "Approved" ? "Completed" : "Processing",
        })));
        setHighRiskCount(mapped.filter((app) => app.risk === "High").length);
      })
      .catch(() => showToast("Could not load real loan analyses", "error"));
  }, []);

  // Risk & Fraud states
  const [riskCases, setRiskCases]         = useState<RiskCase[]>(RISK_CASES);
  const [highRiskCount, setHighRiskCount] = useState(4);
  const [showRiskModal, setShowRiskModal] = useState(false);

  // Action Menu states
  const [menuTargetApp, setMenuTargetApp] = useState<App | null>(null);
  const [showAssignOfficer, setShowAssignOfficer] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [assignedOfficers, setAssignedOfficers] = useState<Record<string, string>>({});
  const [showAddNote, setShowAddNote]     = useState(false);
  const [noteText, setNoteText]           = useState("");
  const [appNotes, setAppNotes]           = useState<Record<string, string>>({});
  const [archivedIds, setArchivedIds]     = useState<Set<string>>(new Set());
  const [priorityIds, setPriorityIds]     = useState<Set<string>>(new Set());
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Smart Alert states
  const [showFailedUploads, setShowFailedUploads] = useState(false);
  const [showPendingQueue, setShowPendingQueue]   = useState(false);
  const [isPendingQueueResolved, setIsPendingQueueResolved] = useState(false);

  // Activity Log states
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [logFilter, setLogFilter]             = useState("All");
  const [logSearch, setLogSearch]             = useState("");
  const [logSort, setLogSort]                 = useState("newest");
  const [logDetail, setLogDetail]             = useState<LogEntry | null>(null);

  const handleBackToHome = () => {
    setIsExiting(true);
    setTimeout(() => navigate("/"), 400);
  };

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("loanAdminProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleUpdateProfile = (newData: any) => {
    const updated = { ...profile, ...newData };
    setProfile(updated);
    localStorage.setItem("loanAdminProfile", JSON.stringify(updated));
  };

  const LOAN_ADMIN_CONFIG: AdminProfileConfig = {
    type: "loan",
    name: profile?.fullName || profile?.name || "Rahul Verma",
    initials: (profile?.fullName || profile?.name || "RV").split(" ").map((n: string) => n[0]).join("").slice(0, 2),
    email: profile?.email || "rahul.verma@hdfc.com",
    role: profile?.adminRole || profile?.role || "Loan Officer",
    gradientHeader: "bg-gradient-to-br from-[#4C1D95] via-[#7C3AED] to-[#A855F7]",
    accentColor: "purple",
    aiTag: "AI Risk Engine Active",
    profileInfo: [
      { label: "Bank / Org",   value: profile?.orgName || "HDFC Bank",      span: true },
      { label: "Department",   value: profile?.department || "Risk Assessment" },
      { label: "Role",         value: profile?.adminRole || profile?.role || "Loan Officer" },
      { label: "Employee ID",  value: profile?.employeeId || "LN-2024-0042" },
      { label: "Experience",   value: (profile?.yearsOfExperience ? `${profile.yearsOfExperience} Years` : "4+ Years") },
    ],
    metrics: [
      { label: "Reviewed",      value: "1,248", color: "emerald" },
      { label: "Approval Rate", value: "92%",   color: "purple" },
      { label: "High Risk",     value: "12",    color: "red" },
    ],
    notifications: [
      { id: "1", text: "High Risk Case Flagged",     sub: "APP-003 — Identity OCR Mismatch detected.",      time: "1 hr ago",  read: false },
      { id: "2", text: "Document Mismatch Detected", sub: "APP-009 — Suspicious income docs flagged.",       time: "3 hrs ago", read: false },
      { id: "3", text: "4 Pending Approvals",        sub: "12 applications waiting > 2 hours for review.",  time: "5 hrs ago", read: true },
    ],
    settingsLabel: "Loan Settings",
    settingsItems: [
      { key: "riskThreshold",  label: "Risk Threshold",           desc: "Flag applications above 70% risk score" },
      { key: "docVerify",      label: "Auto Document Verify",      desc: "Auto-verify identity via OCR" },
      { key: "autoPriority",   label: "Auto Priority Queue",       desc: "High risk cases jump the queue" },
      { key: "emailAlerts",    label: "Email Alerts",              desc: "Send fraud alerts via email" },
    ],
  };

  const handleLogout = () => { setUserRole(null); navigate("/"); };
  const showToast = (msg:string, type:"success"|"error"|"info"="success") => setToast({msg,type});
  const addLog = (actor:string, action:string, chip:LogEntry["chip"]="Completed") => {
    setLogCounter(c => c+1);
    setActivityLog(prev => [{ id: logCounter+1, actor, action, time:"just now", chip }, ...prev]);
  };

  // Close menu on outside click
  useEffect(() => {
    const h = (e:MouseEvent) => { if(menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Sync selectedApp when apps changes
  useEffect(() => {
    if(selectedApp) setSelectedApp(apps.find(a => a.id===selectedApp.id) ?? null);
  }, [apps]);

  const updateStatus = (id:string, status:string) =>
    setApps(prev => prev.map(a => a.id===id ? {...a, status} : a));

  // ── Summary card click handler ──
  const handleCardClick = (key: string) => {
    if(key === "Avg Review") { setShowAvgModal(true); return; }
    const statusMap: Record<string,string> = {
      "Pending":        "Pending",
      "Docs Requested": "Docs Requested",
      "High Risk":      "High Risk",
    };
    const newFilter = activeCard === key ? null : key;
    setActiveCard(newFilter);
    if(!newFilter) { setFilterStatus("All"); return; }
    if(key === "High Risk") {
      setFilterStatus("All"); // handled in filteredApps
    } else {
      setFilterStatus(statusMap[key] ?? "All");
    }
  };

  // Approve
  const confirmApprove = () => {
    if(!selectedApp) return;
    updateStatus(selectedApp.id, "Approved");
    addLog(selectedApp.name, `Loan approved — ${selectedApp.id}`, "Completed");
    showToast("Loan application approved successfully", "success");
    setShowApprove(false);
  };

  // Reject
  const confirmReject = () => {
    if(!selectedApp || !rejectReason) return;
    updateStatus(selectedApp.id, "Rejected");
    addLog(selectedApp.name, `Loan rejected — ${rejectReason}`, "Completed");
    showToast("Loan application rejected", "error");
    setShowReject(false); setRejectReason("");
  };

  // Request Docs
  const confirmRequestDocs = () => {
    if(!selectedApp || docsChecklist.length===0) return;
    updateStatus(selectedApp.id, "Docs Requested");
    addLog(selectedApp.name, `Additional documents requested`, "Processing");
    showToast("Document request sent successfully", "success");
    setShowDocs(false); setDocsChecklist([]); setDocNote("");
  };

  // Re-verify
  const confirmReverify = () => {
    if(!selectedApp) return;
    setShowReverify(false);
    setVerifyState("verifying");
    setTimeout(() => {
      setVerifyState("done");
      addLog("System", `Documents re-verified for ${selectedApp.id}`, "Completed");
      showToast("Document verification completed", "success");
      setTimeout(() => setVerifyState("idle"), 3000);
    }, 2000);
  };

  // Risk actions
  const markSafe = (caseId:string, name:string) => {
    setRiskCases(prev => prev.map(c => c.id===caseId ? {...c, status:"Safe"} : c));
    setHighRiskCount(c => Math.max(0, c-1));
    addLog("Admin", `${name} marked safe — risk cleared`, "Completed");
    showToast("Application marked safe", "success");
  };
  const escalateCase = (c:RiskCase) => {
    setRiskCases(prev => prev.map(rc => rc.id===c.id ? {...rc, status:"Escalated"} : rc));
    addLog(c.name, `Risk case escalated — ${c.riskType}`, "Escalated");
    showToast(`Case ${c.id} escalated`, "info");
  };

  // Three-dot actions
  const openMenu = (app:App) => { setMenuTargetApp(app); setOpenMenuId(app.id); };
  
  const confirmAssignOfficer = () => {
    if(!menuTargetApp || !selectedOfficer) return;
    setAssignedOfficers(prev => ({...prev, [menuTargetApp.id]: selectedOfficer}));
    addLog("Admin", `Officer ${selectedOfficer} assigned to ${menuTargetApp.id}`, "Completed");
    showToast("Officer assigned successfully", "success");
    setShowAssignOfficer(false); setSelectedOfficer("");
  };

  const confirmAddNote = () => {
    if(!menuTargetApp || !noteText.trim()) return;
    setAppNotes(prev => ({...prev, [menuTargetApp.id]: noteText}));
    addLog("Admin", `Internal note added to ${menuTargetApp.id}`, "Completed");
    showToast("Internal note added", "success");
    setShowAddNote(false); setNoteText("");
  };

  const confirmArchive = () => {
    if(!menuTargetApp) return;
    setArchivedIds(prev => new Set([...prev, menuTargetApp.id]));
    addLog("Admin", `Application ${menuTargetApp.id} archived successfully`, "Completed");
    showToast("Application archived successfully", "success");
    setShowArchiveConfirm(false);
    if(selectedApp?.id===menuTargetApp.id) setSelectedApp(null);
  };

  const markPriority = (app:App) => {
    setPriorityIds(prev => { 
      const s = new Set(prev); 
      const isAlreadyPrio = s.has(app.id);
      if(isAlreadyPrio) {
        s.delete(app.id);
        showToast("Priority removed", "info");
      } else {
        s.add(app.id);
        addLog("Admin", `Marked ${app.id} as priority`, "Completed");
        showToast("Application marked as priority", "success");
      }
      return s; 
    });
    setOpenMenuId(null);
  };

  const handleReviewNow = (app: App) => {
    updateStatus(app.id, "Under Review");
    setSelectedApp(app);
    setShowPendingQueue(false);
    addLog("Admin", `Review started for ${app.id}`, "Processing");
  };

  const handleResolvePendingQueue = () => {
    setIsPendingQueueResolved(true);
    showToast("Pending approval queue resolved", "success");
    setShowPendingQueue(false);
  };

  // Derived filtered apps
  const filteredApps = apps.filter(a => {
    if(archivedIds.has(a.id)) return false;
    if(activeCard === "High Risk") return a.risk === "High";
    if(filterStatus !== "All" && a.status !== filterStatus) return false;
    if(searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const aPrio = priorityIds.has(a.id) ? 1 : 0;
    const bPrio = priorityIds.has(b.id) ? 1 : 0;
    return bPrio - aPrio;
  });

  const getStatusBadge = (status:string) => {
    const map: Record<string,string> = {
      "Approved":"bg-emerald-100 text-emerald-700", "Rejected":"bg-red-100 text-red-700",
      "Under Review":"bg-yellow-100 text-yellow-700", "Docs Requested":"bg-purple-100 text-purple-700",
    };
    return <Badge className={`${map[status]??"bg-blue-100 text-blue-700"} hover:opacity-90 border-0`}>{status}</Badge>;
  };

  const getRiskDot = (risk:string) => {
    const c = risk==="Low"?"emerald":risk==="Medium"?"yellow":"red";
    return <span className={`flex items-center gap-1.5 text-xs font-bold text-${c}-600`}><span className={`h-2 w-2 rounded-full bg-${c}-500`}/>{risk}</span>;
  };

  const chipColor: Record<string,string> = {
    Started:"bg-purple-50 text-purple-700", Processing:"bg-purple-50 text-purple-700",
    Completed:"bg-emerald-50 text-emerald-700", Escalated:"bg-red-50 text-red-700",
  };

  const overviewStats = [
    { title:"Total Applications", value:"1,248", trend:"+12.5%", isUp:true,  icon:Users,        color:"purple",  suffix:"Today" },
    { title:"Pending Reviews",    value:"342",   trend:"-2.4%",  isUp:false, icon:Clock,        color:"amber",   suffix:"Queue" },
    { title:"Approved Loans",     value:"850",   trend:"+18.2%", isUp:true,  icon:CheckCircle2, color:"emerald", suffix:"Today" },
    { title:"Rejected Loans",     value:"56",    trend:"-5.1%",  isUp:false, icon:XCircle,      color:"red",     suffix:"Today" },
  ];

  const pendingQueue = apps.filter(a => a.status==="Pending" || a.status==="Under Review").slice(0,4);

  // Summary cards
  const summaryCards = [
    { key:"Pending",        val: apps.filter(a=>a.status==="Pending").length,         color:"purple", label:"Pending"         },
    { key:"Docs Requested", val: apps.filter(a=>a.status==="Docs Requested").length,  color:"fuchsia",label:"Docs Requested"  },
    { key:"High Risk",      val: highRiskCount,                                        color:"red",    label:"High Risk"       },
    { key:"Avg Review",     val: "4.5m",                                               color:"emerald",label:"Avg Review"      },
  ];

  // Modal helpers
  const Backdrop = ({ onClose }:{ onClose:()=>void }) => (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50" onClick={onClose}/>
  );
  const ModalWrap = ({ children, onClose, maxW="max-w-lg" }:{ children:React.ReactNode; onClose:()=>void; maxW?:string }) => (
    <>
      <Backdrop onClose={onClose}/>
      <motion.div initial={{opacity:0,scale:0.94,y:24}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.94,y:24}}
        transition={{type:"spring",damping:26,stiffness:280}}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-[24px] shadow-2xl w-full ${maxW} overflow-hidden border border-slate-100`}
          onClick={e=>e.stopPropagation()}>{children}</div>
      </motion.div>
    </>
  );
  const ModalHeader = ({ title, sub, color="purple", onClose }:{ title:string; sub?:string; color?:string; onClose:()=>void }) => (
    <div className={`bg-gradient-to-r from-${color}-600 to-${color}-700 text-white px-6 py-5 flex justify-between items-start`}>
      <div><h2 className="text-lg font-black">{title}</h2>{sub&&<p className="text-white/75 text-sm mt-0.5 font-medium">{sub}</p>}</div>
      <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/20 transition-colors mt-0.5"><X className="h-5 w-5"/></button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-50/50 pb-12 font-sans"
      onClick={() => { setIsProfileDDOpen(false); setOpenMenuId(null); setLoanNotifOpen(false); }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
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
            <div className="p-2 bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] rounded-xl shadow-[0_4px_10px_rgba(124,58,237,0.2)]">
              <Building2 className="h-5 w-5 text-white"/>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Loan Admin Dashboard</h1>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-1">AI-Based Loan Processing System</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4" onClick={e=>e.stopPropagation()}>

            {/* Bell with notification dropdown */}
            <div className="relative">
              <Button variant="ghost" size="icon"
                onClick={() => { setLoanNotifOpen(!loanNotifOpen); setIsProfileDDOpen(false); }}
                className="relative text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full h-10 w-10"
              >
                <Bell className="h-5 w-5"/>
                {loanNotifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"/>
                )}
              </Button>
              <AnimatePresence>
                {loanNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-[#7C3AED]" /> Notifications
                        {loanNotifications.some(n => !n.read) && (
                          <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 font-bold">
                            {loanNotifications.filter(n => !n.read).length}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setLoanNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                          className="text-[11px] font-bold text-[#7C3AED] hover:text-[#6D28D9] transition-colors">Mark all read</button>
                        <span className="text-slate-300 text-xs">|</span>
                        <button onClick={() => setLoanNotifications([])}
                          className="text-[11px] font-bold text-slate-500 hover:text-red-600 transition-colors">Clear all</button>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                      {loanNotifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-400 font-medium">No notifications available</div>
                      ) : loanNotifications.map(n => (
                        <div key={n.id}
                          onClick={() => setLoanNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                          className={`p-3 flex gap-3 hover:bg-purple-50/30 transition-colors cursor-pointer ${n.read ? "opacity-60" : ""}`}
                        >
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.read ? "bg-slate-100" : "bg-purple-50"}`}>
                            <Bell className={`h-4 w-4 ${n.read ? "text-slate-400" : "text-[#7C3AED]"}`} />
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

            {/* Circular profile avatar → opens drawer */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setIsProfileDDOpen(!isProfileDDOpen); setLoanNotifOpen(false); }}
                className="relative h-10 w-10 rounded-full focus:outline-none group"
                title="Rahul Verma – Loan Officer"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                  {LOAN_ADMIN_CONFIG.initials}
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">

        {/* ── OVERVIEW CARDS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {overviewStats.map((stat,i)=>(
            <motion.div key={i} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.08}}>
              <Card className="rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white relative overflow-hidden group">
                <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${stat.color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`}/>
                <CardContent className="p-5 flex flex-col h-full relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}><stat.icon className="h-5 w-5"/></div>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${stat.isUp?"bg-emerald-50 text-emerald-600":"bg-red-50 text-red-600"}`}>
                      {stat.isUp?<TrendingUp className="h-3 w-3"/>:<TrendingDown className="h-3 w-3"/>} {stat.trend}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                    <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center justify-between">
                      {stat.title}<span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{stat.suffix}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left — Applications Queue */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-[24px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 px-6">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-[#7C3AED]"/> Loan Applications Queue
                  </CardTitle>
                  {activeCard && activeCard !== "Avg Review" && (
                    <p className="text-xs text-[#7C3AED] font-semibold mt-1 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED] animate-pulse inline-block"/>
                      Filtered: {activeCard}
                      <button onClick={()=>{ setActiveCard(null); setFilterStatus("All"); }} className="underline ml-1 text-slate-400 hover:text-slate-600">Clear</button>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                    <input type="text" placeholder="Search applicants…"
                      className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] w-full sm:w-56 outline-none transition-all shadow-sm font-medium"
                      value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                  </div>
                  <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl p-1 bg-white shadow-sm shrink-0">
                    {["All","Pending","Under Review","Approved","Rejected"].map(s=>(
                      <button key={s} onClick={()=>{ setFilterStatus(s); setActiveCard(null); }}
                        className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus===s && !activeCard?"bg-purple-50 text-[#7C3AED] shadow-sm":"text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Applicant</th>
                      <th className="px-6 py-4">Loan Request</th>
                      <th className="px-6 py-4 text-center">AI Score &amp; Risk</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium" ref={menuRef}>
                    {filteredApps.map((app,i)=>(
                      <tr key={i} className={`hover:bg-slate-50/70 transition-colors group relative ${priorityIds.has(app.id)?"bg-amber-50/40":""} ${activeCard==="High Risk" && app.risk==="High"?"bg-red-50/30":""}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 shrink-0 relative">
                              {app.name.substring(0,2).toUpperCase()}
                              {priorityIds.has(app.id) && <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full flex items-center justify-center"><Star className="h-2.5 w-2.5 text-white fill-white"/></span>}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight group-hover:text-[#7C3AED] transition-colors flex items-center gap-1.5">
                                {app.name}
                                {appNotes[app.id] && <StickyNote className="h-3.5 w-3.5 text-amber-400" title={appNotes[app.id]}/>}
                                {assignedOfficers[app.id] && <UserCheck className="h-3.5 w-3.5 text-blue-400" title={`Assigned: ${assignedOfficers[app.id]}`}/>}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{app.id} • {app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-black text-slate-800">{formatINR(app.amount)}</p>
                          <p className="text-[11px] font-bold text-slate-500 mt-0.5 flex items-center gap-1"><Building2 className="h-3 w-3"/> {app.bank} ({app.bankRate}%)</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge className={`bg-transparent text-slate-700 border border-slate-200 px-2 flex items-center gap-1 ${app.score>70?"bg-emerald-50 border-emerald-100":""}`}>
                                <Activity className="h-3 w-3"/> {app.score}/100
                              </Badge>
                              <Badge className="bg-transparent text-slate-700 border border-slate-200 px-2 flex items-center gap-1">
                                <Zap className="h-3 w-3"/> {app.prob}% Apv
                              </Badge>
                            </div>
                            {getRiskDot(app.risk)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(app.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <Button onClick={()=>setSelectedApp(app)} variant="outline" size="sm" className="h-8 rounded-lg border-purple-200 bg-purple-50 text-[#7C3AED] hover:bg-purple-100 font-bold shadow-sm transition-all hover:scale-[1.02]">
                            View Details
                          </Button>
                          <div className="relative inline-block" onClick={e=>e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={()=>openMenu(app)}
                              className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                              <MoreVertical className="h-4 w-4"/>
                            </Button>
                            <AnimatePresence>
                              {openMenuId===app.id && (
                                <motion.div initial={{opacity:0,scale:0.9,y:-8}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9,y:-8}} transition={{duration:0.12}}
                                  className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right">
                                  {[
                                    { label:"View Full Profile",   icon:Eye,       action:()=>{ setMenuTargetApp(app); setShowFullProfile(true); addLog("Admin", `Viewed full profile — ${app.id}`, "Completed"); setOpenMenuId(null); }},
                                    { label:"Assign Officer",      icon:UserCheck, action:()=>{ setMenuTargetApp(app); setShowAssignOfficer(true);   setOpenMenuId(null); }},
                                    { label:"Mark Priority",       icon:Star,      action:()=>markPriority(app) },
                                    { label:"Add Internal Note",   icon:StickyNote,action:()=>{ setMenuTargetApp(app); setShowAddNote(true);         setOpenMenuId(null); }},
                                    { label:"Archive Application", icon:Archive,   action:()=>{ setMenuTargetApp(app); setShowArchiveConfirm(true);  setOpenMenuId(null); }, danger:true },
                                  ].map(item=>(
                                    <button key={item.label} onClick={item.action}
                                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors text-left ${(item as any).danger?"text-red-600 hover:bg-red-50":"text-slate-700 hover:bg-slate-50"}`}>
                                      <item.icon className="h-4 w-4 shrink-0"/>
                                      {item.label}
                                      {item.label==="Mark Priority" && priorityIds.has(app.id) && <Badge className="ml-auto bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 h-4">On</Badge>}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredApps.length===0 && (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium bg-slate-50/50">
                        No applications found{activeCard ? ` for filter: ${activeCard}` : ""}.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* ── BOTTOM ROW: Summary Cards + Activity + Alerts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Summary Cards + Activity Log stacked */}
              <div className="lg:col-span-2 space-y-4">

                {/* Clickable Summary Cards */}
                <div className="grid grid-cols-4 gap-3">
                  {summaryCards.map(s=>(
                    <button key={s.key} onClick={()=>handleCardClick(s.key)}
                      className={`rounded-2xl border p-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none ${
                        activeCard===s.key
                          ? `bg-${s.color}-100 border-${s.color}-300 ring-2 ring-${s.color}-400/40`
                          : `bg-${s.color}-50 border-${s.color}-100`
                      }`}>
                      <p className={`text-xl font-black text-${s.color}-700`}>{s.val}</p>
                      <p className={`text-[11px] font-bold text-${s.color}-500 mt-0.5 uppercase tracking-wide`}>{s.label}</p>
                      {activeCard === s.key && (
                        <span className={`mt-1 inline-block text-[10px] font-bold text-${s.color}-600 bg-${s.color}-200 px-1.5 rounded-full`}>Active</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Recent Activity Log */}
                <Card className="rounded-[24px] border border-slate-200 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between px-6 py-4">
                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-slate-400"/> Recent Activity Log
                    </CardTitle>
                    <button
                      onClick={() => { setShowActivityLog(true); setLogFilter("All"); setLogSearch(""); setLogSort("newest"); }}
                      className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] transition-colors flex items-center gap-1 group"
                    >
                      View All
                      <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-slate-50 font-medium">
                        {activityLog.slice(0,6).map(entry=>(
                          <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 whitespace-nowrap"><span className="font-bold text-slate-900 text-xs">{entry.actor}</span></td>
                            <td className="px-5 py-3 text-slate-600 text-xs">{entry.action}</td>
                            <td className="px-5 py-3 text-slate-400 text-[11px] whitespace-nowrap">{entry.time}</td>
                            <td className="px-5 py-3 text-right"><Badge className={`${chipColor[entry.chip]??"bg-slate-50 text-slate-600"} border-0 shadow-none text-[11px]`}>{entry.chip}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>

              {/* Smart Alerts */}
              <Card className="rounded-[24px] border border-amber-100 shadow-sm bg-white overflow-hidden self-start">
                <CardHeader className="bg-amber-50/50 border-b border-amber-100 pb-3 px-5 pt-4">
                  <CardTitle className="text-base font-bold text-amber-900 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-amber-500"/> Smart Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex gap-3 group hover:border-amber-200 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center shrink-0"><XCircle className="h-4 w-4 text-red-500"/></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-0.5 group-hover:text-amber-700 transition-colors">Failed document uploads</p>
                      <p className="text-xs text-slate-500 font-medium">3 applications have unreadable Aadhaar scans.</p>
                      <button onClick={()=>setShowFailedUploads(true)} className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-wider mt-1.5 hover:text-[#6D28D9] transition-colors">View Details</button>
                    </div>
                  </div>
                  {!isPendingQueueResolved && (
                    <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex gap-3 group hover:border-amber-200 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><RefreshCw className="h-4 w-4 text-blue-500"/></div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-0.5 group-hover:text-amber-700 transition-colors">Pending Approvals Queue</p>
                        <p className="text-xs text-slate-500 font-medium">12 applications waiting &gt;2 hours for review.</p>
                        <button onClick={()=>setShowPendingQueue(true)} className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-wider mt-1.5 hover:text-[#6D28D9] transition-colors">Resolve Now</button>
                      </div>
                    </div>
                  )}
                  {isPendingQueueResolved && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0"/>
                      <p className="text-xs font-bold text-emerald-800">Pending approval queue resolved</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5 lg:col-span-1">

            {/* Risk & Fraud */}
            <Card className="rounded-[24px] border border-red-100 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-red-50 to-white border-b border-red-50 pb-4 px-5 pt-5">
                <CardTitle className="text-base font-bold text-red-900 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500"/> Risk &amp; Fraud Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl relative overflow-hidden group hover:bg-red-100/50 transition-colors">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform"><AlertTriangle className="h-10 w-10 text-red-600"/></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-0.5">High Risk Apps</p>
                      <p className="text-2xl font-black text-red-600 tracking-tight">{highRiskCount}</p>
                    </div>
                    <button onClick={()=>setShowRiskModal(true)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                      Review
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { dot:"yellow", label:"Suspicious Docs", val:"4",     scheme:"slate"   },
                    { dot:"red",    label:"OCR Mismatch",    val:"2",     scheme:"red"     },
                    { dot:"emerald",label:"Safe Status",     val:"1,230", scheme:"emerald" },
                  ].map(row=>(
                    <div key={row.label} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                      <span className="font-semibold text-slate-600 flex items-center gap-2"><span className={`h-2 w-2 rounded-full bg-${row.dot}-500 inline-block`}/>{row.label}</span>
                      <span className={`font-bold bg-${row.scheme}-50 text-${row.scheme}-600 px-2 py-0.5 rounded-md`}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Processing Metrics */}
            <Card className="rounded-[24px] border border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 px-5 pt-5">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500"/> Processing Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                  <div><p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Approval Time</p><p className="text-xl font-black text-slate-900">4.5 <span className="text-sm font-semibold text-slate-500">mins</span></p></div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 space-x-1"><TrendingDown className="h-3 w-3"/> <span>12%</span></Badge>
                </div>
                <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                  <div><p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">OCR Processing Time</p><p className="text-xl font-black text-[#7C3AED]">12 <span className="text-sm font-semibold text-purple-400">secs</span></p></div>
                  <Clock className="h-5 w-5 text-slate-300"/>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5"><p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Success Rate</p><p className="text-xs font-bold text-emerald-600">98.5%</p></div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{width:"98.5%"}}/></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════
          APPLICATION DETAILS SLIDE PANEL
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={()=>setSelectedApp(null)}/>
            <motion.div initial={{x:"100%",opacity:0.5}} animate={{x:0,opacity:1}} exit={{x:"100%",opacity:0.5}}
              transition={{type:"spring",damping:25,stiffness:200}}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto flex flex-col border-l border-slate-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
                <div><p className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED] mb-1">Application Details</p><h2 className="text-xl font-black text-slate-900">{selectedApp.id}</h2></div>
                <Button variant="ghost" size="icon" onClick={()=>setSelectedApp(null)} className="h-10 w-10 bg-slate-50 rounded-full hover:bg-slate-200 text-slate-600"><XCircle className="h-6 w-6"/></Button>
              </div>
              <div className="p-6 space-y-6 flex-1 bg-slate-50/30">
                {/* User info */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-[#7C3AED] font-bold text-xl ring-4 ring-white shadow-sm">
                        {selectedApp.name.substring(0,2).toUpperCase()}
                      </div>
                      <div><h3 className="text-lg font-bold text-slate-900">{selectedApp.name}</h3><p className="text-sm font-medium text-slate-500">{selectedApp.email}</p></div>
                    </div>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {[["Requested Loan",formatINR(selectedApp.amount)],["Monthly Income",formatINR(selectedApp.income)],["Existing EMI",formatINR(selectedApp.emai)]].map(([l,v])=>(
                      <div key={l}><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{l}</p><p className="text-lg font-bold text-slate-900">{v}</p></div>
                    ))}
                  </div>
                </div>
                {/* AI panel */}
                <div className="bg-gradient-to-br from-[#581C87] to-[#7C3AED] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10"><BarChart3 className="h-40 w-40 transform translate-x-10 -translate-y-10"/></div>
                  <h3 className="text-sm font-bold text-purple-200 uppercase tracking-wider mb-5 flex items-center gap-2 relative z-10"><Zap className="h-4 w-4"/> AI Evaluation Engine</h3>
                  <div className="grid grid-cols-2 gap-6 mb-6 relative z-10 text-center">
                    <div className="bg-white/10 rounded-xl p-4 border border-white/10"><p className="text-[10px] uppercase font-bold text-purple-200 tracking-wider mb-1">Financial Health</p><div className="text-3xl font-black">{selectedApp.score}<span className="text-base text-purple-300 font-bold">/100</span></div></div>
                    <div className="bg-white/10 rounded-xl p-4 border border-white/10"><p className="text-[10px] uppercase font-bold text-purple-200 tracking-wider mb-1">Approval Probability</p><div className="text-3xl font-black">{selectedApp.prob}%</div></div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 relative z-10">
                    <p className="text-xs font-bold text-purple-300 mb-2 uppercase tracking-wide">AI Recommendation</p>
                    <p className="text-sm font-medium leading-relaxed italic border-l-2 border-purple-400 pl-3">"{selectedApp.aiReason}"</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300">System Risk:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedApp.risk==="High"?"bg-red-500":selectedApp.risk==="Medium"?"bg-yellow-500":"bg-emerald-500"} text-white`}>{selectedApp.risk} Risk</span>
                    </div>
                  </div>
                </div>
                {/* Docs + Bank */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><FileCheck className="h-4 w-4 text-[#7C3AED]"/> Document Verification</h3>
                    <div className="space-y-3 flex-1">
                      {(["identity","address","income"] as const).map(k=>(
                        <div key={k} className="flex justify-between items-center p-2 rounded-lg bg-slate-50/50 hover:bg-slate-50 border border-slate-100">
                          <span className="text-sm font-bold text-slate-700 capitalize">{k} Proof</span>
                          {verifyState==="verifying"
                            ? <Badge className="bg-yellow-100 text-yellow-700 border-0 animate-pulse">Verifying…</Badge>
                            : <Badge className={`border-0 ${
                                verifyState==="done"?"bg-emerald-100 text-emerald-700"
                                :selectedApp.docs[k]==="Verified"?"bg-emerald-100 text-emerald-700"
                                :selectedApp.docs[k]==="Pending"?"bg-yellow-100 text-yellow-700"
                                :"bg-red-100 text-red-700"
                              }`}>{verifyState==="done"?"Verified":selectedApp.docs[k]}</Badge>}
                        </div>
                      ))}
                    </div>
                    <Button onClick={()=>setShowReverify(true)} variant="outline" size="sm" className="w-full mt-4 h-9 font-bold text-xs gap-1 hover:bg-purple-50 hover:border-purple-200 hover:text-[#7C3AED] transition-colors">
                      <RefreshCw className="h-3 w-3"/> Re-verify All Documents
                    </Button>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-[#7C3AED]"/> Selected Bank</h3>
                    <div className="flex flex-col items-center justify-center text-center p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex-1">
                      <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#7C3AED] font-black text-xl mb-3 border border-purple-200">B</div>
                      <p className="font-bold text-slate-900 text-lg mb-1">{selectedApp.bank}</p>
                      <div className="flex gap-4 text-sm mt-2">
                        <div><p className="text-xs font-bold text-slate-400 uppercase">Interest</p><p className="font-bold text-[#7C3AED]">{selectedApp.bankRate}%</p></div>
                        <div className="w-px bg-purple-200 h-8"/>
                        <div><p className="text-xs font-bold text-slate-400 uppercase">Est. EMI</p><p className="font-bold text-[#7C3AED]">{formatINR(selectedApp.amount*(selectedApp.bankRate/100/12)/(1-Math.pow(1+selectedApp.bankRate/100/12,-60)))}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Admin Decision Panel */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 shadow-[0_-4px_20px_rgb(0,0,0,0.05)]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-4">Admin Decision Panel</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button onClick={()=>setShowApprove(true)} className="h-12 w-full text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md gap-2"><CheckCircle2 className="h-4 w-4"/> Approve Loan</Button>
                  <Button onClick={()=>setShowDocs(true)} variant="outline" className="h-12 w-full text-sm font-bold border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl gap-2"><Upload className="h-4 w-4 text-slate-400"/> Request Docs</Button>
                  <Button onClick={()=>setShowReject(true)} className="h-12 w-full text-sm font-bold bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl shadow-sm gap-2"><XCircle className="h-4 w-4"/> Reject Loan</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}

      {/* Approve */}
      <AnimatePresence>
        {showApprove && selectedApp && (
          <ModalWrap onClose={()=>setShowApprove(false)}>
            <ModalHeader title="Approve Loan Application" sub="Review details before confirming" color="emerald" onClose={()=>setShowApprove(false)}/>
            <div className="p-6 space-y-3">
              {[["Application ID",selectedApp.id],["Applicant",selectedApp.name],["Selected Bank",selectedApp.bank],["Loan Amount",formatINR(selectedApp.amount)],["Approval Probability",`${selectedApp.prob}%`]].map(([k,v])=>(
                <div key={k} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">{k}</span>
                  <span className="text-sm font-bold text-slate-900">{v}</span>
                </div>
              ))}
            </div>
            <div className="p-4 flex gap-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold" onClick={()=>setShowApprove(false)}>Cancel</Button>
              <Button className="flex-1 h-10 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={confirmApprove}><CheckCircle2 className="h-4 w-4"/> Confirm Approval</Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Reject */}
      <AnimatePresence>
        {showReject && selectedApp && (
          <ModalWrap onClose={()=>setShowReject(false)}>
            <ModalHeader title="Reject Loan Application" sub="Select a rejection reason to proceed" color="red" onClose={()=>setShowReject(false)}/>
            <div className="p-6 space-y-4">
              <div><p className="text-sm font-semibold text-slate-500 mb-1">Applicant</p><p className="font-bold text-slate-900">{selectedApp.name} — {selectedApp.id}</p></div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Rejection Reason <span className="text-red-500">*</span></label>
                <select value={rejectReason} onChange={e=>setRejectReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500 bg-slate-50">
                  <option value="">Select reason…</option>
                  {["Low financial score","High risk profile","Document mismatch","Incomplete application"].map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="p-4 flex gap-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold" onClick={()=>setShowReject(false)}>Cancel</Button>
              <Button disabled={!rejectReason} className="flex-1 h-10 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white gap-2 disabled:opacity-50" onClick={confirmReject}><XCircle className="h-4 w-4"/> Confirm Rejection</Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Request Docs */}
      <AnimatePresence>
        {showDocs && selectedApp && (
          <ModalWrap onClose={()=>setShowDocs(false)}>
            <ModalHeader title="Request Additional Documents" sub="Select documents needed from applicant" color="purple" onClose={()=>setShowDocs(false)}/>
            <div className="p-6 space-y-4">
              <p className="text-sm font-semibold text-slate-500">Applicant: <span className="text-slate-900 font-bold">{selectedApp.name}</span></p>
              <div className="space-y-2">
                {["Identity Proof","Address Proof","Income Proof","Bank Statement","Employment Proof"].map(doc=>(
                  <label key={doc} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${docsChecklist.includes(doc)?"border-purple-300 bg-purple-50":"border-slate-200 hover:bg-slate-50"}`}>
                    <input type="checkbox" checked={docsChecklist.includes(doc)}
                      onChange={e=>setDocsChecklist(prev=>e.target.checked?[...prev,doc]:prev.filter(d=>d!==doc))}
                      className="accent-[#7C3AED] h-4 w-4"/>
                    <span className="text-sm font-semibold text-slate-700">{doc}</span>
                  </label>
                ))}
              </div>
              <textarea rows={2} value={docNote} onChange={e=>setDocNote(e.target.value)} placeholder="Add any specific instructions…"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-slate-50 resize-none"/>
            </div>
            <div className="p-4 flex gap-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold" onClick={()=>setShowDocs(false)}>Cancel</Button>
              <Button disabled={docsChecklist.length===0} className="flex-1 h-10 rounded-xl font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white gap-2 disabled:opacity-50" onClick={confirmRequestDocs}><FileText className="h-4 w-4"/> Send Request</Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Re-verify Confirm */}
      <AnimatePresence>
        {showReverify && selectedApp && (
          <ModalWrap onClose={()=>setShowReverify(false)}>
            <ModalHeader title="Re-verify All Documents" sub={selectedApp.id} color="purple" onClose={()=>setShowReverify(false)}/>
            <div className="p-6">
              <p className="text-sm font-medium text-slate-600 leading-relaxed">This will re-run document verification checks for <span className="font-bold text-slate-900">{selectedApp.name}</span>. All document statuses will be refreshed using AI-powered OCR and identity checks.</p>
            </div>
            <div className="p-4 flex gap-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold" onClick={()=>setShowReverify(false)}>Cancel</Button>
              <Button className="flex-1 h-10 rounded-xl font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white gap-2" onClick={confirmReverify}><RefreshCw className="h-4 w-4"/> Re-verify Now</Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Risk Review */}
      <AnimatePresence>
        {showRiskModal && (
          <ModalWrap onClose={()=>setShowRiskModal(false)} maxW="max-w-xl">
            <ModalHeader title="High Risk Applications Review" sub="Flagged cases requiring manual assessment" color="red" onClose={()=>setShowRiskModal(false)}/>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {riskCases.map(c=>(
                <div key={c.id} className={`rounded-xl border p-4 transition-all ${c.status==="Safe"?"opacity-50 bg-slate-50 border-slate-200":c.status==="Escalated"?"bg-orange-50 border-orange-200":"bg-red-50 border-red-200"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div><p className="font-bold text-slate-900 text-sm">{c.name}</p><p className="text-xs text-slate-500">{c.id} • {c.riskType}</p></div>
                    <div className="flex gap-2">
                      <Badge className={`border-0 text-xs font-bold ${c.severity==="High"?"bg-red-100 text-red-700":"bg-yellow-100 text-yellow-700"}`}>{c.severity}</Badge>
                      <Badge className={`border-0 text-xs ${c.status==="Safe"?"bg-emerald-100 text-emerald-700":c.status==="Escalated"?"bg-orange-100 text-orange-700":"bg-red-100 text-red-700"}`}>{c.status}</Badge>
                    </div>
                  </div>
                  {riskNote[c.id] && <p className="text-xs text-[#7C3AED] bg-purple-50 rounded-lg px-3 py-1.5 mb-2 font-medium">Note: {riskNote[c.id]}</p>}
                  {c.status==="Flagged" && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="ghost" onClick={()=>{ const a=apps.find(a=>a.id===c.id); if(a){setSelectedApp(a);setShowRiskModal(false);} }} className="flex-1 h-8 text-xs font-bold border border-slate-200 hover:bg-white gap-1"><Eye className="h-3 w-3"/> View App</Button>
                      <Button size="sm" variant="ghost" onClick={()=>markSafe(c.id,c.name)} className="flex-1 h-8 text-xs font-bold border border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1"><CheckCheck className="h-3 w-3"/> Mark Safe</Button>
                      <Button size="sm" variant="ghost" onClick={()=>escalateCase(c)} className="flex-1 h-8 text-xs font-bold border border-orange-200 text-orange-700 hover:bg-orange-50 gap-1"><Flag className="h-3 w-3"/> Escalate</Button>
                      <Button size="sm" variant="ghost" onClick={()=>setShowRiskNote(showRiskNote===c.id?null:c.id)} className="flex-1 h-8 text-xs font-bold border border-purple-200 text-[#7C3AED] hover:bg-purple-50 gap-1"><StickyNote className="h-3 w-3"/> Note</Button>
                    </div>
                  )}
                  {showRiskNote===c.id && (
                    <div className="mt-2 flex gap-2">
                      <input className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white"
                        placeholder="Add internal note…" value={riskNote[c.id]??""} onChange={e=>setRiskNote(prev=>({...prev,[c.id]:e.target.value}))}/>
                      <Button size="sm" className="h-8 text-xs bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg" onClick={()=>{ showToast("Note saved","success"); setShowRiskNote(null); }}>Save</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="px-4 pb-4"><Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold h-10" onClick={()=>setShowRiskModal(false)}>Close</Button></div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Failed Uploads */}
      <AnimatePresence>
        {showFailedUploads && (
          <ModalWrap onClose={()=>setShowFailedUploads(false)}>
            <ModalHeader title="Failed Document Upload Details" sub="Applications with OCR or quality issues" color="red" onClose={()=>setShowFailedUploads(false)}/>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[["Failed Uploads","3"],["Affected Apps","3"],["OCR Rate","76%"]].map(([l,v])=>(
                  <div key={l} className="bg-red-50 rounded-xl p-3 border border-red-100"><p className="text-2xl font-black text-red-600">{v}</p><p className="text-xs font-bold text-red-500 mt-0.5">{l}</p></div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  { app:"APP-003", name:"Amit Kumar",   reason:"Identity document unreadable — Aadhaar scan too blurry" },
                  { app:"APP-008", name:"Farhan Sheikh", reason:"Low image quality — Income certificate below 200 DPI" },
                  { app:"APP-011", name:"Rekha Joshi",   reason:"OCR mismatch — Name on PAN differs from application form" },
                ].map(f=>(
                  <div key={f.app} className={`p-3 rounded-xl border transition-all ${resolvedAlerts.includes(f.app)?"opacity-40 bg-slate-50 border-slate-200":"bg-slate-50 border-slate-200"}`}>
                    <div className="flex justify-between mb-1"><p className="text-sm font-bold text-slate-900">{f.name}</p><Badge className="bg-red-100 text-red-700 border-0 text-xs">{f.app}</Badge></div>
                    <p className="text-xs text-slate-500 font-medium">{f.reason}</p>
                    <div className="flex gap-3 mt-2">
                      <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800">Open Application</button>
                      <span className="text-slate-300">•</span>
                      <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800">Re-request Document</button>
                      <span className="text-slate-300">•</span>
                      <button onClick={()=>{ setResolvedAlerts(p=>[...p,f.app]); addLog("Admin",`Alert resolved — ${f.name} doc issue`,"Completed"); showToast("Alert marked resolved","success"); }}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800">Mark Resolved</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 pb-4"><Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold h-10" onClick={()=>setShowFailedUploads(false)}>Close</Button></div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Pending Queue */}
      <AnimatePresence>
        {showPendingQueue && (
          <ModalWrap onClose={()=>setShowPendingQueue(false)} maxW="max-w-xl">
            <ModalHeader title="Pending Approvals Queue" sub="Applications waiting >2 hours for review" color="blue" onClose={()=>setShowPendingQueue(false)}/>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {pendingQueue.map(app=>(
                <div key={app.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {app.name}
                        {priorityIds.has(app.id) && <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0 h-4">Priority</Badge>}
                      </p>
                      <p className="text-xs text-slate-500">{app.id} • Waiting 2h+</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="ghost" onClick={()=>handleReviewNow(app)} className="flex-1 h-8 text-xs font-bold border border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1"><Eye className="h-3 w-3"/> Review Now</Button>
                    <Button size="sm" variant="ghost" onClick={()=>{setMenuTargetApp(app);setShowAssignOfficer(true);setShowPendingQueue(false);}} className="flex-1 h-8 text-xs font-bold border border-slate-200 hover:bg-white gap-1"><UserCheck className="h-3 w-3"/> Assign Officer</Button>
                    <Button size="sm" variant="ghost" onClick={()=>{markPriority(app);}} className="flex-1 h-8 text-xs font-bold border border-amber-200 text-amber-700 hover:bg-amber-50 gap-1"><Star className="h-3 w-3"/> Mark Priority</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3">
              <Button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold h-10" onClick={()=>setShowPendingQueue(false)}>Close</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-10" onClick={handleResolvePendingQueue}>Resolve All</Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Avg Review Modal */}
      <AnimatePresence>
        {showAvgModal && (
          <ModalWrap onClose={()=>setShowAvgModal(false)}>
            <ModalHeader title="Review Time Analytics" sub="Processing performance overview" color="emerald" onClose={()=>setShowAvgModal(false)}/>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[["Average Review Time","4.5 mins"],["Today's Processed","87"],["Fastest Case","1.2 mins"],["Slowest Case","18.4 mins"]].map(([l,v])=>(
                  <div key={l} className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                    <p className="text-xl font-black text-slate-900">{v}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wide">{l}</p>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Performance Insight</p>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">Review time is down 12% compared to last week. Auto-processing is handling 68% of applications without manual intervention.</p>
              </div>
            </div>
            <div className="px-4 pb-4"><Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold h-10" onClick={()=>setShowAvgModal(false)}>Close</Button></div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Assign Officer */}
      <AnimatePresence>
        {showAssignOfficer && menuTargetApp && (
          <ModalWrap onClose={()=>setShowAssignOfficer(false)}>
            <ModalHeader title="Assign Officer" sub={`Assign a loan officer to ${menuTargetApp.id}`} color="indigo" onClose={()=>setShowAssignOfficer(false)}/>
            <div className="p-6 space-y-4">
              <p className="text-sm font-semibold text-slate-500">Application: <span className="text-slate-900 font-bold">{menuTargetApp.name}</span></p>
              <select value={selectedOfficer} onChange={e=>setSelectedOfficer(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50">
                <option value="">Select officer…</option>
                {OFFICERS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="p-4 flex gap-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold" onClick={()=>setShowAssignOfficer(false)}>Cancel</Button>
              <Button disabled={!selectedOfficer} className="flex-1 h-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50" onClick={confirmAssignOfficer}>Save Assignment</Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Add Note */}
      <AnimatePresence>
        {showAddNote && menuTargetApp && (
          <ModalWrap onClose={()=>setShowAddNote(false)}>
            <ModalHeader title="Add Internal Note" sub={menuTargetApp.id} color="indigo" onClose={()=>setShowAddNote(false)}/>
            <div className="p-6">
              <textarea rows={4} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Type your internal note here…"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 resize-none"/>
            </div>
            <div className="p-4 flex gap-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold" onClick={()=>setShowAddNote(false)}>Cancel</Button>
              <Button disabled={!noteText.trim()} className="flex-1 h-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50" onClick={confirmAddNote}>Save Note</Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Archive Confirm */}
      <AnimatePresence>
        {showArchiveConfirm && menuTargetApp && (
          <ModalWrap onClose={()=>setShowArchiveConfirm(false)}>
            <ModalHeader title="Archive Application" color="red" onClose={()=>setShowArchiveConfirm(false)}/>
            <div className="p-6"><p className="text-sm font-medium text-slate-600">Are you sure you want to archive <span className="font-bold text-slate-900">{menuTargetApp.name}</span> ({menuTargetApp.id})? This will remove it from the active queue.</p></div>
            <div className="p-4 flex gap-3 border-t border-slate-100">
              <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold" onClick={()=>setShowArchiveConfirm(false)}>Cancel</Button>
              <Button className="flex-1 h-10 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white gap-2" onClick={confirmArchive}><Archive className="h-4 w-4"/> Archive</Button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* Full Profile */}
      <AnimatePresence>
        {showFullProfile && menuTargetApp && (
          <ModalWrap onClose={()=>setShowFullProfile(false)} maxW="max-w-lg">
            <ModalHeader title="Full Applicant Profile" sub={menuTargetApp.id} color="indigo" onClose={()=>setShowFullProfile(false)}/>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl ring-4 ring-white shadow-sm">{menuTargetApp.name.substring(0,2).toUpperCase()}</div>
                <div><h3 className="text-lg font-bold text-slate-900">{menuTargetApp.name}</h3><p className="text-sm font-medium text-slate-500">{menuTargetApp.email}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[["Loan Amount",formatINR(menuTargetApp.amount)],["Monthly Income",formatINR(menuTargetApp.income)],["Existing EMI",formatINR(menuTargetApp.emai)],["AI Score",`${menuTargetApp.score}/100`],["Approval %",`${menuTargetApp.prob}%`],["Risk Level",menuTargetApp.risk]].map(([k,v])=>(
                  <div key={k} className="bg-slate-50 rounded-xl p-3 border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{k}</p><p className="font-bold text-slate-900 text-sm mt-0.5">{v}</p></div>
                ))}
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">AI Analysis</p>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{menuTargetApp.aiReason}</p>
              </div>
            </div>
            <div className="px-4 pb-4"><Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold h-10" onClick={()=>setShowFullProfile(false)}>Close</Button></div>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          ACTIVITY LOG — FULL DRAWER
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showActivityLog && (() => {
          const FILTERS = ["All","Started","Processing","Completed","Escalated"] as const;

          const filtered = activityLog
            .filter(e => logFilter === "All" || e.chip === logFilter)
            .filter(e => {
              if(!logSearch.trim()) return true;
              const q = logSearch.toLowerCase();
              return e.actor.toLowerCase().includes(q) || e.action.toLowerCase().includes(q);
            })
            .slice()
            .sort((a,b) => logSort === "newest" ? b.id - a.id : a.id - b.id);

          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
                onClick={() => setShowActivityLog(false)}
              />

              {/* Drawer */}
              <motion.div
                initial={{x:"100%",opacity:0.6}} animate={{x:0,opacity:1}} exit={{x:"100%",opacity:0.6}}
                transition={{type:"spring",damping:26,stiffness:220}}
                className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
                onClick={e => e.stopPropagation()}
              >
                {/* ── Drawer header ── */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-0.5">Activity Management</p>
                      <h2 className="text-xl font-black text-slate-900 leading-tight">Full Activity Log</h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{activityLog.length} total entries</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowActivityLog(false)}
                      className="h-9 w-9 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 shrink-0 mt-0.5">
                      <X className="h-4 w-4"/>
                    </Button>
                  </div>

                  {/* Search + Sort row */}
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"/>
                      <input
                        type="text"
                        placeholder="Search by name, app ID, or action…"
                        value={logSearch}
                        onChange={e => setLogSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white outline-none transition-all"
                      />
                      {logSearch && (
                        <button onClick={() => setLogSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <X className="h-3 w-3"/>
                        </button>
                      )}
                    </div>
                    <select
                      value={logSort}
                      onChange={e => setLogSort(e.target.value as "newest"|"oldest")}
                      className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="newest">↓ Newest First</option>
                      <option value="oldest">↑ Oldest First</option>
                    </select>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-1.5 flex-wrap">
                    {FILTERS.map(f => {
                      const count = f === "All" ? activityLog.length : activityLog.filter(e => e.chip === f).length;
                      const isActive = logFilter === f;
                      const colorMap: Record<string,string> = {
                        All:"bg-indigo-600 text-white border-indigo-600",
                        Started:"bg-blue-600 text-white border-blue-600",
                        Processing:"bg-indigo-500 text-white border-indigo-500",
                        Completed:"bg-emerald-600 text-white border-emerald-600",
                        Escalated:"bg-red-600 text-white border-red-600",
                      };
                      return (
                        <button
                          key={f}
                          onClick={() => setLogFilter(f)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                            isActive ? colorMap[f] : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                          }`}
                        >
                          {f} <span className={`ml-0.5 ${isActive ? "opacity-80" : "text-slate-400"}`}>({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Scrollable list ── */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Clock className="h-10 w-10 mb-3 opacity-30"/>
                      <p className="font-bold text-sm">No activities found</p>
                      <p className="text-xs mt-1">Try changing filters or search query</p>
                    </div>
                  ) : filtered.map((entry, idx) => {
                    const chipC: Record<string,string> = {
                      Started:"bg-blue-50 text-blue-700 border-blue-100",
                      Processing:"bg-indigo-50 text-indigo-700 border-indigo-100",
                      Completed:"bg-emerald-50 text-emerald-700 border-emerald-100",
                      Escalated:"bg-red-50 text-red-700 border-red-100",
                    };
                    const avatarC: Record<string,string> = {
                      Started:"from-blue-400 to-blue-600",
                      Processing:"from-indigo-400 to-indigo-600",
                      Completed:"from-emerald-400 to-emerald-600",
                      Escalated:"from-red-400 to-red-600",
                    };
                    return (
                      <motion.button
                        key={entry.id}
                        initial={{opacity:0,y:6}}
                        animate={{opacity:1,y:0}}
                        transition={{delay:idx*0.02}}
                        onClick={() => setLogDetail(entry)}
                        className="w-full text-left flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(99,102,241,0.1)]"
                      >
                        {/* Avatar */}
                        <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarC[entry.chip] ?? "from-slate-400 to-slate-600"} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}>
                          {entry.actor.substring(0,2).toUpperCase()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-bold text-slate-900 text-xs leading-tight group-hover:text-indigo-700 transition-colors truncate">
                              {entry.actor}
                            </p>
                            <Badge className={`${chipC[entry.chip] ?? "bg-slate-50 text-slate-600 border-slate-100"} border text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0`}>
                              {entry.chip}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">{entry.action}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5"/> {entry.time}
                          </p>
                        </div>

                        {/* Arrow */}
                        <span className="text-slate-300 group-hover:text-indigo-400 transition-colors self-center shrink-0 text-xs">›</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* ── Footer count ── */}
                <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50 flex justify-between items-center">
                  <p className="text-xs text-slate-500 font-medium">
                    Showing <span className="font-bold text-slate-700">{filtered.length}</span> of <span className="font-bold text-slate-700">{activityLog.length}</span> entries
                  </p>
                  <button onClick={() => { setLogFilter("All"); setLogSearch(""); }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                    Clear filters
                  </button>
                </div>
              </motion.div>

              {/* ── Activity Detail popup ── */}
              <AnimatePresence>
                {logDetail && (
                  <>
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                      className="fixed inset-0 z-[60]" onClick={() => setLogDetail(null)}/>
                    <motion.div
                      initial={{opacity:0,scale:0.92,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92,y:16}}
                      transition={{type:"spring",damping:28,stiffness:300}}
                      className="fixed z-[70] top-1/2 right-[590px] -translate-y-1/2 w-80 bg-white rounded-[20px] shadow-2xl border border-slate-200 overflow-hidden"
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Detail header */}
                      {(() => {
                        const hdrC: Record<string,string> = {
                          Started:"from-blue-600 to-blue-700",
                          Processing:"from-indigo-600 to-indigo-700",
                          Completed:"from-emerald-600 to-emerald-700",
                          Escalated:"from-red-600 to-red-700",
                        };
                        return (
                          <div className={`bg-gradient-to-r ${hdrC[logDetail.chip] ?? "from-slate-600 to-slate-700"} text-white px-5 py-4 flex justify-between items-center`}>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider opacity-75 mb-0.5">Activity Detail</p>
                              <p className="font-black text-sm">{logDetail.chip}</p>
                            </div>
                            <button onClick={() => setLogDetail(null)}
                              className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                              <X className="h-3.5 w-3.5"/>
                            </button>
                          </div>
                        );
                      })()}

                      <div className="p-5 space-y-3">
                        {/* Actor */}
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm ring-2 ring-white shadow-sm">
                            {logDetail.actor.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{logDetail.actor}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Performed action</p>
                          </div>
                        </div>

                        {/* Detail rows */}
                        {[
                          ["Action", logDetail.action],
                          ["Status", logDetail.chip],
                          ["Time", logDetail.time],
                          ["Entry ID", `#${logDetail.id}`],
                        ].map(([k,v]) => (
                          <div key={k} className="flex justify-between items-start gap-3">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">{k}</p>
                            <p className="text-xs font-semibold text-slate-800 text-right leading-snug">{v}</p>
                          </div>
                        ))}

                        <button onClick={() => setLogDetail(null)}
                          className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors">
                          Close Detail
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      </AnimatePresence>
      <AdminProfileDrawer
        config={LOAN_ADMIN_CONFIG}
        open={isProfileDDOpen}
        onClose={() => setIsProfileDDOpen(false)}
        onLogout={handleLogout}
        onUpdate={handleUpdateProfile}
      />
    </motion.div>
  );
}
