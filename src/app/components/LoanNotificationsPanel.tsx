import { useState } from "react";
import { ArrowLeft, Bell, CheckCircle2, DollarSign, FileCheck, Lightbulb, Mail, Smartphone, AppWindow } from "lucide-react";
import { Switch } from "./ui/switch";

export function LoanNotificationsPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [alerts, setAlerts] = useState({
    approval: true,
    emi: true,
    documents: true,
    offers: false
  });
  
  const [delivery, setDelivery] = useState({
    email: true,
    sms: true,
    inApp: true
  });

  if (!isOpen) return null;

  const toggleAlert = (key: keyof typeof alerts) => setAlerts(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleDelivery = (key: keyof typeof delivery) => setDelivery(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="bg-gradient-to-br from-indigo-800 to-purple-900 p-6 text-white relative flex-shrink-0 shadow-lg">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <div className="mt-2 text-white">
             <h2 className="text-xl font-bold tracking-tight">Notification Preferences</h2>
             <p className="text-indigo-200 text-sm mt-0.5">Control how and when you are alerted</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Notification Types</h3>
            <div className="space-y-4">
              
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Loan Approval Updates</p>
                    <p className="text-[11px] font-medium text-slate-500">Status changes and bank responses</p>
                  </div>
                </div>
                <Switch checked={alerts.approval} onCheckedChange={() => toggleAlert('approval')} className="data-[state=checked]:bg-indigo-600" />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><DollarSign className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">EMI Reminders</p>
                    <p className="text-[11px] font-medium text-slate-500">Upcoming payments & auto-debit alerts</p>
                  </div>
                </div>
                <Switch checked={alerts.emi} onCheckedChange={() => toggleAlert('emi')} className="data-[state=checked]:bg-indigo-600" />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><FileCheck className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Document Verification</p>
                    <p className="text-[11px] font-medium text-slate-500">KYC requests and document status</p>
                  </div>
                </div>
                <Switch checked={alerts.documents} onCheckedChange={() => toggleAlert('documents')} className="data-[state=checked]:bg-indigo-600" />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Lightbulb className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Offers & Recommendations</p>
                    <p className="text-[11px] font-medium text-slate-500">Top-up loans and interest rate drops</p>
                  </div>
                </div>
                <Switch checked={alerts.offers} onCheckedChange={() => toggleAlert('offers')} className="data-[state=checked]:bg-indigo-600" />
              </div>

            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Delivery Methods</h3>
            <div className="flex flex-col gap-3">
              <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${delivery.email ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <Mail className={`h-5 w-5 ${delivery.email ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold ${delivery.email ? 'text-indigo-900' : 'text-slate-700'}`}>Email Notifications</span>
                </div>
                <Switch checked={delivery.email} onCheckedChange={() => toggleDelivery('email')} className="data-[state=checked]:bg-indigo-600" />
              </label>

              <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${delivery.sms ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <Smartphone className={`h-5 w-5 ${delivery.sms ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold ${delivery.sms ? 'text-indigo-900' : 'text-slate-700'}`}>SMS Alerts</span>
                </div>
                <Switch checked={delivery.sms} onCheckedChange={() => toggleDelivery('sms')} className="data-[state=checked]:bg-indigo-600" />
              </label>

              <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${delivery.inApp ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <AppWindow className={`h-5 w-5 ${delivery.inApp ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold ${delivery.inApp ? 'text-indigo-900' : 'text-slate-700'}`}>In-App Popups</span>
                </div>
                <Switch checked={delivery.inApp} onCheckedChange={() => toggleDelivery('inApp')} className="data-[state=checked]:bg-indigo-600" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
