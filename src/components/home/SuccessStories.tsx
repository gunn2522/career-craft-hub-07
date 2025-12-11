import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Quote, ArrowRight, Star } from "lucide-react";

const stories = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face",
    story: "Career Craft Cafe helped me discover my passion for coding. The roadmap was perfect, and I landed my dream job!",
    package: "₹32 LPA",
    from: "Tier-3 College"
  },
  {
    name: "Arjun Patel",
    role: "Product Manager at Microsoft",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    story: "From confusion to clarity - the career guidance sessions changed my perspective completely. Forever grateful!",
    package: "₹28 LPA",
    from: "Non-Tech Background"
  },
  {
    name: "Sneha Reddy",
    role: "Data Scientist at Amazon",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    story: "The structured learning path and real projects gave me the confidence to crack interviews at top companies.",
    package: "₹24 LPA",
    from: "Commerce Graduate"
  }
];

export const SuccessStories = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-card/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
              Real Transformations
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Success <span className="gradient-text">Stories</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              From students to successful professionals - hear from those who transformed their careers with us.
            </p>
          </div>
          <Button variant="outline" asChild className="self-start lg:self-auto">
            <Link to="/blogs" className="flex items-center gap-2">
              View All Stories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Stories Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <div
              key={i}
              className="group glass-card rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Quote Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Quote className="w-6 h-6 text-primary" />
              </div>

              {/* Story */}
              <p className="text-foreground/90 mb-6 leading-relaxed">
                "{story.story}"
              </p>

              {/* Stats */}
              <div className="flex gap-4 mb-6">
                <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  {story.package}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm">
                  {story.from}
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <h4 className="font-semibold">{story.name}</h4>
                  <p className="text-sm text-muted-foreground">{story.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
