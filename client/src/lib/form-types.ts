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

export interface FieldConditional {
  field: string;
  value: any;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  conditional?: FieldConditional;
}

export interface TextField extends FormField {
  type: 'text';
  defaultValue?: string;
  maxLength?: number;
}

export interface EmailField extends FormField {
  type: 'email';
  defaultValue?: string;
}

export interface PhoneField extends FormField {
  type: 'phone';
  defaultValue?: string;
}

export interface TextareaField extends FormField {
  type: 'textarea';
  defaultValue?: string;
  rows?: number;
}

export interface NumberField extends FormField {
  type: 'number';
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectField extends FormField {
  type: 'select';
  options: string[];
  defaultValue?: string;
  multiple?: boolean;
}

export interface CheckboxField extends FormField {
  type: 'checkbox';
  defaultChecked?: boolean;
}

export interface CheckboxGroupField extends FormField {
  type: 'checkbox-group';
  options: string[];
  defaultValues?: string[];
}

export interface RadioField extends FormField {
  type: 'radio';
  options: string[];
  defaultValue?: string;
}

export interface DateField extends FormField {
  type: 'date';
  defaultValue?: string;
  min?: string;
  max?: string;
}

export interface TimeField extends FormField {
  type: 'time';
  defaultValue?: string;
}

export interface SectionField extends FormField {
  type: 'section';
}

export interface BooleanField extends FormField {
  type: 'boolean';
  defaultValue?: boolean;
}

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

export interface FormResponse {
  id: number;
  formId: number;
  clientId: number;
  responses: Record<string, any>; // Field ID to response value
  submittedAt: string;
  status: 'draft' | 'submitted' | 'reviewed';
}

export interface CreateFormResponse {
  formId: number;
  clientId: number;
  responses: Record<string, any>;
  status?: 'draft' | 'submitted';
}