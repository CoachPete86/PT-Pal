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
            'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48")' // Dramatic B&W gym environment with deep shadows
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 to-black/80" />
      </div>

      <motion.div
        className="container relative z-10 mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Badge className="mb-4" variant="outline">
              Personal Training Software
            </Badge>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            The Smart Way to Manage Your Fitness Business
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            All-in-one platform for fitness professionals to create workouts, manage clients, and grow their business.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button size="lg" asChild className="flex items-center justify-center h-12 px-6">
              <Link href="/signup" className="flex items-center justify-center w-full">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="flex items-center justify-center h-12 px-6">
              <Link href="/about" className="flex items-center justify-center w-full">Learn More</Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}