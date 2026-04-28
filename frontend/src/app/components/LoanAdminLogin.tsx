import { Coins } from "lucide-react";
import { AdminLoginBase } from "./AdminLoginBase";

export function LoanAdminLogin() {
  return (
    <AdminLoginBase
      title="Loan Department Login"
      icon={Coins}
      gradient="from-indigo-500 to-purple-600"
      redirectPath="/admin/loan/dashboard"
      registerPath="/admin/loan/register"
    />
  );
}
