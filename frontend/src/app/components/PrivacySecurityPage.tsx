import { motion } from "motion/react";
import { ShieldCheck, Lock, Key, EyeOff, Server, AlertCircle, FileText, ArrowLeft } from "lucide-react";

export function PrivacySecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12 relative">
        <div className="flex justify-start -mb-8">
          <button 
            onClick={() => {
              if (window.history.length > 1) window.history.back();
              else window.location.href = "/dashboard";
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
        <div className="text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
            <ShieldCheck className="h-8 w-8" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold text-slate-900 mb-4">
            Data Privacy & Security
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xl text-slate-600 font-medium">
            We implement enterprise-grade security protocols to ensure complete protection of user data across all layers of the system.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {/* ROW 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <Lock className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">Critical</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Data Encryption</h3>
              <ul className="text-slate-600 space-y-2 text-sm flex-grow">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" /> AES-256 encryption for stored data</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" /> End-to-end encryption during data transmission</li>
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <Key className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">Real-time</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Authentication</h3>
              <ul className="text-slate-600 space-y-2 text-sm flex-grow">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" /> Multi-Factor Authentication (MFA)</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" /> Token-based session management (JWT)</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" /> Auto session expiry for inactive users</li>
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <EyeOff className="h-6 w-6 text-blue-600" />
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">Compliance</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Consent Management</h3>
              <ul className="text-slate-600 space-y-2 text-sm flex-grow">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" /> Users control what data is collected and processed</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" /> No third-party sharing without explicit permission</li>
              </ul>
            </motion.div>

            {/* ROW 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <Server className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">Security</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Data Isolation</h3>
              <ul className="text-slate-600 space-y-2 text-sm flex-grow">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" /> User data is logically separated to prevent cross-access</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" /> Role-based access control (RBAC)</li>
              </ul>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">Real-time</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Threat Detection</h3>
              <ul className="text-slate-600 space-y-2 text-sm flex-grow">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" /> Real-time monitoring for suspicious activities</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" /> Automatic alerts for unusual login or access attempts</li>
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">Compliance</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Audit Logs & Transparency</h3>
              <ul className="text-slate-600 space-y-2 text-sm flex-grow">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" /> Tracks every user and system activity securely</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" /> Maintains detailed logs for compliance and debugging</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" /> Enables transparency in data access and modifications</li>
              </ul>
            </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-16 border-t border-slate-200 pt-10">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Trust Indicators
            </h3>
            <div className="flex flex-wrap justify-center gap-4 text-center">
              {[
                { label: "Fairness Score", value: "99.8%" },
                { label: "Data Leakage Policy", value: "Zero" },
                { label: "Security Monitoring", value: "24/7" },
                { label: "Validation Layer", value: "AI + Human" }
              ].map((stat, i) => (
                <div key={i} className="px-6 py-3 bg-white rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
                  <span className="font-bold text-slate-800">{stat.value}</span>
                  <span className="text-slate-500 text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
