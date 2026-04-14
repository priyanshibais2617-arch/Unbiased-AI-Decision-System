import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  LogOut, Users, Activity, AlertCircle,
  Coins, Search, Clock, Trophy, Download, ScanLine, FileCheck2, Calculator, CheckCircle2, RotateCcw,
  Bell
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUser } from "./UserContext";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";

export function LoanAdminDashboard() {
  const navigate = useNavigate();
  const { setUserRole } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    setUserRole(null);
    navigate('/');
  };

  const loginData = [
    { day: "Mon", users: 150 },
    { day: "Tue", users: 230 },
    { day: "Wed", users: 320 },
    { day: "Thu", users: 280 },
    { day: "Fri", users: 410 },
    { day: "Sat", users: 390 },
    { day: "Sun", users: 450 },
  ];

  const recentActivity = [
    { id: 1, name: "Rahul Verma", time: "5 mins ago", action: "Used What-If Simulator", status: "Active" },
    { id: 2, name: "Sneha Iyer", time: "12 mins ago", action: "Uploaded Documents", status: "Processing" },
    { id: 3, name: "Amit Kumar", time: "1 hour ago", action: "Ran Loan Analysis", status: "Completed" },
    { id: 4, name: "Priya Das", time: "2 hours ago", action: "Viewed Results", status: "Completed" },
    { id: 5, name: "Karan Singh", time: "3 hours ago", action: "Logged In", status: "Active" },
  ];

  const filteredActivity = recentActivity.filter(activity =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const documentUploads = [
    { name: "Rahul Verma", type: "Bank Statement", status: "Processed" },
    { name: "Sneha Iyer", type: "Tax Return", status: "Failed" },
    { name: "Vikram Malhotra", type: "ID Proof", status: "Pending" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans w-full">
      
      {/* 1. Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm w-full">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-sm">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Loan Department Dashboard
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 hidden md:flex items-center gap-1 shrink-0 text-xs shadow-sm ml-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Real-time Monitoring Enabled
                  </Badge>
                </h1>
                <p className="text-sm text-slate-500 font-medium hidden sm:block">Monitor user activity in Advanced Loan System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors rounded-xl h-10 w-10 shadow-sm relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors rounded-xl gap-2 h-10 shadow-sm">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-6 w-full">
        
        {/* 2. Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="rounded-[24px] border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Total Users Logged In</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">850</h3>
                    <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 w-fit px-2.5 py-0.5 rounded-full">+10% from yesterday</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100/50 shadow-inner">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
            <Card className="rounded-[24px] border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Active Users (Live)</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">120 <span className="text-sm font-medium text-slate-400">online now</span></h3>
                    <div className="flex items-center gap-2 mt-2 bg-slate-50 w-fit px-2.5 py-0.5 rounded-full ring-1 ring-slate-200/50">
                       <span className="relative flex h-2.5 w-2.5">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                       </span>
                       <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">Live Sync</span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100/50 shadow-inner">
                    <Activity className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="rounded-[24px] border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Loan Analyses Performed</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">540 <span className="text-sm font-medium text-slate-400">today</span></h3>
                    <p className="text-xs font-bold text-indigo-600 mt-2 bg-indigo-50 w-fit px-2.5 py-0.5 rounded-full">AI Tracking Active</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100/50 shadow-inner">
                    <Search className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
            <Card className="rounded-[24px] border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ring-1 ring-purple-100">
              <CardContent className="p-6 bg-gradient-to-br from-white to-purple-50/50 rounded-[24px]">
                <div className="flex justify-between items-start">
                  <div>
                     <p className="text-sm font-semibold text-slate-500 mb-1">Approval Requests Generated</p>
                     <h3 className="text-3xl font-black text-purple-700 tracking-tight">210</h3>
                     <p className="text-xs font-bold text-purple-700 mt-2 bg-purple-100 w-fit px-2.5 py-0.5 rounded-full shadow-sm">+25 pending review</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl border border-purple-200/50 shadow-inner">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <div className="xl:col-span-2 space-y-6">
            
            {/* 3. User Activity Graph */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="rounded-[24px] border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4 bg-white/50 flex flex-row items-center justify-between">
                   <div>
                     <CardTitle className="text-lg">Daily User Logins</CardTitle>
                     <CardDescription>System usage trend over the last 7 days</CardDescription>
                   </div>
                   <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2 text-xs font-bold font-sans hidden sm:flex">
                      <Download className="h-3 w-3" />
                      Export CSV
                   </Button>
                </CardHeader>
                <CardContent className="pt-6">
                   <div className="h-[320px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={loginData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                           <XAxis dataKey="day" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                           <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                           <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                           <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                     </ResponsiveContainer>
                   </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 4. Recent User Activity Tracker */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="rounded-[24px] border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50">
                   <div>
                     <CardTitle className="text-lg">Live User Activity Log</CardTitle>
                     <CardDescription>Real-time feed of actions performed by users</CardDescription>
                   </div>
                   <div className="flex items-center gap-2 w-full sm:w-auto">
                     <div className="relative flex-1 sm:flex-none">
                       <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="Search users..." 
                         className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-48 outline-none transition-all shadow-inner"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                       />
                     </div>
                     <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-slate-600 hidden sm:block">
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                     </select>
                   </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                       <tr>
                         <th className="px-6 py-4 whitespace-nowrap">User Name</th>
                         <th className="px-6 py-4 whitespace-nowrap">Login Time</th>
                         <th className="px-6 py-4 whitespace-nowrap">Action Performed</th>
                         <th className="px-6 py-4 whitespace-nowrap">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 font-medium">
                       {filteredActivity.map((act) => (
                          <tr key={act.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4 text-slate-900 font-semibold group-hover:text-purple-700 transition-colors whitespace-nowrap">{act.name}</td>
                            <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5 whitespace-nowrap"><Clock className="h-3 w-3 text-slate-400" /> {act.time}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 ${
                                    act.action.includes('Simulator') ? 'text-blue-700' :
                                    act.action.includes('Analysis') ? 'text-purple-700' :
                                    act.action.includes('Documents') ? 'text-indigo-700' : 'text-slate-700'
                                }`}>
                                    {act.action}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <Badge variant="outline" className={`border-0 font-bold px-2.5 py-0.5 rounded-md ${
                                  act.status === 'Active' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/50' :
                                  act.status === 'Processing' ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200/50' :
                                  act.status === 'Completed' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200/50' :
                                  'bg-slate-100 text-slate-600 ring-1 ring-slate-200/50'
                               }`}>
                                  {act.status === 'Active' && "🟢 "}
                                  {act.status === 'Processing' && "🟡 "}
                                  {act.status === 'Completed' && "✅ "}
                                  {act.status}
                               </Badge>
                            </td>
                          </tr>
                       ))}
                       {filteredActivity.length === 0 && (
                          <tr>
                             <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No activity found matching "{searchTerm}"</td>
                          </tr>
                       )}
                     </tbody>
                   </table>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            
            {/* 5. Loan Activity Insights Panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <Card className="rounded-[24px] border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
                <CardHeader className="border-b border-white/10 pb-4 relative z-10">
                   <CardTitle className="text-lg text-white">Activity Insights</CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4 relative z-10">
                   <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                         <Trophy className="h-5 w-5 text-yellow-400" />
                         <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Most Active User</p>
                            <p className="text-sm font-semibold">Rahul Verma</p>
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                         <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Avg Loan Amt</p>
                         <p className="text-lg font-black tracking-tight text-emerald-400">₹8.5L</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                         <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Avg Approval</p>
                         <p className="text-lg font-black tracking-tight text-blue-400">72%</p>
                      </div>
                   </div>
                   <div className="bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">Most Used Feature</p>
                      <div className="flex items-center justify-between">
                         <span className="text-sm font-bold flex items-center gap-2"><Calculator className="h-4 w-4 text-purple-400"/> What-If Simulator</span>
                         <Badge className="bg-purple-500/20 text-purple-300 border-0">45%</Badge>
                      </div>
                   </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 6. Document Upload & 7. Processing Combined View */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
              <Card className="rounded-[24px] border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-slate-100 pb-4">
                   <CardTitle className="text-lg">System Processing</CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-6">
                   
                   <div className="grid grid-cols-3 gap-2 text-center border-b border-slate-100 pb-5">
                      <div className="group cursor-default">
                         <p className="text-2xl font-black text-slate-900 group-hover:scale-110 transition-transform">1,204</p>
                         <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Docs Today</p>
                      </div>
                      <div className="group cursor-default">
                         <p className="text-2xl font-black text-blue-600 group-hover:scale-110 transition-transform">890</p>
                         <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">OCR Scanned</p>
                      </div>
                      <div className="group cursor-default">
                         <p className="text-2xl font-black text-emerald-600 group-hover:scale-110 transition-transform">420</p>
                         <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Analyses Done</p>
                      </div>
                   </div>

                   <div>
                      <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                         <ScanLine className="h-4 w-4 text-slate-400" /> Recent Document Uploads
                      </p>
                      <div className="space-y-3">
                         {documentUploads.map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg -mx-2 transition-colors cursor-pointer group">
                               <div className="flex items-center gap-3">
                                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all text-slate-500 group-hover:text-purple-600">
                                     <FileCheck2 className="h-4 w-4" />
                                  </div>
                                  <div>
                                     <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{doc.name}</p>
                                     <p className="text-[10px] font-semibold text-slate-500 uppercase">{doc.type}</p>
                                  </div>
                               </div>
                               <Badge variant="outline" className={`border-0 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                  doc.status === 'Processed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50' :
                                  doc.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 ring-1 ring-yellow-200/50' : 
                                  'bg-red-50 text-red-600 ring-1 ring-red-200/50'
                               }`}>
                                  {doc.status}
                               </Badge>
                            </div>
                         ))}
                      </div>
                   </div>

                </CardContent>
              </Card>
            </motion.div>

            {/* 8. Alerts & Notifications Panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
              <Card className="rounded-[24px] border-0 shadow-sm hover:shadow-md transition-shadow ring-1 ring-red-50">
                <CardHeader className="border-b border-red-50 pb-4 bg-red-50/30 rounded-t-[24px]">
                   <CardTitle className="text-lg flex items-center gap-2">
                      System Alerts
                      <Badge className="bg-red-500 text-white hover:bg-red-600 border-0 rounded-full px-1.5 h-5 flex items-center justify-center -ml-1 flex-shrink-0 shadow-sm">2</Badge>
                   </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-3">
                   
                   <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-start group hover:bg-red-100/50 transition-colors cursor-pointer shadow-sm">
                      <div className="p-2 bg-red-100 rounded-lg shrink-0">
                         <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                         <p className="text-sm font-extrabold text-red-900 tracking-tight">Failed Document Uploads</p>
                         <p className="text-xs text-red-700/80 mt-1 font-semibold leading-relaxed mb-2">5 files failed OCR parsing in the last hour. Review flagged files.</p>
                         <Button size="sm" variant="outline" className="h-7 text-[10px] bg-white border-red-200 text-red-700 hover:bg-red-50 uppercase font-bold tracking-wider">Review Files</Button>
                      </div>
                   </div>

                   <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex gap-3 items-start group hover:bg-yellow-100/50 transition-colors cursor-pointer shadow-sm">
                      <div className="p-2 bg-yellow-100 rounded-lg shrink-0">
                         <RotateCcw className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                         <p className="text-sm font-extrabold text-yellow-900 tracking-tight">Incomplete Applications</p>
                         <p className="text-xs text-yellow-700/80 mt-1 font-semibold leading-relaxed">24 users have been idle at the "Upload Docs" step for &gt;30 mins.</p>
                      </div>
                   </div>

                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
