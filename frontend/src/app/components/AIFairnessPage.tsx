import { motion } from "motion/react";
import { Scale, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

export function AIFairnessPage() {
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4">
            <Scale className="h-8 w-8" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold text-slate-900 mb-4">
            AI Fairness Policy
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-lg text-slate-600 max-w-3xl mx-auto space-y-4">
            <p>We ensure every AI decision follows strict fairness guidelines using continuous bias monitoring and validation pipelines.</p>
            <p>Our models are trained on diverse datasets to reduce demographic imbalance and avoid unfair outcomes.</p>
            <p>Real-time fairness checks are applied before every prediction to maintain unbiased outputs.</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col">
            {[
              { title: "Commitment to unbiased AI decisions", desc: "Every prediction is audited using fairness metrics before being delivered.", highlight: false },
              { title: "No discrimination", desc: "The system actively removes bias related to gender, caste, income, geography, or background.", highlight: false },
              { title: "Transparent evaluation logic", desc: "Users can view how decisions were made using explainable AI insights.", highlight: false },
              { title: "Continuous monitoring", desc: "Models are retrained and validated regularly to prevent bias drift over time.", highlight: false },
              { title: "Human + AI hybrid validation", desc: "Critical decisions can be reviewed manually for additional fairness assurance.", highlight: true }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`transition-colors border ${item.highlight ? 'bg-blue-50/60 border-blue-100' : 'border-transparent hover:bg-slate-50 hover:border-slate-100'}`}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '16px', 
                  marginBottom: '20px', 
                  padding: '20px',
                  borderRadius: '12px'
                }}
              >
                <div 
                  className={`flex items-center justify-center rounded-full shrink-0 ${item.highlight ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-blue-600'}`}
                  style={{ width: '40px', height: '40px', minWidth: '40px' }}
                >
                  <CheckCircle2 style={{ width: '20px', height: '20px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', flex: 1 }}>
                  <h3 
                    className={item.highlight ? 'text-blue-900' : 'text-slate-900'}
                    style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, padding: 0 }}
                  >
                    {item.title}
                  </h3>
                  <p 
                    className={item.highlight ? 'text-blue-800' : 'text-slate-600'}
                    style={{ fontSize: '14px', lineHeight: '1.5', margin: 0, padding: 0 }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-16 border-t border-slate-200 pt-10">
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
