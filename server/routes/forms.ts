import { Request, Response } from "express";
import { storage } from "../storage";
import { ZodError } from "zod";
import { insertOnboardingFormSchema, insertFormResponseSchema } from "../../shared/schema";
import { z } from "zod";

/**
 * Get all onboarding forms for a workspace
 */
export async function getOnboardingForms(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const workspaceId = parseInt(req.params.workspaceId || req.query.workspaceId as string);
    
    if (isNaN(workspaceId)) {
      return res.status(400).json({ error: "Invalid workspace ID" });
    }
    
    const forms = await storage.getOnboardingForms(workspaceId);
    return res.json(forms);
  } catch (error) {
    console.error("Error fetching onboarding forms:", error);
    return res.status(500).json({ error: "Failed to fetch onboarding forms" });
  }
}

/**
 * Get a specific onboarding form by ID
 */
export async function getOnboardingForm(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const formId = parseInt(req.params.formId);
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: "Invalid form ID" });
    }
    
    const forms = await storage.getOnboardingForms(0); // Get all forms, then filter
    const form = forms.find(f => f.id === formId);
    
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    
    return res.json(form);
  } catch (error) {
    console.error("Error fetching onboarding form:", error);
    return res.status(500).json({ error: "Failed to fetch onboarding form" });
  }
}

/**
 * Create a new onboarding form
 */
export async function createOnboardingForm(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const formData = insertOnboardingFormSchema.parse(req.body);
    const newForm = await storage.createOnboardingForm(formData);
    return res.status(201).json(newForm);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: "Invalid form data", details: error.errors });
    }
    
    console.error("Error creating onboarding form:", error);
    return res.status(500).json({ error: "Failed to create onboarding form" });
  }
}

/**
 * Update an existing onboarding form
 */
export async function updateOnboardingForm(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const formId = parseInt(req.params.formId);
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: "Invalid form ID" });
    }
    
    const formData = req.body;
    const updatedForm = await storage.updateOnboardingForm(formId, formData);
    return res.json(updatedForm);
  } catch (error) {
    console.error("Error updating onboarding form:", error);
    return res.status(500).json({ error: "Failed to update onboarding form" });
  }
}

/**
 * Delete an onboarding form
 */
export async function deleteOnboardingForm(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const formId = parseInt(req.params.formId);
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: "Invalid form ID" });
    }
    
    await storage.deleteOnboardingForm(formId);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting onboarding form:", error);
    return res.status(500).json({ error: "Failed to delete onboarding form" });
  }
}

/**
 * Get form responses for a specific form
 */
export async function getFormResponses(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const formId = parseInt(req.params.formId);
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: "Invalid form ID" });
    }
    
    const responses = await storage.getFormResponses(formId);
    return res.json(responses);
  } catch (error) {
    console.error("Error fetching form responses:", error);
    return res.status(500).json({ error: "Failed to fetch form responses" });
  }
}

/**
 * Get form responses for a specific client
 */
export async function getClientFormResponses(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const clientId = parseInt(req.params.clientId);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "Invalid client ID" });
    }
    
    const responses = await storage.getClientFormResponses(clientId);
    return res.json(responses);
  } catch (error) {
    console.error("Error fetching client form responses:", error);
    return res.status(500).json({ error: "Failed to fetch client form responses" });
  }
}

/**
 * Create a new form response
 */
export async function createFormResponse(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const responseData = insertFormResponseSchema.parse(req.body);
    const newResponse = await storage.createFormResponse(responseData);
    return res.status(201).json(newResponse);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: "Invalid form response data", details: error.errors });
    }
    
    console.error("Error creating form response:", error);
    return res.status(500).json({ error: "Failed to create form response" });
  }
}

/**
 * Update an existing form response
 */
export async function updateFormResponse(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const responseId = parseInt(req.params.responseId);
    
    if (isNaN(responseId)) {
      return res.status(400).json({ error: "Invalid response ID" });
    }
    
    const responseData = req.body;
    const updatedResponse = await storage.updateFormResponse(responseId, responseData);
    return res.json(updatedResponse);
  } catch (error) {
    console.error("Error updating form response:", error);
    return res.status(500).json({ error: "Failed to update form response" });
  }
}

/**
 * Create predefined form templates for the application
 */
