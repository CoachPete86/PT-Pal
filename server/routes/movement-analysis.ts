import { Request, Response } from "express";
import { storage } from "../storage";
import { openai } from "../openai";
import multer from "multer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

// Set up temporary storage for video uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Helper function to identify movement type from video
async function identifyMovement(videoPath: string): Promise<{
  movementType: string;
  confidence: number;
  description: string;
}> {
  // In a real implementation, this would use computer vision APIs
  // For now, we'll simulate with OpenAI
  try {
    // For demo purposes, return a hardcoded movement type
    // In production, this would analyze frames from the video
    return {
      movementType: "Squat",
      confidence: 0.92,
      description: "Barbell back squat with moderate weight",
    };
  } catch (error) {
    console.error("Error identifying movement:", error);
    throw new Error("Failed to identify movement");
  }
}

// Generate blueprint-style reference image for the identified movement
async function generateReferenceImage(
  movementType: string
): Promise<string> {
  try {
    const prompt = `Create a blueprint-style technical drawing of a person performing a perfect ${movementType} exercise. Show transparent blue outlines of the human figure with precise lines indicating proper form. Include dotted lines showing the movement path, with focus on correct angles at key joints. Mark proper alignment points and include angle measurements at crucial joints. Use a dark blue background with light blue/white lines typical of architectural blueprints. Make it look like a technical exercise diagram that a fitness professional would use.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    // Return the URL of the generated image
    return response.data[0].url;
  } catch (error) {
    console.error("Error generating reference image:", error);
    throw new Error("Failed to generate reference image");
  }
}

// Generate image showing user's form with issues highlighted
async function generateUserFormAnalysis(
  movementType: string,
  issues: string[]
): Promise<string> {
  try {
    const issuesText = issues.join(", ");
    const prompt = `Create a blueprint-style technical drawing of a person performing a ${movementType} exercise with the following form issues: ${issuesText}. Show transparent blue outlines of the human figure with precise lines indicating the incorrect form. Use red highlights or indicators to point out the problematic areas. Include dotted lines showing the incorrect movement path, with focus on improper angles at key joints. Mark alignment issues and include actual angle measurements at crucial joints. Use a dark blue background with light blue/white lines typical of architectural blueprints with red highlights for errors. Make it look like a technical exercise diagram that a fitness professional would use to highlight form issues.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    // Return the URL of the generated image
    return response.data[0].url;
  } catch (error) {
    console.error("Error generating user form analysis:", error);
    throw new Error("Failed to generate user form analysis");
  }
}

