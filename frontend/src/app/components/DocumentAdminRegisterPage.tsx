import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, User, Mail, Phone, Building2, Shield,
  IdCard, FileCheck, MapPin, Lock, Eye, EyeOff,
  CheckCircle2, ChevronDown, Bell, Settings, LogOut, Edit3, X,
  FileSearch, ShieldCheck
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { HomePage } from "./HomePage";
import { toast } from "sonner";
import { apiFetch } from "../api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  fullName: string;
  email: string;
  mobile: string;
  orgName: string;
  adminRole: string;
  department: string;
  employeeId: string;
  yearsOfExperience: string;
  workLocation: string;
  password: string;
  confirmPassword: string;
}

interface ProfileData extends FormData {
  status: "Active" | "Verified";
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ADMIN_ROLES = ["Chief Verification Officer", "Integrity Specialist", "Security Auditor", "Database Admin", "Lead Authenticator"];
const DEPARTMENTS = ["Document Integrity", "Identity Verification", "Compliance", "Fraud Detection"];
const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
];

// ── Profile Dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ profile, onClose }: { profile: ProfileData; onClose: () => void }) {
  const navigate = useNavigate();
  const initials = profile.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-black border-2 border-white/40">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate">{profile.fullName}</p>
              <p className="text-green-100 text-xs truncate">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/30">
              🛡️ Verification Admin
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              profile.status === "Verified"
                ? "bg-green-400/30 text-green-100 border border-green-300/40"
                : "bg-blue-400/30 text-blue-100 border border-blue-300/40"
            }`}>
              ✓ {profile.status}
            </span>
          </div>
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Role", value: profile.adminRole || "—" },
              { label: "Department", value: profile.department || "—" },
              { label: "Staff ID", value: profile.employeeId || "—" },
              { label: "Agency", value: profile.orgName || "—" },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2">
          {[
            { icon: Edit3, label: "Edit Profile", action: () => {} },
            { icon: ShieldCheck, label: "Integrity Settings", action: () => {} },
            { icon: Bell, label: "Security Alerts", action: () => {} },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-green-700 transition-colors text-left"
            >
              <item.icon className="h-4 w-4 text-slate-400" />
              {item.label}
            </button>
          ))}
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button
              onClick={() => { onClose(); navigate("/admin/document"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Input Field Helper ────────────────────────────────────────────────────────
function Field({
  label, icon: Icon, required = false, children, hint,
}: {
  label: string;
  icon: React.ElementType;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        {children}
      </div>
      {hint && <p className="text-[11px] text-slate-400 font-medium">{hint}</p>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function DocumentAdminRegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [savedProfile, setSavedProfile] = useState<ProfileData | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    mobile: "",
    orgName: "",
    adminRole: "",
    department: "",
    employeeId: "",
    yearsOfExperience: "",
    workLocation: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputCls =
    "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all text-sm font-medium outline-none placeholder:text-slate-300";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.adminRole) { toast.error("Please select an Admin Role."); return; }
    if (!form.department) { toast.error("Please select a Department."); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match."); return; }

    setIsLoading(true);
    try {
      const result = await apiFetch("/auth/admin-register", {
        method: "POST",
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          password: form.password,
        }),
      });
      const profile: ProfileData = { ...form, status: "Verified" };
      setSavedProfile(profile);
      localStorage.setItem("docAdminProfile", JSON.stringify(profile));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("userEmail", form.email);
      localStorage.setItem("userFullName", form.fullName);
      localStorage.setItem("userRole", "admin");
      setIsLoading(false);
      setRegistered(true);
      toast.success("Verification Admin registered successfully!");
    } catch (error) {
      console.error("Verification admin register error:", error);
      toast.error(error instanceof Error ? error.message : "Admin registration failed.");
      setIsLoading(false);
    }
  };

  if (registered && savedProfile) {
    const initials = savedProfile.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="min-h-screen relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <HomePage />
        </div>
        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[12px] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            <Card className="border-0 shadow-2xl rounded-2xl bg-white overflow-hidden">
              <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 px-8 py-8 text-white text-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center text-3xl font-black mx-auto mb-4"
                >
                  {initials}
                </motion.div>
                <h2 className="text-2xl font-black">{savedProfile.fullName}</h2>
                <p className="text-green-100 text-sm mt-1">{savedProfile.email}</p>
                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                    🛡️ Verified Verification Admin
                  </span>
                  <span className="bg-green-400/30 text-green-100 text-xs font-bold px-3 py-1 rounded-full border border-green-300/40">
                    ✓ Active
                  </span>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Admin Role", value: savedProfile.adminRole },
                    { label: "Department", value: savedProfile.department },
                    { label: "Staff ID", value: savedProfile.employeeId },
                    { label: "Agency", value: savedProfile.orgName },
                    { label: "Mobile", value: savedProfile.mobile },
                    { label: "Location", value: savedProfile.workLocation || "—" },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{item.value || "—"}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate("/admin/document/dashboard")}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl h-11 shadow-lg shadow-emerald-200"
                  >
                    Go to Dashboard
                  </Button>
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown((v) => !v)}
                      className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition-colors"
                    >
                      <ChevronDown className="h-5 w-5 text-slate-600" />
                    </button>
                    {showDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                        <ProfileDropdown profile={savedProfile} onClose={() => setShowDropdown(false)} />
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative w-full overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 10, ease: "easeOut" }}
        style={{ filter: "blur(6px) brightness(0.85)" }}
      >
        <HomePage />
      </motion.div>
      <div className="absolute inset-0 z-10 bg-black/55 backdrop-blur-[10px]" />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 z-30 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white/85 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm transition-all"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="absolute inset-0 z-20 overflow-y-auto flex items-start justify-center p-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          <Card className="border border-white/20 shadow-[0_32px_80px_rgba(0,0,0,0.55)] rounded-2xl overflow-hidden bg-white">
            <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 px-8 py-7 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl border border-white/30">
                  <FileCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight">Verification Admin Registration</h1>
                  <p className="text-green-100 text-sm mt-0.5 font-medium">
                    Ensure document integrity with AI-powered authentication
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                <ShieldCheck className="h-5 w-5 text-green-300 shrink-0" />
                <div>
                  <p className="text-sm font-bold">🛡️ Verified Verification Admin</p>
                  <p className="text-green-100 text-xs font-medium mt-0.5">Used for national document integrity control</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <section>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> Basic Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name" icon={User} required>
                      <input
                        type="text" name="fullName" required
                        placeholder="Dr. Sameer Kulkarni"
                        className={inputCls}
                        value={form.fullName} onChange={handleChange}
                      />
                    </Field>
                    <Field label="Email Address" icon={Mail} required hint="Auto-filled if already registered">
                      <input
                        type="email" name="email" required
                        placeholder="sameer.k@verification.gov.in"
                        className={inputCls}
                        value={form.email} onChange={handleChange}
                      />
                    </Field>
                    <Field label="Mobile Number" icon={Phone} required>
                      <input
                        type="tel" name="mobile" required
                        placeholder="+91 98765 43210"
                        className={inputCls}
                        value={form.mobile} onChange={handleChange}
                      />
                    </Field>
                  </div>
                </section>

                <div className="border-t border-slate-100" />

                <section>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" /> Agency Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Agency Name" icon={Building2} required>
                      <input
                        type="text" name="orgName" required
                        placeholder="National Verification Agency"
                        className={inputCls}
                        value={form.orgName} onChange={handleChange}
                      />
                    </Field>
                    <Field label="Admin Role" icon={Briefcase} required>
                      <select
                        name="adminRole" required
                        className={`${inputCls} appearance-none cursor-pointer`}
                        value={form.adminRole} onChange={handleChange}
                      >
                        <option value="">Select role…</option>
                        {ADMIN_ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </Field>
                    <Field label="Department" icon={FileSearch} required>
                      <select
                        name="department" required
                        className={`${inputCls} appearance-none cursor-pointer`}
                        value={form.department} onChange={handleChange}
                      >
                        <option value="">Select department…</option>
                        {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </Field>
                    <Field label="Staff ID" icon={IdCard} required>
                      <input
                        type="text" name="employeeId" required
                        placeholder="V-2024-001"
                        className={inputCls}
                        value={form.employeeId} onChange={handleChange}
                      />
                    </Field>
                  </div>
                </section>

                <div className="border-t border-slate-100" />

                <section>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" /> Optional Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Years of Experience" icon={Briefcase}>
                      <input
                        type="number" name="yearsOfExperience" min="0" max="50"
                        placeholder="e.g. 10"
                        className={inputCls}
                        value={form.yearsOfExperience} onChange={handleChange}
                      />
                    </Field>
                    <Field label="Work Location (City)" icon={MapPin}>
                      <select
                        name="workLocation"
                        className={`${inputCls} appearance-none cursor-pointer`}
                        value={form.workLocation} onChange={handleChange}
                      >
                        <option value="">Select city…</option>
                        {CITIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                  </div>
                </section>

                <div className="border-t border-slate-100" />

                <section>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" /> Security
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Password" icon={Lock} required>
                      <input
                        type={showPass ? "text" : "password"}
                        name="password" required
                        placeholder="••••••••"
                        className={`${inputCls} pr-10`}
                        value={form.password} onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </Field>
                    <Field label="Confirm Password" icon={Shield} required>
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        name="confirmPassword" required
                        placeholder="••••••••"
                        className={`${inputCls} pr-10`}
                        value={form.confirmPassword} onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </Field>
                  </div>
                </section>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl h-12 text-base shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 mt-2 gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Registering…
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-5 w-5" />
                      Register Now
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-slate-500 font-medium">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/admin/document")}
                    className="font-bold text-green-600 hover:text-green-700 transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
