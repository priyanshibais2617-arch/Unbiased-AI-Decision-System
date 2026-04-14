import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Briefcase, Building2, FileCheck, LogOut, Bell, User, GraduationCap, ShieldCheck, FileText, Activity, Clock, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useUser } from "./UserContext";

export function UserDashboard() {
  const navigate = useNavigate();
  const { setUserRole } = useUser();

  const handleLogout = () => {
    setUserRole(null);
    navigate('/');
  };

  const modules = [
    {
      title: "Job Hiring",
      description: "Upload your resume for AI-powered analysis and get smart job recommendations",
      icon: Briefcase,
      color: "from-blue-500 to-indigo-600",
      path: "/job-hiring",
    },
    {
      title: "Advanced Loan System",
      description: "Submit financial documents for fair, interactive, and unbiased loan assessment",
      icon: Building2,
      color: "from-purple-500 to-pink-600",
      path: "/loan-approval",
    },
    {
      title: "Education System",
      description: "AI-powered unbiased student evaluation, smart learning recommendations.",
      icon: GraduationCap,
      color: "from-teal-500 to-emerald-600",
      path: "/education-system",
    },
    {
      title: "Document Verification",
      description: "Verify authenticity of certificates, salary slips, and medical reports",
      icon: FileCheck,
      color: "from-green-500 to-lime-600",
      path: "/document-verification",
    },
  ];

  const recentActivity = [
    { id: 1, type: "Job Application", status: "Under Review", date: "2 hours ago" },
    { id: 2, type: "Assignment Evaluated", status: "Completed", date: "5 hours ago" },
    { id: 3, type: "Document Verified", status: "Authentic", date: "1 day ago" },
    { id: 4, type: "Education Report Generated", status: "Pending", date: "3 days ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">User Dashboard</h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Welcome back! Manage your applications and track progress</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="relative rounded-xl hidden md:flex border-gray-200">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                  3
                </span>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2 rounded-xl">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          
          {/* Main Content (70%) */}
          <div className="lg:col-span-7 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-5 tracking-tight px-1">Available Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
              {modules.map((module, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card 
                    className="cursor-pointer shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-gray-100 hover:border-indigo-200 group h-full rounded-2xl flex flex-col"
                    onClick={() => navigate(module.path)}
                  >
                    <CardContent className="p-5 flex-grow flex flex-col items-start text-left">
                      <div className={`p-3 bg-gradient-to-br ${module.color} rounded-xl mb-4 shadow-sm group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300`}>
                        <module.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight group-hover:text-indigo-700 transition-colors">{module.title}</h3>
                      <p className="text-sm font-medium text-gray-500 leading-relaxed flex-grow">{module.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Privacy Info (Full Width) */}
              <div className="md:col-span-2 mt-2">
                <Card className="border-emerald-200 bg-emerald-50 shadow-sm rounded-2xl hover:shadow-lg transition-all duration-300 h-full w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-emerald-900 text-base">
                      <FileCheck className="h-5 w-5" />
                      Privacy Protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-emerald-800/80 leading-relaxed">
                      🔒 Your sensitive data is encrypted and completely walled off from human system admins. All AI processing evaluates your profile anonymously ensuring 100% fair and blind decisions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar (30%) */}
          <div className="lg:col-span-3 space-y-5 flex flex-col h-full mt-2 lg:mt-0">
            <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <CardHeader className="pb-4 border-b border-gray-50 bg-gray-50/50">
                <CardTitle className="text-lg font-bold text-gray-900">Recent Activity</CardTitle>
                <CardDescription>Your latest submissions and results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 px-4 pb-4">
                {recentActivity.map((activity) => {
                  let Icon = FileText;
                  let iconColor = "text-gray-700";
                  
                  if (activity.type.includes("Job")) {
                    Icon = Briefcase; iconColor = "text-blue-600";
                  } else if (activity.type.includes("Assignment")) {
                    Icon = FileText; iconColor = "text-purple-600";
                  } else if (activity.type.includes("Document")) {
                    Icon = ShieldCheck; iconColor = "text-green-600";
                  } else if (activity.type.includes("Education")) {
                    Icon = GraduationCap; iconColor = "text-teal-600";
                  }

                  let badgeClasses = "";
                  if (activity.status === "Authentic" || activity.status === "Completed") {
                    badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  } else if (activity.status === "Pending" && activity.type.includes("Education")) {
                    badgeClasses = "bg-blue-50 text-blue-700 border-blue-200";
                  } else if (activity.status === "Under Review" || activity.status === "Pending") {
                    badgeClasses = "bg-amber-50 text-amber-700 border-amber-200";
                  } else {
                    badgeClasses = "bg-gray-50 text-gray-700 border-gray-200";
                  }

                  return (
                    <motion.div 
                      key={activity.id} 
                      className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-sm hover:border-indigo-100 cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center">
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-[13px]">{activity.type}</p>
                          <p className="text-[11px] font-medium text-gray-500 mt-0.5">{activity.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${badgeClasses}`}>
                        {activity.status}
                      </Badge>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-0 shadow-sm rounded-2xl hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-indigo-100">AI Help Center</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-indigo-100 mb-4 font-medium leading-relaxed">
                  Confused about a recent rejection? Need advice on application formatting? Consult our built-in Smart Assistant anytime.
                </p>
                <Button variant="secondary" className="w-full text-indigo-900 font-bold bg-white hover:bg-indigo-50 border-0 rounded-xl shadow-sm">
                  Open Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
