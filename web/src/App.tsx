import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { RoleLayout } from "@/components/layout/RoleLayout";

// Pages
import Login from "./pages/auth/Login";
import SuperAdminDashboard from "./pages/dashboards/superadmin/SuperAdminDashboard";
import SchoolAdminDashboard from "./pages/dashboards/schooladmin/SchoolAdminDashboard";
import NotFound from "./pages/NotFound";

// Schools Management Pages
import SchoolsList from "./pages/dashboards/superadmin/schools/SchoolsList";
import SchoolForm from "./pages/dashboards/superadmin/schools/SchoolForm";
import SchoolDetails from "./pages/dashboards/superadmin/schools/SchoolDetails";

// Users Management Pages
import UsersList from "./pages/dashboards/superadmin/users/UsersList";
import UserForm from "./pages/dashboards/superadmin/users/UserForm";
import UserDetails from "./pages/dashboards/superadmin/users/UserDetails";
import Students from "./pages/dashboards/schooladmin/users/Students";
import Teachers from "./pages/dashboards/schooladmin/users/Teachers";

// Teacher Grading Pages
import TeacherScores from "./pages/dashboards/teacher/grades/Scores";
import TeacherBulkUpdate from "./pages/dashboards/teacher/grades/BulkUpdate";
import TeacherResults from "./pages/dashboards/teacher/grades/Results";
import TeacherStudentResults from "./pages/dashboards/teacher/grades/StudentResults";
import TeacherScoreEntry from "./pages/dashboards/teacher/grades/ScoreEntry";

// Notifications Management Pages
import NotificationsList from "./pages/dashboards/superadmin/notifications/NotificationsList";
import NotificationDetails from "./pages/dashboards/superadmin/notifications/NotificationDetails";
import NotificationForm from "./pages/dashboards/superadmin/notifications/NotificationForm";

// Settings Management Pages
import Settings from "./pages/dashboards/superadmin/settings/Settings";
import SettingsForm from "./pages/dashboards/superadmin/settings/SettingsForm";

// Classes Management Pages
import ClassesList from "./pages/dashboards/schooladmin/classes/ClassesList";
import ClassForm from "./pages/dashboards/schooladmin/classes/ClassForm";
import ClassDetails from "./pages/dashboards/schooladmin/classes/ClassDetails";

// Students Management Pages
import StudentsList from "./pages/dashboards/schooladmin/students/StudentsList";
import StudentForm from "./pages/dashboards/schooladmin/students/StudentForm";
import StudentPromotion from "./pages/dashboards/schooladmin/students/StudentPromotion";
import StudentGraduation from "./pages/dashboards/schooladmin/students/StudentGraduation";
import StudentsTable from "./pages/dashboards/schooladmin/students/StudentsTable";

// Subjects Management Pages
import SubjectsList from "./pages/dashboards/schooladmin/subjects/SubjectsList";
import SubjectForm from "./pages/dashboards/schooladmin/subjects/SubjectForm";
import SubjectAssignments from "./pages/dashboards/schooladmin/subjects/SubjectAssignments";

// Payments Management Pages
import PaymentsList from "./pages/dashboards/schooladmin/payments/PaymentsList";
import FeesList from "./pages/dashboards/schooladmin/payments/FeesList";
import FeeForm from "./pages/dashboards/schooladmin/payments/FeeForm";
import FeeDetails from "./pages/dashboards/schooladmin/payments/FeeDetails";
import PaymentDetails from "./pages/dashboards/schooladmin/payments/PaymentDetails";

// Grading Management Pages
import GradingSettings from "./pages/dashboards/schooladmin/grading/GradingSettings";
import TermlyResults from "./pages/dashboards/schooladmin/grading/TermlyResults";
import AnnualResults from "./pages/dashboards/schooladmin/grading/AnnualResults";
import GradingDashboard from "./pages/dashboards/schooladmin/grading/GradingDashboard";
import StudentResultDetails from "./pages/dashboards/schooladmin/grading/StudentResultDetails";
import StudentAnnualResults from "./pages/dashboards/schooladmin/grading/StudentAnnualResults";
import TermlyResultsTable from "./pages/dashboards/schooladmin/grading/TermlyResultsTable";
import AnnualResultsTable from "./pages/dashboards/schooladmin/grading/AnnualResultsTable";
import Exams from "./pages/dashboards/schooladmin/grading/Exams";
import Scores from "./pages/dashboards/schooladmin/grading/Scores";
import BulkUpdates from "./pages/dashboards/schooladmin/grading/BulkUpdates";

// Teacher Dashboard
import TeacherDashboard from "./pages/dashboards/teacher/TeacherDashboard";

