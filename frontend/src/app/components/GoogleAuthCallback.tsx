import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2 } from "lucide-react";
import { useUser } from "./UserContext";

export function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserRole } = useUser();
  const [message, setMessage] = useState("Completing Google sign-in...");

  useEffect(() => {
    const error = searchParams.get("error");
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const role = searchParams.get("role") === "admin" ? "admin" : "user";
    const name = searchParams.get("name");
    const redirectPath = searchParams.get("redirect") || (role === "admin" ? "/admin/dashboard" : "/dashboard");

    if (error || !token || !email) {
      setMessage("Google sign-in failed. Please try again.");
      window.setTimeout(() => navigate(role === "admin" ? "/admin/hr" : "/login", { replace: true }), 1400);
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("token", token);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);
    if (name) {
      localStorage.setItem("userFullName", name);
    }
    setUserRole(role);
    navigate(redirectPath, { replace: true });
  }, [navigate, searchParams, setUserRole]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-5 py-4 shadow-2xl">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-semibold">{message}</span>
      </div>
    </div>
  );
}
