import { 
  LayoutDashboard, 
  User, 
  Users, 
  MessageCircle, 
  Folder, 
  Target,
  Trophy,
  ClipboardList,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CareerLabNavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "daily-tasks", label: "Daily Tasks", icon: ClipboardList },
  { id: "roadmap", label: "Roadmap", icon: Target },
  { id: "network", label: "My Network", icon: Users },
  { id: "chat", label: "Messages", icon: MessageCircle },
  { id: "ai-assistant", label: "AI Assistant", icon: Bot },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "badges", label: "Achievements", icon: Trophy },
  { id: "profile", label: "Profile", icon: User },
];

export const CareerLabNavbar = ({ activeSection, onSectionChange }: CareerLabNavbarProps) => {
  return (
    <div className="w-full">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-2 p-2 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm whitespace-nowrap",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Navigation - Scrollable */}
      <ScrollArea className="md:hidden w-full">
        <nav className="flex items-center gap-2 p-2 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm whitespace-nowrap flex-shrink-0",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};