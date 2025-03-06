
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  ImagePlus,
  Send,
  MoreVertical,
  User,
  Camera,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Bell,
  Award,
  Clock,
  Loader2,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  avatar?: string;
  status: "active" | "inactive" | "pending";
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Array<{
    id: string;
    type: "image" | "document";
    url: string;
    name: string;
  }>;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: "pending" | "achieved" | "missed";
}

interface CheckIn {
  id: string;
  date: string;
  status: "scheduled" | "completed" | "missed";
  responses?: Record<string, string>;
}

// Dummy data
const mockClients: Client[] = [
  {
    id: "c1",
    name: "Jane Cooper",
    email: "jane.cooper@example.com",
    lastActive: "2023-11-28T14:30:00",
    status: "active",
  },
  {
    id: "c2",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    lastActive: "2023-11-25T09:15:00",
    status: "inactive",
  },
  {
    id: "c3",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    lastActive: "2023-11-27T16:45:00",
    status: "active",
  },
  {
    id: "c4",
    name: "Michael Smith",
    email: "michael.smith@example.com",
    lastActive: "2023-11-20T11:20:00",
    status: "inactive",
  },
  {
    id: "c5",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    lastActive: "2023-11-28T10:00:00",
    status: "active",
  },
];

const mockMessages: Record<string, Message[]> = {
  c1: [
    {
      id: "m1",
      senderId: "coach",
      senderName: "Coach",
      content: "How are you feeling after yesterday's session?",
      timestamp: "2023-11-27T09:30:00",
      isRead: true,
    },
    {
      id: "m2",
      senderId: "c1",
      senderName: "Jane Cooper",
      content: "I'm feeling great, although my legs are a bit sore!",
      timestamp: "2023-11-27T10:15:00",
      isRead: true,
    },
    {
      id: "m3",
      senderId: "coach",
      senderName: "Coach",
      content:
        "That's normal! Make sure to do the recovery stretches I sent you. Would you like me to add some extra mobility work to your next session?",
      timestamp: "2023-11-27T10:20:00",
      isRead: true,
    },
    {
      id: "m4",
      senderId: "c1",
      senderName: "Jane Cooper",
      content: "Yes, that would be great. Thank you!",
      timestamp: "2023-11-27T10:25:00",
      isRead: true,
    },
  ],
  c3: [
    {
      id: "m5",
      senderId: "coach",
      senderName: "Coach",
      content:
        "Here's the nutrition plan we discussed. Let me know if you have any questions!",
      timestamp: "2023-11-26T14:00:00",
      isRead: true,
      attachments: [
        {
          id: "a1",
          type: "document",
          url: "#",
          name: "Nutrition_Plan_Emily.pdf",
        },
      ],
    },
    {
      id: "m6",
      senderId: "c3",
      senderName: "Emily Davis",
      content:
        "Thanks! I'll look it over and get started tomorrow. Do you recommend any specific breakfast recipes?",
      timestamp: "2023-11-26T15:30:00",
      isRead: true,
    },
  ],
};

const mockMilestones: Record<string, Milestone[]> = {
  c1: [
    {
      id: "ms1",
      title: "Run 5K without stopping",
      description: "Complete a 5K run without walking breaks",
      targetDate: "2023-12-15",
      status: "pending",
    },
    {
      id: "ms2",
      title: "Lose 5kg",
      description: "Reach initial weight loss target",
      targetDate: "2023-11-30",
      completedDate: "2023-11-28",
      status: "achieved",
    },
    {
      id: "ms3",
      title: "Perfect push-up form",
      description: "Perform 10 push-ups with correct form",
      targetDate: "2023-11-15",
      status: "missed",
    },
  ],
  c3: [
    {
      id: "ms4",
      title: "Complete first pull-up",
      description: "Perform one unassisted pull-up",
      targetDate: "2023-12-20",
      status: "pending",
    },
    {
      id: "ms5",
      title: "30-day meditation streak",
      description: "Complete 30 consecutive days of meditation",
      targetDate: "2023-12-01",
      status: "pending",
    },
  ],
  c5: [
    {
      id: "ms6",
      title: "Deadlift 100kg",
      description: "Safely deadlift 100kg with proper form",
      targetDate: "2023-12-10",
      status: "pending",
    },
  ],
};

