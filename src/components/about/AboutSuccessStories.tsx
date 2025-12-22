import { useState, useEffect } from "react";
import { Quote, Star } from "lucide-react";
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

export const AboutSuccessStories = () => {
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
        .limit(6);

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
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative bg-card/30">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-40 mx-auto mb-4" />
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6">
                <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <Skeleton className="h-5 w-24" />
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
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative bg-card/30">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Success Stories</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real <span className="gradient-text">Transformations</span>
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from students who transformed their careers with Career Craft Cafe.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
              className="glass-card rounded-2xl p-6 group hover:glow-primary transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Quote className="w-6 h-6 text-primary" />
              </div>

              <p className="text-foreground/90 mb-4 leading-relaxed text-sm">
                "{story.testimonial || "An amazing experience that changed my career trajectory!"}"
              </p>

              {story.company && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                    {story.company}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <img
                  src={story.image_url || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`}
                  alt={story.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{story.name}</h4>
                  <p className="text-xs text-muted-foreground">{story.title}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-primary text-primary" />
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
