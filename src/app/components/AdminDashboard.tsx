import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BarChart3, Users, Shield, TrendingUp, LogOut, Activity, CheckCircle, XCircle, AlertTriangle, GraduationCap } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUser } from "./UserContext";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { setUserRole } = useUser();

  const handleLogout = () => {
    setUserRole(null);
    navigate('/');
  };

  const stats = [
    { label: "Total Applications", value: "1,234", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Approved Rates", value: "72.5%", change: "+4.2%", icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { label: "Bias Triggers", value: "3", change: "-1", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Under Review", value: "144", change: "+5%", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-100" },
  ];

  const modelPerformanceData = [
    { month: 'Jan', approvalRate: 65, volume: 1200 },
    { month: 'Feb', approvalRate: 68, volume: 1400 },
    { month: 'Mar', approvalRate: 64, volume: 1100 },
    { month: 'Apr', approvalRate: 72, volume: 1600 },
    { month: 'May', approvalRate: 70, volume: 1550 },
    { month: 'Jun', approvalRate: 75, volume: 1800 },
  ];

  const biasMetrics = [
    { factor: 'Gender', deviation: 1.2, status: 'No bias detected', confidence: 98, hasBias: false },
    { factor: 'Location (Zip)', deviation: 0.8, status: 'No bias detected', confidence: 99, hasBias: false },
    { factor: 'Age Groups', deviation: 4.5, status: 'Possible bias found', confidence: 85, hasBias: true },
  ];

  const recentDecisions = [
    { id: 1, type: "Job Application", module: "Hiring", decision: "Selected", score: 92, time: "5 min ago" },
    { id: 2, type: "Loan Request", module: "Finance", decision: "Approved", score: 88, time: "12 min ago" },
    { id: 3, type: "Medical Report", module: "Healthcare", decision: "Referred", score: 75, time: "23 min ago" },
    { id: 4, type: "Document Verification", module: "Verification", decision: "Authentic", score: 98, time: "35 min ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 font-medium">System analytics and performance monitoring</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 rounded-xl">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm ring-1 ring-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-black tracking-tight text-gray-900 mb-2">{stat.value}</h3>
                      <Badge variant={stat.change.startsWith('+') ? "default" : "secondary"} className={`text-xs ${stat.change.startsWith('-') && stat.icon === AlertTriangle ? 'bg-green-100 text-green-700' : ''}`}>
                        {stat.change} from last month
                      </Badge>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Analytics Main View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
          {/* Model Performance */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full border-0 shadow-sm ring-1 ring-gray-100">
              <CardHeader className="border-b border-gray-50 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Model Performance (Approval Rates)
                </CardTitle>
                <CardDescription>
                  Tracking macro AI decisions over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={modelPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} domain={[50, 100]} />
                      <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Area type="monotone" dataKey="approvalRate" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" name="Approval Rate (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bias Detection System */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full border-0 shadow-sm ring-1 ring-gray-100">
              <CardHeader className="border-b border-gray-50 pb-4 bg-gray-50/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  Bias Detection System
                </CardTitle>
                <CardDescription>
                  Real-time fair lending and model neutrality assessment limits
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {biasMetrics.map((metric, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${metric.hasBias ? 'bg-orange-50/50 border-orange-200' : 'bg-green-50/50 border-green-200'}`}>
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <h4 className="font-bold text-gray-900">{metric.factor}</h4>
                           <p className={`text-sm tracking-tight font-medium mt-0.5 ${metric.hasBias ? 'text-orange-700' : 'text-green-700'} flex items-center gap-1.5`}>
                              {metric.hasBias ? <AlertTriangle className="h-4 w-4"/> : <CheckCircle className="h-4 w-4"/>}
                              {metric.status}
                           </p>
                        </div>
                        <Badge variant="outline" className={`bg-white shadow-sm px-2.5 py-0.5 ${metric.hasBias ? 'text-orange-700 border-orange-200' : 'text-green-700 border-green-200'}`}>
                           {metric.confidence}% Confidence
                        </Badge>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">Deviation</span>
                        <div className="flex-1 bg-white rounded-full h-2 overflow-hidden shadow-inner border border-gray-100">
                          <div className={`h-full rounded-full ${metric.hasBias ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, metric.deviation * 15)}%` }} />
                        </div>
                        <span className="text-sm font-black tracking-tight text-gray-700 w-12 text-right">{metric.deviation}%</span>
                     </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Education Specific Analytics */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-100">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-teal-600" />
              Education Module Analytics
            </CardTitle>
            <CardDescription>
              View student performance trends, AI grading accuracy, and module-specific bias reports
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-5 bg-teal-50 rounded-xl border border-teal-100">
                <p className="text-sm font-semibold text-teal-800 mb-1">Avg Student Performance</p>
                <h4 className="text-3xl font-black text-teal-900">76.4%</h4>
                <p className="text-xs font-medium text-teal-700 mt-2">+2.4% this semester</p>
             </div>
             <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-sm font-semibold text-purple-800 mb-1">AI Grading Accuracy</p>
                <h4 className="text-3xl font-black text-purple-900">98.2%</h4>
                <p className="text-xs font-medium text-purple-700 mt-2">Verified against human evaluation</p>
             </div>
             <div className="p-5 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-sm font-semibold text-orange-800 mb-1">Bias Triggers (Edu)</p>
                <h4 className="text-3xl font-black text-orange-900">0</h4>
                <p className="text-xs font-medium text-orange-700 mt-2">100% Blind Grading Active</p>
             </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-gray-100">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-500" />
                Recent AI Decisions Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
               <div className="divide-y divide-gray-100">
                {recentDecisions.map((decision) => (
                  <div key={decision.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-gray-900">{decision.type}</p>
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">{decision.module}</Badge>
                      </div>
                      <p className="text-xs font-medium tracking-tight text-gray-500">{decision.time}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <p className="text-xs font-bold text-gray-500 uppercase">Score: <span className="text-gray-900 text-sm ml-1">{decision.score}%</span></p>
                      <Badge className={
                            decision.decision === "Selected" || decision.decision === "Approved" || decision.decision === "Authentic"
                              ? "bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-0"
                              : decision.decision === "Rejected"
                              ? "bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-0"
                              : "bg-blue-100 text-blue-700 shadow-none border-0"
                          }
                      >
                        {decision.decision}
                      </Badge>
                    </div>
                  </div>
                ))}
               </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-100/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Shield className="h-5 w-5" />
                  Privacy & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-indigo-800 leading-relaxed font-medium">
                  System administrators can view macro-level performance metrics but cannot access PII (Personally Identifiable Information). All applicant identity columns are stripped in these dashboards to preserve blind evaluation standards.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-indigo-100">Live Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-800/50">
                    <span className="text-sm font-medium">Core AI Engine</span>
                    <Badge className="bg-green-400/20 text-green-400 hover:bg-green-400/30 border-0">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-800/50">
                    <span className="text-sm font-medium">Document OCR Module</span>
                    <Badge className="bg-green-400/20 text-green-400 hover:bg-green-400/30 border-0">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bias Alerting Monitor</span>
                    <Badge className="bg-green-400/20 text-green-400 hover:bg-green-400/30 border-0">Running</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
