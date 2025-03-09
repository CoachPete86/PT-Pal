import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element | null;
}) {
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
          window.location.href = "/auth";
          return null;
        }

        // User is authenticated, render the component
        return <Component />;
      }}
    />
  );
}
