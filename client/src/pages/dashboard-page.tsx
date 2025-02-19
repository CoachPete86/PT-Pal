import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import SessionTracker from "@/components/session-tracker";
import MessagePanel from "@/components/message-panel";
import FoodAnalysis from "@/components/food-analysis";
import FitnessTimeline from "@/components/fitness-timeline";
import DocumentEditor from "@/components/document-editor";
import DocumentList from "@/components/document-list";
import WorkoutGenerator from "@/components/workout-generator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import type { Document, User } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import ClientManagement from "@/components/client-management";
import {
  Activity,
  Users,
  AlertCircle,
  Clock,
  Calendar,
  MessageSquare,
  ClipboardList,
  BookOpen,
  Dumbbell,
  Heart,
  Trophy,
  FileText,
  UserPlus,
  Loader2,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const tabItems = [
  { id: "clients", label: "Client Management", icon: Users },
  { id: "sessions", label: "Session Tracking", icon: Calendar },
  { id: "workouts", label: "Workout Plans", icon: Dumbbell },
  { id: "progress", label: "Progress Tracking", icon: Trophy },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "nutrition", label: "Nutrition", icon: Heart },
  { id: "documents", label: "Documents", icon: FileText },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Fetch real client data
  const { data: clients, isLoading: isLoadingClients } = useQuery<User[]>({
    queryKey: ['/api/clients'],
    enabled: user?.role === 'trainer',
  });

  // Fetch session packages for today's sessions count
  const { data: sessionPackages, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['/api/session-packages'],
    enabled: user?.role === 'trainer',
  });

  // Get today's sessions
  const todaySessions = sessionPackages?.filter(pkg => {
    const today = new Date().toISOString().split('T')[0];
    return pkg.sessions?.some(session => session.date.startsWith(today));
  });

  // Calculate active programs
  const { data: workoutPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['/api/workout-plans'],
    enabled: user?.role === 'trainer',
  });

  const activePrograms = workoutPlans?.filter(plan => plan.status === 'active');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-32" />
        <main className="container mx-auto p-4 lg:p-8 space-y-8 relative">
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h1 className="text-4xl font-bold tracking-tight">
                  Welcome, {user?.fullName || user?.username}
                </h1>
                <p className="text-muted-foreground">
                  {user?.role === 'trainer' 
                    ? 'Manage your clients and training business'
                    : 'Track your fitness journey and connect with your trainer'}
                </p>
              </div>
            </div>

            {/* Quick Stats - Only show for trainers */}
            {user?.role === 'trainer' && (
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeIn}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="flex items-center gap-4 p-6">
                    <Activity className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Today's Sessions</p>
                      {isLoadingPackages ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <h3 className="text-2xl font-bold">{todaySessions?.length || 0}</h3>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="flex items-center gap-4 p-6">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Upcoming Sessions</p>
                      {isLoadingPackages ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <h3 className="text-2xl font-bold">
                          {sessionPackages?.filter(pkg => {
                            const today = new Date().toISOString().split('T')[0];
                            return pkg.sessions?.some(session => 
                              session.date > today
                            );
                          })?.length || 0}
                        </h3>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
                  <CardContent className="flex items-center gap-4 p-6">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Payments Due</p>
                      {isLoadingPackages ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <h3 className="text-2xl font-bold">
                          {sessionPackages?.filter(pkg => 
                            pkg.paymentStatus === 'pending'
                          )?.length || 0}
                        </h3>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                  <CardContent className="flex items-center gap-4 p-6">
                    <Clock className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Expiring Packages</p>
                      {isLoadingPackages ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <h3 className="text-2xl font-bold">
                          {sessionPackages?.filter(pkg => {
                            const thirtyDaysFromNow = new Date();
                            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                            return new Date(pkg.expiryDate) <= thirtyDaysFromNow;
                          })?.length || 0}
                        </h3>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="flex items-center gap-4 p-6">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Active Clients</p>
                      {isLoadingClients ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <h3 className="text-2xl font-bold">{clients?.length || 0}</h3>
                      )}
                    </div>
                  </CardContent>
                </Card>

                </motion.div>
            )}
                  <CardContent className="flex items-center gap-4 p-6">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Active Clients</p>
                      {isLoadingClients ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <h3 className="text-2xl font-bold">{clients?.length || 0}</h3>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <ClipboardList className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Active Programs</p>
                      {isLoadingPlans ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <h3 className="text-2xl font-bold">{activePrograms?.length || 0}</h3>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <Heart className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Session Completion</p>
                      {isLoadingPackages ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <h3 className="text-2xl font-bold">
                          {sessionPackages?.length ? 
                            `${Math.round((sessionPackages.reduce((acc, pkg) => 
                              acc + (pkg.totalSessions - pkg.remainingSessions), 0) / 
                              sessionPackages.reduce((acc, pkg) => acc + pkg.totalSessions, 0)) * 100)}%`
                            : '0%'}
                        </h3>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          <Tabs defaultValue="clients" className="space-y-8">
            <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-10 w-full justify-start rounded-none border-b px-0 h-auto flex-wrap">
              <AnimatePresence>
                {tabItems.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 -mb-px"
                  >
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </motion.div>
                  </TabsTrigger>
                ))}
              </AnimatePresence>
            </TabsList>

            <TabsContent value="clients">
              <div className="grid gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Client Management</CardTitle>
                      <CardDescription>
                        Manage your client relationships and track their progress
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Add New Client
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Client</DialogTitle>
                          <DialogDescription>
                            Enter the client's details below
                          </DialogDescription>
                        </DialogHeader>
                        <ClientManagement />
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {isLoadingClients ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : clients?.length ? (
                      <div className="space-y-4">
                        {clients.map((client) => (
                          <Card key={client.id}>
                            <CardContent className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                  <p className="font-medium">{client.fullName || client.username}</p>
                                  <p className="text-sm text-muted-foreground">{client.email}</p>
                                </div>
                              </div>
                              <Button variant="outline">View Profile</Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No clients found. Add your first client to get started.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sessions">
              <SessionTracker />
            </TabsContent>

            <TabsContent value="workouts">
              <WorkoutGenerator />
            </TabsContent>

            <TabsContent value="progress">
              <FitnessTimeline />
            </TabsContent>

            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Client Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MessagePanel />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nutrition">
              <FoodAnalysis />
            </TabsContent>

            <TabsContent value="documents">
              <div className="grid grid-cols-4 gap-6">
                <motion.div
                  className="col-span-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DocumentList
                        onSelect={setSelectedDocument}
                        selectedId={selectedDocument?.id}
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  className="col-span-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {selectedDocument ? selectedDocument.title : "New Document"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DocumentEditor
                        initialContent={selectedDocument?.content}
                        documentId={selectedDocument?.id}
                        onSave={() => setSelectedDocument(null)}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}