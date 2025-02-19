
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, UserPlus, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClientManagement() {
  const { toast } = useToast();
  const [newClient, setNewClient] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: ''
  });

  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients'],
    retry: false
  });

  const addClientMutation = useMutation({
    mutationFn: async (clientData: typeof newClient) => {
      const res = await apiRequest('POST', '/api/clients', clientData);
      if (!res.ok) {
        throw new Error('Failed to add client');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setNewClient({ fullName: '', email: '', phone: '', notes: '' });
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

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Client</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label>Notes</Label>
              <Textarea
                value={newClient.notes}
                onChange={e => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
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
  );
}
