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

export default function DocumentList({
  onSelect,
  selectedId,
}: DocumentListProps) {
  const { toast } = useToast();
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Default templates in UK English format
  const defaultTemplates = [
    {
      id: -1,
      title: "Session Plan Template",
      type: "document",
      isTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: -2,
      title: "PAR-Q Health Questionnaire",
      type: "document",
      isTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: -3,
      title: "Initial Consultation Form",
      type: "document",
      isTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: -4,
      title: "Client Contract & Terms",
      type: "document",
      isTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: -5,
      title: "Fitness Assessment Form",
      type: "document",
      isTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const handleTemplateSelect = (templateId: number) => {
    // Find the selected template
    const template = defaultTemplates.find((t) => t.id === templateId);
    if (template) {
      onSelect(template as Document);
    }
  };

  const handleCreateDocument = () => {
    const newDoc = {
      id: null,
      title: "New Document",
      content: "",
      type: "document",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Document;

    onSelect(newDoc);
  };

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
      <div className="flex items-centre justify-centre h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!documents?.length) {
    return (
      <div className="text-centre p-4">
        <p className="text-sm text-muted-foreground mb-4">
          No saved documents yet
        </p>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleCreateDocument}
          >
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
            <RefreshCw
              className={cn(
                "h-4 w-4 mr-2",
                syncMutation.isPending && "animate-spin",
              )}
            />
            Sync with Notion
          </Button>
        </div>

        {/* Display default templates even when no documents exist */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-medium mb-3">Template Library</h3>
          <div className="space-y-2">
            {defaultTemplates.map((template) => (
              <div
                key={template.id}
                className={cn(
                  "p-2 rounded-md border cursor-pointer hover:bg-muted transition-colours text-left",
                  selectedId === template.id && "bg-muted border-primary",
                )}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-centre justify-between">
                  <span className="text-sm font-medium">{template.title}</span>
                  <span className="text-xs text-muted-foreground">
                    Template
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Create a tree structure from flat documents array
  const buildTree = (
    items: Document[],
    parentId: number | null = null,
  ): Document[] => {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      }));
  };

  const documentTree = buildTree(documents);

  const DocumentNode = ({
    document,
    level = 0,
  }: {
    document: Document & { children?: Document[] };
    level?: number;
  }) => {
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
            level > 0 && "ml-4",
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
      <div className="flex justify-between items-centre">
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
        >
          <RefreshCw
            className={cn(
              "h-4 w-4 mr-2",
              syncMutation.isPending && "animate-spin",
            )}
          />
          Sync
        </Button>
        <Button variant="outline" size="sm" onClick={handleCreateDocument}>
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-24rem)] overflow-y-auto -webkit-overflow-scrolling-touch">
        <div className="space-y-1 p-2">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">
            Your Documents
          </h3>
          {documentTree.map((document) => (
            <DocumentNode key={document.id} document={document} />
          ))}
        </div>
      </ScrollArea>

      {/* Templates section - always show */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">
          Template Library
        </h3>
        <ScrollArea className="h-[calc(100vh-28rem)] overflow-y-auto -webkit-overflow-scrolling-touch">
          <div className="space-y-2 p-1">
            {defaultTemplates.map((template) => (
              <div
                key={template.id}
                className={cn(
                  "p-2 rounded-md border cursor-pointer hover:bg-muted transition-colours text-left",
                  selectedId === template.id && "bg-muted border-primary",
                )}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-centre justify-between">
                  <span className="text-sm font-medium">{template.title}</span>
                  <span className="text-xs text-muted-foreground">
                    Template
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
