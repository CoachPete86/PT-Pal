
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload } from "lucide-react";

const brandingSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  logoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").optional(),
  fontFamily: z.string().optional(),
  emailTemplate: z.string().optional(),
  domainName: z.string().optional(),
  contactEmail: z.string().email("Must be a valid email").optional(),
  contactPhone: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

export default function WhiteLabelCustomization() {
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      businessName: "",
      logoUrl: "",
      primaryColor: "#4CAF50",
      secondaryColor: "#2196F3",
      fontFamily: "Inter",
      emailTemplate: "",
      domainName: "",
      contactEmail: "",
      contactPhone: "",
      socialLinks: {
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
      },
    },
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await axios.get("/api/branding");
        if (response.data) {
          form.reset(response.data);
          if (response.data.logoUrl) {
            setLogoPreview(response.data.logoUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching branding:", error);
      }
    };

    fetchBranding();
  }, [form]);

  const onSubmit = async (data: BrandingFormValues) => {
    setIsLoading(true);
    try {
      await axios.patch("/api/branding", data);
      toast({
        title: "Branding updated",
        description: "Your branding settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating branding:", error);
      toast({
        title: "Error",
        description: "Failed to update branding settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      form.setValue("logoUrl", base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>White Label Customization</CardTitle>
        <CardDescription>
          Customize your branding to personalize the client experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="contact">Contact & Social</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="general">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Fitness Business" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormItem>
                    <FormLabel>Business Logo</FormLabel>
                    <div className="flex items-center gap-4">
                      {logoPreview && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border flex items-center justify-center">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="max-w-full max-h-full object-contain" 
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <FormControl>
                          <div className="flex items-center">
                            <Input 
                              type="file" 
                              accept="image/*"
                              id="logo-upload"
                              className="hidden"
                              onChange={handleLogoUpload}
                            />
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => document.getElementById('logo-upload')?.click()}
                              className="flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Upload Logo
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a logo to display in client-facing areas.
                        </FormDescription>
                      </div>
                    </div>
                  </FormItem>
                </div>
              </TabsContent>
              
              <TabsContent value="design">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full border" 
                                style={{ backgroundColor: field.value }}
                              />
                              <Input {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Main color for buttons and headers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Color</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full border" 
                                style={{ backgroundColor: field.value }}
                              />
                              <Input {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Accent color for highlights and secondary elements
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="fontFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Family</FormLabel>
                        <FormControl>
                          <Input placeholder="Inter" {...field} />
                        </FormControl>
                        <FormDescription>
                          Primary font for your application (system fonts recommended)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="contact">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@yourbusiness.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">Social Media Links</h3>
                    
                    <FormField
                      control={form.control}
                      name="socialLinks.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/yourbusiness" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="socialLinks.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/yourbusiness" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="domainName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Domain</FormLabel>
                        <FormControl>
                          <Input placeholder="fitness.yourbusiness.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Used for white-labeled client portal (additional setup required)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emailTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Template ID</FormLabel>
                        <FormControl>
                          <Input placeholder="template_123456" {...field} />
                        </FormControl>
                        <FormDescription>
                          For custom email templates (contact support to set up)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save Branding Settings"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
