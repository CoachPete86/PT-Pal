import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-new";
import ContentGeneratorPage from "@/pages/content-generator-page";
import SettingsPage from "@/pages/settings-page";
import WorkoutFeaturesDemo from "@/pages/workout-features-demo";
import MovementAnalysisPage from "@/pages/movement-analysis-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function Router() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <Switch>
        <Route path="/">
          {/* Auto-redirect to dashboard for development convenience */}
          {window.location.pathname === "/" &&
            (window.location.href = "/dashboard")}
          <HomePage />
        </Route>
        <Route path="/auth">
          {/* Auto-redirect to dashboard for development convenience */}
          {window.location.pathname === "/auth" &&
            (window.location.href = "/dashboard")}
          <AuthPage />
        </Route>
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute
          path="/content-generator"
          component={ContentGeneratorPage}
        />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <ProtectedRoute
          path="/workout-features"
          component={WorkoutFeaturesDemo}
        />
        <ProtectedRoute
          path="/movement-analysis"
          component={MovementAnalysisPage}
        />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
