import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Building,
  Bus,
  CheckCircle,
  CreditCard,
  FileText,
  GraduationCap,
  Library,
  Package,
  Settings,
  Users,
  XCircle,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { tenantModulesService } from "@/services/tenant-modules.service";
import { ModuleCategory } from "@/types/tenant-modules";

interface AvailableModulesProps {
  schoolId: string;
  schoolName: string;
  showTitle?: boolean;
  maxItems?: number;
}

const categoryIcons: Record<ModuleCategory, React.ReactNode> = {
  academic: <BookOpen className="h-4 w-4" />,
  financial: <CreditCard className="h-4 w-4" />,
  administrative: <Settings className="h-4 w-4" />,
  communication: <Bell className="h-4 w-4" />,
  reporting: <BarChart3 className="h-4 w-4" />,
  system: <Settings className="h-4 w-4" />,
  student_life: <Users className="h-4 w-4" />,
  human_resources: <Users className="h-4 w-4" />,
};

const categoryLabels: Record<ModuleCategory, string> = {
  academic: "Academic",
  financial: "Financial",
  administrative: "Administrative",
  communication: "Communication",
  reporting: "Reporting",
  system: "System",
  student_life: "Student Life",
  human_resources: "Human Resources",
};

const moduleIcons: Record<string, React.ReactNode> = {
  grades: <GraduationCap className="h-5 w-5" />,
  exams: <FileText className="h-5 w-5" />,
  payments: <CreditCard className="h-5 w-5" />,
  user_management: <Users className="h-5 w-5" />,
  classroom_management: <BookOpen className="h-5 w-5" />,
  hostels: <Building className="h-5 w-5" />,
  reports: <BarChart3 className="h-5 w-5" />,
  notifications: <Bell className="h-5 w-5" />,
  library: <Library className="h-5 w-5" />,
  transport: <Bus className="h-5 w-5" />,
};

export default function AvailableModules({
  schoolId,
  schoolName,
  showTitle = true,
  maxItems = 6,
}: AvailableModulesProps) {
  const {
    data: modulesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tenantModules", schoolId],
    queryFn: () => tenantModulesService.getTenantModules(schoolId),
    enabled: !!schoolId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Available Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading modules...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Available Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-muted-foreground">Failed to load modules</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const enabledModules =
    modulesData?.config.enabledModules.filter((assignment) => assignment.isEnabled) || [];
  const displayedModules = enabledModules.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {showTitle ? "Available Modules" : "Modules"}
        </CardTitle>
        <CardDescription>
          {showTitle ? `Active modules for ${schoolName}` : "Your available modules"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {enabledModules.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No modules are currently enabled</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contact your super administrator to enable modules
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3">
              {displayedModules.map((assignment) => {
                const module = modulesData?.availableModules.find(
                  (m) => m.id === assignment.moduleId,
                );
                if (!module) return null;

                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        {moduleIcons[module.id] || <Package className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{module.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[module.category]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {enabledModules.length > maxItems && (
              <div className="pt-2 border-t">
                <Button variant="ghost" className="w-full">
                  View All {enabledModules.length} Modules
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Module Statistics */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{enabledModules.length}</div>
                  <div className="text-xs text-muted-foreground">Enabled</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {Object.keys(modulesData?.stats.categoryBreakdown || {}).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Categories</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {Math.round(
                      (enabledModules.length / (modulesData?.stats.totalModules || 1)) * 100,
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
