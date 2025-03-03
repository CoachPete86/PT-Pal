import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { storage } from '../storage';

export async function exportWorkoutToPdf(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { workoutId } = req.params;
    
    // Fetch the workout plan from storage
    const workoutPlan = await storage.getWorkoutPlan(parseInt(workoutId));
    
    if (!workoutPlan) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }
    
    // Check if the user has permission to access this workout plan
    if (req.user.role !== 'admin' && 
        req.user.id !== workoutPlan.trainerId && 
        req.user.id !== workoutPlan.clientId) {
      return res.status(403).json({ error: 'You do not have permission to access this workout plan' });
    }

    // Create a PDF document
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    // Set the content type and filename for the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=workout-plan-${workoutId}.pdf`);
    
    // Pipe the PDF directly to the response
    doc.pipe(res);
    
    // Add the logo if available
    if (req.user.role === 'trainer') {
      const workspace = await storage.getWorkspaceByTrainerId(req.user.id);
      if (workspace?.logo) {
        try {
          doc.image(workspace.logo, 50, 45, { width: 100 });
          doc.moveDown(2);
        } catch (error) {
          console.log('Error adding logo to PDF:', error);
        }
      }
    }
    
    // Add the workout plan title
    doc.fontSize(22).font('Helvetica-Bold').text(workoutPlan.title, { align: 'center' });
    doc.moveDown(0.5);
    
    // Add the workout plan description if available
    if (workoutPlan.description) {
      doc.fontSize(12).font('Helvetica').text(workoutPlan.description, { align: 'center' });
      doc.moveDown(1);
    }
    
    // Add workout duration
    const startDate = new Date(workoutPlan.startDate).toLocaleDateString();
    const endDate = new Date(workoutPlan.endDate).toLocaleDateString();
    doc.fontSize(10).font('Helvetica').text(`Duration: ${startDate} to ${endDate}`, { align: 'center' });
    doc.moveDown(2);
    
    // Parse the content from the JSON structure
    const content = workoutPlan.content;
    
    // Add the introduction if available
    if (content.introduction) {
      doc.fontSize(16).font('Helvetica-Bold').text('Introduction', { underline: true });
      doc.moveDown(0.5);
      
      if (content.introduction.overview) {
        doc.fontSize(12).font('Helvetica-Bold').text('Overview:');
        doc.fontSize(10).font('Helvetica').text(content.introduction.overview);
        doc.moveDown(0.5);
      }
      
      if (content.introduction.intensity) {
        doc.fontSize(12).font('Helvetica-Bold').text('Intensity:');
        doc.fontSize(10).font('Helvetica').text(content.introduction.intensity);
        doc.moveDown(0.5);
      }
      
      if (content.introduction.objectives) {
        doc.fontSize(12).font('Helvetica-Bold').text('Objectives:');
        content.introduction.objectives.forEach((objective: string) => {
          doc.fontSize(10).font('Helvetica').text(`• ${objective}`);
        });
        doc.moveDown(0.5);
      }
      
      if (content.introduction.preparation) {
        doc.fontSize(12).font('Helvetica-Bold').text('Preparation:');
        doc.fontSize(10).font('Helvetica').text(content.introduction.preparation);
        doc.moveDown(0.5);
      }
      
      doc.moveDown(1);
    }
    
    // Add the main workout content
    if (content.mainWorkout) {
      doc.fontSize(16).font('Helvetica-Bold').text('Workout Plan', { underline: true });
      doc.moveDown(1);
      
      content.mainWorkout.forEach((circuit: any, index: number) => {
        // Add page break if we're near the bottom of the page
        if (doc.y > 650) {
          doc.addPage();
        }
        
        doc.fontSize(14).font('Helvetica-Bold').text(`Circuit ${circuit.circuitNumber || index + 1}`);
        doc.moveDown(0.5);
        
        if (circuit.explanation) {
          doc.fontSize(10).font('Helvetica-Bold').text('Explanation:');
          doc.fontSize(10).font('Helvetica').text(circuit.explanation);
          doc.moveDown(0.5);
        }
        
        if (circuit.objective) {
          doc.fontSize(10).font('Helvetica-Bold').text('Objective:');
          doc.fontSize(10).font('Helvetica').text(circuit.objective);
          doc.moveDown(0.5);
        }
        
        if (circuit.setupInstructions) {
          doc.fontSize(10).font('Helvetica-Bold').text('Setup Instructions:');
          doc.fontSize(10).font('Helvetica').text(circuit.setupInstructions);
          doc.moveDown(0.5);
        }
        
        if (circuit.exercises && circuit.exercises.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('Exercises:');
          doc.moveDown(0.5);
          
          // Create a table-like structure for exercises
          circuit.exercises.forEach((exercise: any, exIndex: number) => {
            // Add page break if we're near the bottom of the page
            if (doc.y > 680) {
              doc.addPage();
            }
            
            const startY = doc.y;
            
            // Exercise box
            doc.rect(50, startY, 495, 80).stroke();
            
            // Exercise name
            doc.fontSize(12).font('Helvetica-Bold').text(exercise.exercise, 60, startY + 10);
            
            // Exercise details in columns
            const col1X = 60;
            const col2X = 280;
            
            doc.fontSize(10).font('Helvetica-Bold').text('Reps:', col1X, startY + 30);
            doc.fontSize(10).font('Helvetica').text(exercise.reps || 'N/A', col1X + 40, startY + 30);
            
            doc.fontSize(10).font('Helvetica-Bold').text('Sets:', col1X, startY + 45);
            doc.fontSize(10).font('Helvetica').text(exercise.sets || 'N/A', col1X + 40, startY + 45);
            
            if (exercise.men) {
              doc.fontSize(10).font('Helvetica-Bold').text('Men:', col1X, startY + 60);
              doc.fontSize(10).font('Helvetica').text(exercise.men, col1X + 40, startY + 60);
            }
            
            if (exercise.woman) {
              doc.fontSize(10).font('Helvetica-Bold').text('Women:', col2X - 50, startY + 60);
              doc.fontSize(10).font('Helvetica').text(exercise.woman, col2X - 5, startY + 60);
            }
            
            doc.fontSize(10).font('Helvetica-Bold').text('Technique:', col2X, startY + 30);
            
            // Wrap long technique instructions
            const techniqueText = exercise.technique || 'N/A';
            const techniqueWidth = 260; // Width available for technique text
            doc.fontSize(10).font('Helvetica').text(techniqueText, col2X + 60, startY + 30, {
              width: techniqueWidth,
              align: 'left'
            });
            
            doc.moveDown(2.5); // Move down enough for the next exercise box
          });
        }
        
        doc.moveDown(1);
      });
    }
    
    // Add the recovery section
    if (content.recovery) {
      // Add page break if we're near the bottom of the page
      if (doc.y > 600) {
        doc.addPage();
      }
      
      doc.fontSize(16).font('Helvetica-Bold').text('Recovery', { underline: true });
      doc.moveDown(0.5);
      
      if (content.recovery.immediateSteps) {
        doc.fontSize(12).font('Helvetica-Bold').text('Immediate Steps:');
        content.recovery.immediateSteps.forEach((step: string) => {
          doc.fontSize(10).font('Helvetica').text(`• ${step}`);
        });
        doc.moveDown(0.5);
      }
      
      if (content.recovery.nutritionTips) {
        doc.fontSize(12).font('Helvetica-Bold').text('Nutrition Tips:');
        content.recovery.nutritionTips.forEach((tip: string) => {
          doc.fontSize(10).font('Helvetica').text(`• ${tip}`);
        });
        doc.moveDown(0.5);
      }
      
      if (content.recovery.restRecommendations) {
        doc.fontSize(12).font('Helvetica-Bold').text('Rest Recommendations:');
        doc.fontSize(10).font('Helvetica').text(content.recovery.restRecommendations);
        doc.moveDown(0.5);
      }
      
      if (content.recovery.nextDayGuidance) {
        doc.fontSize(12).font('Helvetica-Bold').text('Next Day Guidance:');
        doc.fontSize(10).font('Helvetica').text(content.recovery.nextDayGuidance);
        doc.moveDown(0.5);
      }
    }
    
    // Add footer with page numbers
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').text(
        `Page ${i + 1} of ${totalPages}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }
    
    // Add trainer information in the footer of the last page
    doc.switchToPage(totalPages - 1);
    
    const trainerInfo = await storage.getUser(workoutPlan.trainerId);
    if (trainerInfo) {
      doc.fontSize(10).font('Helvetica-Bold').text(
        `Created by: ${trainerInfo.fullName || trainerInfo.username}`,
        50,
        doc.page.height - 30,
        { align: 'center' }
      );
    }
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({
      error: "Failed to generate PDF",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
