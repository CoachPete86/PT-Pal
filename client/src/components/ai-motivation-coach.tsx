import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Pause, Play, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import WorkoutMascot, { MascotCharacter } from "./workout-mascot";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

// Workout motivation patterns
const MOTIVATIONAL_PATTERNS = [
  {
    phase: "warm-up",
    messages: [
      "Let's get those muscles warmed up and ready to work!",
      "A proper warm-up prevents injuries and prepares your body for what's coming.",
      "Take your time with these warm-up movements. Quality over speed!",
      "Increase your range of motion gradually as you warm up.",
      "Feel your body waking up with each movement!",
    ],
  },
  {
    phase: "main-workout",
    messages: [
      "Push through the burn! This is where growth happens!",
      "Stay focused on your form. Quality reps create quality results!",
      "You're stronger than you think. Prove it with this next set!",
      "Remember your 'why' with every rep. This is your journey!",
      "This is where champions are made. In the hardest moments!",
      "Mental toughness is built in these challenging sets!",
      "Your future self will thank you for not giving up right now!",
    ],
  },
  {
    phase: "final-push",
    messages: [
      "Last set, best set! Give it everything you've got!",
      "The finish line is in sight. Sprint through it!",
      "This is where your body wants to quit, but your mind says NO!",
      "Make these final reps count! Leave nothing in the tank!",
      "Finish stronger than you started! This is YOUR time!",
    ],
  },
  {
    phase: "cool-down",
    messages: [
      "Great work! Now let's bring that heart rate down gradually.",
      "Take deep breaths as you stretch. You've earned this recovery time.",
      "Feel proud of what you accomplished today.",
      "Your body is thanking you for this workout and cool-down.",
      "Use this time to mentally celebrate your effort and progress.",
    ],
  },
];

// Character voices mapping
const CHARACTER_VOICES: Record<MascotCharacter, number> = {
  coach: 0, // Default male voice
  "gym-buddy": 3, // Enthusiastic voice
  scientist: 2, // Professional voice
  "zen-master": 1, // Calm voice
};

interface AIMotivationCoachProps {
  workoutDuration?: number; // in minutes
  currentPhase?: "warm-up" | "main-workout" | "final-push" | "cool-down";
  character?: MascotCharacter;
  autoPlay?: boolean;
  speechEnabled?: boolean;
}

