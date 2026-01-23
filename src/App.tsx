import { Toaster } from "@/components/ui/toaster";
import AdminRegistrations from "./pages/admin/AdminRegistrations";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleSelectionPopup } from "@/components/home/RoleSelectionPopup";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Careers from "./pages/Careers";
import CareerDetail from "./pages/CareerDetail";
import Craft from "./pages/Craft";
import Cafe from "./pages/Cafe";
import Ambassador from "./pages/Ambassador";
import Auth from "./pages/Auth";
import Partner from "./pages/Partner";
import Blogs from "./pages/Blogs";
import Programs from "./pages/Programs";
import MyCareerLab from "./pages/MyCareerLab";
import RoadmapDetail from "./pages/RoadmapDetail";
import NotFound from "./pages/NotFound";
import SchoolCareers from "./pages/SchoolCareers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDomains from "./pages/admin/AdminDomains";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCareers from "./pages/admin/AdminCareers";
import AdminRoadmaps from "./pages/admin/AdminRoadmaps";
import AdminResources from "./pages/admin/AdminResources";
import AdminInternships from "./pages/admin/AdminInternships";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminSuccessStories from "./pages/admin/AdminSuccessStories";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminEventsApproval from "./pages/admin/AdminEventsApproval";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminPrograms from "./pages/admin/AdminPrograms";
import AdminDailyTasks from "./pages/admin/AdminDailyTasks";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminHomepageContent from "./pages/admin/AdminHomepageContent";
import AdminDegrees from "./pages/admin/AdminDegrees";
import AdminMentorVerification from "./pages/admin/AdminMentorVerification";
import AdminInstitutions from "./pages/admin/AdminInstitutions";
import AdminMetrics from "./pages/admin/AdminMetrics";
import AdminAccessControl from "./pages/admin/AdminAccessControl";
import AdminPsychometricTests from "./pages/admin/AdminPsychometricTests";
import AdminGovernmentExams from "./pages/admin/AdminGovernmentExams";
import AdminScholarships from "./pages/admin/AdminScholarships";
import AdminOlympiads from "./pages/admin/AdminOlympiads";
import AdminModuleHero from "./pages/admin/AdminModuleHero";
import AdminOrganizationPlans from "./pages/admin/AdminOrganizationPlans";
import AdminFAQs from "./pages/admin/AdminFAQs";
import AdminLegalPages from "./pages/admin/AdminLegalPages";
import AdminSiteConfig from "./pages/admin/AdminSiteConfig";
import AdminEventGallery from "./pages/admin/AdminEventGallery";
import SchoolAssessment from "./pages/SchoolAssessment";
import FAQs from "./pages/FAQs";
import LegalPage from "./pages/LegalPage";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorDailyTasks from "./pages/mentor/MentorDailyTasks";
import MentorPrograms from "./pages/mentor/MentorPrograms";
import MentorInternships from "./pages/mentor/MentorInternships";
import MentorBlogs from "./pages/mentor/MentorBlogs";
import MentorResources from "./pages/mentor/MentorResources";
import MentorEvents from "./pages/mentor/MentorEvents";
import MentorRooms from "./pages/mentor/MentorRooms";
import MentorSubscribers from "./pages/mentor/MentorSubscribers";
import MentorGuidance from "./pages/mentor/MentorGuidance";
import MentorMyProfile from "./pages/mentor/MentorMyProfile";
import Mentors from "./pages/Mentors";
import MentorProfile from "./pages/MentorProfile";
import Institutions from "./pages/Institutions";
import InstitutionProfileView from "./pages/InstitutionProfile";
import InstitutionDashboard from "./pages/institution/InstitutionDashboard";
import InstitutionProfilePage from "./pages/institution/InstitutionProfilePage";
import InstitutionEvents from "./pages/institution/InstitutionEvents";
import InstitutionMoU from "./pages/institution/InstitutionMoU";
import InstitutionPreview from "./pages/institution/InstitutionPreview";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerProfilePage from "./pages/partner/PartnerProfilePage";
import PartnerEvents from "./pages/partner/PartnerEvents";
import PlansAndPricing from "./pages/PlansAndPricing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RoleSelectionPopup />
        <BrowserRouter>
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
            <Route path="/institutions/:id" element={<InstitutionProfileView />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/mentors/:mentorId" element={<MentorProfile />} />
            <Route path="/plans" element={<PlansAndPricing />} />
            
            {/* Protected: Requires Authentication */}
            <Route path="/my-career-lab" element={
              <ProtectedRoute>
                <MyCareerLab />
              </ProtectedRoute>
            } />

            {/* Admin Routes - Admin Only */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/domains" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDomains />
              </ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCategories />
              </ProtectedRoute>
            } />
            <Route path="/admin/careers" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCareers />
              </ProtectedRoute>
            } />
            <Route path="/admin/degrees" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDegrees />
              </ProtectedRoute>
            } />
            <Route path="/admin/roadmaps" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRoadmaps />
              </ProtectedRoute>
            } />
            <Route path="/admin/daily-tasks" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDailyTasks />
              </ProtectedRoute>
            } />
            <Route path="/admin/resources" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminResources />
              </ProtectedRoute>
            } />
            <Route path="/admin/internships" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminInternships />
              </ProtectedRoute>
            } />
            <Route path="/admin/blogs" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminBlogs />
              </ProtectedRoute>
            } />
            <Route path="/admin/success-stories" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSuccessStories />
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminEvents />
              </ProtectedRoute>
            } />
            <Route path="/admin/events-approval" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminEventsApproval />
              </ProtectedRoute>
            } />
            <Route path="/admin/applications" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminApplications />
              </ProtectedRoute>
            } />
            <Route path="/admin/programs" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPrograms />
              </ProtectedRoute>
            } />
            <Route path="/admin/registrations" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRegistrations />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/partners" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPartners />
              </ProtectedRoute>
            } />
            <Route path="/admin/homepage-content" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminHomepageContent />
              </ProtectedRoute>
            } />
            <Route path="/admin/mentor-verification" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminMentorVerification />
              </ProtectedRoute>
            } />
            <Route path="/admin/institutions" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminInstitutions />
              </ProtectedRoute>
            } />
            <Route path="/admin/metrics" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminMetrics />
              </ProtectedRoute>
            } />
            <Route path="/admin/access-control" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAccessControl />
              </ProtectedRoute>
            } />
            <Route path="/admin/psychometric-tests" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPsychometricTests />
              </ProtectedRoute>
            } />
            <Route path="/admin/government-exams" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminGovernmentExams />
              </ProtectedRoute>
            } />
            <Route path="/admin/scholarships" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminScholarships />
              </ProtectedRoute>
            } />
            <Route path="/admin/olympiads" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminOlympiads />
              </ProtectedRoute>
            } />
            <Route path="/admin/module-hero" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminModuleHero />
              </ProtectedRoute>
            } />
            <Route path="/admin/organization-plans" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminOrganizationPlans />
              </ProtectedRoute>
            } />
            <Route path="/admin/faqs" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminFAQs />
              </ProtectedRoute>
            } />
            <Route path="/admin/legal-pages" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLegalPages />
              </ProtectedRoute>
            } />
            <Route path="/admin/site-config" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSiteConfig />
              </ProtectedRoute>
            } />
            <Route path="/admin/event-gallery" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminEventGallery />
              </ProtectedRoute>
            } />

            {/* Mentor Dashboard Routes - Mentor Only */}
            <Route path="/mentor" element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/mentor/profile" element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorMyProfile />
              </ProtectedRoute>
            } />
            <Route path="/mentor/daily-tasks" element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorDailyTasks />
              </ProtectedRoute>
            } />
            <Route path="/mentor/programs" element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorPrograms />
              </ProtectedRoute>
            } />
            <Route path="/mentor/internships" element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorInternships />
              </ProtectedRoute>
            } />
            <Route path="/mentor/blogs" element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorBlogs />
              </ProtectedRoute>
            } />
            <Route path="/mentor/resources" element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorResources />
              </ProtectedRoute>
            } />
            <Route path="/mentor/events" element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorEvents />
              </ProtectedRoute>
            } />
            <Route path="/mentor/rooms" element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorRooms />
              </ProtectedRoute>
            } />
            <Route path="/mentor/subscribers" element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorSubscribers />
              </ProtectedRoute>
            } />
            <Route path="/mentor/guidance" element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorGuidance />
              </ProtectedRoute>
            } />

            {/* Institution Dashboard Routes - Institution Only */}
            <Route path="/institution" element={
              <ProtectedRoute allowedRoles={["institution"]}>
                <InstitutionDashboard />
              </ProtectedRoute>
            } />
            <Route path="/institution/profile" element={
              <ProtectedRoute allowedRoles={["institution"]}>
                <InstitutionProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/institution/events" element={
              <ProtectedRoute allowedRoles={["institution"]}>
                <InstitutionEvents />
              </ProtectedRoute>
            } />
            <Route path="/institution/mou" element={
              <ProtectedRoute allowedRoles={["institution"]}>
                <InstitutionMoU />
              </ProtectedRoute>
            } />
            <Route path="/institution/preview" element={
              <ProtectedRoute allowedRoles={["institution"]}>
                <InstitutionPreview />
              </ProtectedRoute>
            } />

            {/* Partner Dashboard Routes - Partner Only */}
            <Route path="/partner-dashboard" element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <PartnerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/partner-dashboard/profile" element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <PartnerProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/partner-dashboard/events" element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <PartnerEvents />
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
