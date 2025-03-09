import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, File, Building, Palette, Globe, CreditCard, Settings, User, Upload } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-states";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form schemas
const basicInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  fullName: z.string().min(1, "Your name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  about: z.string().optional(),
});

const brandingSchema = z.object({
  primaryColor: z.string().min(1, "Primary colour is required"),
  secondaryColor: z.string().min(1, "Secondary colour is required"),
  fontFamily: z.string().default("Inter"),
  currency: z.string().min(1, "Currency is required"),
  currencySymbol: z.string().min(1, "Currency symbol is required"),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  welcomeMessage: z.string().optional(),
});

const socialMediaSchema = z.object({
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;
type BrandingValues = z.infer<typeof brandingSchema>;
type SocialMediaValues = z.infer<typeof socialMediaSchema>;

type SubscriptionTier = "free" | "starter" | "professional" | "business" | "enterprise";

const subscriptionTiers = [
  { id: "free" as SubscriptionTier, name: "Free", price: 0 },
  { id: "starter" as SubscriptionTier, name: "Starter", price: 19 },
  { id: "professional" as SubscriptionTier, name: "Professional", price: 49 },
  { id: "business" as SubscriptionTier, name: "Business", price: 99 },
  { id: "enterprise" as SubscriptionTier, name: "Enterprise", price: 199 },
];

const currencies = [
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

export default function EnhancedBusinessSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(user?.subscriptionTier as SubscriptionTier || "free");
  const [setupComplete, setSetupComplete] = useState(false);

  // Get user profile and business data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: getProfileData,
    enabled: !!user,
  });

  async function getProfileData() {
    try {
      const res = await fetch("/api/user/profile", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch profile data");
      return res.json();
    } catch (error) {
      console.error("Error fetching profile data:", error);
      return null;
    }
  }

  // Get branding data
  const { data: branding, isLoading: brandingLoading } = useQuery({
    queryKey: ["/api/branding"],
    queryFn: getBrandingData,
    enabled: !!user,
  });

  async function getBrandingData() {
    try {
      const res = await fetch("/api/branding", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch branding data");
      return res.json();
    } catch (error) {
      console.error("Error fetching branding data:", error);
      return null;
    }
  }

  // Basic info form
  const basicInfoForm = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      businessName: profile?.businessName || "",
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      website: profile?.website || "",
      about: profile?.about || "",
    },
  });

  // Branding form
  const brandingForm = useForm<BrandingValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      primaryColor: branding?.primaryColor || "#4c7bea",
      secondaryColor: branding?.secondaryColor || "#10b981",
      fontFamily: branding?.fontFamily || "Inter",
      currency: branding?.currency || "GBP",
      currencySymbol: branding?.currencySymbol || "£",
      logoUrl: branding?.logoUrl || "",
      welcomeMessage: branding?.welcomeMessage || "",
    },
  });

  // Social media form
  const socialMediaForm = useForm<SocialMediaValues>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      facebook: profile?.socialLinks?.facebook || "",
      instagram: profile?.socialLinks?.instagram || "",
      twitter: profile?.socialLinks?.twitter || "",
      linkedin: profile?.socialLinks?.linkedin || "",
      youtube: profile?.socialLinks?.youtube || "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: BasicInfoValues) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Profile updated",
        description: "Your business information has been updated successfully.",
      });
      if (activeTab === "basic-info") {
        setActiveTab("branding");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update branding mutation
  const updateBrandingMutation = useMutation({
    mutationFn: async (data: BrandingValues) => {
      const res = await apiRequest("PATCH", "/api/branding", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branding"] });
      toast({
        title: "Branding updated",
        description: "Your branding settings have been updated successfully.",
      });
      if (activeTab === "branding") {
        setActiveTab("social-media");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update social media mutation
  const updateSocialMediaMutation = useMutation({
    mutationFn: async (data: SocialMediaValues) => {
      const res = await apiRequest("PATCH", "/api/user/social", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Social media updated",
        description: "Your social media links have been updated successfully.",
      });
      if (activeTab === "social-media") {
        setActiveTab("subscription");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update subscription tier mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (tier: string) => {
      const res = await apiRequest("PATCH", "/api/user/subscription", { tier });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Subscription updated",
        description: "Your subscription tier has been updated successfully.",
      });
      setSetupComplete(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload logo function
  async function uploadLogo(file: File) {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await axios.post("/api/branding/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      brandingForm.setValue("logoUrl", res.data.logoUrl);
      toast({
        title: "Logo uploaded",
        description: "Your business logo has been uploaded successfully.",
      });
      return res.data.logoUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your logo.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingLogo(false);
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleUploadLogo() {
    if (!logoFile) return;
    await uploadLogo(logoFile);
  }

  function handleCurrencyChange(value: string) {
    const currency = currencies.find(c => c.code === value);
    if (currency) {
      brandingForm.setValue("currency", currency.code);
      brandingForm.setValue("currencySymbol", currency.symbol);
    }
  }

  function handleSubscriptionSelect(tier: SubscriptionTier) {
    setSelectedTier(tier);
  }

  function handleSubscriptionConfirm() {
    updateSubscriptionMutation.mutate(selectedTier);
  }

  // Form submission handlers
  async function onBasicInfoSubmit(data: BasicInfoValues) {
    updateProfileMutation.mutate(data);
  }

  async function onBrandingSubmit(data: BrandingValues) {
    updateBrandingMutation.mutate(data);
  }

  async function onSocialMediaSubmit(data: SocialMediaValues) {
    updateSocialMediaMutation.mutate(data);
  }

  if (profileLoading || brandingLoading) {
    return (
      <div className="flex items-centre justify-centre min-h-[500px]">
        <LoadingState size="lg" />
      </div>
    );
  }

  if (setupComplete) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-8">
        <div className="text-centre space-y-4">
          <div className="inline-flex items-centre justify-centre w-12 h-12 rounded-full bg-primary/10 text-primary">
            <Settings className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold">Setup Complete!</h1>
          <p className="text-muted-foreground">
            Your business profile has been successfully configured.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-centre gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business Name</span>
                  <span className="font-medium">{basicInfoForm.getValues("businessName")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{basicInfoForm.getValues("email")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subscription</span>
                  <span className="font-medium capitalize">{selectedTier}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-centre gap-2">
                <Palette className="h-5 w-5" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-centre">
                  <span className="text-muted-foreground">Primary Color</span>
                  <div 
                    className="w-6 h-6 rounded-full border" 
                    style={{ backgroundColor: brandingForm.getValues("primaryColor") }}
                  ></div>
                </div>
                <div className="flex justify-between items-centre">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-medium">{brandingForm.getValues("currencySymbol")} ({brandingForm.getValues("currency")})</span>
                </div>
                {logoPreview && (
                  <div className="flex justify-between items-centre">
                    <span className="text-muted-foreground">Logo</span>
                    <img src={logoPreview} alt="Logo" className="h-8" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-centre">
          <Button onClick={() => window.location.href = "/dashboard"}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Business Profile Setup</h1>
        <p className="text-muted-foreground">
          Complete your business profile to personalize your platform experience
        </p>
      </div>

      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Please complete all sections of your business profile to ensure full functionality.
          All information will be used to personalize your experience.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="basic-info" className="flex gap-2 items-centre">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Business Info</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex gap-2 items-centre">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="social-media" className="flex gap-2 items-centre">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Social Media</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex gap-2 items-centre">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="basic-info">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Provide details about your business and personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...basicInfoForm}>
                <form onSubmit={basicInfoForm.handleSubmit(onBasicInfoSubmit)} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={basicInfoForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. Pete's Fitness" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={basicInfoForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. Pete Ryan" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={basicInfoForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="e.g. pete@example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={basicInfoForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. +1 123 456 7890" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={basicInfoForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter your business address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicInfoForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. https://petefitness.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicInfoForm.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About Your Business</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Tell us about your fitness business, specialties, and mission"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="min-w-[150px]"
                    >
                      {updateProfileMutation.isPending ? (
                        <LoadingState variant="pulse" size="sm" className="mr-2" />
                      ) : null}
                      Save & Continue
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Appearance</CardTitle>
              <CardDescription>
                Customize your platform's appearance and branding elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...brandingForm}>
                <form onSubmit={brandingForm.handleSubmit(onBrandingSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <FormField
                        control={brandingForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} type="colour" className="w-12 h-10 p-1" />
                              </FormControl>
                              <Input 
                                value={field.value} 
                                onChange={(e) => field.onChange(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                            <FormDescription>
                              Main brand colour used throughout the app
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormField
                        control={brandingForm.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} type="colour" className="w-12 h-10 p-1" />
                              </FormControl>
                              <Input 
                                value={field.value} 
                                onChange={(e) => field.onChange(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                            <FormDescription>
                              Accent colour for highlights and secondary elements
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <FormField
                      control={brandingForm.control}
                      name="fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Font Family</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a font family" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Inter">Inter (Default)</SelectItem>
                              <SelectItem value="Roboto">Roboto</SelectItem>
                              <SelectItem value="Open Sans">Open Sans</SelectItem>
                              <SelectItem value="Montserrat">Montserrat</SelectItem>
                              <SelectItem value="Poppins">Poppins</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={brandingForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select 
                            onValueChange={(value) => handleCurrencyChange(value)} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency.code} value={currency.code}>
                                  {currency.symbol} {currency.name} ({currency.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Currency used for payments and pricing
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={brandingForm.control}
                      name="currencySymbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency Symbol</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            Symbol is automatically set based on selected currency
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormLabel>Business Logo</FormLabel>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 flex items-centre justify-centre border rounded-md overflow-hidden bg-muted">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : brandingForm.getValues("logoUrl") ? (
                            <img
                              src={brandingForm.getValues("logoUrl")}
                              alt="Logo"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Building className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label
                            htmlFor="logo-upload"
                            className="cursor-pointer inline-flex items-centre gap-2 text-sm px-4 py-2 border rounded-md hover:bg-muted"
                          >
                            <Upload className="h-4 w-4" />
                            Choose Logo File
                          </Label>
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoChange}
                          />
                          <FormDescription>
                            Recommended size: 400x400px, max 2MB
                          </FormDescription>
                        </div>
                      </div>
                      {logoFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleUploadLogo}
                          disabled={uploadingLogo}
                        >
                          {uploadingLogo ? (
                            <LoadingState variant="pulse" size="sm" className="mr-2" />
                          ) : (
                            <File className="h-4 w-4 mr-2" />
                          )}
                          Upload Logo
                        </Button>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={brandingForm.control}
                    name="welcomeMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Welcome Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Welcome message for clients when they first login"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed to clients when they first login to your portal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("basic-info")}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateBrandingMutation.isPending}
                      className="min-w-[150px]"
                    >
                      {updateBrandingMutation.isPending ? (
                        <LoadingState variant="pulse" size="sm" className="mr-2" />
                      ) : null}
                      Save & Continue
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social-media">
          <Card>
            <CardHeader>
              <CardTitle>Social Media & Web Presence</CardTitle>
              <CardDescription>
                Connect your social media accounts and online presence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...socialMediaForm}>
                <form onSubmit={socialMediaForm.handleSubmit(onSocialMediaSubmit)} className="space-y-6">
                  <FormField
                    control={socialMediaForm.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <div className="flex">
                          <div className="bg-muted flex items-centre px-3 rounded-l-md border border-r-0 border-input">
                            instagram.com/
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              className="rounded-l-none"
                              placeholder="yourusername"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialMediaForm.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <div className="flex">
                          <div className="bg-muted flex items-centre px-3 rounded-l-md border border-r-0 border-input">
                            facebook.com/
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              className="rounded-l-none"
                              placeholder="yourpage"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialMediaForm.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <div className="flex">
                          <div className="bg-muted flex items-centre px-3 rounded-l-md border border-r-0 border-input">
                            twitter.com/
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              className="rounded-l-none"
                              placeholder="yourusername"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialMediaForm.control}
                    name="youtube"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube</FormLabel>
                        <div className="flex">
                          <div className="bg-muted flex items-centre px-3 rounded-l-md border border-r-0 border-input">
                            youtube.com/c/
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              className="rounded-l-none"
                              placeholder="yourchannel"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialMediaForm.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <div className="flex">
                          <div className="bg-muted flex items-centre px-3 rounded-l-md border border-r-0 border-input">
                            linkedin.com/in/
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              className="rounded-l-none"
                              placeholder="yourprofile"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("branding")}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateSocialMediaMutation.isPending}
                      className="min-w-[150px]"
                    >
                      {updateSocialMediaMutation.isPending ? (
                        <LoadingState variant="pulse" size="sm" className="mr-2" />
                      ) : null}
                      Save & Continue
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription */}
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Subscription</CardTitle>
              <CardDescription>
                Select a subscription tier that best fits your business needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {subscriptionTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`relative rounded-lg border p-4 transition-all ${
                      selectedTier === tier.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleSubscriptionSelect(tier.id as SubscriptionTier)}
                  >
                    <div className="flex items-centre justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{tier.name}</h3>
                        <p className="text-muted-foreground">
                          {tier.id === "free"
                            ? "Basic features for getting started"
                            : tier.id === "starter"
                            ? "Essential tools for new fitness professionals"
                            : tier.id === "professional"
                            ? "Advanced features for growing your business"
                            : tier.id === "business"
                            ? "Complete solution for established trainers"
                            : "Custom solutions for large fitness businesses"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {brandingForm.getValues("currencySymbol")}{tier.price}
                          {tier.id !== "free" && <span className="text-sm font-normal">/mo</span>}
                        </p>
                      </div>
                    </div>
                    <div className="absolute right-4 top-4">
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          selectedTier === tier.id
                            ? "border-primary bg-primary"
                            : "border-muted"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold mb-2">Features Included</h4>
                  <div className="grid gap-2 text-sm">
                    {selectedTier === "free" ? (
                      <>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Up to 5 clients</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Basic workout templates</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Client messaging</span>
                        </div>
                      </>
                    ) : selectedTier === "starter" ? (
                      <>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Up to 15 clients</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Advanced workout templates</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Client progress tracking</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Basic AI content generation (10/month)</span>
                        </div>
                      </>
                    ) : selectedTier === "professional" ? (
                      <>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Up to 50 clients</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>AI workout personalization</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Advanced analytics & reporting</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>AI content generation with images (50/month)</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>White labeling</span>
                        </div>
                      </>
                    ) : selectedTier === "business" ? (
                      <>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Unlimited clients</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Multiple trainers (up to 5)</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Advanced business analytics</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Unlimited AI content generation with images</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Custom domain & branding</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>All Business tier features</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Unlimited trainers</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Custom feature development</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Dedicated support manager</span>
                        </div>
                        <div className="flex items-centre gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>API access</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("social-media")}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubscriptionConfirm}
                  disabled={updateSubscriptionMutation.isPending}
                  className="min-w-[150px]"
                >
                  {updateSubscriptionMutation.isPending ? (
                    <LoadingState variant="pulse" size="sm" className="mr-2" />
                  ) : null}
                  Confirm Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper icon component for subscription features
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}