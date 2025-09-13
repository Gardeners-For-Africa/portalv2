import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Building,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Filter,
  Package as ModuleIcon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  Upload,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { StatsCard } from "@/components/common/StatsCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rolesPermissionsService } from "@/services/roles-permissions.service";
import {
  ModuleStats,
  Module as ModuleType,
  Role,
  RoleStats,
  SchoolSettingsResponse,
  UserRole,
  UserRoleStats,
} from "@/types/roles-permissions";
import ModuleForm from "./components/ModuleForm";
import RoleForm from "./components/RoleForm";
import UserRoleForm from "./components/UserRoleForm";

interface SchoolRolesPermissionsProps {
  schoolId: string;
  schoolName: string;
  initialTab?: string;
}

export default function SchoolRolesPermissions({
  schoolId,
  schoolName,
  initialTab,
}: SchoolRolesPermissionsProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab || "overview");

  // Form states
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showUserRoleForm, setShowUserRoleForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [selectedModule, setSelectedModule] = useState<ModuleType | undefined>();
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | undefined>();

  // Fetch school settings and statistics
  const {
    data: schoolSettings,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useQuery({
    queryKey: ["schoolSettings", schoolId],
    queryFn: () => rolesPermissionsService.getSchoolSettings(schoolId),
  });

  // Fetch role statistics
  const { data: roleStats, isLoading: isLoadingRoleStats } = useQuery({
    queryKey: ["roleStats", schoolId],
    queryFn: () => rolesPermissionsService.getRoleStats(schoolId),
    enabled: !!schoolId,
  });

  // Fetch module statistics
  const { data: moduleStats, isLoading: isLoadingModuleStats } = useQuery({
    queryKey: ["moduleStats", schoolId],
    queryFn: () => rolesPermissionsService.getModuleStats(schoolId),
    enabled: !!schoolId,
  });

  // Fetch user role statistics
  const { data: userRoleStats, isLoading: isLoadingUserRoleStats } = useQuery({
    queryKey: ["userRoleStats", schoolId],
    queryFn: () => rolesPermissionsService.getUserRoleStats(schoolId),
    enabled: !!schoolId,
  });

  // Fetch roles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles", schoolId, searchTerm],
    queryFn: () =>
      rolesPermissionsService.getRoles({
        schoolId,
        search: searchTerm || undefined,
        page: 1,
        limit: 50,
      }),
    enabled: !!schoolId,
  });

  // Fetch modules
  const { data: modulesData, isLoading: isLoadingModules } = useQuery({
    queryKey: ["modules", schoolId, searchTerm],
    queryFn: () =>
      rolesPermissionsService.getModules({
        schoolId,
        search: searchTerm || undefined,
        page: 1,
        limit: 50,
      }),
    enabled: !!schoolId,
  });

  // Fetch user roles
  const { data: userRolesData, isLoading: isLoadingUserRoles } = useQuery({
    queryKey: ["userRoles", schoolId, searchTerm],
    queryFn: () =>
      rolesPermissionsService.getUserRoles({
        schoolId,
        search: searchTerm || undefined,
        page: 1,
        limit: 50,
      }),
    enabled: !!schoolId,
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["schoolSettings", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["roleStats", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["moduleStats", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["userRoleStats", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["roles", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["modules", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["userRoles", schoolId] });
  };

  // CRUD Handlers
  const handleCreateRole = () => {
    setSelectedRole(undefined);
    setShowRoleForm(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowRoleForm(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await rolesPermissionsService.deleteRole(roleId);
        refreshData();
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  const handleCreateModule = () => {
    setSelectedModule(undefined);
    setShowModuleForm(true);
  };

  const handleEditModule = (module: ModuleType) => {
    setSelectedModule(module);
    setShowModuleForm(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (window.confirm("Are you sure you want to delete this module?")) {
      try {
        await rolesPermissionsService.deleteModule(moduleId);
        refreshData();
      } catch (error) {
        console.error("Error deleting module:", error);
      }
    }
  };

  const handleAssignUserRole = () => {
    setSelectedUserRole(undefined);
    setShowUserRoleForm(true);
  };

  const handleEditUserRole = (userRole: UserRole) => {
    setSelectedUserRole(userRole);
    setShowUserRoleForm(true);
  };

  const handleRemoveUserRole = async (userRoleId: string) => {
    if (window.confirm("Are you sure you want to remove this role assignment?")) {
      try {
        await rolesPermissionsService.removeUserRole(userRoleId);
        refreshData();
      } catch (error) {
        console.error("Error removing user role:", error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowRoleForm(false);
    setShowModuleForm(false);
    setShowUserRoleForm(false);
    setSelectedRole(undefined);
    setSelectedModule(undefined);
    setSelectedUserRole(undefined);
    refreshData();
  };

  const handleFormClose = () => {
    setShowRoleForm(false);
    setShowModuleForm(false);
    setShowUserRoleForm(false);
    setSelectedRole(undefined);
    setSelectedModule(undefined);
    setSelectedUserRole(undefined);
  };

  const handleExportSettings = async () => {
    try {
      const blob = await rolesPermissionsService.exportSchoolSettings(schoolId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${schoolName}-roles-permissions.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await rolesPermissionsService.importSchoolSettings(schoolId, file);
        refreshData();
      } catch (error) {
        console.error("Import failed:", error);
      }
    }
  };

  if (settingsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load school settings. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage roles, permissions, and modules for {schoolName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <label htmlFor="import-settings">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </label>
          </Button>
          <input
            id="import-settings"
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateRole}>
                <Shield className="h-4 w-4 mr-2" />
                Add Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateModule}>
                <ModuleIcon className="h-4 w-4 mr-2" />
                Add Module
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAssignUserRole}>
                <UserCheck className="h-4 w-4 mr-2" />
                Assign User Role
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search roles, modules, or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Roles"
          value={roleStats?.totalRoles || 0}
          description="Available roles"
          icon={Shield}
          variant="primary"
        />
        <StatsCard
          title="Active Modules"
          value={moduleStats?.activeModules || 0}
          description="Enabled modules"
          icon={ModuleIcon}
          variant="success"
        />
        <StatsCard
          title="User Assignments"
          value={userRoleStats?.totalUserRoles || 0}
          description="Role assignments"
          icon={UserCheck}
          variant="default"
        />
        <StatsCard
          title="System Health"
          value="Active"
          description="All systems operational"
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="users">User Roles</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Roles */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Recent Roles
                </CardTitle>
                <CardDescription>Latest role configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingRoles ? (
                    <div className="text-center py-4">Loading roles...</div>
                  ) : (
                    rolesData?.roles.slice(0, 5).map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{role.name}</h4>
                            <Badge
                              variant={role.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {role.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {role.isSystemRole && (
                              <Badge variant="outline" className="text-xs">
                                System
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{role.description}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>{role.permissions.length} permissions</span>
                            <span>{role.userCount} users</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                Manage Users
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Module Status */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ModuleIcon className="w-5 h-5 text-primary" />
                  Module Status
                </CardTitle>
                <CardDescription>Module availability and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingModules ? (
                    <div className="text-center py-4">Loading modules...</div>
                  ) : (
                    modulesData?.modules.slice(0, 5).map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{module.name}</h4>
                            <Badge
                              variant={module.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {module.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {module.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{module.description}</p>
                          <div className="text-xs text-muted-foreground">
                            {module.permissions.length} permissions available
                          </div>
                        </div>
                        <div className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Module
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Manage Permissions
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles Management</CardTitle>
              <CardDescription>Create and manage roles for {schoolName}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingRoles ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading roles...
                      </TableCell>
                    </TableRow>
                  ) : (
                    rolesData?.roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {role.name}
                            {role.isSystemRole && (
                              <Badge variant="outline" className="text-xs">
                                System
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{role.code}</TableCell>
                        <TableCell>{role.permissions.length}</TableCell>
                        <TableCell>{role.userCount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={role.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {role.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                Manage Users
                              </DropdownMenuItem>
                              {!role.isSystemRole && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteRole(role.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Role
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modules Management</CardTitle>
              <CardDescription>Configure available modules for {schoolName}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingModules ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading modules...
                      </TableCell>
                    </TableRow>
                  ) : (
                    modulesData?.modules.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {module.name}
                            {module.isSystemModule && (
                              <Badge variant="outline" className="text-xs">
                                System
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {module.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{module.permissions.length}</TableCell>
                        <TableCell>
                          <Badge
                            variant={module.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {module.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditModule(module)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Module
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Manage Permissions
                              </DropdownMenuItem>
                              {!module.isSystemModule && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteModule(module.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Module
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Roles Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
              <CardDescription>Manage role assignments for users in {schoolName}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead>Assigned At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUserRoles ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading user roles...
                      </TableCell>
                    </TableRow>
                  ) : (
                    userRolesData?.userRoles.map((userRole) => (
                      <TableRow key={userRole.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{userRole.userName}</div>
                            <div className="text-sm text-muted-foreground">
                              {userRole.userEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{userRole.roleName}</TableCell>
                        <TableCell>{userRole.assignedByName}</TableCell>
                        <TableCell>{new Date(userRole.assignedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={userRole.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {userRole.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUserRole(userRole)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Assignment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRemoveUserRole(userRole.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Remove Role
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Modals */}
      {showRoleForm && (
        <RoleForm
          role={selectedRole}
          schoolId={schoolId}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {showModuleForm && (
        <ModuleForm
          module={selectedModule}
          schoolId={schoolId}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {showUserRoleForm && (
        <UserRoleForm
          userRole={selectedUserRole}
          schoolId={schoolId}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
