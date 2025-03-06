import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

// Mascot character types
export type MascotMood =
  | "happy"
  | "excited"
  | "focused"
  | "encouraging"
  | "relaxed";
export type MascotCharacter =
  | "coach"
  | "gym-buddy"
  | "scientist"
  | "zen-master";

interface WorkoutMascotProps {
  character?: MascotCharacter;
  mood?: MascotMood;
  message?: string;
  triggerAnimation?: boolean; // Prop to trigger animations externally
  size?: "sm" | "md" | "lg";
  isAnimating?: boolean;
  position?:
    | "top-right"
    | "bottom-right"
    | "bottom-left"
    | "top-left"
    | "center";
  onAnimationComplete?: () => void;
}

const WorkoutMascot: React.FC<WorkoutMascotProps> = ({
  character = "coach",
  mood = "encouraging",
  message,
  triggerAnimation = false,
  size = "md",
  isAnimating = false,
  position = "bottom-right",
  onAnimationComplete,
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message);
  const [animationKey, setAnimationKey] = useState(0);

  // Position styling
  const positionClasses = {
    "top-right": "top-4 right-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-left": "top-4 left-4",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  // Size styling
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  // Character emojis based on mood and character type
  const characterEmojis: Record<MascotCharacter, Record<MascotMood, string>> = {
    coach: {
      happy: "🏋️‍♂️",
      excited: "💪",
      focused: "🧠",
      encouraging: "🔥",
      relaxed: "🧘‍♂️",
    },
    "gym-buddy": {
      happy: "😄",
      excited: "🤩",
      focused: "😤",
      encouraging: "👊",
      relaxed: "😌",
    },
    scientist: {
      happy: "🧪",
      excited: "⚡",
      focused: "🔬",
      encouraging: "📊",
      relaxed: "🧠",
    },
    "zen-master": {
      happy: "🧘‍♀️",
      excited: "✨",
      focused: "🌿",
      encouraging: "🌈",
      relaxed: "☯️",
    },
  };

  // Set of motivational messages by character
  const motivationalMessages: Record<MascotCharacter, string[]> = {
    coach: [
      "Push through! You're stronger than you think!",
      "One more rep! You've got this!",
      "Feel that burn! It's progress happening!",
      "Champions are made when no one's watching!",
      "Discipline beats motivation every time!",
    ],
    "gym-buddy": [
      "You're crushing it today!",
      "Look at those gains coming in!",
      "We're in this together! Keep pushing!",
      "Remember why you started!",
      "This is YOUR time to shine!",
    ],
    scientist: [
      "Your metabolic rate is increasing with every rep!",
      "Muscle hypertrophy occurs during recovery, not during exercise!",
      "Proper form activates 23% more muscle fibers!",
      "Maintaining consistent tempo optimizes time under tension!",
      "Your ATP production is at optimal levels now!",
    ],
    "zen-master": [
      "Be present with each movement. Feel your strength.",
      "Breathe through the challenge. Find peace in the effort.",
      "Your body achieves what your mind believes.",
      "The journey of a thousand miles begins with a single step.",
      "Let go of perfection, embrace progress.",
    ],
  };

  useEffect(() => {
    // Set visibility based on if we have a message or external trigger
    setIsVisible(!!message || triggerAnimation || isAnimating);

    // If message changes, update current message
    if (message) {
      setCurrentMessage(message);
    }

    // If animation is triggered externally but no message provided, pick a random one
    if ((triggerAnimation || isAnimating) && !message) {
      const randomIndex = Math.floor(
        Math.random() * motivationalMessages[character].length,
      );
      setCurrentMessage(motivationalMessages[character][randomIndex]);
    }

    // Increment animation key to force re-animation
    setAnimationKey((prev) => prev + 1);
  }, [message, triggerAnimation, isAnimating, character]);

  const handleAnimationComplete = () => {
    if (!message && !isAnimating) {
      setIsVisible(false);
    }
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence>
        {isVisible && (
          <div className="flex flex-col items-center" key={animationKey}>
            {/* Mascot Character */}
            <motion.div
              className={`${sizeClasses[size]} bg-primary/20 rounded-full flex items-center justify-center text-4xl shadow-lg mb-2`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {characterEmojis[character][mood]}
            </motion.div>

            {/* Mascot Speech Bubble */}
            {currentMessage && (
              <motion.div
                className="relative bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md max-w-xs text-sm font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.1 }}
                onAnimationComplete={handleAnimationComplete}
              >
                {/* Speech bubble pointer */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45" />

                {/* Message */}
                <p className="relative z-10">{currentMessage}</p>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutMascot;
