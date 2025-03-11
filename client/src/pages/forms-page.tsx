import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { OnboardingForm, FormResponse } from '@/lib/form-types';
import DynamicForm from '@/components/form/dynamic-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Clipboard, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/ui/loading-states';

export default function FormsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('forms');

  // Fetch all available forms
  const { 
    data: forms, 
    isLoading: isLoadingForms,
    error: formsError 
  } = useQuery({
    queryKey: ['/api/forms'],
    enabled: !!user,
  });

  // Fetch the selected form if one is selected
  const {
    data: selectedForm,
    isLoading: isLoadingSelectedForm,
  } = useQuery({
    queryKey: ['/api/forms', selectedFormId],
    enabled: !!selectedFormId,
  });

  // Fetch form responses for the current user
  const {
    data: responses,
    isLoading: isLoadingResponses,
  } = useQuery({
    queryKey: ['/api/clients', user?.id, 'responses'],
    enabled: !!user && user.role === 'client',
  });

  // Mutation for submitting form responses
  const submitFormMutation = useMutation({
    mutationFn: async (data: { formId: number; responses: Record<string, any> }) => {
      return apiRequest('/api/forms/responses', {
        method: 'POST',
        body: JSON.stringify({
          formId: data.formId,
          clientId: user?.id,
          responses: data.responses,
          status: 'submitted',
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Form submitted',
        description: 'Your form response has been submitted successfully.',
        variant: 'default',
      });
      setSelectedFormId(null);
      // Invalidate the responses query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/clients', user?.id, 'responses'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to submit form: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Function to create template forms (admin only)
  const createTemplatesMutation = useMutation({
    mutationFn: async (workspaceId: number) => {
      return apiRequest('/api/forms/templates/create', {
        method: 'POST',
        body: JSON.stringify({ workspaceId }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Templates created',
        description: 'Form templates have been created successfully.',
        variant: 'default',
      });
      // Invalidate the forms query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create templates: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const handleFormSubmit = (formData: Record<string, any>) => {
    if (!selectedFormId || !user) return;
    
    submitFormMutation.mutate({
      formId: selectedFormId,
      responses: formData,
    });
  };

  // Handle creating template forms
  const handleCreateTemplates = () => {
    if (!user || !['admin', 'trainer'].includes(user.role)) return;
    
    // Use a default workspace ID of 1 if not available
    const workspaceId = 1;
    createTemplatesMutation.mutate(workspaceId);
  };

  // Check if a form has been completed by the user
  const hasCompletedForm = (formId: number): FormResponse | undefined => {
    if (!responses) return undefined;
    return responses.find((response: FormResponse) => response.formId === formId);
  };

  // Render loading state
  if (isLoadingForms) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState variant="pulse" size="lg" />
      </div>
    );
  }

  // Render error state
  if (formsError) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Forms</h2>
        <p className="text-gray-500 mb-4">
          {(formsError as Error).message || 'An error occurred while loading the forms.'}
        </p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/forms'] })}>
          Try Again
        </Button>
      </div>
    );
  }

  // When viewing a specific form
  if (selectedFormId && selectedForm) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedFormId(null)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forms
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>{selectedForm.title}</CardTitle>
            {selectedForm.description && (
              <CardDescription>{selectedForm.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <DynamicForm
              form={selectedForm}
              onSubmit={handleFormSubmit}
              loading={submitFormMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // List of forms and responses
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Forms & Assessments</h1>
      <p className="text-gray-500 mb-6">
        Complete the required forms for your fitness assessment and training program.
      </p>

      {user?.role === 'trainer' && (
        <div className="mb-6">
          <Button onClick={handleCreateTemplates} disabled={createTemplatesMutation.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            {createTemplatesMutation.isPending ? 'Creating Templates...' : 'Create Form Templates'}
          </Button>
        </div>
      )}

      <Tabs defaultValue="forms" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="forms">Available Forms</TabsTrigger>
          {user?.role === 'client' && (
            <TabsTrigger value="responses">My Responses</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="forms">
          {forms && forms.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {forms.map((form: OnboardingForm) => {
                const completed = hasCompletedForm(form.id);
                return (
                  <Card key={form.id} className="relative">
                    {completed && (
                      <Badge className="absolute top-4 right-4 bg-green-500">
                        Completed
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-start">
                        <FileText className="mr-2 h-5 w-5 mt-1 flex-shrink-0" />
                        <span>{form.title}</span>
                      </CardTitle>
                      <CardDescription>
                        {form.description || 'Complete this form as part of your assessment.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        {form.fields.length} question{form.fields.length !== 1 ? 's' : ''}
                        {form.isRequired && ' • Required'}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {completed ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Submitted on {new Date(completed.submittedAt).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span></span>
                      )}
                      <Button 
                        onClick={() => setSelectedFormId(form.id)}
                        variant={completed ? "outline" : "default"}
                      >
                        {completed ? 'View Response' : 'Fill Out Form'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clipboard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Forms Available</h3>
              <p className="text-gray-500">
                There are no forms available for you to complete at the moment.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="responses">
          {isLoadingResponses ? (
            <div className="flex items-center justify-center py-12">
              <LoadingState variant="pulse" />
            </div>
          ) : responses && responses.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {responses.map((response: FormResponse) => {
                const form = forms?.find((f: OnboardingForm) => f.id === response.formId);
                if (!form) return null;
                
                return (
                  <AccordionItem key={response.id} value={`response-${response.id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>{form.title}</span>
                        <Badge className="ml-4 bg-green-500">Completed</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 bg-gray-50 rounded-md">
                        <h4 className="font-medium mb-4">Your Responses</h4>
                        <dl className="space-y-4">
                          {Object.entries(response.responses).map(([fieldId, value]) => {
                            const field = form.fields.find(f => f.id === fieldId);
                            if (!field) return null;
                            
                            return (
                              <div key={fieldId} className="grid grid-cols-3 gap-4">
                                <dt className="font-medium text-gray-600">{field.label}</dt>
                                <dd className="col-span-2">
                                  {displayValue(value, field.type)}
                                </dd>
                              </div>
                            );
                          })}
                        </dl>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <Clipboard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Responses Yet</h3>
              <p className="text-gray-500">
                You haven't submitted any forms yet. Go to the "Available Forms" tab to complete forms.
              </p>
              <Button 
                className="mt-4"
                variant="outline"
                onClick={() => setActiveTab('forms')}
              >
                View Available Forms
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to display form values appropriately
function displayValue(value: any, type: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">Not provided</span>;
  }

  switch (type) {
    case 'boolean':
      return value ? 'Yes' : 'No';
      
    case 'checkbox-group':
    case 'radio':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return value;
      
    case 'date':
      return new Date(value).toLocaleDateString();
      
    default:
      return value.toString();
  }
}