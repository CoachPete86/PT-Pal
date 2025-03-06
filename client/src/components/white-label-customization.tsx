
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
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Brush,
  Globe,
  Mail,
  Palette,
  Image as ImageIcon,
  Upload,
  Check,
  Trash2,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export default function WhiteLabelCustomization() {
  const [activeTab, setActiveTab] = useState("branding");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [brandSettings, setBrandSettings] = useState({
    businessName: "PT Pal",
    brandColor: "#4c7bea",
    accentColor: "#10b981",
    fontFamily: "Inter",
    customDomain: "app.ptpal.com",
    loginPageBgColor: "#f8fafc",
    emailSignature: "Best regards,\nThe PT Pal Team",
    enableCustomBranding: true,
    enableWhiteLabel: false,
  });

  // Handle logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Handle favicon file upload
  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  // Update brand settings
  const updateBrandSetting = (key: string, value: any) => {
    setBrandSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save brand settings
  const saveBrandSettings = () => {
    // Here you would send the data to your backend
    console.log("Saving brand settings:", brandSettings);
    console.log("Logo file:", logoFile);
    console.log("Favicon file:", faviconFile);

    toast({
      title: "Brand settings saved",
      description: "Your brand customizations have been applied.",
    });
  };

  // Calculate preview background based on settings
  const getPreviewStyle = () => {
    const style: React.CSSProperties = {
      backgroundColor: "#ffffff",
      fontFamily: brandSettings.fontFamily,
      borderRadius: "0.5rem",
      overflow: "hidden",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    };

    if (previewDevice === "mobile") {
      style.width = "320px";
      style.height = "568px";
    } else if (previewDevice === "tablet") {
      style.width = "768px";
      style.height = "1024px";
      style.maxHeight = "500px";
    } else {
      style.width = "100%";
      style.height = "400px";
    }

    return style;
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (faviconPreview) URL.revokeObjectURL(faviconPreview);
    };
  }, [logoPreview, faviconPreview]);

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">White Label & Branding</h1>
          <p className="text-muted-foreground">
            Customize your platform's appearance to match your brand identity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Branding Settings</CardTitle>
                <CardDescription>
                  Customize how your brand appears to clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="branding">
                      <Palette className="h-4 w-4 mr-2" />
                      <span>Branding</span>
                    </TabsTrigger>
                    <TabsTrigger value="domain">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>Domain</span>
                    </TabsTrigger>
                    <TabsTrigger value="email">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>Email</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="branding" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={brandSettings.businessName}
                          onChange={(e) =>
                            updateBrandSetting("businessName", e.target.value)
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Brand Logo</Label>
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 border rounded-md flex items-center justify-center bg-muted"
                            style={{
                              backgroundImage: logoPreview
                                ? `url(${logoPreview})`
                                : "none",
                              backgroundSize: "contain",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                            }}
                          >
                            {!logoPreview && (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex gap-2">
                            <label htmlFor="logo-upload">
                              <Button variant="outline" size="sm" asChild>
                                <span>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Logo
                                </span>
                              </Button>
                            </label>
                            <input
                              id="logo-upload"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleLogoUpload}
                            />
                            {logoPreview && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setLogoFile(null);
                                  setLogoPreview(null);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Recommended size: 512x512 pixels, PNG or SVG format
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label>Favicon</Label>
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 border rounded-md flex items-center justify-center bg-muted"
                            style={{
                              backgroundImage: faviconPreview
                                ? `url(${faviconPreview})`
                                : "none",
                              backgroundSize: "contain",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                            }}
                          >
                            {!faviconPreview && (
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex gap-2">
                            <label htmlFor="favicon-upload">
                              <Button variant="outline" size="sm" asChild>
                                <span>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Favicon
                                </span>
                              </Button>
                            </label>
                            <input
                              id="favicon-upload"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleFaviconUpload}
                            />
                            {faviconPreview && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setFaviconFile(null);
                                  setFaviconPreview(null);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Recommended size: 32x32 pixels, PNG or ICO format
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="brandColor">Primary Brand Color</Label>
                        <div className="flex gap-2">
                          <div
                            className="w-10 h-10 rounded-md border"
                            style={{
                              backgroundColor: brandSettings.brandColor,
                            }}
                          />
                          <Input
                            id="brandColor"
                            type="color"
                            value={brandSettings.brandColor}
                            onChange={(e) =>
                              updateBrandSetting("brandColor", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={brandSettings.brandColor}
                            onChange={(e) =>
                              updateBrandSetting("brandColor", e.target.value)
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <div className="flex gap-2">
                          <div
                            className="w-10 h-10 rounded-md border"
                            style={{
                              backgroundColor: brandSettings.accentColor,
                            }}
                          />
                          <Input
                            id="accentColor"
                            type="color"
                            value={brandSettings.accentColor}
                            onChange={(e) =>
                              updateBrandSetting("accentColor", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={brandSettings.accentColor}
                            onChange={(e) =>
                              updateBrandSetting("accentColor", e.target.value)
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <Select
                          value={brandSettings.fontFamily}
                          onValueChange={(value) =>
                            updateBrandSetting("fontFamily", value)
                          }
                        >
                          <SelectTrigger id="fontFamily">
                            <SelectValue placeholder="Select font family" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Montserrat">Montserrat</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="loginPageBgColor">Login Page Background</Label>
                        <div className="flex gap-2">
                          <div
                            className="w-10 h-10 rounded-md border"
                            style={{
                              backgroundColor: brandSettings.loginPageBgColor,
                            }}
                          />
                          <Input
                            id="loginPageBgColor"
                            type="color"
                            value={brandSettings.loginPageBgColor}
                            onChange={(e) =>
                              updateBrandSetting("loginPageBgColor", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={brandSettings.loginPageBgColor}
                            onChange={(e) =>
                              updateBrandSetting("loginPageBgColor", e.target.value)
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="domain" className="space-y-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Custom Domain</CardTitle>
                        <CardDescription>
                          Set up a custom domain for your clients to access
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="customDomain">Domain Name</Label>
                          <Input
                            id="customDomain"
                            placeholder="app.yourbrand.com"
                            value={brandSettings.customDomain}
                            onChange={(e) =>
                              updateBrandSetting("customDomain", e.target.value)
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter the domain you want to use for your application
                          </p>
                        </div>

                        <div className="rounded-md bg-muted p-4">
                          <h4 className="text-sm font-medium mb-2">DNS Configuration</h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            To use your custom domain, you'll need to set up these DNS records:
                          </p>
                          <div className="space-y-2 text-xs">
                            <div className="grid grid-cols-3 gap-2 p-2 bg-muted/50 rounded-md">
                              <span className="font-medium">Type</span>
                              <span className="font-medium">Name</span>
                              <span className="font-medium">Value</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 p-2 bg-background rounded-md">
                              <span>CNAME</span>
                              <span>app</span>
                              <span>client.ptpal.app</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm">Domain verification: Pending</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button>Verify Domain</Button>
                      </CardFooter>
                    </Card>

                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="text-sm font-medium mb-2">Current URLs</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Default URL:</span>
                          <code className="text-xs bg-muted/50 p-1 rounded">
                            https://ptpal.app/trainer/12345
                          </code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Custom URL:</span>
                          <code className="text-xs bg-muted/50 p-1 rounded">
                            https://{brandSettings.customDomain}
                          </code>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="email" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="emailSignature">Email Signature</Label>
                        <Textarea
                          id="emailSignature"
                          placeholder="Your signature..."
                          rows={4}
                          value={brandSettings.emailSignature}
                          onChange={(e) =>
                            updateBrandSetting("emailSignature", e.target.value)
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          This signature will appear at the bottom of all automated emails
                        </p>
                      </div>

                      <div className="bg-muted rounded-md p-4">
                        <h4 className="text-sm font-medium mb-2">
                          Email Footer Preview
                        </h4>
                        <div className="rounded-md bg-card p-4 text-sm">
                          <div
                            className="whitespace-pre-line"
                            style={{ fontFamily: brandSettings.fontFamily }}
                          >
                            {brandSettings.emailSignature}
                          </div>
                          <Separator className="my-2" />
                          <div className="flex items-center gap-2 mt-2">
                            {logoPreview ? (
                              <img
                                src={logoPreview}
                                alt="Logo Preview"
                                className="h-6 w-auto"
                              />
                            ) : (
                              <div
                                className="h-6 px-2 rounded flex items-center justify-center text-xs font-semibold"
                                style={{
                                  backgroundColor: brandSettings.brandColor,
                                  color: "#fff",
                                }}
                              >
                                {brandSettings.businessName}
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              © 2023 {brandSettings.businessName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Email Templates</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Button variant="outline" className="justify-start">
                            <Mail className="h-4 w-4 mr-2" />
                            Welcome Email
                          </Button>
                          <Button variant="outline" className="justify-start">
                            <Mail className="h-4 w-4 mr-2" />
                            Session Reminder
                          </Button>
                          <Button variant="outline" className="justify-start">
                            <Mail className="h-4 w-4 mr-2" />
                            Password Reset
                          </Button>
                          <Button variant="outline" className="justify-start">
                            <Mail className="h-4 w-4 mr-2" />
                            Invoice
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Customize the email templates sent to your clients
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/20 pt-2">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-custom-branding"
                      checked={brandSettings.enableCustomBranding}
                      onCheckedChange={(checked) =>
                        updateBrandSetting("enableCustomBranding", checked)
                      }
                    />
                    <Label htmlFor="enable-custom-branding">
                      Enable Custom Branding
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-white-label"
                      checked={brandSettings.enableWhiteLabel}
                      onCheckedChange={(checked) =>
                        updateBrandSetting("enableWhiteLabel", checked)
                      }
                    />
                    <Label htmlFor="enable-white-label">
                      Enable White Label (Remove PTpal branding)
                    </Label>
                  </div>
                </div>
                <Button onClick={saveBrandSettings}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Preview</CardTitle>
                  <div className="flex items-center space-x-1 bg-muted rounded-md p-1">
                    <Button
                      variant={previewDevice === "desktop" ? "default" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewDevice("desktop")}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === "tablet" ? "default" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewDevice("tablet")}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === "mobile" ? "default" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewDevice("mobile")}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>See how your changes will appear</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border rounded-md overflow-hidden mx-auto transition-all duration-300"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    overflow: "auto",
                  }}
                >
                  <div className="flex justify-center">
                    <div style={getPreviewStyle()}>
                      {/* App Header */}
                      <div
                        className="p-4 border-b flex items-center justify-between"
                        style={{
                          backgroundColor: "#ffffff",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="h-8 w-auto"
                            />
                          ) : (
                            <div
                              className="h-8 px-3 rounded flex items-center justify-center text-sm font-semibold"
                              style={{
                                backgroundColor: brandSettings.brandColor,
                                color: "#fff",
                              }}
                            >
                              {brandSettings.businessName}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      {/* App Content */}
                      <div className="p-4">
                        <div className="space-y-4">
                          <h2 className="text-lg font-semibold">Dashboard</h2>
                          <div
                            className="h-24 rounded-md w-full mb-4"
                            style={{
                              backgroundColor: brandSettings.brandColor + "20",
                              border: `1px solid ${brandSettings.brandColor}40`,
                            }}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div
                              className="h-32 rounded-md"
                              style={{
                                backgroundColor: "#f5f5f5",
                              }}
                            />
                            <div
                              className="h-32 rounded-md"
                              style={{
                                backgroundColor: "#f5f5f5",
                              }}
                            />
                          </div>
                          <div
                            className="p-3 rounded-md flex items-center justify-center font-medium text-white"
                            style={{
                              backgroundColor: brandSettings.brandColor,
                            }}
                          >
                            Primary Button
                          </div>
                          <div
                            className="p-3 rounded-md flex items-center justify-center font-medium text-white"
                            style={{
                              backgroundColor: brandSettings.accentColor,
                            }}
                          >
                            Secondary Button
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-1">
                <div className="text-sm text-muted-foreground">
                  {brandSettings.enableWhiteLabel ? (
                    <span className="text-green-500 font-medium">White Labeled</span>
                  ) : (
                    <span>PTpal branding visible</span>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Client View
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
