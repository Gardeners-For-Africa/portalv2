import {
  ArrowLeft,
  Award,
  BarChart3,
  Calculator,
  Calendar,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  LayoutGrid,
  Printer,
  Search,
  TableIcon,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { type ClassResult, StudentResult } from "@/types";
import { mockClasses, mockClassResults, mockStudentResults } from "@/utils/mockData";

export default function AnnualResults() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<ClassResult[]>(mockClassResults);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("all");

  const getGradeBadge = (grade: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      A: "default",
      B: "secondary",
      C: "outline",
      D: "outline",
      E: "destructive",
      F: "destructive",
    };
    return <Badge variant={variants[grade] || "outline"}>{grade}</Badge>;
  };

  const getPositionBadge = (position: number) => {
    if (position === 1)
      return (
        <Badge variant="default" className="bg-yellow-600">
          1st
        </Badge>
      );
    if (position === 2)
      return (
        <Badge variant="default" className="bg-gray-600">
          2nd
        </Badge>
      );
    if (position === 3)
      return (
        <Badge variant="default" className="bg-orange-600">
          3rd
        </Badge>
      );
    return <Badge variant="outline">{position}th</Badge>;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.classId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = classFilter === "all" || result.classId === classFilter;
    const matchesYear = academicYearFilter === "all" || result.academicYear === academicYearFilter;

    return matchesSearch && matchesClass && matchesYear;
  });

  const stats = {
    totalClasses: results.length,
    totalStudents: results.reduce((sum, r) => sum + r.totalStudents, 0),
    averageClassScore:
      results.reduce((sum, r) => sum + r.averageClassScore, 0) / results.length || 0,
    totalSubjects: results.reduce((sum, r) => sum + r.totalSubjects, 0),
  };

  const handleViewDetails = (resultId: string) => {
    navigate(`/dashboard/school-admin/grading/class-results/${resultId}`);
  };

  const handleExportPDF = () => {
    toast({
      title: "Export started",
      description: "PDF export is being prepared. You will receive a download link shortly.",
    });
  };

  const handleExportExcel = () => {
    toast({
      title: "Export started",
      description: "Excel export is being prepared. You will receive a download link shortly.",
    });
  };

  const getClassName = (classId: string) => {
    const classItem = mockClasses.find((c) => c.id === classId);
    return classItem ? classItem.name : "Unknown Class";
  };

  const getTermLabel = (term: string) => {
    const labels: Record<string, string> = {
      first_term: "First Term",
      second_term: "Second Term",
      third_term: "Third Term",
      annual: "Annual",
    };
    return labels[term] || term;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/school-admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Annual Results</h1>
            <p className="text-muted-foreground">
              View and analyze class performance for the academic year
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => navigate("/dashboard/school-admin/grading/annual-results")}>
            <TableIcon className="mr-2 h-4 w-4" />
            Tabular View
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/school-admin/grading/annual-cards")}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Card View
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Class Score</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageClassScore.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
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
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {mockClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Class Results Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResults.map((result) => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{getClassName(result.classId)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {result.academicYear} • {getTermLabel(result.term)}
                  </p>
                </div>
                <Badge variant="outline">{result.totalStudents} students</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Performance Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(result.averageClassPercentage)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.totalSubjects}</div>
                  <div className="text-sm text-muted-foreground">Subjects</div>
                </div>
              </div>

              {/* Grade Distribution */}
              <div>
                <h4 className="font-medium mb-2">Grade Distribution</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span>Grade A</span>
                    </span>
                    <span className="font-medium">{result.gradeDistribution.a}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span>Grade B</span>
                    </span>
                    <span className="font-medium">{result.gradeDistribution.b}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <span>Grade C</span>
                    </span>
                    <span className="font-medium">{result.gradeDistribution.c}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                      <span>Grade D</span>
                    </span>
                    <span className="font-medium">{result.gradeDistribution.d}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span>Grade E & F</span>
                    </span>
                    <span className="font-medium">
                      {result.gradeDistribution.e + result.gradeDistribution.f}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div>
                <h4 className="font-medium mb-2">Top Performers</h4>
                <div className="space-y-2">
                  {result.topStudents.slice(0, 3).map((student, index) => (
                    <div
                      key={student.studentId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        {index === 0 && <Trophy className="h-3 w-3 text-yellow-600" />}
                        {index === 1 && <Trophy className="h-3 w-3 text-gray-600" />}
                        {index === 2 && <Trophy className="h-3 w-3 text-orange-600" />}
                        <span className="font-medium">{student.studentName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{formatPercentage(student.averageScore)}</span>
                        {getGradeBadge(student.letterGrade)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Performance */}
              <div>
                <h4 className="font-medium mb-2">Subject Performance</h4>
                <div className="space-y-2">
                  {result.subjectPerformance.slice(0, 3).map((subject) => (
                    <div
                      key={subject.subjectId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate">{subject.subjectName}</span>
                      <div className="flex items-center space-x-2">
                        <span>{formatPercentage(subject.averagePercentage)}</span>
                        <Badge variant="outline" className="text-xs">
                          {subject.passRate}% pass
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {result.subjectPerformance.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{result.subjectPerformance.length - 3} more subjects
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleViewDetails(result.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Detailed Results
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || classFilter !== "all" || academicYearFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "No class results have been recorded yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
