import { Link } from "wouter";
import { Instagram, Facebook, Twitter, BarChart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold">
            <BarChart className="h-8 w-8 text-primary" />
            <span>PTpal</span>
          </div>
          <p className="text-muted-foreground mt-2">
            The Ultimate Personal Training Management Platform
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">About PTpal</h3>
            <p className="text-muted-foreground">
              Your all-in-one solution for managing personal training clients,
              creating workout plans, and growing your coaching business.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#services">
                  <a className="text-muted-foreground hover:text-primary">
                    Features
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/#about">
                  <a className="text-muted-foreground hover:text-primary">
                    About
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="text-muted-foreground hover:text-primary">
                    Pricing
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/auth">
                  <a className="text-muted-foreground hover:text-primary">
                    Sign Up
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Email: support@ptpal.io</li>
              <li>Help Center</li>
              <li>Documentation</li>
              <li>PT Resources</li>
            </ul>
          </div>

          <div>
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

        <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PTpal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
