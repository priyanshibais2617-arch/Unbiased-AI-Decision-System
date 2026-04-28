import { Shield, Mail, Phone, Twitter, Linkedin, Github, Activity } from "lucide-react";
import { useNavigate } from "react-router";

export function Footer() {
  const navigate = useNavigate();

  const handleNavClick = (path: string, scrollToTop: boolean = false) => {
    navigate(path);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#02040a] border-t border-white/5 pt-8 pb-8 text-slate-300">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-8">
          
          {/* Column 1: Unbiased AI System */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 cursor-pointer group w-fit" onClick={() => handleNavClick('/', true)}>
              <div className="p-2 bg-blue-600/10 rounded-xl group-hover:bg-blue-600/20 transition-all">
                <Shield className="h-7 w-7 text-[#075bea]" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">Unbiased AI System</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium">
              Empowering fair, secure, and intelligent decision-making without bias.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full w-fit border border-white/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-200">All Systems Operational</span>
            </div>
          </div>

          {/* Column 2: Platform Solutions */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h4 className="text-white font-black uppercase text-sm tracking-widest">Platform Solutions</h4>
              <span className="rounded-full bg-[#075bea] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">Feature Overview</span>
            </div>
            <ul className="space-y-4">
              {[
                { name: 'Student AI Console', path: '/education-system' },
                { name: 'Advanced Loan Evaluation', path: '/loan-approval' },
                { name: 'Job Match Analyzer', path: '/job-hiring' },
                { name: 'Admin Workspace', path: '/admin/dashboard' },
                { name: 'Document Verification', path: '/document-verification' }
              ].map((item) => (
                <li key={item.name}>
                  <button onClick={() => handleNavClick(item.path)} className="hover:text-cyan-400 text-[15px] font-bold transition-colors">
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Trust & Ethics */}
          <div>
            <h4 className="text-white font-black uppercase text-sm tracking-widest mb-6">Trust & Ethics</h4>
            <ul className="space-y-4">
              {[
                { name: 'AI Fairness Policy', path: '/ai-fairness' },
                { name: 'Bias Mitigation Reports', path: '/bias-reports' },
                { name: 'Data Privacy & Security', path: '/privacy-security' },
                { name: 'Compliance (SOC2/GDPR)', path: '/compliance' }
              ].map((item) => (
                <li key={item.name}>
                  <button onClick={() => handleNavClick(item.path)} className="hover:text-cyan-400 text-[15px] font-bold transition-colors">
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h4 className="text-white font-black uppercase text-sm tracking-widest mb-6">Connect</h4>
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <a href="mailto:support@unbiased-ai.io" className="flex items-center gap-3 group">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-cyan-500/10 transition-colors">
                    <Mail className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span className="text-sm font-bold group-hover:text-white transition-colors">Email Support</span>
                </a>
                <a href="tel:+18001234567" className="flex items-center gap-3 group">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/10 transition-colors">
                    <Phone className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <span className="text-sm font-bold group-hover:text-white transition-colors">1-800-123-4567</span>
                </a>
              </div>
              <div className="flex gap-4">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <a key={i} href="#" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 hover:scale-110 transition-all text-white/50 hover:text-cyan-400 shadow-xl">
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-600">
          <p>© 2026 Unbiased AI System. Built for Fairness.</p>
          <div className="flex gap-8">
            <button className="hover:text-white transition-colors">Privacy</button>
            <button className="hover:text-white transition-colors">Terms</button>
            <button className="hover:text-white transition-colors">Status</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
