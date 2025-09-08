import { ArrowLeft, Database, Globe, Mail, Palette, Save, Shield } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SystemSettings } from "@/types";
import { mockSystemSettings } from "@/utils/mockData";

interface SettingsFormData {
  siteName: string;
  siteDescription: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maxFileSize: number;
  sessionTimeout: number;
  passwordMinLength: number;
  twoFactorAuth: boolean;
  loginAttempts: number;
  autoBackup: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  retentionDays: number;
  smtpHost: string;
  smtpPort: number;
  fromEmail: string;
  fromName: string;
}

const initialFormData: SettingsFormData = {
  siteName: mockSystemSettings.siteName,
  siteDescription: mockSystemSettings.siteDescription,
  timezone: mockSystemSettings.timezone,
  language: mockSystemSettings.language,
  maintenanceMode: mockSystemSettings.maintenanceMode,
  registrationEnabled: mockSystemSettings.registrationEnabled,
  emailNotifications: mockSystemSettings.emailNotifications,
  smsNotifications: mockSystemSettings.smsNotifications,
  maxFileSize: mockSystemSettings.maxFileSize / 1024 / 1024, // Convert to MB
  sessionTimeout: mockSystemSettings.sessionTimeout / 60, // Convert to minutes
  passwordMinLength: mockSystemSettings.passwordPolicy.minLength,
  twoFactorAuth: mockSystemSettings.securitySettings.twoFactorAuth,
  loginAttempts: mockSystemSettings.securitySettings.loginAttempts,
  autoBackup: mockSystemSettings.backupSettings.autoBackup,
  backupFrequency: mockSystemSettings.backupSettings.backupFrequency,
  retentionDays: mockSystemSettings.backupSettings.retentionDays,
  smtpHost: mockSystemSettings.emailSettings.smtpHost,
  smtpPort: mockSystemSettings.emailSettings.smtpPort,
  fromEmail: mockSystemSettings.emailSettings.fromEmail,
  fromName: mockSystemSettings.emailSettings.fromName,
};

export default function SettingsForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SettingsFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SettingsFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SettingsFormData> = {};

    if (!formData.siteName.trim()) newErrors.siteName = "Site name is required";
    if (!formData.smtpHost.trim()) newErrors.smtpHost = "SMTP host is required";
    if (!formData.fromEmail.trim()) newErrors.fromEmail = "From email is required";
    if (formData.maxFileSize <= 0) newErrors.maxFileSize = "Max file size must be greater than 0";
    if (formData.sessionTimeout <= 0)
      newErrors.sessionTimeout = "Session timeout must be greater than 0";
    if (formData.passwordMinLength < 6)
      newErrors.passwordMinLength = "Password min length must be at least 6";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      });

      navigate("/dashboard/super-admin/settings");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SettingsFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/super-admin/settings")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Settings</h1>
          <p className="text-muted-foreground">Update system configuration and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name *</Label>
                <Input
                  id="siteName"
                  value={formData.siteName}
                  onChange={(e) => handleInputChange("siteName", e.target.value)}
                  placeholder="Enter site name"
                  className={errors.siteName ? "border-red-500" : ""}
                />
                {errors.siteName && <p className="text-sm text-red-500">{errors.siteName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => handleInputChange("timezone", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Johannesburg">Africa/Johannesburg</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={formData.siteDescription}
                onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                placeholder="Enter site description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => handleInputChange("language", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={formData.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="registrationEnabled"
                  checked={formData.registrationEnabled}
                  onCheckedChange={(checked) => handleInputChange("registrationEnabled", checked)}
                />
                <Label htmlFor="registrationEnabled">Enable Registration</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Password Min Length *</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={formData.passwordMinLength}
                  onChange={(e) =>
                    handleInputChange("passwordMinLength", parseInt(e.target.value, 10) || 0)
                  }
                  min="6"
                  max="20"
                  className={errors.passwordMinLength ? "border-red-500" : ""}
                />
                {errors.passwordMinLength && (
                  <p className="text-sm text-red-500">{errors.passwordMinLength}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes) *</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={formData.sessionTimeout}
                  onChange={(e) =>
                    handleInputChange("sessionTimeout", parseInt(e.target.value, 10) || 0)
                  }
                  min="5"
                  max="1440"
                  className={errors.sessionTimeout ? "border-red-500" : ""}
                />
                {errors.sessionTimeout && (
                  <p className="text-sm text-red-500">{errors.sessionTimeout}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                <Input
                  id="loginAttempts"
                  type="number"
                  value={formData.loginAttempts}
                  onChange={(e) =>
                    handleInputChange("loginAttempts", parseInt(e.target.value, 10) || 0)
                  }
                  min="3"
                  max="10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="twoFactorAuth"
                checked={formData.twoFactorAuth}
                onCheckedChange={(checked) => handleInputChange("twoFactorAuth", checked)}
              />
              <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host *</Label>
                <Input
                  id="smtpHost"
                  value={formData.smtpHost}
                  onChange={(e) => handleInputChange("smtpHost", e.target.value)}
                  placeholder="smtp.gmail.com"
                  className={errors.smtpHost ? "border-red-500" : ""}
                />
                {errors.smtpHost && <p className="text-sm text-red-500">{errors.smtpHost}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) => handleInputChange("smtpPort", parseInt(e.target.value, 10) || 0)}
                  placeholder="587"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email *</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) => handleInputChange("fromEmail", e.target.value)}
                  placeholder="noreply@example.com"
                  className={errors.fromEmail ? "border-red-500" : ""}
                />
                {errors.fromEmail && <p className="text-sm text-red-500">{errors.fromEmail}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={formData.fromName}
                  onChange={(e) => handleInputChange("fromName", e.target.value)}
                  placeholder="System Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                />
                <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smsNotifications"
                  checked={formData.smsNotifications}
                  onCheckedChange={(checked) => handleInputChange("smsNotifications", checked)}
                />
                <Label htmlFor="smsNotifications">Enable SMS Notifications</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select
                  value={formData.backupFrequency}
                  onValueChange={(value: "daily" | "weekly" | "monthly") =>
                    handleInputChange("backupFrequency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retentionDays">Retention Days</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  value={formData.retentionDays}
                  onChange={(e) =>
                    handleInputChange("retentionDays", parseInt(e.target.value, 10) || 0)
                  }
                  min="1"
                  max="365"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Max File Size (MB) *</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={formData.maxFileSize}
                  onChange={(e) =>
                    handleInputChange("maxFileSize", parseInt(e.target.value, 10) || 0)
                  }
                  min="1"
                  max="100"
                  className={errors.maxFileSize ? "border-red-500" : ""}
                />
                {errors.maxFileSize && <p className="text-sm text-red-500">{errors.maxFileSize}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoBackup"
                checked={formData.autoBackup}
                onCheckedChange={(checked) => handleInputChange("autoBackup", checked)}
              />
              <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/super-admin/settings")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
