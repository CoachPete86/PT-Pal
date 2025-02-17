import { motion } from "framer-motion";

interface LoadingStateProps {
  variant?: "plate" | "dumbbell" | "pulse";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingState({
  variant = "plate",
  size = "md",
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  if (variant === "plate") {
    return (
      <motion.div
        className={`relative ${sizeClasses[size]} ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.svg
          viewBox="0 0 50 50"
          className="w-full h-full text-primary"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="1, 7"
          />
          <circle
            cx="25"
            cy="25"
            r="8"
            fill="currentColor"
          />
        </motion.svg>
      </motion.div>
    );
  }

  if (variant === "dumbbell") {
    return (
      <motion.div
        className={`relative ${sizeClasses[size]} ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.svg
          viewBox="0 0 60 30"
          className="w-full h-full text-primary"
        >
          <motion.g
            animate={{
              y: [-2, 2, -2],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <rect x="5" y="12" width="10" height="6" rx="2" fill="currentColor" />
            <rect x="45" y="12" width="10" height="6" rx="2" fill="currentColor" />
            <rect x="15" y="14" width="30" height="2" fill="currentColor" />
          </motion.g>
        </motion.svg>
      </motion.div>
    );
  }

  // Pulse variant
  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 border-2 border-primary rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute inset-2 bg-primary rounded-full"
        animate={{
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
}
