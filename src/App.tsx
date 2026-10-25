import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ExploreJobsPage } from './pages/public/ExploreJobsPage';
import { HackathonsPage } from './pages/public/HackathonsPage';
import { CompaniesPage } from './pages/public/CompaniesPage';
import { CompanyDetailsPage } from './pages/public/CompanyDetailsPage';

// Professional Networking & Career Intelligence
import { FeedPage } from './pages/networking/FeedPage';
import { NetworkPage } from './pages/networking/NetworkPage';
import { MessagesPage } from './pages/networking/MessagesPage';
import { SearchPage } from './pages/networking/SearchPage';


// Student Portal Pages (Portal 1)
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { WeeklyQuizPage } from './pages/student/WeeklyQuizPage';
import { SkillsPage } from './pages/student/SkillsPage';
import { OpportunitiesPage } from './pages/student/OpportunitiesPage';
import { StudentSettings } from './pages/student/StudentSettings';
import { SkillGapPage } from './pages/student/SkillGapPage';
import { ResumeBuilderPage } from './pages/student/ResumeBuilderPage';
import { StudentPortfolioPage } from './pages/student/StudentPortfolioPage';
import { StudentHackathonsPage } from './pages/student/StudentHackathonsPage';
import { CareerAssistantPage } from './pages/student/CareerAssistantPage';

// Company Portal Pages (Portal 2)
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { TalentDiscoveryPage } from './pages/company/TalentDiscoveryPage';
import { JobsManagementPage } from './pages/company/JobsManagementPage';
import { ApplicationsReviewPage } from './pages/company/ApplicationsReviewPage';
import { CompanySettings } from './pages/company/CompanySettings';
import { CompanyHackathonsPage } from './pages/company/CompanyHackathonsPage';
import { CompanyUpdatesPage } from './pages/company/CompanyUpdatesPage';
import { CompanyInterviewsPage } from './pages/company/CompanyInterviewsPage';

// Platform Admin Portal (Portal 3)
import { AdminPortalPage } from './pages/admin/AdminPortalPage';

// Fairness Reviewer Portal (Portal 4)
import { ReviewerPortalPage } from './pages/reviewer/ReviewerPortalPage';

// In-Platform Live Online Interview & Feedback
import { OnlineInterviewRoom } from './pages/interview/OnlineInterviewRoom';
import { PostInterviewFeedbackPage } from './pages/interview/PostInterviewFeedbackPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/explore-jobs" element={<ExploreJobsPage />} />
              <Route path="/hackathons" element={<HackathonsPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/company-page/:companyId" element={<CompanyDetailsPage />} />
              <Route path="/search" element={<SearchPage />} />

              {/* Networking Features (Accessible to authenticated users across portals) */}
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <FeedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/network"
                element={
                  <ProtectedRoute>
                    <NetworkPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />


              {/* In-Platform Live Interview Room (accessible to student, company, reviewer, admin) */}
              <Route
                path="/interview/:interviewId"
                element={
                  <ProtectedRoute>
                    <OnlineInterviewRoom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview/:interviewId/feedback"
                element={
                  <ProtectedRoute>
                    <PostInterviewFeedbackPage />
                  </ProtectedRoute>
                }
              />

              {/* PORTAL 1: Student / Job Seeker Protected Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/career-assistant"
                element={
                  <ProtectedRoute allowedRole="student">
                    <CareerAssistantPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/weekly-quiz"
                element={
                  <ProtectedRoute allowedRole="student">
                    <WeeklyQuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/skills"
                element={
                  <ProtectedRoute allowedRole="student">
                    <SkillsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/skill-gap"
                element={
                  <ProtectedRoute allowedRole="student">
                    <SkillGapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/resume-builder"
                element={
                  <ProtectedRoute allowedRole="student">
                    <ResumeBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/portfolio"
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentPortfolioPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/hackathons"
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentHackathonsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/opportunities"
                element={
                  <ProtectedRoute allowedRole="student">
                    <OpportunitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/settings"
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentSettings />
                  </ProtectedRoute>
                }
              />

              {/* PORTAL 2: MNC Company / Recruiter Protected Routes */}
              <Route
                path="/company/dashboard"
                element={
                  <ProtectedRoute allowedRole="company">
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/talent"
                element={
                  <ProtectedRoute allowedRole="company">
                    <TalentDiscoveryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/jobs"
                element={
                  <ProtectedRoute allowedRole="company">
                    <JobsManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/applications"
                element={
                  <ProtectedRoute allowedRole="company">
                    <ApplicationsReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/interviews"
                element={
                  <ProtectedRoute allowedRole="company">
                    <CompanyInterviewsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/hackathons"
                element={
                  <ProtectedRoute allowedRole="company">
                    <CompanyHackathonsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/updates"
                element={
                  <ProtectedRoute allowedRole="company">
                    <CompanyUpdatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/settings"
                element={
                  <ProtectedRoute allowedRole="company">
                    <CompanySettings />
                  </ProtectedRoute>
                }
              />

              {/* PORTAL 3: Platform Administrator Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminPortalPage />
                  </ProtectedRoute>
                }
              />

              {/* PORTAL 4: Fairness Reviewer Protected Routes */}
              <Route
                path="/reviewer/dashboard"
                element={
                  <ProtectedRoute allowedRole="reviewer">
                    <ReviewerPortalPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
