import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TorchLoader } from "@/components/ui/TorchLoader";

type AllowedRole = "admin" | "mentor" | "partner" | "user" | "institution";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AllowedRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}: ProtectedRouteProps) => {
  const { user, isLoading, userRole, isAdmin, isMentor, isPartner, isInstitution } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // Check if user is authenticated
    if (requireAuth && !user) {
      // Store the intended destination for returnTo functionality
      const returnTo = location.pathname + location.search;
      navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
      return;
    }

    // If no specific roles required, just authentication is enough
    if (allowedRoles.length === 0) return;

    // Check role authorization
    const hasRequiredRole = allowedRoles.some((role) => {
      switch (role) {
        case "admin":
          return isAdmin;
        case "mentor":
          return isMentor || isAdmin; // Admin has access to all dashboards
        case "partner":
          return isPartner || isAdmin;
        case "institution":
          return isInstitution || isAdmin;
        case "user":
          return !!user;
        default:
          return false;
      }
    });

    if (!hasRequiredRole) {
      // Redirect to 403 or home based on auth status
      navigate("/", { replace: true });
    }
  }, [user, isLoading, userRole, isAdmin, isMentor, isPartner, isInstitution, allowedRoles, requireAuth, navigate, location]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <TorchLoader size="lg" text="Verifying access..." />
      </div>
    );
  }

  // Not authenticated
  if (requireAuth && !user) {
    return null;
  }

  // Check role authorization for render
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some((role) => {
      switch (role) {
        case "admin":
          return isAdmin;
        case "mentor":
          return isMentor || isAdmin;
        case "partner":
          return isPartner || isAdmin;
        case "institution":
          return isInstitution || isAdmin;
        case "user":
          return !!user;
        default:
          return false;
      }
    });

    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
};
