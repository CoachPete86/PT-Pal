import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import BookingForm from "@/components/booking-form";
import MessagePanel from "@/components/message-panel";
import FoodAnalysis from "@/components/food-analysis";
import FitnessTimeline from "@/components/fitness-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { user } = useAuth();

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
          </TabsList>

          <TabsContent value="fitness-journey">
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
        </Tabs>
      </main>
    </div>
  );
}