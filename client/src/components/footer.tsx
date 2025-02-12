import { Link } from "wouter";
import { Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Coach Pete Ryan</h3>
            <p className="text-muted-foreground">
              Professional personal trainer dedicated to helping you achieve
              your fitness goals through expert movement and strength training.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#services">
                  <a className="text-muted-foreground hover:text-primary">
                    Services
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
                <Link href="/auth">
                  <a className="text-muted-foreground hover:text-primary">
                    Member Login
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Email: pete@coachpeteryan.com</li>
              <li>Phone: 07308 518428</li>
              <li>Training Location:</li>
              <li className="pl-4">PureGym West Byfleet</li>
              <li>Business Address:</li>
              <li className="pl-4">4 Mill Green Lane</li>
              <li className="pl-4">Hatfield, AL9 5FD</li>
              <li className="pl-4">United Kingdom</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Coach Pete Ryan. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
