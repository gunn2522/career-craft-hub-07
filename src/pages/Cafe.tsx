import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Filter, Calendar, MapPin, Users, 
  Clock, ArrowRight, Globe, Building
} from "lucide-react";

const filters = ["All", "Online", "Offline", "Hackathon", "Workshop", "Meetup", "Craftathon"];

const events = [
  { 
    id: 1, 
    title: "AI/ML Hackathon 2024", 
    type: "Hackathon",
    mode: "Hybrid",
    date: "Dec 15-17, 2024",
    location: "IIT Delhi",
    city: "Delhi",
    attendees: 500,
    prizePool: "₹5 Lakhs"
  },
  { 
    id: 2, 
    title: "Frontend Masters Workshop", 
    type: "Workshop",
    mode: "Online",
    date: "Dec 20, 2024",
    location: "Virtual",
    city: "Online",
    attendees: 200,
    prizePool: null
  },
  { 
    id: 3, 
    title: "Startup Networking Meetup", 
    type: "Meetup",
    mode: "Offline",
    date: "Dec 22, 2024",
    location: "91springboard",
    city: "Bangalore",
    attendees: 80,
    prizePool: null
  },
  { 
    id: 4, 
    title: "Product Craftathon", 
    type: "Craftathon",
    mode: "Online",
    date: "Jan 5-7, 2025",
    location: "Virtual",
    city: "Online",
    attendees: 300,
    prizePool: "₹2 Lakhs"
  },
  { 
    id: 5, 
    title: "Cloud Computing Bootcamp", 
    type: "Workshop",
    mode: "Offline",
    date: "Jan 10, 2025",
    location: "Microsoft Office",
    city: "Hyderabad",
    attendees: 150,
    prizePool: null
  },
  { 
    id: 6, 
    title: "Design Thinking Jam", 
    type: "Workshop",
    mode: "Online",
    date: "Jan 15, 2025",
    location: "Virtual",
    city: "Online",
    attendees: 250,
    prizePool: null
  },
];

const Cafe = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                         event.city.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" || 
                         event.type === activeFilter || 
                         event.mode === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              Events & Community
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Welcome to the <span className="gradient-text">Café</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-10">
              Join events, hackathons, workshops, and connect with peers and industry experts
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events, cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 h-14 rounded-xl bg-card border-border/50 text-lg"
              />
            </div>
          </div>
        </div>
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
                      event.mode === "Online" ? "bg-green-500/10 text-green-400" :
                      event.mode === "Offline" ? "bg-blue-500/10 text-blue-400" :
                      "bg-primary/10 text-primary"
                    }`}>
                      {event.mode === "Online" ? <Globe className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                      {event.mode}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{event.location}, {event.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>

                  {event.prizePool && (
                    <div className="mt-4 p-3 rounded-xl gradient-primary">
                      <span className="text-secondary font-bold text-lg">🏆 {event.prizePool}</span>
                      <span className="text-secondary/80 text-sm ml-2">Prize Pool</span>
                    </div>
                  )}
                </div>

                {/* Event Footer */}
                <div className="p-6 pt-4 border-t border-border/50">
                  <Button variant="default" className="w-full group-hover:variant-gradient">
                    Register Now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
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