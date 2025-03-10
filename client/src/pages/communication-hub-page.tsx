import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video, Phone, PhoneOff, VideoOff, Send, MessageSquare, Users, Clock } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  timestamp: string;
  read: boolean;
  senderName?: string;
  senderAvatar?: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  lastActive?: string;
  unreadCount?: number;
}

export default function CommunicationHubPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [message, setMessage] = useState('');
  const [inCall, setInCall] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Fetch clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      try {
        const response = await apiRequest<Client[]>('/api/clients');
        return response;
      } catch (error) {
        console.error('Error fetching clients:', error);
        return [];
      }
    }
  });

  // Fetch messages for selected client
  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      try {
        const response = await apiRequest<Message[]>(`/api/messages/${selectedClient.id}`);
        return response;
      } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
    },
    enabled: !!selectedClient
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: { content: string; receiverId: number }) => {
      return await apiRequest('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage)
      });
    },
    onSuccess: () => {
      setMessage('');
      refetchMessages();
      queryClient.invalidateQueries({queryKey: ['/api/messages', selectedClient?.id]});
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Handle message sending
  const handleSendMessage = () => {
    if (!message.trim() || !selectedClient) return;
    
    sendMessageMutation.mutate({
      content: message,
      receiverId: selectedClient.id
    });
  };

  // Handle starting a call
  const handleStartCall = (withVideo: boolean) => {
    if (!selectedClient) return;
    
    setInCall(true);
    setVideoEnabled(withVideo);
    
    toast({
      title: 'Call Started',
      description: `${withVideo ? 'Video' : 'Audio'} call with ${selectedClient.name}`,
    });
    
    // In a real implementation, we would initialize WebRTC here
  };

  // Handle ending a call
  const handleEndCall = () => {
    setInCall(false);
    
    toast({
      title: 'Call Ended',
      description: 'The call has been ended.',
    });
    
    // In a real implementation, we would tear down WebRTC connections here
  };

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    // Mark messages as read when viewing chat with a client
    if (selectedClient) {
      // In a real implementation, we would call an API to mark messages as read
    }
  }, [selectedClient]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Communication Hub</h1>
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full max-w-md"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="calls" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Calls</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Clients</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(80vh-10rem)]">
                  <div className="space-y-1 p-2">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`flex items-center justify-between p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                          selectedClient?.id === client.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={client.avatar} />
                            <AvatarFallback>
                              {client.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {client.lastActive ? client.lastActive : 'Never'}
                            </div>
                          </div>
                        </div>
                        {client.unreadCount ? (
                          <Badge variant="default" className="rounded-full">
                            {client.unreadCount}
                          </Badge>
                        ) : null}
                      </div>
                    ))}
                    {clients.length === 0 && (
                      <div className="text-center p-4 text-gray-500">
                        No clients found
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Main Content Area */}
            <Card className="md:col-span-2">
              <TabsContent value="chat" className="mt-0">
                {selectedClient ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="border-b flex-row items-center justify-between p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={selectedClient.avatar} />
                          <AvatarFallback>
                            {selectedClient.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{selectedClient.name}</CardTitle>
                          <div className="text-sm text-gray-500">{selectedClient.email}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleStartCall(false)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleStartCall(true)}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    {/* Chat Messages */}
                    <ScrollArea className="h-[calc(80vh-16rem)] p-4">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                msg.senderId === user?.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-gray-100 dark:bg-gray-800'
                              }`}
                            >
                              <div className="text-sm">{msg.content}</div>
                              <div className="text-xs mt-1 opacity-70">
                                {formatTimestamp(msg.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))}
                        {messages.length === 0 && (
                          <div className="text-center p-8 text-gray-500">
                            No messages yet. Start the conversation!
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-3 border-t">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type your message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={!message.trim()} 
                          size="icon"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[calc(80vh-10rem)]">
                    <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                    <p className="text-gray-500">
                      Choose a client from the list to start chatting
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="calls" className="mt-0">
                {inCall ? (
                  <div className="h-[calc(80vh-10rem)] flex flex-col">
                    {/* Call Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={selectedClient?.avatar} />
                          <AvatarFallback>
                            {selectedClient?.name.split(' ').map((n) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {selectedClient?.name || 'Unknown Client'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {videoEnabled ? 'Video' : 'Audio'} call in progress...
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">LIVE</Badge>
                    </div>
                    
                    {/* Call Video Area */}
                    <div className="flex-1 bg-gray-900 relative flex items-center justify-center">
                      {videoEnabled ? (
                        <div className="text-white text-center">
                          <Video className="h-20 w-20 mx-auto mb-4 opacity-20" />
                          <p>Video stream would appear here</p>
                          <p className="text-sm opacity-70 mt-2">
                            (Requires WebRTC implementation)
                          </p>
                        </div>
                      ) : (
                        <div className="text-white text-center">
                          <Phone className="h-20 w-20 mx-auto mb-4 opacity-20" />
                          <p>Audio call in progress</p>
                          <p className="text-sm opacity-70 mt-2">
                            (Voice-only call)
                          </p>
                        </div>
                      )}
                      
                      {/* Self-view */}
                      {videoEnabled && (
                        <div className="absolute bottom-4 right-4 w-1/4 h-1/4 max-w-[200px] max-h-[150px] bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
                          <Avatar className="h-20 w-20">
                            <AvatarFallback>
                              {user?.id ? user.id.toString().charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                    
                    {/* Call Controls */}
                    <div className="p-4 border-t flex items-center justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className={!audioEnabled ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400' : ''}
                        onClick={() => setAudioEnabled(!audioEnabled)}
                      >
                        {audioEnabled ? <Phone className="h-5 w-5" /> : <PhoneOff className="h-5 w-5" />}
                      </Button>
                      
                      {videoEnabled && (
                        <Button
                          variant="outline"
                          size="icon"
                          className={!videoEnabled ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400' : ''}
                          onClick={() => setVideoEnabled(!videoEnabled)}
                        >
                          {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </Button>
                      )}
                      
                      <Button
                        variant="destructive"
                        onClick={handleEndCall}
                      >
                        End Call
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[calc(80vh-10rem)]">
                    <Phone className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No active calls</h3>
                    <p className="text-gray-500 mb-6 text-center max-w-md">
                      Start a voice or video call with a client by selecting them from the list and clicking on the call buttons
                    </p>
                    
                    {selectedClient ? (
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline"
                          onClick={() => handleStartCall(false)}
                          className="flex items-center space-x-2"
                        >
                          <Phone className="h-4 w-4" />
                          <span>Voice Call</span>
                        </Button>
                        <Button 
                          onClick={() => handleStartCall(true)}
                          className="flex items-center space-x-2"
                        >
                          <Video className="h-4 w-4" />
                          <span>Video Call</span>
                        </Button>
                      </div>
                    ) : (
                      <p className="text-amber-600 dark:text-amber-400 text-sm">
                        Please select a client first
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}