import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export function UniversalSearch() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data: searchResults } = useQuery({
    queryKey: ["/api/search"],
    enabled: open,
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-centre w-full max-w-sm gap-2 h-9 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colours hover:bg-accent"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-centre gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Clients">
            {searchResults?.clients?.map((client) => (
              <CommandItem
                key={client.id}
                onSelect={() => {
                  setOpen(false);
                  setLocation(`/clients/${client.id}`);
                }}
              >
                {client.fullName}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Documents">
            {searchResults?.documents?.map((doc) => (
              <CommandItem
                key={doc.id}
                onSelect={() => {
                  setOpen(false);
                  setLocation(`/documents/${doc.id}`);
                }}
              >
                {doc.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
