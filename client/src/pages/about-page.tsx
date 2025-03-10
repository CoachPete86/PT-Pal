
import React from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AboutSection from "@/components/about-section";
import MainLayout from "@/components/main-layout";

export default function AboutPage() {
  return (
    <MainLayout>
      <Helmet>
        <title>About - Coach Pete AI</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold text-center mb-8">About Coach Pete AI</h1>
        
        <AboutSection />
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-6">Our Mission</h2>
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6">
              <p className="text-lg leading-relaxed">
                At Coach Pete AI, our mission is to empower fitness professionals with cutting-edge AI tools
                that enhance client relationships, streamline business operations, and deliver exceptional
                fitness experiences. We believe technology should amplify your expertise, not replace it.
              </p>
              <div className="flex justify-center mt-6">
                <Button>Get Started Today</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-6">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary text-2xl font-bold">PR</span>
                </div>
                <h3 className="text-xl font-bold">Pete Ryan</h3>
                <p className="text-muted-foreground">Founder & Head Coach</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary text-2xl font-bold">AI</span>
                </div>
                <h3 className="text-xl font-bold">AI Development</h3>
                <p className="text-muted-foreground">Technical Team</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary text-2xl font-bold">CS</span>
                </div>
                <h3 className="text-xl font-bold">Client Success</h3>
                <p className="text-muted-foreground">Support Team</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
