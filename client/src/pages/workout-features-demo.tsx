import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import WorkoutMascot, { MascotCharacter } from '@/components/workout-mascot';
import AIMotivationCoach from '@/components/ai-motivation-coach';
import VoiceActivatedWorkout from '@/components/voice-activated-workout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { VolumeMute, Volume, Volume2, MicOn } from '@/components/ui/icons';

export default function WorkoutFeaturesDemo() {
  // Mascot demo states
  const [selectedCharacter, setSelectedCharacter] = useState<MascotCharacter>('coach');
  const [showMascot, setShowMascot] = useState(false);
  const [mascotMessage, setMascotMessage] = useState("I'm your workout buddy! Let's get fit together!");
  
  // Sample workout plans for demo
  const workoutPlans = [
    {
      id: 'hiit-1',
      title: 'HIIT Cardio Blast',
      duration: 15,
      exercises: [
        { id: 'ex1', name: 'Jumping Jacks', duration: 30, instruction: 'Full range of motion', restAfter: 10 },
        { id: 'ex2', name: 'Mountain Climbers', duration: 30, instruction: 'Keep hips stable', restAfter: 10 },
        { id: 'ex3', name: 'Burpees', duration: 30, instruction: 'Full extension at the top', restAfter: 10 },
        { id: 'ex4', name: 'High Knees', duration: 30, instruction: 'Drive knees up', restAfter: 10 },
        { id: 'ex5', name: 'Plank Jacks', duration: 30, instruction: 'Maintain plank position', restAfter: 30 },
        { id: 'ex6', name: 'Jumping Lunges', duration: 30, instruction: 'Alternate legs', restAfter: 10 },
        { id: 'ex7', name: 'Push-ups', duration: 30, instruction: 'Keep body straight', restAfter: 10 },
        { id: 'ex8', name: 'Plank', duration: 30, instruction: 'Engage core', restAfter: 30 },
        { id: 'ex9', name: 'Cool Down', duration: 60, instruction: 'Deep breathing, gentle stretches', restAfter: 0 }
      ]
    },
    {
      id: 'strength-1',
      title: 'Full Body Strength',
      duration: 25,
      exercises: [
        { id: 'ex1', name: 'Warm Up', duration: 60, instruction: 'Light cardio & dynamic stretches', restAfter: 10 },
        { id: 'ex2', name: 'Bodyweight Squats', duration: 40, reps: 15, instruction: 'Knees track with toes', restAfter: 20 },
        { id: 'ex3', name: 'Push-ups', duration: 40, reps: 12, instruction: 'Modify on knees if needed', restAfter: 20 },
        { id: 'ex4', name: 'Walking Lunges', duration: 40, reps: 10, instruction: 'Each leg', restAfter: 20 },
        { id: 'ex5', name: 'Dumbbell Rows', duration: 40, reps: 12, instruction: 'Each arm', restAfter: 20 },
        { id: 'ex6', name: 'Glute Bridges', duration: 40, reps: 15, instruction: 'Squeeze at the top', restAfter: 20 },
        { id: 'ex7', name: 'Plank Shoulder Taps', duration: 40, instruction: 'Keep hips stable', restAfter: 20 },
        { id: 'ex8', name: 'Cool Down Stretches', duration: 120, instruction: 'Hold each stretch for 20 seconds', restAfter: 0 }
      ]
    }
  ];
  
  const [selectedWorkout, setSelectedWorkout] = useState(workoutPlans[0]);

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">AI-Powered Workout Features</h1>
        <p className="text-lg mb-8">
          Explore our new AI-powered workout features designed to make your fitness experience more 
          interactive, engaging, and effective.
        </p>
        
        <Tabs defaultValue="voice-workout">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="voice-workout">Voice-Activated Workouts</TabsTrigger>
            <TabsTrigger value="motivation-coach">AI Motivation Coach</TabsTrigger>
            <TabsTrigger value="mascot">Workout Mascot</TabsTrigger>
          </TabsList>
          
          {/* Voice-Activated Workout Tab */}
          <TabsContent value="voice-workout" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Voice-Activated Workout Mode</CardTitle>
                    <CardDescription>
                      Control your workout with voice commands for a hands-free experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Select Workout Plan</Label>
                        <Select 
                          value={selectedWorkout.id} 
                          onValueChange={(value) => {
                            const workout = workoutPlans.find(w => w.id === value);
                            if (workout) setSelectedWorkout(workout);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a workout" />
                          </SelectTrigger>
                          <SelectContent>
                            {workoutPlans.map(plan => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.title} ({plan.duration} min)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-md space-y-2">
                        <h4 className="font-medium">Voice Command Benefits:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Hands-free workout control</li>
                          <li>Automatic timing and progression</li>
                          <li>Verbal instructions and countdowns</li>
                          <li>Spoken motivation during challenging moments</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold">How To Use:</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Click the microphone icon to enable voice commands</li>
                    <li>Say "start" to begin the workout, or click the play button</li>
                    <li>Follow along with the exercises as they auto-progress</li>
                    <li>Try commands like "pause", "next", or "previous"</li>
                    <li>The AI coach will provide guidance and encouragement</li>
                  </ol>
                </div>
              </div>
              
              <div>
                <VoiceActivatedWorkout 
                  workoutTitle={selectedWorkout.title}
                  exercises={selectedWorkout.exercises}
                  totalDuration={selectedWorkout.duration}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* AI Motivation Coach Tab */}
          <TabsContent value="motivation-coach" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>AI Workout Motivation Coach</CardTitle>
                    <CardDescription>
                      Personalized motivation and guidance during your workouts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Select Coach Character</Label>
                        <RadioGroup 
                          defaultValue="coach" 
                          className="grid grid-cols-2 gap-2 mt-2"
                          onValueChange={(value) => setSelectedCharacter(value as MascotCharacter)}
                        >
                          <div className="flex items-center space-x-2 border rounded-md p-2">
                            <RadioGroupItem value="coach" id="coach" />
                            <Label htmlFor="coach" className="flex items-center">
                              <span className="text-xl mr-2">🏋️‍♂️</span> Coach
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-2">
                            <RadioGroupItem value="gym-buddy" id="gym-buddy" />
                            <Label htmlFor="gym-buddy" className="flex items-center">
                              <span className="text-xl mr-2">💪</span> Gym Buddy
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-2">
                            <RadioGroupItem value="scientist" id="scientist" />
                            <Label htmlFor="scientist" className="flex items-center">
                              <span className="text-xl mr-2">🧪</span> Scientist
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-2">
                            <RadioGroupItem value="zen-master" id="zen-master" />
                            <Label htmlFor="zen-master" className="flex items-center">
                              <span className="text-xl mr-2">🧘‍♀️</span> Zen Master
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-md space-y-2">
                        <h4 className="font-medium">Motivation Coach Features:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Phase-based motivation (warm-up, main, final push, cool-down)</li>
                          <li>Voice guidance with adjustable volume and speed</li>
                          <li>Character-based coaching styles</li>
                          <li>Voice command support for hands-free control</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold">Coaching Styles:</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li><strong>Coach:</strong> Direct, motivational, focused on effort and results</li>
                    <li><strong>Gym Buddy:</strong> Friendly, supportive, encouraging with positive energy</li>
                    <li><strong>Scientist:</strong> Fact-based, educational, focuses on body mechanics</li>
                    <li><strong>Zen Master:</strong> Mindful, philosophical, emphasizes mind-body connection</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <AIMotivationCoach 
                  character={selectedCharacter}
                  currentPhase="main-workout"
                  autoPlay={false}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Workout Mascot Tab */}
          <TabsContent value="mascot" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Workout Mascot</CardTitle>
                    <CardDescription>
                      Customizable workout companion that provides visual motivation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Select Mascot Character</Label>
                      <RadioGroup 
                        defaultValue="coach" 
                        className="grid grid-cols-2 gap-2 mt-2"
                        onValueChange={(value) => setSelectedCharacter(value as MascotCharacter)}
                      >
                        <div className="flex items-center space-x-2 border rounded-md p-2">
                          <RadioGroupItem value="coach" id="mascot-coach" />
                          <Label htmlFor="mascot-coach" className="flex items-center">
                            <span className="text-xl mr-2">🏋️‍♂️</span> Coach
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-2">
                          <RadioGroupItem value="gym-buddy" id="mascot-buddy" />
                          <Label htmlFor="mascot-buddy" className="flex items-center">
                            <span className="text-xl mr-2">😄</span> Gym Buddy
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-2">
                          <RadioGroupItem value="scientist" id="mascot-scientist" />
                          <Label htmlFor="mascot-scientist" className="flex items-center">
                            <span className="text-xl mr-2">🧪</span> Scientist
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-2">
                          <RadioGroupItem value="zen-master" id="mascot-zen" />
                          <Label htmlFor="mascot-zen" className="flex items-center">
                            <span className="text-xl mr-2">🧘‍♀️</span> Zen Master
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <Label>Custom Message</Label>
                      <textarea 
                        className="w-full mt-1 p-2 border rounded-md" 
                        rows={3}
                        value={mascotMessage}
                        onChange={(e) => setMascotMessage(e.target.value)}
                        placeholder="Enter a custom message for your mascot..."
                      />
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => setShowMascot(true)}
                    >
                      Show Mascot
                    </Button>
                  </CardContent>
                </Card>
                
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold">Mascot Integration:</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Appears during key workout moments for encouragement</li>
                    <li>Provides visual reinforcement with animated entrances</li>
                    <li>Displays personalized messages based on workout context</li>
                    <li>Character selection matches user's preferred coaching style</li>
                  </ul>
                </div>
              </div>
              
              <div className="relative h-96 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Mascot display area</p>
                
                {/* Mascot will be positioned absolutely over this area */}
                {showMascot && (
                  <WorkoutMascot 
                    character={selectedCharacter}
                    message={mascotMessage}
                    mood="encouraging"
                    size="lg"
                    position="center"
                    isAnimating={true}
                    onAnimationComplete={() => {
                      // Hide mascot after animation completes
                      setTimeout(() => {
                        setShowMascot(false);
                      }, 3000);
                    }}
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}