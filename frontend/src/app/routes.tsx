import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const LoginPage = lazy(() => import("./components/LoginPage").then((module) => ({ default: module.LoginPage })));
const GoogleAuthCallback = lazy(() => import("./components/GoogleAuthCallback").then((module) => ({ default: module.GoogleAuthCallback })));
const RegisterPage = lazy(() => import("./components/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const HomePage = lazy(() => import("./components/HomePage").then((module) => ({ default: module.HomePage })));
const AboutPage = lazy(() => import("./components/AboutPage").then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import("./components/ContactPage").then((module) => ({ default: module.ContactPage })));
const AIFairnessPage = lazy(() => import("./components/AIFairnessPage").then((module) => ({ default: module.AIFairnessPage })));
const BiasReportsPage = lazy(() => import("./components/BiasReportsPage").then((module) => ({ default: module.BiasReportsPage })));
const PrivacySecurityPage = lazy(() => import("./components/PrivacySecurityPage").then((module) => ({ default: module.PrivacySecurityPage })));
const CompliancePage = lazy(() => import("./components/CompliancePage").then((module) => ({ default: module.CompliancePage })));
const UserDashboard = lazy(() => import("./components/UserDashboard").then((module) => ({ default: module.UserDashboard })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then((module) => ({ default: module.AdminDashboard })));
const JobHiring = lazy(() => import("./components/JobHiring").then((module) => ({ default: module.JobHiring })));
const LoanApproval = lazy(() => import("./components/LoanApproval").then((module) => ({ default: module.LoanApproval })));
const DocumentVerification = lazy(() => import("./components/DocumentVerification").then((module) => ({ default: module.DocumentVerification })));
const EducationSystem = lazy(() => import("./components/EducationSystem").then((module) => ({ default: module.EducationSystem })));
const NotFound = lazy(() => import("./components/NotFound").then((module) => ({ default: module.NotFound })));
const EducationAdminLogin = lazy(() => import("./components/EducationAdminLogin").then((module) => ({ default: module.EducationAdminLogin })));
const EducationAdminRegisterPage = lazy(() => import("./components/EducationAdminRegisterPage").then((module) => ({ default: module.EducationAdminRegisterPage })));
const LoanAdminLogin = lazy(() => import("./components/LoanAdminLogin").then((module) => ({ default: module.LoanAdminLogin })));
const LoanAdminRegisterPage = lazy(() => import("./components/LoanAdminRegisterPage").then((module) => ({ default: module.LoanAdminRegisterPage })));
const JobAdminLogin = lazy(() => import("./components/JobAdminLogin").then((module) => ({ default: module.JobAdminLogin })));
const JobAdminRegisterPage = lazy(() => import("./components/JobAdminRegisterPage").then((module) => ({ default: module.JobAdminRegisterPage })));
const DocumentAdminLogin = lazy(() => import("./components/DocumentAdminLogin").then((module) => ({ default: module.DocumentAdminLogin })));
const DocumentAdminRegisterPage = lazy(() => import("./components/DocumentAdminRegisterPage").then((module) => ({ default: module.DocumentAdminRegisterPage })));
const EducationAdminDashboard = lazy(() => import("./components/EducationAdminDashboard").then((module) => ({ default: module.EducationAdminDashboard })));
const LoanAdminDashboard = lazy(() => import("./components/LoanAdminDashboard").then((module) => ({ default: module.LoanAdminDashboard })));
const JobAdminDashboard = lazy(() => import("./components/JobAdminDashboard").then((module) => ({ default: module.JobAdminDashboard })));
const DocumentAdminDashboard = lazy(() => import("./components/DocumentAdminDashboard").then((module) => ({ default: module.DocumentAdminDashboard })));
const ProfileCompletionPage = lazy(() => import("./components/ProfileCompletionPage").then((module) => ({ default: module.ProfileCompletionPage })));
const GeneralSettingsPage = lazy(() => import("./components/GeneralSettingsPage").then((module) => ({ default: module.GeneralSettingsPage })));
const PreferencesPage = lazy(() => import("./components/PreferencesPage").then((module) => ({ default: module.PreferencesPage })));

function Page(component: ReactNode) {
  return <Suspense fallback={null}>{component}</Suspense>;
}

function ProtectedPage(component: ReactNode, requiredRole?: "user" | "admin") {
  return Page(<ProtectedRoute requiredRole={requiredRole}>{component}</ProtectedRoute>);
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, element: Page(<HomePage />) },
      { path: "about", element: Page(<AboutPage />) },
      { path: "contact", element: Page(<ContactPage />) },
      { path: "ai-fairness", element: Page(<AIFairnessPage />) },
      { path: "bias-reports", element: ProtectedPage(<BiasReportsPage />) },
      { path: "privacy-security", element: Page(<PrivacySecurityPage />) },
      { path: "compliance", element: Page(<CompliancePage />) },
      { path: "login", element: Page(<LoginPage />) },
      { path: "auth/google/callback", element: Page(<GoogleAuthCallback />) },
      { path: "register", element: Page(<RegisterPage />) },
      { path: "complete-profile", element: ProtectedPage(<ProfileCompletionPage />, "user") },
      { path: "admin/education", element: Page(<EducationAdminLogin />) },
      { path: "admin/education/register", element: Page(<EducationAdminRegisterPage />) },
      { path: "admin/loan", element: Page(<LoanAdminLogin />) },
      { path: "admin/loan/register", element: Page(<LoanAdminRegisterPage />) },
      { path: "admin/hr", element: Page(<JobAdminLogin />) },
      { path: "admin/hr/register", element: Page(<JobAdminRegisterPage />) },
      { path: "admin/document", element: Page(<DocumentAdminLogin />) },
      { path: "admin/document/register", element: Page(<DocumentAdminRegisterPage />) },
      { path: "dashboard", element: ProtectedPage(<UserDashboard />, "user") },
      { path: "admin/dashboard", element: ProtectedPage(<AdminDashboard />, "admin") },
      { path: "admin/education/dashboard", element: ProtectedPage(<EducationAdminDashboard />, "admin") },
      { path: "admin/loan/dashboard", element: ProtectedPage(<LoanAdminDashboard />, "admin") },
      { path: "admin/hr/dashboard", element: ProtectedPage(<JobAdminDashboard />, "admin") },
      { path: "admin/document/dashboard", element: ProtectedPage(<DocumentAdminDashboard />, "admin") },
      { path: "job-hiring", element: ProtectedPage(<JobHiring />, "user") },
      { path: "loan-approval", element: ProtectedPage(<LoanApproval />, "user") },
      { path: "document-verification", element: ProtectedPage(<DocumentVerification />, "user") },
      { path: "education-system", element: ProtectedPage(<EducationSystem />, "user") },
      { path: "settings", element: ProtectedPage(<GeneralSettingsPage />) },
      { path: "preferences", element: ProtectedPage(<PreferencesPage />) },
      { path: "*", element: Page(<NotFound />) },
    ],
  },
]);
