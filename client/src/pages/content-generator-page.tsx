import EnhancedContentGenerator from "@/components/enhanced-content-generator";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function ContentGeneratorPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Social Content Generator</h2>
        <EnhancedContentGenerator />
      </div>
    </DashboardLayout>
  );
}
