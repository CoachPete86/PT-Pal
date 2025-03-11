import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Direct import for ProtectedRoute to fix TypeScript errors
import ProtectedRoute from "./lib/protected-route";

// Lazy load components
const HomePage = lazy(() => import("@/pages/home-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-new")); //Corrected import path
const AuthPage = lazy(() => import("@/pages/auth-page"));
const LoginTest = lazy(() => import("@/pages/login-test"));
const NotFound = lazy(() => import("@/pages/not-found"));
const WorkoutFeaturesDemo = lazy(() => import("@/pages/workout-features-demo"));
const ContentGeneratorPage = lazy(() => import("@/pages/content-generator-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
const MovementAnalysisPage = lazy(() => import("@/pages/movement-analysis-page"));
const MealPlanPage = lazy(() => import("@/pages/meal-plan-page"));
const ServicesPage = lazy(() => import("@/pages/services-page"));
const PricingPage = lazy(() => import("@/pages/pricing-page"));
const FeaturesPage = lazy(() => import("@/pages/features-page"));
const DemoPage = lazy(() => import("@/pages/demo-page"));
const CommunicationHubPage = lazy(() => import("@/pages/communication-hub-page"));
const GroupSessionPage = lazy(() => import("@/pages/group-session-page"));
const FormsPage = lazy(() => import("@/pages/forms-page"));
const AboutPage = lazy(() => import("@/pages/about-page"));
const SolutionsPage = lazy(() => import("@/pages/solutions-page"));
const HowItWorksPage = lazy(() => import("@/pages/how-it-works-page"));
const ResourcesPage = lazy(() => import("@/pages/resources-page"));
const SupportPage = lazy(() => import("@/pages/support-page"));


// Loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Switch>
            {/* Public routes */}
            <Route path="/" component={HomePage} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/login" component={AuthPage} />
            <Route path="/login-test" component={LoginTest} />
            <Route path="/voice-workout" component={WorkoutFeaturesDemo} />
            <Route path="/about" component={AboutPage} />
            <Route path="/solutions" component={SolutionsPage} />
            <Route path="/how-it-works" component={HowItWorksPage} />
            <Route path="/resources" component={ResourcesPage} />
            <Route path="/support" component={SupportPage} />
            <Route path="/services" component={ServicesPage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/features" component={FeaturesPage} />
            <Route path="/demo" component={DemoPage} />


            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              component={() => (
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/generate-content" 
              component={() => (
                <ProtectedRoute>
                  <ContentGeneratorPage />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/workout-features-demo" 
              component={() => (
                <ProtectedRoute>
                  <WorkoutFeaturesDemo />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/movement-analysis" 
              component={() => (
                <ProtectedRoute>
                  <MovementAnalysisPage />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/meal-plan" 
              component={() => (
                <ProtectedRoute>
                  <MealPlanPage />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/settings" 
              component={() => (
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/communication-hub" 
              component={() => (
                <ProtectedRoute>
                  <CommunicationHubPage />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/group-session" 
              component={() => (
                <ProtectedRoute>
                  <GroupSessionPage />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/forms" 
              component={() => (
                <ProtectedRoute>
                  <FormsPage />
                </ProtectedRoute>
              )} 
            />


            {/* Catch-all for 404 */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;