import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  Building,
  Bus,
  CheckCircle,
  CreditCard,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Library,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { tenantModulesService } from "@/services/tenant-modules.service";
import {
  ModuleCategory,
  SYSTEM_MODULES,
  TenantModule,
  TenantModuleAssignment,
} from "@/types/tenant-modules";

interface SchoolModulesProps {
  schoolId: string;
  schoolName: string;
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

export default function SchoolModules({ schoolId, schoolName }: SchoolModulesProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | "all">("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch tenant modules configuration
  const {
    data: modulesData,
    isLoading: isLoadingModules,
    error: modulesError,
  } = useQuery({
    queryKey: ["tenantModules", schoolId],
    queryFn: () => tenantModulesService.getTenantModules(schoolId),
    enabled: !!schoolId,
  });

  // Fetch system modules
  const { data: systemModules, isLoading: isLoadingSystemModules } = useQuery({
    queryKey: ["systemModules"],
    queryFn: () => tenantModulesService.getSystemModules(),
  });

  // Enable module mutation
  const enableModuleMutation = useMutation({
    mutationFn: (moduleId: string) => tenantModulesService.enableModule(schoolId, { moduleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantModules", schoolId] });
    },
  });

  // Disable module mutation
  const disableModuleMutation = useMutation({
    mutationFn: (moduleId: string) =>
      tenantModulesService.disableModule(schoolId, { moduleId, reason: "Disabled by super admin" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantModules", schoolId] });
    },
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["tenantModules", schoolId] });
  };

  const handleExportModules = async () => {
    try {
      const blob = await tenantModulesService.exportTenantModules(schoolId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${schoolName}-modules.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleImportModules = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await tenantModulesService.importTenantModules(schoolId, file);
        refreshData();
      } catch (error) {
        console.error("Import failed:", error);
      }
    }
  };

  const toggleModule = async (moduleId: string, isEnabled: boolean) => {
    try {
      if (isEnabled) {
        await disableModuleMutation.mutateAsync(moduleId);
      } else {
        await enableModuleMutation.mutateAsync(moduleId);
      }
    } catch (error) {
      console.error("Error toggling module:", error);
    }
  };

  // Filter modules based on search and category
  const filteredModules =
    systemModules?.filter((module) => {
      const matchesSearch =
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || module.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }) || [];

  if (modulesError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load school modules. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">School Modules</h1>
          <p className="text-muted-foreground">Manage available modules for {schoolName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportModules}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <label htmlFor="import-modules">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </label>
          </Button>
          <input
            id="import-modules"
            type="file"
            accept=".json"
            onChange={handleImportModules}
            className="hidden"
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Category:{" "}
              {selectedCategory === "all"
                ? "All"
                : categoryLabels[selectedCategory as ModuleCategory]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedCategory("all")}>
              All Categories
            </DropdownMenuItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setSelectedCategory(key as ModuleCategory)}
              >
                <div className="flex items-center gap-2">
                  {categoryIcons[key as ModuleCategory]}
                  {label}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Statistics Cards */}
      {modulesData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Modules"
            value={modulesData.stats.totalModules}
            description="Available modules"
            icon={Package}
            variant="primary"
          />
          <StatsCard
            title="Enabled Modules"
            value={modulesData.stats.enabledModules}
            description="Active modules"
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Disabled Modules"
            value={modulesData.stats.disabledModules}
            description="Inactive modules"
            icon={XCircle}
            variant="secondary"
          />
          <StatsCard
            title="Categories"
            value={Object.keys(modulesData.stats.categoryBreakdown).length}
            description="Module categories"
            icon={Building}
            variant="default"
          />
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all-modules">All Modules</TabsTrigger>
          <TabsTrigger value="enabled-modules">Enabled Modules</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recently Enabled Modules */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Recently Enabled
                </CardTitle>
                <CardDescription>Latest module activations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingModules ? (
                    <div className="text-center py-4">Loading modules...</div>
                  ) : (
                    modulesData?.config.enabledModules.slice(0, 5).map((assignment) => {
                      const module = systemModules?.find((m) => m.id === assignment.moduleId);
                      return module ? (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{module.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {categoryLabels[module.category]}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {module.description}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              Enabled by {assignment.enabledByName}
                            </div>
                          </div>
                          <Switch
                            checked={assignment.isEnabled}
                            onCheckedChange={() =>
                              toggleModule(assignment.moduleId, assignment.isEnabled)
                            }
                            disabled={
                              enableModuleMutation.isPending || disableModuleMutation.isPending
                            }
                          />
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Module Categories
                </CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modulesData?.stats.categoryBreakdown &&
                    Object.entries(modulesData.stats.categoryBreakdown).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {categoryIcons[category as ModuleCategory]}
                          <span className="text-sm font-medium">
                            {categoryLabels[category as ModuleCategory]}
                          </span>
                        </div>
                        <Badge variant="secondary">{count} modules</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Modules Tab */}
        <TabsContent value="all-modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Available Modules</CardTitle>
              <CardDescription>Manage all system modules for {schoolName}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSystemModules ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading modules...
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredModules.map((module) => {
                      const assignment = modulesData?.config.enabledModules.find(
                        (a) => a.moduleId === module.id,
                      );
                      const isEnabled = assignment?.isEnabled || false;

                      return (
                        <TableRow key={module.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              {module.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[module.category]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {module.description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={isEnabled ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {isEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() => toggleModule(module.id, isEnabled)}
                                disabled={
                                  enableModuleMutation.isPending || disableModuleMutation.isPending
                                }
                              />
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
                                    Configure
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enabled Modules Tab */}
        <TabsContent value="enabled-modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enabled Modules</CardTitle>
              <CardDescription>Currently active modules for {schoolName}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Enabled By</TableHead>
                    <TableHead>Enabled At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingModules ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading enabled modules...
                      </TableCell>
                    </TableRow>
                  ) : (
                    modulesData?.config.enabledModules
                      .filter((a) => a.isEnabled)
                      .map((assignment) => {
                        const module = systemModules?.find((m) => m.id === assignment.moduleId);
                        return module ? (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                {module.name}
                              </div>
                            </TableCell>
                            <TableCell>{assignment.enabledByName}</TableCell>
                            <TableCell>
                              {assignment.enabledAt
                                ? new Date(assignment.enabledAt).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className="text-xs">
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={true}
                                  onCheckedChange={() => toggleModule(assignment.moduleId, true)}
                                  disabled={disableModuleMutation.isPending}
                                />
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
                                      Configure
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => toggleModule(assignment.moduleId, true)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Disable Module
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : null;
                      })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
