import { Request, Response } from 'express';
import { storage } from '../storage';
import { 
  insertOnboardingFormSchema, 
  insertFormResponseSchema 
} from '../../shared/schema';
import { z } from 'zod';

/**
 * Get all onboarding forms for a workspace
 */
export async function getOnboardingForms(req: Request, res: Response) {
  try {
    // Allow fetching forms without specifying a workspace ID
    // Default to 1 if not provided (assuming default workspace)
    const workspaceId = Number(req.params.workspaceId || req.query.workspaceId || 1);
    
    const forms = await storage.getOnboardingForms(workspaceId);
    res.json(forms);
  } catch (error: any) {
    console.error('Error retrieving onboarding forms:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get a specific onboarding form by ID
 */
export async function getOnboardingForm(req: Request, res: Response) {
  try {
    const formId = Number(req.params.id);
    
    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    // Default to workspace ID 1 if not provided
    const workspaceId = Number(req.query.workspaceId || 1);
    const forms = await storage.getOnboardingForms(workspaceId);
    const form = forms.find(f => f.id === formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json(form);
  } catch (error: any) {
    console.error('Error retrieving onboarding form:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create a new onboarding form
 */
export async function createOnboardingForm(req: Request, res: Response) {
  try {
    const result = insertOnboardingFormSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid form data', 
        details: result.error.format() 
      });
    }

    const form = await storage.createOnboardingForm(result.data);
    res.status(201).json(form);
  } catch (error: any) {
    console.error('Error creating onboarding form:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update an existing onboarding form
 */
export async function updateOnboardingForm(req: Request, res: Response) {
  try {
    const formId = Number(req.params.id);
    
    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }
    
    // Get only the fields that can be updated
    const updateData = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      fields: z.array(z.any()).optional(),
      isRequired: z.boolean().optional(),
      order: z.number().optional(),
    }).parse(req.body);

    const updatedForm = await storage.updateOnboardingForm(formId, updateData);
    res.json(updatedForm);
  } catch (error: any) {
    console.error('Error updating onboarding form:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete an onboarding form
 */
export async function deleteOnboardingForm(req: Request, res: Response) {
  try {
    const formId = Number(req.params.id);
    
    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    await storage.deleteOnboardingForm(formId);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting onboarding form:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get form responses for a specific form
 */
export async function getFormResponses(req: Request, res: Response) {
  try {
    const formId = Number(req.params.formId);
    
    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    const responses = await storage.getFormResponses(formId);
    res.json(responses);
  } catch (error: any) {
    console.error('Error retrieving form responses:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get form responses for a specific client
 */
export async function getClientFormResponses(req: Request, res: Response) {
  try {
    const clientId = Number(req.params.clientId);
    
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    const responses = await storage.getClientFormResponses(clientId);
    res.json(responses);
  } catch (error: any) {
    console.error('Error retrieving client form responses:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create a new form response
 */
export async function createFormResponse(req: Request, res: Response) {
  try {
    const result = insertFormResponseSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid form response data', 
        details: result.error.format() 
      });
    }

    const response = await storage.createFormResponse(result.data);
    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating form response:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update an existing form response
 */
export async function updateFormResponse(req: Request, res: Response) {
  try {
    const responseId = Number(req.params.id);
    
    if (!responseId) {
      return res.status(400).json({ error: 'Response ID is required' });
    }
    
    // Get only the fields that can be updated
    const updateData = z.object({
      responses: z.record(z.any()).optional(),
      status: z.enum(['draft', 'submitted', 'reviewed']).optional(),
    }).parse(req.body);

    const updatedResponse = await storage.updateFormResponse(responseId, updateData);
    res.json(updatedResponse);
  } catch (error: any) {
    console.error('Error updating form response:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create predefined form templates for the application
 */
export async function createFormTemplates(req: Request, res: Response) {
  try {
    // Default to 1 if not provided
    const workspaceId = Number(req.body.workspaceId || 1);

    // Create the PAR-Q form template
    const parqForm = await storage.createOnboardingForm({
      workspaceId,
      title: 'Physical Activity Readiness Questionnaire (PAR-Q)',
      description: 'A screening tool to determine if you should consult with a doctor before increasing your physical activity.',
      isRequired: true,
      order: 1,
      fields: [
        {
          id: 'section_intro',
          type: 'section',
          label: 'Introduction',
        },
        {
          id: 'instructions',
          type: 'text',
          label: 'Instructions',
          helpText: 'Regular physical activity is fun and healthy, and increasingly more people are starting to become more active every day. Being more active is very safe for most people. However, some people should check with their doctor before they start becoming much more physically active. Please read the following questions carefully and answer each one honestly.',
          required: false,
        },
        {
          id: 'heart_condition',
          type: 'radio',
          label: 'Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'chest_pain',
          type: 'radio',
          label: 'Do you feel pain in your chest when you do physical activity?',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'chest_pain_no_activity',
          type: 'radio',
          label: 'In the past month, have you had chest pain when you were not doing physical activity?',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'balance_issues',
          type: 'radio',
          label: 'Do you lose your balance because of dizziness or do you ever lose consciousness?',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'bone_joint_problems',
          type: 'radio',
          label: 'Do you have a bone or joint problem that could be made worse by a change in your physical activity?',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'medication_blood_pressure',
          type: 'radio',
          label: 'Is your doctor currently prescribing drugs for your blood pressure or heart condition?',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'reason_no_exercise',
          type: 'radio',
          label: 'Do you know of any other reason why you should not do physical activity?',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'reason_details',
          type: 'textarea',
          label: 'If you answered "Yes" to any of the above questions, please provide details:',
          placeholder: 'Enter details here...',
          conditional: { field: 'heart_condition', value: 'Yes' },
          required: false,
        },
        {
          id: 'section_signature',
          type: 'section',
          label: 'Signature',
        },
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          required: true,
        },
        {
          id: 'date',
          type: 'date',
          label: 'Date',
          required: true,
        },
      ]
    });

    // Create the Client Intake Form template
    const intakeForm = await storage.createOnboardingForm({
      workspaceId,
      title: 'Client Intake Form',
      description: 'Basic information to help us understand your goals and fitness background.',
      isRequired: true,
      order: 2,
      fields: [
        {
          id: 'section_personal',
          type: 'section',
          label: 'Personal Information',
        },
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          required: true,
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          placeholder: 'your.email@example.com',
          required: true,
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Phone Number',
          placeholder: '(123) 456-7890',
          required: true,
        },
        {
          id: 'birthdate',
          type: 'date',
          label: 'Date of Birth',
          required: true,
        },
        {
          id: 'gender',
          type: 'select',
          label: 'Gender',
          options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
          required: true,
        },
        {
          id: 'emergency_contact',
          type: 'text',
          label: 'Emergency Contact Name',
          placeholder: 'Enter name',
          required: true,
        },
        {
          id: 'emergency_phone',
          type: 'phone',
          label: 'Emergency Contact Phone',
          placeholder: '(123) 456-7890',
          required: true,
        },
        {
          id: 'section_health',
          type: 'section',
          label: 'Health Information',
        },
        {
          id: 'height',
          type: 'text',
          label: 'Height (ft/in or cm)',
          placeholder: 'e.g., 5\'10" or 178 cm',
          required: true,
        },
        {
          id: 'weight',
          type: 'text',
          label: 'Weight (lbs or kg)',
          placeholder: 'e.g., 165 lbs or 75 kg',
          required: true,
        },
        {
          id: 'medical_conditions',
          type: 'checkbox-group',
          label: 'Do you have any of the following medical conditions?',
          options: [
            'High blood pressure',
            'Heart disease',
            'Diabetes',
            'Asthma',
            'Arthritis',
            'Back pain/issues',
            'Joint pain/issues',
            'Other'
          ],
          required: false,
        },
        {
          id: 'medical_conditions_other',
          type: 'textarea',
          label: 'Please describe other medical conditions',
          placeholder: 'Enter details here...',
          conditional: { field: 'medical_conditions', value: ['Other'] },
          required: false,
        },
        {
          id: 'medications',
          type: 'textarea',
          label: 'Are you currently taking any medications? If yes, please list them.',
          placeholder: 'List medications or type "None"',
          required: true,
        },
        {
          id: 'injuries',
          type: 'textarea',
          label: 'Do you have any injuries, past or present, that I should know about?',
          placeholder: 'Describe any injuries or type "None"',
          required: true,
        },
        {
          id: 'section_fitness',
          type: 'section',
          label: 'Fitness History & Goals',
        },
        {
          id: 'activity_level',
          type: 'select',
          label: 'How would you describe your current activity level?',
          options: [
            'Sedentary (little to no exercise)',
            'Lightly active (light exercise 1-3 days/week)',
            'Moderately active (moderate exercise 3-5 days/week)',
            'Very active (hard exercise 6-7 days/week)',
            'Extremely active (very hard daily exercise or physical job)'
          ],
          required: true,
        },
        {
          id: 'exercise_history',
          type: 'textarea',
          label: 'Please describe your exercise history for the past 6 months',
          placeholder: 'What types of exercise have you been doing?',
          required: true,
        },
        {
          id: 'fitness_goals',
          type: 'checkbox-group',
          label: 'What are your primary fitness goals?',
          options: [
            'Lose weight',
            'Build muscle',
            'Improve endurance',
            'Increase strength',
            'Improve flexibility',
            'Improve athletic performance',
            'Improve overall health',
            'Rehabilitation from injury',
            'Other'
          ],
          required: true,
        },
        {
          id: 'fitness_goals_other',
          type: 'textarea',
          label: 'Please describe your other fitness goals',
          placeholder: 'Enter details here...',
          conditional: { field: 'fitness_goals', value: ['Other'] },
          required: false,
        },
        {
          id: 'goal_timeframe',
          type: 'select',
          label: 'What is your timeframe for achieving these goals?',
          options: [
            '1-3 months',
            '3-6 months',
            '6-12 months',
            'Over 12 months'
          ],
          required: true,
        },
        {
          id: 'section_preferences',
          type: 'section',
          label: 'Training Preferences',
        },
        {
          id: 'training_frequency',
          type: 'select',
          label: 'How many days per week would you like to train?',
          options: ['1-2', '3-4', '5-6', '7 (daily)'],
          required: true,
        },
        {
          id: 'session_length',
          type: 'select',
          label: 'Preferred session length',
          options: ['30 minutes', '45 minutes', '60 minutes', '90+ minutes'],
          required: true,
        },
        {
          id: 'workout_preferences',
          type: 'checkbox-group',
          label: 'What types of workouts do you enjoy or are interested in?',
          options: [
            'Strength training',
            'Cardio (running, biking, etc.)',
            'High-intensity interval training (HIIT)',
            'Flexibility/mobility work',
            'Sports-specific training',
            'Functional training',
            'Group classes',
            'Outdoor activities',
            'Other'
          ],
          required: true,
        },
        {
          id: 'workout_preferences_other',
          type: 'textarea',
          label: 'Please describe other workout preferences',
          placeholder: 'Enter details here...',
          conditional: { field: 'workout_preferences', value: ['Other'] },
          required: false,
        },
        {
          id: 'disliked_exercises',
          type: 'textarea',
          label: 'Are there any specific exercises or activities you dislike or want to avoid?',
          placeholder: 'Enter details here or type "None"',
          required: true,
        },
        {
          id: 'section_additional',
          type: 'section',
          label: 'Additional Information',
        },
        {
          id: 'nutrition_tracking',
          type: 'radio',
          label: 'Are you interested in nutrition guidance as part of your fitness program?',
          options: ['Yes', 'No', 'Maybe later'],
          required: true,
        },
        {
          id: 'other_info',
          type: 'textarea',
          label: 'Is there anything else you would like me to know?',
          placeholder: 'Any additional information you want to share',
          required: false,
        },
        {
          id: 'acknowledgment',
          type: 'checkbox',
          label: 'I confirm that the information provided is accurate and complete to the best of my knowledge.',
          required: true,
        },
      ]
    });

    // Create the Exercise Preferences Assessment
    const exercisePreferencesForm = await storage.createOnboardingForm({
      workspaceId,
      title: 'Exercise Preferences & Movement Assessment',
      description: 'Help us understand your exercise preferences and current movement patterns.',
      isRequired: false,
      order: 3,
      fields: [
        {
          id: 'section_movement',
          type: 'section',
          label: 'Movement Patterns Assessment',
        },
        {
          id: 'movement_difficulty',
          type: 'checkbox-group',
          label: 'Which of the following movements do you find difficult or uncomfortable?',
          options: [
            'Squat',
            'Lunge',
            'Push-up',
            'Pull-up',
            'Overhead press',
            'Hip hinge (deadlift pattern)',
            'Rotation movements',
            'Balance exercises',
            'None of the above'
          ],
          required: true,
        },
        {
          id: 'movement_difficulty_details',
          type: 'textarea',
          label: 'Please describe any pain or discomfort you experience with the movements selected above',
          placeholder: 'Where do you feel discomfort? When does it occur?',
          conditional: { field: 'movement_difficulty', value: ['Squat', 'Lunge', 'Push-up', 'Pull-up', 'Overhead press', 'Hip hinge (deadlift pattern)', 'Rotation movements', 'Balance exercises'] },
          required: false,
        },
        {
          id: 'section_equipment',
          type: 'section',
          label: 'Equipment & Environment Preferences',
        },
        {
          id: 'equipment_access',
          type: 'checkbox-group',
          label: 'What equipment do you have access to?',
          options: [
            'Full gym membership',
            'Home gym',
            'Dumbbells',
            'Kettlebells',
            'Resistance bands',
            'Cardio equipment',
            'Bodyweight only',
            'Other'
          ],
          required: true,
        },
        {
          id: 'equipment_access_other',
          type: 'textarea',
          label: 'Please describe other equipment you have access to',
          placeholder: 'Enter details here...',
          conditional: { field: 'equipment_access', value: ['Other'] },
          required: false,
        },
        {
          id: 'training_environment',
          type: 'select',
          label: 'What is your preferred training environment?',
          options: [
            'Commercial gym',
            'Home gym',
            'Outdoors',
            'Virtual/online training',
            'No preference'
          ],
          required: true,
        },
        {
          id: 'section_experience',
          type: 'section',
          label: 'Exercise Experience',
        },
        {
          id: 'training_experience',
          type: 'select',
          label: 'How much experience do you have with structured strength training?',
          options: [
            'Beginner (0-6 months)',
            'Novice (6-18 months)',
            'Intermediate (1.5-3 years)',
            'Advanced (3+ years)'
          ],
          required: true,
        },
        {
          id: 'lifting_experience',
          type: 'radio',
          label: 'Have you worked with free weights before (barbells, dumbbells)?',
          options: ['Yes, extensively', 'Yes, somewhat', 'Very little', 'No experience'],
          required: true,
        },
        {
          id: 'cardio_experience',
          type: 'select',
          label: 'How would you rate your cardiovascular endurance?',
          options: [
            'Poor - I get out of breath easily',
            'Below average - I struggle with sustained cardio',
            'Average - I can maintain moderate cardio for 15-20 minutes',
            'Good - I can maintain cardio for 30+ minutes',
            'Excellent - I regularly do cardio for 45+ minutes'
          ],
          required: true,
        },
        {
          id: 'section_interests',
          type: 'section',
          label: 'Exercise Interests',
        },
        {
          id: 'preferred_exercises',
          type: 'checkbox-group',
          label: 'Which of these exercise styles interest you most?',
          options: [
            'Traditional strength training (sets & reps)',
            'Circuit training',
            'HIIT workouts',
            'Bodyweight training',
            'Olympic weightlifting',
            'Powerlifting',
            'CrossFit-style workouts',
            'Mobility/flexibility work',
            'Sport-specific training',
            'Other'
          ],
          required: true,
        },
        {
          id: 'preferred_exercises_other',
          type: 'textarea',
          label: 'Please describe other exercise styles that interest you',
          placeholder: 'Enter details here...',
          conditional: { field: 'preferred_exercises', value: ['Other'] },
          required: false,
        },
        {
          id: 'section_motivations',
          type: 'section',
          label: 'Motivations & Challenges',
        },
        {
          id: 'exercise_motivation',
          type: 'textarea',
          label: 'What motivates you to exercise?',
          placeholder: 'What keeps you going when exercise gets tough?',
          required: true,
        },
        {
          id: 'exercise_challenges',
          type: 'checkbox-group',
          label: 'What challenges do you face with maintaining a consistent exercise routine?',
          options: [
            'Lack of time',
            'Lack of energy',
            'Lack of motivation',
            'Physical discomfort/pain',
            'Boredom with routine',
            'Inadequate knowledge of what to do',
            'Difficulty tracking progress',
            'Schedule constraints',
            'Other'
          ],
          required: true,
        },
        {
          id: 'exercise_challenges_other',
          type: 'textarea',
          label: 'Please describe other challenges you face',
          placeholder: 'Enter details here...',
          conditional: { field: 'exercise_challenges', value: ['Other'] },
          required: false,
        },
        {
          id: 'learning_style',
          type: 'select',
          label: 'How do you learn new exercises best?',
          options: [
            'Visual demonstration',
            'Written instructions',
            'Verbal cues and guidance',
            'Hands-on correction',
            'Video tutorials',
            'Combination of methods'
          ],
          required: true,
        },
        {
          id: 'section_metrics',
          type: 'section',
          label: 'Metrics & Tracking',
        },
        {
          id: 'progress_metrics',
          type: 'checkbox-group',
          label: 'Which metrics are most important to you for tracking progress?',
          options: [
            'Body weight',
            'Body measurements',
            'Strength gains',
            'Endurance improvements',
            'Body composition changes',
            'Performance improvements',
            'Energy levels',
            'Mood and mental well-being',
            'Other'
          ],
          required: true,
        },
        {
          id: 'progress_metrics_other',
          type: 'textarea',
          label: 'Please describe other metrics important to you',
          placeholder: 'Enter details here...',
          conditional: { field: 'progress_metrics', value: ['Other'] },
          required: false,
        },
        {
          id: 'tracking_preference',
          type: 'checkbox-group',
          label: 'How do you prefer to track your workouts and progress?',
          options: [
            'Mobile app',
            'Paper workout journal',
            'Wearable fitness tracker',
            'Spreadsheet',
            'Don\'t currently track',
            'Other'
          ],
          required: true,
        },
        {
          id: 'tracking_preference_other',
          type: 'textarea',
          label: 'Please describe other tracking methods you prefer',
          placeholder: 'Enter details here...',
          conditional: { field: 'tracking_preference', value: ['Other'] },
          required: false,
        },
      ]
    });

    // Create the Senior Client Assessment
    const seniorAssessmentForm = await storage.createOnboardingForm({
      workspaceId,
      title: 'Senior Client Assessment Package',
      description: 'Specialized assessment for clients over 65 or with specific mobility considerations.',
      isRequired: false,
      order: 4,
      fields: [
        {
          id: 'section_general',
          type: 'section',
          label: 'General Information',
        },
        {
          id: 'age',
          type: 'number',
          label: 'Age',
          required: true,
          min: 50,
          max: 120,
        },
        {
          id: 'retirement_status',
          type: 'select',
          label: 'Retirement Status',
          options: [
            'Fully retired',
            'Semi-retired/Part-time work',
            'Still working full-time',
            'Other'
          ],
          required: true,
        },
        {
          id: 'living_situation',
          type: 'select',
          label: 'Current Living Situation',
          options: [
            'Independent living - house/apartment',
            'Independent living with family support',
            'Retirement community',
            'Assisted living',
            'Other'
          ],
          required: true,
        },
        {
          id: 'section_health',
          type: 'section',
          label: 'Health & Medical History',
        },
        {
          id: 'chronic_conditions',
          type: 'checkbox-group',
          label: 'Do you have any of these chronic conditions?',
          options: [
            'Arthritis',
            'Osteoporosis/Osteopenia',
            'Hypertension (high blood pressure)',
            'Heart disease',
            'Diabetes (Type 1 or 2)',
            'COPD/Respiratory issues',
            'Balance disorders',
            'Parkinson\'s disease',
            'Post-stroke',
            'Joint replacement',
            'Chronic pain',
            'None of the above',
            'Other'
          ],
          required: true,
        },
        {
          id: 'chronic_conditions_other',
          type: 'textarea',
          label: 'Please describe other chronic conditions',
          placeholder: 'Enter details here...',
          conditional: { field: 'chronic_conditions', value: ['Other'] },
          required: false,
        },
        {
          id: 'joint_replacements',
          type: 'radio',
          label: 'Have you had any joint replacements?',
          options: ['Yes', 'No'],
          required: true,
        },
        {
          id: 'joint_replacements_details',
          type: 'textarea',
          label: 'Please provide details about your joint replacements',
          placeholder: 'Which joints? When was the surgery?',
          conditional: { field: 'joint_replacements', value: 'Yes' },
          required: false,
        },
        {
          id: 'medications_affect_exercise',
          type: 'radio',
          label: 'Are you taking any medications that might affect your exercise response (e.g., beta-blockers, blood thinners)?',
          options: ['Yes', 'No', 'Unsure'],
          required: true,
        },
        {
          id: 'medications_affect_exercise_details',
          type: 'textarea',
          label: 'Please list medications that might affect exercise',
          placeholder: 'Enter medication names and effects if known',
          conditional: { field: 'medications_affect_exercise', value: ['Yes', 'Unsure'] },
          required: false,
        },
        {
          id: 'section_mobility',
          type: 'section',
          label: 'Mobility & Function Assessment',
        },
        {
          id: 'fall_history',
          type: 'radio',
          label: 'Have you experienced any falls in the past year?',
          options: ['No falls', '1 fall', '2 falls', '3 or more falls'],
          required: true,
        },
        {
          id: 'fall_history_details',
          type: 'textarea',
          label: 'Please describe the circumstances of any falls',
          placeholder: 'What caused the fall(s)? Were there any injuries?',
          conditional: { field: 'fall_history', value: ['1 fall', '2 falls', '3 or more falls'] },
          required: false,
        },
        {
          id: 'mobility_aids',
          type: 'checkbox-group',
          label: 'Do you use any mobility aids?',
          options: [
            'None',
            'Cane',
            'Walker',
            'Wheelchair (occasionally)',
            'Wheelchair (primarily)',
            'Other'
          ],
          required: true,
        },
        {
          id: 'mobility_aids_other',
          type: 'textarea',
          label: 'Please describe other mobility aids used',
          placeholder: 'Enter details here...',
          conditional: { field: 'mobility_aids', value: ['Other'] },
          required: false,
        },
        {
          id: 'daily_activities',
          type: 'checkbox-group',
          label: 'Which daily activities do you find challenging?',
          options: [
            'Getting in/out of bed',
            'Getting in/out of chairs',
            'Climbing stairs',
            'Walking for extended periods',
            'Carrying groceries',
            'Reaching overhead',
            'Bending to pick up objects',
            'Dressing (buttons, zippers, etc.)',
            'Bathing/personal care',
            'None of these are challenging',
            'Other'
          ],
          required: true,
        },
        {
          id: 'daily_activities_other',
          type: 'textarea',
          label: 'Please describe other challenging activities',
          placeholder: 'Enter details here...',
          conditional: { field: 'daily_activities', value: ['Other'] },
          required: false,
        },
        {
          id: 'pain_areas',
          type: 'checkbox-group',
          label: 'Do you experience regular pain in any of these areas?',
          options: [
            'No regular pain',
            'Back (upper)',
            'Back (lower)',
            'Neck',
            'Shoulders',
            'Elbows',
            'Wrists/hands',
            'Hips',
            'Knees',
            'Ankles/feet',
            'Other'
          ],
          required: true,
        },
        {
          id: 'pain_areas_other',
          type: 'textarea',
          label: 'Please describe other areas of pain',
          placeholder: 'Enter details here...',
          conditional: { field: 'pain_areas', value: ['Other'] },
          required: false,
        },
        {
          id: 'section_fitness',
          type: 'section',
          label: 'Current Fitness & Activity',
        },
        {
          id: 'current_activity',
          type: 'checkbox-group',
          label: 'What physical activities do you currently participate in?',
          options: [
            'Walking',
            'Light gardening',
            'Swimming/water exercises',
            'Group exercise classes',
            'Light resistance training',
            'Yoga/Tai Chi',
            'Golf',
            'Cycling',
            'Dancing',
            'No regular physical activity',
            'Other'
          ],
          required: true,
        },
        {
          id: 'current_activity_other',
          type: 'textarea',
          label: 'Please describe other physical activities',
          placeholder: 'Enter details here...',
          conditional: { field: 'current_activity', value: ['Other'] },
          required: false,
        },
        {
          id: 'activity_frequency',
          type: 'select',
          label: 'How often do you engage in physical activity?',
          options: [
            'Rarely/Never',
            '1-2 times per month',
            '1-2 times per week',
            '3-4 times per week',
            '5+ times per week'
          ],
          required: true,
        },
        {
          id: 'activity_duration',
          type: 'select',
          label: 'Typical duration of activity sessions',
          options: [
            'Less than 15 minutes',
            '15-30 minutes',
            '30-45 minutes',
            '45-60 minutes',
            'More than 60 minutes'
          ],
          required: true,
        },
        {
          id: 'activity_intensity',
          type: 'select',
          label: 'Typical intensity of your activities',
          options: [
            'Very light (can carry on a full conversation easily)',
            'Light (can carry on a conversation with some effort)',
            'Moderate (can speak in short sentences)',
            'Somewhat hard (can speak a few words at a time)',
            'Hard (cannot speak while exercising)'
          ],
          required: true,
        },
        {
          id: 'section_goals',
          type: 'section',
          label: 'Goals & Preferences',
        },
        {
          id: 'fitness_goals_senior',
          type: 'checkbox-group',
          label: 'What are your primary fitness goals?',
          options: [
            'Improve balance/reduce fall risk',
            'Increase strength for daily activities',
            'Maintain independence',
            'Manage pain',
            'Improve mobility/flexibility',
            'Weight management',
            'Improve cardiovascular health',
            'Social interaction',
            'Cognitive benefits',
            'Other'
          ],
          required: true,
        },
        {
          id: 'fitness_goals_senior_other',
          type: 'textarea',
          label: 'Please describe other fitness goals',
          placeholder: 'Enter details here...',
          conditional: { field: 'fitness_goals_senior', value: ['Other'] },
          required: false,
        },
        {
          id: 'exercise_preferences_senior',
          type: 'checkbox-group',
          label: 'What types of exercise do you enjoy or are interested in?',
          options: [
            'Seated exercises',
            'Standing exercises with support',
            'Walking programs',
            'Water-based exercises',
            'Mind-body (yoga, tai chi)',
            'Light resistance training',
            'Balance training',
            'Stretching/flexibility work',
            'Group activities',
            'One-on-one training',
            'Other'
          ],
          required: true,
        },
        {
          id: 'exercise_preferences_senior_other',
          type: 'textarea',
          label: 'Please describe other exercise preferences',
          placeholder: 'Enter details here...',
          conditional: { field: 'exercise_preferences_senior', value: ['Other'] },
          required: false,
        },
        {
          id: 'section_barriers',
          type: 'section',
          label: 'Barriers & Support',
        },
        {
          id: 'exercise_barriers',
          type: 'checkbox-group',
          label: 'What barriers might prevent you from exercising regularly?',
          options: [
            'Pain or discomfort',
            'Fear of injury',
            'Lack of energy',
            'Transportation issues',
            'Weather constraints',
            'Lack of knowledge about appropriate exercises',
            'Lack of social support',
            'Financial constraints',
            'Time constraints',
            'Other'
          ],
          required: true,
        },
        {
          id: 'exercise_barriers_other',
          type: 'textarea',
          label: 'Please describe other barriers to exercise',
          placeholder: 'Enter details here...',
          conditional: { field: 'exercise_barriers', value: ['Other'] },
          required: false,
        },
        {
          id: 'support_system',
          type: 'checkbox-group',
          label: 'Who might support you in your fitness journey?',
          options: [
            'Spouse/partner',
            'Family members',
            'Friends',
            'Healthcare providers',
            'No support system',
            'Other'
          ],
          required: true,
        },
        {
          id: 'support_system_other',
          type: 'textarea',
          label: 'Please describe other support systems',
          placeholder: 'Enter details here...',
          conditional: { field: 'support_system', value: ['Other'] },
          required: false,
        },
        {
          id: 'section_additional',
          type: 'section',
          label: 'Additional Information',
        },
        {
          id: 'specific_concerns',
          type: 'textarea',
          label: 'Do you have any specific concerns about starting an exercise program?',
          placeholder: 'Please share any concerns or questions you have',
          required: false,
        }
      ]
    });

    res.status(201).json({
      message: 'Form templates created successfully',
      forms: [parqForm, intakeForm, exercisePreferencesForm, seniorAssessmentForm]
    });
  } catch (error: any) {
    console.error('Error creating form templates:', error);
    res.status(500).json({ error: error.message });
  }
}