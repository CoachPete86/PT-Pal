import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // While checking authentication status, show loading spinner
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    // Use window.location.pathname to get current location
    const returnTo = encodeURIComponent(window.location.pathname);
    window.location.href = `/auth?returnTo=${returnTo}`;
    return null;
  }

  // User is authenticated, render the children
  return <>{children}</>;
}
