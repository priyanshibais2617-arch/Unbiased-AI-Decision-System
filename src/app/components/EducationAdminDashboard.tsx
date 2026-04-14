import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  LogOut, Users, Activity, FileText, AlertCircle,
  GraduationCap, Search, Filter, Clock, CheckCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUser } from "./UserContext";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";

export function EducationAdminDashboard() {
  const navigate = useNavigate();
  const { setUserRole } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    setUserRole(null);
    navigate('/');
  };

  const loginData = [
    { day: "Mon", students: 210 },
    { day: "Tue", students: 250 },
    { day: "Wed", students: 280 },
    { day: "Thu", students: 260 },
    { day: "Fri", students: 310 },
    { day: "Sat", students: 180 },
    { day: "Sun", students: 150 },
  ];

  const recentActivity = [
    { id: 1, name: "Aarav Sharma", time: "10 mins ago", type: "Submitted Assignment", status: "Active" },
    { id: 2, name: "Priya Patel", time: "1 hour ago", type: "Logged In", status: "Active" },
    { id: 3, name: "Rohan Kumar", time: "3 hours ago", type: "Quiz Completed", status: "Idle" },
    { id: 4, name: "Sneha Gupta", time: "Yesterday", type: "Logged In", status: "Logged Out" },
    { id: 5, name: "Vikram Singh", time: "2 days ago", type: "Logged In", status: "Logged Out" },
  ];

  const filteredActivity = recentActivity.filter(activity =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 pt-4 max-w-[1400px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500 rounded-xl shadow-sm">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Education Admin Dashboard</h1>
                <p className="text-sm text-slate-500 font-medium hidden sm:block">Monitor student activity & academic engagement</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 border border-blue-100 hidden md:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full shadow-sm">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                 AI-based • Unbiased Decisions
              </Badge>
              <Button variant="outline" onClick={handleLogout} className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors rounded-xl gap-2 h-10 shadow-sm">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-6 -mb-px">
             <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-1 border-b-2 text-sm font-semibold transition-colors ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
                Overview
             </button>
             <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 px-1 border-b-2 text-sm font-semibold transition-colors ${activeTab === 'analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
                Analytics
             </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-[1400px]">
           {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                 
                 {/* Top Section: Single Horizontal Stats Container */}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-wrap lg:flex-nowrap divide-y lg:divide-y-0 lg:divide-x divide-slate-100 gap-y-6">
                    <div className="w-full lg:w-1/4 px-4 lg:px-6 first:pl-0 last:pr-0 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-semibold text-slate-500 mb-1">Active Students</p>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold text-slate-900">1,240</h3>
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+8%</span>
                          </div>
                       </div>
                       <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                          <Users className="h-5 w-5" />
                       </div>
                    </div>

                    <div className="w-full lg:w-1/4 px-4 lg:px-6 first:pl-0 last:pr-0 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-semibold text-slate-500 mb-1">Total Logins</p>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold text-slate-900">320</h3>
                            <span className="text-xs font-semibold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> Real-time</span>
                          </div>
                       </div>
                       <div className="p-3 bg-green-50 rounded-xl text-green-500">
                          <Activity className="h-5 w-5" />
                       </div>
                    </div>

                    <div className="w-full lg:w-1/4 px-4 lg:px-6 first:pl-0 last:pr-0 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-semibold text-slate-500 mb-1">Assignments Submitted</p>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold text-slate-900">210</h3>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">70%</span>
                          </div>
                       </div>
                       <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                          <FileText className="h-5 w-5" />
                       </div>
                    </div>

                    <div className="w-full lg:w-1/4 px-4 lg:px-6 first:pl-0 last:pr-0 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-semibold text-slate-500 mb-1">Pending Submissions</p>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold text-red-500">85</h3>
                          </div>
                       </div>
                       <div className="p-3 bg-red-50 rounded-xl text-red-500">
                          <AlertCircle className="h-5 w-5" />
                       </div>
                    </div>
                 </div>

                 {/* Middle Section */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Student Login Activity */}
                    <Card className="lg:col-span-2 rounded-2xl border-0 shadow-sm overflow-hidden bg-white">
                       <CardHeader className="border-b border-slate-50 pb-4">
                          <CardTitle className="text-lg">Student Login Activity</CardTitle>
                          <CardDescription>Last 7 days engagement</CardDescription>
                       </CardHeader>
                       <CardContent className="pt-6 h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={loginData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                   <linearGradient id="colorStudentsArea" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="day" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                                <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Area type="monotone" dataKey="students" stroke="#4F8CFF" strokeWidth={3} fillOpacity={1} fill="url(#colorStudentsArea)" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </CardContent>
                    </Card>

                    {/* Right: At a Glance */}
                    <div className="space-y-4 flex flex-col justify-between">
                       <Card className="rounded-2xl border-0 shadow-sm bg-white flex-1">
                          <CardContent className="p-5 flex items-center gap-4 h-full relative overflow-hidden">
                             <div className="p-4 bg-green-50 rounded-xl text-green-500 z-10 relative">
                                <Activity className="h-6 w-6" />
                             </div>
                             <div className="z-10 relative">
                                <p className="text-sm font-semibold text-slate-500 mb-1">Logins Today</p>
                                <h3 className="text-xl font-bold text-slate-900">320</h3>
                             </div>
                             <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-green-50 to-transparent"></div>
                          </CardContent>
                       </Card>
                       <Card className="rounded-2xl border-0 shadow-sm bg-white flex-1">
                          <CardContent className="p-5 flex items-center gap-4 h-full relative overflow-hidden">
                             <div className="p-4 bg-blue-50 rounded-xl text-blue-500 z-10 relative">
                                <CheckCircle className="h-6 w-6" />
                             </div>
                             <div className="z-10 relative">
                                <p className="text-sm font-semibold text-slate-500 mb-1">Completion Rate</p>
                                <h3 className="text-xl font-bold text-slate-900">70%</h3>
                             </div>
                             <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-blue-50 to-transparent"></div>
                          </CardContent>
                       </Card>
                       <Card className="rounded-2xl border-0 shadow-sm bg-white flex-1 ring-1 ring-orange-100">
                          <CardContent className="p-5 flex items-center gap-4 h-full relative overflow-hidden">
                             <div className="p-4 bg-orange-50 rounded-xl text-orange-500 z-10 relative">
                                <AlertCircle className="h-6 w-6" />
                             </div>
                             <div className="z-10 relative">
                                <p className="text-sm font-semibold text-slate-500 mb-1">Overdue Assignments</p>
                                <h3 className="text-xl font-bold text-orange-500">12</h3>
                             </div>
                             <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-orange-50 to-transparent"></div>
                          </CardContent>
                       </Card>
                    </div>
                 </div>

                 {/* Bottom Note */}
                 <div className="text-center pt-8 pb-4">
                    <p className="text-sm text-slate-500 italic bg-blue-50/50 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-100/50 shadow-sm">
                       <span className="w-2 h-2 rounded-full bg-blue-500"></span> All insights are AI-powered and unbiased for fair academic decision making.
                    </p>
                 </div>
              </motion.div>
           )}

           {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 
                 {/* Left Section: Recent Student Activity */}
                 <Card className="lg:col-span-2 rounded-2xl border-0 shadow-sm overflow-hidden bg-white flex flex-col">
                    <CardHeader className="border-b border-slate-50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div>
                          <CardTitle className="text-lg">Recent Student Activity</CardTitle>
                          <CardDescription>Live feed of system interactions</CardDescription>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="relative">
                             <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                             <input 
                                type="text" 
                                placeholder="Search students..." 
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                             />
                          </div>
                          <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50">
                             <Filter className="h-4 w-4" />
                          </Button>
                       </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto flex-1">
                       <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                             <tr>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">Activity Time</th>
                                <th className="px-6 py-4">Activity Type</th>
                                <th className="px-6 py-4">Status</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                             {filteredActivity.map((act) => (
                                <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                                   <td className="px-6 py-4 font-semibold text-slate-900">{act.name}</td>
                                   <td className="px-6 py-4 flex items-center gap-1.5"><Clock className="h-3 w-3 text-slate-400" /> {act.time}</td>
                                   <td className="px-6 py-4">{act.type}</td>
                                   <td className="px-6 py-4">
                                      <Badge variant="outline" className={`border-0 font-semibold px-2.5 py-0.5 rounded-md ${
                                         act.status === 'Active' ? 'bg-green-100 text-green-700' :
                                         act.status === 'Idle' ? 'bg-orange-100 text-orange-700' :
                                         'bg-slate-100 text-slate-600'
                                      }`}>
                                         {act.status}
                                      </Badge>
                                   </td>
                                </tr>
                             ))}
                             {filteredActivity.length === 0 && (
                                <tr>
                                   <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No activity found</td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </CardContent>
                 </Card>

                 {/* Right Section: Assignment Tracking & Alerts */}
                 <div className="space-y-6">
                    <Card className="rounded-2xl border-0 shadow-sm bg-white">
                       <CardHeader className="border-b border-slate-50 pb-4">
                          <CardTitle className="text-lg">Assignment Tracking</CardTitle>
                       </CardHeader>
                       <CardContent className="pt-5 space-y-5">
                          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                             <span className="text-sm font-semibold text-slate-500">Total Assigned</span>
                             <span className="text-lg font-bold text-slate-900">300</span>
                          </div>
                          
                          <div className="space-y-2">
                             <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700">Submitted</span>
                                <span className="font-bold text-green-600">210 (70%)</span>
                             </div>
                             <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700">Pending</span>
                                <span className="font-bold text-orange-500">75 (25%)</span>
                             </div>
                             <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700">Overdue</span>
                                <span className="font-bold text-red-500">15 (5%)</span>
                             </div>
                             <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '5%' }}></div>
                             </div>
                          </div>
                       </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-0 shadow-sm bg-white ring-1 ring-red-50">
                       <CardHeader className="border-b border-red-50 pb-4 bg-red-50/50 rounded-t-2xl">
                          <CardTitle className="text-lg text-red-900">Alerts Panel</CardTitle>
                       </CardHeader>
                       <CardContent className="pt-5 space-y-3">
                          <div className="flex gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl items-start">
                             <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                             <div>
                                <p className="text-sm font-bold">System Maintenance</p>
                                <p className="text-xs mt-0.5 font-medium">Scheduled downtime tonight.</p>
                             </div>
                          </div>
                          <div className="flex gap-3 p-3 bg-orange-50 text-orange-700 rounded-xl items-start">
                             <Clock className="h-5 w-5 shrink-0 mt-0.5" />
                             <div>
                                <p className="text-sm font-bold">Inactive Students</p>
                                <p className="text-xs mt-0.5 font-medium">12 students inactive for 3+ days.</p>
                             </div>
                          </div>
                          <div className="flex gap-3 p-3 bg-red-50 text-red-700 rounded-xl items-start">
                             <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                             <div>
                                <p className="text-sm font-bold">Late Submissions</p>
                                <p className="text-xs mt-0.5 font-medium">15 assignments are overdue.</p>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 </div>

                 {/* Bottom Note */}
                 <div className="lg:col-span-3 text-center pt-8 pb-4">
                    <p className="text-sm text-slate-500 italic bg-blue-50/50 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-100/50 shadow-sm">
                       <span className="w-2 h-2 rounded-full bg-blue-500"></span> All analytics and alerts are generated using AI-based unbiased decision systems.
                    </p>
                 </div>
              </motion.div>
           )}
      </main>
    </div>
  );
}
