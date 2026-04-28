import { motion } from "motion/react";
import { FileCheck, Globe2, Building2, Search, ShieldCheck, ArrowLeft } from "lucide-react";

export function CompliancePage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12 relative">
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
        <div className="text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block p-3 bg-rose-100 text-rose-600 rounded-2xl mb-4">
            <FileCheck className="h-8 w-8" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold text-slate-900 mb-4">
            Compliance (SOC2/GDPR)
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xl text-slate-600 font-medium max-w-3xl mx-auto">
            Our platform follows globally recognized compliance standards to ensure trust, transparency, and accountability in data handling.
          </motion.p>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start gap-6 hover:shadow-md transition-all">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 flex-shrink-0">
              <Globe2 className="h-8 w-8" />
            </div>
            <div className="w-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">GDPR Compliance</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1">Right to Access</h4>
                  <p className="text-sm text-slate-600">Users can view their stored data anytime</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1">Right to Erasure</h4>
                  <p className="text-sm text-slate-600">Users can request complete data deletion</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1">Data Portability</h4>
                  <p className="text-sm text-slate-600">Export user data in structured format</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1">Consent Tracking</h4>
                  <p className="text-sm text-slate-600">Logs all user permissions transparently</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start gap-6 hover:shadow-md transition-all">
            <div className="p-4 bg-purple-50 rounded-2xl text-purple-600 flex-shrink-0">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="w-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">SOC2 Standards</h2>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" /> Continuous system monitoring and audit logging</li>
                <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" /> Secure infrastructure with strict access controls</li>
                <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" /> Third-party security validation and penetration testing</li>
                <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" /> High availability and system reliability assurance</li>
              </ul>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start gap-6 hover:shadow-md transition-all">
            <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 flex-shrink-0">
              <Search className="h-8 w-8" />
            </div>
            <div className="w-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Audit Transparency</h2>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 flex-shrink-0" /> Every action is logged for accountability</li>
                <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 flex-shrink-0" /> Admins can track system-level activities in real-time</li>
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-16 border-t border-slate-200 pt-10">
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
