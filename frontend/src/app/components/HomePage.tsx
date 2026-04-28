import { motion } from "motion/react";
import { BarChart3, Briefcase, ChevronRight, FileCheck, GraduationCap, Landmark, Lock, Shield, ShieldCheck, Sparkles, Users } from "lucide-react";
import logo from "./figma/logo.png";
import { Card, CardContent } from "./ui/card";
import { Header } from "./Header";
import { Footer } from "./Footer";

const t = {
  subtitle: "Fair, Secure, and Smart Decision-Making Without Bias",
  description:
    "An intelligent AI platform that ensures transparent decision-making across Job Hiring, Education System, Loan Approval and Document Verification while protecting your privacy with blockchain-grade security.",
};

const coreModules = [
  {
    title: "Job Hiring",
    desc: "Fair resume analysis with smart recommendations",
    icon: Briefcase,
    gradient: "bg-gradient-to-br from-[#2563EB] to-[#0EA5E9]"
  },
  {
    title: "Education System",
    desc: "AI-powered evaluation and career guidance",
    icon: GraduationCap,
    gradient: "bg-gradient-to-br from-[#0EA5E9] to-[#3B82F6]"
  },
  {
    title: "Loan Approval",
    desc: "Unbiased financial assessment for everyone",
    icon: Landmark,
    gradient: "bg-gradient-to-br from-[#7C3AED] to-[#4F46E5]"
  },
  {
    title: "Document Verification",
    desc: "AI detects fake or tampered documents",
    icon: FileCheck,
    gradient: "bg-gradient-to-br from-[#0F172A] to-[#1E3A8A]"
  },
];

const keyFeatures = [
  {
    title: "Bias-Free Decisions",
    desc: "AI removes sensitive attributes for fair results",
    icon: Shield,
  },
  {
    title: "Smart Recommendations",
    desc: "Get job suggestions and skill-improvement tips",
    icon: Briefcase,
  },
  {
    title: "Document Verification",
    desc: "AI detects fake or edited documents",
    icon: FileCheck,
  },
  {
    title: "Privacy Protection",
    desc: "Only AI accesses your sensitive data",
    icon: Lock,
  },
  {
    title: "Secure Access",
    desc: "Role-based authentication system",
    icon: Users,
  },
  {
    title: "AI Audit Reports",
    desc: "Transparent fairness scores and bias insights",
    icon: BarChart3,
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E0F2FE] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] pointer-events-none" />
      
      <Header />

      <main className="relative z-10 w-full max-w-[1220px] mx-auto px-5 md:px-8 pt-[122px] pb-8">
        
        {/* Hero Section: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center mb-10">
          <div className="text-left space-y-7">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-[58px] font-black text-[#081a3a] tracking-tight leading-[1.08]">
                Unbiased <span className="text-[#045eea]">AI</span><br />
                <span className="text-[#075bea]">Decision System</span>
              </h1>
              <p className="text-lg md:text-xl font-black text-[#0F172A] mt-6 tracking-tight">
                {t.subtitle}
              </p>
              <p className="text-[#16213d] text-base md:text-lg max-w-xl mt-5 leading-relaxed font-medium">
                {t.description}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center lg:justify-end lg:-mt-2"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full scale-110 group-hover:bg-teal-500/10 transition-colors duration-700" />
              <img 
                src={logo}
                alt="Unbiased AI Logo"
                className="relative z-10 w-[360px] md:w-[520px] lg:w-[640px] h-auto object-contain mix-blend-multiply drop-shadow-[0_28px_60px_rgba(37,99,235,0.14)] transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          </motion.div>
        </div>

        {/* Key Features */}
        <section className="pb-14">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center text-3xl md:text-4xl font-black text-[#081a3a] tracking-tight mb-8"
          >
            Key Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <Card className="h-full rounded-[18px] border border-blue-100/80 bg-white/72 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(37,99,235,0.12)]">
                  <CardContent className="p-6 flex items-start gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-[#e6f1ff] text-[#075bea] flex items-center justify-center shrink-0 shadow-inner">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-lg font-black text-[#081a3a] tracking-tight mb-2">{feature.title}</h3>
                      <p className="text-sm font-medium leading-relaxed text-[#334155]">{feature.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Core Service Cards: 4 Horizontal Gradient Cards */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreModules.map((module, index) => {
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -12 }}
                >
                  <Card className={`${module.gradient} border-none shadow-[0_18px_35px_rgba(0,32,92,0.18)] rounded-[18px] overflow-hidden group h-[220px] flex flex-col justify-between transition-all duration-500`}>
                    <CardContent className="p-7 h-full flex flex-col justify-between">
                      <div className="space-y-5">
                        <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/15 shadow-inner">
                          <module.icon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white mb-3 tracking-tight">{module.title}</h3>
                          <p className="text-white/90 text-base font-medium leading-relaxed">
                            {module.desc}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
