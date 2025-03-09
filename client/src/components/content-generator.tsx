import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-states";
import { apiRequest } from "@/lib/queryClient";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Twitter, Facebook, Copy, Sparkles } from "lucide-react";

const platforms = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "twitter", label: "Twitter", icon: Twitter },
  { id: "facebook", label: "Facebook", icon: Facebook },
];

const tones = [
  { id: "professional", label: "Professional" },
  { id: "motivational", label: "Motivational" },
  { id: "educational", label: "Educational" },
];

export default function ContentGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("professional");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");

  const generateMutation = useMutation({
    mutationFn: async (data: {
      type: string;
      tone: string;
      topic: string;
      keywords: string[];
      businessName?: string;
    }) => {
      const res = await apiRequest("POST", "/api/social/generate", data);
      return res.json();
    },
    onSuccess: (data: { content: string }) => {
      setGeneratedContent(data.content);
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

  const handleGenerate = () => {
    if (!topic) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your content",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      type: platform,
      tone,
      topic,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      businessName: user?.businessName,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-centre gap-2">
            <Sparkles className="h-5 w-5" />
            Social Media Content Generator
          </CardTitle>
          <CardDescription>
            Generate professional fitness content for your social media
            platforms
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
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full"
          >
            {generateMutation.isPending ? (
              <LoadingState variant="pulse" size="sm" className="mr-2" />
            ) : null}
            Generate Content
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
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
                onClick={copyToClipboard}
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
      )}
    </div>
  );
}
