import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  Filter,
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
import { ClassSection, type SchoolClass } from "@/types";
import { mockClasses, mockClassSections } from "@/utils/mockData";

export default function ClassesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classes, setClasses] = useState<SchoolClass[]>(mockClasses);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  const handleDeleteClass = async (classId: string) => {
    try {
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      toast({
        title: "Class deleted",
        description: "The class has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSection = async (classId: string, sectionId: string) => {
    try {
      setClasses((prev) =>
        prev.map((c) => {
          if (c.id === classId) {
            return {
              ...c,
              sections: c.sections.filter((s) => s.id !== sectionId),
              totalSections: c.sections.length - 1,
              totalStudents: c.sections.reduce(
                (sum, s) => (s.id !== sectionId ? sum + s.currentStudents : sum),
                0,
              ),
            };
          }
          return c;
        }),
      );
      toast({
        title: "Section deleted",
        description: "The section has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleClassExpansion = (classId: string) => {
    setExpandedClasses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

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

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || classItem.level === levelFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && classItem.isActive) ||
      (statusFilter === "inactive" && !classItem.isActive);

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getClassStats = () => {
    const totalClasses = classes.length;
    const activeClasses = classes.filter((c) => c.isActive).length;
    const totalSections = classes.reduce((sum, c) => sum + c.totalSections, 0);
    const totalStudents = classes.reduce((sum, c) => sum + c.totalStudents, 0);

    return { totalClasses, activeClasses, totalSections, totalStudents };
  };

  const stats = getClassStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Manage classes and their sections</p>
        </div>
        <Button onClick={() => navigate("/dashboard/school-admin/classes/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClasses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
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
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="nursery">Nursery</SelectItem>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="junior_secondary">Junior Secondary</SelectItem>
                <SelectItem value="senior_secondary">Senior Secondary</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
      <div className="space-y-4">
        {filteredClasses.map((classItem) => (
          <Card key={classItem.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleClassExpansion(classItem.id)}
                  >
                    {expandedClasses.has(classItem.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{classItem.name}</h3>
                      <span className="text-sm text-muted-foreground">({classItem.code})</span>
                      {getLevelBadge(classItem.level)}
                      {getStatusBadge(classItem.isActive)}
                    </div>
                    <p className="text-sm text-muted-foreground">{classItem.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <span className="sr-only">Open menu</span>
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/dashboard/school-admin/classes/${classItem.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/dashboard/school-admin/classes/edit/${classItem.id}`)
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Class
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/dashboard/school-admin/classes/${classItem.id}/sections/new`)
                        }
                        className="text-blue-600"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Section
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClass(classItem.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Class
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            {/* Class Summary */}
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sections:</span> {classItem.totalSections}
                </div>
                <div>
                  <span className="font-medium">Students:</span> {classItem.totalStudents}
                </div>
                <div>
                  <span className="font-medium">Max per Section:</span>{" "}
                  {classItem.maxStudentsPerSection}
                </div>
                <div>
                  <span className="font-medium">Subjects:</span> {classItem.subjects.length}
                </div>
              </div>

              {/* Sections List (when expanded) */}
              {expandedClasses.has(classItem.id) && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Sections</h4>
                  {classItem.sections.length > 0 ? (
                    <div className="grid gap-2">
                      {classItem.sections.map((section) => (
                        <div
                          key={section.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div>
                              <div className="font-medium">{section.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Room {section.roomNumber} • {section.currentStudents}/
                                {section.capacity} students
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {section.teacherName && (
                              <Badge variant="outline">{section.teacherName}</Badge>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Filter className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/school-admin/classes/${classItem.id}/sections/${section.id}`,
                                    )
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Section
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/school-admin/classes/${classItem.id}/sections/edit/${section.id}`,
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Section
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteSection(classItem.id, section.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Section
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No sections created yet.
                      <Button
                        variant="link"
                        onClick={() =>
                          navigate(`/dashboard/school-admin/classes/${classItem.id}/sections/new`)
                        }
                      >
                        Add first section
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No classes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || levelFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Get started by creating your first class."}
            </p>
            <Button onClick={() => navigate("/dashboard/school-admin/classes/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
