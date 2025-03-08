import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AnimatedCard, CollapsibleSection } from '@/components/ui/animated-elements';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingState } from '@/components/ui/loading-states';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AnalysisResult {
  movement: string;
  keyPoints: string[];
  commonErrors: string[];
  feedback: string[];
  correctionPoints: { issue: string; correction: string }[];
  score: number;
  referenceImageUrl: string;
  comparisonImageUrl: string;
  demo?: boolean;
}

export default function MovementAnalysis() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      
      // Preview the video
      if (videoPreviewRef.current) {
        videoPreviewRef.current.src = URL.createObjectURL(file);
      }
    }
  };

  const startRecording = async () => {
    try {
      setRecording(true);
      
      // In a production app, we would use the MediaRecorder API here
      toast({
        title: "Recording started",
        description: "Recording your movement..."
      });
      
      // Simulate recording for demo purposes
      setTimeout(() => {
        stopRecording();
      }, 3000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecording(false);
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: "Could not access camera"
      });
    }
  };

  const stopRecording = () => {
    setRecording(false);
    toast({
      title: "Recording complete",
      description: "Ready to analyze your movement"
    });
    
    // In a real app, we would save the recording as a file
    // For demo, let's simulate a successful recording
    // by enabling the analyze button
  };

  const uploadAndAnalyze = async () => {
    if (!videoFile) {
      // If no file is selected, run the demo
      runDemoAnalysis();
      return;
    }
    
    try {
      setUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('video', videoFile);
      
      // Upload the video
      const uploadResponse = await axios.post('/api/movement-analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploading(false);
      setAnalyzing(true);
      
      // Set the analysis result
      setAnalysisResult(uploadResponse.data);
      setAnalyzing(false);
      setShowResults(true);
    } catch (error) {
      console.error('Error uploading and analyzing:', error);
      setUploading(false);
      setAnalyzing(false);
      
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Could not analyze your movement video"
      });
    }
  };

  const runDemoAnalysis = async () => {
    try {
      setAnalyzing(true);
      
      // Run the demo analysis
      const demoResponse = await axios.get('/api/movement-analysis/demo');
      
      // Set the analysis result
      setAnalysisResult(demoResponse.data);
      setAnalyzing(false);
      setShowResults(true);
    } catch (error) {
      console.error('Error running demo:', error);
      setAnalyzing(false);
      
      toast({
        variant: "destructive",
        title: "Demo failed",
        description: "Could not run the demo analysis"
      });
    }
  };

  const resetAnalysis = () => {
    setVideoFile(null);
    setShowResults(false);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.src = '';
    }
  };

  const renderAnalysisResults = () => {
    if (!analysisResult) return null;
    
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatedCard className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="mr-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Ideal Form Reference
              </CardTitle>
              <CardDescription>Blueprint-style technical visualization</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-0">
              <img 
                src={analysisResult.referenceImageUrl} 
                alt="Ideal form reference" 
                className="w-full object-cover max-h-80"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400/0088cc/white?text=Reference+Image';
                }}
              />
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="mr-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Form Comparison
              </CardTitle>
              <CardDescription>Your form compared to ideal form</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-0">
              <img 
                src={analysisResult.comparisonImageUrl} 
                alt="Form comparison" 
                className="w-full object-cover max-h-80"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400/0088cc/white?text=Comparison+Image';
                }}
              />
            </CardContent>
          </AnimatedCard>
        </div>
        
        <AnimatedCard>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <svg className="mr-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {analysisResult.movement} Analysis
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="font-medium">Form Score:</div>
              <div className="flex items-center space-x-2 flex-1">
                <Progress value={analysisResult.score * 10} className="h-2" />
                <span className="font-bold">{analysisResult.score.toFixed(1)}/10</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CollapsibleSection 
              title="Key Technique Points" 
              defaultOpen={true}
              className="border rounded-lg p-4"
            >
              <ul className="space-y-2 pl-5 list-disc">
                {analysisResult.keyPoints.map((point, i) => (
                  <li key={i} className="text-sm">{point}</li>
                ))}
              </ul>
            </CollapsibleSection>
            
            <CollapsibleSection 
              title="Your Feedback" 
              defaultOpen={true}
              className="border rounded-lg p-4"
            >
              <ul className="space-y-2 pl-5 list-disc">
                {analysisResult.feedback.map((item, i) => (
                  <li key={i} className="text-sm">{item}</li>
                ))}
              </ul>
            </CollapsibleSection>
            
            <CollapsibleSection 
              title="Correction Points" 
              defaultOpen={true}
              className="border rounded-lg p-4"
            >
              <div className="space-y-3">
                {analysisResult.correctionPoints.map((item, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">{item.issue}:</div>
                    <div>{item.correction}</div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection 
              title="Common Errors" 
              defaultOpen={false}
              className="border rounded-lg p-4"
            >
              <ul className="space-y-2 pl-5 list-disc">
                {analysisResult.commonErrors.map((error, i) => (
                  <li key={i} className="text-sm">{error}</li>
                ))}
              </ul>
            </CollapsibleSection>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={resetAnalysis}>
              New Analysis
            </Button>
          </CardFooter>
        </AnimatedCard>
        
        {analysisResult.demo && (
          <div className="bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
            <strong>Note:</strong> This is a demonstration using sample data. Upload a real video for personalized analysis.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Movement Analysis</h1>
        <p className="text-muted-foreground">
          Upload a video of your exercise form for AI-powered analysis and feedback
        </p>
      </div>
      
      {!showResults ? (
        <AnimatedCard>
          <CardHeader>
            <CardTitle>Upload or Record Your Movement</CardTitle>
            <CardDescription>
              For best results, ensure good lighting and a clear view of your full body
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="video/mp4,video/mov,video/avi"
                    onChange={handleFileChange}
                  />
                  <svg className="mx-auto h-12 w-12 text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium">
                    {videoFile ? videoFile.name : 'Click to upload video'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4, MOV or AVI formats (max 30MB)
                  </p>
                </div>
                
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">or</span>
                </div>
                
                <Button 
                  onClick={startRecording} 
                  className="w-full"
                  disabled={recording}
                  variant="outline"
                >
                  {recording ? (
                    <>
                      <span className="animate-pulse mr-2">●</span> Recording...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Record Video
                    </>
                  )}
                </Button>
              </div>
              
              <div className="relative border rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center min-h-[200px]">
                {videoFile ? (
                  <video 
                    ref={videoPreviewRef}
                    className="w-full h-full" 
                    controls
                  />
                ) : (
                  <div className="text-center p-4">
                    <svg className="mx-auto h-12 w-12 text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-muted-foreground">
                      Video preview will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button 
              variant="outline"
              onClick={runDemoAnalysis}
              disabled={uploading || analyzing}
            >
              Run Demo Analysis
            </Button>
            <Button 
              onClick={uploadAndAnalyze}
              disabled={uploading || analyzing}
            >
              {(uploading || analyzing) ? (
                <LoadingState variant="plate" size="sm" className="mr-2" />
              ) : null}
              Analyze Movement
            </Button>
          </CardFooter>
        </AnimatedCard>
      ) : (
        renderAnalysisResults()
      )}
      
      {/* Loading Dialog */}
      <AlertDialog open={uploading || analyzing}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {uploading ? 'Uploading Video...' : 'Analyzing Movement...'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="flex justify-center">
                <LoadingState variant={analyzing ? "dumbbell" : "pulse"} size="lg" />
              </div>
              <div className="text-center space-y-2">
                <p>
                  {uploading 
                    ? 'Uploading your video... Please wait.' 
                    : 'Our AI is analyzing your movement pattern and generating feedback...'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {uploading 
                    ? 'This may take a moment depending on your connection speed.' 
                    : "We're creating a personalized blueprint analysis of your form."}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}