// Generate comparison image showing correct vs incorrect form
async function generateComparisonImage(
  movementType: string,
  issues: string[]
): Promise<string> {
  try {
    const issuesText = issues.join(", ");
    const prompt = `Create a side-by-side blueprint-style technical drawing comparing correct vs incorrect form for a ${movementType} exercise. On the left, show perfect form with proper angles and alignment. On the right, show the same exercise with these issues: ${issuesText}. Use transparent blue outlines for both figures, with red highlights on the problem areas in the incorrect version. Include angle measurements at key joints for both, showing the difference. Use a dark blue background with light blue/white lines typical of architectural blueprints. Make it a professional, technical comparison that clearly illustrates the form differences.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    // Return the URL of the generated image
    return response.data[0].url;
  } catch (error) {
    console.error("Error generating comparison image:", error);
    throw new Error("Failed to generate comparison image");
  }
}

// Analyze movement to identify form issues
async function analyzeMovement(
  videoPath: string,
  movementType: string
): Promise<{
  issues: string[];
  recommendations: string[];
  severity: "minor" | "moderate" | "major";
  overallScore: number;
}> {
  // In a real implementation, this would use computer vision APIs to analyze form
  // For now, we'll simulate the analysis with predetermined issues
  
  // Simulated form issues based on movement type
  const formIssues: Record<string, string[]> = {
    "Squat": [
      "Knees caving inward during descent",
      "Insufficient depth - not reaching parallel",
      "Excessive forward lean",
      "Heels coming off the ground"
    ],
    "Deadlift": [
      "Rounded lower back",
      "Shoulders behind the bar at start",
      "Hips rising too quickly",
      "Bar path not vertical"
    ],
    "Bench Press": [
      "Elbows flaring too wide",
      "Uneven bar path",
      "Shoulders not retracted",
      "Feet not planted firmly"
    ]
  };

  // Get issues for the identified movement or use generic issues
  const issues = formIssues[movementType] || [
    "Improper joint alignment",
    "Uneven weight distribution",
    "Momentum-based movement instead of controlled motion"
  ];

  // Randomly select 1-3 issues to report
  const numIssues = Math.floor(Math.random() * 2) + 1; // 1-2 issues
  const selectedIssues = issues
    .sort(() => 0.5 - Math.random())
    .slice(0, numIssues);

  // Generate recommendations based on selected issues
  const recommendations = selectedIssues.map(issue => {
    switch (issue) {
      case "Knees caving inward during descent":
        return "Focus on pushing knees outward during descent. Try using a resistance band around knees during warm-up sets.";
      case "Insufficient depth - not reaching parallel":
        return "Work on mobility in ankles and hips. Practice with lighter weight to achieve proper depth.";
      case "Excessive forward lean":
        return "Strengthen core and focus on maintaining an upright torso. Consider front squats to reinforce proper positioning.";
      case "Heels coming off the ground":
        return "Work on ankle mobility or try squatting with small plates under heels until flexibility improves.";
      case "Rounded lower back":
        return "Focus on maintaining neutral spine. Practice hip hinge pattern with Romanian deadlifts.";
      case "Shoulders behind the bar at start":
        return "Position shoulders directly over or slightly ahead of bar before initiating pull.";
      case "Hips rising too quickly":
        return "Keep chest up and focus on pushing the floor away rather than pulling with back.";
      case "Bar path not vertical":
        return "Practice keeping the bar close to shins and thighs throughout the movement.";
      case "Elbows flaring too wide":
        return "Keep elbows at about 45° from torso to protect shoulders. Focus on tucking elbows during descent.";
      case "Uneven bar path":
        return "Practice with lighter weight focusing on controlled, even movement. Consider video recording sets regularly.";
      case "Shoulders not retracted":
        return "Pinch shoulder blades together before unracking and maintain this position throughout the movement.";
      case "Feet not planted firmly":
        return "Establish stable foot position with feet flat on floor and create tension by driving feet into ground.";
      default:
        return "Focus on proper form with lighter weights before increasing load. Consider working with a trainer on technique.";
    }
  });

  // Calculate overall score (out of 100)
  const overallScore = 100 - (selectedIssues.length * 15); 

  // Determine severity based on issues
  let severity: "minor" | "moderate" | "major";
  if (selectedIssues.length === 1) {
    severity = "minor";
  } else if (selectedIssues.length === 2) {
    severity = "moderate";
  } else {
    severity = "major";
  }

  return {
    issues: selectedIssues,
    recommendations,
    severity,
    overallScore
  };
}

// Main endpoint to handle movement analysis
export async function uploadAndAnalyzeMovement(
  req: Request,
  res: Response
) {
  try {
    const uploadSingle = upload.single("video");

    uploadSingle(req, res, async (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(400).json({ error: "Error uploading video" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No video file uploaded" });
      }

      try {
        const videoPath = req.file.path;
        
        // Identify the movement being performed
        const movementIdentification = await identifyMovement(videoPath);
        const { movementType } = movementIdentification;
        
        // Analyze the movement for form issues
        const analysisResults = await analyzeMovement(videoPath, movementType);
        
        // Generate blueprint-style reference image
        const referenceImageUrl = await generateReferenceImage(movementType);
        
        // Generate blueprint showing user's form with issues
        const userFormImageUrl = await generateUserFormAnalysis(
          movementType,
          analysisResults.issues
        );
        
        // Generate side-by-side comparison
        const comparisonImageUrl = await generateComparisonImage(
          movementType,
          analysisResults.issues
        );
        
        // Clean up the temporary video file
        fs.unlink(videoPath, (err) => {
          if (err) console.error("Error removing temp file:", err);
        });
        
        // Return the analysis results and image URLs
        res.status(200).json({
          movementIdentification,
          analysis: analysisResults,
          images: {
            referenceImage: referenceImageUrl,
            userFormImage: userFormImageUrl,
            comparisonImage: comparisonImageUrl
          }
        });
      } catch (error) {
        console.error("Error during analysis:", error);
        // Clean up temp file if it exists
        if (req.file?.path) {
          fs.unlink(req.file.path, () => {});
        }
        res.status(500).json({ error: "Movement analysis failed" });
      }
    });
  } catch (error) {
    console.error("Error in movement analysis endpoint:", error);
    res.status(500).json({ error: "Server error during movement analysis" });
  }
}

// Endpoint to analyze a pre-recorded demo video (for testing without uploads)
export async function analyzeDemo(req: Request, res: Response) {
  try {
    // Movement type is hardcoded for demo purposes
    const movementType = req.query.movement as string || "Squat";
    
    // Analyze the movement for form issues
    const analysisResults = await analyzeMovement("demo", movementType);
    
    // Generate blueprint-style reference image
    const referenceImageUrl = await generateReferenceImage(movementType);
    
    // Generate blueprint showing user's form with issues
    const userFormImageUrl = await generateUserFormAnalysis(
      movementType,
      analysisResults.issues
    );
    
    // Generate side-by-side comparison
    const comparisonImageUrl = await generateComparisonImage(
      movementType,
      analysisResults.issues
    );
    
    // Return the analysis results and image URLs
    res.status(200).json({
      movementIdentification: {
        movementType,
        confidence: 0.95,
        description: `${movementType} with moderate weight`
      },
      analysis: analysisResults,
      images: {
        referenceImage: referenceImageUrl,
        userFormImage: userFormImageUrl,
        comparisonImage: comparisonImageUrl
      }
    });
  } catch (error) {
    console.error("Error during demo analysis:", error);
    res.status(500).json({ error: "Movement analysis demo failed" });
  }
}