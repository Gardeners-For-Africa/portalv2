import {
  Award,
  BarChart3,
  BookOpen,
  Calculator,
  Calendar,
  FileText,
  Settings,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GradingDashboard() {
  const navigate = useNavigate();

  const gradingFeatures = [
    {
      title: "Grading Settings",
      description: "Configure grade boundaries, points, and grading parameters for your school",
      icon: Settings,
      url: "/dashboard/school-admin/grading/settings",
      color: "bg-blue-500",
      stats: {
        label: "Active Parameters",
        value: "1",
      },
    },
    {
      title: "Exams Management",
      description: "Create and manage school examinations, schedules, and exam details",
      icon: BookOpen,
      url: "/dashboard/school-admin/grading/exams",
      color: "bg-indigo-500",
      stats: {
        label: "Active Exams",
        value: "3",
      },
    },
    {
      title: "Student Scores",
      description: "Manage individual student scores, grades, and academic performance",
      icon: FileText,
      url: "/dashboard/school-admin/grading/scores",
      color: "bg-green-500",
      stats: {
        label: "Total Scores",
        value: "150",
      },
    },
    {
      title: "Bulk Updates",
      description: "Perform bulk operations on grades and scores with file uploads",
      icon: Calculator,
      url: "/dashboard/school-admin/grading/bulk-updates",
      color: "bg-orange-500",
      stats: {
        label: "Pending Updates",
        value: "5",
      },
    },
    {
      title: "Termly Results",
      description: "View and manage student academic performance by term",
      icon: FileText,
      url: "/dashboard/school-admin/grading/termly-results",
      color: "bg-green-500",
      stats: {
        label: "Total Results",
        value: "3",
      },
    },
    {
      title: "Annual Results",
      description: "View and analyze class performance for the academic year",
      icon: BarChart3,
      url: "/dashboard/school-admin/grading/annual-results",
      color: "bg-purple-500",
      stats: {
        label: "Class Reports",
        value: "1",
      },
    },
  ];

  const quickStats = [
    {
      title: "Total Students",
      value: "25",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Classes",
      value: "5",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Subjects",
      value: "8",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Academic Year",
      value: "2024-2025",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grading Dashboard</h1>
          <p className="text-muted-foreground">
            Manage student grades, results, and academic performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Award className="mr-1 h-3 w-3" />
            Grading System Active
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grading Features */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {gradingFeatures.map((feature, index) => (
          <Card
            key={index}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(feature.url)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-full ${feature.color} bg-opacity-10`}>
                  <feature.icon className={`h-6 w-6 ${feature.color.replace("bg-", "text-")}`} />
                </div>
                <Badge variant="outline" className="text-xs">
                  {feature.stats.value} {feature.stats.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                Access {feature.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Recent Grading Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Calculator className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">First Term Results Published</p>
                  <p className="text-sm text-muted-foreground">
                    Basic 1 class results have been published
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                2 hours ago
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Grading Parameters Updated</p>
                  <p className="text-sm text-muted-foreground">
                    Grade boundaries have been modified
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                1 day ago
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Annual Report Generated</p>
                  <p className="text-sm text-muted-foreground">
                    Class performance report for 2024-2025
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                3 days ago
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gradingFeatures.map((feature) => (
              <Button
                key={feature.title}
                variant="outline"
                className="h-32 flex flex-col items-center justify-center space-y-3 p-4"
                onClick={() => navigate(feature.url)}
              >
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {feature.stats.label}: {feature.stats.value}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
