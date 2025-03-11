import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import HomePage from "@/pages/home-page";
import AboutPage from "@/pages/about-page";
import FeaturesPage from "@/pages/features-page";
import ServicesPage from "@/pages/services-page";
import PricingPage from "@/pages/pricing-page";
import DashboardPage from "@/pages/dashboard-page";
import GroupSessionPage from "@/pages/group-session-page";
import NotFoundPage from "@/pages/not-found";
import LoginPage from "@/pages/login-page";
import SignupPage from "@/pages/signup-page";
import RegisterPage from "@/pages/register-page";
import SettingsPage from "@/pages/settings-page";
import MovementAnalysisPage from "@/pages/movement-analysis-page";
import MealPlanPage from "@/pages/meal-plan-page";
import ContentGeneratorPage from "@/pages/content-generator-page";
import FormsPage from "@/pages/forms-page";
import CommunicationHubPage from "@/pages/communication-hub-page";
import ProtectedRoute from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import "./index.css";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/features" component={FeaturesPage} />
            <Route path="/services" component={ServicesPage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/signup" component={SignupPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/dashboard">
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/communication">
              <ProtectedRoute>
                <CommunicationHubPage />
              </ProtectedRoute>
            </Route>
            <Route path="/forms">
              <ProtectedRoute>
                <FormsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/content-generator">
              <ProtectedRoute>
                <ContentGeneratorPage />
              </ProtectedRoute>
            </Route>
            <Route path="/meal-plan">
              <ProtectedRoute>
                <MealPlanPage />
              </ProtectedRoute>
            </Route>
            <Route path="/movement-analysis">
              <ProtectedRoute>
                <MovementAnalysisPage />
              </ProtectedRoute>
            </Route>
            <Route path="/group-session">
              <ProtectedRoute>
                <GroupSessionPage />
              </ProtectedRoute>
            </Route>
            <Route path="/settings">
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            </Route>
            <Route component={NotFoundPage} />
          </Switch>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}