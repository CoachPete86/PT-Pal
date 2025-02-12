import { useQuery, useMutation } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import {
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DocumentListProps {
  onSelect: (document: Document) => void;
  selectedId?: number;
}

export default function DocumentList({ onSelect, selectedId }: DocumentListProps) {
  const { toast } = useToast();
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/documents/sync");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Documents synced with Notion successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!documents?.length) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-muted-foreground mb-4">No documents yet</p>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Document
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              syncMutation.isPending && "animate-spin"
            )} />
            Sync with Notion
          </Button>
        </div>
      </div>
    );
  }

  // Create a tree structure from flat documents array
  const buildTree = (items: Document[], parentId: number | null = null): Document[] => {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      }));
  };

  const documentTree = buildTree(documents);

  const DocumentNode = ({ document, level = 0 }: { document: Document & { children?: Document[] }; level?: number }) => {
    const isFolder = document.type === "folder";
    const isSelected = document.id === selectedId;
    const Icon = isFolder ? FolderOpen : File;

    return (
      <>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 h-8 px-2 font-normal",
            isSelected && "bg-accent",
            level > 0 && "ml-4"
          )}
          onClick={() => onSelect(document)}
        >
          <Icon className="h-4 w-4" />
          <span className="truncate">{document.title}</span>
          {isFolder && document.children && document.children.length > 0 && (
            <ChevronRight className="h-4 w-4 ml-auto" />
          )}
        </Button>
        {isFolder &&
          document.children?.map((child) => (
            <DocumentNode key={child.id} document={child} level={level + 1} />
          ))}
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
        >
          <RefreshCw className={cn(
            "h-4 w-4 mr-2",
            syncMutation.isPending && "animate-spin"
          )} />
          Sync
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-1 p-2">
          {documentTree.map((document) => (
            <DocumentNode key={document.id} document={document} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}