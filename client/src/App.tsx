
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-new";
import ContentGeneratorPage from "@/pages/content-generator-page";
import SettingsPage from "@/pages/settings-page";
import WorkoutFeaturesDemo from "@/pages/workout-features-demo";
import MovementAnalysisPage from "@/pages/movement-analysis-page";
import MealPlanPage from "@/pages/meal-plan-page";
import ServicesPage from "@/pages/services-page";
import PricingPage from "@/pages/pricing-page";
import FeaturesPage from "@/pages/features-page";
import DemoPage from "@/pages/demo-page";
import CommunicationHubPage from "@/pages/communication-hub-page";
import GroupSessionPage from "@/pages/group-session-page";
import FormsPage from "@/pages/forms-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
// Import for public pages
import SolutionsPage from "@/pages/solutions-page";
import HowItWorksPage from "@/pages/how-it-works-page";
import ResourcesPage from "@/pages/resources-page";
import SupportPage from "@/pages/support-page";
import AboutPage from "@/pages/about-page";
import LoginTest from "@/pages/login-test";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function Router() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/login-test" component={LoginTest} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/generate-content" component={ContentGeneratorPage} />
        <ProtectedRoute path="/workout-features-demo" component={WorkoutFeaturesDemo} />
        <ProtectedRoute path="/movement-analysis" component={MovementAnalysisPage} />
        <ProtectedRoute path="/meal-plan" component={MealPlanPage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/features" component={FeaturesPage} />
        <Route path="/demo" component={DemoPage} />
        <ProtectedRoute path="/communication-hub" component={CommunicationHubPage} />
        <ProtectedRoute path="/group-session" component={GroupSessionPage} />
        <ProtectedRoute path="/forms" component={FormsPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/solutions" component={SolutionsPage} />
        <Route path="/how-it-works" component={HowItWorksPage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/support" component={SupportPage} />
        <Route path="/mascot" component={WorkoutFeaturesDemo} />
        <Route path="/auth" component={LoginTest} />
        <Route path="/:rest*" component={NotFound} />
      </Switch>
    </Suspense>
  );
}
