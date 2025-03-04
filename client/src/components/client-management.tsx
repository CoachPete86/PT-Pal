import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@shared/schema";
import { Loader2, UserPlus, Search, AlertCircle, Clock, ArrowUpDown, MoreHorizontal, User as UserIcon, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import ClientProfile from "./client-profile";

export default function ClientManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [isProfileView, setIsProfileView] = useState(false);

  // Add client form state
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    sendWelcomeEmail: true,
  });

  // Get all clients
  const { data: clients, isLoading } = useQuery<User[]>({
    queryKey: ["clients"],
    async queryFn() {
      const response = await apiRequest("GET", "/api/clients");
      return response.json();
    },
  });

  // Add client mutation
  const addClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const response = await apiRequest("POST", "/api/clients", clientData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowAddClientDialog(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        status: "active",
        sendWelcomeEmail: true,
      });
      toast({
        title: "Client added",
        description: "The client has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add client",
        variant: "destructive",
      });
    },
  });

  const filteredClients = clients
    ? clients.filter(
        (client) =>
          client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    addClientMutation.mutate(newClient);
  };

  const handleViewProfile = (clientId: number) => {
    setSelectedClient(clientId);
    setIsProfileView(true);
  };

  if (isProfileView && selectedClient) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setIsProfileView(false)}>
          Back to All Clients
        </Button>
        <ClientProfile clientId={selectedClient} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
        <Button onClick={() => setShowAddClientDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <Tabs defaultValue="all">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Clients</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Clients</CardTitle>
              <CardDescription>
                Manage your client list and view detailed profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No clients found</p>
                  {searchQuery ? (
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search query
                    </p>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowAddClientDialog(true)}
                    >
                      Add your first client
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Session</TableHead>
                        <TableHead>Packages</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">
                            {client.name}
                          </TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div
                                className={`h-2 w-2 rounded-full mr-2 ${
                                  client.status === "active"
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              />
                              {client.status || "Active"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {client.lastSessionDate
                              ? format(
                                  new Date(client.lastSessionDate),
                                  "MMM d, yyyy"
                                )
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            {client.sessionPackages?.length || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleViewProfile(client.id!)}
                                >
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Schedule Session
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Clients</CardTitle>
              <CardDescription>
                Clients with active memberships or recent activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Last Session</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients
                        .filter((client) => client.status === "active")
                        .map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">
                              {client.name}
                            </TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell>
                              {client.lastSessionDate
                                ? format(
                                    new Date(client.lastSessionDate),
                                    "MMM d, yyyy"
                                  )
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewProfile(client.id!)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Clients</CardTitle>
              <CardDescription>
                Clients who haven't been active recently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                  <CardContent className="flex items-center gap-4 p-6">
                    <Clock className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Inactive 30+ Days</p>
                      <h3 className="text-2xl font-bold">
                        {filteredClients.filter(
                          (client) =>
                            client.lastSessionDate &&
                            new Date(client.lastSessionDate) <
                              new Date(
                                Date.now() - 30 * 24 * 60 * 60 * 1000
                              )
                        ).length || 0}
                      </h3>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
                  <CardContent className="flex items-center gap-4 p-6">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Inactive 90+ Days</p>
                      <h3 className="text-2xl font-bold">
                        {filteredClients.filter(
                          (client) =>
                            client.lastSessionDate &&
                            new Date(client.lastSessionDate) <
                              new Date(
                                Date.now() - 90 * 24 * 60 * 60 * 1000
                              )
                        ).length || 0}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Client Dialog */}
      <Dialog
        open={showAddClientDialog}
        onOpenChange={setShowAddClientDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter client details to add them to your list
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddClient}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newClient.status}
                  onValueChange={(value) =>
                    setNewClient({ ...newClient, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="welcome-email"
                  checked={newClient.sendWelcomeEmail}
                  onCheckedChange={(checked) =>
                    setNewClient({
                      ...newClient,
                      sendWelcomeEmail: !!checked,
                    })
                  }
                />
                <Label htmlFor="welcome-email">
                  Send welcome email with account details
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddClientDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addClientMutation.isLoading}
              >
                {addClientMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Client"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}