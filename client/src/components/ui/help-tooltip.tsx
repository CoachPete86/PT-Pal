import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Character emoji mapping
export type TooltipCharacter =
  | "coach"
  | "nutritionist"
  | "scientist"
  | "gym-buddy"
  | "yoga-instructor"
  | "physio";

const characterConfig: Record<
  TooltipCharacter,
  {
    emoji: string;
    name: string;
    colour: string;
    bubbleStyle: string;
  }
> = {
  coach: {
    emoji: "🧢",
    name: "Coach Pete",
    colour: "bg-blue-100 border-blue-300 text-blue-800",
    bubbleStyle: "rounded-tl-none",
  },
  nutritionist: {
    emoji: "🍎",
    name: "Natalie",
    colour: "bg-green-100 border-green-300 text-green-800",
    bubbleStyle: "rounded-tr-none",
  },
  scientist: {
    emoji: "🧪",
    name: "Dr. Fit",
    colour: "bg-purple-100 border-purple-300 text-purple-800",
    bubbleStyle: "rounded-bl-none",
  },
  "gym-buddy": {
    emoji: "💪",
    name: "Buddy",
    colour: "bg-red-100 border-red-300 text-red-800",
    bubbleStyle: "rounded-br-none",
  },
  "yoga-instructor": {
    emoji: "🧘‍♀️",
    name: "Yolanda",
    colour: "bg-teal-100 border-teal-300 text-teal-800",
    bubbleStyle: "rounded-tl-none",
  },
  physio: {
    emoji: "🩹",
    name: "Phil",
    colour: "bg-amber-100 border-amber-300 text-amber-800",
    bubbleStyle: "rounded-tr-none",
  },
};

export interface HelpTooltipProps {
  content: string | React.ReactNode;
  character?: TooltipCharacter;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  children: React.ReactNode;
  align?: "start" | "centre" | "end";
}

export function HelpTooltip({
  content,
  character = "coach",
  side = "top",
  align = "centre",
  className,
  children,
}: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const config = characterConfig[character];

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild onClick={() => setOpen(true)}>
          <span className={cn("cursor-help", className)}>{children}</span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "flex items-start p-0 overflow-hidden border-2 shadow-lg max-w-[280px]",
            config.colour,
            "animate-in zoom-in-50",
          )}
        >
          <div className="flex flex-col w-full">
            {/* Character heading */}
            <div className="flex items-centre gap-2 px-3 py-2 border-b border-current/20">
              <div className="w-7 h-7 flex items-centre justify-centre rounded-full bg-white text-xl">
                {config.emoji}
              </div>
              <div className="font-medium">{config.name}</div>
            </div>

            {/* Content */}
            <div className={cn("p-3 relative", config.bubbleStyle)}>
              {typeof content === "string" ? (
                <p className="text-sm">{content}</p>
              ) : (
                content
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default HelpTooltip;
