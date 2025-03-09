import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-states";
import { apiRequest } from "@/lib/queryClient";
import axios from "axios";
import { Link } from "wouter";
import { useBranding } from "@/hooks/use-branding";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Copy, 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  Settings, 
  Download 
} from "lucide-react";

const platforms = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "twitter", label: "Twitter", icon: Twitter },
  { id: "facebook", label: "Facebook", icon: Facebook },
];

const tones = [
  { id: "professional", label: "Professional" },
  { id: "motivational", label: "Motivational" },
  { id: "educational", label: "Educational" },
  { id: "conversational", label: "Conversational" },
  { id: "humorous", label: "Humorous" },
];

export default function EnhancedContentGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { branding } = useBranding();
  const [activeTab, setActiveTab] = useState("text-generator");
  // Using user's fullName or businessName from profile if available
  const businessName = user?.fullName || "My Fitness Business";
  
  // Text generator state
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("professional");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  
  // Image generator state
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Image-to-text state
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState("");
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [generatedPostFromImage, setGeneratedPostFromImage] = useState("");

  // Generate text content mutation
  const generateTextMutation = useMutation({
    mutationFn: async (data: {
      type: string;
      tone: string;
      topic: string;
      keywords: string[];
      businessName?: string;
      includeImage?: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/social/generate", data);
      return res.json();
    },
    onSuccess: (data: { content: string; imageUrl?: string }) => {
      setGeneratedContent(data.content);
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      }
      toast({
        title: "Content Generated",
        description: "Your social media content is ready!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      setIsGeneratingImage(true);
      try {
        const res = await apiRequest("POST", "/api/image/generate", { prompt });
        return res.json();
      } finally {
        setIsGeneratingImage(false);
      }
    },
    onSuccess: (data: { imageUrl: string }) => {
      setGeneratedImageUrl(data.imageUrl);
      toast({
        title: "Image Generated",
        description: "Your AI image is ready!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Image Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Analyze image mutation
  const analyseImageMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsAnalyzingImage(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await axios.post("/api/image/analyse", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
      } finally {
        setIsAnalyzingImage(false);
      }
    },
    onSuccess: (data: { description: string }) => {
      setImageDescription(data.description);
      toast({
        title: "Image Analyzed",
        description: "Your image has been analysed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyse the image.",
        variant: "destructive",
      });
    },
  });

  // Generate post from image
  const generateFromImageMutation = useMutation({
    mutationFn: async (data: {
      description: string;
      platform: string;
      tone: string;
      businessName?: string;
    }) => {
      const res = await apiRequest("POST", "/api/social/generate-from-image", data);
      return res.json();
    },
    onSuccess: (data: { content: string }) => {
      setGeneratedPostFromImage(data.content);
      toast({
        title: "Content Generated",
        description: "Your post based on the image is ready!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler for text generation
  const handleGenerateText = () => {
    if (!topic) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your content",
        variant: "destructive",
      });
      return;
    }

    generateTextMutation.mutate({
      type: platform,
      tone,
      topic,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      businessName: businessName,
      includeImage: true,
    });
  };

  // Handler for image generation
  const handleGenerateImage = () => {
    if (!imagePrompt) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for the image",
        variant: "destructive",
      });
      return;
    }

    generateImageMutation.mutate(imagePrompt);
  };

  // Handler for image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handler for image analysis
  const handleAnalyzeImage = () => {
    if (!uploadedImage) {
      toast({
        title: "Image Required",
        description: "Please upload an image to analyse",
        variant: "destructive",
      });
      return;
    }

    analyseImageMutation.mutate(uploadedImage);
  };

  // Handler for generating post from image
  const handleGenerateFromImage = () => {
    if (!imageDescription) {
      toast({
        title: "Analysis Required",
        description: "Please analyse the image first",
        variant: "destructive",
      });
      return;
    }

    generateFromImageMutation.mutate({
      description: imageDescription,
      platform,
      tone,
      businessName: businessName,
    });
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  // Download image function
  const downloadImage = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render the navbar
  const renderNavbar = () => (
    <div className="flex items-centre justify-between mb-6">
      <div className="flex items-centre gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Content Creation Studio</h1>
      </div>
      <div className="flex gap-2">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            Dashboard
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );

  // Main component render
  return (
    <div className="container mx-auto p-4 space-y-6">
      {renderNavbar()}

      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <Button
                  variant={activeTab === "text-generator" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("text-generator")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Text Generator
                </Button>
                <Button
                  variant={activeTab === "image-generator" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("image-generator")}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image Generator
                </Button>
                <Button
                  variant={activeTab === "image-to-text" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("image-to-text")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Image to Text
                </Button>
                <Button
                  variant={activeTab === "content-calendar" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("content-calendar")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Content Calendar
                </Button>
              </nav>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Usage This Month</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Text Generation</span>
                  <span className="font-medium">24/50</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "48%" }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Image Generation</span>
                  <span className="font-medium">7/30</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "23%" }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Image Analysis</span>
                  <span className="font-medium">3/20</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "15%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="col-span-12 md:col-span-9 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Text Generator */}
            <TabsContent value="text-generator" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-centre gap-2">
                    <Sparkles className="h-5 w-5" />
                    Social Media Content Generator
                  </CardTitle>
                  <CardDescription>
                    Generate professional fitness content for your social media platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-medium">Platform</label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              <div className="flex items-centre gap-2">
                                <p.icon className="h-4 w-4" />
                                {p.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-medium">Tone</label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {tones.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium">Topic</label>
                    <Input
                      placeholder="e.g., Benefits of morning workouts"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium">Keywords (optional)</label>
                    <Input
                      placeholder="fitness, health, motivation (comma-separated)"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleGenerateText}
                    disabled={generateTextMutation.isPending}
                    className="w-full"
                  >
                    {generateTextMutation.isPending ? (
                      <LoadingState variant="pulse" size="sm" className="mr-2" />
                    ) : null}
                    Generate Content with Image
                  </Button>
                </CardContent>
              </Card>

              {generatedContent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Textarea
                          value={generatedContent}
                          readOnly
                          className="min-h-[200px] resize-none"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(generatedContent)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                      Content optimised for{" "}
                      {platforms.find((p) => p.id === platform)?.label}
                    </CardFooter>
                  </Card>

                  {generatedImageUrl && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Generated Image</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 flex items-centre justify-centre">
                        <div className="relative">
                          <img
                            src={generatedImageUrl}
                            alt="Generated content"
                            className="max-w-full rounded-md"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => downloadImage(generatedImageUrl)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Image Generator */}
            <TabsContent value="image-generator" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-centre gap-2">
                    <ImageIcon className="h-5 w-5" />
                    AI Image Generator
                  </CardTitle>
                  <CardDescription>
                    Create custom images for your fitness content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-medium">Image Description</label>
                    <Textarea
                      placeholder="Describe the image you want to generate (e.g., A fitness trainer helping a client with proper form during a squat exercise in a modern gym)"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="w-full"
                  >
                    {isGeneratingImage ? (
                      <LoadingState variant="pulse" size="sm" className="mr-2" />
                    ) : null}
                    Generate Image
                  </Button>
                </CardContent>
              </Card>

              {generatedImageUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Image</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-centre justify-centre p-4">
                    <div className="relative">
                      <img
                        src={generatedImageUrl}
                        alt="AI generated image"
                        className="max-w-full rounded-md"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => downloadImage(generatedImageUrl)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      AI-generated based on your prompt
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTab("text-generator");
                        setGeneratedImageUrl(generatedImageUrl);
                      }}
                    >
                      Use with Text Generator
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            {/* Image to Text */}
            <TabsContent value="image-to-text" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-centre gap-2">
                    <Upload className="h-5 w-5" />
                    Generate Content from Image
                  </CardTitle>
                  <CardDescription>
                    Upload an image and generate social media content based on it
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Upload Image</Label>
                      <div className="flex flex-col gap-4">
                        <div
                          className="border-2 border-dashed rounded-md p-4 text-centre hover:bg-muted/50 transition-colours cursor-pointer"
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </div>

                        {uploadedImagePreview && (
                          <div className="relative">
                            <img
                              src={uploadedImagePreview}
                              alt="Uploaded image"
                              className="max-w-full h-auto rounded-md border"
                            />
                          </div>
                        )}

                        {uploadedImage && (
                          <Button
                            onClick={handleAnalyzeImage}
                            disabled={isAnalyzingImage}
                          >
                            {isAnalyzingImage ? (
                              <LoadingState variant="pulse" size="sm" className="mr-2" />
                            ) : null}
                            Analyze Image
                          </Button>
                        )}
                      </div>
                    </div>

                    {imageDescription && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Image Analysis</Label>
                          <Textarea
                            value={imageDescription}
                            readOnly
                            className="min-h-[120px] resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Platform</Label>
                            <Select value={platform} onValueChange={setPlatform}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                              <SelectContent>
                                {platforms.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    <div className="flex items-centre gap-2">
                                      <p.icon className="h-4 w-4" />
                                      {p.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Tone</Label>
                            <Select value={tone} onValueChange={setTone}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tone" />
                              </SelectTrigger>
                              <SelectContent>
                                {tones.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button
                          onClick={handleGenerateFromImage}
                          disabled={generateFromImageMutation.isPending}
                        >
                          {generateFromImageMutation.isPending ? (
                            <LoadingState variant="pulse" size="sm" className="mr-2" />
                          ) : null}
                          Generate Post from Image
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {generatedPostFromImage && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Post</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Textarea
                        value={generatedPostFromImage}
                        readOnly
                        className="min-h-[200px] resize-none"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generatedPostFromImage)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    Content generated from your image for{" "}
                    {platforms.find((p) => p.id === platform)?.label}
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            {/* Content Calendar */}
            <TabsContent value="content-calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-centre gap-2">
                    <Calendar className="h-5 w-5" />
                    Content Calendar
                  </CardTitle>
                  <CardDescription>
                    Schedule and manage your social media content
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[400px] flex items-centre justify-centre">
                  <div className="text-centre space-y-4">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium">Content Calendar</h3>
                    <p className="text-muted-foreground max-w-md">
                      Plan and schedule your social media posts in advance. Feature coming soon in the next update!
                    </p>
                    <Button variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}