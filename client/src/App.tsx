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
import MealPlanPage from "@/pages/meal-plan-page";
import ServicesPage from "@/pages/services-page";
import PricingPage from "@/pages/pricing-page";
import FeaturesPage from "@/pages/features-page";
import DemoPage from "@/pages/demo-page";
import CommunicationHubPage from "@/pages/communication-hub-page";
import GroupSessionPage from "@/pages/group-session-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
// Importing new pages -  assuming these files exist or will be created.
import SolutionsPage from "@/pages/solutions-page";
import HowItWorksPage from "@/pages/how-it-works-page";
import ResourcesPage from "@/pages/resources-page";
import SupportPage from "@/pages/support-page";
import AboutPage from "@/pages/about-page";


function Router() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/signup" component={AuthPage} />
        <Route path="/reset-password" component={AuthPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/features" component={FeaturesPage} />
        <Route path="/solutions" component={SolutionsPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/how-it-works" component={HowItWorksPage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/support" component={SupportPage} />
        <Route path="/demo" component={DemoPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/content-generator" component={ContentGeneratorPage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <ProtectedRoute path="/workout-features" component={WorkoutFeaturesDemo} />
        <ProtectedRoute path="/movement-analysis" component={MovementAnalysisPage} />
        <ProtectedRoute path="/meal-plan" component={MealPlanPage} />
        <ProtectedRoute path="/communication-hub" component={CommunicationHubPage} />
        <ProtectedRoute path="/group-session" component={GroupSessionPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/solutions" component={SolutionsPage} />
        <Route path="/how-it-works" component={HowItWorksPage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/support" component={SupportPage} />
        <Route path="/:rest*" component={NotFound} />
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