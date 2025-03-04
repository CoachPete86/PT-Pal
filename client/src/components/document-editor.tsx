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
  // Load template content based on documentId if it's one of our template documents
  const templateContent = React.useMemo(() => {
    if (documentId && documentId < 0) {
      switch(documentId) {
        case -1: // Session Plan Template
          return `<h1>Session Plan Template</h1>
<h2>Client Information</h2>
<p>Client Name: </p>
<p>Date: ${new Date().toLocaleDateString('en-GB')}</p>
<p>Session Type: </p>

<h2>Session Goals</h2>
<ul>
  <li>Goal 1</li>
  <li>Goal 2</li>
  <li>Goal 3</li>
</ul>

<h2>Warm-up (10 minutes)</h2>
<ul>
  <li>Exercise 1: 2 sets of 10 reps</li>
  <li>Exercise 2: 2 sets of 10 reps</li>
  <li>Exercise 3: 2 sets of 10 reps</li>
</ul>

<h2>Main Workout (35 minutes)</h2>
<h3>Circuit 1</h3>
<ul>
  <li>Exercise 1: 3 sets of 12 reps</li>
  <li>Exercise 2: 3 sets of 12 reps</li>
  <li>Exercise 3: 3 sets of 12 reps</li>
</ul>

<h3>Circuit 2</h3>
<ul>
  <li>Exercise 1: 3 sets of 12 reps</li>
  <li>Exercise 2: 3 sets of 12 reps</li>
  <li>Exercise 3: 3 sets of 12 reps</li>
</ul>

<h2>Cool-down (5 minutes)</h2>
<ul>
  <li>Stretch 1: 30 seconds</li>
  <li>Stretch 2: 30 seconds</li>
  <li>Stretch 3: 30 seconds</li>
</ul>

<h2>Notes and Observations</h2>
<p>Add any notes about the client's performance, areas for improvement, etc.</p>

<h2>Next Session Plan</h2>
<p>Briefly outline what you plan to focus on in the next session.</p>`;
        case -2: // PAR-Q Health Questionnaire
          return `<h1>PAR-Q Health Questionnaire</h1>
<p>Physical Activity Readiness Questionnaire (PAR-Q)</p>
<p>Date: ${new Date().toLocaleDateString('en-GB')}</p>

<h2>Personal Information</h2>
<p>Name: </p>
<p>Date of Birth: </p>
<p>Address: </p>
<p>Contact Number: </p>
<p>Email: </p>
<p>Emergency Contact: </p>

<h2>Health Questions</h2>
<p>Please answer the following questions with Yes or No.</p>

<ol>
  <li>Has your doctor ever said that you have a heart condition and that you should only perform physical activity recommended by a doctor?</li>
  <li>Do you feel pain in your chest when you perform physical activity?</li>
  <li>In the past month, have you had chest pain when you were not performing any physical activity?</li>
  <li>Do you lose your balance because of dizziness or do you ever lose consciousness?</li>
  <li>Do you have a bone or joint problem that could be made worse by a change in your physical activity?</li>
  <li>Is your doctor currently prescribing any medication for your blood pressure or for a heart condition?</li>
  <li>Do you know of any other reason why you should not engage in physical activity?</li>
</ol>

<h2>Additional Medical History</h2>
<p>Please provide details of any medical conditions, allergies, or injuries that might affect your ability to exercise:</p>

<h2>Declaration</h2>
<p>I have read, understood and completed this questionnaire. Any questions I had were answered to my full satisfaction.</p>

<p>Signature: ____________________</p>
<p>Date: ____________________</p>`;
        case -3: // Initial Consultation Form
          return `<h1>Initial Consultation Form</h1>
<p>Date: ${new Date().toLocaleDateString('en-GB')}</p>

<h2>Personal Information</h2>
<p>Name: </p>
<p>Date of Birth: </p>
<p>Address: </p>
<p>Contact Number: </p>
<p>Email: </p>
<p>Occupation: </p>
<p>How did you hear about us? </p>

<h2>Health and Fitness Background</h2>
<p>Current physical activity level: </p>
<p>Previous exercise experience: </p>
<p>Current health status (any medical conditions or injuries): </p>
<p>Current medications: </p>
<p>Previous injuries or surgeries: </p>

<h2>Fitness Goals</h2>
<p>Primary fitness goals: </p>
<p>Secondary fitness goals: </p>
<p>Timeframe for achieving goals: </p>
<p>Motivation for these goals: </p>

<h2>Lifestyle Assessment</h2>
<p>Typical daily routine: </p>
<p>Stress levels (low/medium/high): </p>
<p>Sleep patterns (hours per night): </p>
<p>Nutritional habits: </p>
<p>Alcohol consumption: </p>
<p>Smoking status: </p>

<h2>Training Preferences</h2>
<p>Preferred training times: </p>
<p>Preferred training days: </p>
<p>Activities you enjoy: </p>
<p>Activities you dislike: </p>
<p>Access to facilities/equipment: </p>

<h2>Initial Assessment</h2>
<p>Height: </p>
<p>Weight: </p>
<p>Body composition: </p>
<p>Resting heart rate: </p>
<p>Blood pressure: </p>
<p>Initial fitness tests: </p>

<h2>Agreement</h2>
<p>I confirm that the information provided is accurate to the best of my knowledge.</p>

<p>Client signature: ____________________</p>
<p>Date: ____________________</p>

<p>Trainer signature: ____________________</p>
<p>Date: ____________________</p>`;
        case -4: // Client Contract
          return `<h1>Client Contract & Terms</h1>
<p>Date: ${new Date().toLocaleDateString('en-GB')}</p>

<h2>Parties</h2>
<p>This agreement is between:</p>
<p>Trainer: </p>
<p>Client: </p>

<h2>Services</h2>
<p>The Trainer agrees to provide the following services:</p>
<ul>
  <li>Personal training sessions as specified in this agreement</li>
  <li>Fitness assessments</li>
  <li>Exercise programme design</li>
  <li>Nutritional guidance (not medical nutrition therapy)</li>
</ul>

<h2>Term and Session Details</h2>
<p>Start date: </p>
<p>Number of sessions: </p>
<p>Session frequency: </p>
<p>Session duration: </p>
<p>Session location: </p>

<h2>Fees and Payment</h2>
<p>Fee per session: £</p>
<p>Total package cost: £</p>
<p>Payment method: </p>
<p>Payment schedule: </p>

<h2>Cancellation Policy</h2>
<p>24 hours' notice is required for cancellation or rescheduling. Sessions cancelled with less than 24 hours' notice will be charged in full.</p>

<h2>Refund Policy</h2>
<p>Refunds for unused sessions are available within 30 days of purchase, minus a £50 administration fee. After 30 days, no refunds will be issued for unused sessions.</p>

<h2>Expiration</h2>
<p>Personal training sessions must be used within 6 months of the start date unless otherwise specified.</p>

<h2>Client Responsibilities</h2>
<p>The Client agrees to:</p>
<ul>
  <li>Complete all required health forms truthfully</li>
  <li>Inform the Trainer of any changes to health status</li>
  <li>Follow the Trainer's guidance during sessions</li>
  <li>Arrive on time for scheduled sessions</li>
</ul>

<h2>Assumption of Risk</h2>
<p>The Client acknowledges that exercise involves inherent risks and assumes all responsibility for these risks.</p>

<h2>Liability Waiver</h2>
<p>The Client waives any claims against the Trainer for injury, loss, or damage except in cases of gross negligence or intentional misconduct.</p>

<h2>Signatures</h2>
<p>Client signature: ____________________</p>
<p>Date: ____________________</p>

<p>Trainer signature: ____________________</p>
<p>Date: ____________________</p>`;
        case -5: // Fitness Assessment Form
          return `<h1>Fitness Assessment Form</h1>
<p>Date: ${new Date().toLocaleDateString('en-GB')}</p>

<h2>Client Information</h2>
<p>Name: </p>
<p>Age: </p>
<p>Gender: </p>
<p>Date of Assessment: </p>

<h2>Body Composition</h2>
<p>Height: </p>
<p>Weight: </p>
<p>BMI: </p>
<p>Body Fat Percentage: </p>
<p>Waist Circumference: </p>
<p>Hip Circumference: </p>
<p>Waist-to-Hip Ratio: </p>

<h2>Cardiovascular Assessment</h2>
<p>Resting Heart Rate: </p>
<p>Blood Pressure: </p>
<p>Step Test Results: </p>
<p>Recovery Heart Rate: </p>
<p>VO2 Max Estimate: </p>

<h2>Muscular Strength Assessment</h2>
<p>Upper Body (Push-ups in 1 minute): </p>
<p>Core Strength (Plank hold time): </p>
<p>Lower Body (Wall sit hold time): </p>
<p>Grip Strength (Right/Left): </p>

<h2>Muscular Endurance Assessment</h2>
<p>Squat Test (reps in 1 minute): </p>
<p>Sit-ups (reps in 1 minute): </p>
<p>Bench Dips (reps in 1 minute): </p>

<h2>Flexibility Assessment</h2>
<p>Sit and Reach Test: </p>
<p>Shoulder Flexibility: </p>
<p>Hip Flexibility: </p>
<p>Ankle Mobility: </p>

<h2>Movement Screening</h2>
<p>Overhead Squat Assessment: </p>
<p>Lunge Assessment: </p>
<p>Push-up Assessment: </p>
<p>Single-leg Balance: </p>

<h2>Goals and Recommendations</h2>
<p>Current Fitness Level: </p>
<p>Client's Goals: </p>
<p>Recommended Training Approach: </p>
<p>Priority Areas: </p>
<p>Follow-up Assessment Date: </p>

<h2>Notes</h2>
<p>Additional observations or recommendations:</p>

<h2>Signatures</h2>
<p>Fitness Professional: ____________________</p>
<p>Client: ____________________</p>`;
        default:
          return initialContent;
      }
    }
    return initialContent;
  }, [documentId, initialContent]);
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
    content: templateContent,
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
              type: "general",
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