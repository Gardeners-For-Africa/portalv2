import {
  ArrowLeft,
  BookOpen,
  Building,
  Calendar,
  Edit,
  GraduationCap,
  MapPin,
  Plus,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ClassSection, type SchoolClass } from "@/types";
import { mockClasses, mockClassSections } from "@/utils/mockData";

export default function ClassDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [classItem, setClassItem] = useState<SchoolClass | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundClass = mockClasses.find((c) => c.id === id);
      if (foundClass) {
        setClassItem(foundClass);
      } else {
        toast({
          title: "Class not found",
          description: "The requested class could not be found.",
          variant: "destructive",
        });
        navigate("/dashboard/school-admin/classes");
      }
    }
    setLoading(false);
  }, [id, navigate, toast]);

  const getLevelBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      nursery: "default",
      primary: "secondary",
      junior_secondary: "outline",
      senior_secondary: "default",
    };
    return (
      <Badge variant={variants[level] || "secondary"}>
        {level.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classItem) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/school-admin/classes")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold tracking-tight">{classItem.name}</h1>
              <span className="text-lg text-muted-foreground">({classItem.code})</span>
              {getLevelBadge(classItem.level)}
              {getStatusBadge(classItem.isActive)}
            </div>
            <p className="text-muted-foreground">{classItem.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/school-admin/classes/${classItem.id}/sections/new`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
          <Button onClick={() => navigate(`/dashboard/school-admin/classes/edit/${classItem.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Class
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Class Information */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Class Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Class Name</div>
                  <div className="text-lg font-semibold">{classItem.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Class Code</div>
                  <div className="text-lg font-semibold">{classItem.code}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Level</div>
                  <div className="flex items-center gap-2">{getLevelBadge(classItem.level)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Grade</div>
                  <div className="text-lg font-semibold">{classItem.grade}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Academic Year</div>
                  <div className="text-lg font-semibold">{classItem.academicYear}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Max Students per Section
                  </div>
                  <div className="text-lg font-semibold">{classItem.maxStudentsPerSection}</div>
                </div>
              </div>
              {classItem.description && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <div className="text-sm">{classItem.description}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sections ({classItem.sections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classItem.sections.length > 0 ? (
                <div className="space-y-4">
                  {classItem.sections.map((section) => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-lg">{section.name}</h4>
                          <Badge variant="outline">
                            {section.currentStudents}/{section.capacity} students
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/dashboard/school-admin/classes/${classItem.id}/sections/${section.id}`,
                            )
                          }
                        >
                          View Details
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>Room {section.roomNumber}</span>
                        </div>
                        {section.teacherName && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{section.teacherName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{section.academicYear}</span>
                        </div>
                        <div>{getStatusBadge(section.isActive)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sections created</h3>
                  <p className="text-muted-foreground mb-4">
                    This class doesn't have any sections yet. Create the first section to get
                    started.
                  </p>
                  <Button
                    onClick={() =>
                      navigate(`/dashboard/school-admin/classes/${classItem.id}/sections/new`)
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Section
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subjects ({classItem.subjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {classItem.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Sections</span>
                <span className="text-lg font-semibold">{classItem.totalSections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Students</span>
                <span className="text-lg font-semibold">{classItem.totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average per Section</span>
                <span className="text-lg font-semibold">
                  {classItem.totalSections > 0
                    ? Math.round(classItem.totalStudents / classItem.totalSections)
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Utilization</span>
                <span className="text-lg font-semibold">
                  {classItem.totalSections > 0
                    ? Math.round(
                        (classItem.totalStudents /
                          (classItem.totalSections * classItem.maxStudentsPerSection)) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
            </CardContent>
          </Card>

          {/* School Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">School</div>
                <div className="font-semibold">{classItem.schoolName}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">School ID</div>
                <div className="font-mono text-sm">{classItem.schoolId}</div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Created</div>
                <div className="text-sm">{formatDate(classItem.createdAt)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                <div className="text-sm">{formatDate(classItem.updatedAt)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  navigate(`/dashboard/school-admin/classes/${classItem.id}/sections/new`)
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/dashboard/school-admin/classes/edit/${classItem.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Class
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/dashboard/school-admin/classes")}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View All Classes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
