import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  FileCheck, Shield, AlertCircle, CheckCircle2, XCircle,
  Search, Filter, MoreVertical, LayoutGrid, List,
  ArrowUpRight, Clock, User, Download, ExternalLink,
  Eye, FileText, CheckCircle, Zap, Bell, Lock, LogOut, X,
  FileSearch, Trash2, Edit
} from "lucide-react";
import { useUser } from "./UserContext";
import { AdminProfileDrawer, AdminProfileConfig } from "./AdminProfileDrawer";

// ── Types ─────────────────────────────────────────────────────────────────────
interface VerificationRequest {
  id: string;
  name: string;
  type: string;
  status: "Pending" | "Verified" | "Rejected" | "Flagged";
  date: string;
  confidence: number;
  assignedTo?: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const REQUESTS: VerificationRequest[] = [
  { id: "VR-001", name: "Rahul Verma",   type: "ID Proof",        status: "Pending",  date: "2024-04-26", confidence: 98.5 },
  { id: "VR-002", name: "Sneha Kapur",   type: "Salary Slip",     status: "Verified", date: "2024-04-25", confidence: 99.2 },
  { id: "VR-003", name: "Amit Singh",    type: "Marksheet",       status: "Flagged",  date: "2024-04-25", confidence: 45.0 },
  { id: "VR-004", name: "Priya Das",     type: "Exp. Letter",     status: "Pending",  date: "2024-04-24", confidence: 82.1 },
  { id: "VR-005", name: "Vikram Seth",   type: "ID Proof",        status: "Rejected", date: "2024-04-24", confidence: 12.4 },
];

export function DocumentAdminDashboard() {
  const navigate = useNavigate();
  const { setUserRole } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isExiting, setIsExiting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("docAdminProfile");
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleUpdateProfile = (newData: any) => {
    const updated = { ...profile, ...newData };
    setProfile(updated);
    localStorage.setItem("docAdminProfile", JSON.stringify(updated));
  };

  const handleLogout = () => { setUserRole(null); navigate("/"); };

  const DOC_ADMIN_CONFIG: AdminProfileConfig = {
    type: "loan", // Using loan as a placeholder or we could add 'document' to types
    name: profile?.fullName || profile?.name || "Dr. Sameer Kulkarni",
    initials: (profile?.fullName || profile?.name || "SK").split(" ").map((n: string) => n[0]).join("").slice(0, 2),
    email: profile?.email || "sameer.k@verification.gov.in",
    role: profile?.adminRole || profile?.role || "Chief Verification Officer",
    gradientHeader: "bg-gradient-to-br from-[#2563EB] to-[#1E40AF]",
    accentColor: "blue",
    aiTag: "AI Authenticity Engine Active",
    profileInfo: [
      { label: "Agency",       value: profile?.orgName || "National Verification Agency", span: true },
      { label: "Department",   value: profile?.department || "Document Integrity" },
      { label: "Role",         value: profile?.adminRole || profile?.role || "Chief Officer" },
      { label: "Staff ID",     value: profile?.employeeId || "V-2024-099" },
      { label: "Clearance",    value: "Level 5 (Top Secret)" },
    ],
    metrics: [
      { label: "Verified",    value: "2,840", color: "blue" },
      { label: "Tampered",    value: "42",    color: "red" },
      { label: "Confidence",  value: "99.8%", color: "blue" },
    ],
    notifications: [
      { id: "1", text: "Mass Verification Batch", sub: "850 documents auto-verified by AI.", time: "2 hrs ago", read: false },
      { id: "2", text: "Deepfake Alert",           sub: "APP-099 detected with 95% AI-generated mask.", time: "5 hrs ago", read: false },
    ],
    settingsLabel: "Verification Settings",
    settingsItems: [
      { key: "autoVerify", label: "Auto-Verify",    desc: "Enable AI for high-confidence docs" },
      { key: "fraudAlert", label: "Fraud Alert",     desc: "Trigger police alert for tampered docs" },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#E0F2FE] flex flex-col font-sans"
    >
      {/* ── Navbar ── */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#1E40AF] flex items-center justify-center shadow-lg shadow-[#2563EB]/20">
            <FileCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-none">Verification Portal</h1>
            <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest mt-1">Admin Control Center</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setProfileOpen(true)} className="group flex items-center gap-3 p-1.5 pr-4 rounded-full bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md transition-all">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-white font-bold text-xs">
              {DOC_ADMIN_CONFIG.initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-none">{DOC_ADMIN_CONFIG.name}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{DOC_ADMIN_CONFIG.role}</p>
            </div>
          </button>
        </div>
      </header>

      {/* ── Main Dashboard ── */}
      <main className="flex-1 p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Requests", value: "3,420", icon: FileText, color: "blue" },
            { label: "Pending Review", value: "128",   icon: Clock,    color: "amber" },
            { label: "Verified Today", value: "85",    icon: CheckCircle, color: "blue" },
            { label: "Flagged Cases",  value: "12",    icon: AlertCircle, color: "red" },
          ].map((s) => (
            <div key={s.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-${s.color}-50 text-${s.color}-600`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-slate-400">This Month</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-sm font-bold text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-black text-slate-800">Recent Verification Requests</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" placeholder="Search requests..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#60A5FA]/50"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100"><Filter className="h-4 w-4 text-slate-600" /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Doc Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">AI Confidence</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {REQUESTS.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 text-sm">{r.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-700 text-sm">{r.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{r.type}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${r.confidence > 90 ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6]" : r.confidence > 70 ? "bg-[#60A5FA]" : "bg-red-500"}`}
                            style={{ width: `${r.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{r.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        r.status === "Verified" ? "bg-blue-100 text-[#1E40AF]" :
                        r.status === "Pending" ? "bg-slate-100 text-[#64748B]" :
                        r.status === "Flagged" ? "bg-purple-100 text-purple-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><Eye className="h-4 w-4 text-slate-500" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AdminProfileDrawer
        config={DOC_ADMIN_CONFIG}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLogout={handleLogout}
        onUpdate={handleUpdateProfile}
      />
    </motion.div>
  );
}
