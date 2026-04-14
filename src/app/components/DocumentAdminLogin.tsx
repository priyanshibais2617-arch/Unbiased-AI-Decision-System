import { FileCheck } from "lucide-react";
import { AdminLoginBase } from "./AdminLoginBase";

export function DocumentAdminLogin() {
  return (
    <AdminLoginBase 
      title="Verification Admin Login" 
      icon={FileCheck} 
      gradient="from-green-500 to-green-700" 
    />
  );
}
