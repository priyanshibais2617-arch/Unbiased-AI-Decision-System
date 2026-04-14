import { ArrowLeft, HelpCircle, Mail, MessageCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

const faqs = [
  { q: "How does AI evaluate my assignments?", a: "Our AI uses advanced NLP models to analyze structure, grammar, and relevance against the rubric provided by your instructor." },
  { q: "Where can I download my certificates?", a: "Go to the Achievements section in your profile and click on any earned badge to download the printable certificate." },
  { q: "Why is my profile strength not 100%?", a: "You might be missing a profile photo, contact details, or verified email address. Check the Edit Profile section to complete missing fields." }
];

export function StudentHelpPanel({ onBack }: { onBack: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10 animate-in slide-in-from-right-full duration-300">
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 text-white flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold">Help & Support</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
        
        <div className="flex flex-col items-center text-center mb-8 mt-2">
          <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-3">
            <HelpCircle className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold text-slate-800">We're here to help you anytime.</p>
          <p className="text-xs text-slate-500 mt-1">Get support instantly.</p>
        </div>

        {/* Contact Support */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all group">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Mail className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Email Support</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all group">
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Live Chat</span>
          </button>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Frequently Asked Questions</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <span className="text-sm font-semibold text-slate-700">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {openFaq === idx && (
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed animate-in fade-in slide-in-from-top-2">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 rounded-xl h-12 text-sm font-bold flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" /> Report an Issue
        </Button>

      </div>
    </div>
  );
}
