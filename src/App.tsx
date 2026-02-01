import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleSelectionPopup } from "@/components/home/RoleSelectionPopup";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Loading from "@/components/layout/Loading";
import { ErrorBoundary } from "react-error-boundary";
import ChunkLoadErrorFallback from "@/components/layout/ChunkLoadErrorFallback";

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Careers = lazy(() => import("./pages/Careers"));
const CareerDetail = lazy(() => import("./pages/CareerDetail"));
const Craft = lazy(() => import("./pages/Craft"));
const Cafe = lazy(() => import("./pages/Cafe"));
const Ambassador = lazy(() => import("./pages/Ambassador"));
const Auth = lazy(() => import("./pages/Auth"));
const Partner = lazy(() => import("./pages/Partner"));
const Blogs = lazy(() => import("./pages/Blogs"));
const Programs = lazy(() => import("./pages/Programs"));
const MyCareerLab = lazy(() => import("./pages/MyCareerLab"));
const RoadmapDetail = lazy(() => import("./pages/RoadmapDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SchoolCareers = lazy(() => import("./pages/SchoolCareers"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminDomains = lazy(() => import("./pages/admin/AdminDomains"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminCareers = lazy(() => import("./pages/admin/AdminCareers"));
const AdminRoadmaps = lazy(() => import("./pages/admin/AdminRoadmaps"));
const AdminResources = lazy(() => import("./pages/admin/AdminResources"));
const AdminInternships = lazy(() => import("./pages/admin/AdminInternships"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const AdminSuccessStories = lazy(() => import("./pages/admin/AdminSuccessStories"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminEventsApproval = lazy(() => import("./pages/admin/AdminEventsApproval"));
const AdminApplications = lazy(() => import("./pages/admin/AdminApplications"));
const AdminPrograms = lazy(() => import("./pages/admin/AdminPrograms"));
const AdminDailyTasks = lazy(() => import("./pages/admin/AdminDailyTasks"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPartners = lazy(() => import("./pages/admin/AdminPartners"));
const AdminHomepageContent = lazy(() => import("./pages/admin/AdminHomepageContent"));
const AdminDegrees = lazy(() => import("./pages/admin/AdminDegrees"));
const AdminMentorVerification = lazy(() => import("./pages/admin/AdminMentorVerification"));
const AdminInstitutions = lazy(() => import("./pages/admin/AdminInstitutions"));
const AdminMetrics = lazy(() => import("./pages/admin/AdminMetrics"));
const AdminAccessControl = lazy(() => import("./pages/admin/AdminAccessControl"));
const AdminPsychometricTests = lazy(() => import("./pages/admin/AdminPsychometricTests"));
const AdminGovernmentExams = lazy(() => import("./pages/admin/AdminGovernmentExams"));
const AdminScholarships = lazy(() => import("./pages/admin/AdminScholarships"));
const AdminOlympiads = lazy(() => import("./pages/admin/AdminOlympiads"));
const AdminModuleHero = lazy(() => import("./pages/admin/AdminModuleHero"));
const AdminOrganizationPlans = lazy(() => import("./pages/admin/AdminOrganizationPlans"));
const AdminFAQs = lazy(() => import("./pages/admin/AdminFAQs"));
const AdminLegalPages = lazy(() => import("./pages/admin/AdminLegalPages"));
const AdminSiteConfig = lazy(() => import("./pages/admin/AdminSiteConfig"));
const AdminEventGallery = lazy(() => import("./pages/admin/AdminEventGallery"));
const SchoolAssessment = lazy(() => import("./pages/SchoolAssessment"));
const FAQs = lazy(() => import("./pages/FAQs"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const MentorDashboard = lazy(() => import("./pages/mentor/MentorDashboard"));
const MentorDailyTasks = lazy(() => import("./pages/mentor/MentorDailyTasks"));
const MentorPrograms = lazy(() => import("./pages/mentor/MentorPrograms"));
const MentorInternships = lazy(() => import("./pages/mentor/MentorInternships"));
const MentorBlogs = lazy(() => import("./pages/mentor/MentorBlogs"));
const MentorResources = lazy(() => import("./pages/mentor/MentorResources"));
const MentorEvents = lazy(() => import("./pages/mentor/MentorEvents"));
const MentorRooms = lazy(() => import("./pages/mentor/MentorRooms"));
const MentorSubscribers = lazy(() => import("./pages/mentor/MentorSubscribers"));
const MentorGuidance = lazy(() => import("./pages/mentor/MentorGuidance"));
const MentorMyProfile = lazy(() => import("./pages/mentor/MentorMyProfile"));
const Mentors = lazy(() => import("./pages/Mentors"));
const MentorProfile = lazy(() => import("./pages/MentorProfile"));
const Institutions = lazy(() => import("./pages/Institutions"));
const InstitutionProfileView = lazy(() => import("./pages/InstitutionProfile"));
const InstitutionDashboard = lazy(() => import("./pages/institution/InstitutionDashboard"));
const InstitutionProfilePage = lazy(() => import("./pages/institution/InstitutionProfilePage"));
const InstitutionEvents = lazy(() => import("./pages/institution/InstitutionEvents"));
const InstitutionMoU = lazy(() => import("./pages/institution/InstitutionMoU"));
const InstitutionPreview = lazy(() => import("./pages/institution/InstitutionPreview"));
const InstitutionResources = lazy(() => import("./pages/institution/InstitutionResources"));
const InstitutionMembers = lazy(() => import("./pages/institution/InstitutionMembers"));
const InstitutionPrograms = lazy(() => import("./pages/institution/InstitutionPrograms"));
const InstitutionPlans = lazy(() => import("./pages/institution/InstitutionPlans"));
const InstitutionInquiries = lazy(() => import("./pages/institution/InstitutionInquiries"));
const InstitutionSettings = lazy(() => import("./pages/institution/InstitutionSettings"));
const PartnerDashboard = lazy(() => import("./pages/partner/PartnerDashboard"));
const PartnerProfilePage = lazy(() => import("./pages/partner/PartnerProfilePage"));
const PartnerEvents = lazy(() => import("./pages/partner/PartnerEvents"));
const PartnerPreview = lazy(() => import("./pages/partner/PartnerPreview"));
const PartnerJobs = lazy(() => import("./pages/partner/PartnerJobs"));
const PartnerEngagement = lazy(() => import("./pages/partner/PartnerEngagement"));
const PartnerCollaborations = lazy(() => import("./pages/partner/PartnerCollaborations"));
const PartnerAnalytics = lazy(() => import("./pages/partner/PartnerAnalytics"));
const PartnerMoU = lazy(() => import("./pages/partner/PartnerMoU"));
const PartnerPlans = lazy(() => import("./pages/partner/PartnerPlans"));
const PartnerInquiries = lazy(() => import("./pages/partner/PartnerInquiries"));
const PartnerSettings = lazy(() => import("./pages/partner/PartnerSettings"));
const PartnerPostsPage = lazy(() => import("./pages/partner/PartnerPostsPage"));
const PartnerInterviewProcessPage = lazy(() => import("./pages/partner/PartnerInterviewProcessPage"));
const PartnerJobsPage = lazy(() => import("./pages/partner/PartnerJobsPage"));
const PartnerEventsPage = lazy(() => import("./pages/partner/PartnerEventsPage"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
const AdminPartnerVerification = lazy(() => import("./pages/admin/AdminPartnerVerification"));
const PlansAndPricing = lazy(() => import("./pages/PlansAndPricing"));
const AdminRegistrations = lazy(() => import("./pages/admin/AdminRegistrations"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RoleSelectionPopup />
        <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary FallbackComponent={ChunkLoadErrorFallback}>
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/careers/:slug" element={<CareerDetail />} />
                <Route path="/school-careers" element={<SchoolCareers />} />
                <Route path="/craft" element={<Craft />} />
                <Route path="/craft/:id" element={<RoadmapDetail />} />
                <Route path="/roadmap/:id" element={<RoadmapDetail />} />
                <Route path="/cafe" element={<Cafe />} />
                <Route path="/ambassador" element={<Ambassador />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/partner" element={<Partner />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/school-assessment" element={<SchoolAssessment />} />
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/privacy" element={<LegalPage />} />
                <Route path="/terms" element={<LegalPage />} />
                <Route path="/institutions" element={<Institutions />} />
                <Route
                  path="/institutions/:id"
                  element={<InstitutionProfileView />}
                />
                <Route path="/mentors" element={<Mentors />} />
                <Route path="/mentors/:mentorId" element={<MentorProfile />} />
                <Route path="/plans" element={<PlansAndPricing />} />
                <Route path="/company/:slug" element={<CompanyProfile />} />

                {/* Protected: Requires Authentication */}
                <Route
                  path="/my-career-lab"
                  element={
                    <ProtectedRoute>
                      <MyCareerLab />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes - Admin Only */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/domains"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDomains />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminCategories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/careers"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminCareers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/degrees"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDegrees />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/roadmaps"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminRoadmaps />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/daily-tasks"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDailyTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/resources"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminResources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/internships"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminInternships />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/blogs"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminBlogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/success-stories"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminSuccessStories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events-approval"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminEventsApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/applications"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/programs"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminPrograms />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/registrations"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminRegistrations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/partners"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminPartners />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/homepage-content"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminHomepageContent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/mentor-verification"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminMentorVerification />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/institutions"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminInstitutions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/metrics"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminMetrics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/access-control"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminAccessControl />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/psychometric-tests"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminPsychometricTests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/government-exams"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminGovernmentExams />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/scholarships"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminScholarships />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/olympiads"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminOlympiads />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/module-hero"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminModuleHero />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/organization-plans"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminOrganizationPlans />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/faqs"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminFAQs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/legal-pages"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminLegalPages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/site-config"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminSiteConfig />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/event-gallery"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminEventGallery />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/partner-verification"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminPartnerVerification />
                    </ProtectedRoute>
                  }
                />

                {/* Mentor Dashboard Routes - Mentor Only */}
                <Route
                  path="/mentor"
                  element={
                    <ProtectedRoute allowedRoles={["mentor"]}>
                      <MentorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor/profile"
                  element={
                    <ProtectedRoute allowedRoles={["mentor"]}>
                      <MentorMyProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor/daily-tasks"
                  element={
                    <ProtectedRoute allowedRoles={["mentor"]}>
                      <MentorDailyTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor/programs"
                  element={
                    <ProtectedRoute allowedRoles={["mentor"]}>
                      <MentorPrograms />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor/internships"
                  element={
                    <ProtectedRoute allowedRoles={["mentor"]}>
                      <MentorInternships />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor/blogs"
                  element={
                    <ProtectedRoute allowedRoles={["mentor"]}>
                      <MentorBlogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor/resources"
                  element={
                    <ProtectedRoute allowedRoles={["mentor"]}>
                      <MentorResources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor/events"
                  element={
                    <ProtectedRoute allowedRoles={["mentor"]}>
                      <MentorEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor/rooms"
                  element={
                    <ProtectedRoute allowedRoles={["mentor"]}>
                      <MentorRooms />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor/subscribers"
                  element={
                    <ProtectedRoute allowedRoles={["mentor"]}>
                      <MentorSubscribers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor/guidance"
                  element={
                    <ProtectedRoute allowedRoles={["mentor"]}>
                      <MentorGuidance />
                    </ProtectedRoute>
                  }
                />

                {/* Institution Dashboard Routes - Institution Only */}
                <Route
                  path="/institution"
                  element={
                    <ProtectedRoute allowedRoles={["institution"]}>
                      <InstitutionDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institution/profile"
                  element={
                    <ProtectedRoute allowedRoles={["institution"]}>
                      <InstitutionProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institution/events"
                  element={
                    <ProtectedRoute allowedRoles={["institution"]}>
                      <InstitutionEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institution/mou"
                  element={
                    <ProtectedRoute allowedRoles={["institution"]}>
                      <InstitutionMoU />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institution/preview"
                  element={
                    <ProtectedRoute allowedRoles={["institution"]}>
                      <InstitutionPreview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institution/resources"
                  element={
                    <ProtectedRoute allowedRoles={["institution"]}>
                      <InstitutionResources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institution/members"
                  element={
                    <ProtectedRoute allowedRoles={["institution"]}>
                      <InstitutionMembers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institution/programs"
                  element={
                    <ProtectedRoute allowedRoles={["institution"]}>
                      <InstitutionPrograms />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institution/plans"
                  element={
                    <ProtectedRoute allowedRoles={["institution"]}>
                      <InstitutionPlans />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institution/inquiries"
                  element={
                    <ProtectedRoute allowedRoles={["institution"]}>
                      <InstitutionInquiries />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institution/settings"
                  element={
                    <ProtectedRoute allowedRoles={["institution"]}>
                      <InstitutionSettings />
                    </ProtectedRoute>
                  }
                />

                {/* Partner Dashboard Routes - Partner Only */}
                <Route
                  path="/partner-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/profile"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/preview"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerPreview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/jobs"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/events"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/engagement"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerEngagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/collaborations"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerCollaborations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/analytics"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/mou"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerMoU />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/plans"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerPlans />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/inquiries"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerInquiries />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/settings"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/posts"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerPostsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard/interview-process"
                  element={
                    <ProtectedRoute allowedRoles={["partner"]}>
                      <PartnerInterviewProcessPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
