import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Filter, Calendar, MapPin, Users, 
  ArrowRight, Globe, Building, Coffee, ChevronDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import heroBg from "@/assets/hero-bg.jpg";

const filters = ["All", "Online", "Offline", "Hackathon", "Workshop", "Meetup", "Craftathon"];

interface Event {
  id: string;
  title: string;
  description: string | null;
  type: string;
  mode: string | null;
  date: string | null;
  location: string | null;
  max_attendees: number | null;
  current_attendees: number | null;
  prize_pool: string | null;
  registration_url: string | null;
}

const Cafe = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                         (event.location?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesFilter = activeFilter === "All" || 
                         event.type === activeFilter || 
                         event.mode === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBA";
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      {/* Hero with Image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Students at events and community gatherings"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-32 right-1/4 w-4 h-4 bg-primary rounded-full animate-float opacity-60" />
        <div className="absolute top-1/2 left-20 w-3 h-3 bg-primary rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-32 right-1/3 w-2 h-2 bg-destructive rounded-full animate-float opacity-50" style={{ animationDelay: "2s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm mb-6 animate-fade-in">
                <Coffee className="w-4 h-4" />
                Events & Community
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Welcome to the{" "}
                <span className="gradient-text">Cafe</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Join events, hackathons, workshops, and connect with peers and industry experts
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search events, cities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 h-14 rounded-xl bg-card/80 backdrop-blur-sm border-border/50 text-lg"
                />
              </div>
            </div>

            <div className="hidden lg:block" />
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight - 100, behavior: "smooth" })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          aria-label="Scroll to content"
        >
          <span className="text-sm font-medium">Discover More</span>
          <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:border-primary transition-colors">
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </button>
      </section>

      {/* Filters & Events */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6">
                  <div className="flex justify-between mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-8 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-10 w-full mt-6" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="glass-card rounded-2xl overflow-hidden group hover:border-primary/50 transition-all">
                  {/* Event Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.type === "Hackathon" ? "bg-destructive/10 text-destructive" :
                        event.type === "Workshop" ? "bg-primary/10 text-primary" :
                        event.type === "Craftathon" ? "bg-purple-500/10 text-purple-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {event.type}
                      </span>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        event.mode === "online" ? "bg-green-500/10 text-green-400" :
                        event.mode === "offline" ? "bg-blue-500/10 text-blue-400" :
                        "bg-primary/10 text-primary"
                      }`}>
                        {event.mode === "online" ? <Globe className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                        {event.mode || "Hybrid"}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{event.current_attendees || 0} attending</span>
                      </div>
                    </div>

                    {event.prize_pool && (
                      <div className="mt-4 p-3 rounded-xl gradient-primary">
                        <span className="text-secondary font-bold text-lg">🏆 {event.prize_pool}</span>
                        <span className="text-secondary/80 text-sm ml-2">Prize Pool</span>
                      </div>
                    )}
                  </div>

                  {/* Event Footer */}
                  <div className="p-6 pt-4 border-t border-border/50">
                    <Button 
                      variant="default" 
                      className="w-full"
                      asChild={!!event.registration_url}
                    >
                      {event.registration_url ? (
                        <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                          Register Now
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                      ) : (
                        <>
                          Register Now
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No events found matching your criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl p-8 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Access Exclusive <span className="gradient-text">Resources</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get access to recorded sessions, presentation slides, and exclusive learning materials from our events
            </p>
            <Button variant="gradient">
              Browse Resources
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cafe;