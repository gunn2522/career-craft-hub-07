import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Search, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const categories = ["All", "Career Tips", "Success Stories", "Industry Insights", "Student Life", "Events"];

const blogs = [
  {
    id: 1,
    title: "10 High-Demand Careers in 2025 You Should Consider",
    excerpt: "Discover the most promising career paths that offer growth, stability, and fulfillment in the evolving job market.",
    category: "Career Tips",
    author: "Rahul Sharma",
    date: "Dec 5, 2024",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop",
    featured: true
  },
  {
    id: 2,
    title: "From College to ₹15 LPA: Priya's Journey with Career Craft Café",
    excerpt: "How a small-town girl transformed her career trajectory using our roadmaps and mentorship programs.",
    category: "Success Stories",
    author: "Career Craft Team",
    date: "Dec 3, 2024",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=500&fit=crop",
    featured: true
  },
  {
    id: 3,
    title: "How to Build a Portfolio That Gets You Hired",
    excerpt: "A step-by-step guide to creating an impressive portfolio that showcases your skills to recruiters.",
    category: "Career Tips",
    author: "Amit Patel",
    date: "Dec 1, 2024",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
    featured: false
  },
  {
    id: 4,
    title: "The Rise of AI in Campus Placements: What Students Need to Know",
    excerpt: "Understanding how AI is reshaping recruitment and how you can prepare for AI-driven interviews.",
    category: "Industry Insights",
    author: "Dr. Neha Gupta",
    date: "Nov 28, 2024",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
    featured: false
  },
  {
    id: 5,
    title: "Campus Ambassador Spotlight: Leading Change at IIT Delhi",
    excerpt: "Meet Arjun, our campus ambassador who organized 5 hackathons and helped 200+ students get internships.",
    category: "Success Stories",
    author: "Career Craft Team",
    date: "Nov 25, 2024",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=500&fit=crop",
    featured: false
  },
  {
    id: 6,
    title: "Hackathon 101: Tips to Win Your First Competition",
    excerpt: "Everything you need to know about participating in hackathons and making the most of the experience.",
    category: "Events",
    author: "Vikram Singh",
    date: "Nov 22, 2024",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=500&fit=crop",
    featured: false
  }
];

const Blogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || blog.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredBlogs = filteredBlogs.filter(b => b.featured);
  const regularBlogs = filteredBlogs.filter(b => !b.featured);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Career Insights & <span className="gradient-text">Success Stories</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8">
              Expert advice, student success stories, and industry insights to fuel your career journey.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="pl-12 h-14 text-lg rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-primary/10 text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold mb-8">Featured Articles</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.id}`}
                  className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {blog.category}
                      </span>
                      <span className="text-muted-foreground text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {blog.readTime}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {blog.date}
                      </span>
                      <span className="text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Blogs Grid */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold mb-8">All Articles</h2>
          
          {regularBlogs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.id}`}
                  className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {blog.category}
                      </span>
                      <span className="text-muted-foreground text-xs">{blog.readTime}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {blog.excerpt}
                    </p>
                    <span className="text-sm text-muted-foreground">{blog.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found matching your search.</p>
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blogs;
