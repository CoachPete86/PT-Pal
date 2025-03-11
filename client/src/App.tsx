import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import HomePage from "@/pages/home-page";
import AboutPage from "@/pages/about-page";
import FeaturesPage from "@/pages/features-page";
import ServicesPage from "@/pages/services-page";
import PricingPage from "@/pages/pricing-page";
import DashboardPage from "@/pages/dashboard-page";
import ClientsPage from "@/pages/clients-page";
import WorkoutsPage from "@/pages/workouts-page";
import NewWorkoutPage from "@/pages/new-workout-page";
import MascotPage from "@/pages/mascot-page";
import VoiceWorkoutPage from "@/pages/voice-workout-page";
import GroupSessionPage from "@/pages/group-session-page";
import BusinessSettingsPage from "@/pages/business-settings-page";
import NotFoundPage from "@/pages/not-found";
import LoginPage from "@/pages/login-page";
import SignupPage from "@/pages/signup-page";
import RegisterPage from "@/pages/register-page";
import ProtectedRoute from "@/lib/protected-route";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import "./global.css";

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
            <Route path="/clients">
              <ProtectedRoute>
                <ClientsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/workouts">
              <ProtectedRoute>
                <WorkoutsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/workouts/new">
              <ProtectedRoute>
                <NewWorkoutPage />
              </ProtectedRoute>
            </Route>
            <Route path="/mascot">
              <ProtectedRoute>
                <MascotPage />
              </ProtectedRoute>
            </Route>
            <Route path="/voice-workout">
              <ProtectedRoute>
                <VoiceWorkoutPage />
              </ProtectedRoute>
            </Route>
            <Route path="/group-session">
              <ProtectedRoute>
                <GroupSessionPage />
              </ProtectedRoute>
            </Route>
            <Route path="/business-settings">
              <ProtectedRoute>
                <BusinessSettingsPage />
              </ProtectedRoute>
            </Route>
            <Route component={NotFoundPage} />
          </Switch>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}