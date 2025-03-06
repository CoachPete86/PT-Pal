import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { motion } from "framer-motion";
import {
  BarChart,
  BookOpen,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "./notification-center";
import { UniversalSearch } from "./universal-search";

const mainNavItems = [
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/content-generator", label: "Content" },
];

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const id = href.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      // Set the URL without triggering navigation
      window.history.pushState(null, "", href);
    } else {
      setLocation(href);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                {/* We use the default icon since branding is not directly available in User type */}
                <BarChart className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">{"PTpal"}</span>
              </div>
            </Link>
          </div>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-6">
              {mainNavItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-4">
                  <UniversalSearch />
                  <NotificationCenter />
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {user.username}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <div className="flex items-center cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <div className="flex items-center cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/documents">
                          <div className="flex items-center cursor-pointer">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Documents
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {mainNavItems.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          className="flex items-center py-2 text-sm font-medium"
                          onClick={(e) => {
                            handleNavClick(e, item.href);
                            setIsOpen(false);
                          }}
                        >
                          {item.label}
                        </a>
                      ))}
                      <Link href="/dashboard">
                        <div
                          className="flex items-center py-2 text-sm font-medium text-primary cursor-pointer"
                          onClick={() => setIsOpen(false)}
                        >
                          Dashboard
                        </div>
                      </Link>
                      <Link href="/settings">
                        <div
                          className="flex items-center py-2 text-sm font-medium cursor-pointer"
                          onClick={() => setIsOpen(false)}
                        >
                          Settings
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          logoutMutation.mutate();
                          setIsOpen(false);
                        }}
                        disabled={logoutMutation.isPending}
                        className="flex w-full items-center py-2 text-sm font-medium text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <Link href="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
