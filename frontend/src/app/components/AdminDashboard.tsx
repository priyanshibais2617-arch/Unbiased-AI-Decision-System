import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { 
  Users, FileText, AlertTriangle, LogOut, Shield, 
  Bell, Lightbulb, Activity, GraduationCap, IndianRupee, Briefcase
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUser } from "./UserContext";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import { apiFetch } from "../api";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { setUserRole } = useUser();
  const [dashboardStats, setDashboardStats] = useState({
    total_users: 0,
    total_reports: 0,
    pending_reviews: 0,
  });

  useEffect(() => {
    apiFetch("/admin/dashboard")
      .then((result) => {
        console.log("Admin dashboard data:", result.data);
        setDashboardStats({
          total_users: result.data.total_users ?? 0,
          total_reports: result.data.total_reports ?? 0,
          pending_reviews: result.data.pending_reviews ?? 0,
        });
      })
      .catch((error) => console.error("Admin dashboard API error:", error));
  }, []);

  const handleLogout = () => {
    setUserRole(null);
    navigate('/');
  };

  const stats = [
    { label: "Active Users", value: dashboardStats.total_users.toString(), change: "Live", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/20" },
    { label: "AI Reports", value: dashboardStats.total_reports.toString(), change: "MongoDB", icon: FileText, color: "text-green-400", bg: "bg-green-500/20" },
    { label: "Pending Reviews", value: dashboardStats.pending_reviews.toString(), change: "Live", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20" },
  ];

  const weeklyActivityData = [
    { day: 'Mon', activity: 400 },
    { day: 'Tue', activity: 600 },
    { day: 'Wed', activity: 850 },
    { day: 'Thu', activity: 700 },
    { day: 'Fri', activity: 900 },
    { day: 'Sat', activity: 300 },
    { day: 'Sun', activity: 450 },
  ];

  const systemAlerts = [
    { id: 1, type: "warning", message: "Submission spike detected in CS101 module.", time: "10m ago" },
    { id: 2, type: "critical", message: "Multiple flagged activities and logins detected.", time: "1h ago" },
    { id: 3, type: "warning", message: "Low performance average (62%) in recent test.", time: "2h ago" },
  ];

  const aiInsights = [
    { id: 1, insight: "Student engagement drops by 30% on weekends. Consider scheduling automated revision prompts." },
    { id: 2, insight: "Module 'Advanced Physics' takes 40% longer to complete than average. Content may need review." },
  ];

  const reviewQueue = [
    { id: "REV-102", name: "Alex Johnson", assignment: "Data Structures", status: "Pending" },
    { id: "REV-103", name: "Maria Garcia", assignment: "React Fundamentals", status: "Pending" },
    { id: "REV-104", name: "James Smith", assignment: "Machine Learning Concepts", status: "Under Review" },
  ];

  const userManagement = [
    { id: "U-01", name: "John Doe", role: "Student", status: "Active", bg: "bg-green-500/10", text: "text-green-400" },
    { id: "U-02", name: "Jane Smith", role: "Instructor", status: "Active", bg: "bg-green-500/10", text: "text-green-400" },
    { id: "U-03", name: "Bob Lee", role: "Student", status: "Blocked", bg: "bg-red-500/10", text: "text-red-400" },
    { id: "U-04", name: "Alice Cooper", role: "Admin", status: "Active", bg: "bg-green-500/10", text: "text-green-400" },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 pb-12 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="bg-[#1E293B]/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-20">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">Admin Console</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#0F172A]/50 rounded-full border border-slate-700/50">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">System Online</span>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors h-9 bg-transparent hover:border-slate-500">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-[1400px] space-y-6">
        
        {/* 3. Minimal Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="bg-[#1E293B] border-slate-700/50 shadow-lg shadow-slate-900/20 rounded-2xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400 mb-1">{stat.label}</p>
                    <div className="flex items-end gap-3">
                      <h3 className="text-3xl font-bold text-slate-100">{stat.value}</h3>
                      <span className={`text-xs font-semibold mb-1 ${stat.icon === AlertTriangle ? 'text-red-400' : 'text-green-400'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Module Access Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Education", icon: GraduationCap, path: "/admin/education/dashboard", color: "from-teal-500 to-emerald-600" },
            { name: "Loan Dept", icon: IndianRupee, path: "/admin/loan/dashboard", color: "from-indigo-500 to-purple-600" },
            { name: "Hiring",    icon: Briefcase, path: "/admin/hr/dashboard", color: "from-blue-500 to-indigo-600" },
          ].map((m, i) => (
            <motion.div key={m.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 + 0.3 }}
              onClick={() => navigate(m.path)}
              className="bg-[#1E293B] border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-slate-800 transition-all hover:-translate-y-1 group"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                <m.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100">{m.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Admin Portal</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 4. Analytics Section */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Card className="bg-[#1E293B] border-slate-700/50 shadow-lg shadow-slate-900/20 rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-700/30 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                       <Activity className="h-5 w-5 text-indigo-400" /> System Activity
                    </CardTitle>
                    <Badge variant="secondary" className="bg-[#0F172A] text-slate-400 hover:bg-[#0F172A] border border-slate-700/50">Weekly</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="day" tick={{fill: '#94A3B8', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{fill: '#94A3B8', fontSize: 12}} axisLine={false} tickLine={false} dx={-10} />
                      <RechartsTooltip 
                        contentStyle={{backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#F1F5F9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)'}} 
                        itemStyle={{color: '#818CF8'}}
                      />
                      <Area type="monotone" dataKey="activity" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* 6. User Management Table */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-[#1E293B] border-slate-700/50 shadow-lg shadow-slate-900/20 rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-700/30 pb-4">
                  <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                     <Users className="h-5 w-5 text-slate-400" /> User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                      <thead className="bg-[#0F172A]/50 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-700/50">
                        <tr>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 font-medium">
                        {userManagement.map((user) => (
                          <tr key={user.id} className="hover:bg-[#0F172A]/30 transition-colors">
                            <td className="px-6 py-4 text-slate-200">{user.name}</td>
                            <td className="px-6 py-4 text-slate-400">{user.role}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${user.bg} ${user.text}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" className="h-8 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">
                                Manage
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Side Right Column */}
          <div className="space-y-6">
            
            {/* 1. System Alerts Panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-[#1E293B] border-red-500/20 shadow-lg shadow-slate-900/20 rounded-2xl ring-1 ring-red-500/10">
                <CardHeader className="border-b border-red-500/10 pb-4 bg-red-500/5 rounded-t-2xl">
                  <CardTitle className="text-lg text-red-500 flex items-center gap-2">
                     <Bell className="h-5 w-5" /> System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-xl border flex items-start gap-3 ${
                      alert.type === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-orange-500/10 border-orange-500/20 text-orange-300'
                    }`}>
                      <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${alert.type === 'critical' ? 'text-red-400' : 'text-orange-400'}`} />
                      <div className="space-y-1">
                         <p className="text-sm font-semibold leading-snug">{alert.message}</p>
                         <p className={`text-xs font-medium ${alert.type === 'critical' ? 'text-red-500/70' : 'text-orange-500/70'}`}>{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* 2. AI Insights Section */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-[#1E293B] border-indigo-500/20 shadow-lg shadow-slate-900/20 rounded-2xl">
                <CardHeader className="border-b border-indigo-500/10 pb-4 bg-indigo-500/5 rounded-t-2xl">
                  <CardTitle className="text-lg text-indigo-400 flex items-center gap-2">
                     <Lightbulb className="h-5 w-5" /> AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  {aiInsights.map((item) => (
                    <div key={item.id} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20"></div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                         {item.insight}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* 5. Submission Review Queue */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-[#1E293B] border-slate-700/50 shadow-lg shadow-slate-900/20 rounded-2xl">
                <CardHeader className="border-b border-slate-700/30 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                     <FileText className="h-5 w-5 text-slate-400" /> Review Queue
                  </CardTitle>
                  <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full ring-1 ring-indigo-500/30">{reviewQueue.length} NEW</span>
                </CardHeader>
                <CardContent className="pt-0 p-0 divide-y divide-slate-700/50">
                  {reviewQueue.map((item) => (
                    <div key={item.id} className="p-5 hover:bg-[#0F172A]/30 transition-colors">
                      <p className="text-sm font-semibold text-slate-200 mb-1">{item.assignment}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-slate-400">{item.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <Button className="w-full h-9 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-900/20">
                        Review Now
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