export async function createFormTemplates(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== 'admin' && req.user.role !== 'trainer') {
    return res.status(403).json({ error: "Unauthorized" });
  }
  
  try {
    const workspaceId = parseInt(req.params.workspaceId || req.body.workspaceId);
    
    if (isNaN(workspaceId)) {
      return res.status(400).json({ error: "Invalid workspace ID" });
    }
    
    // Create PAR-Q form
    const parQForm = await storage.createOnboardingForm({
      workspaceId,
      title: "Physical Activity Readiness Questionnaire (PAR-Q)",
      description: "This questionnaire helps determine if you should consult with a physician before becoming physically active.",
      isRequired: true,
      order: 1,
      fields: [
        {
          id: "heart_condition",
          type: "boolean",
          label: "Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?",
          required: true
        },
        {
          id: "chest_pain",
          type: "boolean",
          label: "Do you feel pain in your chest when you do physical activity?",
          required: true
        },
        {
          id: "chest_pain_not_active",
          type: "boolean",
          label: "In the past month, have you had chest pain when you were not doing physical activity?",
          required: true
        },
        {
          id: "balance_issues",
          type: "boolean",
          label: "Do you lose your balance because of dizziness or do you ever lose consciousness?",
          required: true
        },
        {
          id: "bone_joint_issues",
          type: "boolean",
          label: "Do you have a bone or joint problem that could be made worse by a change in your physical activity?",
          required: true
        },
        {
          id: "medication",
          type: "boolean",
          label: "Is your doctor currently prescribing drugs for your blood pressure or heart condition?",
          required: true
        },
        {
          id: "other_reasons",
          type: "boolean",
          label: "Do you know of any other reason why you should not do physical activity?",
          required: true
        },
        {
          id: "other_reasons_details",
          type: "text",
          label: "If you answered yes to any of the above questions, please provide details:",
          required: false,
          conditional: {
            field: "other_reasons",
            value: true
          }
        },
        {
          id: "declaration",
          type: "checkbox",
          label: "I affirm that I have answered the above questions truthfully and to the best of my ability.",
          required: true
        }
      ]
    });

    // Create Client Intake Form
    const intakeForm = await storage.createOnboardingForm({
      workspaceId,
      title: "Client Intake Form",
      description: "Please complete this form to help us understand your fitness background, goals, and any health concerns.",
      isRequired: true,
      order: 2,
      fields: [
        {
          id: "personal_info",
          type: "section",
          label: "Personal Information"
        },
        {
          id: "full_name",
          type: "text",
          label: "Full Name",
          required: true
        },
        {
          id: "date_of_birth",
          type: "date",
          label: "Date of Birth",
          required: true
        },
        {
          id: "gender",
          type: "select",
          label: "Gender",
          options: ["Male", "Female", "Non-binary", "Prefer not to say"],
          required: true
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          required: true
        },
        {
          id: "phone",
          type: "text",
          label: "Phone Number",
          required: true
        },
        {
          id: "emergency_contact",
          type: "text",
          label: "Emergency Contact Name",
          required: true
        },
        {
          id: "emergency_phone",
          type: "text",
          label: "Emergency Contact Phone",
          required: true
        },
        {
          id: "health_section",
          type: "section",
          label: "Health Information"
        },
        {
          id: "height",
          type: "number",
          label: "Height (cm)",
          required: true
        },
        {
          id: "weight",
          type: "number",
          label: "Weight (kg)",
          required: true
        },
        {
          id: "medical_conditions",
          type: "checkbox-group",
          label: "Do you have any of the following medical conditions?",
          options: [
            "Heart Disease", 
            "High Blood Pressure", 
            "Diabetes", 
            "Asthma", 
            "Arthritis", 
            "Back Problems", 
            "Other"
          ],
          required: false
        },
        {
          id: "medical_conditions_other",
          type: "text",
          label: "If you selected 'Other', please specify:",
          required: false,
          conditional: {
            field: "medical_conditions",
            value: ["Other"]
          }
        },
        {
          id: "medications",
          type: "textarea",
          label: "Please list any medications you are currently taking:",
          required: false
        },
        {
          id: "injuries",
          type: "textarea",
          label: "Please list any injuries or surgeries in the past 2 years:",
          required: false
        },
        {
          id: "fitness_section",
          type: "section",
          label: "Fitness Background"
        },
        {
          id: "fitness_level",
          type: "select",
          label: "How would you describe your current fitness level?",
          options: ["Beginner", "Intermediate", "Advanced", "Athletic"],
          required: true
        },
        {
          id: "activity_level",
          type: "select",
          label: "How active are you currently?",
          options: [
            "Sedentary (little to no exercise)", 
            "Lightly active (1-3 days per week)", 
            "Moderately active (3-5 days per week)", 
            "Very active (6-7 days per week)", 
            "Extremely active (professional athlete level)"
          ],
          required: true
        },
        {
          id: "exercise_frequency",
          type: "select",
          label: "How often do you currently exercise?",
          options: [
            "Never", 
            "1-2 times per week", 
            "3-4 times per week", 
            "5+ times per week"
          ],
          required: true
        },
        {
          id: "exercise_types",
          type: "checkbox-group",
          label: "What types of exercise do you currently do?",
          options: [
            "Cardio/Aerobic", 
            "Strength Training", 
            "Flexibility/Stretching", 
            "Sports", 
            "Group Fitness Classes", 
            "Other"
          ],
          required: false
        },
        {
          id: "goals_section",
          type: "section",
          label: "Goals and Preferences"
        },
        {
          id: "fitness_goals",
          type: "checkbox-group",
          label: "What are your primary fitness goals? (Select all that apply)",
          options: [
            "Weight Loss", 
            "Muscle Gain", 
            "Improved Endurance", 
            "Increased Strength", 
            "Better Flexibility", 
            "Sport-Specific Training", 
            "General Health", 
            "Rehabilitation"
          ],
          required: true
        },
        {
          id: "specific_goals",
          type: "textarea",
          label: "Please describe any specific goals you have:",
          required: false
        },
        {
          id: "preferred_days",
          type: "checkbox-group",
          label: "Which days are you available to exercise?",
          options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          required: true
        },
        {
          id: "preferred_times",
          type: "checkbox-group",
          label: "What times of day do you prefer to exercise?",
          options: ["Early Morning (5am-8am)", "Morning (8am-12pm)", "Afternoon (12pm-5pm)", "Evening (5pm-9pm)"],
          required: true
        },
        {
          id: "lifestyle_section",
          type: "section",
          label: "Lifestyle and Nutrition"
        },
        {
          id: "occupation",
          type: "text",
          label: "Occupation",
          required: true
        },
        {
          id: "stress_level",
          type: "select",
          label: "How would you rate your daily stress level?",
          options: ["Low", "Moderate", "High", "Very High"],
          required: true
        },
        {
          id: "sleep_hours",
          type: "select",
          label: "How many hours of sleep do you get per night on average?",
          options: ["Less than 5", "5-6", "7-8", "9+"],
          required: true
        },
        {
          id: "dietary_restrictions",
          type: "checkbox-group",
          label: "Do you have any dietary restrictions?",
          options: [
            "Vegetarian", 
            "Vegan", 
            "Gluten-Free", 
            "Dairy-Free", 
            "Keto", 
            "Paleo", 
            "Other", 
            "None"
          ],
          required: false
        },
        {
          id: "water_intake",
          type: "select",
          label: "How many glasses of water do you drink daily?",
          options: ["0-2", "3-5", "6-8", "9+"],
          required: true
        },
        {
          id: "agreement_section",
          type: "section",
          label: "Agreement"
        },
        {
          id: "agreement",
          type: "checkbox",
          label: "I understand that my trainer will use this information to develop a personalized fitness program. I affirm that the information provided is accurate and complete.",
          required: true
        }
      ]
    });

    // Create Exercise Preferences & Movement Assessment
    const exercisePreferencesForm = await storage.createOnboardingForm({
      workspaceId,
      title: "Exercise Preferences & Movement Assessment",
      description: "Help us understand your exercise preferences and assess your movement capabilities.",
      isRequired: true,
      order: 3,
      fields: [
        {
          id: "exercise_preferences",
          type: "section",
          label: "Exercise Preferences"
        },
        {
          id: "preferred_exercises",
          type: "checkbox-group",
          label: "Which types of exercises do you enjoy the most?",
          options: [
            "Free Weights (dumbbells, barbells)", 
            "Bodyweight Exercises", 
            "Cardio Machines (treadmill, elliptical)", 
            "Functional Training", 
            "Group Classes", 
            "Yoga/Pilates", 
            "Sports", 
            "Outdoor Activities"
          ],
          required: true
        },
        {
          id: "disliked_exercises",
          type: "textarea",
          label: "Are there any exercises or activities you particularly dislike?",
          required: false
        },
        {
          id: "exercise_environment",
          type: "select",
          label: "Do you prefer exercising indoors or outdoors?",
          options: ["Indoors", "Outdoors", "Both equally"],
          required: true
        },
        {
          id: "exercise_time",
          type: "select",
          label: "How long do you typically prefer your workout sessions to be?",
          options: ["15-30 minutes", "30-45 minutes", "45-60 minutes", "60+ minutes"],
          required: true
        },
        {
          id: "workout_intensity",
          type: "select",
          label: "What level of intensity do you prefer for your workouts?",
          options: ["Light", "Moderate", "Challenging", "Very Intense"],
          required: true
        },
        {
          id: "variety_preference",
          type: "select",
          label: "Do you prefer consistent routines or variety in your workouts?",
          options: ["Consistent routine", "Occasional changes", "Frequent variety", "Complete variety each session"],
          required: true
        },
        {
          id: "movement_assessment",
          type: "section",
          label: "Movement Assessment"
        },
        {
          id: "mobility_issues",
          type: "checkbox-group",
          label: "Do you have any mobility issues or limitations in the following areas?",
          options: [
            "Shoulders", 
            "Hips", 
            "Knees", 
            "Ankles", 
            "Lower back", 
            "Neck", 
            "Other", 
            "None"
          ],
          required: true
        },
        {
          id: "mobility_other",
          type: "text",
          label: "If you selected 'Other' above, please specify:",
          required: false,
          conditional: {
            field: "mobility_issues",
            value: ["Other"]
          }
        },
        {
          id: "pain_during_exercise",
          type: "boolean",
          label: "Do you frequently experience pain during exercise?",
          required: true
        },
        {
          id: "pain_details",
          type: "textarea",
          label: "If yes, please describe where and when this pain occurs:",
          required: false,
          conditional: {
            field: "pain_during_exercise",
            value: true
          }
        },
        {
          id: "balance_coordination",
          type: "select",
          label: "How would you rate your balance and coordination?",
          options: ["Poor", "Fair", "Good", "Excellent"],
          required: true
        },
        {
          id: "movement_patterns",
          type: "section",
          label: "Basic Movement Patterns"
        },
        {
          id: "squat_ability",
          type: "select",
          label: "How would you rate your ability to perform a bodyweight squat?",
          options: ["Unable to perform", "Can perform with limitations", "Can perform with good form", "Can perform with excellent form"],
          required: true
        },
        {
          id: "pushup_ability",
          type: "select",
          label: "How would you rate your ability to perform a push-up?",
          options: ["Unable to perform", "Can perform modified push-ups only", "Can perform standard push-ups", "Can perform advanced push-up variations"],
          required: true
        },
        {
          id: "lunge_ability",
          type: "select",
          label: "How would you rate your ability to perform a lunge?",
          options: ["Unable to perform", "Can perform with support", "Can perform with good form", "Can perform advanced lunge variations"],
          required: true
        },
        {
          id: "plank_ability",
          type: "select",
          label: "How long can you hold a standard plank position?",
          options: ["Less than 15 seconds", "15-30 seconds", "30-60 seconds", "60+ seconds"],
          required: true
        },
        {
          id: "equipment_access",
          type: "section",
          label: "Equipment Access"
        },
        {
          id: "available_equipment",
          type: "checkbox-group",
          label: "What equipment do you have access to?",
          options: [
            "Gym membership", 
            "Home gym equipment", 
            "Cardio machines", 
            "Free weights (dumbbells, barbells)", 
            "Resistance bands", 
            "Kettlebells", 
            "Stability/Swiss ball", 
            "TRX/Suspension trainer", 
            "None"
          ],
          required: true
        },
        {
          id: "equipment_notes",
          type: "textarea",
          label: "Please provide any additional details about your equipment access:",
          required: false
        },
        {
          id: "additional_notes",
          type: "textarea",
          label: "Any additional information you'd like to share about your exercise preferences or movement capabilities?",
          required: false
        }
      ]
    });

    // Create Senior Client Assessment
    const seniorAssessmentForm = await storage.createOnboardingForm({
      workspaceId,
      title: "Senior Client Assessment Package",
      description: "A comprehensive assessment for senior clients focusing on functional fitness and specific health considerations.",
      isRequired: false,
      order: 4,
      fields: [
        {
          id: "senior_health",
          type: "section",
          label: "Senior Health Information"
        },
        {
          id: "age",
          type: "number",
          label: "Age",
          required: true
        },
        {
          id: "chronic_conditions",
          type: "checkbox-group",
          label: "Do you have any of the following chronic conditions?",
          options: [
            "Osteoporosis/Osteopenia", 
            "Arthritis", 
            "Hypertension", 
            "Heart Disease", 
            "Diabetes", 
            "COPD/Respiratory Condition", 
            "Parkinson's Disease", 
            "Alzheimer's/Dementia", 
            "Other", 
            "None"
          ],
          required: true
        },
        {
          id: "chronic_other",
          type: "text",
          label: "If you selected 'Other' above, please specify:",
          required: false,
          conditional: {
            field: "chronic_conditions",
            value: ["Other"]
          }
        },
        {
          id: "joint_replacements",
          type: "boolean",
          label: "Have you had any joint replacements?",
          required: true
        },
        {
          id: "joint_details",
          type: "textarea",
          label: "If yes, please provide details including which joints and when:",
          required: false,
          conditional: {
            field: "joint_replacements",
            value: true
          }
        },
        {
          id: "fall_history",
          type: "select",
          label: "Have you fallen in the past year?",
          options: ["No falls", "One fall", "Two falls", "Three or more falls"],
          required: true
        },
        {
          id: "fall_details",
          type: "textarea",
          label: "If you've experienced falls, please provide details about the circumstances:",
          required: false,
          conditional: {
            field: "fall_history",
            value: ["One fall", "Two falls", "Three or more falls"]
          }
        },
        {
          id: "assistive_devices",
          type: "checkbox-group",
          label: "Do you use any assistive devices?",
          options: ["Cane", "Walker", "Wheelchair", "Hearing Aid", "Other", "None"],
          required: true
        },
        {
          id: "assistive_other",
          type: "text",
          label: "If you selected 'Other' above, please specify:",
          required: false,
          conditional: {
            field: "assistive_devices",
            value: ["Other"]
          }
        },
        {
          id: "functional_assessment",
          type: "section",
          label: "Functional Assessment"
        },
        {
          id: "daily_activities",
          type: "select",
          label: "How would you rate your ability to perform daily activities (dressing, bathing, etc.)?",
          options: ["Completely independent", "Need minimal assistance", "Need moderate assistance", "Need significant assistance"],
          required: true
        },
        {
          id: "difficulty_activities",
          type: "checkbox-group",
          label: "Which activities do you find difficult to perform?",
          options: [
            "Getting up from a chair", 
            "Climbing stairs", 
            "Reaching overhead", 
            "Picking items up from the floor", 
            "Walking long distances", 
            "Carrying groceries", 
            "Getting in/out of car", 
            "Other", 
            "None"
          ],
          required: true
        },
        {
          id: "difficulty_other",
          type: "text",
          label: "If you selected 'Other' above, please specify:",
          required: false,
          conditional: {
            field: "difficulty_activities",
            value: ["Other"]
          }
        },
        {
          id: "fitness_goals_senior",
          type: "checkbox-group",
          label: "What are your primary fitness goals?",
          options: [
            "Improve balance", 
            "Increase strength", 
            "Enhance mobility", 
            "Reduce pain", 
            "Maintain independence", 
            "Increase energy", 
            "Social engagement", 
            "Other"
          ],
          required: true
        },
        {
          id: "goals_other",
          type: "text",
          label: "If you selected 'Other' above, please specify:",
          required: false,
          conditional: {
            field: "fitness_goals_senior",
            value: ["Other"]
          }
        },
        {
          id: "exercise_history",
          type: "textarea",
          label: "Please describe any current or past exercise experiences:",
          required: false
        },
        {
          id: "balance_confidence",
          type: "select",
          label: "How confident are you that you won't lose your balance or become unsteady during daily activities?",
          options: ["Not confident at all", "Somewhat confident", "Moderately confident", "Completely confident"],
          required: true
        },
        {
          id: "additional_info",
          type: "section",
          label: "Additional Information"
        },
        {
          id: "safety_concerns",
          type: "textarea",
          label: "Do you have any specific safety concerns about exercising?",
          required: false
        },
        {
          id: "physician_clearance",
          type: "boolean",
          label: "Have you received clearance from your physician to participate in an exercise program?",
          required: true
        },
        {
          id: "preferred_activities",
          type: "checkbox-group",
          label: "What types of activities are you interested in?",
          options: [
            "Walking", 
            "Water exercises", 
            "Chair exercises", 
            "Gentle yoga/stretching", 
            "Resistance training", 
            "Balance exercises", 
            "Group fitness classes", 
            "Other"
          ],
          required: false
        },
        {
          id: "additional_notes_senior",
          type: "textarea",
          label: "Is there anything else you would like us to know about your health, fitness, or personal goals?",
          required: false
        },
        {
          id: "agreement",
          type: "checkbox",
          label: "I understand the importance of starting slowly and progressing gradually with any exercise program. I will communicate any discomfort, pain, or concerns to my trainer immediately.",
          required: true
        }
      ]
    });

    return res.status(201).json({
      message: "Form templates created successfully",
      forms: [parQForm, intakeForm, exercisePreferencesForm, seniorAssessmentForm]
    });
  } catch (error) {
    console.error("Error creating form templates:", error);
    return res.status(500).json({ error: "Failed to create form templates" });
  }
}