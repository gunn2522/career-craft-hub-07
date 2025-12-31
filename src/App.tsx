import { Toaster } from "@/components/ui/toaster";
import AdminRegistrations from "./pages/admin/AdminRegistrations";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Craft from "./pages/Craft";
import Cafe from "./pages/Cafe";
import Ambassador from "./pages/Ambassador";
import Auth from "./pages/Auth";
import Partner from "./pages/Partner";
import Blogs from "./pages/Blogs";
import Programs from "./pages/Programs";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCareers from "./pages/admin/AdminCareers";
import AdminRoadmaps from "./pages/admin/AdminRoadmaps";
import AdminResources from "./pages/admin/AdminResources";
import AdminInternships from "./pages/admin/AdminInternships";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminSuccessStories from "./pages/admin/AdminSuccessStories";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminPrograms from "./pages/admin/AdminPrograms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/craft" element={<Craft />} />
            <Route path="/cafe" element={<Cafe />} />
            <Route path="/ambassador" element={<Ambassador />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/careers" element={<AdminCareers />} />
            <Route path="/admin/roadmaps" element={<AdminRoadmaps />} />
            <Route path="/admin/resources" element={<AdminResources />} />
            <Route path="/admin/internships" element={<AdminInternships />} />
            <Route path="/admin/blogs" element={<AdminBlogs />} />
            <Route path="/admin/success-stories" element={<AdminSuccessStories />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/programs" element={<AdminPrograms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
