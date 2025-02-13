import * as React from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
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
import { InsertDocument } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandInput,
} from "@/components/ui/command";
import { useState, useCallback } from "react";
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

const lowlight = createLowlight(common)

// Define the SlashCommand extension before using it
const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
          props.command({ editor, range })
        },
      }
    }
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

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
      const res = await apiRequest("POST", "/api/ai-coach", {
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
        description: "Failed to get AI response. Premium service required.",
        variant: "destructive",
      });
    },
  });

  const handleAiCommand = useCallback((command: string) => {
    const aiCommands = {
      "explain-exercise": "Explain how to properly perform the exercise mentioned in the current section.",
      "suggest-workout": "Suggest a workout plan based on the goals mentioned in this document.",
      "optimize-nutrition": "Analyze and suggest improvements for the nutrition plan in this document.",
      "form-check": "Review the exercise form described and provide corrections and tips.",
      "simplify": "Explain this fitness concept in simpler terms.",
      "help": "How can I help you with your fitness journey today?",
    };

    aiAssistMutation.mutate(aiCommands[command as keyof typeof aiCommands] || command);
    setShowCommandMenu(false);
    setCommandMenuPosition(null);
  }, [aiAssistMutation]);

  const insertBlock = useCallback((editor: any, type: string) => {
    if (!editor) return;

    switch (type) {
      case "table":
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        break;
      case "task-list":
        editor.chain().focus().toggleTaskList().run();
        break;
      case "code-block":
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case "heading-1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "heading-2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "heading-3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
    }
    setShowCommandMenu(false);
    setCommandMenuPosition(null);
  }, []);

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
        placeholder: 'Type "/" for commands or "@coach" for AI assistance...',
      }),
      SlashCommand.configure({
        suggestion: {
          char: '/',
          command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
            props.command({ editor, range });
          },
          items: ({ editor }: { editor: any }) => [
            { 
              title: 'Heading 1',
              command: () => insertBlock(editor, 'heading-1')
            },
            {
              title: 'Heading 2',
              command: () => insertBlock(editor, 'heading-2')
            },
            {
              title: 'Task List',
              command: () => insertBlock(editor, 'task-list')
            },
            {
              title: 'Table',
              command: () => insertBlock(editor, 'table')
            },
            {
              title: 'Code Block',
              command: () => insertBlock(editor, 'code-block')
            },
            {
              title: 'Ask Coach Pete',
              command: () => handleAiCommand('help')
            },
            {
              title: 'Explain Exercise',
              command: () => handleAiCommand('explain-exercise')
            },
            {
              title: 'Suggest Workout',
              command: () => handleAiCommand('suggest-workout')
            },
            {
              title: 'Optimize Nutrition',
              command: () => handleAiCommand('optimize-nutrition')
            },
            {
              title: 'Form Check',
              command: () => handleAiCommand('form-check')
            },
            {
              title: 'Simplify',
              command: () => handleAiCommand('simplify')
            },
          ],
          render: ({ editor, range, decorationNode }) => {
            const domNode = decorationNode.type.spec.inline
              ? decorationNode
              : decorationNode.firstChild;

            if (!domNode) {
              setShowCommandMenu(false);
              setCommandMenuPosition(null);
              return null;
            }

            const rect = domNode.getBoundingClientRect();
            setCommandMenuPosition({
              left: rect.left,
              top: rect.bottom + window.scrollY,
            });
            setShowCommandMenu(true);
            return null;
          },
          onExit: () => {
            setShowCommandMenu(false);
            setCommandMenuPosition(null);
          },
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] px-4 py-2",
      },
    },
    onCreate: ({ editor }) => {
      editor.commands.focus('end');
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
            onPressedChange={() => insertBlock(editor, "heading-1")}
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() => insertBlock(editor, "heading-2")}
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 3 })}
            onPressedChange={() => insertBlock(editor, "heading-3")}
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
            onPressedChange={() => insertBlock(editor, "task-list")}
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
            onPressedChange={() => insertBlock(editor, "code-block")}
          >
            <Code className="h-4 w-4" />
          </Toggle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => insertBlock(editor, "table")}
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

      {showCommandMenu && commandMenuPosition && (
        <div
          className="fixed z-50"
          style={{
            left: commandMenuPosition.left,
            top: commandMenuPosition.top,
          }}
        >
          <Command className="rounded-lg border bg-popover shadow-md w-[300px]">
            <CommandInput placeholder="Type a command..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Blocks">
                <CommandItem onSelect={() => insertBlock(editor, "heading-1")}>
                  <Heading1 className="mr-2 h-4 w-4" />
                  Heading 1
                </CommandItem>
                <CommandItem onSelect={() => insertBlock(editor, "heading-2")}>
                  <Heading2 className="mr-2 h-4 w-4" />
                  Heading 2
                </CommandItem>
                <CommandItem onSelect={() => insertBlock(editor, "task-list")}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Task List
                </CommandItem>
                <CommandItem onSelect={() => insertBlock(editor, "table")}>
                  <TableIcon className="mr-2 h-4 w-4" />
                  Table
                </CommandItem>
                <CommandItem onSelect={() => insertBlock(editor, "code-block")}>
                  <Code className="mr-2 h-4 w-4" />
                  Code Block
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="AI Coach Pete">
                <CommandItem onSelect={() => handleAiCommand("explain-exercise")}>
                  <Brain className="mr-2 h-4 w-4" />
                  Explain Exercise
                </CommandItem>
                <CommandItem onSelect={() => handleAiCommand("suggest-workout")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Suggest Workout Plan
                </CommandItem>
                <CommandItem onSelect={() => handleAiCommand("optimize-nutrition")}>
                  <Brain className="mr-2 h-4 w-4" />
                  Optimize Nutrition
                </CommandItem>
                <CommandItem onSelect={() => handleAiCommand("form-check")}>
                  <Brain className="mr-2 h-4 w-4" />
                  Form Check
                </CommandItem>
                <CommandItem onSelect={() => handleAiCommand("simplify")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Simplify This
                </CommandItem>
                <CommandItem onSelect={() => handleAiCommand("help")}>
                  <Brain className="mr-2 h-4 w-4" />
                  Ask Coach Pete
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}

      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              data-active={editor.isActive('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              data-active={editor.isActive('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              data-active={editor.isActive('strike')}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}

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