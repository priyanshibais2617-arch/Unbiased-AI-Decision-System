import { Briefcase } from "lucide-react";
import { AdminLoginBase } from "./AdminLoginBase";

export function JobAdminLogin() {
  return (
    <AdminLoginBase
      title="HR Admin Login"
      icon={Briefcase}
      gradient="from-blue-500 to-indigo-600"
      redirectPath="/admin/hr/dashboard"
      registerPath="/admin/hr/register"
    />
  );
}
