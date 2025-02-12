import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import type { Booking } from "@shared/schema";

export default function BookingForm() {
  const form = useForm({
    defaultValues: {
      date: new Date(),
      notes: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: { date: Date; notes: string }) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      form.reset();
    },
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-4">Upcoming Bookings</h3>
        {bookings?.length ? (
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 rounded-lg border bg-card text-card-foreground"
              >
                <div className="font-medium">
                  {format(new Date(booking.date), "PPP")}
                </div>
                {booking.notes && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {booking.notes}
                  </div>
                )}
                <div className="text-sm text-muted-foreground mt-1">
                  Status: {booking.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No upcoming bookings</p>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => bookingMutation.mutate(data))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Any special requirements or questions?"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={bookingMutation.isPending}
          >
            Book Session
          </Button>
        </form>
      </Form>
    </div>
  );
}
