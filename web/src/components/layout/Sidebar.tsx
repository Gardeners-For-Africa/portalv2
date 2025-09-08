import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Building,
  Calculator,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  DollarSign,
  File,
  FileText,
  GraduationCap,
  Home,
  Settings,
  Upload,
  UserCheck,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarPrimitive,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { cn, replaceUnderscore } from "@/lib/utils";
import type { UserRole } from "@/types";

interface SidebarSubItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  subItems?: SidebarSubItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    roles: ["super_admin", "school_admin", "teacher", "student", "parent"],
  },
  {
    title: "Schools",
    url: "/schools",
    icon: Building,
    roles: ["super_admin"],
  },
  {
    title: "Users",
    icon: Users,
    roles: ["super_admin", "school_admin"],
    subItems: [
      {
        title: "Students",
        url: "/users/students",
        icon: GraduationCap,
      },
      {
        title: "Teachers",
        url: "/users/teachers",
        icon: UserCheck,
      },
    ],
  },
  {
    title: "Subjects",
    url: "/subjects",
    icon: BookOpen,
    roles: ["school_admin", "teacher"],
  },
  {
    title: "Payments",
    url: "/payments",
    icon: DollarSign,
    roles: ["school_admin", "teacher", "parent", "student"],
  },
  {
    title: "Grading",
    icon: Award,
    roles: ["school_admin"],
    subItems: [
      {
        title: "Settings",
        url: "/grading/settings",
        icon: Settings,
      },
      {
        title: "Exams",
        url: "/grading/exams",
        icon: File,
      },
      {
        title: "Scores",
        url: "/grading/scores",
        icon: ClipboardList,
      },
      {
        title: "Bulk Updates",
        url: "/grading/bulk-updates",
        icon: Upload,
      },
    ],
  },
  {
    title: "Grades",
    icon: FileText,
    roles: ["teacher", "student"],
    subItems: [
      {
        title: "Scores",
        url: "/grades/scores",
        icon: FileText,
      },
      {
        title: "Bulk Update",
        url: "/grades/bulk-update",
        icon: Upload,
      },
      {
        title: "Results",
        url: "/grades/results",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Classes",
    url: "/classes",
    icon: GraduationCap,
    roles: ["teacher"],
  },
  {
    title: "Assignments",
    url: "/assignments",
    icon: BookOpen,
    roles: ["teacher"],
  },
  {
    title: "My Results",
    url: "/results",
    icon: BarChart3,
    roles: ["student"],
  },
  {
    title: "My Children",
    url: "/children",
    icon: Users,
    roles: ["parent"],
  },
  {
    title: "Schedule",
    url: "/schedules",
    icon: Calendar,
    roles: ["teacher", "student"],
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    roles: ["super_admin", "school_admin", "teacher", "student", "parent"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["super_admin", "school_admin", "teacher", "student", "parent"],
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (!user) return null;

  const filteredItems = sidebarItems.filter((item) => item.roles.includes(user.role));

  const isActive = (path: string) => location.pathname === path;

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    );
  };

  const isItemExpanded = (title: string) => expandedItems.includes(title);

  const getNavClassName = (isActiveLink: boolean) =>
    cn(
      "w-full justify-start transition-all duration-200",
      isActiveLink
        ? "bg-primary text-primary-foreground hover:bg-primary-hover"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    );

  const getSubItemClassName = (isActiveLink: boolean) =>
    cn(
      "w-full justify-start transition-all duration-200 pl-8",
      isActiveLink
        ? "bg-primary/20 text-primary border-l-2 border-primary"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    );

  return (
    <SidebarPrimitive
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
      collapsible="icon"
    >
      <SidebarContent className="px-2 py-4">
        {/* Logo Section */}
        <div
          className={cn("flex items-center gap-3 px-3 py-4 mb-6", collapsed && "justify-center")}
        >
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-poppins font-semibold text-sidebar-foreground">
                Gardeners for Africa
              </h2>
              <p className="text-xs text-sidebar-foreground/60">
                {user.role.replace("_", " ").toUpperCase()}
              </p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredItems.map((item) => {
                const isActiveLink = item.url ? isActive(item.url) : false;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = isItemExpanded(item.title);

                return (
                  <div key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild={!hasSubItems}
                        onClick={hasSubItems ? () => toggleExpanded(item.title) : undefined}
                        className={hasSubItems ? "cursor-pointer" : ""}
                      >
                        {hasSubItems ? (
                          <div
                            className={cn(
                              "w-full flex items-center justify-between transition-all duration-200",
                              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            )}
                          >
                            <div className="flex items-center">
                              <item.icon
                                className={cn(
                                  "h-5 w-5 transition-colors",
                                  collapsed ? "mx-auto" : "mr-3",
                                )}
                              />
                              {!collapsed && <span className="font-medium">{item.title}</span>}
                            </div>
                            {!collapsed && hasSubItems && (
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform duration-200",
                                  isExpanded ? "rotate-180" : "",
                                )}
                              />
                            )}
                          </div>
                        ) : (
                          <NavLink
                            to={`/dashboard/${replaceUnderscore(user.role)}${item.url}`}
                            className={getNavClassName(isActiveLink)}
                            title={collapsed ? item.title : undefined}
                          >
                            <item.icon
                              className={cn(
                                "h-5 w-5 transition-colors",
                                collapsed ? "mx-auto" : "mr-3",
                              )}
                            />
                            {!collapsed && <span className="font-medium">{item.title}</span>}
                          </NavLink>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Render sub-items if expanded */}
                    {hasSubItems && isExpanded && !collapsed && (
                      <div className="ml-2 space-y-1">
                        {item.subItems!.map((subItem) => {
                          const isSubItemActive = isActive(subItem.url);

                          return (
                            <SidebarMenuItem key={subItem.title}>
                              <SidebarMenuButton asChild>
                                <NavLink
                                  to={`/dashboard/${replaceUnderscore(user.role)}${subItem.url}`}
                                  className={getSubItemClassName(isSubItemActive)}
                                  title={subItem.title}
                                >
                                  <subItem.icon className="h-4 w-4 mr-3" />
                                  <span className="text-sm font-medium">{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarPrimitive>
  );
}
