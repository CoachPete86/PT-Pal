import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Users,
  Calendar,
  Dumbbell,
  Trophy,
  MessageSquare,
  Heart,
  FileText,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientManagement } from "@/components/client-management";
import { ClientProfile } from "@/components/client-profile";
import PTpalDashboard from "@/components/ptpal-dashboard";

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      children: [],
    },
    {
      id: "clients",
      label: "Client Management",
      icon: Users,
      children: [
        { id: "client-list", label: "Client List" },
        { id: "add-client", label: "Add New Client" },
        { id: "client-groups", label: "Client Groups" },
      ],
    },
    {
      id: "sessions",
      label: "Session Tracking",
      icon: Calendar,
      children: [
        { id: "session-calendar", label: "Calendar" },
        { id: "session-history", label: "Session History" },
        { id: "create-session", label: "Create Session" },
      ],
    },
    {
      id: "workouts",
      label: "Workout Plans",
      icon: Dumbbell,
      children: [
        { id: "workout-templates", label: "Templates" },
        { id: "create-workout", label: "Create Workout" },
      ],
    },
    {
      id: "nutrition",
      label: "Nutrition",
      icon: Heart,
      children: [
        { id: "meal-plans", label: "Meal Plans" },
        { id: "nutrition-tracking", label: "Tracking" },
      ],
    },
    {
      id: "progress",
      label: "Progress Tracking",
      icon: Trophy,
      children: [],
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      children: [],
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      children: [],
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      children: [],
    },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case "dashboard":
        return <PTpalDashboard />;
      case "clients":
        return selectedClientId ? (
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
                      <User className="h-4 w-4" />
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
                <div className="space-y-4">
                  {["1", "2", "3"].map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <h3 className="font-medium">Client {id}</h3>
                        <p className="text-sm text-muted-foreground">
                          client{id}@example.com
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedClientId(id)}
                      >
                        View Profile
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-[70vh]">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  This feature is currently under development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center mb-4">
                  We're working hard to bring you this functionality soon.
                </p>
                <Button
                  className="w-full"
                  onClick={() => setSelectedTab("dashboard")}
                >
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/80 backdrop-blur-sm border shadow-sm hover:bg-card"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed lg:relative z-40 h-full bg-card border-r shadow-md overflow-hidden"
          >
            <ScrollArea className="h-full px-3 py-6">
              <div className="flex items-center gap-3 px-4 mb-8">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">PTpal</h1>
              </div>

              <div className="space-y-2">
                {navItems.map((item) =>
                  item.children.length > 0 ? (
                    <Collapsible key={item.id} className="w-full">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`w-full justify-between hover:bg-accent/50 ${
                            selectedTab === item.id
                              ? "bg-accent/80 text-accent-foreground font-medium"
                              : ""
                          }`}
                          onClick={() => setSelectedTab(item.id)}
                        >
                          <div className="flex items-center">
                            <item.icon className={`h-4 w-4 mr-2 ${selectedTab === item.id ? 'text-primary' : ''}`} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 ui-open:rotate-90" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-8 space-y-1 mt-1 animate-accordion-down">
                        {item.children.map((child) => (
                          <Button
                            key={child.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start hover:bg-accent/40 text-muted-foreground hover:text-foreground"
                            onClick={() => setSelectedTab(item.id)}
                          >
                            {child.label}
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start hover:bg-accent/50 ${
                        selectedTab === item.id
                          ? "bg-accent/80 text-accent-foreground font-medium"
                          : ""
                      }`}
                      onClick={() => setSelectedTab(item.id)}
                    >
                      <item.icon className={`h-4 w-4 mr-2 ${selectedTab === item.id ? 'text-primary' : ''}`} />
                      <span>{item.label}</span>
                    </Button>
                  ),
                )}
              </div>
              
              {/* Profile section at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card/80">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Coach Account</p>
                    <p className="text-xs text-muted-foreground truncate">pro@ptpal.app</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedTab("settings")}>
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-auto pt-16 lg:pt-0">
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 backdrop-blur-md bg-background/80 z-40 border-b flex items-center px-14">
          <h1 className="text-xl font-semibold">
            {navItems.find(item => item.id === selectedTab)?.label || 'Dashboard'}
          </h1>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="container mx-auto p-4 md:p-6"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
