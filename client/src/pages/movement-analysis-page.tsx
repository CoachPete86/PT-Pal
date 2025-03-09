import { DashboardLayout } from "@/components/dashboard-layout";
import MovementAnalysis from "@/components/movement-analysis";

export default function MovementAnalysisPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Movement Analysis</h2>
        <MovementAnalysis />
      </div>
    </DashboardLayout>
  );
}