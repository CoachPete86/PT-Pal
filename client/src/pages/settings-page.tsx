import { useAuth } from "@/hooks/use-auth";
import WorkspaceSettings from "@/components/workspace-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building2, User } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account and workspace settings
        </p>
      </div>

      <Tabs defaultValue="workspace" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workspace" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspace">
          <WorkspaceSettings />
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="font-medium">Email</label>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <label className="font-medium">Full Name</label>
                  <p className="text-muted-foreground">{user.fullName}</p>
                </div>
                <div>
                  <label className="font-medium">Role</label>
                  <p className="text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
