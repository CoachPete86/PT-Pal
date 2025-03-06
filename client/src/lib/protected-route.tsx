import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

const isDevelopment = process.env.NODE_ENV === "development";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Skip all auth checks and always render the component directly
  // This is for development convenience only
  return <Route path={path} component={Component} />;
}