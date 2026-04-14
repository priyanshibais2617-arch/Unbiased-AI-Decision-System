import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, LogIn, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useUser } from "./UserContext";
import { HomePage } from "./HomePage";

interface AdminLoginProps {
  title: string;
  icon: React.ElementType;
  gradient: string;
  redirectPath?: string;
}

export function AdminLoginBase({ title, icon: Icon, gradient, redirectPath = '/admin/dashboard' }: AdminLoginProps) {
  const navigate = useNavigate();
  const { setUserRole } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setUserRole('admin');
      navigate(redirectPath);
    }
  };

  const handleGoogleLogin = () => {
    setUserRole('admin');
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden">
      {/* Background (HomePage) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <HomePage />
      </div>
      
      {/* Blur Overlay & Modal Container */}
      <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[10px] flex items-center justify-center p-4">
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="absolute top-6 left-6 gap-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm font-medium rounded-full px-4 py-2 transition-all z-20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        {/* Centered Login Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md mt-16 sm:mt-0"
        >
          <Card className="border-0 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${gradient}`} />
            <CardContent className="p-8 sm:p-10">

              <div className="flex flex-col items-center justify-center mb-6">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-3 shadow-md`}>
                   <Icon className="h-6 w-6 text-white" />
                </div>
                <div className={`text-sm font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
                   {title}
                </div>
              </div>

              <div className="mb-6 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-500 text-sm sm:text-base">Please enter your details to sign in.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input 
                      type="email" 
                      required
                      placeholder="admin@system.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md gap-2 rounded-lg py-6" size="lg">
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 cursor-default rounded-full">Or continue with</span>
                  </div>
                </div>

                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full gap-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg py-6" 
                  size="lg"
                  onClick={handleGoogleLogin}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <p className="text-center text-sm text-gray-600 pt-4">
                  Don't have an account?{" "}
                  <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Register now
                  </a>
                </p>

              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
