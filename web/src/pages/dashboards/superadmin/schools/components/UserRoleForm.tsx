import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Save, Shield, UserPlus, Users, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { rolesPermissionsService } from "@/services/roles-permissions.service";
import { Role, User, UserRole, UserRoleFormData } from "@/types/roles-permissions";

const userRoleSchema = z.object({
  userId: z.string().min(1, "User is required"),
  roleId: z.string().min(1, "Role is required"),
});

interface UserRoleFormProps {
  userRole?: UserRole;
  schoolId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserRoleForm({
  userRole,
  schoolId,
  onClose,
  onSuccess,
}: UserRoleFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<UserRoleFormData>({
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      userId: userRole?.userId || "",
      roleId: userRole?.roleId || "",
    },
  });

  const watchedUserId = watch("userId");
  const watchedRoleId = watch("roleId");

  // Fetch available roles for the school
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles", schoolId],
    queryFn: () =>
      rolesPermissionsService.getRoles({
        schoolId,
        isActive: true,
        limit: 1000,
      }),
    enabled: !!schoolId,
  });

  // Fetch available users for the school (this would need to be implemented in the service)
  // For now, we'll use a mock query - you'll need to implement getUserRoles with user search
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", schoolId],
    queryFn: async () => {
      // This would be a real API call to get users for the school
      // For now, return mock data
      return {
        users: [
          { id: "1", name: "John Doe", email: "john.doe@school.com" },
          { id: "2", name: "Jane Smith", email: "jane.smith@school.com" },
          { id: "3", name: "Bob Johnson", email: "bob.johnson@school.com" },
        ],
      };
    },
    enabled: !!schoolId,
  });

  // Assign user role mutation
  const assignUserRoleMutation = useMutation({
    mutationFn: (data: UserRoleFormData) =>
      rolesPermissionsService.assignUserRole({
        ...data,
        schoolId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRoles", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["userRoleStats", schoolId] });
      onSuccess();
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: (data: UserRoleFormData) =>
      rolesPermissionsService.updateUserRole(userRole!.id, {
        roleId: data.roleId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRoles", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["userRoleStats", schoolId] });
      onSuccess();
    },
  });

  const onSubmit = async (data: UserRoleFormData) => {
    try {
      if (userRole) {
        await updateUserRoleMutation.mutateAsync(data);
      } else {
        await assignUserRoleMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Error saving user role:", error);
    }
  };

  const isLoading =
    isSubmitting || assignUserRoleMutation.isPending || updateUserRoleMutation.isPending;

  const selectedRole = rolesData?.roles.find((role) => role.id === watchedRoleId);
  const selectedUser = usersData?.users.find((user) => user.id === watchedUserId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{userRole ? "Edit User Role" : "Assign User Role"}</CardTitle>
            <CardDescription>
              {userRole ? "Update user role assignment" : "Assign a role to a user in this school"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="userId">Select User *</Label>
              <Select value={watchedUserId} onValueChange={(value) => setValue("userId", value)}>
                <SelectTrigger className={errors.userId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingUsers ? (
                    <SelectItem value="" disabled>
                      Loading users...
                    </SelectItem>
                  ) : (
                    usersData?.users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="roleId">Select Role *</Label>
              <Select value={watchedRoleId} onValueChange={(value) => setValue("roleId", value)}>
                <SelectTrigger className={errors.roleId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingRoles ? (
                    <SelectItem value="" disabled>
                      Loading roles...
                    </SelectItem>
                  ) : (
                    rolesData?.roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span className="font-medium">{role.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {role.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {role.isSystemRole && (
                              <Badge variant="outline" className="text-xs">
                                System
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {role.permissions.length} permissions
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.roleId && <p className="text-sm text-destructive">{errors.roleId.message}</p>}
            </div>

            {/* Selected Role Details */}
            {selectedRole && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Selected Role Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedRole.name}</span>
                    <div className="flex gap-2">
                      {selectedRole.isSystemRole && (
                        <Badge variant="outline" className="text-xs">
                          System Role
                        </Badge>
                      )}
                      <Badge
                        variant={selectedRole.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {selectedRole.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{selectedRole.permissions.length} permissions</span>
                    <span>{selectedRole.userCount} users assigned</span>
                  </div>

                  {/* Show permissions preview */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Permissions ({selectedRole.permissions.length})
                    </Label>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      <div className="grid grid-cols-1 gap-1">
                        {selectedRole.permissions.slice(0, 10).map((permission) => (
                          <Badge key={permission.id} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ))}
                        {selectedRole.permissions.length > 10 && (
                          <Badge variant="secondary" className="text-xs">
                            +{selectedRole.permissions.length - 10} more...
                          </Badge>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected User Details */}
            {selectedUser && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Selected User Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedUser.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {(assignUserRoleMutation.error || updateUserRoleMutation.error) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {assignUserRoleMutation.error?.message || updateUserRoleMutation.error?.message}
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
              disabled={isLoading}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  {userRole ? "Updating..." : "Assigning..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {userRole ? "Update Assignment" : "Assign Role"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
