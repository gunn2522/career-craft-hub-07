import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useVisitorRoles } from '@/hooks/useHomepageContent';
import { useVisitorRole, VisitorRoleType } from '@/hooks/useVisitorRole';
import { GraduationCap, BookOpen, Users, Building2, Briefcase, Loader2, School, UserCheck } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  BookOpen,
  Users,
  Building2,
  Briefcase,
  School,
  UserCheck,
};

export const RoleSelectionPopup = () => {
  const { hasVisited, setVisitorRole } = useVisitorRole();
  const { data: roles, isLoading } = useVisitorRoles();
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  useEffect(() => {
    // Show popup immediately on first visit - MANDATORY role selection
    if (!hasVisited) {
      setOpen(true);
    }
  }, [hasVisited]);

  const handleRoleSelect = (roleName: string, roleId: string) => {
    setSelectedRole(roleName);
    setSelectedRoleId(roleId);
  };

  const handleContinue = () => {
    if (selectedRole && selectedRoleId) {
      setVisitorRole(selectedRole as VisitorRoleType, selectedRoleId);
      setOpen(false);
    }
  };

  // Remove skip option - role selection is MANDATORY
  // Users must select a role to proceed

  if (hasVisited) return null;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Prevent closing without selection - role is MANDATORY
        if (!isOpen && !hasVisited) {
          return; // Don't close
        }
        setOpen(isOpen);
      }}
    >
      <DialogContent 
        className="sm:max-w-lg md:max-w-2xl"
        onInteractOutside={(e) => {
          // Prevent closing on outside click - role is MANDATORY
          if (!hasVisited) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing on escape - role is MANDATORY
          if (!hasVisited) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">Welcome to Career Craft Cafe! ☕</DialogTitle>
          <DialogDescription className="text-base">
            Tell us who you are so we can personalize your experience
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
                  onClick={() => handleRoleSelect(role.name, role.id)}
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
            className="w-full"
            onClick={handleContinue}
            disabled={!selectedRole}
          >
            {selectedRole ? 'Continue' : 'Select a role to continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};