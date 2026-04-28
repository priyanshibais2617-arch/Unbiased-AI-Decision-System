import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { toast } from "sonner";
import { apiFetch } from "../api";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "user" | "admin";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    apiFetch("/auth/me")
      .then((response) => {
        setRole(response.data.role);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", response.data.role);
        localStorage.setItem("userEmail", response.data.email);
        if (response.data.full_name) {
          localStorage.setItem("userFullName", response.data.full_name);
        }
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  const featureMap: Record<string, string> = {
    "/job-hiring": "job",
    "/loan-approval": "loan",
    "/education-system": "education",
    "/document-verification": "document"
  };

  const featureKey = featureMap[location.pathname];
  if (featureKey) {
    const profileData = localStorage.getItem(`userProfile_${featureKey}`);
    if (!profileData) {
      setTimeout(() => {
        toast.error("Please complete your profile for this service first.", { duration: 4000 });
      }, 100);
      localStorage.setItem("selectedFeature", featureKey);
      return <Navigate to="/complete-profile" replace />;
    }
  }

  return <>{children}</>;
}
