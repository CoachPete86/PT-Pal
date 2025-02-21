import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, UserPlus, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';

export default function ClientManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    status: 'active',
    goals: '',
    healthConditions: ''
  });

  const { data: workspace, isLoading: isWorkspaceLoading } = useQuery({
    queryKey: ['/api/workspace'],
    retry: false
  });

  const { data: clients, isLoading: isClientsLoading } = useQuery({
    queryKey: ['/api/clients'],
    retry: false
  });

  const addClientMutation = useMutation({
    mutationFn: async (clientData) => {
      if (!workspace?.id) {
        throw new Error('Workspace not found. Please contact support.');
      }
      const res = await apiRequest('POST', '/api/clients', {
        ...clientData,
        workspaceId: workspace.id
      });
      if (!res.ok) {
        throw new Error('Failed to add client');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setNewClient({ 
        fullName: '', 
        email: '', 
        phone: '', 
        notes: '', 
        status: 'active',
        goals: '',
        healthConditions: ''
      });
      setShowAddForm(false);
      toast({
        title: 'Success',
        description: 'New client has been successfully added.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClientMutation.mutate(newClient);
  };

  const isLoading = isWorkspaceLoading || isClientsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-48 flex-col gap-4">
        <p className="text-muted-foreground">Workspace not found. Please contact support.</p>
      </div>
    );
  }

  const filteredClients = clients?.filter(client => {
    const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="h-screen w-full p-4 flex flex-col">
      {!showAddForm ? (
        <>
          {/* Client List View */}
          <div className="flex flex-col h-full">
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
              <div className="flex-1">
                <Label>Search Clients</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label>Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Client Table */}
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Clients</CardTitle>
                <Button onClick={() => setShowAddForm(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Client
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Next Session</TableHead>
                        <TableHead>Sessions Left</TableHead>
                        <TableHead>Last Update</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients?.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{client.fullName}</div>
                              <div className="text-sm text-muted-foreground">{client.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{client.nextSession || 'No session scheduled'}</TableCell>
                          <TableCell>{client.sessionsRemaining || 0}</TableCell>
                          <TableCell>{client.lastUpdate ? new Date(client.lastUpdate).toLocaleDateString() : 'No updates'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* Add New Client Form */
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add New Client</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={newClient.fullName}
                    onChange={e => setNewClient(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newClient.email}
                    onChange={e => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={newClient.phone}
                    onChange={e => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={newClient.status}
                    onValueChange={(value) => setNewClient(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Goals</Label>
                  <Textarea
                    value={newClient.goals}
                    onChange={e => setNewClient(prev => ({ ...prev, goals: e.target.value }))}
                    placeholder="Client's fitness and health goals..."
                    className="h-20"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Health Conditions & Contraindications</Label>
                  <Textarea
                    value={newClient.healthConditions}
                    onChange={e => setNewClient(prev => ({ ...prev, healthConditions: e.target.value }))}
                    placeholder="Any relevant health conditions or contraindications..."
                    className="h-20"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={newClient.notes}
                    onChange={e => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes about the client..."
                    className="h-20"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={addClientMutation.isPending}
              >
                {addClientMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Add Client
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}