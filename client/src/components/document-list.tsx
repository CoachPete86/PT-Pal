import { useQuery } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import {
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  onSelect: (document: Document) => void;
  selectedId?: number;
}

export default function DocumentList({ onSelect, selectedId }: DocumentListProps) {
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
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
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Document
        </Button>
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

  const DocumentNode = ({ document, level = 0 }: { document: Document; level?: number }) => {
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
          {isFolder && document.children?.length > 0 && (
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
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-1 p-2">
        {documentTree.map((document) => (
          <DocumentNode key={document.id} document={document} />
        ))}
      </div>
    </ScrollArea>
  );
}
