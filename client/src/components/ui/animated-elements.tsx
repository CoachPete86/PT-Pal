import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";

type AnimatedButtonProps = React.ComponentProps<typeof Button> & {
  animateOnClick?: boolean;
};

export function AnimatedButton({
  children,
  className,
  animateOnClick = true,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={animateOnClick ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button className={className} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}

type AnimatedCardProps = React.ComponentProps<typeof Card> & {
  hover?: boolean;
};

export function AnimatedCard({
  children,
  className,
  hover = true,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={
        hover
          ? { y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }
          : undefined
      }
    >
      <Card className={className} {...props}>
        {children}
      </Card>
    </motion.div>
  );
}

type CollapsibleSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
};

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
  contentClassName,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <motion.div
        className="p-4 font-medium bg-muted/30 flex justify-between items-centre cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
      >
        <h3>{title}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={cn("p-4", contentClassName)}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PulseIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
      </span>
    </div>
  );
}

type StaggeredListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  staggerAmount?: number;
};

export function StaggeredList<T>({
  items,
  renderItem,
  className,
  itemClassName,
  staggerAmount = 0.05,
}: StaggeredListProps<T>) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerAmount,
          },
        },
      }}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3 }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
}

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
};

export function FadeIn({
  children,
  delay = 0,
  duration = 0.3,
  className,
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedToggleIcon({
  isActive,
  activeIcon: ActiveIcon,
  inactiveIcon: InactiveIcon,
  className,
}: {
  isActive: boolean;
  activeIcon: React.ComponentType<any>;
  inactiveIcon: React.ComponentType<any>;
  className?: string;
}) {
  return (
    <div className={cn("relative h-5 w-5", className)}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={isActive ? "active" : "inactive"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          {isActive ? (
            <ActiveIcon className="h-5 w-5" />
          ) : (
            <InactiveIcon className="h-5 w-5" />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function SuccessAnimation({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "rounded-full bg-green-100 p-2 flex items-centre justify-centre",
        className,
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 10,
      }}
    >
      <Check className="h-4 w-4 text-green-600" />
    </motion.div>
  );
}

type ExpandableSectionProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function ExpandableSection({
  title,
  children,
  defaultOpen = false,
  className,
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "border border-border rounded-md overflow-hidden",
        className,
      )}
    >
      <motion.div
        className="flex items-centre justify-between p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
      >
        <div className="font-medium">{title}</div>
        <AnimatedToggleIcon
          isActive={isOpen}
          activeIcon={ChevronUp}
          inactiveIcon={ChevronRight}
        />
      </motion.div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AddItemButton({
  onClick,
  label = "Add Item",
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <motion.button
      className={cn(
        "w-full flex items-centre justify-centre gap-2 py-3 px-4 border-2 border-dashed rounded-md text-muted-foreground hover:text-foreground transition-colours",
        className,
      )}
      onClick={onClick}
      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
      whileTap={{ scale: 0.98 }}
    >
      <Plus className="h-4 w-4" />
      <span>{label}</span>
    </motion.button>
  );
}
