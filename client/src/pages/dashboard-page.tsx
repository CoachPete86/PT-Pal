import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import BookingForm from "@/components/booking-form";
import MessagePanel from "@/components/message-panel";
import FoodAnalysis from "@/components/food-analysis";
import FitnessTimeline from "@/components/fitness-timeline";
import DocumentEditor from "@/components/document-editor";
import DocumentList from "@/components/document-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddFitnessEntry from "@/components/add-fitness-entry";
import { useState } from "react";
import type { Document } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Welcome, {user?.fullName || user?.username}
        </h1>

        <Tabs defaultValue="fitness-journey">
          <TabsList>
            <TabsTrigger value="fitness-journey">Fitness Journey</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="food-analysis">Food Analysis</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="fitness-journey" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <AddFitnessEntry />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Fitness Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <FitnessTimeline />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Schedule a Session</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
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
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentList
                  onSelect={setSelectedDocument}
                  selectedId={selectedDocument?.id}
                />
              </CardContent>
            </Card>

            <Card className="col-span-3">
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}