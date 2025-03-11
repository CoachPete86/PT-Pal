// Form field types
export type FormFieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'phone' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'checkbox-group' 
  | 'radio' 
  | 'date' 
  | 'time' 
  | 'section' 
  | 'boolean';

// Definition of a conditional for form fields
export interface FieldConditional {
  field: string;
  value: any;
}

// Base field interface
export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  conditional?: FieldConditional;
}

// Text field (single line)
export interface TextField extends FormField {
  type: 'text';
  defaultValue?: string;
  maxLength?: number;
}

// Email field
export interface EmailField extends FormField {
  type: 'email';
  defaultValue?: string;
}

// Phone field
export interface PhoneField extends FormField {
  type: 'phone';
  defaultValue?: string;
}

// Textarea field (multi-line)
export interface TextareaField extends FormField {
  type: 'textarea';
  defaultValue?: string;
  rows?: number;
}

// Number field
export interface NumberField extends FormField {
  type: 'number';
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

// Select field (dropdown)
export interface SelectField extends FormField {
  type: 'select';
  options: string[];
  defaultValue?: string;
  multiple?: boolean;
}

// Checkbox field (single)
export interface CheckboxField extends FormField {
  type: 'checkbox';
  defaultChecked?: boolean;
}

// Checkbox group field
export interface CheckboxGroupField extends FormField {
  type: 'checkbox-group';
  options: string[];
  defaultValues?: string[];
}

// Radio field
export interface RadioField extends FormField {
  type: 'radio';
  options: string[];
  defaultValue?: string;
}

// Date field
export interface DateField extends FormField {
  type: 'date';
  defaultValue?: string;
  min?: string;
  max?: string;
}

// Time field
export interface TimeField extends FormField {
  type: 'time';
  defaultValue?: string;
}

// Section field (for grouping)
export interface SectionField extends FormField {
  type: 'section';
}

// Boolean field (yes/no)
export interface BooleanField extends FormField {
  type: 'boolean';
  defaultValue?: boolean;
}

// Union type of all field types
export type AnyFormField =
  | TextField
  | EmailField
  | PhoneField
  | TextareaField
  | NumberField
  | SelectField
  | CheckboxField
  | CheckboxGroupField
  | RadioField
  | DateField
  | TimeField
  | SectionField
  | BooleanField;

// Interface for an onboarding form
export interface OnboardingForm {
  id: number;
  workspaceId: number;
  title: string;
  description?: string;
  fields: AnyFormField[];
  isRequired: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Interface for a form response
export interface FormResponse {
  id: number;
  formId: number;
  clientId: number;
  responses: Record<string, any>; // Field ID to response value
  submittedAt: string;
  status: 'draft' | 'submitted' | 'reviewed';
}

// Type for creating a new form response
export interface CreateFormResponse {
  formId: number;
  clientId: number;
  responses: Record<string, any>;
  status?: 'draft' | 'submitted';
}