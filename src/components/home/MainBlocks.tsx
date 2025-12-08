import { Link } from "react-router-dom";
import { Briefcase, Map, Coffee, ArrowRight } from "lucide-react";

const blocks = [
  {
    title: "CAREER",
    description: "Explore & choose your ideal career path from 500+ options with detailed insights and salary data.",
    icon: Briefcase,
    path: "/careers",
    gradient: "from-primary to-primary/70",
  },
  {
    title: "CRAFT",
    description: "Follow step-by-step roadmaps, access curated resources, and build real-world projects.",
    icon: Map,
    path: "/craft",
    gradient: "from-destructive to-primary",
  },
  {
    title: "CAFÉ",
    description: "Join events, hackathons, workshops, and network with industry experts and peers.",
    icon: Coffee,
    path: "/cafe",
    gradient: "from-primary/70 to-destructive/70",
  },
];

export const MainBlocks = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            Your Journey Starts Here
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Three Pillars to <span className="gradient-text">Success</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete ecosystem designed to guide you from exploration to expertise
          </p>
        </div>

        {/* Blocks Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {blocks.map((block, i) => (
            <Link
              key={block.title}
              to={block.path}
              className="group relative"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="glass-card rounded-2xl p-8 h-full transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-primary/50">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${block.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <block.icon className="w-8 h-8 text-secondary" />
                </div>

                {/* Content */}
                <h3 className="font-display text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {block.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {block.description}
                </p>

                {/* Arrow */}
                <div className="flex items-center gap-2 text-primary font-medium">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                </div>

                {/* Hover Glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${block.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10`} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};