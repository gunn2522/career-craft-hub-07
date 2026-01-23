import { useState, useEffect } from "react";
import { Camera, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface EventGalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  event_date: string | null;
  is_featured: boolean;
}

export const EventGallerySection = () => {
  const [galleryItems, setGalleryItems] = useState<EventGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("event_gallery")
        .select("id, title, description, image_url, event_date, is_featured")
        .eq("is_visible", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error) {
      console.error("Error fetching event gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, galleryItems.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, galleryItems.length - 3)) % Math.max(1, galleryItems.length - 3));
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-40 mx-auto mb-4" />
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (galleryItems.length === 0) {
    return null; // Don't show section if no photos
  }

  // Get featured items for the main showcase
  const featuredItems = galleryItems.filter(item => item.is_featured);
  const displayItems = featuredItems.length > 0 ? featuredItems : galleryItems.slice(0, 6);

  return (
    <section className="py-20 bg-gradient-to-b from-background to-card/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-highlight rounded-full blur-3xl" />
      </div>

      <div className="w-full px-4 md:px-8 lg:px-16 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Camera className="w-4 h-4" />
            Our Highlights
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Event <span className="gradient-text">Gallery</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Capturing moments from our workshops, seminars, and career guidance sessions
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="relative">
          {galleryItems.length > 4 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background hidden md:flex"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background hidden md:flex"
                onClick={nextSlide}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayItems.slice(currentIndex, currentIndex + 4).map((item, index) => (
              <div
                key={item.id}
                className={`group relative rounded-xl overflow-hidden ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <div className={`relative ${index === 0 ? 'aspect-square' : 'aspect-[4/3]'}`}>
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    {item.event_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.event_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    )}
                  </div>

                  {/* Featured Badge */}
                  {item.is_featured && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md">
                      Featured
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View More Link (if more than 4 items) */}
        {galleryItems.length > 4 && (
          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: Math.ceil(galleryItems.length / 4) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i * 4)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(currentIndex / 4) === i ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
