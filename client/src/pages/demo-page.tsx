import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Calendar, Phone, Mail, Users, Clock } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  businessType: z.enum(["personal_trainer", "fitness_studio", "gym", "health_coach", "other"], {
    required_error: "Please select a business type.",
  }),
  clientCount: z.string({
    required_error: "Please select a client count range.",
  }),
  interests: z.array(z.string()).nonempty({
    message: "Please select at least one area of interest.",
  }),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DemoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const defaultValues: Partial<FormValues> = {
    businessType: "personal_trainer",
    clientCount: "1-10",
    interests: ["workout_generator"],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const interestOptions = [
    { value: "workout_generator", label: "AI Workout Generator" },
    { value: "movement_analysis", label: "Movement Analysis" },
    { value: "meal_planning", label: "Meal Planning" },
    { value: "client_management", label: "Client Management" },
    { value: "session_tracking", label: "Session Tracking" },
    { value: "white_label", label: "White-Label Branding" },
    { value: "business_analytics", label: "Business Analytics" },
  ];
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulating API call for demo request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success handling
      setIsSuccess(true);
      toast({
        title: "Demo Request Submitted",
        description: "We've received your request. Our team will contact you shortly to schedule your demo.",
      });
      
      // Reset form
      form.reset(defaultValues);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-centre mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Schedule a Personalized Demo</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how our platform can transform your fitness business with a personalized demonstration tailored to your specific needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="flex items-start space-x-4">
              <Calendar className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Personalized Walkthrough</h3>
                <p className="text-muted-foreground">Our product specialists will guide you through the features most relevant to your business, answering questions along the way.</p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-start space-x-4">
              <Clock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">30-Minute Session</h3>
                <p className="text-muted-foreground">Our demos are focused and efficient, respecting your busy schedule while providing comprehensive information.</p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-start space-x-4">
              <Users className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Expert Advice</h3>
                <p className="text-muted-foreground">Get implementation recommendations specific to your business size and client needs from our fitness business specialists.</p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-start space-x-4">
              <Phone className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Flexible Options</h3>
                <p className="text-muted-foreground">Choose between a video call demo or phone consultation based on your preference and availability.</p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-start space-x-4">
              <Mail className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Follow-Up Resources</h3>
                <p className="text-muted-foreground">Receive helpful guides, pricing information, and implementation tips via email after your demo.</p>
              </div>
            </motion.div>
          </motion.div>

          <div className="bg-card p-8 rounded-lg border">
            {isSuccess ? (
              <div className="text-centre py-12">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-centre justify-centre mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
                <p className="text-muted-foreground mb-6">
                  Your demo request has been successfully submitted. One of our product specialists will contact you soon to schedule your personalized demonstration.
                </p>
                <Button onClick={() => setIsSuccess(false)}>
                  Request Another Demo
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your business name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="personal_trainer">Personal Trainer</SelectItem>
                              <SelectItem value="fitness_studio">Fitness Studio</SelectItem>
                              <SelectItem value="gym">Gym</SelectItem>
                              <SelectItem value="health_coach">Health Coach</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Clients</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-centre space-x-2">
                                <RadioGroupItem value="1-10" id="clients-1-10" />
                                <label htmlFor="clients-1-10" className="text-sm cursor-pointer">1-10</label>
                              </div>
                              <div className="flex items-centre space-x-2">
                                <RadioGroupItem value="11-30" id="clients-11-30" />
                                <label htmlFor="clients-11-30" className="text-sm cursor-pointer">11-30</label>
                              </div>
                              <div className="flex items-centre space-x-2">
                                <RadioGroupItem value="31-50" id="clients-31-50" />
                                <label htmlFor="clients-31-50" className="text-sm cursor-pointer">31-50</label>
                              </div>
                              <div className="flex items-centre space-x-2">
                                <RadioGroupItem value="50+" id="clients-50+" />
                                <label htmlFor="clients-50+" className="text-sm cursor-pointer">50+</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="interests"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Features of Interest</FormLabel>
                          <FormDescription>
                            Select all features you'd like to learn more about
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {interestOptions.map((option) => (
                            <FormField
                              key={option.value}
                              control={form.control}
                              name="interests"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, option.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.value
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your specific needs or questions..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Request Demo"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}