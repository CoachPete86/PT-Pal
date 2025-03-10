import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/ui/loading-states';
import { SessionPlan } from '@/components/session-plan-template';

// Form schema definition
const groupPlanFormSchema = z.object({
  sessionType: z.enum(['GLC Burn', 'HIIT', 'Lift', 'Sculpt & Tone', 'Bootcamp']),
  sessionFormat: z.enum(['Tabata', 'AMRAP', 'EMOM', 'Circuit', 'Custom']),
  fitnessLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Mixed']),
  participantCount: z.string().min(1, 'Required'),
  duration: z.enum(['30 Minutes', '45 Minutes', '60 Minutes']).default('45 Minutes'),
  focusAreas: z.array(z.string()).min(1, 'Select at least one focus area'),
  equipment: z.array(z.string()),
  sessionGoal: z.string().min(5, 'Please describe the session goal'),
  specialInstructions: z.string().optional(),
});

type GroupPlanFormValues = z.infer<typeof groupPlanFormSchema>;

// Focus areas and equipment options
const focusAreaOptions = [
  { id: 'upper-body', label: 'Upper Body' },
  { id: 'lower-body', label: 'Lower Body' },
  { id: 'core', label: 'Core' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'flexibility', label: 'Flexibility' },
  { id: 'strength', label: 'Strength' },
  { id: 'endurance', label: 'Endurance' },
];

const equipmentOptions = [
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'kettlebells', label: 'Kettlebells' },
  { id: 'resistance-bands', label: 'Resistance Bands' },
  { id: 'bodyweight', label: 'Bodyweight Only' },
  { id: 'medicine-balls', label: 'Medicine Balls' },
  { id: 'trx', label: 'TRX Suspension' },
  { id: 'battle-ropes', label: 'Battle Ropes' },
  { id: 'boxes', label: 'Plyo Boxes' },
  { id: 'mats', label: 'Exercise Mats' },
];

