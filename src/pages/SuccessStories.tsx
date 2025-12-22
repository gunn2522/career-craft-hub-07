import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Quote, Star, ArrowRight, GraduationCap, School, Building } from "lucide-react";

// Import student images
import student1 from "@/assets/student-1.jpg";
import student2 from "@/assets/student-2.jpg";
import student3 from "@/assets/student-3.jpg";
import student4 from "@/assets/student-4.jpg";
import student5 from "@/assets/student-5.jpg";
import student6 from "@/assets/student-6.jpg";
import student7 from "@/assets/student-7.jpg";
import student8 from "@/assets/student-8.jpg";
import heroBg from "@/assets/success-stories-hero.jpg";

interface Testimonial {
  id: number;
  name: string;
  institution: string;
  institutionType: "school" | "college";
  testimonial: string;
  image: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Arjun Sharma",
    institution: "IIT Delhi",
    institutionType: "college",
    testimonial: "Career Craft Café completely transformed my approach to internships. The skills I learned here helped me crack my dream internship at a top tech company. The mentorship was invaluable!",
    image: student1,
    rating: 5,
  },
  {
    id: 2,
    name: "Priya Patel",
    institution: "Delhi Public School, R.K. Puram",
    institutionType: "school",
    testimonial: "As a Class 12 student, I was confused about my career path. The counselors here helped me discover my passion and I'm now pursuing my dream of getting into a top engineering college!",
    image: student2,
    rating: 5,
  },
  {
    id: 3,
    name: "Rahul Verma",
    institution: "Kendriya Vidyalaya, Dwarka",
    institutionType: "school",
    testimonial: "The workshops on soft skills and communication were game-changers. I went from being shy to confidently presenting in front of 100+ students. Thank you, Career Craft Café!",
    image: student3,
    rating: 5,
  },
  {
    id: 4,
    name: "Sneha Reddy",
    institution: "BITS Pilani",
    institutionType: "college",
    testimonial: "The side hustle program helped me start earning while still in college. I learned freelancing, digital marketing, and now I'm financially independent. Best investment of my time!",
    image: student4,
    rating: 5,
  },
  {
    id: 5,
    name: "Vikram Singh",
    institution: "NIT Warangal",
    institutionType: "college",
    testimonial: "The resume building and interview prep sessions were incredible. I landed 3 job offers before even graduating! The practical approach to career preparation is unmatched.",
    image: student5,
    rating: 5,
  },
  {
    id: 6,
    name: "Ananya Gupta",
    institution: "Modern School, Barakhamba",
    institutionType: "school",
    testimonial: "I was struggling with board exam stress and career confusion. The holistic approach here helped me manage both and I scored 95%+ while being clear about my future path!",
    image: student6,
    rating: 5,
  },
  {
    id: 7,
    name: "Karthik Iyer",
    institution: "VIT Vellore",
    institutionType: "college",
    testimonial: "From having zero industry knowledge to bagging an internship at a Fortune 500 company - Career Craft Café bridged that gap for me. The industry exposure was phenomenal!",
    image: student7,
    rating: 5,
  },
  {
    id: 8,
    name: "Meera Krishnan",
    institution: "Symbiosis Institute, Pune",
    institutionType: "college",
    testimonial: "The financial literacy and entrepreneurship modules opened my eyes to possibilities I never knew existed. I started my own small business while still in my final year!",
    image: student8,
    rating: 5,
  },
];

const SuccessStories = () => {
  const [filter, setFilter] = useState<"all" | "school" | "college">("all");

  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === "all") return true;
    return t.institutionType === filter;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 py-20">
          <span className="inline-block px-6 py-2 rounded-full bg-primary/20 text-primary font-semibold text-sm mb-6 backdrop-blur-sm border border-primary/30">
            Real Transformations
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Success <span className="gradient-text">Stories</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Hear from students who transformed their careers and achieved their dreams with Career Craft Café
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">500+</div>
              <div className="text-muted-foreground">Students Placed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">50+</div>
              <div className="text-muted-foreground">Partner Institutions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">98%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-card/30">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              All Stories
            </Button>
            <Button
              variant={filter === "school" ? "default" : "outline"}
              onClick={() => setFilter("school")}
              className="flex items-center gap-2"
            >
              <School className="w-4 h-4" />
              School Students
            </Button>
            <Button
              variant={filter === "college" ? "default" : "outline"}
              onClick={() => setFilter("college")}
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              College Students
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>

        <div className="w-full px-4 md:px-8 lg:px-16 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="group glass-card rounded-2xl p-8 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] hover:glow-primary animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Quote Icon */}
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Quote className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Testimonial */}
                <p className="text-foreground/90 mb-6 leading-relaxed text-lg italic">
                  "{testimonial.testimonial}"
                </p>

                {/* Institution Badge */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                    {testimonial.institutionType === "school" ? (
                      <School className="w-4 h-4" />
                    ) : (
                      <Building className="w-4 h-4" />
                    )}
                    {testimonial.institution}
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                  <div className="relative">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/30 group-hover:border-primary transition-colors duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Star className="w-3 h-3 fill-primary-foreground text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.institutionType === "school" ? "School Student" : "College Student"}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="w-full px-4 md:px-8 lg:px-16 relative z-10">
          <div className="glass-card rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Write Your <span className="gradient-text">Success Story</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of students who have transformed their careers with Career Craft Café. Your journey to success starts here.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gradient-primary text-primary-foreground" asChild>
                <Link to="/signup" className="flex items-center gap-2">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SuccessStories;
