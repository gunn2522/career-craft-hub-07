import { Flame, Target, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  name: string | null;
  avatarUrl: string | null;
  aspiration: string | null;
  targetRole: string | null;
  currentStreak: number;
}

export const ProfileHeader = ({
  name,
  avatarUrl,
  aspiration,
  targetRole,
  currentStreak,
}: ProfileHeaderProps) => {
  return (
    <div className="glass-card rounded-3xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-primary/30">
          <AvatarImage src={avatarUrl || undefined} alt={name || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl">
            <User className="w-10 h-10" />
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
            {name || "Career Explorer"}
          </h1>
          
          {aspiration && (
            <p className="text-primary font-medium mb-3">{aspiration}</p>
          )}

          {targetRole && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm">
              <Target className="w-4 h-4 text-primary" />
              <span>Target: <strong>{targetRole}</strong></span>
            </div>
          )}
        </div>

        {/* Streak Counter */}
        <div className="flex flex-col items-center px-6 py-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-6 h-6 text-primary animate-pulse" />
            <span className="font-display text-3xl font-bold text-primary">
              {currentStreak}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">Day Streak</span>
        </div>
      </div>
    </div>
  );
};
