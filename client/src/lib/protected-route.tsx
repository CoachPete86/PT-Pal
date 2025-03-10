import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: () => React.ReactElement | null;
};

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route
      path={path}
      component={() => {
        // While checking authentication status, show loading spinner
        if (isLoading) {
          return (
            <div className="h-screen w-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          );
        }

        // If user is not authenticated, redirect to login
        if (!user) {
          // Use window.location.pathname to get current location
          const returnTo = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?returnTo=${returnTo}`;
          return null;
        }

        // User is authenticated, render the component
        return <Component />;
      }}
    />
  );
}
