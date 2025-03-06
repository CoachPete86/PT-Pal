import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import type { FitnessJourney } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Weight,
  HeartPulse,
  Award,
  Ruler,
  Loader2,
} from "lucide-react";

const categoryIcons = {
  weight: Weight,
  strength: Trophy,
  endurance: HeartPulse,
  milestone: Award,
  measurement: Ruler,
};

export default function FitnessTimeline() {
  const { data: milestones, isLoading } = useQuery<FitnessJourney[]>({
    queryKey: ["/api/fitness-journey"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!milestones?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Fitness Journey</CardTitle>
          <CardDescription>
            Start tracking your progress to see your fitness journey timeline
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-muted-foreground">
      {milestones?.map((milestone, index) => {
        const Icon =
          categoryIcons[milestone.category as keyof typeof categoryIcons];

        return (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex gap-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
            >
              <Icon className="h-5 w-5" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="flex-1"
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{milestone.title}</CardTitle>
                    <Badge
                      variant={
                        milestone.status === "achieved"
                          ? "default"
                          : milestone.status === "in_progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {milestone.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardDescription>
                    {format(new Date(milestone.date), "PPP")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {milestone.description}
                  </p>
                  {milestone.value && (
                    <p className="text-sm font-medium">
                      {milestone.value} {milestone.unit}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