const AIMotivationCoach: React.FC<AIMotivationCoachProps> = ({
  workoutDuration = 30,
  currentPhase = "warm-up",
  character = "coach",
  autoPlay = false,
  speechEnabled = true,
}) => {
  const [isActive, setIsActive] = useState(autoPlay);
  const [phase, setPhase] = useState<
    "warm-up" | "main-workout" | "final-push" | "cool-down"
  >(currentPhase);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [showMascot, setShowMascot] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechVolume, setSpeechVolume] = useState(70);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [enableSpeech, setEnableSpeech] = useState(speechEnabled);
  const [timeBetweenMessages, setTimeBetweenMessages] = useState(60000); // 1 min by default
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Timer for workout phases
  useEffect(() => {
    // Function to determine workout phase based on elapsed time
    const determinePhase = (elapsedPercent: number) => {
      if (elapsedPercent < 20) return "warm-up";
      if (elapsedPercent >= 80) return "final-push";
      if (elapsedPercent >= 90) return "cool-down";
      return "main-workout";
    };

    let elapsed = 0;
    let interval: NodeJS.Timeout;

    if (isActive) {
      // Update phase every minute
      interval = setInterval(() => {
        elapsed += 1;
        const elapsedPercent = (elapsed / workoutDuration) * 100;
        setPhase(determinePhase(elapsedPercent));
      }, 60000);

      // Start message timer
      generateNewMessage();
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, workoutDuration]);

  // Set up speech synthesis
  useEffect(() => {
    if (!window.speechSynthesis) {
      setEnableSpeech(false);
      return;
    }

    speechSynthRef.current = new SpeechSynthesisUtterance();

    // Clean up on component unmount
    return () => {
      if (speechSynthRef.current && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Generate random motivation message based on current phase
  const generateNewMessage = () => {
    // Find messages for current phase
    const phaseMessages =
      MOTIVATIONAL_PATTERNS.find((p) => p.phase === phase)?.messages || [];

    // Pick a random message
    const randomIndex = Math.floor(Math.random() * phaseMessages.length);
    const message = phaseMessages[randomIndex];

    setCurrentMessage(message);
    setShowMascot(true);

    // Speak message if speech is enabled
    if (enableSpeech && speechSynthRef.current) {
      speakMessage(message);
    }

    // Set timer for next message
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (isActive) {
        generateNewMessage();
      }
    }, timeBetweenMessages);
  };

  // Speak the message using speech synthesis
  const speakMessage = (text: string) => {
    if (!window.speechSynthesis || !speechSynthRef.current) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Configure speech
    speechSynthRef.current.text = text;
    speechSynthRef.current.volume = speechVolume / 100;
    speechSynthRef.current.rate = speechRate;

    // Select voice based on character
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      // Try to match the character voice or use default
      const voiceIndex = CHARACTER_VOICES[character] % voices.length;
      speechSynthRef.current.voice = voices[voiceIndex];
    }

    // Set speaking state
    setIsSpeaking(true);

    // Handle speech end
    speechSynthRef.current.onend = () => {
      setIsSpeaking(false);
    };

    // Speak
    window.speechSynthesis.speak(speechSynthRef.current);
  };

  // Toggle active state
  const toggleActive = () => {
    const newState = !isActive;
    setIsActive(newState);

    if (newState) {
      // If activating, generate a message immediately
      generateNewMessage();
    } else {
      // If deactivating, clear any pending timers
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Stop any ongoing speech
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  };

  // Handle voice controls
  const handleVoiceControl = () => {
    if (isSpeaking) {
      // Stop speaking
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } else if (currentMessage) {
      // Start speaking current message
      speakMessage(currentMessage);
    }
  };

  // Skip to next message
  const handleSkipMessage = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    generateNewMessage();
  };

  const handleMascotAnimationComplete = () => {
    // Hide mascot after a delay
    setTimeout(() => {
      setShowMascot(false);
    }, 5000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <div className="flex items-centre justify-between">
          <div>
            <CardTitle>AI Workout Coach</CardTitle>
            <CardDescription>
              Let your coach motivate your workout
            </CardDescription>
          </div>
          <Badge variant={isActive ? "default" : "outline"}>
            {isActive ? "Active" : "Paused"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Phase Indicator */}
        <div className="flex justify-between items-centre">
          <span className="text-sm font-medium">Current Phase:</span>
          <Badge variant="secondary" className="capitalize">
            {phase.replace("-", " ")}
          </Badge>
        </div>

        {/* Current Message */}
        <div className="bg-muted/50 p-3 rounded-md min-h-[80px] flex items-centre justify-centre text-centre">
          {currentMessage || "Activate your coach to receive motivation"}
        </div>

        {/* Voice Controls */}
        <div className="space-y-2">
          <div className="flex items-centre justify-between">
            <Label htmlFor="enable-speech">Voice Guidance</Label>
            <Switch
              id="enable-speech"
              checked={enableSpeech}
              onCheckedChange={setEnableSpeech}
              disabled={!window.speechSynthesis}
            />
          </div>

          {enableSpeech && (
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-centre">
                  <Label htmlFor="speech-volume" className="text-xs">
                    Volume
                  </Label>
                  <span className="text-xs">{speechVolume}%</span>
                </div>
                <Slider
                  id="speech-volume"
                  value={[speechVolume]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setSpeechVolume(value[0])}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-centre">
                  <Label htmlFor="speech-rate" className="text-xs">
                    Speech Rate
                  </Label>
                  <span className="text-xs">{speechRate.toFixed(1)}x</span>
                </div>
                <Slider
                  id="speech-rate"
                  value={[speechRate * 10]}
                  min={5}
                  max={20}
                  step={1}
                  onValueChange={(value) => setSpeechRate(value[0] / 10)}
                />
              </div>
            </>
          )}
        </div>

        {/* Frequency Control */}
        <div className="space-y-1">
          <div className="flex justify-between items-centre">
            <Label htmlFor="message-frequency" className="text-xs">
              Message Frequency
            </Label>
            <span className="text-xs">{timeBetweenMessages / 1000}s</span>
          </div>
          <Slider
            id="message-frequency"
            value={[timeBetweenMessages / 1000]}
            min={15}
            max={120}
            step={15}
            onValueChange={(value) => setTimeBetweenMessages(value[0] * 1000)}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleActive}>
            {isActive ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceControl}
            disabled={!enableSpeech || !currentMessage}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleSkipMessage}
            disabled={!isActive}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Next Tip
          </Button>

          <Button
            variant="default"
            onClick={() => {
              try {
                // Request microphone permission for voice commands
                navigator.mediaDevices
                  .getUserMedia({ audio: true })
                  .then(() => {
                    toast({
                      title: "Voice Command Activated",
                      description:
                        "Say 'Next' for new tip, 'Play' or 'Pause' to control.",
                    });
                  })
                  .catch(() => {
                    toast({
                      title: "Microphone access denied",
                      description:
                        "Voice commands require microphone permission.",
                      variant: "destructive",
                    });
                  });
              } catch (err) {
                toast({
                  title: "Voice Command Not Available",
                  description: "Your browser doesn't support voice commands.",
                  variant: "destructive",
                });
              }
            }}
          >
            <Mic className="h-4 w-4 mr-2" />
            Voice Command
          </Button>
        </div>
      </CardFooter>

      {/* Mascot */}
      {showMascot && (
        <WorkoutMascot
          character={character}
          message={currentMessage}
          mood="encouraging"
          position="bottom-right"
          onAnimationComplete={handleMascotAnimationComplete}
        />
      )}
    </Card>
  );
};

export default AIMotivationCoach;