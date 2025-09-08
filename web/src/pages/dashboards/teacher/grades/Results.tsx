import {
  BarChart3,
  BookOpen,
  Calendar,
  Download,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Student {
  id: string;
  name: string;
  studentId: string;
  avatar?: string;
  class: string;
  grade: string;
  subjects: SubjectResult[];
  averageScore: number;
  overallGrade: string;
  term: string;
  academicYear: string;
  lastUpdated: string;
}

interface SubjectResult {
  name: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  rank: number;
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Emma Wilson",
    studentId: "ST001",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    class: "Form 3A",
    grade: "Grade 9",
    subjects: [
      { name: "Mathematics", score: 85, totalMarks: 100, percentage: 85, grade: "A", rank: 3 },
      { name: "Physics", score: 92, totalMarks: 100, percentage: 92, grade: "A+", rank: 1 },
      { name: "Chemistry", score: 78, totalMarks: 100, percentage: 78, grade: "B+", rank: 5 },
      { name: "English", score: 88, totalMarks: 100, percentage: 88, grade: "A", rank: 2 },
    ],
    averageScore: 85.8,
    overallGrade: "A",
    term: "Term 1",
    academicYear: "2024",
    lastUpdated: "2024-03-15",
  },
  {
    id: "2",
    name: "James Brown",
    studentId: "ST002",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    class: "Form 3A",
    grade: "Grade 9",
    subjects: [
      { name: "Mathematics", score: 92, totalMarks: 100, percentage: 92, grade: "A+", rank: 1 },
      { name: "Physics", score: 88, totalMarks: 100, percentage: 88, grade: "A", rank: 2 },
      { name: "Chemistry", score: 85, totalMarks: 100, percentage: 85, grade: "A", rank: 3 },
      { name: "English", score: 90, totalMarks: 100, percentage: 90, grade: "A+", rank: 1 },
    ],
    averageScore: 88.8,
    overallGrade: "A+",
    term: "Term 1",
    academicYear: "2024",
    lastUpdated: "2024-03-15",
  },
  {
    id: "3",
    name: "Sophia Davis",
    studentId: "ST003",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    class: "Form 3A",
    grade: "Grade 9",
    subjects: [
      { name: "Mathematics", score: 78, totalMarks: 100, percentage: 78, grade: "B+", rank: 6 },
      { name: "Physics", score: 82, totalMarks: 100, percentage: 82, grade: "A", rank: 4 },
      { name: "Chemistry", score: 75, totalMarks: 100, percentage: 75, grade: "B+", rank: 7 },
      { name: "English", score: 85, totalMarks: 100, percentage: 85, grade: "A", rank: 3 },
    ],
    averageScore: 80.0,
    overallGrade: "B+",
    term: "Term 1",
    academicYear: "2024",
    lastUpdated: "2024-03-15",
  },
];

export default function Results() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [termFilter, setTermFilter] = useState<string>("all");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("all");

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || student.class === classFilter;
    const matchesTerm = termFilter === "all" || student.term === termFilter;
    const matchesYear = academicYearFilter === "all" || student.academicYear === academicYearFilter;
    return matchesSearch && matchesClass && matchesTerm && matchesYear;
  });

  const getGradeBadge = (grade: string) => {
    const gradeConfig = {
      "A+": { className: "bg-green-100 text-green-800" },
      A: { className: "bg-green-100 text-green-800" },
      "B+": { className: "bg-blue-100 text-blue-800" },
      B: { className: "bg-blue-100 text-blue-800" },
      "C+": { className: "bg-yellow-100 text-yellow-800" },
      C: { className: "bg-yellow-100 text-yellow-800" },
      D: { className: "bg-orange-100 text-orange-800" },
      F: { className: "bg-red-100 text-red-800" },
    };

    const config = gradeConfig[grade as keyof typeof gradeConfig];
    return config ? (
      <Badge className={config.className}>{grade}</Badge>
    ) : (
      <Badge variant="outline">{grade}</Badge>
    );
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const handleViewResults = (student: Student) => {
    // Navigate to student results page with session and term parameters
    navigate(`/dashboard/teacher/grades/student-results/${student.id}`, {
      state: {
        student,
        term: student.term,
        academicYear: student.academicYear,
      },
    });
  };

  const getUniqueClasses = () => [...new Set(mockStudents.map((student) => student.class))];
  const getUniqueTerms = () => [...new Set(mockStudents.map((student) => student.term))];
  const getUniqueYears = () => [...new Set(mockStudents.map((student) => student.academicYear))];

  const getStats = () => {
    const totalStudents = mockStudents.length;
    const averageScore = mockStudents.reduce((sum, s) => sum + s.averageScore, 0) / totalStudents;
    const topPerformers = mockStudents.filter(
      (s) => s.overallGrade === "A+" || s.overallGrade === "A",
    ).length;
    const needImprovement = mockStudents.filter(
      (s) => s.overallGrade === "D" || s.overallGrade === "F",
    ).length;

    return {
      totalStudents,
      averageScore: Math.round(averageScore),
      topPerformers,
      needImprovement,
    };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Results</h1>
          <p className="text-gray-600 mt-2">View and analyze student academic performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Results
          </Button>
          <Button className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter students by class, term, and academic year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Students</Label>
              <Input
                id="search"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="class">Class</Label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {getUniqueClasses().map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="term">Term</Label>
              <Select value={termFilter} onValueChange={setTermFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {getUniqueTerms().map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="year">Academic Year</Label>
              <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {getUniqueYears().map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.averageScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.topPerformers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Improvement</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.needImprovement}</div>
          </CardContent>
        </Card>
      </div>

      {/* Students Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Results Overview</CardTitle>
          <CardDescription>View all students and their academic performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class & Grade</TableHead>
                <TableHead>Subjects Performance</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Overall Grade</TableHead>
                <TableHead>Term & Year</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">ID: {student.studentId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.class}</div>
                      <div className="text-sm text-gray-500">{student.grade}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {student.subjects.slice(0, 3).map((subject, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="w-20 truncate">{subject.name}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${getPerformanceColor(subject.percentage)}`}
                            >
                              {subject.percentage}%
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {subject.grade}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {student.subjects.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{student.subjects.length - 3} more subjects
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getPerformanceColor(student.averageScore)}`}>
                        {student.averageScore}%
                      </span>
                      <Progress value={student.averageScore} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>{getGradeBadge(student.overallGrade)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{student.term}</div>
                      <div className="text-xs text-gray-500">{student.academicYear}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">{student.lastUpdated}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewResults(student)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Results
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Performance Analysis
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Download Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
