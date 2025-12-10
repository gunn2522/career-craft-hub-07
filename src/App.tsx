import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Careers from "./pages/Careers";
import Craft from "./pages/Craft";
import Cafe from "./pages/Cafe";
import Ambassador from "./pages/Ambassador";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Partner from "./pages/Partner";
import Blogs from "./pages/Blogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/craft" element={<Craft />} />
          <Route path="/cafe" element={<Cafe />} />
          <Route path="/ambassador" element={<Ambassador />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;