import { useState } from "react";
import { X, Mail, ShieldCheck, Key, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export function ForgotPasswordModal({ isOpen, onClose, isAdmin = false }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  // Passwords
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  
  // Visibility Toggles
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    // Simulate backend sending OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      toast.success("OTP sent! (Demo Mode: Use 1234)");
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "1234") {
      toast.error("Invalid OTP code.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      toast.success("Email verified successfully.");
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Password reset successful!");
      handleClose();
    }, 1200);
  };

  const handleClose = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setAdminCode("");
    setShowNew(false);
    setShowConfirm(false);
    setShowAdminCode(false);
    onClose();
  };

  const getStrength = (pw: string) => {
    if (pw.length === 0) return { label: "", color: "bg-transparent", bar: "bg-transparent" };
    if (pw.length < 8) return { label: "Weak", color: "text-rose-500", bar: "bg-rose-500 w-1/3" };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return { label: "Strong", color: "text-green-500", bar: "bg-green-500 w-full" };
    return { label: "Medium", color: "text-amber-500", bar: "bg-amber-500 w-2/3" };
  };

  const strength = getStrength(newPassword);
  
  // Validations
  const isPasswordStrong = newPassword.length >= 8;
  const isConfirmMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isAdminCodeValid = adminCode.trim().length > 0;

  const isFormValid = isAdmin 
    ? isPasswordStrong && isConfirmMatch && isAdminCodeValid
    : isPasswordStrong;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              {step === 1 && <Mail className="h-6 w-6" />}
              {step === 2 && <ShieldCheck className="h-6 w-6" />}
              {step === 3 && <Key className="h-6 w-6" />}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {step === 1 && "Reset Password"}
              {step === 2 && "Enter OTP"}
              {step === 3 && "Create Password"}
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              {step === 1 && "Enter your registered email address and we'll send you a secure OTP to reset your password."}
              {step === 2 && `We've sent a secure 6-digit code to ${email}`}
              {step === 3 && (isAdmin ? "Please create a new password and enter your master admin code." : "Please create a new, strong password for your account.")}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4 animate-in slide-in-from-right-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  autoFocus
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6">
                {isLoading ? "Sending..." : "Send Reset Code"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in slide-in-from-right-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">6-Digit OTP</label>
                <input 
                  type="text" 
                  autoFocus
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center tracking-[0.5em] font-bold text-lg focus:border-blue-500 transition-colors"
                  placeholder="••••••"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6">
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-in slide-in-from-right-4">
              
              <div className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNew ? "text" : "password"} 
                      autoFocus
                      className={`w-full pl-4 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${newPassword.length > 0 && !isPasswordStrong ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}`}
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {/* Strength Indicator */}
                  {newPassword.length > 0 && (
                    <div className="mt-2">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-medium text-slate-500 uppercase">Password strength</span>
                          <span className={`text-xs font-bold ${strength.color}`}>{strength.label}</span>
                       </div>
                       <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${strength.bar} transition-all duration-300`} />
                       </div>
                    </div>
                  )}
                  {newPassword.length > 0 && !isPasswordStrong && (
                    <p className="text-xs text-rose-500 mt-1.5">Password must be at least 8 characters.</p>
                  )}
                </div>

                {isAdmin && (
                  <>
                    {/* Confirm Password */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <input 
                          type={showConfirm ? "text" : "password"} 
                          className={`w-full pl-4 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${confirmPassword.length > 0 && !isConfirmMatch ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}`}
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && !isConfirmMatch && (
                        <p className="text-xs text-rose-500 mt-1.5">Passwords do not match.</p>
                      )}
                    </div>

                    {/* Admin Security Code */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1.5">Admin Security Code</label>
                      <div className="relative">
                        <input 
                          type={showAdminCode ? "text" : "password"} 
                          className="w-full pl-4 pr-12 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                          placeholder="Enter Master Password"
                          value={adminCode}
                          onChange={(e) => setAdminCode(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminCode(!showAdminCode)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showAdminCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {adminCode.length > 0 && !isAdminCodeValid && (
                        <p className="text-xs text-rose-500 mt-1.5">Security Code is required.</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !isFormValid} 
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white py-6 mt-2 transition-colors"
              >
                {isLoading ? "Saving..." : "Update Password"}
                {!isLoading && isFormValid && <CheckCircle2 className="ml-2 h-4 w-4 text-green-400" />}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
