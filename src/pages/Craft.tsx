import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  BookOpen, Code, Target, Trophy, Users, ArrowRight, 
  CheckCircle, Lock, Star, Clock, Zap, ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
const roadmaps = [
  { 
    id: 1, 
    title: "Full Stack Development", 
    duration: "6 months",
    progress: 45,
    students: 2500,
    steps: 24,
    completed: 11,
    level: "Intermediate"
  },
  { 
    id: 2, 
    title: "Data Science & ML", 
    duration: "8 months",
    progress: 0,
    students: 1800,
    steps: 32,
    completed: 0,
    level: "Advanced"
  },
  { 
    id: 3, 
    title: "UI/UX Design", 
    duration: "4 months",
    progress: 80,
    students: 1200,
    steps: 18,
    completed: 14,
    level: "Beginner"
  },
];

const currentRoadmap = {
  title: "Full Stack Development",
  modules: [
    { name: "HTML & CSS Fundamentals", completed: true },
    { name: "JavaScript Essentials", completed: true },
    { name: "React Basics", completed: true },
    { name: "React Advanced", completed: false },
    { name: "Node.js & Express", completed: false },
    { name: "Database Design", completed: false, locked: true },
    { name: "Build Full Project", completed: false, locked: true },
  ]
};

const Craft = () => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: true
  });

  return (
    <Layout>
      {/* Hero with Image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Students learning and crafting skills"
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
                <BookOpen className="w-4 h-4" />
                Your Learning Journey
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Craft Your{" "}
                <span className="gradient-text">Skills</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Follow structured roadmaps, access curated resources, and build real-world projects to become internship-ready
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Button variant="hero" size="xl" asChild>
                  <a href="#roadmaps" className="group">
                    <Target className="w-5 h-5" />
                    Explore Roadmaps
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
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

      {/* Stats */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, value: "50+", label: "Roadmaps" },
              { icon: Code, value: "200+", label: "Projects" },
              { icon: Users, value: "10K+", label: "Learners" },
              { icon: Trophy, value: "95%", label: "Success Rate" },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="font-display text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Roadmaps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">Your Roadmaps</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {roadmaps.map((roadmap) => (
              <div key={roadmap.id} className="glass-card rounded-2xl p-6 hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {roadmap.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {roadmap.duration}
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold mb-3">{roadmap.title}</h3>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{roadmap.completed}/{roadmap.steps} steps</span>
                    <span className="text-primary font-medium">{roadmap.progress}%</span>
                  </div>
                  <Progress value={roadmap.progress} className="h-2" />
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {roadmap.students.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-primary" />
                    4.8
                  </div>
                </div>

                <Button variant={roadmap.progress > 0 ? "default" : "outline"} className="w-full" asChild>
                  <Link to={`/craft/${roadmap.id}`}>
                    {roadmap.progress > 0 ? "Continue" : "Start"} Learning
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          {/* Current Progress */}
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold">Current Progress: {currentRoadmap.title}</h3>
              <Button variant="gradient" size="sm">
                <Zap className="w-4 h-4" />
                Unlock Internship
              </Button>
            </div>

            <div className="space-y-4">
              {currentRoadmap.modules.map((module, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    module.locked 
                      ? "bg-muted/30 opacity-50" 
                      : module.completed 
                        ? "bg-primary/5" 
                        : "bg-card hover:bg-muted/50"
                  }`}
                >
                  {module.locked ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Checkbox 
                      checked={checkedItems[i]} 
                      onCheckedChange={(checked) => setCheckedItems({...checkedItems, [i]: !!checked})}
                    />
                  )}
                  <span className={module.completed ? "text-foreground/80" : "text-foreground"}>
                    {module.name}
                  </span>
                  {module.completed && (
                    <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Craft;