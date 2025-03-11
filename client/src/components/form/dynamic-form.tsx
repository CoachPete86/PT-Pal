import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnyFormField, OnboardingForm, FormResponse } from '@/lib/form-types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DynamicFormProps {
  form: OnboardingForm;
  defaultValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  existingResponse?: FormResponse;
  loading?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  form,
  defaultValues = {},
  onSubmit,
  existingResponse,
  loading = false,
}) => {
  const [formSchema, setFormSchema] = useState<z.ZodObject<any>>();
  const [formDefaultValues, setFormDefaultValues] = useState<Record<string, any>>({});
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  // Build dynamic Zod schema based on form fields
  useEffect(() => {
    if (!form) return;

    let schemaMap: Record<string, any> = {};
    let initialValues: Record<string, any> = {};
    let initialVisibility: Record<string, boolean> = {};

    form.fields.forEach((field) => {
      // Skip section fields from validation
      if (field.type === 'section') {
        return;
      }

      // Set initial field visibility
      const isConditional = !!field.conditional;
      initialVisibility[field.id] = !isConditional;

      // Define field schema based on type
      let fieldSchema;
      
      switch (field.type) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'phone':
          fieldSchema = z.string();
          if (field.required) fieldSchema = fieldSchema.min(1, { message: 'This field is required' });
          if (field.type === 'email') fieldSchema = z.string().email({ message: 'Invalid email address' });
          initialValues[field.id] = defaultValues[field.id] || 
                                    existingResponse?.responses[field.id] || 
                                    '';
          break;
          
        case 'number':
          fieldSchema = z.number().optional();
          if (field.required) fieldSchema = z.number();
          initialValues[field.id] = defaultValues[field.id] || 
                                    existingResponse?.responses[field.id] || 
                                    undefined;
          break;
          
        case 'select':
          fieldSchema = z.string();
          if (field.required) fieldSchema = fieldSchema.min(1, { message: 'This field is required' });
          initialValues[field.id] = defaultValues[field.id] || 
                                    existingResponse?.responses[field.id] || 
                                    '';
          break;
          
        case 'checkbox':
          fieldSchema = z.boolean().optional();
          if (field.required) fieldSchema = z.boolean();
          initialValues[field.id] = defaultValues[field.id] || 
                                    existingResponse?.responses[field.id] || 
                                    false;
          break;
          
        case 'checkbox-group':
          fieldSchema = z.array(z.string()).optional();
          if (field.required) fieldSchema = z.array(z.string()).min(1, { message: 'Select at least one option' });
          initialValues[field.id] = defaultValues[field.id] || 
                                    existingResponse?.responses[field.id] || 
                                    [];
          break;
          
        case 'radio':
          fieldSchema = z.string();
          if (field.required) fieldSchema = fieldSchema.min(1, { message: 'This field is required' });
          initialValues[field.id] = defaultValues[field.id] || 
                                    existingResponse?.responses[field.id] || 
                                    '';
          break;
          
        case 'date':
          fieldSchema = z.date().optional();
          if (field.required) fieldSchema = z.date();
          initialValues[field.id] = defaultValues[field.id] || 
                                    (existingResponse?.responses[field.id] ? new Date(existingResponse.responses[field.id]) : undefined);
          break;
          
        case 'time':
          fieldSchema = z.string();
          if (field.required) fieldSchema = fieldSchema.min(1, { message: 'This field is required' });
          initialValues[field.id] = defaultValues[field.id] || 
                                    existingResponse?.responses[field.id] || 
                                    '';
          break;
          
        case 'boolean':
          fieldSchema = z.boolean().optional();
          if (field.required) fieldSchema = z.boolean();
          initialValues[field.id] = defaultValues[field.id] || 
                                    existingResponse?.responses[field.id] || 
                                    false;
          break;
          
        default:
          fieldSchema = z.any();
          initialValues[field.id] = defaultValues[field.id] || existingResponse?.responses[field.id] || undefined;
      }

      // Add the field schema to our schema map
      schemaMap[field.id] = fieldSchema;
    });

    setFormSchema(z.object(schemaMap));
    setFormDefaultValues(initialValues);
    setVisibleFields(initialVisibility);
  }, [form, defaultValues, existingResponse]);

  // Create the form once schema is ready
  const formMethods = useForm<Record<string, any>>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    defaultValues: formDefaultValues,
    mode: 'onBlur',
  });

  // Update field visibility based on form values
  useEffect(() => {
    if (!form) return;

    const subscription = formMethods.watch((values) => {
      const newVisibility = { ...visibleFields };

      form.fields.forEach((field) => {
        if (field.conditional) {
          const conditionField = field.conditional.field;
          const conditionValue = field.conditional.value;
          const currentValue = values[conditionField];

          // Check if condition is met
          let conditionMet = false;
          
          if (Array.isArray(conditionValue) && Array.isArray(currentValue)) {
            // Check if any value in conditionValue is in currentValue
            conditionMet = conditionValue.some(val => currentValue.includes(val));
          } else if (Array.isArray(currentValue)) {
            // Check if single conditionValue is in currentValue array
            conditionMet = currentValue.includes(conditionValue);
          } else {
            // Simple equality check
            conditionMet = currentValue === conditionValue;
          }

          newVisibility[field.id] = conditionMet;
        }
      });

      setVisibleFields(newVisibility);
    });

    return () => subscription.unsubscribe();
  }, [form, formMethods, visibleFields]);

  // If we don't have a schema yet, show loading state
  if (!formSchema) {
    return <div>Loading form...</div>;
  }

  // Handle form submission
  const handleSubmit = formMethods.handleSubmit((data) => {
    onSubmit(data);
  });

  // Render form fields dynamically
  const renderField = (field: AnyFormField) => {
    // Check field visibility
    if (!visibleFields[field.id] && field.type !== 'section') {
      return null;
    }

    switch (field.type) {
      case 'section':
        return (
          <div key={field.id} className="my-6">
            <h3 className="text-lg font-semibold mb-2">{field.label}</h3>
            <hr className="mb-4" />
          </div>
        );

      case 'text':
      case 'email':
      case 'phone':
        return (
          <FormField
            key={field.id}
            control={formMethods.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input 
                    {...formField} 
                    placeholder={field.placeholder} 
                    type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'} 
                  />
                </FormControl>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'textarea':
        return (
          <FormField
            key={field.id}
            control={formMethods.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Textarea 
                    {...formField} 
                    placeholder={field.placeholder} 
                    rows={(field as any).rows || 3} 
                  />
                </FormControl>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'number':
        return (
          <FormField
            key={field.id}
            control={formMethods.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...formField} 
                    onChange={(e) => formField.onChange(e.target.valueAsNumber || undefined)}
                    min={(field as any).min}
                    max={(field as any).max}
                    step={(field as any).step || 1}
                    placeholder={field.placeholder}
                  />
                </FormControl>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            key={field.id}
            control={formMethods.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                <Select 
                  onValueChange={formField.onChange} 
                  defaultValue={formField.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || 'Select an option'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(field as any).options.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'checkbox':
        return (
          <FormField
            key={field.id}
            control={formMethods.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                  {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'checkbox-group':
        return (
          <FormField
            key={field.id}
            control={formMethods.control}
            name={field.id}
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                  {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                </div>
                <div className="grid gap-2">
                  {(field as any).options.map((option: string) => (
                    <Controller
                      key={option}
                      name={field.id}
                      control={formMethods.control}
                      render={({ field: formField }) => {
                        const values = formField.value || [];
                        return (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-${option}`}
                              checked={values.includes(option)}
                              onCheckedChange={(checked) => {
                                const newValues = checked
                                  ? [...values, option]
                                  : values.filter((val: string) => val !== option);
                                formField.onChange(newValues);
                              }}
                            />
                            <label
                              htmlFor={`${field.id}-${option}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option}
                            </label>
                          </div>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'radio':
        return (
          <FormField
            key={field.id}
            control={formMethods.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="space-y-3">
                <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                    className="flex flex-col space-y-1"
                  >
                    {(field as any).options.map((option: string) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                        <label htmlFor={`${field.id}-${option}`}>{option}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'date':
        return (
          <FormField
            key={field.id}
            control={formMethods.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground"
                        )}
                      >
                        {formField.value ? (
                          format(formField.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value}
                      onSelect={formField.onChange}
                      disabled={(date) => {
                        const minDate = (field as any).min ? new Date((field as any).min) : undefined;
                        const maxDate = (field as any).max ? new Date((field as any).max) : undefined;
                        
                        if (minDate && date < minDate) return true;
                        if (maxDate && date > maxDate) return true;
                        return false;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'boolean':
        return (
          <FormField
            key={field.id}
            control={formMethods.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                  {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                </div>
                <FormControl>
                  <Switch
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Form {...formMethods}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {form.description && (
          <div className="mb-6">
            <p className="text-sm text-gray-500">{form.description}</p>
          </div>
        )}

        {form.fields.map(renderField)}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="min-w-[150px]">
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DynamicForm;