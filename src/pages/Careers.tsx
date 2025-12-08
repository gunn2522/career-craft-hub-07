import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, TrendingUp, Clock, DollarSign, ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  "All", "Technology", "Business", "Creative", "Healthcare", "Engineering", "Education", "Finance"
];

const careers = [
  { id: 1, title: "Software Developer", category: "Technology", growth: "High", salary: "₹8-25 LPA", demand: "Very High", description: "Build applications and systems using programming languages" },
  { id: 2, title: "Data Scientist", category: "Technology", growth: "Very High", salary: "₹10-30 LPA", demand: "High", description: "Analyze complex data to help organizations make better decisions" },
  { id: 3, title: "Product Manager", category: "Business", growth: "High", salary: "₹15-40 LPA", demand: "High", description: "Lead product development from conception to launch" },
  { id: 4, title: "UX Designer", category: "Creative", growth: "High", salary: "₹6-20 LPA", demand: "High", description: "Design user-friendly interfaces and experiences" },
  { id: 5, title: "Investment Banker", category: "Finance", growth: "Medium", salary: "₹12-50 LPA", demand: "Medium", description: "Help companies raise capital and manage financial transactions" },
  { id: 6, title: "Machine Learning Engineer", category: "Technology", growth: "Very High", salary: "₹12-35 LPA", demand: "Very High", description: "Build AI models and intelligent systems" },
  { id: 7, title: "Digital Marketer", category: "Business", growth: "High", salary: "₹4-15 LPA", demand: "Very High", description: "Promote brands and products through digital channels" },
  { id: 8, title: "Civil Engineer", category: "Engineering", growth: "Medium", salary: "₹5-18 LPA", demand: "Medium", description: "Design and supervise construction projects" },
];

const Careers = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || career.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              500+ Career Paths
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Explore <span className="gradient-text">Career Paths</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-10">
              Discover your perfect career with detailed insights, salary data, and growth projections
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search careers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 h-14 rounded-xl bg-card border-border/50 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Category Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Career Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCareers.map((career) => (
              <Link
                key={career.id}
                to={`/careers/${career.id}`}
                className="group"
              >
                <div className="glass-card rounded-2xl p-6 h-full transition-all duration-300 hover:scale-105 hover:border-primary/50">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  
                  <span className="text-xs font-medium text-primary">{career.category}</span>
                  <h3 className="font-display text-xl font-bold mt-2 mb-3 group-hover:text-primary transition-colors">
                    {career.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {career.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-foreground/80">{career.salary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-foreground/80">Growth: {career.growth}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-foreground/80">Demand: {career.demand}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-primary font-medium">
                    <span>Start Roadmap</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredCareers.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No careers found matching your criteria</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Careers;