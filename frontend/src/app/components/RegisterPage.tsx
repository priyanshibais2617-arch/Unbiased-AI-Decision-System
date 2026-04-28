import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, User, Mail, Lock, ShieldCheck, Briefcase, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { HomePage } from "./HomePage";
import { useUser } from "./UserContext";
import { toast } from "sonner";
import { apiFetch } from "../api";

type RegisterRole = "student" | "loan_applicant" | "job_seeker" | "document_verification";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setUserRole } = useUser();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as RegisterRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('userFullName', formData.fullName);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userRole', 'user');
      localStorage.removeItem('selectedFeature');
      setUserRole("user");
      toast.success("Account registered successfully!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden">
      {/* Background (HomePage styling) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <HomePage />
      </div>

      {/* Blur Overlay */}
      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[12px] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 sm:top-6 sm:left-6 gap-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm font-medium rounded-full px-4 py-2 transition-all z-20"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Home</span>
        </Button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-xl my-8 z-20"
        >
          <Card className="border-0 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500" />
            <CardContent className="p-6 sm:p-10">
              
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
                <p className="text-slate-500">Join the Unbiased AI platform today.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input 
                        type="text" 
                        name="fullName"
                        required
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input 
                        type="email" 
                        name="email"
                        required
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        required
                        placeholder="********"
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword"
                        required
                        placeholder="********"
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl rounded-lg py-6 mt-4 transition-all" 
                  size="lg"
                >
                  {isLoading ? "Creating Account..." : "Register Now"}
                </Button>
                
                <p className="text-center text-sm text-slate-600 pt-4">
                  Already have an account?{" "}
                  <button type="button" onClick={() => navigate('/login')} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Sign in
                  </button>
                </p>

              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
