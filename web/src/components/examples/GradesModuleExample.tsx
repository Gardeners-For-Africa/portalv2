import { BookOpen, GraduationCap, TrendingUp, Users } from "lucide-react";
import React from "react";
import { withModuleAccess } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GradesModuleExampleProps {
  schoolId: string;
}

function GradesModuleContent({ schoolId }: GradesModuleExampleProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Grades Management
          </CardTitle>
          <CardDescription>Manage student grades and academic performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">94%</div>
              <div className="text-sm text-muted-foreground">Average Grade</div>
              <div className="text-xs text-green-600">+2% from last term</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">Students</div>
              <div className="text-xs text-blue-600">Active enrollments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">28</div>
              <div className="text-sm text-muted-foreground">Classes</div>
              <div className="text-xs text-purple-600">12 primary, 16 secondary</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Grade Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mathematics - Grade 10A</p>
                  <p className="text-sm text-muted-foreground">Exam results published</p>
                </div>
                <Badge variant="outline">A+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Science - Grade 9B</p>
                  <p className="text-sm text-muted-foreground">Assignment graded</p>
                </div>
                <Badge variant="outline">B+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">English - Grade 11C</p>
                  <p className="text-sm text-muted-foreground">Essay marks updated</p>
                </div>
                <Badge variant="outline">A-</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Top Performers</span>
                </div>
                <Badge variant="default">15 students</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Improving Students</span>
                </div>
                <Badge variant="secondary">23 students</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Need Support</span>
                </div>
                <Badge variant="destructive">8 students</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button>View All Grades</Button>
        <Button variant="outline">Generate Report</Button>
        <Button variant="outline">Export Data</Button>
      </div>
    </div>
  );
}

// This component will only render if the "grades" module is enabled
export default withModuleAccess(
  GradesModuleContent,
  ["grades"],
  <Card>
    <CardHeader>
      <CardTitle>Grades Module Required</CardTitle>
      <CardDescription>
        The Grades Management module is not currently enabled for your school. Contact your super
        administrator to enable this feature.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button variant="outline" disabled>
        <GraduationCap className="h-4 w-4 mr-2" />
        Grades Management
      </Button>
    </CardContent>
  </Card>,
);
