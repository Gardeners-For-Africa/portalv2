import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Save, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

import { rolesPermissionsService } from "@/services/roles-permissions.service";
import { Permission, Role, RoleFormData } from "@/types/roles-permissions";

const roleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name must be less than 100 characters"),
  code: z
    .string()
    .min(1, "Role code is required")
    .max(50, "Role code must be less than 50 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  permissionIds: z.array(z.string()).min(1, "At least one permission must be selected"),
});

interface RoleFormProps {
  role?: Role;
  schoolId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoleForm({ role, schoolId, onClose, onSuccess }: RoleFormProps) {
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
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || "",
      code: role?.code || "",
      description: role?.description || "",
      permissionIds: role?.permissions.map((p) => p.id) || [],
    },
  });

  const watchedCode = watch("code");

  // Fetch permissions grouped by module
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => rolesPermissionsService.getPermissions({ limit: 1000 }),
  });

  // Validate role code
  const validateCode = async (code: string) => {
    if (!code || code === role?.code) {
      setCodeValidationMessage("");
      return;
    }

    setIsValidatingCode(true);
    try {
      const result = await rolesPermissionsService.validateRoleCode(code, schoolId, role?.id);
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
  }, [watchedCode, schoolId, role?.id]);

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (data: RoleFormData) =>
      rolesPermissionsService.createRole({
        ...data,
        schoolId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["roleStats", schoolId] });
      onSuccess();
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (data: RoleFormData) => rolesPermissionsService.updateRole(role!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["roleStats", schoolId] });
      onSuccess();
    },
  });

  const onSubmit = async (data: RoleFormData) => {
    if (codeValidationMessage) {
      return;
    }

    try {
      if (role) {
        await updateRoleMutation.mutateAsync(data);
      } else {
        await createRoleMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const togglePermission = (permissionId: string) => {
    const currentPermissions = watch("permissionIds");
    const updatedPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter((id) => id !== permissionId)
      : [...currentPermissions, permissionId];

    setValue("permissionIds", updatedPermissions);
  };

  // Group permissions by module
  const permissionsByModule =
    permissionsData?.permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>,
    ) || {};

  const isLoading = isSubmitting || createRoleMutation.isPending || updateRoleMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{role ? "Edit Role" : "Create New Role"}</CardTitle>
            <CardDescription>
              {role
                ? "Update role details and permissions"
                : "Create a new role with specific permissions"}
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
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter role name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Role Code *</Label>
                <div className="relative">
                  <Input
                    id="code"
                    {...register("code")}
                    placeholder="Enter role code"
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

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter role description"
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
                <Label className="text-base font-medium">Permissions *</Label>
                <Badge variant="outline">{watch("permissionIds").length} selected</Badge>
              </div>

              {errors.permissionIds && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.permissionIds.message}</AlertDescription>
                </Alert>
              )}

              <ScrollArea className="h-96 border rounded-md p-4">
                <div className="space-y-6">
                  {isLoadingPermissions ? (
                    <div className="text-center py-8">Loading permissions...</div>
                  ) : (
                    Object.entries(permissionsByModule).map(([module, permissions]) => (
                      <div key={module} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm capitalize">
                            {module.replace(/_/g, " ")}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {permissions.length} permissions
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
                          {permissions.map((permission) => (
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
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Error Display */}
            {(createRoleMutation.error || updateRoleMutation.error) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {createRoleMutation.error?.message || updateRoleMutation.error?.message}
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
                  {role ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {role ? "Update Role" : "Create Role"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