const mockCheckIns: Record<string, CheckIn[]> = {
  c1: [
    {
      id: "ci1",
      date: "2023-11-20",
      status: "completed",
      responses: {
        sleep: "7 hours",
        stress: "Medium",
        nutrition: "Followed plan 80%",
        energy: "Good",
        soreness: "Slight in legs",
        notes: "Felt strong during cardio today",
      },
    },
    {
      id: "ci2",
      date: "2023-11-27",
      status: "completed",
      responses: {
        sleep: "8 hours",
        stress: "Low",
        nutrition: "Followed plan 90%",
        energy: "Great",
        soreness: "None",
        notes: "Best workout week so far!",
      },
    },
    {
      id: "ci3",
      date: "2023-12-04",
      status: "scheduled",
    },
  ],
  c3: [
    {
      id: "ci4",
      date: "2023-11-27",
      status: "missed",
    },
    {
      id: "ci5",
      date: "2023-12-04",
      status: "scheduled",
    },
  ],
};

// Form schemas
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetDate: z.string().min(1, "Target date is required"),
});

const checkInSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  date: z.string().min(1, "Date is required"),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      type: z.enum(["text", "scale", "select"]),
      options: z.array(z.string()).optional(),
    }),
  ),
});

const checkInResponseSchema = z.object({
  sleep: z.string().min(1, "Sleep information is required"),
  stress: z.string().min(1, "Stress level is required"),
  nutrition: z.string().min(1, "Nutrition information is required"),
  energy: z.string().min(1, "Energy level is required"),
  soreness: z.string().optional(),
  notes: z.string().optional(),
});