export default function GroupSessionPlanGenerator() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [sessionPlan, setSessionPlan] = useState<SessionPlan | null>(null);

  // Default form values
  const defaultValues: Partial<GroupPlanFormValues> = {
    sessionType: 'GLC Burn',
    sessionFormat: 'Circuit',
    fitnessLevel: 'Mixed',
    participantCount: '10',
    duration: '45 Minutes',
    focusAreas: ['strength', 'cardio'],
    equipment: ['dumbbells', 'bodyweight', 'mats'],
    sessionGoal: '',
    specialInstructions: '',
  };

  // Form setup
  const form = useForm<GroupPlanFormValues>({
    resolver: zodResolver(groupPlanFormSchema),
    defaultValues,
  });

  // Generate session plan mutation
  const generatePlanMutation = useMutation({
    mutationFn: async (values: GroupPlanFormValues) => {
      const data = await apiRequest<SessionPlan>('/api/group-session-plan', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      return data;
    },
    onSuccess: (data) => {
      setSessionPlan(data);
      setActiveTab('preview');
      toast({
        title: 'Success!',
        description: 'Group session plan generated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error generating plan',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: GroupPlanFormValues) => {
    generatePlanMutation.mutate(values);
  };

  // Export to PDF handler
  const handleExportPdf = () => {
    if (!sessionPlan) return;
    
    toast({
      title: 'Exporting to PDF',
      description: 'Your session plan is being prepared for download.',
    });
    
    // API call to generate and download PDF would go here
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Group Session Plan Generator</CardTitle>
        <CardDescription>
          Create a professional workout plan for group fitness classes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Plan</TabsTrigger>
            <TabsTrigger value="preview" disabled={!sessionPlan}>Preview Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="sessionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select session type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GLC Burn">GLC Burn</SelectItem>
                            <SelectItem value="HIIT">HIIT</SelectItem>
                            <SelectItem value="Lift">Lift</SelectItem>
                            <SelectItem value="Sculpt & Tone">Sculpt & Tone</SelectItem>
                            <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sessionFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Format</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Tabata">Tabata</SelectItem>
                            <SelectItem value="AMRAP">AMRAP</SelectItem>
                            <SelectItem value="EMOM">EMOM</SelectItem>
                            <SelectItem value="Circuit">Circuit</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fitnessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fitness Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fitness level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="Mixed">Mixed Levels</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          General fitness level of the participants
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="participantCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Participants</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min="1" />
                        </FormControl>
                        <FormDescription>
                          Expected number of participants
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Duration</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="30 Minutes">30 Minutes</SelectItem>
                            <SelectItem value="45 Minutes">45 Minutes</SelectItem>
                            <SelectItem value="60 Minutes">60 Minutes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="focusAreas"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Focus Areas</FormLabel>
                          <FormDescription>
                            Select primary focus areas for this session
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {focusAreaOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="focusAreas"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, option.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="equipment"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Available Equipment</FormLabel>
                          <FormDescription>
                            Select equipment available for this session
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {equipmentOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="equipment"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, option.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="sessionGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Goal</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the primary goal for this session..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          For example: "Build upper body strength while improving cardiovascular endurance"
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special instructions for this session..."
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Add any special considerations or modifications for participants
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={generatePlanMutation.isPending}
                >
                  {generatePlanMutation.isPending ? (
                    <>
                      <LoadingState size="sm" className="mr-2" />
                      Generating Plan...
                    </>
                  ) : (
                    'Generate Group Session Plan'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview">
            {sessionPlan ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Plan Summary</h3>
                  <p>
                    <span className="font-medium">Session Type:</span> {form.getValues('sessionType')}
                  </p>
                  <p>
                    <span className="font-medium">Format:</span> {form.getValues('sessionFormat')}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span> {form.getValues('duration')}
                  </p>
                  <p>
                    <span className="font-medium">Fitness Level:</span> {form.getValues('fitnessLevel')}
                  </p>
                </div>
                
                {/* Here we would render the session plan using the SessionPlanTemplate component */}
                <div className="border rounded-lg p-4">
                  <p className="text-muted-foreground text-sm mb-4">
                    Below is your generated session plan. You can export it to PDF or make adjustments as needed.
                  </p>
                  
                  {/* Placeholder for actual plan template component */}
                  <div className="p-4 bg-card rounded-lg border">
                    <h3 className="text-xl font-bold mb-2">{sessionPlan.sessionDetails.sessionType}</h3>
                    <p className="mb-4"><span className="font-medium">Coach:</span> {sessionPlan.sessionDetails.coach}</p>
                    
                    <h4 className="font-semibold mt-4 mb-2">Equipment Needed:</h4>
                    <ul className="list-disc pl-5 mb-4">
                      {sessionPlan.equipmentNeeded.equipmentList.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                    
                    <h4 className="font-semibold mt-4 mb-2">Session Structure:</h4>
                    <ol className="list-decimal pl-5">
                      <li className="mb-2">
                        <span className="font-medium">Warmup</span> - {sessionPlan.warmup.explanation}
                      </li>
                      {sessionPlan.mainWorkout.map((block, index) => (
                        <li key={index} className="mb-2">
                          <span className="font-medium">{block.blockTitle}</span> - {block.format}
                        </li>
                      ))}
                      <li className="mb-2">
                        <span className="font-medium">Cooldown</span> - {sessionPlan.cooldown.explanation}
                      </li>
                    </ol>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('create')}
                  >
                    Edit Plan
                  </Button>
                  <Button 
                    variant="default"
                    onClick={handleExportPdf}
                  >
                    Export to PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 text-muted-foreground">
                  No plan generated yet. Create a plan first.
                </div>
                <Button onClick={() => setActiveTab('create')}>
                  Create Plan
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <p className="text-sm text-muted-foreground">
          Group session plans are designed to be flexible and adaptable to different fitness levels.
          Always ensure proper form and provide modifications for beginners.
        </p>
      </CardFooter>
    </Card>
  );
}