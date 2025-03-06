
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  BellRing, 
  Smartphone, 
  ExternalLink, 
  Settings, 
  LayoutGrid, 
  Compass, 
  Clock, 
  BarChart, 
  Users,
  Check,
  AlertTriangle,
  X,
  ArrowRight,
  QrCode,
} from "lucide-react";

// Mock service worker registration function
async function registerServiceWorker() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  } else {
    throw new Error('Push notifications not supported in this browser');
  }
}

// Mock function to request notification permission
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported in this browser');
  }
  
  const permission = await Notification.requestPermission();
  return permission;
}

// Mock function to subscribe to push notifications
async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  try {
    // This would normally contain your actual VAPID public key
    const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });
    
    // This would normally post the subscription to your server
    console.log('Push notification subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
}

export default function MobileClientExperience() {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isInstallPromptAvailable, setIsInstallPromptAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [qrVisible, setQrVisible] = useState(false);

  // Mock data for upcoming sessions
  const upcomingSessions = [
    { id: 1, title: "HIIT Workout", date: "Tomorrow, 10:00 AM" },
    { id: 2, title: "Strength Training", date: "Friday, 2:00 PM" },
  ];

  // Mock data for recent achievements
  const recentAchievements = [
    { id: 1, title: "5 Sessions Completed", date: "2 days ago" },
    { id: 2, title: "Weight Goal Milestone", date: "1 week ago" },
  ];
  
  // Check if viewing on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Check if the PWA can be installed
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show install button
      setIsInstallPromptAvailable(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // Check if already installed
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (isStandalone) {
        setIsInstallPromptAvailable(false);
      }
    };
    
    checkInstalled();
    window.addEventListener('appinstalled', () => {
      setIsInstallPromptAvailable(false);
      setDeferredPrompt(null);
    });
  }, []);

  // Handle enabling notifications
  const handleEnableNotifications = async () => {
    try {
      // Request notification permission
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        // Register service worker
        const registration = await registerServiceWorker();
        
        // Subscribe to push notifications
        await subscribeToPushNotifications(registration);
        
        setNotificationsEnabled(true);
        toast({
          title: "Notifications enabled",
          description: "You'll now receive updates about your sessions and progress.",
        });
      } else {
        toast({
          title: "Notification permission denied",
          description: "Please enable notifications in your browser settings to receive updates.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: "Failed to enable notifications",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Handle installing the PWA
  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Installation not available",
        description: "Your browser or device doesn't support installing this app.",
        variant: "destructive",
      });
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Clear the saved prompt since it can only be used once
    setDeferredPrompt(null);
    
    if (outcome === 'accepted') {
      toast({
        title: "App installed successfully",
        description: "You can now access PTpal from your home screen.",
      });
      setIsInstallPromptAvailable(false);
    } else {
      toast({
        description: "Installation canceled. You can install the app later from the settings.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Mobile Client Experience</CardTitle>
              <CardDescription>Access your training anywhere, anytime</CardDescription>
            </div>
            {isInstallPromptAvailable && (
              <Button 
                className="mt-4 md:mt-0 flex items-center gap-2"
                onClick={handleInstallApp}
              >
                <Smartphone className="h-4 w-4" />
                Install PTpal App
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mobile App Info */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>PTpal on Your Mobile</CardTitle>
                <CardDescription>
                  Take your training experience to the next level with our mobile-optimized platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* App Preview */}
                  <div className="flex-1">
                    <div className="border border-border rounded-xl overflow-hidden shadow-lg max-w-[280px] mx-auto">
                      <div className="h-12 bg-primary flex items-center justify-center text-white font-bold">
                        PTpal
                      </div>
                      <div className="h-[480px] bg-card overflow-y-auto p-3">
                        <Tabs defaultValue="dashboard" className="w-full">
                          <TabsList className="grid w-full grid-cols-4 h-12">
                            <TabsTrigger value="dashboard" className="text-xs">
                              <LayoutGrid className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="workouts" className="text-xs">
                              <Compass className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="schedule" className="text-xs">
                              <Clock className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="progress" className="text-xs">
                              <BarChart className="h-4 w-4" />
                            </TabsTrigger>
                          </TabsList>
                          <div className="pt-4">
                            <h3 className="text-sm font-bold">Today's Workout</h3>
                            <div className="text-xs text-muted-foreground">HIIT Session - 45 min</div>
                            
                            <div className="mt-4 border rounded-md p-2 mb-4">
                              <div className="text-xs font-bold mb-1">Progress Update</div>
                              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '65%' }}></div>
                              </div>
                              <div className="text-xs mt-1 text-muted-foreground">65% towards your goal</div>
                            </div>
                            
                            <h3 className="text-sm font-bold mt-4">Recent Activity</h3>
                            <div className="text-xs space-y-2 mt-2">
                              <div className="flex justify-between">
                                <span>Strength Training</span>
                                <span className="text-muted-foreground">Yesterday</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cardio Session</span>
                                <span className="text-muted-foreground">2 days ago</span>
                              </div>
                            </div>
                          </div>
                        </Tabs>
                      </div>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold">Key Features</h3>
                      <p className="text-sm text-muted-foreground">
                        Everything you need for a seamless mobile training experience
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Responsive Design</p>
                          <p className="text-sm text-muted-foreground">
                            Optimized interface for all mobile devices
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Offline Access</p>
                          <p className="text-sm text-muted-foreground">
                            View your workout plans even without internet
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Get reminded about sessions and achievements
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Exercise Videos</p>
                          <p className="text-sm text-muted-foreground">
                            Watch proper form demonstrations on the go
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">One-Tap Check-ins</p>
                          <p className="text-sm text-muted-foreground">
                            Quickly check in to scheduled sessions
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="block">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex items-center gap-2" onClick={() => setQrVisible(!qrVisible)}>
                    <QrCode className="h-4 w-4" />
                    {qrVisible ? "Hide QR Code" : "Show QR Code"}
                  </Button>
                  
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleInstallApp} disabled={!isInstallPromptAvailable}>
                    <Smartphone className="h-4 w-4" />
                    Install PTpal App
                  </Button>
                </div>
                
                {qrVisible && (
                  <div className="mt-4 p-4 border rounded-lg flex flex-col items-center">
                    {/* Placeholder for QR code image */}
                    <div className="w-48 h-48 bg-muted flex items-center justify-center">
                      <div className="text-center text-sm text-muted-foreground">
                        <QrCode className="h-20 w-20 mx-auto mb-2 opacity-70" />
                        QR Code for Mobile App
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-center">
                      Scan this QR code with your phone's camera to access the PTpal app
                    </p>
                  </div>
                )}
              </CardFooter>
            </Card>
            
            {/* Notifications Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>
                  Stay updated with timely alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-notifications">Enable notifications</Label>
                  <Switch
                    id="enable-notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleEnableNotifications();
                      } else {
                        setNotificationsEnabled(false);
                        toast({
                          title: "Notifications disabled",
                          description: "You won't receive push notifications from PTpal.",
                        });
                      }
                    }}
                  />
                </div>
                
                <div className="pt-4 space-y-4">
                  <h3 className="text-sm font-medium">Notification Preferences</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label 
                      htmlFor="session-reminders" 
                      className="text-sm flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Session reminders</span>
                    </Label>
                    <Switch 
                      id="session-reminders" 
                      defaultChecked 
                      disabled={!notificationsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label 
                      htmlFor="goal-updates" 
                      className="text-sm flex items-center gap-2"
                    >
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                      <span>Goal progress updates</span>
                    </Label>
                    <Switch 
                      id="goal-updates" 
                      defaultChecked 
                      disabled={!notificationsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label 
                      htmlFor="trainer-messages" 
                      className="text-sm flex items-center gap-2"
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Trainer messages</span>
                    </Label>
                    <Switch 
                      id="trainer-messages" 
                      defaultChecked 
                      disabled={!notificationsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label 
                      htmlFor="achievement-alerts" 
                      className="text-sm flex items-center gap-2"
                    >
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span>Achievement alerts</span>
                    </Label>
                    <Switch 
                      id="achievement-alerts" 
                      defaultChecked 
                      disabled={!notificationsEnabled}
                    />
                  </div>
                </div>
                
                {!notificationsEnabled && (
                  <div className="bg-muted/50 p-3 rounded-md flex gap-3 items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Notifications are disabled</p>
                      <p className="text-muted-foreground">
                        Enable notifications to get timely reminders about your sessions and progress updates.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setActiveTab("settings")}
                >
                  Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Mobile Demo Navigation */}
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="settings" className="hidden md:block">Settings</TabsTrigger>
                <TabsTrigger value="help" className="hidden md:block">Help</TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                {/* Overview Tab */}
                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mobile Dashboard</CardTitle>
                      <CardDescription>
                        Your training at a glance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upcoming Sessions */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Upcoming Sessions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {upcomingSessions.map(session => (
                                <div key={session.id} className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{session.title}</p>
                                    <p className="text-sm text-muted-foreground">{session.date}</p>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Recent Achievements */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Recent Achievements</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {recentAchievements.map(achievement => (
                                <div key={achievement.id} className="flex items-center gap-3">
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <Trophy className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{achievement.title}</p>
                                    <p className="text-sm text-muted-foreground">{achievement.date}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Demo Notification */}
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="mt-6 border rounded-lg shadow-lg p-4 max-w-md mx-auto"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-primary p-2 rounded-md shrink-0">
                            <BellRing className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">Session Reminder</p>
                                <p className="text-sm text-muted-foreground">Tomorrow at 10:00 AM</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm mt-1">
                              Don't forget your HIIT Workout with Coach Pete tomorrow.
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="default" className="h-8">Confirm</Button>
                              <Button size="sm" variant="outline" className="h-8">Reschedule</Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Sessions Tab */}
                <TabsContent value="sessions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Training Sessions</CardTitle>
                      <CardDescription>
                        Schedule and view your upcoming sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Sessions Calendar */}
                        <div className="border rounded-lg p-4">
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                              <div key={i} className="text-center text-sm text-muted-foreground font-medium">
                                {day}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 31 }, (_, i) => (
                              <Button
                                key={i}
                                variant={i === 14 || i === 21 ? "default" : "ghost"}
                                className={`h-10 w-full p-0 ${i < 3 ? "text-muted-foreground" : ""}`}
                                disabled={i < 3}
                              >
                                {i + 1}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Upcoming Sessions */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Upcoming Sessions</h3>
                          
                          <Card className="overflow-hidden">
                            <div className="border-l-4 border-primary p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold">HIIT Workout</h4>
                                  <p className="text-sm text-muted-foreground">Tomorrow, 10:00 AM</p>
                                  <p className="text-sm">45 min with Coach Pete</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">Reschedule</Button>
                                  <Button size="sm">View Details</Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                          
                          <Card className="overflow-hidden">
                            <div className="border-l-4 border-primary p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold">Strength Training</h4>
                                  <p className="text-sm text-muted-foreground">Friday, 2:00 PM</p>
                                  <p className="text-sm">60 min with Coach Pete</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">Reschedule</Button>
                                  <Button size="sm">View Details</Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Book New Session</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Progress Tab */}
                <TabsContent value="progress">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Progress</CardTitle>
                      <CardDescription>
                        Track your fitness journey
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Progress Chart Placeholder */}
                        <Card className="border shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Weight Progress</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="h-[200px] flex items-center justify-center bg-muted/30 rounded-md">
                              <div className="text-center text-muted-foreground">
                                <BarChart className="h-10 w-10 mx-auto mb-2 opacity-70" />
                                <p>Weight tracking chart will appear here</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Progress Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="p-3">
                              <CardTitle className="text-sm">Sessions Completed</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <div className="text-3xl font-bold">24</div>
                              <p className="text-xs text-muted-foreground">+3 from last month</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="p-3">
                              <CardTitle className="text-sm">Goals Achieved</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <div className="text-3xl font-bold">8</div>
                              <p className="text-xs text-muted-foreground">+2 from last month</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="p-3">
                              <CardTitle className="text-sm">Current Weight</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <div className="text-3xl font-bold">72 kg</div>
                              <p className="text-xs text-muted-foreground">-3 kg from start</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="p-3">
                              <CardTitle className="text-sm">Body Fat %</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <div className="text-3xl font-bold">18%</div>
                              <p className="text-xs text-muted-foreground">-2.5% from start</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">View Detailed Progress</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Settings Tab */}
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>App Settings</CardTitle>
                      <CardDescription>
                        Customize your mobile experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Notification Settings */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Notifications</h3>
                        
                        <div className="rounded-md border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="push-notifications">Push notifications</Label>
                            <Switch id="push-notifications" checked={notificationsEnabled} />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="email-reminders">Email reminders</Label>
                            <Switch id="email-reminders" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="quiet-hours">Quiet hours (10 PM - 7 AM)</Label>
                            <Switch id="quiet-hours" defaultChecked />
                          </div>
                        </div>
                      </div>
                      
                      {/* Display Settings */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Display</h3>
                        
                        <div className="rounded-md border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="dark-mode">Dark mode</Label>
                            <Switch id="dark-mode" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="large-text">Larger text</Label>
                            <Switch id="large-text" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="theme-select">Theme</Label>
                            <Select defaultValue="system">
                              <SelectTrigger>
                                <SelectValue placeholder="Select theme" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="system">System</SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Data & Privacy */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Data & Privacy</h3>
                        
                        <div className="rounded-md border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="save-offline">Save workouts offline</Label>
                            <Switch id="save-offline" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="data-usage">Reduce data usage</Label>
                            <Switch id="data-usage" />
                          </div>
                          
                          <Button variant="outline" size="sm">Clear cached data</Button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      <Button className="w-full">Save Settings</Button>
                      <Button variant="ghost" className="w-full">Reset to Defaults</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Help Tab */}
                <TabsContent value="help">
                  <Card>
                    <CardHeader>
                      <CardTitle>Help & Support</CardTitle>
                      <CardDescription>
                        Get assistance with the mobile app
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* FAQ */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Frequently Asked Questions</h3>
                        
                        <div className="rounded-md border divide-y">
                          <div className="p-4">
                            <h4 className="font-medium">How do I install the app?</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Click the "Install PTpal App" button in the mobile experience section. If you're on iOS, add to home screen from your browser menu.
                            </p>
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-medium">Can I access my workouts offline?</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Yes! After loading your workouts once, they'll be available offline as long as you have the "Save workouts offline" setting enabled.
                            </p>
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-medium">Why am I not receiving notifications?</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Make sure notifications are enabled in both the app settings and your device settings. You may also need to restart the app.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Support */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Contact Support</h3>
                        
                        <Card>
                          <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="support-subject">Subject</Label>
                              <Input id="support-subject" placeholder="Issue with notifications" />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="support-message">Message</Label>
                              <Textarea 
                                id="support-message" 
                                placeholder="Please describe the issue you're experiencing..." 
                                rows={4}
                              />
                            </div>
                            
                            <Button className="w-full">Submit Support Request</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Type definitions
interface Trophy extends React.ComponentProps<"svg"> {
  className?: string;
}

function Trophy({ className, ...props }: Trophy) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
