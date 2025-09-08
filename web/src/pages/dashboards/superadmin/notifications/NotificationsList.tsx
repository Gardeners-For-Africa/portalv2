import {
  AlertTriangle,
  Archive,
  Archive as ArchiveIcon,
  Bell,
  CheckCircle,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Info,
  MoreHorizontal,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Notification, NotificationPriority, NotificationType } from "@/types";
import { mockNotifications } from "@/utils/mockData";

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  system: Bell,
};

const typeColors = {
  info: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  system: "bg-purple-100 text-purple-800",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default function NotificationsList() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<NotificationType | "all">("all");
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read" | "archived">("all");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesPriority = filterPriority === "all" || notification.priority === filterPriority;

    let matchesStatus = true;
    if (filterStatus === "unread") matchesStatus = !notification.isRead && !notification.isArchived;
    else if (filterStatus === "read")
      matchesStatus = notification.isRead && !notification.isArchived;
    else if (filterStatus === "archived") matchesStatus = notification.isArchived;

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const handleMarkAsRead = (notification: Notification) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notification.id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
      ),
    );
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  const handleArchive = (notification: Notification) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notification.id
          ? { ...n, isArchived: true, archivedAt: new Date().toISOString() }
          : n,
      ),
    );
    toast({
      title: "Notification archived",
      description: "The notification has been archived.",
    });
  };

  const handleDelete = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedNotification) {
      setNotifications(notifications.filter((n) => n.id !== selectedNotification.id));
      toast({
        title: "Notification deleted",
        description: "The notification has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((n) =>
        !n.isRead && !n.isArchived ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
      ),
    );
    toast({
      title: "All notifications marked as read",
      description: "All unread notifications have been marked as read.",
    });
  };

  const getTypeBadge = (type: NotificationType) => {
    const Icon = typeIcons[type];
    return (
      <Badge className={typeColors[type]}>
        <Icon className="mr-1 h-3 w-3" />
        {type.toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: NotificationPriority) => (
    <Badge className={priorityColors[priority]}>{priority.toUpperCase()}</Badge>
  );

  const getStatusBadge = (notification: Notification) => {
    if (notification.isArchived) {
      return (
        <Badge variant="secondary">
          <ArchiveIcon className="mr-1 h-3 w-3" />
          ARCHIVED
        </Badge>
      );
    }
    if (notification.isRead) {
      return (
        <Badge variant="outline">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          READ
        </Badge>
      );
    }
    return (
      <Badge variant="default">
        <Clock className="mr-1 h-3 w-3" />
        UNREAD
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationStats = () => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead && !n.isArchived).length;
    const archived = notifications.filter((n) => n.isArchived).length;
    const urgent = notifications.filter((n) => n.priority === "urgent" && !n.isArchived).length;

    return { total, unread, archived, urgent };
  };

  const stats = getNotificationStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Manage and monitor system notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
          <Button onClick={() => navigate("/dashboard/super-admin/notifications/new")}>
            <Bell className="mr-2 h-4 w-4" />
            Create Notification
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.urgent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <ArchiveIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Type
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType("all")}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("info")}>Info</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("success")}>
                  Success
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("warning")}>
                  Warning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("error")}>Error</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Priority
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterPriority("all")}>
                  All Priorities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("low")}>Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("medium")}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("high")}>High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("urgent")}>
                  Urgent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("unread")}>
                  Unread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("read")}>Read</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("archived")}>
                  Archived
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 ${
                  !notification.isRead && !notification.isArchived
                    ? "border-l-4 border-l-primary bg-primary/5"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {getTypeBadge(notification.type)}
                        {getPriorityBadge(notification.priority)}
                        {getStatusBadge(notification)}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{formatDate(notification.createdAt)}</span>
                        {notification.relatedEntityType && (
                          <span className="capitalize">
                            Related: {notification.relatedEntityType}
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/dashboard/super-admin/notifications/${notification.id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {!notification.isRead && !notification.isArchived && (
                          <DropdownMenuItem onClick={() => handleMarkAsRead(notification)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Read
                          </DropdownMenuItem>
                        )}
                        {!notification.isArchived && (
                          <DropdownMenuItem onClick={() => handleArchive(notification)}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(notification)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No notifications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ||
                filterType !== "all" ||
                filterPriority !== "all" ||
                filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You're all caught up! No notifications to display."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedNotification?.title}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
