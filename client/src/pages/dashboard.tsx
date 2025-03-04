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
import WorkoutMascot from "@/components/workout-mascot";
import AIMotivationCoach from "@/components/ai-motivation-coach";
import VoiceActivatedWorkout from "@/components/voice-activated-workout";
import ContentGeneratorPage from "@/pages/content-generator-page";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
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
  Download,
  PenLine,
  Share2,
  Trash,
  Plus,
} from "lucide-react";
import ClientProfile from "@/components/client-profile";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const tabItems = [
  { id: "clients", label: "Client Management", icon: Users },
  { id: "sessions", label: "Session Tracking", icon: Calendar },
  { id: "workouts", label: "Workout Plans", icon: Dumbbell },
  { id: "workout-ai", label: "Workout AI", icon: Activity },
  { id: "progress", label: "Progress Tracking", icon: Trophy },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "nutrition", label: "Nutrition", icon: Heart },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "content", label: "Content Creator", icon: ClipboardList },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const { data: clients, isLoading: isLoadingClients } = useQuery<User[]>({
    queryKey: ['/api/clients'],
    enabled: user?.role === 'trainer',
  });

  const { data: sessionPackages, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['/api/session-packages'],
    enabled: user?.role === 'trainer',
  });

  const { data: workoutPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['/api/workout-plans'],
    enabled: user?.role === 'trainer',
  });

  const todaySessions = sessionPackages?.filter(pkg => {
    const today = new Date().toISOString().split('T')[0];
    return pkg.sessions?.some(session => session.date.startsWith(today));
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

            {user?.role === 'trainer' && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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
              </div>
            )}
          </motion.div>

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
              {selectedClientId ? (
                <ClientProfile
                  clientId={selectedClientId}
                  onClose={() => setSelectedClientId(null)}
                />
              ) : (
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
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedClientId(client.id)}
                                >
                                  View Profile
                                </Button>
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
              )}
            </TabsContent>

            <TabsContent value="sessions">
              <SessionTracker />
            </TabsContent>

            <TabsContent value="workouts">
              <WorkoutGenerator />
            </TabsContent>

            <TabsContent value="workout-ai">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Workout Coach</CardTitle>
                      <CardDescription>
                        Get real-time motivation and guidance during your workouts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AIMotivationCoach character="coach" currentPhase="main-workout" autoPlay={false} />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Voice-Activated Workouts</CardTitle>
                      <CardDescription>
                        Control your workout with voice commands for a hands-free experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VoiceActivatedWorkout 
                        workoutTitle="Quick HIIT Workout"
                        totalDuration={15}
                        exercises={[
                          { id: "ex1", name: "Jumping Jacks", duration: 30, instruction: "Full range of motion", restAfter: 10 },
                          { id: "ex2", name: "Mountain Climbers", duration: 30, instruction: "Keep hips stable", restAfter: 10 },
                          { id: "ex3", name: "Burpees", duration: 30, instruction: "Full extension at the top", restAfter: 10 },
                          { id: "ex4", name: "High Knees", duration: 30, instruction: "Drive knees up", restAfter: 10 }
                        ]}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
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
                  <div className="space-y-6">
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
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          PT Forms
                        </CardTitle>
                        <CardDescription>
                          Generate fitness forms for your clients
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Select defaultValue="consultation">
                            <SelectTrigger>
                              <SelectValue placeholder="Select form type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="consultation">Initial Consultation Form</SelectItem>
                              <SelectItem value="parq">PAR-Q Form</SelectItem>
                              <SelectItem value="consent">Informed Consent</SelectItem>
                              <SelectItem value="assessment">Fitness Assessment</SelectItem>
                              <SelectItem value="nutrition">Nutrition Questionnaire</SelectItem>
                              <SelectItem value="goal">Goal Setting Worksheet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" className="w-full">
                              <PenLine className="h-4 w-4 mr-2" />
                              Customize
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" className="w-full">
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" className="w-full">
                              <Share2 className="h-4 w-4 mr-2" />
                              Share with Client
                            </Button>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">Notion Integration</h4>
                          <div className="space-y-2">
                            <Button variant="outline" className="w-full" size="sm">
                              Sync with Notion
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                <motion.div
                  className="col-span-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>
                        {selectedDocument ? selectedDocument.title : "New Document"}
                      </CardTitle>
                      {selectedDocument && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      )}
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
            
            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Content Creator
                  </CardTitle>
                  <CardDescription>
                    Generate social media content, emails, and other marketing materials for your fitness business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[800px] overflow-hidden">
                    <ContentGeneratorPage />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}