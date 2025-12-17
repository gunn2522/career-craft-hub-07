import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const categories = ["All", "Career Tips", "Success Stories", "Industry Insights", "Student Life", "Events"];

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  image_url: string | null;
  read_time: string | null;
  is_featured: boolean | null;
  published_at: string | null;
  created_at: string;
}

const Blogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = activeCategory === "All" || blog.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredBlogs = filteredBlogs.filter(b => b.is_featured);
  const regularBlogs = filteredBlogs.filter(b => !b.is_featured);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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

      {/* Loading State */}
      {isLoading && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-24 mb-3" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-5">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Blogs */}
      {!isLoading && featuredBlogs.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold mb-8">Featured Articles</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.slug}`}
                  className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={blog.image_url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop"}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {blog.category || "General"}
                      </span>
                      {blog.read_time && (
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {blog.read_time}
                        </span>
                      )}
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
                        {formatDate(blog.published_at || blog.created_at)}
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
      {!isLoading && (
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold mb-8">All Articles</h2>
            
            {regularBlogs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularBlogs.map((blog) => (
                  <Link
                    key={blog.id}
                    to={`/blogs/${blog.slug}`}
                    className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={blog.image_url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop"}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {blog.category || "General"}
                        </span>
                        {blog.read_time && (
                          <span className="text-muted-foreground text-xs">{blog.read_time}</span>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {blog.excerpt}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(blog.published_at || blog.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No articles found matching your search.</p>
              </div>
            ) : null}

            {/* Load More */}
            {regularBlogs.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Articles
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Blogs;