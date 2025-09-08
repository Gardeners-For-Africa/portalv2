import {
  ArrowUp,
  Award,
  Calendar,
  Edit,
  Eye,
  Filter,
  GraduationCap,
  MapPin,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { AcademicStatus, Student, StudentStatus } from "@/types";
import { mockStudents } from "@/utils/mockData";

export default function StudentsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [enrollmentFilter, setEnrollmentFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      toast({
        title: "Student deleted",
        description: "The student has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePromoteStudent = async (studentId: string) => {
    try {
      setStudents((prev) =>
        prev.map((student) => {
          if (student.id === studentId) {
            // This would typically involve more complex logic
            return {
              ...student,
              gradeLevel: getNextGrade(student.gradeLevel),
              academicYear: "2025-2026",
            };
          }
          return student;
        }),
      );
      toast({
        title: "Student promoted",
        description: "The student has been promoted to the next grade.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to promote student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGraduateStudent = async (studentId: string) => {
    try {
      setStudents((prev) =>
        prev.map((student) => {
          if (student.id === studentId) {
            return {
              ...student,
              enrollmentStatus: "graduated" as StudentStatus,
              academicStatus: "graduated" as AcademicStatus,
            };
          }
          return student;
        }),
      );
      toast({
        title: "Student graduated",
        description: "The student has been graduated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to graduate student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getNextGrade = (currentGrade: string): string => {
    const gradeProgression: Record<string, string> = {
      "Basic 1": "Basic 2",
      "Basic 2": "Basic 3",
      "Basic 3": "Basic 4",
      "Basic 4": "Basic 5",
      "Basic 5": "Basic 6",
      "Basic 6": "JSS 1",
      "JSS 1": "JSS 2",
      "JSS 2": "JSS 3",
      "JSS 3": "SSS 1",
      "SSS 1": "SSS 2",
      "SSS 2": "SSS 3",
      "SSS 3": "Graduated",
    };
    return gradeProgression[currentGrade] || currentGrade;
  };

  const getStatusBadge = (status: StudentStatus) => {
    const variants: Record<StudentStatus, "default" | "secondary" | "outline" | "destructive"> = {
      enrolled: "default",
      pending: "outline",
      withdrawn: "destructive",
      graduated: "secondary",
      suspended: "destructive",
    };
    return <Badge variant={variants[status]}>{status.replace("_", " ").toUpperCase()}</Badge>;
  };

  const getAcademicStatusBadge = (status: AcademicStatus) => {
    const variants: Record<AcademicStatus, "default" | "secondary" | "outline" | "destructive"> = {
      active: "default",
      inactive: "secondary",
      on_leave: "outline",
      graduated: "secondary",
    };
    return <Badge variant={variants[status]}>{status.replace("_", " ").toUpperCase()}</Badge>;
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || student.enrollmentStatus === statusFilter;
    const matchesEnrollment =
      enrollmentFilter === "all" || student.academicStatus === enrollmentFilter;
    const matchesGrade = gradeFilter === "all" || student.gradeLevel === gradeFilter;

    return matchesSearch && matchesStatus && matchesEnrollment && matchesGrade;
  });

  const getStudentStats = () => {
    const totalStudents = students.length;
    const enrolledStudents = students.filter((s) => s.enrollmentStatus === "enrolled").length;
    const activeStudents = students.filter((s) => s.academicStatus === "active").length;
    const graduatedStudents = students.filter((s) => s.enrollmentStatus === "graduated").length;
    const pendingStudents = students.filter((s) => s.enrollmentStatus === "pending").length;

    return { totalStudents, enrolledStudents, activeStudents, graduatedStudents, pendingStudents };
  };

  const stats = getStudentStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student admissions, enrollments, and academic progression
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/school-admin/students/table")}
          >
            <Filter className="mr-2 h-4 w-4" />
            Table View
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/school-admin/students/promote")}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Promote Students
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/school-admin/students/graduate")}
          >
            <Award className="mr-2 h-4 w-4" />
            Graduation
          </Button>
          <Button onClick={() => navigate("/dashboard/school-admin/students/new")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Admit Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduated</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.graduatedStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingStudents}</div>
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
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Enrollment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={enrollmentFilter} onValueChange={setEnrollmentFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Academic status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Academic</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Grade level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="Basic 1">Basic 1</SelectItem>
                <SelectItem value="Basic 2">Basic 2</SelectItem>
                <SelectItem value="Basic 3">Basic 3</SelectItem>
                <SelectItem value="JSS 1">JSS 1</SelectItem>
                <SelectItem value="SSS 1">SSS 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.map((student) => (
          <Card key={student.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={student.avatar}
                      alt={`${student.firstName} ${student.lastName}`}
                    />
                    <AvatarFallback>
                      {getInitials(student.firstName, student.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">
                        {student.firstName} {student.lastName}
                      </h3>
                      <span className="text-sm text-muted-foreground">({student.studentId})</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{student.gradeLevel}</Badge>
                      {student.currentSectionName && (
                        <Badge variant="outline">{student.currentSectionName}</Badge>
                      )}
                      {getStatusBadge(student.enrollmentStatus)}
                      {getAcademicStatusBadge(student.academicStatus)}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Admitted: {formatDate(student.admissionDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {student.address.city}, {student.address.state}
                        </span>
                      </div>
                    </div>
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
                        onClick={() => navigate(`/dashboard/school-admin/students/${student.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/dashboard/school-admin/students/edit/${student.id}`)
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Student
                      </DropdownMenuItem>
                      {student.enrollmentStatus === "enrolled" &&
                        student.academicStatus === "active" && (
                          <DropdownMenuItem onClick={() => handlePromoteStudent(student.id)}>
                            <ArrowUp className="mr-2 h-4 w-4" />
                            Promote Student
                          </DropdownMenuItem>
                        )}
                      {student.gradeLevel === "SSS 3" &&
                        student.enrollmentStatus === "enrolled" && (
                          <DropdownMenuItem onClick={() => handleGraduateStudent(student.id)}>
                            <Award className="mr-2 h-4 w-4" />
                            Graduate Student
                          </DropdownMenuItem>
                        )}
                      <DropdownMenuItem
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No students found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ||
              statusFilter !== "all" ||
              enrollmentFilter !== "all" ||
              gradeFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Get started by admitting your first student."}
            </p>
            <Button onClick={() => navigate("/dashboard/school-admin/students/new")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Admit Student
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
