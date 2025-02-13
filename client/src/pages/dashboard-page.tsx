import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import BookingForm from "@/components/booking-form";
import MessagePanel from "@/components/message-panel";
import FoodAnalysis from "@/components/food-analysis";
import FitnessTimeline from "@/components/fitness-timeline";
import DocumentEditor from "@/components/document-editor";
import DocumentList from "@/components/document-list";
import WorkoutGenerator from "@/components/workout-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddFitnessEntry from "@/components/add-fitness-entry";
import { useState } from "react";
import type { Document } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BookOpen,
  Calendar,
  MessageSquare,
  PieChart,
  Plus,
  BarChart,
  Dumbbell,
  Heart,
  Trophy,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const tabItems = [
  { id: "fitness-journey", label: "Fitness Journey", icon: Trophy },
  { id: "workout-plans", label: "Workout Plans", icon: Dumbbell },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "food-analysis", label: "Food Analysis", icon: PieChart },
  { id: "documents", label: "Documents", icon: BookOpen },
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
                  Welcome back, {user?.fullName || user?.username}
                </h1>
                <p className="text-muted-foreground">
                  Track your progress and manage your fitness journey
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Activity className="h-8 w-8 text-primary animate-pulse" />
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">Today's Goal</span>
                  <span className="text-2xl font-bold">85%</span>
                </div>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="fitness-journey" className="space-y-8">
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

            <TabsContent value="fitness-journey" className="space-y-6">
              <ResizablePanelGroup 
                direction="horizontal" 
                className="min-h-[800px] rounded-lg border bg-card"
              >
                <ResizablePanel defaultSize={40}>
                  <div className="flex h-full flex-col">
                    <div className="flex items-center gap-2 border-b p-4 bg-muted/50">
                      <Plus className="h-4 w-4" />
                      <h3 className="font-semibold">Add New Entry</h3>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                      <AddFitnessEntry />
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={60}>
                  <div className="flex h-full flex-col">
                    <div className="flex items-center gap-2 border-b p-4 bg-muted/50">
                      <BarChart className="h-4 w-4" />
                      <h3 className="font-semibold">Your Fitness Journey</h3>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                      <FitnessTimeline />
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabsContent>

            <TabsContent value="workout-plans">
              <WorkoutGenerator />
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule a Session
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Book your next training session with Coach Pete
                  </p>
                </CardHeader>
                <CardContent>
                  <BookingForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Messages
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Stay in touch with your coach and fellow athletes
                  </p>
                </CardHeader>
                <CardContent>
                  <MessagePanel />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="food-analysis">
              <FoodAnalysis />
            </TabsContent>

            <TabsContent value="documents" className="grid grid-cols-4 gap-6">
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
                  <CardHeader className="space-y-1">
                    <CardTitle>
                      {selectedDocument ? selectedDocument.title : "New Document"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedDocument ? "Edit document" : "Create a new document"}
                    </p>
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
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}