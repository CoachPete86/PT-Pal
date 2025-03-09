import * as React from "react";
import { ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DropdownNavProps {
  options: {
    id: string;
    label: string;
    icon?: React.ElementType;
  }[];
  activeTab: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function DropdownNav({
  options,
  activeTab,
  onSelect,
  className,
}: DropdownNavProps) {
  const activeOption =
    options.find((option) => option.id === activeTab) || options[0];

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between px-4 py-5 text-base font-medium"
          >
            <div className="flex items-centre gap-2">
              {activeOption.icon && <activeOption.icon className="h-4 w-4" />}
              <span>{activeOption.label}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content className="w-56 rounded-md border bg-background p-1 shadow-md animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 z-50">
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.id}
              className={cn(
                "relative flex cursor-default select-none items-centre rounded-sm px-3 py-2.5 text-sm outline-none transition-colours focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                activeTab === option.id && "bg-accent text-accent-foreground",
              )}
              onClick={() => onSelect(option.id)}
            >
              {option.icon && <option.icon className="mr-2 h-4 w-4" />}
              {option.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
}
