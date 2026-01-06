import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, School, ArrowRight, Sparkles, Users, Building2, UserCheck } from "lucide-react";
import { FloatingShapes3D } from "@/components/ui/FloatingShapes3D";
import { useRoleBasedSection } from "@/hooks/useHomepageContent";
import { useVisitorRole } from "@/hooks/useVisitorRole";

// Get CTA cards based on visitor role
const getCTACards = (role: string | null) => {
  switch (role) {
    case 'school_student':
      return [
        {
          link: "/signup?type=school",
          icon: School,
          title: "I'm a School Student",
          description: "Explore career paths after 12th grade",
          cta: "Get Started",
        },
        {
          link: "/careers",
          icon: GraduationCap,
          title: "Explore Careers",
          description: "Discover degrees, exams & eligibility",
          cta: "Browse Careers",
        },
      ];
    case 'mentor':
      return [
        {
          link: "/auth",
          icon: UserCheck,
          title: "Become a Mentor",
          description: "Share your expertise and guide students",
          cta: "Apply Now",
        },
        {
          link: "/about",
          icon: Users,
          title: "Learn More",
          description: "Discover the benefits of mentoring",
          cta: "Read More",
        },
      ];
    case 'institution':
    case 'partner':
      return [
        {
          link: "/partner",
          icon: Building2,
          title: "Partner With Us",
          description: "Access talented students for hiring",
          cta: "Become a Partner",
        },
        {
          link: "/about",
          icon: Users,
          title: "View Programs",
          description: "Explore engagement opportunities",
          cta: "Learn More",
        },
      ];
    default:
      return [
        {
          link: "/signup?type=school",
          icon: School,
          title: "School Student",
          description: "Grades 8-12 exploring future career options",
          cta: "Sign Up",
        },
        {
          link: "/signup?type=college",
          icon: GraduationCap,
          title: "College Student",
          description: "Undergraduates & graduates building careers",
          cta: "Sign Up",
        },
      ];
  }
};

export const SignupCTA = () => {
  const { visitorRole } = useVisitorRole();
  const sectionContent = useRoleBasedSection('signup_cta');
  
  const ctaCards = getCTACards(visitorRole);

  // Dynamic title and subtitle based on role
  const getTitle = () => {
    if (sectionContent.title) return sectionContent.title;
    
    switch (visitorRole) {
      case 'school_student':
        return "Ready to Plan Your **Career After 12th?**";
      case 'mentor':
        return "Ready to **Share Your Expertise?**";
      case 'institution':
      case 'partner':
        return "Ready to **Find Top Talent?**";
      default:
        return "Ready to **Start Your Journey?**";
    }
  };

  const getSubtitle = () => {
    if (sectionContent.subtitle) return sectionContent.subtitle;
    
    switch (visitorRole) {
      case 'school_student':
        return "Discover your ideal stream, understand eligibility requirements, and plan your path to college.";
      case 'mentor':
        return "Join our community of mentors and help shape the careers of tomorrow's professionals.";
      case 'institution':
      case 'partner':
        return "Connect with motivated students who are ready to contribute to your organization's success.";
      default:
        return "Create your personalized profile and unlock a world of career opportunities, resources, and guidance tailored just for you.";
    }
  };

  const title = getTitle();
  const subtitle = getSubtitle();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-card" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl" />

      {/* 3D Floating Elements */}
      <FloatingShapes3D count={8} />

      <div className="w-full px-4 md:px-8 lg:px-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl gradient-primary">
            <Sparkles className="w-8 h-8 text-secondary" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span dangerouslySetInnerHTML={{ 
              __html: title.replace(
                /\*\*(.*?)\*\*/g, 
                '<span class="gradient-text">$1</span>'
              )
            }} />
          </h2>

          <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>

          {/* CTA Cards - Dynamic based on role */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {ctaCards.map((card) => (
              <Link key={card.link + card.title} to={card.link} className="group">
                <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:border-primary/50 h-full">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <card.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">{card.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {card.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-primary font-medium">
                    <span>{card.cta}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};