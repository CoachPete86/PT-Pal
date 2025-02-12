import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { InsertDocument } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DocumentEditorProps {
  initialContent?: string;
  documentId?: number;
  notionPageId?: string;
  onSave?: (document: InsertDocument) => void;
}

export default function DocumentEditor({
  initialContent = "",
  documentId,
  notionPageId,
  onSave,
}: DocumentEditorProps) {
  const { toast } = useToast();
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Link,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px]",
      },
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertDocument & { notionSync?: boolean }) => {
      const endpoint = documentId ? `/api/documents/${documentId}` : "/api/documents";
      const method = documentId ? "PATCH" : "POST";

      // If we have a Notion page ID and notionSync is true, sync with Notion
      if (notionPageId && data.notionSync) {
        await apiRequest("POST", `/api/documents/${documentId}/notion-sync`, {
          title: data.title,
          content: data.content,
          notionPageId,
        });
      }

      const res = await apiRequest(method, endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document saved successfully",
      });
      if (onSave) {
        onSave({
          title: "",
          content: editor?.getHTML() || "",
          type: "document",
          parentId: null,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="border-b pb-4 flex flex-wrap gap-2">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EditorContent editor={editor} className="min-h-[500px]" />

      <div className="flex justify-end gap-2">
        {notionPageId && (
          <Button
            variant="outline"
            onClick={() =>
              saveMutation.mutate({
                title: "Untitled Document",
                content: editor.getHTML(),
                type: "document",
                parentId: null,
                notionSync: true,
              })
            }
            disabled={saveMutation.isPending}
          >
            Save & Sync to Notion
          </Button>
        )}
        <Button
          onClick={() =>
            saveMutation.mutate({
              title: "Untitled Document",
              content: editor.getHTML(),
              type: "document",
              parentId: null,
            })
          }
          disabled={saveMutation.isPending}
        >
          Save Locally
        </Button>
      </div>
    </div>
  );
}