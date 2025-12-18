import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Quote, ArrowRight, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface SuccessStory {
  id: string;
  name: string;
  title: string;
  company: string | null;
  testimonial: string | null;
  image_url: string | null;
}

export const SuccessStories = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .limit(3);

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error("Error fetching success stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-24 relative overflow-hidden bg-card/30">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <Skeleton className="h-8 w-40 mb-4" />
              <Skeleton className="h-12 w-64 mb-4" />
              <Skeleton className="h-6 w-96" />
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-8">
                <Skeleton className="w-12 h-12 rounded-xl mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <div className="flex gap-4 mb-6">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="py-24 relative overflow-hidden bg-card/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="w-full px-4 md:px-8 lg:px-16 relative z-10">
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
          {stories.map((story) => (
            <div
              key={story.id}
              className="group glass-card rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Quote Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Quote className="w-6 h-6 text-primary" />
              </div>

              {/* Story */}
              <p className="text-foreground/90 mb-6 leading-relaxed">
                "{story.testimonial || "An amazing experience that changed my career trajectory!"}"
              </p>

              {/* Stats */}
              <div className="flex gap-4 mb-6">
                <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  {story.title}
                </div>
                {story.company && (
                  <div className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm">
                    {story.company}
                  </div>
                )}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                <img
                  src={story.image_url || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face"}
                  alt={story.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <h4 className="font-semibold">{story.name}</h4>
                  <p className="text-sm text-muted-foreground">{story.title}</p>
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