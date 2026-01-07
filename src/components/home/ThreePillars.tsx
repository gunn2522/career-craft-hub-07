import { Link } from "react-router-dom";
import { Briefcase, Map, Coffee, ArrowRight } from "lucide-react";
import { useState } from "react";
import { FloatingShapes3D } from "@/components/ui/FloatingShapes3D";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// FIXED PILLARS - Career, Craft, Cafe (structure is immutable)
// Only descriptions, icons, and CTAs are admin-editable via database
interface PillarConfig {
  id: string;
  title: string; // LOCKED: Career, Craft, Cafe
  subtitle: string;
  description: string;
  icon_name: string;
  path: string;
  color: string;
}

const defaultPillars: PillarConfig[] = [
  {
    id: "career",
    title: "CAREER",
    subtitle: "Find the right career for you",
    description: "Explore 500+ career paths with detailed insights, salary data, and growth opportunities tailored to your interests.",
    icon_name: "Briefcase",
    path: "/careers",
    color: "from-primary via-primary to-primary/70",
  },
  {
    id: "craft",
    title: "CRAFT",
    subtitle: "Best roadmap for you",
    description: "Follow step-by-step roadmaps, access curated resources, and build real-world projects to become job-ready.",
    icon_name: "Map",
    path: "/craft",
    color: "from-destructive via-destructive to-primary",
  },
  {
    id: "cafe",
    title: "CAFE",
    subtitle: "Best resources for it",
    description: "Join events, hackathons, workshops, and network with industry experts and like-minded peers.",
    icon_name: "Coffee",
    path: "/cafe",
    color: "from-primary/70 via-primary to-destructive/70",
  },
];

const iconMap: Record<string, React.ElementType> = {
  Briefcase,
  Map,
  Coffee,
};

export const ThreePillars = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch pillar configuration from database (admin-editable content only)
  const { data: pillarContent } = useQuery({
    queryKey: ['three-pillars-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('content')
        .eq('section_key', 'three_pillars')
        .single();
      if (error) return null;
      return data?.content as Record<string, { subtitle?: string; description?: string; cta_link?: string }> | null;
    },
  });

  // Merge default pillars with admin-configured content
  const pillars = defaultPillars.map(pillar => {
    const content = pillarContent?.[pillar.id];
    return {
      ...pillar,
      subtitle: content?.subtitle || pillar.subtitle,
      description: content?.description || pillar.description,
      path: content?.cta_link || pillar.path,
    };
  });

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Briefcase;
  };

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
        {/* Section Header - FIXED Title, only subtitle is dynamic */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            Your Journey Starts Here
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Three Pillars to <span className="gradient-text">Success</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A complete ecosystem designed to guide you from exploration to expertise
          </p>
        </div>

        {/* Circular Pillars - FIXED ORDER: Career → Craft → Cafe */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {pillars.map((pillar, i) => {
            const IconComponent = getIcon(pillar.icon_name);
            return (
              <Link
                key={pillar.id}
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
                      <IconComponent className="w-8 h-8 text-secondary" />
                    </div>

                    {/* Title - LOCKED */}
                    <h3 className="font-display text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {pillar.title}
                    </h3>

                    {/* Subtitle - Admin Editable */}
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

                {/* Description Card (shows on hover) - Admin Editable */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                  <div className="glass-card rounded-xl p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
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