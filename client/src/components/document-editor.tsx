import * as React from "react";
import { useEditor, EditorContent, BubbleMenu, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { common, createLowlight } from 'lowlight'
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Table as TableIcon,
  Code,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Brain,
  Sparkles,
  Undo,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Command } from "@/components/ui/command";
import { useState, useCallback } from "react";
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { InsertDocument } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const lowlight = createLowlight(common);

const SlashCommand = Extension.create({
  name: 'slashCommand',
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        items: ({ query }) => [
          { title: 'Heading 1', command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
          { title: 'Heading 2', command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
          { title: 'Task List', command: ({ editor }) => editor.chain().focus().toggleTaskList().run() },
          { title: 'Table', command: ({ editor }) => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run() },
          { title: 'Code Block', command: ({ editor }) => editor.chain().focus().toggleCodeBlock().run() },
        ].filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase())
        ),
      }),
    ];
  },
});

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
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandMenuPosition, setCommandMenuPosition] = useState<{ left: number; top: number } | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (data: InsertDocument & { notionSync?: boolean }) => {
      const endpoint = documentId ? `/api/documents/${documentId}` : "/api/documents";
      const method = documentId ? "PATCH" : "POST";

      if (notionPageId && data.notionSync) {
        await apiRequest("POST", `/api/documents/${documentId}/notion-sync`, {
          title: data.title,
          content: data.content,
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

  const aiAssistMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await apiRequest("POST", "/api/coach-assist", {
        prompt,
        context: editor?.getHTML() || "",
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (editor) {
        editor.chain().focus().insertContent(data.response).run();
      }
      toast({
        title: "Coach Pete",
        description: "Response added to document",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to get assistant response. Premium service required.",
        variant: "destructive",
      });
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Highlight,
      Link,
      Typography,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: 'Type "/" for commands...',
      }),
      SlashCommand,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] px-4 py-2",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="border-b pb-4 flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 3 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center gap-1">
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
        </div>

        <div className="flex items-center gap-1">
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
            pressed={editor.isActive("taskList")}
            onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
          >
            <CheckSquare className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("codeBlock")}
            onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code className="h-4 w-4" />
          </Toggle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>

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

      <EditorContent editor={editor} className="min-h-[500px] border rounded-md" />

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