import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import type { Message } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function MessagePanel() {
  const { user } = useAuth();
  const form = useForm({
    defaultValues: {
      content: "",
      recipientId: 1, // Assuming Coach Pete has ID 1
    },
  });

  const messageMutation = useMutation({
    mutationFn: async (data: { content: string; recipientId: number }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      form.reset();
    },
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  return (
    <div className="h-[600px] flex flex-col">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages?.map((message) => (
            <div
              key={message.id}
              className={cn(
                "p-4 rounded-lg max-w-[80%]",
                message.senderId === user?.id
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted",
              )}
            >
              <div className="text-sm">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {format(new Date(message.timestamp!), "PPp")}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => messageMutation.mutate(data))}
          className="flex gap-2 mt-4"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Type your message..."
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="icon"
            disabled={messageMutation.isPending}
          >
            Send
          </Button>
        </form>
      </Form>
    </div>
  );
}
