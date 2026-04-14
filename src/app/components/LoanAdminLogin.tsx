import { Coins } from "lucide-react";
import { AdminLoginBase } from "./AdminLoginBase";

export function LoanAdminLogin() {
  return (
    <AdminLoginBase 
      title="Loan Department Login" 
      icon={Coins} 
      gradient="from-purple-500 to-purple-700" 
      redirectPath="/admin/loan/dashboard"
    />
  );
}
