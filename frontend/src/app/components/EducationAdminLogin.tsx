import { GraduationCap } from "lucide-react";
import { AdminLoginBase } from "./AdminLoginBase";

export function EducationAdminLogin() {
  return (
    <AdminLoginBase
      title="Education Admin Login"
      icon={GraduationCap}
      gradient="from-teal-500 to-teal-700"
      redirectPath="/admin/education/dashboard"
      registerPath="/admin/education/register"
    />
  );
}
