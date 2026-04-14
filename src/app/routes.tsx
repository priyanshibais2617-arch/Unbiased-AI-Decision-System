import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { LoginPage } from "./components/LoginPage";
import { HomePage } from "./components/HomePage";
import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { JobHiring } from "./components/JobHiring";
import { LoanApproval } from "./components/LoanApproval";
import { DocumentVerification } from "./components/DocumentVerification";
import { EducationSystem } from "./components/EducationSystem";
import { NotFound } from "./components/NotFound";
import { EducationAdminLogin } from "./components/EducationAdminLogin";
import { LoanAdminLogin } from "./components/LoanAdminLogin";
import { JobAdminLogin } from "./components/JobAdminLogin";
import { DocumentAdminLogin } from "./components/DocumentAdminLogin";
import { EducationAdminDashboard } from "./components/EducationAdminDashboard";
import { LoanAdminDashboard } from "./components/LoanAdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "login", Component: LoginPage },
      { path: "dashboard", Component: UserDashboard },
      { path: "admin/dashboard", Component: AdminDashboard },
      { path: "admin/education/dashboard", Component: EducationAdminDashboard },
      { path: "admin/education", Component: EducationAdminLogin },
      { path: "admin/loan/dashboard", Component: LoanAdminDashboard },
      { path: "admin/loan", Component: LoanAdminLogin },
      { path: "admin/hr", Component: JobAdminLogin },
      { path: "admin/document", Component: DocumentAdminLogin },
      { path: "job-hiring", Component: JobHiring },
      { path: "loan-approval", Component: LoanApproval },
      { path: "document-verification", Component: DocumentVerification },
      { path: "education-system", Component: EducationSystem },
      { path: "*", Component: NotFound },
    ],
  },
]);
