import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, LogIn, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useUser } from "./UserContext";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { HomePage } from "./HomePage";
import { API_BASE_URL, apiFetch } from "../api";

interface AdminLoginProps {
  title: string;
  icon: React.ElementType;
  gradient: string;
  redirectPath?: string;
  registerPath?: string;
}

export function AdminLoginBase({
  title,
  icon: Icon,
  gradient,
  redirectPath = "/admin/dashboard",
  registerPath,
}: AdminLoginProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserRole } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await apiFetch("/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("userEmail", result.data.email);
      localStorage.setItem("userRole", "admin");
      setUserRole("admin");
      navigate(redirectPath);
    } catch (error) {
      console.error("Admin login failed:", error);
      alert(error instanceof Error ? error.message : "Admin login failed. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    const params = new URLSearchParams({ role: "admin", redirect_path: redirectPath });
    window.location.href = `${API_BASE_URL}/auth/google/start?${params.toString()}`;
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        isAdmin={true}
      />

      {/* Homepage background, blurred and non-interactive */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
        initial={{ scale: 1.0 }}
        animate={{ scale: 1.06 }}
        transition={{ duration: 8, ease: "easeOut" }}
        style={{
          filter: "blur(6px) brightness(0.88) saturate(0.9)",
          transformOrigin: "center center",
        }}
      >
        <HomePage />
      </motion.div>

      {/* Subtle dark overlay for card readability */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.18) 0%, rgba(15,23,42,0.15) 50%, rgba(0,0,0,0.22) 100%)",
        }}
      />

      {/* Accent colour tint */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none bg-gradient-to-br ${gradient} opacity-10`}
      />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 z-30 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white/85 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm transition-all duration-200 shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Centered login card */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Card
            className="border border-white/20 shadow-[0_32px_80px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden relative"
            style={{
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
            }}
          >
            {/* Module-colour top accent bar */}
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${gradient}`} />

            <CardContent className="p-8 sm:p-10">

              {/* Icon + module label */}
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.4, ease: "backOut" }}
                  className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${gradient} mb-3 shadow-lg`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </motion.div>
                <span
                  className={`text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}
                >
                  {title}
                </span>
              </div>

              {/* Heading */}
              <div className="mb-7 text-center">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-gray-500 text-sm font-medium">
                  Sign in to access the admin panel.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="admin@system.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-sm font-medium outline-none"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      placeholder="********"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-sm font-medium outline-none"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sign In */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md gap-2 rounded-xl h-12 font-bold tracking-wide"
                >
                  <LogIn className="h-5 w-5" /> Sign In
                </Button>

                {/* Divider */}
                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-400 font-semibold rounded-full">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full gap-2.5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl h-12 shadow-sm"
                  onClick={handleGoogleLogin}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>

                <p className="text-center text-sm text-gray-500 pt-1 font-medium">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(registerPath || `/register?mode=admin&returnPath=${location.pathname}`)
                    }
                    className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Register now
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
