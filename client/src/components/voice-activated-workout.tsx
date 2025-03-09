import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import WorkoutMascot from "./workout-mascot";

// Available voice commands
const VOICE_COMMANDS = {
  start: ["start", "begin", "go", "play"],
  pause: ["pause", "stop", "wait", "hold"],
  next: ["next", "skip", "forward"],
  previous: ["previous", "back", "backward"],
  louder: ["louder", "increase volume", "volume up"],
  quieter: ["quieter", "decrease volume", "volume down"],
  mute: ["mute", "silence", "quiet"],
  unmute: ["unmute", "sound on", "audio on"],
};

interface ExerciseStep {
  id: string;
  name: string;
  duration: number; // in seconds
  reps?: number;
  instruction: string;
  restAfter: number; // in seconds
}

interface VoiceActivatedWorkoutProps {
  workoutTitle?: string;
  exercises?: ExerciseStep[];
  totalDuration?: number; // in minutes
  onComplete?: () => void;
}

const VoiceActivatedWorkout: React.FC<VoiceActivatedWorkoutProps> = ({
  workoutTitle = "Voice-Guided Workout",
  exercises = [
    {
      id: "warm-up-1",
      name: "Jumping Jacks",
      duration: 60,
      instruction: "Jump while raising your arms and spreading your legs",
      restAfter: 15,
    },
    {
      id: "exercise-1",
      name: "Push-ups",
      duration: 45,
      reps: 15,
      instruction:
        "Keep your body straight, lower until your elbows are at 90 degrees",
      restAfter: 30,
    },
    {
      id: "exercise-2",
      name: "Bodyweight Squats",
      duration: 60,
      reps: 20,
      instruction:
        "Keep weight in heels, lower until thighs are parallel to ground",
      restAfter: 30,
    },
    {
      id: "exercise-3",
      name: "Mountain Climbers",
      duration: 45,
      instruction: "Maintain plank position while alternating knees to chest",
      restAfter: 30,
    },
    {
      id: "exercise-4",
      name: "Plank Hold",
      duration: 60,
      instruction: "Keep your body in a straight line from head to heels",
      restAfter: 45,
    },
    {
      id: "cooldown-1",
      name: "Stretching",
      duration: 90,
      instruction: "Gentle stretches for all major muscle groups",
      restAfter: 0,
    },
  ],
  totalDuration = 20,
  onComplete,
}) => {
  // State management
  const [isActive, setIsActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [elapsedWorkoutTime, setElapsedWorkoutTime] = useState(0);
  const [showMascot, setShowMascot] = useState(false);
  const [mascotMessage, setMascotMessage] = useState("");

  // Refs for timers and speech recognition
  const exerciseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  // Set up Speech Synthesis
  useEffect(() => {
    if (!window.speechSynthesis) {
      setSpeechEnabled(false);
      return;
    }

    speechSynthRef.current = new SpeechSynthesisUtterance();

    // Clean up
    return () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    // Check if browser supports the Web Speech API
    // TypeScript doesn't have built-in types for the experimental Web Speech API
    // so we need to use type assertions here
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Speech recognition not supported
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.trim().toLowerCase();

      processVoiceCommand(command);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === "no-speech") {
        // Restart recognition if it stops due to no speech
        if (voiceEnabled && recognition) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or other error
          }
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Already stopped or other error
        }
      }
    };
  }, []);

  // Toggle voice recognition
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (voiceEnabled) {
      try {
        recognitionRef.current.start();
        toast({
          title: "Voice Commands Active",
          description: "Try saying: Start, Pause, Next, or Previous",
        });
      } catch (e) {
        // Already started or other error
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped or other error
      }
    }
  }, [voiceEnabled]);

  // Handle exercise timers
  useEffect(() => {
    if (!isActive) return;

    // Start main workout timer
    if (!workoutTimerRef.current) {
      workoutTimerRef.current = setInterval(() => {
        setElapsedWorkoutTime((prev) => {
          const newTime = prev + 1;
          // Check if workout completed
          if (newTime >= totalDuration * 60) {
            completeWorkout();
          }
          return newTime;
        });
      }, 1000);
    }

    // Start current exercise timer
    startExerciseTimer();

    return () => {
      // Cleanup timers
      if (exerciseTimerRef.current) {
        clearInterval(exerciseTimerRef.current);
        exerciseTimerRef.current = null;
      }
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
        workoutTimerRef.current = null;
      }
    };
  }, [isActive, currentExerciseIndex, isResting]);

  // Process voice commands
  const processVoiceCommand = (command: string) => {
    // Start/play
    if (VOICE_COMMANDS.start.some((cmd) => command.includes(cmd))) {
      setIsActive(true);
      speakText("Workout started");
      showMascotWithMessage("Workout started! Let's go!");
      return;
    }

    // Pause/stop
    if (VOICE_COMMANDS.pause.some((cmd) => command.includes(cmd))) {
      setIsActive(false);
      speakText("Workout paused");
      showMascotWithMessage(
        "Taking a break. Say 'start' when ready to continue.",
      );
      return;
    }

    // Next exercise
    if (VOICE_COMMANDS.next.some((cmd) => command.includes(cmd))) {
      moveToNextExercise();
      return;
    }

    // Previous exercise
    if (VOICE_COMMANDS.previous.some((cmd) => command.includes(cmd))) {
      moveToPreviousExercise();
      return;
    }

    // Volume controls
    if (VOICE_COMMANDS.louder.some((cmd) => command.includes(cmd))) {
      // Increase TTS volume
      if (speechSynthRef.current) {
        speechSynthRef.current.volume = Math.min(
          1,
          (speechSynthRef.current.volume || 0.5) + 0.2,
        );
        speakText("Volume increased");
      }
      return;
    }

    if (VOICE_COMMANDS.quieter.some((cmd) => command.includes(cmd))) {
      // Decrease TTS volume
      if (speechSynthRef.current) {
        speechSynthRef.current.volume = Math.max(
          0.1,
          (speechSynthRef.current.volume || 0.5) - 0.2,
        );
        speakText("Volume decreased");
      }
      return;
    }

    if (VOICE_COMMANDS.mute.some((cmd) => command.includes(cmd))) {
      setSpeechEnabled(false);
      return;
    }

    if (VOICE_COMMANDS.unmute.some((cmd) => command.includes(cmd))) {
      setSpeechEnabled(true);
      speakText("Voice guidance enabled");
      return;
    }
  };

  // Start exercise timer
  const startExerciseTimer = () => {
    if (currentExerciseIndex >= exercises.length) {
      completeWorkout();
      return;
    }

    const currentExercise = exercises[currentExerciseIndex];

    // Check if resting between exercises
    if (isResting) {
      setTimeRemaining(currentExercise.restAfter);

      if (speechEnabled) {
        speakText(`Rest for ${currentExercise.restAfter} seconds`);
      }

      showMascotWithMessage(`Rest time! Next up: ${currentExercise.name}`);
    } else {
      setTimeRemaining(currentExercise.duration);

      if (speechEnabled) {
        const repText = currentExercise.reps
          ? ` for ${currentExercise.reps} repetitions`
          : "";
        speakText(
          `${currentExercise.name}${repText}. ${currentExercise.instruction}`,
        );
      }

      showMascotWithMessage(
        `${currentExercise.name}: ${currentExercise.instruction}`,
      );
    }

    // Create new timer
    if (exerciseTimerRef.current) {
      clearInterval(exerciseTimerRef.current);
    }

    exerciseTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(exerciseTimerRef.current as NodeJS.Timeout);
          exerciseTimerRef.current = null;

          // Move to next step
          if (isResting) {
            setIsResting(false);
            startExerciseTimer();
          } else {
            if (currentExercise.restAfter > 0) {
              setIsResting(true);
              startExerciseTimer();
            } else {
              moveToNextExercise();
            }
          }

          return 0;
        }

        // Countdown announcements
        if (prev === 3 && speechEnabled) {
          speakText("3");
        } else if (prev === 2 && speechEnabled) {
          speakText("2");
        } else if (prev === 1 && speechEnabled) {
          speakText("1");
        }

        return prev - 1;
      });
    }, 1000);
  };

  // Move to next exercise
  const moveToNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setIsResting(false);

      if (exerciseTimerRef.current) {
        clearInterval(exerciseTimerRef.current);
        exerciseTimerRef.current = null;
      }

      if (isActive) {
        startExerciseTimer();
      }

      speakText(`Moving to ${exercises[currentExerciseIndex + 1].name}`);
    } else {
      completeWorkout();
    }
  };

  // Move to previous exercise
  const moveToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setIsResting(false);

      if (exerciseTimerRef.current) {
        clearInterval(exerciseTimerRef.current);
        exerciseTimerRef.current = null;
      }

      if (isActive) {
        startExerciseTimer();
      }

      speakText(`Going back to ${exercises[currentExerciseIndex - 1].name}`);
    }
  };

  // Complete workout
  const completeWorkout = () => {
    setIsActive(false);

    if (exerciseTimerRef.current) {
      clearInterval(exerciseTimerRef.current);
      exerciseTimerRef.current = null;
    }

    if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }

    speakText("Congratulations! Workout complete!");
    showMascotWithMessage("Great job! You've completed the workout!");

    if (onComplete) {
      onComplete();
    }
  };

  // Speak text using speech synthesis
  const speakText = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis || !speechSynthRef.current) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    speechSynthRef.current.text = text;
    window.speechSynthesis.speak(speechSynthRef.current);
  };

  // Show mascot with message
  const showMascotWithMessage = (message: string) => {
    setMascotMessage(message);
    setShowMascot(true);

    // Hide mascot after some time
    setTimeout(() => {
      setShowMascot(false);
    }, 5000);
  };

  // Toggle workout state (play/pause)
  const toggleWorkout = () => {
    setIsActive(!isActive);

    if (!isActive) {
      speakText("Workout resumed");
    } else {
      speakText("Workout paused");
    }
  };

  // Toggle voice commands
  const toggleVoiceCommands = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);

    if (newState) {
      // Request microphone permission
      try {
        navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
          toast({
            title: "Microphone access denied",
            description: "Voice commands require microphone permission.",
            variant: "destructive",
          });
          setVoiceEnabled(false);
        });
      } catch (err) {
        toast({
          title: "Voice Command Not Available",
          description: "Your browser doesn't support voice commands.",
          variant: "destructive",
        });
        setVoiceEnabled(false);
      }
    }
  };

  // Toggle speech guidance
  const toggleSpeechGuidance = () => {
    setSpeechEnabled(!speechEnabled);
  };

  // Format time (seconds to mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate workout progress percentage
  const calculateProgress = () => {
    return (elapsedWorkoutTime / (totalDuration * 60)) * 100;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-centre">
          <div>
            <CardTitle>{workoutTitle}</CardTitle>
            <CardDescription>Voice-guided workout session</CardDescription>
          </div>
          <Badge variant={isActive ? "default" : "outline"}>
            {isActive ? "Active" : "Paused"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Workout Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Workout Progress</span>
            <span>
              {formatTime(elapsedWorkoutTime)} /{" "}
              {formatTime(totalDuration * 60)}
            </span>
          </div>
          <Progress value={calculateProgress()} />
        </div>

        {/* Current Exercise */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-centre">
            <h3 className="font-semibold">
              {currentExerciseIndex < exercises.length
                ? isResting
                  ? `Rest before ${exercises[currentExerciseIndex].name}`
                  : exercises[currentExerciseIndex].name
                : "Workout Complete"}
            </h3>
            <Badge variant="secondary">
              {currentExerciseIndex + 1}/{exercises.length}
            </Badge>
          </div>

          {currentExerciseIndex < exercises.length && (
            <>
              <p className="text-sm text-muted-foreground">
                {isResting
                  ? "Take a breath and prepare for the next exercise"
                  : exercises[currentExerciseIndex].instruction}
              </p>

              <div className="flex justify-between items-centre">
                <span className="text-sm font-medium">
                  {isResting
                    ? "Rest"
                    : exercises[currentExerciseIndex].reps
                      ? `${exercises[currentExerciseIndex].reps} reps`
                      : `${exercises[currentExerciseIndex].duration} seconds`}
                </span>
                <span className="text-lg font-bold">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Voice and Speech Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-centre justify-between space-x-2">
            <Label htmlFor="voice-commands" className="text-sm">
              Voice Commands
            </Label>
            <Switch
              id="voice-commands"
              checked={voiceEnabled}
              onCheckedChange={toggleVoiceCommands}
            />
          </div>

          <div className="flex items-centre justify-between space-x-2">
            <Label htmlFor="speech-guidance" className="text-sm">
              Voice Guidance
            </Label>
            <Switch
              id="speech-guidance"
              checked={speechEnabled}
              onCheckedChange={toggleSpeechGuidance}
            />
          </div>
        </div>

        {/* List of available commands */}
        {voiceEnabled && (
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Available Voice Commands:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>"{VOICE_COMMANDS.start[0]}" - Start/resume workout</li>
              <li>"{VOICE_COMMANDS.pause[0]}" - Pause workout</li>
              <li>"{VOICE_COMMANDS.next[0]}" - Skip to next exercise</li>
              <li>
                "{VOICE_COMMANDS.previous[0]}" - Go back to previous exercise
              </li>
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between">
        {/* Navigation Controls */}
        <Button
          variant="outline"
          size="icon"
          onClick={moveToPreviousExercise}
          disabled={currentExerciseIndex <= 0 || !isActive}
        >
          <SkipForward className="h-4 w-4 rotate-180" />
        </Button>

        <Button
          variant={isActive ? "default" : "outline"}
          onClick={toggleWorkout}
          className="px-6"
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              {elapsedWorkoutTime > 0 ? "Resume" : "Start"}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={moveToNextExercise}
          disabled={currentExerciseIndex >= exercises.length - 1 || !isActive}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </CardFooter>

      {/* Voice Activation Button */}
      <div className="absolute top-4 right-4">
        <Button
          variant={voiceEnabled ? "default" : "outline"}
          size="icon"
          onClick={toggleVoiceCommands}
          className="rounded-full h-10 w-10"
        >
          {voiceEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Speech Toggle Button */}
      <div className="absolute top-4 right-16">
        <Button
          variant={speechEnabled ? "default" : "outline"}
          size="icon"
          onClick={toggleSpeechGuidance}
          className="rounded-full h-10 w-10"
        >
          {speechEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mascot */}
      {showMascot && (
        <WorkoutMascot
          character="coach"
          mood={isResting ? "relaxed" : "encouraging"}
          message={mascotMessage}
          position="bottom-right"
        />
      )}
    </Card>
  );
};

export default VoiceActivatedWorkout;
