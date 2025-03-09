import { Link } from "wouter";
import { Instagram, Facebook, Twitter, BarChart, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-muted">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter / CTA Section */}
        <div className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Get Expert Fitness Business Tips</h3>
              <p className="text-muted-foreground">
                Subscribe to our newsletter for the latest updates, business growth strategies, and exclusive content.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary flex-grow"
              />
              <Button className="whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold mb-4 md:mb-0">
            <BarChart className="h-8 w-8 text-primary" />
            <span>PTpal</span>
          </div>
          
          <p className="text-muted-foreground text-center md:text-right max-w-md">
            The ultimate AI-powered platform for fitness professionals to manage clients, 
            create custom programs, and grow their business.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          <div>
            <h3 className="font-bold text-lg mb-4">About PTpal</h3>
            <p className="text-muted-foreground mb-4">
              Empowering fitness professionals with intelligent tools to deliver exceptional 
              client experiences and build successful businesses.
            </p>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@ptpal.io</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>New York, NY</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link className="text-muted-foreground hover:text-primary" href="/services">
                  Features
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground hover:text-primary" href="/pricing">
                  Pricing
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground hover:text-primary" href="/features">
                  Feature Comparison
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground hover:text-primary" href="/demo">
                  Request a Demo
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground hover:text-primary" href="/#about">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">AI Features</h4>
            <ul className="space-y-2">
              <li>
                <Link className="text-muted-foreground hover:text-primary" href="/services#ai-workout-generator">
                  Workout Generator
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground hover:text-primary" href="/services#movement-analysis">
                  Movement Analysis
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground hover:text-primary" href="/services#meal-planning">
                  Meal Plan Creator
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground hover:text-primary" href="/services#content-generator">
                  Content Generator
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground hover:text-primary" href="/services#progress-tracking">
                  Progress Analytics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 mb-6">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">Blog</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">PT Resources</a>
              </li>
            </ul>
            
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PTpal. All rights reserved.</p>
          
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
