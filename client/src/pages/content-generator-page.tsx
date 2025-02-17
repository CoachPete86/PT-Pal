import ContentGenerator from "@/components/content-generator";
import { BarChart } from "lucide-react";

export default function ContentGeneratorPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart className="h-8 w-8" />
          Social Media Content Generator
        </h1>
        <p className="text-muted-foreground">
          Create engaging social media content for your fitness business
        </p>
      </div>
      <ContentGenerator />
    </div>
  );
}
