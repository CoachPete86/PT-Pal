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
import { Loader2, UserPlus, Search, X, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { User, Workspace } from '@shared/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface NewClientData {
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
  status: 'active' | 'inactive';
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  birthdate?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;

  // Physical Information
  height?: number; // in cm
  weight?: number; // in kg
  bodyFatPercentage?: number;

  // Fitness Profile
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoals?: string[];
  preferredWorkoutTimes?: string[];
  availableDays?: string[];

  // Health Information
  medicalConditions?: string;
  injuries?: string;
  medications?: string;
  allergies?: string;

  // Previous Experience
  previousExperience?: string;
  preferredActivities?: string[];
  dislikedExercises?: string[];

  // Nutrition Information
  dietaryRestrictions?: string[];
  mealsPerDay?: number;
  supplementsUsed?: string;
  waterIntake?: string;

  // Assessments
  hasInitialAssessment?: boolean;

  // Preferences
  goals?: string;
  healthConditions?: string;
}

export default function ClientManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTab, setFormTab] = useState('basic');
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClient, setNewClient] = useState<NewClientData>({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    status: 'active',
    fitnessLevel: 'intermediate',
    goals: '',
    healthConditions: '',
    fitnessGoals: [],
    preferredWorkoutTimes: [],
    availableDays: [],
    dietaryRestrictions: [],
    hasInitialAssessment: false,
  });

  const { data: workspace, isLoading: isWorkspaceLoading } = useQuery<Workspace>({
    queryKey: ['/api/workspace'],
    retry: false
  });

  const { data: clients, isLoading: isClientsLoading } = useQuery<User[]>({
    queryKey: ['/api/clients'],
    retry: false
  });

  const addClientMutation = useMutation({
    mutationFn: async (clientData: NewClientData) => {
      setIsSubmitting(true);
      if (!workspace?.id) {
        throw new Error('Workspace not found. Please contact support.');
      }

      // Format the data for API consumption
      const formattedData = {
        ...clientData,
        workspaceId: workspace.id,
        preferences: {
          goals: clientData.goals,
          healthConditions: clientData.healthConditions,
          gender: clientData.gender,
          birthdate: clientData.birthdate,
          fitnessLevel: clientData.fitnessLevel,
          height: clientData.height,
          weight: clientData.weight,
          bodyFatPercentage: clientData.bodyFatPercentage,
          fitnessGoals: clientData.fitnessGoals,
          preferredWorkoutTimes: clientData.preferredWorkoutTimes,
          availableDays: clientData.availableDays,
          medicalConditions: clientData.medicalConditions,
          injuries: clientData.injuries,
          medications: clientData.medications,
          allergies: clientData.allergies,
          previousExperience: clientData.previousExperience,
          preferredActivities: clientData.preferredActivities,
          dislikedExercises: clientData.dislikedExercises,
          dietaryRestrictions: clientData.dietaryRestrictions,
          mealsPerDay: clientData.mealsPerDay,
          supplementsUsed: clientData.supplementsUsed,
          waterIntake: clientData.waterIntake,
          hasInitialAssessment: clientData.hasInitialAssessment,
          emergencyContact: clientData.emergencyContact,
          emergencyPhone: clientData.emergencyPhone,
          address: clientData.address,
        }
      };

      const res = await apiRequest('POST', '/api/clients', formattedData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add client');
      }
      return res.json();
    },
    onSuccess: () => {
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setNewClient({
        fullName: '',
        email: '',
        phone: '',
        notes: '',
        status: 'active',
        fitnessLevel: 'intermediate',
        goals: '',
        healthConditions: '',
        fitnessGoals: [],
        preferredWorkoutTimes: [],
        availableDays: [],
        dietaryRestrictions: [],
        hasInitialAssessment: false,
      });
      setShowAddForm(false);
      setFormStep(1);
      setFormTab('basic');
      toast({
        title: 'Success',
        description: 'New client has been successfully added.',
      });
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['fullName', 'email'];
    const missingFields = requiredFields.filter(field => !newClient[field as keyof NewClientData]);

    if (missingFields.length > 0) {
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in the following required fields: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    addClientMutation.mutate(newClient);
  };

  const goToNextStep = () => {
    if (formStep < 5) {
      setFormStep(formStep + 1);

      // Set the correct tab based on the step
      if (formStep === 1) setFormTab('physical');
      else if (formStep === 2) setFormTab('fitness');
      else if (formStep === 3) setFormTab('health');
      else if (formStep === 4) setFormTab('nutrition');
    }
  };

  const goToPreviousStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);

      // Set the correct tab based on the step
      if (formStep === 2) setFormTab('basic');
      else if (formStep === 3) setFormTab('physical');
      else if (formStep === 4) setFormTab('fitness');
      else if (formStep === 5) setFormTab('health');
    }
  };

  const handleTabChange = (tab: string) => {
    setFormTab(tab);
    // Update formStep based on tab
    if (tab === 'basic') setFormStep(1);
    else if (tab === 'physical') setFormStep(2);
    else if (tab === 'fitness') setFormStep(3);
    else if (tab === 'health') setFormStep(4);
    else if (tab === 'nutrition') setFormStep(5);
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
    const matchesSearch = (client.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                          <TableCell>No session scheduled</TableCell>
                          <TableCell>0</TableCell>
                          <TableCell>{client.lastActive ? new Date(client.lastActive).toLocaleDateString() : 'No updates'}</TableCell>
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
            {/* Step Indicator */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div className={`flex-1 text-center ${formStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Basic Info
                </div>
                <div className={`flex-1 text-center ${formStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Physical
                </div>
                <div className={`flex-1 text-center ${formStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Fitness
                </div>
                <div className={`flex-1 text-center ${formStep >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Health
                </div>
                <div className={`flex-1 text-center ${formStep >= 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Nutrition
                </div>
              </div>
              <div className="w-full bg-muted h-2 mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(formStep / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={formTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="physical">Physical</TabsTrigger>
                  <TabsTrigger value="fitness">Fitness</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                  <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        value={newClient.fullName}
                        onChange={e => setNewClient(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email <span className="text-red-500">*</span></Label>
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
                        onValueChange={(value: 'active' | 'inactive') => setNewClient(prev => ({ ...prev, status: value }))}
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
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select 
                        value={newClient.gender}
                        onValueChange={(value) => setNewClient(prev => ({ ...prev, gender: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={newClient.birthdate}
                        onChange={e => setNewClient(prev => ({ ...prev, birthdate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Textarea
                        value={newClient.address}
                        onChange={e => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Client's address..."
                        className="h-20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Emergency Contact Name</Label>
                      <Input
                        value={newClient.emergencyContact}
                        onChange={e => setNewClient(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Emergency Contact Phone</Label>
                      <Input
                        type="tel"
                        value={newClient.emergencyPhone}
                        onChange={e => setNewClient(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Physical Information Tab */}
                <TabsContent value="physical" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Height (cm)</Label>
                      <Input
                        type="number"
                        value={newClient.height || ''}
                        onChange={e => setNewClient(prev => ({ ...prev, height: e.target.value ? Number(e.target.value) : undefined }))}
                        min="100"
                        max="250"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weight (kg)</Label>
                      <Input
                        type="number"
                        value={newClient.weight || ''}
                        onChange={e => setNewClient(prev => ({ ...prev, weight: e.target.value ? Number(e.target.value) : undefined }))}
                        min="30"
                        max="300"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Body Fat Percentage (%)</Label>
                      <div className="pt-6">
                        <Slider 
                          value={[newClient.bodyFatPercentage || 20]}
                          onValueChange={(value) => setNewClient(prev => ({ ...prev, bodyFatPercentage: value[0] }))}
                          min={5} 
                          max={60}
                          step={0.1}
                        />
                        <div className="text-center mt-2">{newClient.bodyFatPercentage || 20}%</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Fitness Profile Tab */}
                <TabsContent value="fitness" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Fitness Level</Label>
                      <Select 
                        value={newClient.fitnessLevel}
                        onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setNewClient(prev => ({ ...prev, fitnessLevel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fitness level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Fitness Goals</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'weight-loss', label: 'Weight Loss' },
                          { id: 'muscle-gain', label: 'Muscle Gain' },
                          { id: 'endurance', label: 'Endurance' },
                          { id: 'strength', label: 'Strength' },
                          { id: 'flexibility', label: 'Flexibility' },
                          { id: 'overall-fitness', label: 'Overall Fitness' },
                          { id: 'sports-performance', label: 'Sports Performance' },
                          { id: 'rehabilitation', label: 'Rehabilitation' },
                        ].map((goal) => (
                          <div key={goal.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={goal.id} 
                              checked={newClient.fitnessGoals?.includes(goal.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewClient(prev => ({
                                    ...prev,
                                    fitnessGoals: [...(prev.fitnessGoals || []), goal.id]
                                  }));
                                } else {
                                  setNewClient(prev => ({
                                    ...prev,
                                    fitnessGoals: prev.fitnessGoals?.filter(g => g !== goal.id) || []
                                  }));
                                }
                              }}
                            />
                            <label htmlFor={goal.id} className="text-sm">{goal.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Workout Times</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'early-morning', label: 'Early Morning (5-8am)' },
                          { id: 'morning', label: 'Morning (8-11am)' },
                          { id: 'midday', label: 'Midday (11am-2pm)' },
                          { id: 'afternoon', label: 'Afternoon (2-5pm)' },
                          { id: 'evening', label: 'Evening (5-8pm)' },
                          { id: 'late-evening', label: 'Late Evening (8-11pm)' }
                        ].map((time) => (
                          <div key={time.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={time.id} 
                              checked={newClient.preferredWorkoutTimes?.includes(time.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewClient(prev => ({
                                    ...prev,
                                    preferredWorkoutTimes: [...(prev.preferredWorkoutTimes || []), time.id]
                                  }));
                                } else {
                                  setNewClient(prev => ({
                                    ...prev,
                                    preferredWorkoutTimes: prev.preferredWorkoutTimes?.filter(t => t !== time.id) || []
                                  }));
                                }
                              }}
                            />
                            <label htmlFor={time.id} className="text-sm">{time.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Available Days</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'monday', label: 'Monday' },
                          { id: 'tuesday', label: 'Tuesday' },
                          { id: 'wednesday', label: 'Wednesday' },
                          { id: 'thursday', label: 'Thursday' },
                          { id: 'friday', label: 'Friday' },
                          { id: 'saturday', label: 'Saturday' },
                          { id: 'sunday', label: 'Sunday' }
                        ].map((day) => (
                          <div key={day.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={day.id} 
                              checked={newClient.availableDays?.includes(day.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewClient(prev => ({
                                    ...prev,
                                    availableDays: [...(prev.availableDays || []), day.id]
                                  }));
                                } else {
                                  setNewClient(prev => ({
                                    ...prev,
                                    availableDays: prev.availableDays?.filter(d => d !== day.id) || []
                                  }));
                                }
                              }}
                            />
                            <label htmlFor={day.id} className="text-sm">{day.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Previous Exercise Experience</Label>
                      <Textarea
                        value={newClient.previousExperience}
                        onChange={e => setNewClient(prev => ({ ...prev, previousExperience: e.target.value }))}
                        placeholder="Client's previous exercise experience..."
                        className="h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Activities/Exercises</Label>
                      <Textarea
                        value={newClient.preferredActivities?.join(', ')}
                        onChange={e => setNewClient(prev => ({ 
                          ...prev, 
                          preferredActivities: e.target.value.split(',').map(item => item.trim())
                        }))}
                        placeholder="E.g. running, swimming, weight training (comma separated)"
                        className="h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Disliked Exercises</Label>
                      <Textarea
                        value={newClient.dislikedExercises?.join(', ')}
                        onChange={e => setNewClient(prev => ({ 
                          ...prev, 
                          dislikedExercises: e.target.value.split(',').map(item => item.trim())
                        }))}
                        placeholder="E.g. burpees, running (comma separated)"
                        className="h-20"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Health Information Tab */}
                <TabsContent value="health" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Medical Conditions</Label>
                      <Textarea
                        value={newClient.medicalConditions}
                        onChange={e => setNewClient(prev => ({ ...prev, medicalConditions: e.target.value }))}
                        placeholder="Any relevant medical conditions..."
                        className="h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Injuries/Physical Limitations</Label>
                      <Textarea
                        value={newClient.injuries}
                        onChange={e => setNewClient(prev => ({ ...prev, injuries: e.target.value }))}
                        placeholder="Past or current injuries that may affect training..."
                        className="h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Medications</Label>
                      <Textarea
                        value={newClient.medications}
                        onChange={e => setNewClient(prev => ({ ...prev, medications: e.target.value }))}
                        placeholder="Current medications that may affect exercise..."
                        className="h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Allergies</Label>
                      <Textarea
                        value={newClient.allergies}
                        onChange={e => setNewClient(prev => ({ ...prev, allergies: e.target.value }))}
                        placeholder="Any allergies the client has..."
                        className="h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="initial-assessment" 
                          checked={newClient.hasInitialAssessment}
                          onCheckedChange={(checked) => {
                            setNewClient(prev => ({
                              ...prev,
                              hasInitialAssessment: checked as boolean
                            }));
                          }}
                        />
                        <label htmlFor="initial-assessment">Completed Initial Assessment</label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Nutrition Information Tab */}
                <TabsContent value="nutrition" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Dietary Restrictions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'vegetarian', label: 'Vegetarian' },
                          { id: 'vegan', label: 'Vegan' },
                          { id: 'gluten-free', label: 'Gluten Free' },
                          { id: 'dairy-free', label: 'Dairy Free' },
                          { id: 'nut-allergy', label: 'Nut Allergy' },
                          { id: 'kosher', label: 'Kosher' },
                          { id: 'halal', label: 'Halal' },
                          { id: 'keto', label: 'Keto' },
                          { id: 'paleo', label: 'Paleo' },
                          { id: 'low-carb', label: 'Low Carb' }
                        ].map((diet) => (
                          <div key={diet.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={diet.id} 
                              checked={newClient.dietaryRestrictions?.includes(diet.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewClient(prev => ({
                                    ...prev,
                                    dietaryRestrictions: [...(prev.dietaryRestrictions || []), diet.id]
                                  }));
                                } else {
                                  setNewClient(prev => ({
                                    ...prev,
                                    dietaryRestrictions: prev.dietaryRestrictions?.filter(d => d !== diet.id) || []
                                  }));
                                }
                              }}
                            />
                            <label htmlFor={diet.id} className="text-sm">{diet.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Meals Per Day</Label>
                      <Select
                        value={newClient.mealsPerDay?.toString()}
                        onValueChange={(value) => setNewClient(prev => ({ 
                          ...prev, 
                          mealsPerDay: parseInt(value) 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of meals" />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 3, 4, 5, 6].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} meals</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Supplements Used</Label>
                      <Textarea
                        value={newClient.supplementsUsed}
                        onChange={e => setNewClient(prev => ({ ...prev, supplementsUsed: e.target.value }))}
                        placeholder="E.g. protein powder, creatine, pre-workout"
                        className="h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Water Intake</Label>
                      <Select
                        value={newClient.waterIntake}
                        onValueChange={(value) => setNewClient(prev => ({ 
                          ...prev, 
                          waterIntake: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select water intake" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (Less than 1L daily)</SelectItem>
                          <SelectItem value="moderate">Moderate (1-2L daily)</SelectItem>
                          <SelectItem value="high">High (2-3L daily)</SelectItem>
                          <SelectItem value="very-high">Very High (3L+ daily)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Goals & Notes</Label>
                      <Textarea
                        value={newClient.goals}
                        onChange={e => setNewClient(prev => ({ ...prev, goals: e.target.value }))}
                        placeholder="Client's nutrition goals and any additional notes..."
                        className="h-20"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Navigation and Submit Buttons */}
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={goToPreviousStep}
                  disabled={formStep === 1}
                >
                  Previous
                </Button>

                {formStep < 5 ? (
                  <Button 
                    type="button" 
                    onClick={goToNextStep}
                  >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Client'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}