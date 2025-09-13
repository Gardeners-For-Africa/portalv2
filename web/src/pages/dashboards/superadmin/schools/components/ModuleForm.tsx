import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle,
  MessageSquare,
  Save,
  Settings,
  Wrench,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { rolesPermissionsService } from "@/services/roles-permissions.service";
import { Module, ModuleCategory, ModuleFormData, Permission } from "@/types/roles-permissions";

const moduleSchema = z.object({
  name: z
    .string()
    .min(1, "Module name is required")
    .max(100, "Module name must be less than 100 characters"),
  code: z
    .string()
    .min(1, "Module code is required")
    .max(50, "Module code must be less than 50 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  category: z.enum([
    "academic",
    "financial",
    "administrative",
    "communication",
    "reporting",
    "system",
  ]),
  permissionIds: z.array(z.string()).min(1, "At least one permission must be selected"),
  icon: z.string().optional(),
});

interface ModuleFormProps {
  module?: Module;
  schoolId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const categoryIcons: Record<ModuleCategory, React.ReactNode> = {
  academic: <BookOpen className="h-4 w-4" />,
  financial: <Calculator className="h-4 w-4" />,
  administrative: <Settings className="h-4 w-4" />,
  communication: <MessageSquare className="h-4 w-4" />,
  reporting: <BarChart3 className="h-4 w-4" />,
  system: <Wrench className="h-4 w-4" />,
};

const categoryLabels: Record<ModuleCategory, string> = {
  academic: "Academic",
  financial: "Financial",
  administrative: "Administrative",
  communication: "Communication",
  reporting: "Reporting",
  system: "System",
};

export default function ModuleForm({ module, schoolId, onClose, onSuccess }: ModuleFormProps) {
  const queryClient = useQueryClient();
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeValidationMessage, setCodeValidationMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: module?.name || "",
      code: module?.code || "",
      description: module?.description || "",
      category: module?.category || "academic",
      permissionIds: module?.permissions.map((p) => p.id) || [],
      icon: module?.icon || "",
    },
  });

  const watchedCode = watch("code");
  const watchedCategory = watch("category");

  // Fetch permissions for the selected category
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions", watchedCategory],
    queryFn: () =>
      rolesPermissionsService.getPermissions({
        resource: watchedCategory,
        limit: 1000,
      }),
  });

  // Validate module code
  const validateCode = async (code: string) => {
    if (!code || code === module?.code) {
      setCodeValidationMessage("");
      return;
    }

    setIsValidatingCode(true);
    try {
      const result = await rolesPermissionsService.validateModuleCode(code, schoolId, module?.id);
      setCodeValidationMessage(result.isValid ? "" : result.message || "Code is not available");
    } catch (error) {
      setCodeValidationMessage("Error validating code");
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Debounced code validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateCode(watchedCode);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedCode, schoolId, module?.id]);

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: (data: ModuleFormData) =>
      rolesPermissionsService.createModule({
        ...data,
        schoolId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["moduleStats", schoolId] });
      onSuccess();
    },
  });

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: (data: ModuleFormData) => rolesPermissionsService.updateModule(module!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["moduleStats", schoolId] });
      onSuccess();
    },
  });

  const onSubmit = async (data: ModuleFormData) => {
    if (codeValidationMessage) {
      return;
    }

    try {
      if (module) {
        await updateModuleMutation.mutateAsync(data);
      } else {
        await createModuleMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Error saving module:", error);
    }
  };

  const togglePermission = (permissionId: string) => {
    const currentPermissions = watch("permissionIds");
    const updatedPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter((id) => id !== permissionId)
      : [...currentPermissions, permissionId];

    setValue("permissionIds", updatedPermissions);
  };

  const selectAllPermissions = () => {
    const allPermissionIds = permissionsData?.permissions.map((p) => p.id) || [];
    setValue("permissionIds", allPermissionIds);
  };

  const clearAllPermissions = () => {
    setValue("permissionIds", []);
  };

  const isLoading =
    isSubmitting || createModuleMutation.isPending || updateModuleMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{module ? "Edit Module" : "Create New Module"}</CardTitle>
            <CardDescription>
              {module
                ? "Update module details and permissions"
                : "Create a new module with specific permissions"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Module Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter module name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Module Code *</Label>
                <div className="relative">
                  <Input
                    id="code"
                    {...register("code")}
                    placeholder="Enter module code"
                    className={`${errors.code || codeValidationMessage ? "border-destructive" : ""} font-mono`}
                  />
                  {isValidatingCode && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                  {watchedCode && !isValidatingCode && !codeValidationMessage && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                {codeValidationMessage && (
                  <p className="text-sm text-destructive">{codeValidationMessage}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={watchedCategory}
                  onValueChange={(value) => setValue("category", value as ModuleCategory)}
                >
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {categoryIcons[value as ModuleCategory]}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Optional)</Label>
                <Input id="icon" {...register("icon")} placeholder="Enter icon name or class" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter module description"
                rows={3}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Permissions Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">Permissions *</Label>
                  <Badge variant="outline">{watch("permissionIds").length} selected</Badge>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={selectAllPermissions}>
                    Select All
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={clearAllPermissions}>
                    Clear All
                  </Button>
                </div>
              </div>

              {errors.permissionIds && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.permissionIds.message}</AlertDescription>
                </Alert>
              )}

              <ScrollArea className="h-96 border rounded-md p-4">
                <div className="space-y-4">
                  {isLoadingPermissions ? (
                    <div className="text-center py-8">Loading permissions...</div>
                  ) : permissionsData?.permissions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No permissions available for this category
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissionsData?.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={watch("permissionIds").includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <Label
                            htmlFor={permission.id}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{permission.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {permission.description}
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Error Display */}
            {(createModuleMutation.error || updateModuleMutation.error) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {createModuleMutation.error?.message || updateModuleMutation.error?.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          {/* Actions */}
          <div className="flex justify-end gap-2 p-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !!codeValidationMessage}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  {module ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {module ? "Update Module" : "Create Module"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
