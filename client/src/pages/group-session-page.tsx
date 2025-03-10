import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import GroupSessionPlanGenerator from '@/components/group-session-plan-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GroupSessionPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Group Session Plan Generator</h1>
          <p className="text-muted-foreground mt-2">
            Create professional workout plans for your group fitness classes in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="col-span-1">
            <GroupSessionPlanGenerator />
          </div>
          
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Group Session Tips</CardTitle>
                <CardDescription>Expert advice for running effective group classes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="font-medium">Class Planning</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan your group sessions to accommodate participants of all fitness levels.
                    Include exercise modifications for beginners and advanced options for more
                    experienced participants.
                  </p>
                </div>
                
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="font-medium">Equipment Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Arrange equipment stations before participants arrive. Consider
                    traffic flow and ensure each station has enough space for safe movement.
                  </p>
                </div>
                
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="font-medium">Time Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Use a visible timer for interval-based workouts. Clear transitions
                    between exercises help maintain flow and maximize workout efficiency.
                  </p>
                </div>
                
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="font-medium">Participant Engagement</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn participants' names and use them during class. Provide individual
                    form corrections while maintaining group energy and motivation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}