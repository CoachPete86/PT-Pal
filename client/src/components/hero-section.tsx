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

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/50 text-primary-foreground bg-primary/20">
              New AI-powered Features
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              The Ultimate Platform for{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Fitness Professionals
              </span>
            </h1>
            
            <p className="text-xl mb-8 text-gray-200">
              Transform your coaching business with AI-powered tools, comprehensive client management, 
              and automated workflows — all designed to help you deliver exceptional results and scale your fitness business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="text-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg border-2 border-slate-800 dark:border-slate-200 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
              <span>✓ No credit card required</span>
              <span>•</span>
              <span>✓ 14-day free trial</span>
              <span>•</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-white/10"
            >
              <Brain className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI Workout Generator</h3>
              <p className="text-gray-300 text-sm">Create personalized workout plans in seconds with our advanced AI engine.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-white/10"
            >
              <Camera className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Movement Analysis</h3>
              <p className="text-gray-300 text-sm">Upload videos for AI-powered form analysis with visual feedback.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-white/10"
            >
              <Utensils className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Meal Plan Generator</h3>
              <p className="text-gray-300 text-sm">Create custom nutrition plans tailored to your clients' goals and preferences.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-white/10"
            >
              <Award className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">White-Label Branding</h3>
              <p className="text-gray-300 text-sm">Fully customize the platform with your logo, colors and brand identity.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
