import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import SessionTracker from "@/components/session-tracker";
import MessagePanel from "@/components/message-panel";
import FoodAnalysis from "@/components/food-analysis";
import FitnessTimeline from "@/components/fitness-timeline";
import DocumentEditor from "@/components/document-editor";
import DocumentList from "@/components/document-list";
import WorkoutGenerator from "@/components/workout-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import type { Document } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Users,
  Calendar,
  MessageSquare,
  ClipboardList,
  BookOpen,
  Dumbbell,
  Heart,
  Trophy,
  FileText,
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
                  Manage your clients and training business
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">Active Clients</span>
                  <span className="text-2xl font-bold">12</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <Activity className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Today's Sessions</p>
                    <h3 className="text-2xl font-bold">5</h3>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Total Clients</p>
                    <h3 className="text-2xl font-bold">24</h3>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <ClipboardList className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Active Programs</p>
                    <h3 className="text-2xl font-bold">8</h3>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <Heart className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Client Progress</p>
                    <h3 className="text-2xl font-bold">92%</h3>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <Tabs defaultValue="sessions" className="space-y-8">
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
                  <CardHeader>
                    <CardTitle>Client Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Add client list component here */}
                    <p>Client management interface coming soon</p>
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