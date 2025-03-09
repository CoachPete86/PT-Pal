import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => setIsOpen(false);

  // Different navigation options based on authentication status
  const publicNavItems = [
    { title: "Features", path: "/features" },
    { title: "Services", path: "/services" },
    { title: "Pricing", path: "/pricing" },
    { title: "Demo", path: "/demo" },
  ];
  
  const authenticatedNavItems = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Clients", path: "/clients" },
    { title: "Workouts", path: "/workout-features" },
    { title: "Movement Analysis", path: "/movement-analysis" },
    { title: "Meal Plans", path: "/meal-plan" },
    { title: "Content", path: "/content-generator" },
    { title: "Settings", path: "/settings" },
  ];
  
  // Use the appropriate navigation items based on authentication status
  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-centre justify-between">
        <div className="flex items-centre gap-6">
          <Link href="/" className="font-bold text-xl mr-6">
            PTpal
          </Link>
          <nav className="hidden md:flex items-centre gap-6">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.path}
                className={`text-sm font-medium transition-colours hover:text-primary ${
                  location === item.path
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-centre gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="default">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/auth?tab=login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button variant="default">Sign Up</Button>
              </Link>
            </>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.path}
                    onClick={closeSheet}
                    className={`text-lg font-medium transition-colours hover:text-primary ${
                      location === item.path
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <Link href="/dashboard" onClick={closeSheet}>
                    <Button className="w-full" variant="default">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth?tab=login" onClick={closeSheet}>
                      <Button className="w-full" variant="outline">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/auth?tab=register" onClick={closeSheet}>
                      <Button className="w-full" variant="default">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}