import {
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import React from "react";
import { AvailableModules } from "@/components/common";
import { StatsCard } from "@/components/common/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SchoolAdminDashboard() {
  // Mock data - in real implementation, this would come from API
  const mockSchoolId = "demo-school-1";
  const mockSchoolName = "Demo School";

  const stats = [
    {
      title: "Total Students",
      value: "1,247",
      description: "+12% from last month",
      icon: Users,
      variant: "primary" as const,
    },
    {
      title: "Active Teachers",
      value: "45",
      description: "+3 new this month",
      icon: GraduationCap,
      variant: "success" as const,
    },
    {
      title: "Classes",
      value: "28",
      description: "12 primary, 16 secondary",
      icon: BookOpen,
      variant: "secondary" as const,
    },
    {
      title: "Notifications",
      value: "23",
      description: "8 unread",
      icon: Bell,
      variant: "default" as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">Welcome back, Admin</h1>
          <p className="text-muted-foreground">
            Here's what's happening at {mockSchoolName} today.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Modules */}
        <div className="lg:col-span-1">
          <AvailableModules schoolId={mockSchoolId} schoolName={mockSchoolName} />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Manage Students</h4>
                      <p className="text-xs text-muted-foreground">Add, edit, or view students</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                      <GraduationCap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">View Grades</h4>
                      <p className="text-xs text-muted-foreground">Check student performance</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Class Schedules</h4>
                      <p className="text-xs text-muted-foreground">Manage timetables</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                      <Bell className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Send Notifications</h4>
                      <p className="text-xs text-muted-foreground">Communicate with users</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New student enrolled</p>
                    <p className="text-xs text-muted-foreground">John Doe added to Grade 10A</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Grades updated</p>
                    <p className="text-xs text-muted-foreground">
                      Mathematics exam results published
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">4 hours ago</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                    <Bell className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Notification sent</p>
                    <p className="text-xs text-muted-foreground">Parent meeting reminder sent</p>
                  </div>
                  <span className="text-xs text-muted-foreground">6 hours ago</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                    <BookOpen className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Schedule updated</p>
                    <p className="text-xs text-muted-foreground">Class 9B timetable modified</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Overview
          </CardTitle>
          <CardDescription>Key performance indicators and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-muted-foreground">Attendance Rate</div>
              <div className="text-xs text-green-600">+2% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">87%</div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
              <div className="text-xs text-blue-600">+5% from last term</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">156</div>
              <div className="text-sm text-muted-foreground">Active Parents</div>
              <div className="text-xs text-purple-600">+12 new this month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
