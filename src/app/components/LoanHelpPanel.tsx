import { ArrowLeft, HelpCircle, Mail, MessageCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

const faqs = [
  { q: "How is my loan approval chance calculated?", a: "Our AI processes your CIBIL score, monthly income, employment state, and existing liabilities to predict approval probabilities instantly." },
  { q: "Can I update my employment details later?", a: "Yes, you can edit your employment details in the 'Edit Profile Info' section. Any changes might trigger a recalculation of your loan offers." },
  { q: "Why is an EMI higher than expected?", a: "EMI is impacted by interest rate fluctuations and the tenure selected. Try extending the tenure if you need a smaller monthly deduction." }
];

export function LoanHelpPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="bg-gradient-to-br from-indigo-800 to-purple-900 p-6 text-white relative flex-shrink-0 shadow-lg">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <div className="mt-2 text-white">
             <h2 className="text-xl font-bold tracking-tight">Help & Support</h2>
             <p className="text-indigo-200 text-sm mt-0.5 min-h-[40px]">Need help with your loan? Our support team is here for you.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mail className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-slate-800">Email Support</span>
            </button>
            <button className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-slate-800">Live Chat</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 hover:shadow-md transition-shadow">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2"><HelpCircle className="h-4 w-4" /> FAQs</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 group">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex justify-between items-center text-left"
                  >
                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="h-4 w-4 text-indigo-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>
                  {openFaq === idx && (
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium animate-in fade-in slide-in-from-top-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-5 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10">
          <Button variant="outline" className="w-full text-amber-600 border-2 border-amber-200 hover:bg-amber-50 hover:text-amber-700 rounded-xl h-12 text-sm font-bold flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" /> Report an Issue
          </Button>
        </div>
      </div>
    </>
  );
}
