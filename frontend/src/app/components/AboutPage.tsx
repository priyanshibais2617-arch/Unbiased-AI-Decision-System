import { motion } from "motion/react";
import { GraduationCap, Briefcase, Banknote, ShieldCheck, Scale, Zap, LayoutDashboard, Lock, ArrowLeft } from "lucide-react";

export function AboutPage() {
  const features = [
    { icon: GraduationCap, title: "AI-based Education Evaluation", desc: "Fair grading and student assessment insights.", color: "text-blue-600", bg: "bg-blue-100" },
    { icon: Briefcase, title: "Job Match Analyzer", desc: "Skills-based unbiased candidate screening.", color: "text-purple-600", bg: "bg-purple-100" },
    { icon: Banknote, title: "Loan Approval Prediction", desc: "Data-driven fast financial assessments.", color: "text-emerald-600", bg: "bg-emerald-100" },
    { icon: ShieldCheck, title: "Document Verification System", desc: "Automated fraud detection and validation.", color: "text-rose-600", bg: "bg-rose-100" },
  ];

  const reasons = [
    { icon: Scale, title: "Fair & unbiased analysis" },
    { icon: Zap, title: "Real-time insights" },
    { icon: LayoutDashboard, title: "User-friendly dashboards" },
    { icon: Lock, title: "Secure & reliable system" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto space-y-12 md:space-y-16 flex-1">
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
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4 text-blue-600">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700">
            About Unbiased AI
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            “Unbiased AI is a smart platform designed to provide fair, accurate, and AI-driven decision-making across multiple domains including Education, Job Hiring, and Loan Approval.”
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <p className="text-xl text-slate-700 font-medium max-w-2xl mx-auto">
            To deliver transparent and unbiased AI solutions for better decision-making.
          </p>
        </motion.div>

        {/* Multi-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Our Features</h2>
            <div className="space-y-4">
              {features.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                  <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Why Choose Us */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Why Choose Us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full md:pb-14">
              {reasons.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-white to-slate-50 border border-slate-100 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
                  <item.icon className="h-8 w-8 text-blue-600 mb-3" />
                  <span className="font-semibold text-slate-800">{item.title}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </div>

      {/* Optional Note */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="text-center mt-12 md:mt-16"
      >
        <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">
          “All insights and systems are powered by unbiased AI technology.”
        </p>
      </motion.div>
    </div>
  );
}
