import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useVisitorRoles } from '@/hooks/useHomepageContent';
import { useVisitorRole, VisitorRoleType } from '@/hooks/useVisitorRole';
import { GraduationCap, BookOpen, Users, Building2, Briefcase, Loader2 } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  BookOpen,
  Users,
  Building2,
  Briefcase,
};

export const RoleSelectionPopup = () => {
  const { hasVisited, setVisitorRole } = useVisitorRole();
  const { data: roles, isLoading } = useVisitorRoles();
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    // Show popup on first visit (after a short delay for better UX)
    if (!hasVisited) {
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasVisited]);

  const handleRoleSelect = (roleName: string) => {
    setSelectedRole(roleName);
  };

  const handleContinue = () => {
    if (selectedRole) {
      setVisitorRole(selectedRole as VisitorRoleType);
      setOpen(false);
    }
  };

  const handleSkip = () => {
    setVisitorRole('college_student'); // Default role
    setOpen(false);
  };

  if (hasVisited) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">Who are you?</DialogTitle>
          <DialogDescription className="text-base">
            Help us personalize your experience by telling us about yourself
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
            {roles?.map((role) => {
              const IconComponent = iconMap[role.icon || 'Users'] || Users;
              const isSelected = selectedRole === role.name;

              return (
                <Card
                  key={role.id}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleRoleSelect(role.name)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{role.display_name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSkip}
          >
            Skip for now
          </Button>
          <Button
            className="flex-1"
            onClick={handleContinue}
            disabled={!selectedRole}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
