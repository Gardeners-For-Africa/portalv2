import {
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { schoolOnboardingService } from "@/services/school-onboarding.service";
import {
  ONBOARDING_STEPS,
  OnboardingFilters,
  OnboardingProgress,
  OnboardingStats,
  OnboardingStatus,
  OnboardingStep,
} from "@/types/school-onboarding";

export default function OnboardingManagement() {
  const [onboardings, setOnboardings] = useState<OnboardingProgress[]>([]);
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stepFilter, setStepFilter] = useState<string>("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState<OnboardingProgress | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load onboardings
  const loadOnboardings = async () => {
    try {
      setLoading(true);
      const filters: OnboardingFilters = {
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : (statusFilter as OnboardingStatus),
        step: stepFilter === "all" ? undefined : (stepFilter as OnboardingStep),
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await schoolOnboardingService.getAllOnboardings(filters);
      setOnboardings(response.onboardings);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error("Failed to load onboardings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const statsData = await schoolOnboardingService.getOnboardingStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    loadOnboardings();
    loadStats();
  }, [searchTerm, statusFilter, stepFilter, pagination.page]);

  // Require approval
  const handleRequireApproval = async (id: string) => {
    try {
      await schoolOnboardingService.requireApproval(id, approvalNotes);
      setApprovalNotes("");
      loadOnboardings();
      loadStats();
    } catch (error) {
      console.error("Failed to require approval:", error);
    }
  };

  // Approve onboarding
  const handleApproveOnboarding = async (id: string) => {
    try {
      await schoolOnboardingService.approveOnboarding(id, approvalNotes);
      setApprovalNotes("");
      loadOnboardings();
      loadStats();
    } catch (error) {
      console.error("Failed to approve onboarding:", error);
    }
  };

  // Reject onboarding
  const handleRejectOnboarding = async (id: string) => {
    try {
      await schoolOnboardingService.rejectOnboarding(id, rejectionReason);
      setRejectionReason("");
      loadOnboardings();
      loadStats();
    } catch (error) {
      console.error("Failed to reject onboarding:", error);
    }
  };

  // Export data
  const handleExportData = async () => {
    try {
      const blob = await schoolOnboardingService.exportOnboardingData({
        status: statusFilter === "all" ? undefined : (statusFilter as OnboardingStatus),
        step: stepFilter === "all" ? undefined : (stepFilter as OnboardingStep),
        search: searchTerm || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `onboarding-data-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  // Open view dialog
  const openViewDialog = (onboarding: OnboardingProgress) => {
    setSelectedOnboarding(onboarding);
    setIsViewDialogOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: OnboardingStatus) => {
    const statusConfig = {
      [OnboardingStatus.NOT_STARTED]: { className: "bg-gray-100 text-gray-800", icon: Clock },
      [OnboardingStatus.IN_PROGRESS]: { className: "bg-blue-100 text-blue-800", icon: Play },
      [OnboardingStatus.COMPLETED]: { className: "bg-green-100 text-green-800", icon: CheckCircle },
      [OnboardingStatus.ABANDONED]: { className: "bg-red-100 text-red-800", icon: XCircle },
      [OnboardingStatus.REQUIRES_APPROVAL]: {
        className: "bg-yellow-100 text-yellow-800",
        icon: Pause,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
      </Badge>
    );
  };

  // Get step name
  const getStepName = (step: OnboardingStep) => {
    const stepConfig = ONBOARDING_STEPS.find((s) => s.step === step);
    return (
      stepConfig?.title ||
      step.replace("_", " ").charAt(0).toUpperCase() + step.replace("_", " ").slice(1)
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get progress bar color
  const getProgressBarColor = (percentage: number) => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Onboarding Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage school onboarding processes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" onClick={loadOnboardings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abandoned</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.abandoned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Pause className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingApproval}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Records</CardTitle>
          <CardDescription>Monitor all school onboarding processes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by user ID or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={OnboardingStatus.NOT_STARTED}>Not Started</SelectItem>
                <SelectItem value={OnboardingStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={OnboardingStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={OnboardingStatus.ABANDONED}>Abandoned</SelectItem>
                <SelectItem value={OnboardingStatus.REQUIRES_APPROVAL}>Pending Approval</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stepFilter} onValueChange={setStepFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Step" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Steps</SelectItem>
                {ONBOARDING_STEPS.map((step) => (
                  <SelectItem key={step.step} value={step.step}>
                    {step.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Step</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading onboardings...
                  </TableCell>
                </TableRow>
              ) : onboardings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No onboarding records found
                  </TableCell>
                </TableRow>
              ) : (
                onboardings.map((onboarding) => (
                  <TableRow key={onboarding.id}>
                    <TableCell className="font-mono text-sm">{onboarding.userId}</TableCell>
                    <TableCell>{getStatusBadge(onboarding.status)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{getStepName(onboarding.currentStep)}</div>
                      <div className="text-sm text-gray-500">
                        {onboarding.completedSteps.length} of {ONBOARDING_STEPS.length} completed
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressBarColor(onboarding.progressPercentage)}`}
                            style={{ width: `${onboarding.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {onboarding.progressPercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {onboarding.startedAt ? formatDate(onboarding.startedAt) : "Not started"}
                    </TableCell>
                    <TableCell>
                      {onboarding.lastStepAt ? formatDate(onboarding.lastStepAt) : "No activity"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(onboarding)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {onboarding.status === OnboardingStatus.REQUIRES_APPROVAL && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApproveOnboarding(onboarding.id)}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRejectOnboarding(onboarding.id)}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
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

      {/* View Onboarding Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Onboarding Details</DialogTitle>
            <DialogDescription>View complete onboarding information</DialogDescription>
          </DialogHeader>
          {selectedOnboarding && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">User ID</Label>
                  <div className="font-mono text-sm">{selectedOnboarding.userId}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  {getStatusBadge(selectedOnboarding.status)}
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Progress</Label>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressBarColor(selectedOnboarding.progressPercentage)}`}
                      style={{ width: `${selectedOnboarding.progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {selectedOnboarding.progressPercentage}%
                  </span>
                </div>
              </div>

              {/* Current Step */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Current Step</Label>
                <div className="font-medium">{getStepName(selectedOnboarding.currentStep)}</div>
                {selectedOnboarding.nextStep && (
                  <div className="text-sm text-gray-500">
                    Next: {getStepName(selectedOnboarding.nextStep)}
                  </div>
                )}
              </div>

              {/* Completed Steps */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Completed Steps</Label>
                <div className="space-y-1">
                  {selectedOnboarding.completedSteps.map((step) => (
                    <div key={step} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {getStepName(step)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Timeline</Label>
                <div className="space-y-1 text-sm">
                  {selectedOnboarding.startedAt && (
                    <div>Started: {formatDate(selectedOnboarding.startedAt)}</div>
                  )}
                  {selectedOnboarding.lastStepAt && (
                    <div>Last Activity: {formatDate(selectedOnboarding.lastStepAt)}</div>
                  )}
                  {selectedOnboarding.completedAt && (
                    <div>Completed: {formatDate(selectedOnboarding.completedAt)}</div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Onboarding</DialogTitle>
            <DialogDescription>Add notes about the approval</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-notes">Notes (Optional)</Label>
              <Textarea
                id="approval-notes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalNotes("")}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedOnboarding && handleApproveOnboarding(selectedOnboarding.id)}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Onboarding</DialogTitle>
            <DialogDescription>Provide a reason for rejection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Reason *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this onboarding is being rejected..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionReason("")}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedOnboarding && handleRejectOnboarding(selectedOnboarding.id)}
              disabled={!rejectionReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
