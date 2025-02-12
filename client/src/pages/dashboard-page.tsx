import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import BookingForm from "@/components/booking-form";
import MessagePanel from "@/components/message-panel";
import FoodAnalysis from "@/components/food-analysis";
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

        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="food-analysis">Food Analysis</TabsTrigger>
          </TabsList>

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