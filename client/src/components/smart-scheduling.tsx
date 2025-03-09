
import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CreditCard,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  Bell,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

export default function SmartScheduling() {
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showNewPackageDialog, setShowNewPackageDialog] = useState(false);

  const upcomingSessions = [
    {
      id: "1",
      client: "Sarah Johnson",
      date: "Today",
      time: "4:30 PM",
      type: "Personal Training",
      status: "confirmed",
      reminded: true,
    },
    {
      id: "2",
      client: "Michael Chen",
      date: "Tomorrow",
      time: "10:00 AM",
      type: "Fitness Assessment",
      status: "pending",
      reminded: false,
    },
    {
      id: "3",
      client: "Lisa Williams",
      date: "May 24, 2023",
      time: "6:15 PM",
      type: "Group Session",
      status: "confirmed",
      reminded: true,
    },
  ];

  const clientPackages = [
    {
      id: "1",
      client: "Sarah Johnson",
      packageName: "Premium 10-Pack",
      sessionsLeft: 4,
      expiresOn: "July 15, 2023",
      status: "active",
    },
    {
      id: "2",
      client: "Michael Chen",
      packageName: "Monthly Unlimited",
      nextRenewal: "June 1, 2023",
      status: "active",
      recurring: true,
    },
    {
      id: "3",
      client: "Lisa Williams",
      packageName: "Starter 5-Pack",
      sessionsLeft: 1,
      expiresOn: "May 30, 2023",
      status: "expiring-soon",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-centre gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Smart Scheduling</h1>
          <p className="text-muted-foreground">
            Manage your sessions, client packages, and automated notifications
          </p>
        </div>
        <div className="flex items-centre gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-centre gap-2" variant="default">
                <Calendar className="h-4 w-4" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule New Session</DialogTitle>
                <DialogDescription>
                  Create a new training session for your client.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-centre gap-4">
                  <Label htmlFor="client" className="text-right">
                    Client
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Clients</SelectLabel>
                        <SelectItem value="sarah">Sarah Johnson</SelectItem>
                        <SelectItem value="michael">Michael Chen</SelectItem>
                        <SelectItem value="lisa">Lisa Williams</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-centre gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-3"
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="grid grid-cols-4 items-centre gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Input id="time" type="time" className="col-span-3" defaultValue="17:00" />
                </div>
                <div className="grid grid-cols-4 items-centre gap-4">
                  <Label htmlFor="session-type" className="text-right">
                    Type
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal Training</SelectItem>
                      <SelectItem value="assessment">Fitness Assessment</SelectItem>
                      <SelectItem value="group">Group Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-centre gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-centre gap-4">
                  <div className="col-start-2 col-span-3 flex items-centre space-x-2">
                    <Checkbox id="send-reminder" />
                    <Label htmlFor="send-reminder">Send automatic reminder</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Schedule Session</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showNewPackageDialog} onOpenChange={setShowNewPackageDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-centre gap-2" variant="outline">
                <Package className="h-4 w-4" />
                New Package
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Package</DialogTitle>
                <DialogDescription>
                  Set up a new training package or subscription for your client.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-centre gap-4">
                  <Label htmlFor="client" className="text-right">
                    Client
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Clients</SelectLabel>
                        <SelectItem value="sarah">Sarah Johnson</SelectItem>
                        <SelectItem value="michael">Michael Chen</SelectItem>
                        <SelectItem value="lisa">Lisa Williams</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-centre gap-4">
                  <Label htmlFor="package-type" className="text-right">
                    Package Type
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="session-pack">Session Pack</SelectItem>
                      <SelectItem value="subscription">Monthly Subscription</SelectItem>
                      <SelectItem value="custom">Custom Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-centre gap-4">
                  <Label htmlFor="sessions" className="text-right">
                    Sessions
                  </Label>
                  <Input id="sessions" type="number" className="col-span-3" defaultValue="10" />
                </div>
                <div className="grid grid-cols-4 items-centre gap-4">
                  <Label htmlFor="expiry" className="text-right">
                    Expiration
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select expiration period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 month</SelectItem>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="never">Never expires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-centre gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <div className="col-span-3 flex">
                    <span className="inline-flex items-centre px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      className="rounded-l-none"
                      defaultValue="500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-centre gap-4">
                  <div className="col-start-2 col-span-3 flex items-centre space-x-2">
                    <Switch id="auto-renew" />
                    <Label htmlFor="auto-renew">Auto-renew subscription</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Package</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="upcoming" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="packages">Client Packages</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  Your scheduled training sessions for the next 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex flex-col sm:flex-row sm:items-centre justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-centre justify-centre ${
                              session.status === "confirmed"
                                ? "bg-green-100 text-green-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            {session.status === "confirmed" ? (
                              <UserCheck className="h-5 w-5" />
                            ) : (
                              <AlertTriangle className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-centre">
                              <h4 className="font-medium">{session.client}</h4>
                              <Badge
                                variant={session.status === "confirmed" ? "default" : "outline"}
                                className="ml-2"
                              >
                                {session.status === "confirmed" ? "Confirmed" : "Pending"}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {session.date} • {session.time} • {session.type}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-centre gap-2 mt-3 sm:mt-0">
                          {!session.reminded && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowReminderDialog(true)}
                              className="flex items-centre gap-1"
                            >
                              <Bell className="h-3 w-3" />
                              Remind
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCancelDialog(true)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            Cancel
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/10 pt-4">
                <Button variant="outline" size="sm">
                  View All Sessions
                </Button>
                <Button variant="ghost" size="sm">
                  Export Schedule
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common scheduling tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Today's Schedule
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="mr-2 h-4 w-4" />
                    Send Batch Reminders
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Process Payments
                  </Button>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium mb-2">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-centre justify-between">
                      <Label htmlFor="email-reminders" className="text-sm">
                        Email reminders
                      </Label>
                      <Switch id="email-reminders" defaultChecked />
                    </div>
                    <div className="flex items-centre justify-between">
                      <Label htmlFor="sms-reminders" className="text-sm">
                        SMS reminders
                      </Label>
                      <Switch id="sms-reminders" defaultChecked />
                    </div>
                    <div className="flex items-centre justify-between">
                      <Label htmlFor="expiry-alerts" className="text-sm">
                        Package expiry alerts
                      </Label>
                      <Switch id="expiry-alerts" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Client Packages</CardTitle>
                <CardDescription>
                  Active training packages and subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {clientPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="flex flex-col sm:flex-row sm:items-centre justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-centre justify-centre ${
                              pkg.status === "active"
                                ? "bg-green-100 text-green-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-centre">
                              <h4 className="font-medium">{pkg.client}</h4>
                              <Badge
                                variant={pkg.status === "active" ? "default" : "outline"}
                                className="ml-2"
                              >
                                {pkg.status === "active" ? "Active" : "Expiring Soon"}
                              </Badge>
                              {pkg.recurring && (
                                <Badge variant="secondary" className="ml-2">
                                  Recurring
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {pkg.packageName} •{" "}
                              {pkg.sessionsLeft
                                ? `${pkg.sessionsLeft} sessions left`
                                : `Renews ${pkg.nextRenewal}`}{" "}
                              • {pkg.expiresOn ? `Expires ${pkg.expiresOn}` : ""}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-centre gap-2 mt-3 sm:mt-0">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            Renew
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/10 pt-4">
                <Button variant="outline" size="sm" onClick={() => setShowNewPackageDialog(true)}>
                  Add New Package
                </Button>
                <Button variant="ghost" size="sm">
                  Expiration Report
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Package Analytics</CardTitle>
                <CardDescription>Insights into your packages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between items-centre mb-2">
                    <div className="text-sm font-medium">Expiring This Month</div>
                    <div className="text-amber-600 font-semibold">3</div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: "30%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-centre mb-2">
                    <div className="text-sm font-medium">Auto-Renewing Next Month</div>
                    <div className="text-green-600 font-semibold">5</div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: "50%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-centre mb-2">
                    <div className="text-sm font-medium">Low Session Balance</div>
                    <div className="text-orange-600 font-semibold">2</div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded overflow-hidden">
                    <div className="bg-orange-500 h-full" style={{ width: "20%" }}></div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  Generate Revenue Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                View and manage your schedule in a calendar format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-centre justify-centre p-8 border-2 border-dashed rounded-md">
                <div className="text-centre">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Calendar View</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Full calendar implementation coming soon
                  </p>
                  <Button className="mt-4" variant="outline">
                    Sync with External Calendar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Session Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this training session?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-centre p-3 border rounded-lg">
              <UserCheck className="h-5 w-5 mr-3 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Sarah Johnson</h4>
                <p className="text-sm text-muted-foreground">Today • 4:30 PM • Personal Training</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Cancel Reason</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reschedule">Reschedule to another time</SelectItem>
                  <SelectItem value="illness">Illness or injury</SelectItem>
                  <SelectItem value="emergency">Personal emergency</SelectItem>
                  <SelectItem value="other">Other reason</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-centre space-x-2">
              <Checkbox id="notify-client" defaultChecked />
              <Label htmlFor="notify-client">Notify client via email</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Session
            </Button>
            <Button variant="destructive">Cancel Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Session Reminder</DialogTitle>
            <DialogDescription>
              Send a reminder notification to your client about their upcoming session.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-centre p-3 border rounded-lg">
              <AlertTriangle className="h-5 w-5 mr-3 text-amber-500" />
              <div>
                <h4 className="font-medium">Michael Chen</h4>
                <p className="text-sm text-muted-foreground">
                  Tomorrow • 10:00 AM • Fitness Assessment
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-method">Reminder Method</Label>
              <div className="flex space-x-4">
                <div className="flex items-centre space-x-2">
                  <Checkbox id="email-reminder" defaultChecked />
                  <Label htmlFor="email-reminder">Email</Label>
                </div>
                <div className="flex items-centre space-x-2">
                  <Checkbox id="sms-reminder" defaultChecked />
                  <Label htmlFor="sms-reminder">SMS</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-message">Custom Message (Optional)</Label>
              <Input
                id="reminder-message"
                placeholder="Looking forward to our session tomorrow!"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
              Cancel
            </Button>
            <Button>Send Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
