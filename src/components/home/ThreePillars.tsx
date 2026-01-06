import { Link } from "react-router-dom";
import { Briefcase, Map, Coffee, ArrowRight, GraduationCap, Users, Building2 } from "lucide-react";
import { useState } from "react";
import { FloatingShapes3D } from "@/components/ui/FloatingShapes3D";
import { useRoleBasedSection } from "@/hooks/useHomepageContent";
import { useVisitorRole } from "@/hooks/useVisitorRole";

// Default pillars (fallback if no role-specific content)
const getDefaultPillars = () => [
  {
    title: "CAREER",
    subtitle: "Find the right career for you",
    description: "Explore 500+ career paths with detailed insights, salary data, and growth opportunities tailored to your interests.",
    icon: Briefcase,
    path: "/careers",
    color: "from-primary via-primary to-primary/70",
  },
  {
    title: "CRAFT",
    subtitle: "Best roadmap for you",
    description: "Follow step-by-step roadmaps, access curated resources, and build real-world projects to become job-ready.",
    icon: Map,
    path: "/craft",
    color: "from-destructive via-destructive to-primary",
  },
  {
    title: "CAFE",
    subtitle: "Best resources for it",
    description: "Join events, hackathons, workshops, and network with industry experts and like-minded peers.",
    icon: Coffee,
    path: "/cafe",
    color: "from-primary/70 via-primary to-destructive/70",
  },
];

// Role-specific pillar configurations
const getRolePillars = (role: string | null) => {
  switch (role) {
    case 'school_student':
      return [
        {
          title: "EXPLORE",
          subtitle: "Discover what's after 12th",
          description: "Explore streams, degrees, and career paths based on your interests and eligibility.",
          icon: GraduationCap,
          path: "/careers",
          color: "from-primary via-primary to-primary/70",
        },
        {
          title: "PLAN",
          subtitle: "Choose your degree path",
          description: "Understand entrance exams, eligibility criteria, and the best colleges for your chosen stream.",
          icon: Map,
          path: "/craft",
          color: "from-destructive via-destructive to-primary",
        },
        {
          title: "PREPARE",
          subtitle: "Get ready for college",
          description: "Access resources, guidance sessions, and connect with mentors to prepare for your future.",
          icon: Coffee,
          path: "/cafe",
          color: "from-primary/70 via-primary to-destructive/70",
        },
      ];
    case 'mentor':
      return [
        {
          title: "MENTOR",
          subtitle: "Guide the next generation",
          description: "Share your expertise and help students navigate their career journeys with confidence.",
          icon: Users,
          path: "/auth",
          color: "from-primary via-primary to-primary/70",
        },
        {
          title: "CREATE",
          subtitle: "Build your personal brand",
          description: "Create content, host sessions, and establish yourself as a thought leader in your field.",
          icon: Map,
          path: "/craft",
          color: "from-destructive via-destructive to-primary",
        },
        {
          title: "CONNECT",
          subtitle: "Expand your network",
          description: "Connect with other mentors, institutions, and industry partners to grow your impact.",
          icon: Coffee,
          path: "/cafe",
          color: "from-primary/70 via-primary to-destructive/70",
        },
      ];
    case 'institution':
    case 'partner':
      return [
        {
          title: "PARTNER",
          subtitle: "Join our ecosystem",
          description: "Connect with talented students, showcase opportunities, and build your employer brand.",
          icon: Building2,
          path: "/partner",
          color: "from-primary via-primary to-primary/70",
        },
        {
          title: "RECRUIT",
          subtitle: "Find the right talent",
          description: "Access a pool of skilled, career-ready candidates who match your requirements.",
          icon: Users,
          path: "/careers",
          color: "from-destructive via-destructive to-primary",
        },
        {
          title: "ENGAGE",
          subtitle: "Host events & workshops",
          description: "Conduct hiring drives, webinars, and workshops to connect with future employees.",
          icon: Coffee,
          path: "/cafe",
          color: "from-primary/70 via-primary to-destructive/70",
        },
      ];
    default:
      return getDefaultPillars();
  }
};

export const ThreePillars = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { visitorRole } = useVisitorRole();
  const sectionContent = useRoleBasedSection('three_pillars');

  const pillars = getRolePillars(visitorRole);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-destructive rounded-full blur-3xl" />
      </div>

      {/* 3D Floating Elements */}
      <FloatingShapes3D count={10} />

      <div className="w-full px-4 md:px-8 lg:px-16 relative z-10">
        {/* Section Header - Dynamic from database */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            Your Journey Starts Here
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {sectionContent.title ? (
              <span dangerouslySetInnerHTML={{ 
                __html: sectionContent.title.replace(
                  /\*\*(.*?)\*\*/g, 
                  '<span class="gradient-text">$1</span>'
                )
              }} />
            ) : (
              <>Three Pillars to <span className="gradient-text">Success</span></>
            )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {sectionContent.subtitle || 'A complete ecosystem designed to guide you from exploration to expertise'}
          </p>
        </div>

        {/* Circular Pillars */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {pillars.map((pillar, i) => (
            <Link
              key={pillar.title}
              to={pillar.path}
              className="group relative"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Main Circle */}
              <div
                className={`relative w-64 h-64 md:w-72 md:h-72 rounded-full flex flex-col items-center justify-center text-center p-8 transition-all duration-500 cursor-pointer ${
                  hoveredIndex === i ? "scale-110" : hoveredIndex !== null ? "scale-95 opacity-60" : ""
                }`}
              >
                {/* Gradient Border */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${pillar.color} p-[3px]`}>
                  <div className="w-full h-full rounded-full bg-background" />
                </div>

                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <pillar.icon className="w-8 h-8 text-secondary" />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {pillar.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm text-muted-foreground leading-tight">
                    {pillar.subtitle}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/0 group-hover:border-primary/30 group-hover:scale-110 transition-all duration-500" />
              </div>

              {/* Description Card (shows on hover) */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                <div className="glass-card rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Connecting Lines (Desktop only) */}
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl -z-10">
          <svg className="w-full h-24 opacity-20" viewBox="0 0 800 100">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="50%" stopColor="hsl(var(--destructive))" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
              </linearGradient>
            </defs>
            <path
              d="M100,50 Q250,20 400,50 Q550,80 700,50"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              strokeDasharray="10,5"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};