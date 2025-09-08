import {
  Award,
  BookOpen,
  Clock,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Subject } from "@/types";
import { mockClasses, mockSubjects, mockUsers } from "@/utils/mockData";

export default function SubjectsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      toast({
        title: "Subject deleted",
        description: "The subject has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      core: "default",
      elective: "secondary",
      optional: "outline",
    };
    return <Badge variant={variants[category] || "outline"}>{category.toUpperCase()}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      primary: "default",
      junior_secondary: "secondary",
      senior_secondary: "outline",
      all: "default",
    };
    const labels: Record<string, string> = {
      primary: "Primary",
      junior_secondary: "JSS",
      senior_secondary: "SSS",
      all: "All Levels",
    };
    return <Badge variant={variants[level] || "outline"}>{labels[level] || level}</Badge>;
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || subject.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || subject.level === levelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getTeacherNames = (teacherIds: string[]) => {
    return teacherIds
      .map((id) => {
        const teacher = mockUsers.find((u) => u.id === id);
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown Teacher";
      })
      .join(", ");
  };

  const getClassNames = (classIds: string[]) => {
    return classIds
      .map((id) => {
        const classItem = mockClasses.find((c) => c.id === id);
        return classItem ? classItem.name : "Unknown Class";
      })
      .join(", ");
  };

  const stats = {
    total: subjects.length,
    core: subjects.filter((s) => s.category === "core").length,
    elective: subjects.filter((s) => s.category === "elective").length,
    optional: subjects.filter((s) => s.category === "optional").length,
    active: subjects.filter((s) => s.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">
            Manage subjects and their assignments to classes and teachers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/school-admin/subjects/assignments")}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Assignments
          </Button>
          <Button onClick={() => navigate("/dashboard/school-admin/subjects/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core Subjects</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.core}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elective Subjects</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.elective}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optional Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.optional}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="elective">Elective</SelectItem>
                <SelectItem value="optional">Optional</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="junior_secondary">Junior Secondary</SelectItem>
                <SelectItem value="senior_secondary">Senior Secondary</SelectItem>
                <SelectItem value="all">All Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{subject.code}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/dashboard/school-admin/subjects/${subject.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/dashboard/school-admin/subjects/edit/${subject.id}`)
                      }
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Subject
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Subject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{subject.description}</p>

              <div className="flex flex-wrap gap-2">
                {getCategoryBadge(subject.category)}
                {getLevelBadge(subject.level)}
                {subject.isActive ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Credits:</span>
                  <span className="ml-1 font-medium">{subject.credits}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Hours/Week:</span>
                  <span className="ml-1 font-medium">{subject.hoursPerWeek}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Assigned Teachers:</span>
                  <p className="text-sm font-medium">
                    {subject.assignedTeachers.length > 0
                      ? getTeacherNames(subject.assignedTeachers)
                      : "No teachers assigned"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Assigned Classes:</span>
                  <p className="text-sm font-medium">
                    {subject.assignedClasses.length > 0
                      ? getClassNames(subject.assignedClasses)
                      : "No classes assigned"}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Grade Levels:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {subject.gradeLevels.slice(0, 3).map((grade) => (
                    <Badge key={grade} variant="outline" className="text-xs">
                      {grade}
                    </Badge>
                  ))}
                  {subject.gradeLevels.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{subject.gradeLevels.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No subjects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== "all" || levelFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Get started by adding your first subject."}
            </p>
            <Button onClick={() => navigate("/dashboard/school-admin/subjects/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
