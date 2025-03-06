import PTpalDashboard from "@/components/ptpal-dashboard";
import Navbar from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-4">
        <PTpalDashboard />
      </div>
    </div>
  );
}