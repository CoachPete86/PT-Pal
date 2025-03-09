import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "./notification-center";
import { UniversalSearch } from "./universal-search";
import {
  Apple,
  BarChart,
  Home,
  UserCircle,
  Settings,
  LogOut,
  Calendar,
  Users,
  Dumbbell,
  Video,
  Bot,
  Utensils,
  Volume2,
  FileText,
  Smartphone,
  Menu,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) {
    return null;
  }

  interface NavItem {
    title: string;
    href?: string;
    icon?: React.ElementType;
    active?: boolean;
    type?: string;
    items?: NavItem[];
  }

  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      active: location === "/dashboard",
    },
    {
      title: "Clients",
      href: "/clients",
      icon: Users,
      active: location === "/clients",
    },
    {
      title: "Sessions",
      href: "/sessions",
      icon: Calendar,
      active: location === "/sessions",
    },
    { type: "separator", title: "Section Divider" },
    {
      title: "AI Training Tools",
      type: "group",
      items: [
        {
          title: "Workout Generator",
          href: "/workout-features",
          icon: Dumbbell,
          active: location === "/workout-features",
        },
        {
          title: "Movement Analysis",
          href: "/movement-analysis",
          icon: Video,
          active: location === "/movement-analysis",
        },
        {
          title: "Voice Coach",
          href: "/workout-features",
          icon: Volume2,
          active: false,
        },
        {
          title: "Motivation Mascot",
          href: "/workout-features",
          icon: Bot,
          active: false,
        },
        {
          title: "Nutrition Analysis",
          href: "/workout-features",
          icon: Utensils,
          active: false,
        },
        {
          title: "Meal Plan Generator",
          href: "/meal-plan",
          icon: Apple,
          active: location === "/meal-plan",
        },
      ],
    },
    { type: "separator", title: "Content Divider" },
    {
      title: "Content & Documents",
      type: "group",
      items: [
        {
          title: "Social Content",
          href: "/content-generator",
          icon: Smartphone,
          active: location === "/content-generator",
        },
        {
          title: "Documents",
          href: "/documents",
          icon: FileText,
          active: location === "/documents",
        },
      ],
    },
    { type: "separator", title: "Settings Divider" },
    {
      title: "Account",
      href: "/settings",
      icon: Settings,
      active: location === "/settings",
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-border/50 p-4">
            <Link href="/dashboard">
              <div className="flex cursor-pointer items-center gap-2">
                <BarChart className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">PTpal</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="pt-4">
            <SidebarMenu>
              {navigationItems.map((item, index) => {
                if (item.type === "separator") {
                  return <hr key={index} className="my-2 border-t border-border/50" />;
                }

                if (item.type === "group") {
                  return (
                    <div key={index} className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.title}
                      </div>
                      <SidebarMenu>
                        {item.items?.map((subItem, subIndex) => (
                          <SidebarMenuItem key={`${index}-${subIndex}`}>
                            {subItem.href && (
                              <Link href={subItem.href}>
                                <SidebarMenuButton 
                                  data-active={subItem.active} 
                                  className="w-full justify-start gap-2"
                                >
                                  {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                  <span>{subItem.title}</span>
                                </SidebarMenuButton>
                              </Link>
                            )}
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </div>
                  );
                }

                return (
                  <SidebarMenuItem key={index}>
                    {item.href && (
                      <Link href={item.href}>
                        <SidebarMenuButton 
                          data-active={item.active} 
                          className="w-full justify-start gap-2"
                        >
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </Link>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-border/50 p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-7 w-7 text-muted-foreground" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{user.fullName || user.username}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => {
                const element = document.querySelector('[data-trigger="sidebar"]') as HTMLElement;
                if (element) element.click();
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-auto flex items-center gap-4">
              <UniversalSearch />
              <NotificationCenter />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}