import {
  Bell,
  Database,
  Globe,
  Lock,
  Mail,
  Palette,
  RefreshCw,
  Save,
  Settings as SettingsIcon,
  Shield,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VersionCard } from "@/components/common/VersionInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { SystemSettings, UserPreferences } from "@/types";
import { mockSystemSettings, mockUserPreferences } from "@/utils/mockData";

export default function Settings() {
  const { toast } = useToast();
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(mockSystemSettings);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(mockUserPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    setSystemSettings(mockSystemSettings);
    setUserPreferences(mockUserPreferences);
    toast({
      title: "Settings reset",
      description: "Settings have been reset to default values.",
    });
  };

  const getStatusBadge = (enabled: boolean) => (
    <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "Enabled" : "Disabled"}</Badge>
  );

  useEffect(() => {
    const savedDemoMode = localStorage.getItem("demoMode");
    if (savedDemoMode !== null) {
      setSystemSettings((prev) => ({
        ...prev,
        demoMode: JSON.parse(savedDemoMode),
      }));
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage system configuration and user preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/super-admin/settings/edit")}
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            Edit Settings
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Settings */}
        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Site Name</div>
                  <div className="text-sm text-muted-foreground">{systemSettings.siteName}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Timezone</div>
                  <div className="text-sm text-muted-foreground">{systemSettings.timezone}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Language</div>
                  <div className="text-sm text-muted-foreground">
                    {systemSettings.language.toUpperCase()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Maintenance Mode</div>
                  <div>{getStatusBadge(systemSettings.maintenanceMode)}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="demoMode"
                    checked={systemSettings.demoMode}
                    onCheckedChange={(checked) => {
                      setSystemSettings((prev) => ({
                        ...prev,
                        demoMode: checked,
                      }));
                      localStorage.setItem("demoMode", JSON.stringify(checked));
                    }}
                  />
                  <label htmlFor="demoMode" className="text-sm font-medium">
                    Demo Mode
                  </label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Two-Factor Auth</div>
                  <div>{getStatusBadge(systemSettings.securitySettings.twoFactorAuth)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Login Attempts</div>
                  <div className="text-sm text-muted-foreground">
                    {systemSettings.securitySettings.loginAttempts}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Session Timeout</div>
                  <div className="text-sm text-muted-foreground">
                    {systemSettings.sessionTimeout / 60} minutes
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Password Min Length</div>
                  <div className="text-sm text-muted-foreground">
                    {systemSettings.passwordPolicy.minLength} characters
                  </div>
                </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">SMTP Host</div>
                  <div className="text-sm text-muted-foreground">
                    {systemSettings.emailSettings.smtpHost}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">From Email</div>
                  <div className="text-sm text-muted-foreground">
                    {systemSettings.emailSettings.fromEmail}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Email Notifications</div>
                  <div>{getStatusBadge(systemSettings.emailNotifications)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">SMS Notifications</div>
                  <div>{getStatusBadge(systemSettings.smsNotifications)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Settings */}
        <div className="space-y-6">
          {/* Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Auto Backup</div>
                  <div>{getStatusBadge(systemSettings.backupSettings.autoBackup)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Frequency</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {systemSettings.backupSettings.backupFrequency}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Retention</div>
                  <div className="text-sm text-muted-foreground">
                    {systemSettings.backupSettings.retentionDays} days
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">
                    {systemSettings.backupSettings.backupLocation}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                File Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Max File Size</div>
                  <div className="text-sm text-muted-foreground">
                    {systemSettings.maxFileSize / 1024 / 1024} MB
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Allowed Types</div>
                  <div className="text-sm text-muted-foreground">
                    {systemSettings.allowedFileTypes.length} types
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Allowed File Types</div>
                <div className="flex flex-wrap gap-1">
                  {systemSettings.allowedFileTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                User Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Theme</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {userPreferences.theme}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Dashboard Layout</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {userPreferences.dashboardLayout}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Email Notifications</div>
                  <div>{getStatusBadge(userPreferences.emailNotifications)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">SMS Notifications</div>
                  <div>{getStatusBadge(userPreferences.smsNotifications)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Push Notifications</div>
                  <div>{getStatusBadge(userPreferences.pushNotifications)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <div className="space-y-4">
            <VersionCard showDetails={true} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Last Updated</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(systemSettings.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Build Date</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Database className="mr-2 h-4 w-4" />
              Create Backup
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Test Email
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="mr-2 h-4 w-4" />
              Security Audit
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="mr-2 h-4 w-4" />
              Notification Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
