import { useNavigate } from "react-router";
import { Building2, ArrowLeft, TrendingUp, CheckCircle2, AlertCircle, FileCheck, FileText, Zap, ChevronRight, Upload, PlayCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Progress } from "./ui/progress";

export function SecureLoanAccess() {
  const navigate = useNavigate();

  const handleApply = () => {
    navigate("/loan-approval");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 pb-12 px-4 relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 -z-10" />

      {/* Floating Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 relative z-10 pt-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/20 rounded-xl gap-2 font-semibold shadow-sm backdrop-blur-md">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="w-full max-w-6xl relative z-10 space-y-6">
        
        {/* Page Header */}
        <div className="text-left mb-8 flex items-center gap-5">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/20 shrink-0">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Advanced Loan System</h1>
            <p className="text-sm md:text-base font-medium text-indigo-100 mt-1 max-w-xl">Manage your loan eligibility, analysis, and application status.</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Eligibility & Status (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Eligibility Card */}
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                   <div className="space-y-4 flex-1">
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 className="h-4 w-4 text-emerald-500"/> Eligibility Status
                     </p>
                     <div className="flex flex-col items-start gap-3">
                       <div className="flex items-end gap-3">
                         <h2 className="text-4xl font-black text-slate-900">Pending</h2>
                         <span className="mb-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">Action Required</span>
                       </div>
                       <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-sm">Run the interactive assessment to calculate your approval chance automatically.</p>
                     </div>
                   </div>
                   
                   <div className="flex-1 flex gap-4 md:border-l md:border-slate-100 md:pl-6 w-full">
                     <div className="flex-1 bg-indigo-50/80 p-5 rounded-2xl border border-indigo-100/50 shadow-sm text-center md:text-left">
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Chance</p>
                        <p className="text-3xl font-black text-indigo-700">--%</p>
                     </div>
                     <div className="flex-1 bg-orange-50/80 p-5 rounded-2xl border border-orange-100/50 shadow-sm text-center md:text-left">
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Risk</p>
                        <p className="text-3xl font-black text-orange-600">--</p>
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="border-0 shadow-sm rounded-3xl bg-white border-b border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <FileText className="h-5 w-5 text-blue-500"/> Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Income</p>
                       <p className="text-xl font-bold text-slate-900">₹5.3L</p>
                    </div>
                    <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Existing EMI</p>
                       <p className="text-xl font-bold text-slate-900">₹41K</p>
                    </div>
                    <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credit Score</p>
                       <p className="text-xl font-bold text-slate-900">745</p>
                    </div>
                    <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employment</p>
                       <p className="text-xl font-bold text-slate-900">Salaried</p>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Progress & Suggestions */}
          <div className="space-y-6">
            
            {/* Application Progress */}
            <Card className="border-0 shadow-sm rounded-3xl bg-white flex flex-col h-full md:h-auto">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500"/> Application Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">Documents Submitted</span>
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">0 / 5</span>
                    </div>
                    <Progress value={0} className="h-2.5 bg-slate-100 [&>div]:bg-indigo-500 rounded-full" />
                 </div>
                 
                 <div className="space-y-4">
                   <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                     <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verification Status</span>
                     <span className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">Pending Docs</span>
                   </div>
                   <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                     <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Approval Stage</span>
                     <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">Not Started</span>
                   </div>
                 </div>
              </CardContent>
            </Card>

          </div>
        </div>
        
        {/* Smart Suggestions */}
        <div className="grid grid-cols-1">
            <Card className="border-0 shadow-sm rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-t border-indigo-100/50">
               <CardHeader className="pb-2">
                 <CardTitle className="text-base font-bold text-indigo-900 flex items-center gap-2">
                   <Zap className="h-5 w-5 text-purple-500"/> Smart AI Suggestions
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div className="flex items-start gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100/50">
                       <span className="text-indigo-500 shrink-0 mt-0.5 bg-indigo-50 p-1.5 rounded-full"><TrendingUp className="h-4 w-4"/></span>
                       <p className="text-sm font-medium text-slate-700 leading-relaxed">Improve credit score by paying off any active short-term debt.</p>
                    </div>
                    <div className="flex items-start gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100/50">
                       <span className="text-purple-500 shrink-0 mt-0.5 bg-purple-50 p-1.5 rounded-full"><AlertCircle className="h-4 w-4"/></span>
                       <p className="text-sm font-medium text-slate-700 leading-relaxed">Reduce EMI burden before applying for a large amount.</p>
                    </div>
                    <div className="flex items-start gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100/50">
                       <span className="text-emerald-500 shrink-0 mt-0.5 bg-emerald-50 p-1.5 rounded-full"><Building2 className="h-4 w-4"/></span>
                       <p className="text-sm font-medium text-slate-700 leading-relaxed">Better bank recommendations available after interactive assessment.</p>
                    </div>
                 </div>
               </CardContent>
            </Card>
        </div>

        {/* Action Buttons Section */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
           <Button onClick={handleApply} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 text-base font-bold shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5">
             <PlayCircle className="h-5 w-5 mr-2" /> Check Eligibility & Assessment
           </Button>
           
           <Button onClick={handleApply} variant="outline" className="flex-1 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl h-14 text-base font-bold shadow-sm border-slate-200 transition-transform hover:-translate-y-0.5">
             <Upload className="h-5 w-5 mr-2 text-indigo-600" /> Upload Missing Documents
           </Button>
           
           <Button variant="outline" className="flex-1 bg-slate-50 text-slate-400 rounded-2xl h-14 text-base font-bold shadow-none border-slate-200 cursor-not-allowed">
             <FileCheck className="h-5 w-5 mr-2" /> View Loan Report
           </Button>
        </div>

      </div>
    </div>
  );
}
