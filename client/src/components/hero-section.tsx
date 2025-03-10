import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Camera, Utensils, Award } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative min-h-[700px] flex items-center">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center grayscale"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48")', // Dramatic B&W gym environment with deep shadows
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-black/60" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <Badge className="mb-4 text-sm py-1 font-heading">
            Trusted by fitness professionals worldwide
          </Badge>
          <h1 className="hero-text text-white mb-6">
            AI-powered platform for fitness professionals
          </h1>
          <p className="hero-subtitle text-gray-300 mb-8">
            Streamline your coaching business with our comprehensive suite of
            tools. Create personalised workout plans, analyse movement form, and
            generate meal plans—all powered by AI.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth">
              <Button size="lg" className="rounded-full px-8 bg-blue-600 text-white hover:bg-blue-700 font-heading font-bold shadow-lg tracking-wide">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/features">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 text-white border-white bg-transparent hover:bg-white/20 font-heading font-bold tracking-wide"
              >
                Explore Features
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-2">
              <Brain className="text-primary h-6 w-6" />
              <span className="text-gray-300 font-heading font-medium tracking-wide text-sm">AI WORKOUT PLANNING</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="text-primary h-6 w-6" />
              <span className="text-gray-300 font-heading font-medium tracking-wide text-sm">MOVEMENT ANALYSIS</span>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="text-primary h-6 w-6" />
              <span className="text-gray-300 font-heading font-medium tracking-wide text-sm">NUTRITION GUIDANCE</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="text-primary h-6 w-6" />
              <span className="text-gray-300 font-heading font-medium tracking-wide text-sm">CLIENT MANAGEMENT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}