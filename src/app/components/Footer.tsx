import { Shield, Mail, Phone, ExternalLink } from "lucide-react";
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
    <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 text-slate-300">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4 cursor-pointer group w-fit" onClick={() => handleNavClick('/', true)}>
              <div className="p-1.5 bg-blue-900/50 rounded-lg group-hover:bg-blue-800/50 transition-colors">
                <Shield className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <span className="font-bold text-xl text-white group-hover:text-blue-50 transition-colors">Unbiased AI System</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-6 leading-relaxed font-medium">
              Empowering individuals and businesses with fair, secure, and intelligent decision-making without bias.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold tracking-wide uppercase text-sm mb-5">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:support@unbiased.ai" className="flex items-start gap-3 group">
                  <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-900/40 transition-colors mt-0.5">
                    <Mail className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Email Us</p>
                    <p className="text-xs text-slate-400 mt-0.5 group-hover:text-blue-300 transition-colors">support@unbiased-ai.systems</p>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 group cursor-default">
                  <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-purple-900/40 transition-colors mt-0.5">
                    <Phone className="h-4 w-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Call Us</p>
                    <p className="text-xs text-slate-400 mt-0.5 group-hover:text-purple-300 transition-colors">+1 (800) 123-4567</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-slate-500">
          <p>© 2026 Unbiased AI System. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">LinkedIn</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">GitHub</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