export default function ClientEngagementHub() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("messages");
  const [activeMilestoneDialog, setActiveMilestoneDialog] = useState<
    "add" | "edit" | null
  >(null);
  const [selectedMilestone, setSelectedMilestone] =
    useState<Milestone | null>(null);
  const [messageImage, setMessageImage] = useState<File | null>(null);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const messageForm = useForm<{ content: string }>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const milestoneForm = useForm<{
    title: string;
    description: string;
    targetDate: string;
  }>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      description: "",
      targetDate: "",
    },
  });

  const checkInForm = useForm<{
    sleep: string;
    stress: string;
    nutrition: string;
    energy: string;
    soreness: string;
    notes: string;
  }>({
    resolver: zodResolver(checkInResponseSchema),
    defaultValues: {
      sleep: "",
      stress: "",
      nutrition: "",
      energy: "",
      soreness: "",
      notes: "",
    },
  });

  const filteredClients = mockClients.filter((client) =>
    client.status !== "pending"
  );

  const inactiveClients = mockClients.filter(
    (client) => {
      const lastActive = new Date(client.lastActive);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    }
  );

  const getClientMessages = (clientId: string) => {
    return mockMessages[clientId] || [];
  };

  const getClientMilestones = (clientId: string) => {
    return mockMilestones[clientId] || [];
  };

  const getClientCheckIns = (clientId: string) => {
    return mockCheckIns[clientId] || [];
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setActiveTab("messages");
  };

  const handleSendMessage = async (data: { content: string }) => {
    if (!selectedClient) return;
    
    setIsSending(true);
    
    try {
      // In a real application, this would be an API call
      // await axios.post('/api/messages', {
      //   clientId: selectedClient.id,
      //   content: data.content,
      //   attachments: messageImage ? [messageImage] : []
      // });
      
      // Mock success
      const newMessage: Message = {
        id: `m${Date.now()}`,
        senderId: "coach",
        senderName: "Coach",
        content: data.content,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      
      // Update mock data (would be handled by the backend in a real app)
      if (!mockMessages[selectedClient.id]) {
        mockMessages[selectedClient.id] = [];
      }
      mockMessages[selectedClient.id].push(newMessage);
      
      messageForm.reset();
      setMessageImage(null);
      
      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleAddMilestone = async (data: { title: string; description: string; targetDate: string }) => {
    if (!selectedClient) return;
    
    try {
      // In a real application, this would be an API call
      // await axios.post('/api/milestones', {
      //   clientId: selectedClient.id,
      //   ...data
      // });
      
      // Mock success
      const newMilestone: Milestone = {
        id: `ms${Date.now()}`,
        title: data.title,
        description: data.description,
        targetDate: data.targetDate,
        status: "pending",
      };
      
      // Update mock data (would be handled by the backend in a real app)
      if (!mockMilestones[selectedClient.id]) {
        mockMilestones[selectedClient.id] = [];
      }
      mockMilestones[selectedClient.id].push(newMilestone);
      
      milestoneForm.reset();
      setActiveMilestoneDialog(null);
      
      toast({
        title: "Milestone added",
        description: "The milestone has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding milestone:", error);
      toast({
        variant: "destructive",
        title: "Failed to add milestone",
        description: "Please try again.",
      });
    }
  };

  const handleUpdateMilestoneStatus = async (milestone: Milestone, newStatus: "pending" | "achieved" | "missed") => {
    if (!selectedClient) return;
    
    try {
      // In a real application, this would be an API call
      // await axios.patch(`/api/milestones/${milestone.id}`, {
      //   status: newStatus,
      //   completedDate: newStatus === 'achieved' ? new Date().toISOString() : undefined
      // });
      
      // Mock success
      const updatedMilestone = {
        ...milestone,
        status: newStatus,
        completedDate: newStatus === 'achieved' ? new Date().toISOString() : undefined,
      };
      
      // Update mock data (would be handled by the backend in a real app)
      const clientMilestones = mockMilestones[selectedClient.id] || [];
      const updatedMilestones = clientMilestones.map(m => 
        m.id === milestone.id ? updatedMilestone : m
      );
      mockMilestones[selectedClient.id] = updatedMilestones;
      
      toast({
        title: "Milestone updated",
        description: `Milestone marked as ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast({
        variant: "destructive",
        title: "Failed to update milestone",
        description: "Please try again.",
      });
    }
  };

  const handleSubmitCheckIn = async (data: any) => {
    if (!selectedClient) return;
    
    try {
      // In a real application, this would be an API call
      // await axios.post('/api/check-ins/respond', {
      //   clientId: selectedClient.id,
      //   checkInId: activeCheckIn.id,
      //   responses: data
      // });
      
      // Mock success
      const checkIns = getClientCheckIns(selectedClient.id);
      const currentCheckIn = checkIns.find(ci => ci.status === 'scheduled');
      
      if (currentCheckIn) {
        currentCheckIn.status = 'completed';
        currentCheckIn.responses = data;
      }
      
      setShowCheckInForm(false);
      checkInForm.reset();
      
      toast({
        title: "Check-in completed",
        description: "Your check-in has been submitted successfully.",
      });
    } catch (error) {
      console.error("Error submitting check-in:", error);
      toast({
        variant: "destructive",
        title: "Failed to submit check-in",
        description: "Please try again.",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessageImage(file);
    }
  };

  const handleRemoveImage = () => {
    setMessageImage(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col space-y-1.5 pb-4">
        <h2 className="text-2xl font-bold">Client Engagement Hub</h2>
        <p className="text-muted-foreground">
          Communicate, track goals, and stay connected with your clients
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* Client List */}
        <div className="md:w-72 flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Clients</CardTitle>
              <CardDescription>
                {filteredClients.length} active clients
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="px-4 py-2">
                  <div className="space-y-1">
                    {filteredClients.map((client) => (
                      <Button
                        key={client.id}
                        variant={
                          selectedClient?.id === client.id
                            ? "secondary"
                            : "ghost"
                        }
                        className="w-full justify-start font-normal"
                        onClick={() => handleSelectClient(client)}
                      >
                        <div className="flex items-center w-full">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback>
                              {client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{client.name}</span>
                          {client.status === "active" ? (
                            <div className="ml-auto h-2 w-2 rounded-full bg-green-500" />
                          ) : (
                            <div className="ml-auto h-2 w-2 rounded-full bg-gray-300" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  {inactiveClients.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                        Inactive Clients
                      </h3>
                      <div className="space-y-1">
                        {inactiveClients.map((client) => (
                          <Button
                            key={client.id}
                            variant="ghost"
                            className="w-full justify-start font-normal text-muted-foreground"
                            onClick={() => handleSelectClient(client)}
                          >
                            <div className="flex items-center w-full">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback>
                                  {client.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate">{client.name}</span>
                              <Bell className="ml-auto h-3 w-3 text-amber-500" />
                            </div>
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Client Details */}
        {selectedClient ? (
          <div className="flex-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {selectedClient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedClient.name}</CardTitle>
                      <CardDescription>{selectedClient.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge
                      variant={
                        selectedClient.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedClient.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <div className="px-4 py-2 border-b">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="messages" className="flex gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      <span>Messages</span>
                    </TabsTrigger>
                    <TabsTrigger value="goals" className="flex gap-1.5">
                      <Award className="h-4 w-4" />
                      <span>Milestones</span>
                    </TabsTrigger>
                    <TabsTrigger value="checkins" className="flex gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>Check-ins</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <CardContent className="flex-1 p-0">
                {activeTab === "messages" && (
                  <div className="flex flex-col h-full">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {getClientMessages(selectedClient.id).map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === "coach"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex max-w-[80%] ${
                                message.senderId === "coach"
                                  ? "flex-row-reverse"
                                  : "flex-row"
                              }`}
                            >
                              <Avatar
                                className={`h-8 w-8 ${
                                  message.senderId === "coach"
                                    ? "ml-2"
                                    : "mr-2"
                                }`}
                              >
                                <AvatarFallback
                                  className={
                                    message.senderId === "coach"
                                      ? "bg-primary text-primary-foreground"
                                      : ""
                                  }
                                >
                                  {message.senderName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div
                                  className={`px-4 py-3 rounded-lg ${
                                    message.senderId === "coach"
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  {message.attachments?.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="mt-2 flex items-center gap-2 text-xs bg-background/40 p-2 rounded"
                                    >
                                      <a
                                        href={attachment.url}
                                        className="flex items-center gap-1 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {attachment.name}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                                <div
                                  className={`text-xs text-muted-foreground mt-1 ${
                                    message.senderId === "coach"
                                      ? "text-right"
                                      : "text-left"
                                  }`}
                                >
                                  {formatTime(message.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="p-4 border-t">
                      <Form {...messageForm}>
                        <form
                          onSubmit={messageForm.handleSubmit(handleSendMessage)}
                          className="space-y-3"
                        >
                          {messageImage && (
                            <div className="relative inline-block">
                              <div className="border rounded overflow-hidden p-1">
                                <img
                                  src={URL.createObjectURL(messageImage)}
                                  alt="Upload preview"
                                  className="h-20 w-auto rounded"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6"
                                  onClick={handleRemoveImage}
                                >
                                  &times;
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <FormField
                              control={messageForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <div className="flex items-center border rounded-md px-3 py-2 relative">
                                      <Textarea
                                        {...field}
                                        placeholder="Type your message..."
                                        className="flex-1 border-0 focus-visible:ring-0 p-0 resize-none h-10 max-h-32"
                                      />
                                      <div className="flex gap-2 items-center">
                                        <label
                                          htmlFor="image-upload"
                                          className="cursor-pointer p-1.5 rounded-md hover:bg-muted"
                                        >
                                          <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                          <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="submit"
                              size="icon"
                              disabled={isSending || !messageForm.formState.isValid}
                              className="h-12 w-12"
                            >
                              {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Quick Responses
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>Templates</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    messageForm.setValue(
                                      "content",
                                      "How are you feeling after your last workout? Any soreness or feedback to share?"
                                    );
                                  }}
                                >
                                  Post-workout check
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    messageForm.setValue(
                                      "content",
                                      "Just checking in! I noticed you haven't logged a workout recently. Is everything going well?"
                                    );
                                  }}
                                >
                                  Missed session follow-up
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    messageForm.setValue(
                                      "content",
                                      "Great progress this week! Keep up the good work on your goals."
                                    );
                                  }}
                                >
                                  Positive reinforcement
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    messageForm.setValue(
                                      "content",
                                      "I've prepared your updated workout plan for next week. Let me know if you have any questions!"
                                    );
                                  }}
                                >
                                  New workout plan
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Schedule Message</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Schedule Message</DialogTitle>
                                  <DialogDescription>
                                    Select a date and time to send this message automatically.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="grid gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="scheduled-date">Date</Label>
                                      <Input 
                                        id="scheduled-date" 
                                        type="date" 
                                        min={new Date().toISOString().split('T')[0]}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="scheduled-time">Time</Label>
                                      <Input id="scheduled-time" type="time" />
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button>Schedule</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </div>
                )}

                {activeTab === "goals" && (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Client Milestones</h3>
                      <Dialog
                        open={activeMilestoneDialog === "add"}
                        onOpenChange={(open) =>
                          setActiveMilestoneDialog(open ? "add" : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setActiveMilestoneDialog("add")}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add Milestone
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Milestone</DialogTitle>
                            <DialogDescription>
                              Create a new milestone for{" "}
                              {selectedClient.name}
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...milestoneForm}>
                            <form
                              onSubmit={milestoneForm.handleSubmit(
                                handleAddMilestone
                              )}
                              className="space-y-4"
                            >
                              <FormField
                                control={milestoneForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., Run 5K"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={milestoneForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Describe the milestone"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={milestoneForm.control}
                                name="targetDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Target Date</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="date"
                                        {...field}
                                        min={new Date()
                                          .toISOString()
                                          .split("T")[0]}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    setActiveMilestoneDialog(null)
                                  }
                                >
                                  Cancel
                                </Button>
                                <Button type="submit">Add Milestone</Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {getClientMilestones(selectedClient.id).length === 0 ? (
                      <div className="text-center py-8">
                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">No milestones yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                          Create milestones to help your client track their progress and stay motivated
                        </p>
                        <Button
                          onClick={() => setActiveMilestoneDialog("add")}
                        >
                          Add First Milestone
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Upcoming/Pending Milestones */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            UPCOMING
                          </h4>
                          {getClientMilestones(selectedClient.id)
                            .filter((m) => m.status === "pending")
                            .map((milestone) => (
                              <Card key={milestone.id} className="overflow-hidden">
                                <CardHeader className="pb-2 pt-4">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">
                                      {milestone.title}
                                    </CardTitle>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() => handleUpdateMilestoneStatus(milestone, "achieved")}
                                        >
                                          Mark as Achieved
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleUpdateMilestoneStatus(milestone, "missed")}
                                        >
                                          Mark as Missed
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Delete</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <CardDescription>
                                    {milestone.description}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-4">
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                      <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                                      <span>
                                        Target: {formatDate(milestone.targetDate)}
                                      </span>
                                    </div>
                                    <Badge variant="outline">Pending</Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}

                          {getClientMilestones(selectedClient.id).filter(
                            (m) => m.status === "pending"
                          ).length === 0 && (
                            <div className="rounded-lg border p-4 text-center text-muted-foreground">
                              No upcoming milestones
                            </div>
                          )}
                        </div>

                        {/* Completed Milestones */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            ACHIEVED
                          </h4>
                          {getClientMilestones(selectedClient.id)
                            .filter((m) => m.status === "achieved")
                            .map((milestone) => (
                              <Card key={milestone.id} className="overflow-hidden bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900">
                                <CardHeader className="pb-2 pt-4">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-base flex items-center">
                                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                      {milestone.title}
                                    </CardTitle>
                                  </div>
                                  <CardDescription>
                                    {milestone.description}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-4">
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                      <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                                      <span>
                                        Completed:{" "}
                                        {formatDate(
                                          milestone.completedDate ||
                                            milestone.targetDate
                                        )}
                                      </span>
                                    </div>
                                    <Badge variant="success">Achieved</Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}

                          {getClientMilestones(selectedClient.id).filter(
                            (m) => m.status === "achieved"
                          ).length === 0 && (
                            <div className="rounded-lg border p-4 text-center text-muted-foreground">
                              No achieved milestones yet
                            </div>
                          )}
                        </div>

                        {/* Missed Milestones */}
                        {getClientMilestones(selectedClient.id).some(
                          (m) => m.status === "missed"
                        ) && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">
                              MISSED
                            </h4>
                            {getClientMilestones(selectedClient.id)
                              .filter((m) => m.status === "missed")
                              .map((milestone) => (
                                <Card key={milestone.id} className="overflow-hidden bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900">
                                  <CardHeader className="pb-2 pt-4">
                                    <div className="flex justify-between items-start">
                                      <CardTitle className="text-base flex items-center">
                                        <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                                        {milestone.title}
                                      </CardTitle>
                                    </div>
                                    <CardDescription>
                                      {milestone.description}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="pb-4">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center">
                                        <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                                        <span>
                                          Target: {formatDate(milestone.targetDate)}
                                        </span>
                                      </div>
                                      <Badge variant="outline" className="text-amber-600 bg-amber-100 border-amber-300 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800">
                                        Missed
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "checkins" && (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Client Check-ins</h3>
                      <Button size="sm">
                        <Plus className="mr-1 h-4 w-4" />
                        Schedule Check-in
                      </Button>
                    </div>

                    {showCheckInForm ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Weekly Check-in</CardTitle>
                          <CardDescription>
                            Track your progress and share your feedback
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Form {...checkInForm}>
                            <form
                              onSubmit={checkInForm.handleSubmit(
                                handleSubmitCheckIn
                              )}
                              className="space-y-4"
                            >
                              <FormField
                                control={checkInForm.control}
                                name="sleep"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Sleep Quality</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Hours of sleep per night"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={checkInForm.control}
                                name="stress"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Stress Level</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="High, Medium, Low"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={checkInForm.control}
                                name="nutrition"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nutrition Adherence</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="How well did you follow your plan?"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={checkInForm.control}
                                name="energy"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Energy Level</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Overall energy level"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={checkInForm.control}
                                name="soreness"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Muscle Soreness</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Any notable soreness"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={checkInForm.control}
                                name="notes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Additional Notes</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Any other information you want to share"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowCheckInForm(false)}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit">Submit Check-in</Button>
                              </div>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {/* Scheduled Check-in */}
                        {getClientCheckIns(selectedClient.id).some(
                          (ci) => ci.status === "scheduled"
                        ) && (
                          <Card className="border-primary border-2">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between">
                                <div>
                                  <CardTitle className="flex items-center text-base">
                                    <Bell className="mr-2 h-4 w-4 text-primary" />
                                    Upcoming Check-in
                                  </CardTitle>
                                  <CardDescription>
                                    {formatDate(
                                      getClientCheckIns(
                                        selectedClient.id
                                      ).find(
                                        (ci) => ci.status === "scheduled"
                                      )?.date || ""
                                    )}
                                  </CardDescription>
                                </div>
                                <Button onClick={() => setShowCheckInForm(true)}>
                                  Complete Now
                                </Button>
                              </div>
                            </CardHeader>
                          </Card>
                        )}

                        {/* Check-in History */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            HISTORY
                          </h4>

                          {getClientCheckIns(selectedClient.id)
                            .filter((ci) => ci.status !== "scheduled")
                            .length === 0 ? (
                            <div className="rounded-lg border p-4 text-center text-muted-foreground">
                              No check-in history
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {getClientCheckIns(selectedClient.id)
                                .filter((ci) => ci.status !== "scheduled")
                                .sort(
                                  (a, b) =>
                                    new Date(b.date).getTime() -
                                    new Date(a.date).getTime()
                                )
                                .map((checkIn) => (
                                  <Card key={checkIn.id} className="overflow-hidden">
                                    <CardHeader className="pb-2">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <CardTitle className="text-base">
                                            {formatDate(checkIn.date)} Check-in
                                          </CardTitle>
                                          <CardDescription>
                                            {checkIn.status === "completed"
                                              ? "Completed"
                                              : "Missed"}
                                          </CardDescription>
                                        </div>
                                        <Badge
                                          variant={
                                            checkIn.status === "completed"
                                              ? "success"
                                              : "secondary"
                                          }
                                        >
                                          {checkIn.status === "completed"
                                            ? "Completed"
                                            : "Missed"}
                                        </Badge>
                                      </div>
                                    </CardHeader>
                                    
                                    {checkIn.responses && (
                                      <CardContent>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          {Object.entries(checkIn.responses)
                                            .filter(([key]) => key !== "notes")
                                            .map(([key, value]) => (
                                              <div key={key} className="space-y-1">
                                                <p className="text-xs text-muted-foreground capitalize">
                                                  {key}
                                                </p>
                                                <p className="font-medium">
                                                  {value}
                                                </p>
                                              </div>
                                            ))}
                                        </div>
                                        
                                        {checkIn.responses.notes && (
                                          <div className="mt-3 pt-3 border-t text-sm">
                                            <p className="text-xs text-muted-foreground mb-1">
                                              Notes
                                            </p>
                                            <p>{checkIn.responses.notes}</p>
                                          </div>
                                        )}
                                      </CardContent>
                                    )}
                                  </Card>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-sm space-y-4">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Select a Client</h3>
              <p className="text-muted-foreground">
                Choose a client from the list to view their details, manage
                communications, and track their progress.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
