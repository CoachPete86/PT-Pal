import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import { Loader2, Mail, Phone, FileText, Activity, Target, Heart } from "lucide-react";

interface ClientProfileProps {
  clientId: number;
  onClose: () => void;
}

export default function ClientProfile({ clientId, onClose }: ClientProfileProps) {
  const { data: client, isLoading } = useQuery<User>({
    queryKey: ['/api/clients', clientId],
  });

  const { data: fitnessJourney } = useQuery({
    queryKey: ['/api/fitness-journey', clientId],
    enabled: !!clientId,
  });

  const { data: goals } = useQuery({
    queryKey: ['/api/client-goals', clientId],
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center p-8">
        <p>Client not found</p>
        <Button onClick={onClose} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{client.fullName}</h2>
          <p className="text-muted-foreground">Client Profile</p>
        </div>
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{client.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="capitalize">{client.status || 'Active'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="journey">Fitness Journey</TabsTrigger>
          <TabsTrigger value="health">Health Info</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.preferences?.goals ? (
                <p>{client.preferences.goals}</p>
              ) : (
                <p className="text-muted-foreground">No goals set</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Fitness Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fitnessJourney?.length ? (
                <div className="space-y-4">
                  {fitnessJourney.map((entry) => (
                    <div key={entry.id} className="border-b pb-4">
                      <p className="font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                      <p>{entry.notes}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No journey entries yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Health Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.preferences?.healthConditions ? (
                <p>{client.preferences.healthConditions}</p>
              ) : (
                <p className="text-muted-foreground">No health information provided</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
