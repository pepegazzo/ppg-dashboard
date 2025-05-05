
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireOwner?: boolean;
}

const ProtectedRoute = ({ children, requireOwner = false }: ProtectedRouteProps) => {
  const { user, isLoading, isOwner, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check token expiration
  useEffect(() => {
    if (session && session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      // If token expires in less than 10 minutes, warn the user
      if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
        toast.warning("Your session will expire soon", {
          description: "You'll be logged out in less than 10 minutes",
          action: {
            label: "Refresh",
            onClick: () => navigate(0)
          }
        });
      }
    }
  }, [session, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireOwner && !isOwner) {
    // Redirect to homepage if owner access is required but user is not owner
    toast.error("Access denied", {
      description: "You need owner permissions to access this section"
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
