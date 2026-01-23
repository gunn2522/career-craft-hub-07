import { Toaster } from "@/components/ui/toaster";
import AdminRegistrations from "./pages/admin/AdminRegistrations";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleSelectionPopup } from "@/components/home/RoleSelectionPopup";
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
            <Route path="/my-career-lab" element={<MyCareerLab />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/domains" element={<AdminDomains />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/careers" element={<AdminCareers />} />
            <Route path="/admin/degrees" element={<AdminDegrees />} />
            <Route path="/admin/roadmaps" element={<AdminRoadmaps />} />
            <Route path="/admin/daily-tasks" element={<AdminDailyTasks />} />
            <Route path="/admin/resources" element={<AdminResources />} />
            <Route path="/admin/internships" element={<AdminInternships />} />
            <Route path="/admin/blogs" element={<AdminBlogs />} />
            <Route path="/admin/success-stories" element={<AdminSuccessStories />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/programs" element={<AdminPrograms />} />
            <Route path="/admin/registrations" element={<AdminRegistrations />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/partners" element={<AdminPartners />} />
            <Route path="/admin/homepage-content" element={<AdminHomepageContent />} />
            <Route path="/admin/mentor-verification" element={<AdminMentorVerification />} />
            <Route path="/admin/institutions" element={<AdminInstitutions />} />
            <Route path="/admin/metrics" element={<AdminMetrics />} />
            <Route path="/admin/access-control" element={<AdminAccessControl />} />
            <Route path="/admin/psychometric-tests" element={<AdminPsychometricTests />} />
            <Route path="/admin/government-exams" element={<AdminGovernmentExams />} />
            <Route path="/admin/scholarships" element={<AdminScholarships />} />
            <Route path="/admin/olympiads" element={<AdminOlympiads />} />
            <Route path="/admin/module-hero" element={<AdminModuleHero />} />
            <Route path="/admin/organization-plans" element={<AdminOrganizationPlans />} />
            <Route path="/admin/faqs" element={<AdminFAQs />} />
            <Route path="/admin/legal-pages" element={<AdminLegalPages />} />
            <Route path="/admin/site-config" element={<AdminSiteConfig />} />
            <Route path="/school-assessment" element={<SchoolAssessment />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/privacy" element={<LegalPage />} />
            <Route path="/terms" element={<LegalPage />} />
            <Route path="/institutions" element={<Institutions />} />
            <Route path="/institutions/:id" element={<InstitutionProfileView />} />
            {/* Institution Dashboard Routes */}
            <Route path="/institution" element={<InstitutionDashboard />} />
            <Route path="/institution/profile" element={<InstitutionProfilePage />} />
            <Route path="/institution/events" element={<InstitutionEvents />} />
            <Route path="/institution/mou" element={<InstitutionMoU />} />
            <Route path="/institution/preview" element={<InstitutionPreview />} />
            {/* Partner Dashboard Routes */}
            <Route path="/partner-dashboard" element={<PartnerDashboard />} />
            <Route path="/partner-dashboard/profile" element={<PartnerProfilePage />} />
            <Route path="/partner-dashboard/events" element={<PartnerEvents />} />
            {/* Plans & Pricing */}
            <Route path="/plans" element={<PlansAndPricing />} />
            {/* Mentor Dashboard Routes */}
            <Route path="/mentor" element={<MentorDashboard />} />
            <Route path="/mentor/profile" element={<MentorMyProfile />} />
            <Route path="/mentor/daily-tasks" element={<MentorDailyTasks />} />
            <Route path="/mentor/programs" element={<MentorPrograms />} />
            <Route path="/mentor/internships" element={<MentorInternships />} />
            <Route path="/mentor/blogs" element={<MentorBlogs />} />
            <Route path="/mentor/resources" element={<MentorResources />} />
            <Route path="/mentor/events" element={<MentorEvents />} />
            <Route path="/mentor/rooms" element={<MentorRooms />} />
            <Route path="/mentor/subscribers" element={<MentorSubscribers />} />
            <Route path="/mentor/guidance" element={<MentorGuidance />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/mentors/:mentorId" element={<MentorProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
