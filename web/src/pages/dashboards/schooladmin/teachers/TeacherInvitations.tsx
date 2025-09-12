import {
  Calendar,
  Clock,
  Edit,
  Eye,
  Filter,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  UserCheck,
  UserX,
  X,
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
import { teacherInvitationService } from "@/services/teacher-invitation.service";
import {
  CreateTeacherInvitationRequest,
  InvitationFilters,
  InvitationStats,
  InvitationStatus,
  ResendInvitationRequest,
  TeacherInvitation,
  UpdateTeacherInvitationRequest,
} from "@/types/teacher-invitation";

export default function TeacherInvitations() {
  const [invitations, setInvitations] = useState<TeacherInvitation[]>([]);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<TeacherInvitation | null>(null);
  const [newInvitation, setNewInvitation] = useState<CreateTeacherInvitationRequest>({
    email: "",
    firstName: "",
    lastName: "",
    message: "",
  });
  const [editInvitation, setEditInvitation] = useState<UpdateTeacherInvitationRequest>({
    firstName: "",
    lastName: "",
    message: "",
    notes: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load invitations
  const loadInvitations = async () => {
    try {
      setLoading(true);
      const filters: InvitationFilters = {
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : (statusFilter as InvitationStatus),
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await teacherInvitationService.getInvitations(filters);
      setInvitations(response.invitations);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error("Failed to load invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const statsData = await teacherInvitationService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    loadInvitations();
    loadStats();
  }, [searchTerm, statusFilter, pagination.page]);

  // Create invitation
  const handleCreateInvitation = async () => {
    try {
      if (!newInvitation.email) return;

      await teacherInvitationService.createInvitation(newInvitation);
      setNewInvitation({ email: "", firstName: "", lastName: "", message: "" });
      setIsCreateDialogOpen(false);
      loadInvitations();
      loadStats();
    } catch (error) {
      console.error("Failed to create invitation:", error);
    }
  };

  // Update invitation
  const handleUpdateInvitation = async () => {
    try {
      if (!selectedInvitation) return;

      await teacherInvitationService.updateInvitation(selectedInvitation.id, editInvitation);
      setIsEditDialogOpen(false);
      setSelectedInvitation(null);
      loadInvitations();
    } catch (error) {
      console.error("Failed to update invitation:", error);
    }
  };

  // Resend invitation
  const handleResendInvitation = async (id: string) => {
    try {
      await teacherInvitationService.resendInvitation(id);
      loadInvitations();
    } catch (error) {
      console.error("Failed to resend invitation:", error);
    }
  };

  // Cancel invitation
  const handleCancelInvitation = async (id: string) => {
    try {
      await teacherInvitationService.cancelInvitation(id);
      loadInvitations();
      loadStats();
    } catch (error) {
      console.error("Failed to cancel invitation:", error);
    }
  };

  // Open edit dialog
  const openEditDialog = (invitation: TeacherInvitation) => {
    setSelectedInvitation(invitation);
    setEditInvitation({
      firstName: invitation.firstName || "",
      lastName: invitation.lastName || "",
      message: invitation.message || "",
      notes: "",
    });
    setIsEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (invitation: TeacherInvitation) => {
    setSelectedInvitation(invitation);
    setIsViewDialogOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: InvitationStatus) => {
    const statusConfig = {
      pending: { className: "bg-yellow-100 text-yellow-800", icon: Clock },
      accepted: { className: "bg-green-100 text-green-800", icon: UserCheck },
      declined: { className: "bg-red-100 text-red-800", icon: UserX },
      expired: { className: "bg-gray-100 text-gray-800", icon: X },
      cancelled: { className: "bg-gray-100 text-gray-800", icon: X },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if invitation is expired
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  // Get days until expiry
  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Invitations</h1>
          <p className="text-gray-600 mt-2">Manage teacher invitations and track their status</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Invite Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Invite Teacher</DialogTitle>
              <DialogDescription>
                Send an invitation to a teacher to join your school
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                  placeholder="teacher@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newInvitation.firstName}
                    onChange={(e) =>
                      setNewInvitation({ ...newInvitation, firstName: e.target.value })
                    }
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newInvitation.lastName}
                    onChange={(e) =>
                      setNewInvitation({ ...newInvitation, lastName: e.target.value })
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Personal Message</Label>
                <Textarea
                  id="message"
                  value={newInvitation.message}
                  onChange={(e) => setNewInvitation({ ...newInvitation, message: e.target.value })}
                  placeholder="Welcome to our school! We're excited to have you join our team."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateInvitation} disabled={!newInvitation.email}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations List</CardTitle>
          <CardDescription>Manage all teacher invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search invitations..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadInvitations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Invited By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading invitations...
                  </TableCell>
                </TableRow>
              ) : invitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No invitations found
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="font-medium">
                        {invitation.firstName && invitation.lastName
                          ? `${invitation.firstName} ${invitation.lastName}`
                          : "Pending"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {invitation.email}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(invitation.expiresAt)}
                        {invitation.status === "pending" && (
                          <div className="text-xs text-gray-500">
                            {getDaysUntilExpiry(invitation.expiresAt)} days left
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {invitation.inviter ? (
                        <div className="text-sm">
                          {invitation.inviter.firstName} {invitation.inviter.lastName}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Unknown</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(invitation)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {invitation.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => openEditDialog(invitation)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResendInvitation(invitation.id)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Resend
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel this invitation? This action
                                      cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancelInvitation(invitation.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Cancel Invitation
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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

      {/* Edit Invitation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Invitation</DialogTitle>
            <DialogDescription>Update invitation details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={editInvitation.firstName}
                  onChange={(e) =>
                    setEditInvitation({ ...editInvitation, firstName: e.target.value })
                  }
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={editInvitation.lastName}
                  onChange={(e) =>
                    setEditInvitation({ ...editInvitation, lastName: e.target.value })
                  }
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMessage">Personal Message</Label>
              <Textarea
                id="editMessage"
                value={editInvitation.message}
                onChange={(e) => setEditInvitation({ ...editInvitation, message: e.target.value })}
                placeholder="Welcome to our school!"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                value={editInvitation.notes}
                onChange={(e) => setEditInvitation({ ...editInvitation, notes: e.target.value })}
                placeholder="Internal notes about this invitation"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateInvitation}>Update Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invitation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Invitation Details</DialogTitle>
            <DialogDescription>View complete invitation information</DialogDescription>
          </DialogHeader>
          {selectedInvitation && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {selectedInvitation.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  {getStatusBadge(selectedInvitation.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">First Name</Label>
                  <div>{selectedInvitation.firstName || "Not provided"}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                  <div>{selectedInvitation.lastName || "Not provided"}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Personal Message</Label>
                <div className="text-sm text-gray-700">
                  {selectedInvitation.message || "No message provided"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Expires At</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(selectedInvitation.expiresAt)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Days Left</Label>
                  <div className="text-sm">
                    {selectedInvitation.status === "pending"
                      ? `${getDaysUntilExpiry(selectedInvitation.expiresAt)} days`
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Invited By</Label>
                <div>
                  {selectedInvitation.inviter
                    ? `${selectedInvitation.inviter.firstName} ${selectedInvitation.inviter.lastName}`
                    : "Unknown"}
                </div>
              </div>

              {selectedInvitation.acceptedAt && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Accepted At</Label>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    {formatDate(selectedInvitation.acceptedAt)}
                  </div>
                </div>
              )}

              {selectedInvitation.declinedAt && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Declined At</Label>
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-red-600" />
                    {formatDate(selectedInvitation.declinedAt)}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