// Teacher Grading Pages
import BulkUpdate from "./pages/dashboards/teacher/grades/BulkUpdate";
import Results from "./pages/dashboards/teacher/grades/Results";
import ScoreEntry from "./pages/dashboards/teacher/grades/ScoreEntry";

// Teacher Payment Pages
import { 
  TeacherPaymentsDashboard, 
  StudentPaymentDetails, 
  InvoiceGenerator, 
  PaymentReports 
} from "./pages/dashboards/teacher/payments";

const queryClient = new QueryClient();

// Dashboard Router based on user role
function DashboardRouter() {
  return (
    <Routes>
      <Route path="/super-admin" element={
        <RoleLayout allowedRoles={['super_admin']}>
          <SuperAdminDashboard />
        </RoleLayout>
      } />
      <Route path="/school-admin" element={
        <RoleLayout allowedRoles={['school_admin']}>
          <SchoolAdminDashboard />
        </RoleLayout>
      } />
      <Route path="/teacher" element={
        <RoleLayout allowedRoles={['teacher']}>
          <TeacherDashboard />
        </RoleLayout>
      } />
      <Route path="/student" element={
        <RoleLayout allowedRoles={['student']}>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Student Dashboard</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </RoleLayout>
      } />
      <Route path="/parent" element={
        <RoleLayout allowedRoles={['parent']}>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Parent Dashboard</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </RoleLayout>
      } />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <RoleLayout requireAuth={false}>
                <Login />
              </RoleLayout>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <RoleLayout requireAuth={true}>
                <DashboardRedirect />
              </RoleLayout>
            } />
            
            <Route path="/dashboard/*" element={<DashboardRouter />} />
            
            {/* Schools Management Routes */}
            <Route path="/dashboard/super-admin/schools" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <SchoolsList />
              </RoleLayout>
            } />
            <Route path="/dashboard/super-admin/schools/new" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <SchoolForm />
              </RoleLayout>
            } />
            <Route path="/dashboard/super-admin/schools/edit/:id" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <SchoolForm />
              </RoleLayout>
            } />
            <Route path="/dashboard/super-admin/schools/:id" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <SchoolDetails />
              </RoleLayout>
            } />
            
            {/* Users Management Routes */}
            <Route path="/dashboard/super-admin/users" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <UsersList />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/users/students" element={
              <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
                <Students />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/users/teachers" element={
              <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
                <Teachers />
              </RoleLayout>
            } />
            <Route path="/dashboard/super-admin/users/new" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <UserForm />
              </RoleLayout>
            } />
            <Route path="/dashboard/super-admin/users/edit/:id" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <UserForm />
              </RoleLayout>
            } />
            <Route path="/dashboard/super-admin/users/:id" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <UserDetails />
              </RoleLayout>
            } />
            
            {/* Notifications Management Routes */}
            <Route path="/dashboard/super-admin/notifications" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <NotificationsList />
              </RoleLayout>
            } />
            <Route path="/dashboard/super-admin/notifications/new" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <NotificationForm />
              </RoleLayout>
            } />
            <Route path="/dashboard/super-admin/notifications/:id" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <NotificationDetails />
              </RoleLayout>
            } />
            
            {/* Settings Management Routes */}
            <Route path="/dashboard/super-admin/settings" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <Settings />
              </RoleLayout>
            } />
            <Route path="/dashboard/super-admin/settings/edit" element={
              <RoleLayout allowedRoles={['super_admin']} requireAuth={true}>
                <SettingsForm />
              </RoleLayout>
            } />
            
            {/* Classes Management Routes */}
            <Route path="/dashboard/school-admin/classes" element={
              <RoleLayout allowedRoles={['school_admin', 'teacher']} requireAuth={true}>
                <ClassesList />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/classes/new" element={
              <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
                <ClassForm />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/classes/edit/:id" element={
              <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
                <ClassForm />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/classes/:id" element={
              <RoleLayout allowedRoles={['school_admin', 'teacher']} requireAuth={true}>
                <ClassDetails />
              </RoleLayout>
            } />
            
            {/* Students Management Routes */}
            <Route path="/dashboard/school-admin/students" element={
              <RoleLayout allowedRoles={['school_admin', 'teacher']} requireAuth={true}>
                <StudentsList />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/students/new" element={
              <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
                <StudentForm />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/students/edit/:id" element={
              <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
                <StudentForm />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/students/promote" element={
              <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
                <StudentPromotion />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/students/graduate" element={
              <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
                <StudentGraduation />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/students/table" element={
              <RoleLayout allowedRoles={['school_admin', 'teacher']} requireAuth={true}>
                <StudentsTable />
              </RoleLayout>
            } />
            
            {/* Subjects Management Routes */}
            <Route path="/dashboard/school-admin/subjects" element={
              <RoleLayout allowedRoles={['school_admin', 'teacher']} requireAuth={true}>
                <SubjectsList />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/subjects/new" element={
              <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
                <SubjectForm />
              </RoleLayout>
            } />
            <Route path="/dashboard/school-admin/subjects/edit/:id" element={
              <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
                <SubjectForm />
              </RoleLayout>
            } />
                   <Route path="/dashboard/school-admin/subjects/assignments" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <SubjectAssignments />
         </RoleLayout>
       } />

       {/* Payments Management Routes */}
       <Route path="/dashboard/school-admin/payments" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <PaymentsList />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/payments/fees" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <FeesList />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/payments/fees/new" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <FeeForm />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/payments/fees/edit/:id" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <FeeForm />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/payments/fees/:id" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <FeeDetails />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/payments/:id" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <PaymentDetails />
         </RoleLayout>
       } />

       {/* Grading Management Routes */}
       <Route path="/dashboard/school-admin/grading/settings" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <GradingSettings />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/grading/exams" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <Exams />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/grading/scores" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <Scores />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/grading/bulk-updates" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <BulkUpdates />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/grading/termly-results" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <TermlyResultsTable />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/grading/annual-results" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <AnnualResultsTable />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/grading/dashboard" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <GradingDashboard />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/grading/results/:id" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <StudentResultDetails />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/grading/annual/:studentId/:academicYear" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <StudentAnnualResults />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/grading/termly-cards" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <TermlyResults />
         </RoleLayout>
       } />
       <Route path="/dashboard/school-admin/grading/annual-cards" element={
         <RoleLayout allowedRoles={['school_admin']} requireAuth={true}>
           <AnnualResults />
         </RoleLayout>
       } />
            
            {/* Teacher-specific Routes */}
            <Route path="/dashboard/teacher/classes" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold">Classes Management</h2>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </RoleLayout>
            } />
            <Route path="/dashboard/teacher/assignments" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold">Assignments Management</h2>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </RoleLayout>
            } />
            
            {/* Teacher Grading Routes */}
            <Route path="/dashboard/teacher/grades/scores" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <TeacherScores />
              </RoleLayout>
            } />
            <Route path="/dashboard/teacher/grades/bulk-update" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <TeacherBulkUpdate />
              </RoleLayout>
            } />
            <Route path="/dashboard/teacher/grades/results" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <TeacherResults />
              </RoleLayout>
            } />
            <Route path="/dashboard/teacher/grades/student-results/:studentId" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <TeacherStudentResults />
              </RoleLayout>
            } />
            
            {/* Score Entry Route */}
            <Route path="/dashboard/teacher/grades/score-entry/:studentId" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <TeacherScoreEntry />
              </RoleLayout>
            } />
            
            {/* Teacher Payment Routes */}
            <Route path="/dashboard/teacher/payments" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <TeacherPaymentsDashboard />
              </RoleLayout>
            } />
            <Route path="/dashboard/teacher/payments/student/:studentId" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <StudentPaymentDetails />
              </RoleLayout>
            } />
            <Route path="/dashboard/teacher/payments/invoice/:studentId" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <InvoiceGenerator />
              </RoleLayout>
            } />
            <Route path="/dashboard/teacher/payments/reports" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <PaymentReports />
              </RoleLayout>
            } />
            
            {/* General Grades Routes */}
            <Route path="/grades/scores" element={
              <RoleLayout allowedRoles={['teacher', 'student']} requireAuth={true}>
                <TeacherScores />
              </RoleLayout>
            } />
            <Route path="/grades/bulk-update" element={
              <RoleLayout allowedRoles={['teacher']} requireAuth={true}>
                <TeacherBulkUpdate />
              </RoleLayout>
            } />
            <Route path="/grades/results" element={
              <RoleLayout allowedRoles={['teacher', 'student']} requireAuth={true}>
                <TeacherResults />
              </RoleLayout>
            } />
            
            <Route path="/results" element={
              <RoleLayout allowedRoles={['student']} requireAuth={true}>
                <TeacherResults />
              </RoleLayout>
            } />
            
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Component to redirect to appropriate dashboard based on user role
function DashboardRedirect() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  const roleRoutes = {
    'super_admin': '/dashboard/super-admin',
    'school_admin': '/dashboard/school-admin', 
    'teacher': '/dashboard/teacher',
    'student': '/dashboard/student',
    'parent': '/dashboard/parent'
  };
  
  return <Navigate to={roleRoutes[user.role]} replace />;
}

export default App;
