import {
  AlertTriangle,
  Archive,
  Archive as ArchiveIcon,
  ArrowLeft,
  Bell,
  Building,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  FileText,
  GraduationCap,
  Info,
  Settings,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
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

const entityIcons = {
  school: Building,
  user: User,
  student: GraduationCap,
  teacher: User,
  payment: CreditCard,
  grade: FileText,
};

export default function NotificationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const foundNotification = mockNotifications.find((n) => n.id === id);
      if (foundNotification) {
        setNotification(foundNotification);
      } else {
        toast({
          title: "Notification not found",
          description: "The requested notification could not be found.",
          variant: "destructive",
        });
        navigate("/dashboard/super-admin/notifications");
      }
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading notification details...</p>
        </div>
      </div>
    );
  }

  if (!notification) {
    return null;
  }

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

  const getStatusBadge = () => {
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getEntityIcon = () => {
    if (notification.relatedEntityType) {
      const Icon = entityIcons[notification.relatedEntityType];
      return Icon ? <Icon className="h-4 w-4" /> : <Settings className="h-4 w-4" />;
    }
    return null;
  };

  const handleMarkAsRead = () => {
    if (!notification.isRead && !notification.isArchived) {
      setNotification({
        ...notification,
        isRead: true,
        readAt: new Date().toISOString(),
      });
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      });
    }
  };

  const handleArchive = () => {
    if (!notification.isArchived) {
      setNotification({
        ...notification,
        isArchived: true,
        archivedAt: new Date().toISOString(),
      });
      toast({
        title: "Notification archived",
        description: "The notification has been archived.",
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    toast({
      title: "Notification deleted",
      description: "The notification has been deleted successfully.",
    });
    navigate("/dashboard/super-admin/notifications");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/super-admin/notifications")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notifications
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{notification.title}</h1>
            <p className="text-muted-foreground">{getRelativeTime(notification.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getTypeBadge(notification.type)}
          {getPriorityBadge(notification.priority)}
          {getStatusBadge()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{notification.message}</p>
            </CardContent>
          </Card>

          {/* Metadata */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(notification.metadata).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                      <div className="text-sm">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Entity */}
          {notification.relatedEntityType && notification.relatedEntityId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getEntityIcon()}
                  Related{" "}
                  {notification.relatedEntityType.charAt(0).toUpperCase() +
                    notification.relatedEntityType.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{notification.relatedEntityType.toUpperCase()}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ID: {notification.relatedEntityId}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!notification.isRead && !notification.isArchived && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleMarkAsRead}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Read
                </Button>
              )}
              {!notification.isArchived && (
                <Button variant="outline" className="w-full justify-start" onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/dashboard/super-admin/notifications")}
              >
                <Bell className="mr-2 h-4 w-4" />
                View All Notifications
              </Button>
              <Button variant="destructive" className="w-full justify-start" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created</span>
                </div>
                <p className="font-medium">{formatDate(notification.createdAt)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last Updated</span>
                </div>
                <p className="font-medium">{formatDate(notification.updatedAt)}</p>
              </div>

              {notification.readAt && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Read At</span>
                  </div>
                  <p className="font-medium">{formatDate(notification.readAt)}</p>
                </div>
              )}

              {notification.archivedAt && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArchiveIcon className="h-4 w-4" />
                    <span>Archived At</span>
                  </div>
                  <p className="font-medium">{formatDate(notification.archivedAt)}</p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Notification ID</div>
                <p className="font-mono text-sm">{notification.id}</p>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Recipient ID</div>
                <p className="font-mono text-sm">{notification.recipientId}</p>
              </div>

              {notification.senderId && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Sender ID</div>
                  <p className="font-mono text-sm">{notification.senderId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{notification.title}"? This action cannot be undone.
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
