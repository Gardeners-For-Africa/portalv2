import { Building, GraduationCap, Plus, Settings, TrendingUp, Users } from "lucide-react";
import React from "react";
import { StatsCard, VersionBadge } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDashboardStats } from "@/utils/mockData";

const recentSchools = [
  {
    id: "1",
    name: "Green Valley International School",
    location: "New York, NY",
    students: 1285,
    teachers: 74,
    status: "active",
    lastActivity: "2 hours ago",
  },
  {
    id: "2",
    name: "Bright Minds Academy",
    location: "Los Angeles, CA",
    students: 892,
    teachers: 52,
    status: "active",
    lastActivity: "5 hours ago",
  },
  {
    id: "3",
    name: "Future Leaders School",
    location: "Chicago, IL",
    students: 654,
    teachers: 38,
    status: "pending",
    lastActivity: "1 day ago",
  },
];

const systemAlerts = [
  {
    id: "1",
    type: "warning",
    title: "Server Maintenance Scheduled",
    description: "Maintenance window scheduled for Sunday 2:00 AM - 4:00 AM EST",
    time: "10 minutes ago",
  },
  {
    id: "2",
    type: "info",
    title: "New School Registration",
    description: "Future Leaders School has completed their registration process",
    time: "2 hours ago",
  },
  {
    id: "3",
    type: "success",
    title: "Payment Processed",
    description: "Monthly subscription payment received from Green Valley School",
    time: "1 day ago",
  },
];

export default function SuperAdminDashboard() {
  const stats = mockDashboardStats.super_admin;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-poppins font-bold text-foreground">System Overview</h1>
            <VersionBadge />
          </div>
          <p className="text-muted-foreground">
            Monitor and manage all schools across the platform
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add New School
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Schools"
          value={stats.totalSchools}
          description="Active institutions"
          icon={Building}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          description="Across all schools"
          icon={GraduationCap}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Total Teachers"
          value={stats.totalTeachers}
          description="Active educators"
          icon={Users}
          variant="default"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="System Health"
          value="99.9%"
          description="Uptime this month"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Schools */}
        <Card className="card-interactive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Recent Schools
            </CardTitle>
            <CardDescription>Latest school registrations and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSchools.map((school) => (
                <div
                  key={school.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{school.name}</h4>
                      <Badge
                        variant={school.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {school.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{school.location}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{school.students} students</span>
                      <span>{school.teachers} teachers</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{school.lastActivity}</p>
                    <Button variant="ghost" size="sm" className="mt-1">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="card-interactive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              System Alerts
            </CardTitle>
            <CardDescription>Important system notifications and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex gap-3 p-3 rounded-lg border border-border">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      alert.type === "warning"
                        ? "bg-warning"
                        : alert.type === "success"
                          ? "bg-success"
                          : "bg-primary"
                    }`}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
