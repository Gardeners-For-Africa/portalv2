import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NotificationType, NotificationPriority } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface NotificationFormData {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipientId: string;
}

const initialFormData: NotificationFormData = {
  title: '',
  message: '',
  type: 'info',
  priority: 'medium',
  recipientId: '',
};

export default function NotificationForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<NotificationFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<NotificationFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<NotificationFormData> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.recipientId.trim()) newErrors.recipientId = 'Recipient is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Notification created",
        description: "The notification has been created successfully.",
      });

      navigate('/dashboard/super-admin/notifications');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof NotificationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/super-admin/notifications')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notifications
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Notification</h1>
          <p className="text-muted-foreground">Send a new notification to users</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter notification title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Enter notification message"
                rows={4}
                className={errors.message ? 'border-red-500' : ''}
              />
              {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: NotificationType) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: NotificationPriority) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientId">Recipient ID *</Label>
                <Input
                  id="recipientId"
                  value={formData.recipientId}
                  onChange={(e) => handleInputChange('recipientId', e.target.value)}
                  placeholder="Enter recipient user ID"
                  className={errors.recipientId ? 'border-red-500' : ''}
                />
                {errors.recipientId && <p className="text-sm text-red-500">{errors.recipientId}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/super-admin/notifications')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Creating...' : 'Create Notification'}
          </Button>
        </div>
      </form>
    </div>
  );
}
