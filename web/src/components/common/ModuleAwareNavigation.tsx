import { useQuery } from "@tanstack/react-query";
import React from "react";
import { tenantModulesService } from "@/services/tenant-modules.service";
import { ModuleCategory } from "@/types/tenant-modules";

interface ModuleAwareNavigationProps {
  schoolId: string;
  children: (props: {
    enabledModules: string[];
    hasModule: (moduleId: string) => boolean;
    hasCategory: (category: ModuleCategory) => boolean;
    isLoading: boolean;
  }) => React.ReactNode;
}

export default function ModuleAwareNavigation({ schoolId, children }: ModuleAwareNavigationProps) {
  const { data: modulesData, isLoading } = useQuery({
    queryKey: ["tenantModules", schoolId],
    queryFn: () => tenantModulesService.getTenantModules(schoolId),
    enabled: !!schoolId,
  });

  const enabledModules =
    modulesData?.config.enabledModules
      .filter((assignment) => assignment.isEnabled)
      .map((assignment) => assignment.moduleId) || [];

  const hasModule = (moduleId: string): boolean => {
    return enabledModules.includes(moduleId);
  };

  const hasCategory = (category: ModuleCategory): boolean => {
    if (!modulesData?.availableModules) return false;

    return modulesData.availableModules.some(
      (module) => module.category === category && enabledModules.includes(module.id),
    );
  };

  return (
    <>
      {children({
        enabledModules,
        hasModule,
        hasCategory,
        isLoading,
      })}
    </>
  );
}

// Higher-order component for module-aware components
export function withModuleAccess<T extends object>(
  Component: React.ComponentType<T>,
  requiredModules: string[] = [],
  fallback?: React.ReactNode,
) {
  return function ModuleAccessWrapper(props: T & { schoolId: string }) {
    const { schoolId, ...restProps } = props;

    return (
      <ModuleAwareNavigation schoolId={schoolId}>
        {({ hasModule, isLoading }) => {
          if (isLoading) {
            return (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            );
          }

          const hasRequiredModules = requiredModules.every((moduleId) => hasModule(moduleId));

          if (!hasRequiredModules && fallback) {
            return <>{fallback}</>;
          }

          if (!hasRequiredModules) {
            return (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  This feature requires additional modules to be enabled.
                </div>
              </div>
            );
          }

          return <Component {...(restProps as T)} />;
        }}
      </ModuleAwareNavigation>
    );
  };
}

// Hook for checking module access
export function useModuleAccess(schoolId: string) {
  const { data: modulesData, isLoading } = useQuery({
    queryKey: ["tenantModules", schoolId],
    queryFn: () => tenantModulesService.getTenantModules(schoolId),
    enabled: !!schoolId,
  });

  const enabledModules =
    modulesData?.config.enabledModules
      .filter((assignment) => assignment.isEnabled)
      .map((assignment) => assignment.moduleId) || [];

  const hasModule = React.useCallback(
    (moduleId: string): boolean => {
      return enabledModules.includes(moduleId);
    },
    [enabledModules],
  );

  const hasCategory = React.useCallback(
    (category: ModuleCategory): boolean => {
      if (!modulesData?.availableModules) return false;

      return modulesData.availableModules.some(
        (module) => module.category === category && enabledModules.includes(module.id),
      );
    },
    [modulesData?.availableModules, enabledModules],
  );

  const getEnabledModulesByCategory = React.useCallback(
    (category: ModuleCategory) => {
      if (!modulesData?.availableModules) return [];

      return modulesData.availableModules.filter(
        (module) => module.category === category && enabledModules.includes(module.id),
      );
    },
    [modulesData?.availableModules, enabledModules],
  );

  return {
    enabledModules,
    hasModule,
    hasCategory,
    getEnabledModulesByCategory,
    isLoading,
    modulesData,
  };
}
