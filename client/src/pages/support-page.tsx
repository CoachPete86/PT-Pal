
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { MessageSquare, FileText, Video, Mail, Phone, HelpCircle } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I get started with PTpal?",
      answer: "Getting started is simple. After signing up, you'll be guided through a quick onboarding process to set up your account. You can then start adding clients, creating workout plans, and exploring all the features available to you. We also offer free onboarding calls for new users to help you get the most out of the platform."
    },
    {
      question: "Can I migrate my existing client data to PTpal?",
      answer: "Yes, we offer data migration services to help you transfer client information, workout history, and other relevant data from your current systems to PTpal. Contact our support team for assistance with migration."
    },
    {
      question: "How secure is my client data on PTpal?",
      answer: "We take data security very seriously. PTpal uses industry-standard encryption, secure servers, and regular security audits to ensure your data remains protected. We are also fully GDPR compliant to protect the privacy of your clients."
    },
    {
      question: "Can clients access their workout plans on mobile?",
      answer: "Absolutely! The platform offers a native-quality mobile experience for your clients. They can access workout plans, nutrition guides, and progress tracking on any device with push notifications for reminders and updates."
    },
    {
      question: "How accurate is the AI movement analysis?",
      answer: "Our movement analysis uses computer vision technology to provide detailed form feedback. The system can identify key movement patterns and common errors, providing blueprint-style visualisation and specific correction points for improving technique."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards, as well as PayPal. For annual plans, we can also arrange direct bank transfers. All payments are processed securely through our payment providers."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-centre mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Support & Help Centre</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions, access support resources, or contact our team for personalised assistance.
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <Input 
                placeholder="Search for help articles..."
                className="pr-10 h-12"
              />
              <HelpCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-centre gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="mb-4 text-muted-foreground">Get instant help from our support team with our live chat function.</p>
              <p className="text-sm text-muted-foreground mb-6">Available Mon-Fri, 9am-5pm GMT</p>
              <Button className="w-full">Start Chat</Button>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-centre gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <CardTitle>Email Support</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="mb-4 text-muted-foreground">Send us an email and we'll get back to you within 24 hours.</p>
              <p className="text-sm mb-6">support@ptpal.com</p>
              <Button variant="outline" className="w-full">Send Email</Button>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-centre gap-3">
              <Phone className="h-6 w-6 text-primary" />
              <CardTitle>Phone Support</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="mb-4 text-muted-foreground">Schedule a call with our technical support team.</p>
              <p className="text-sm text-muted-foreground mb-6">For complex technical issues or guided setup</p>
              <Button variant="outline" className="w-full">Book a Call</Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="mb-16">
          <div className="flex justify-centre mb-8">
            <TabsList>
              <TabsTrigger value="faq">FAQs</TabsTrigger>
              <TabsTrigger value="guides">Getting Started</TabsTrigger>
              <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="faq">
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="text-centre mt-8">
                <Link href="/faqs">
                  <Button variant="outline">View all FAQs</Button>
                </Link>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="guides">
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Card>
                <CardHeader className="flex flex-row items-centre gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Account Setup Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Complete walkthrough of setting up your PTpal account and trainer profile.</p>
                  <Button variant="outline" size="sm">Read Guide</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-centre gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Client Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Learn how to add, organise, and manage clients effectively.</p>
                  <Button variant="outline" size="sm">Read Guide</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-centre gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">AI Workout Creation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Master the workout generator to create personalised plans in seconds.</p>
                  <Button variant="outline" size="sm">Read Guide</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-centre gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Billing & Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Everything you need to know about managing your PTpal subscription.</p>
                  <Button variant="outline" size="sm">Read Guide</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="videos">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card>
                <div className="aspect-video bg-muted relative rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-centre justify-centre">
                    <Video className="h-10 w-10 text-primary/70" />
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-1">Getting Started Tutorial</h3>
                  <p className="text-sm text-muted-foreground">5:42</p>
                </CardContent>
              </Card>
              
              <Card>
                <div className="aspect-video bg-muted relative rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-centre justify-centre">
                    <Video className="h-10 w-10 text-primary/70" />
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-1">Creating Workout Plans</h3>
                  <p className="text-sm text-muted-foreground">7:15</p>
                </CardContent>
              </Card>
              
              <Card>
                <div className="aspect-video bg-muted relative rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-centre justify-centre">
                    <Video className="h-10 w-10 text-primary/70" />
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-1">Movement Analysis Tutorial</h3>
                  <p className="text-sm text-muted-foreground">8:33</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-muted rounded-lg p-8">
          <div className="max-w-3xl mx-auto text-centre">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Need additional help?</h2>
            <p className="mb-6">
              Our support team is here to help you get the most out of PTpal. Don't hesitate to reach out with any questions.
            </p>
            <div className="flex flex-wrap justify-centre gap-4">
              <Button>Contact Support</Button>
              <Link href="/demo">
                <Button variant="outline">Book a Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
