import { Layout } from "@/components/layout/Layout";
import { TorchElements3D } from "@/components/ui/TorchElements3D";
import { AboutSuccessStories } from "@/components/about/AboutSuccessStories";
import { 
  Target, 
  Users, 
  GraduationCap, 
  Briefcase, 
  TrendingUp, 
  Heart, 
  Lightbulb,
  Rocket,
  Building2,
  HandshakeIcon,
  Zap,
  Award,
  BookOpen,
  DollarSign,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import aboutHeroBg from "@/assets/about-hero-bg.jpg";

const About = () => {
  const stats = [
    { value: "5000+", label: "Students Empowered" },
    { value: "100+", label: "Partner Companies" },
    { value: "500+", label: "Dream Placements" },
    { value: "50+", label: "Programs Offered" },
  ];

  const services = [
    {
      icon: GraduationCap,
      title: "For School Students",
      description: "Guiding young minds towards their dream colleges with personalized counseling, entrance exam preparation, and career clarity programs.",
      features: ["College Counseling", "Career Aptitude Tests", "Entrance Exam Prep", "Scholarship Guidance"]
    },
    {
      icon: Briefcase,
      title: "For College Students",
      description: "Preparing students to land dream jobs with industry-ready skills, internship opportunities, and placement preparation.",
      features: ["Job Placement Support", "Resume Building", "Interview Training", "Soft Skills Development"]
    },
    {
      icon: TrendingUp,
      title: "Side Hustles & Freelancing",
      description: "Teaching students to build additional income streams while studying through freelancing, content creation, and entrepreneurship.",
      features: ["Freelance Training", "Digital Marketing", "Content Creation", "Personal Branding"]
    },
    {
      icon: DollarSign,
      title: "Financial Independence",
      description: "Comprehensive programs to help students become financially literate and independent before graduation.",
      features: ["Investment Basics", "Budget Management", "Passive Income", "Money Mindset"]
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Bridge the Gap",
      description: "We connect academia with industry requirements, ensuring students are job-ready from day one."
    },
    {
      icon: Heart,
      title: "Student-First Approach",
      description: "Every program is designed keeping student success at the core of everything we do."
    },
    {
      icon: Lightbulb,
      title: "Innovation in Learning",
      description: "We use cutting-edge methods and real-world projects to make learning practical and impactful."
    },
    {
      icon: Rocket,
      title: "Career Acceleration",
      description: "Our goal is to fast-track your career growth with industry connections and mentorship."
    }
  ];

  const team = [
    {
      role: "Industry Mentors",
      description: "Professionals from top companies guiding our students"
    },
    {
      role: "Career Counselors",
      description: "Experienced educators helping students find their path"
    },
    {
      role: "Placement Officers",
      description: "Dedicated team connecting students with opportunities"
    }
  ];

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: "smooth" });
  };

  return (
    <Layout>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={aboutHeroBg}
            alt="Career Craft Cafe team collaborating"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/60" />
          {/* Subtle animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" style={{ animationDuration: '6s' }} />
        </div>

        <TorchElements3D count={15} />
        
        {/* Reduced and Subtle Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-1/2 right-1/3 w-[250px] h-[250px] bg-primary/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '7s' }} />
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-20">
          {/* Hero Content Grid - Left aligned text with stats on right */}
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              {/* Animated Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card mb-6 animate-fade-in border border-primary/20 backdrop-blur-xl">
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-primary tracking-wide">About Career Craft Cafe</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <span className="block text-foreground">Bridging the Gap</span>
                <span className="block mt-2">
                  <span className="gradient-text">Academia</span>
                  <span className="text-primary mx-2 md:mx-3">↔</span>
                  <span className="gradient-text">Industry</span>
                </span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-8 animate-fade-in max-w-xl" style={{ animationDelay: "0.2s" }}>
                We empower <span className="text-primary font-semibold">school</span> and <span className="text-primary font-semibold">college students</span> with the skills, guidance, and opportunities 
                they need to land their <span className="gradient-text font-semibold">dream colleges</span>, <span className="gradient-text font-semibold">dream jobs</span>, and achieve financial independence.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Button variant="hero" size="lg" asChild className="shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-shadow">
                  <Link to="/careers">Explore Career Paths</Link>
                </Button>
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/partner">Partner With Us</Link>
                </Button>
              </div>
            </div>

            {/* Right Stats Grid */}
            <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="glass-card p-5 md:p-6 rounded-2xl text-center group hover:glow-primary transition-all duration-500 hover:scale-105 border border-primary/15"
                >
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group z-20"
          aria-label="Scroll to content"
        >
          <span className="text-sm font-medium">Discover Our Story</span>
          <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </div>
        </button>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Our Mission</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Preparing Students for the{" "}
                <span className="gradient-text">Real World</span>
              </h2>
              
              <p className="text-muted-foreground mb-6 text-lg">
                At Career Craft Cafe, we believe that education shouldn't end at textbooks. 
                The real challenge begins when students step out of classrooms and face the competitive world.
              </p>
              
              <p className="text-muted-foreground mb-8">
                We're here to bridge that gap — equipping students with industry-relevant skills, 
                real-world experience, and the confidence to pursue high-paying careers. From helping 
                school students land their dream colleges to preparing college students for their dream jobs, 
                internships, and side hustles — we're with you every step of the way.
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full gradient-primary border-2 border-background flex items-center justify-center text-sm font-bold"
                    >
                      {["M", "S", "A", "R"][i]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">Trusted by 5000+ students</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-destructive/20 rounded-full blur-2xl" />
                
                <div className="relative z-10 space-y-6">
                  {[
                    { icon: Building2, text: "Industry Partnerships", count: "100+" },
                    { icon: HandshakeIcon, text: "Placement Success Rate", count: "85%" },
                    { icon: Award, text: "Programs Completed", count: "200+" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-background" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.text}</div>
                        <div className="text-2xl font-bold gradient-text">{item.count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative bg-card/30">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">What We Offer</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive <span className="gradient-text">Career Solutions</span>
            </h2>
            
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From college admissions to job placements, we cover every aspect of your career journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className="glass-card p-8 rounded-2xl group hover:glow-primary transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <service.icon className="w-7 h-7 text-background" />
                </div>
                
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, fIndex) => (
                    <span 
                      key={fIndex}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Values</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What <span className="gradient-text">Drives Us</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="glass-card p-6 rounded-2xl text-center group hover:glow-primary transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <value.icon className="w-6 h-6 text-background" />
                </div>
                
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative bg-card/30">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="glass-card p-8 rounded-3xl">
                <h3 className="text-2xl font-bold mb-6">Why Students Choose Us</h3>
                
                <div className="space-y-4">
                  {[
                    { title: "Industry-Relevant Curriculum", desc: "Courses designed with input from top companies" },
                    { title: "Hands-On Experience", desc: "Real projects and internships, not just theory" },
                    { title: "Personalized Mentorship", desc: "1-on-1 guidance from industry professionals" },
                    { title: "Placement Guarantee", desc: "Strong track record of successful placements" },
                    { title: "Affordable Programs", desc: "Quality education accessible to everyone" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors">
                      <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-background">✓</span>
                      </div>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">The CCC Advantage</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                From Confusion to{" "}
                <span className="gradient-text">Career Clarity</span>
              </h2>
              
              <p className="text-muted-foreground mb-4">
                Most students graduate without knowing what they want to do or how to do it. 
                The gap between what colleges teach and what industries need is massive.
              </p>
              
              <p className="text-muted-foreground mb-8">
                We fill this gap with practical training, industry exposure, and career guidance 
                that transforms confused students into confident professionals ready for high-paying jobs.
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                {team.map((member, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 rounded-full gradient-primary mx-auto mb-2 flex items-center justify-center">
                      <Users className="w-6 h-6 text-background" />
                    </div>
                    <div className="text-sm font-medium">{member.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <AboutSuccessStories />

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your{" "}
                <span className="gradient-text">Career Journey?</span>
              </h2>
              
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of students who have transformed their careers with Career Craft Cafe. 
                Your dream job is just a step away.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/auth">Get Started Today</Link>
                </Button>
                <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10" asChild>
                  <Link to="/ambassador">Become a Crafter</Link>
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-6">
                Questions? Reach us at <span className="text-primary">9988066050</span> | Ludhiana, Punjab
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
