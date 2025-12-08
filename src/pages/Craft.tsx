import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  BookOpen, Code, Target, Trophy, Users, ArrowRight, 
  CheckCircle, Lock, Star, Clock, Zap
} from "lucide-react";
import { Link } from "react-router-dom";

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
      {/* Hero */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              Your Learning Journey
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Craft Your <span className="gradient-text">Skills</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-10">
              Follow structured roadmaps, access curated resources, and build real-world projects to become internship-ready
            </p>
          </div>
        </div>
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