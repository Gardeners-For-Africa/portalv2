import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  LayoutGrid,
  Printer,
  Search,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { StudentAnnualResult } from "@/types";
import { mockClasses, mockStudentAnnualResults } from "@/utils/mockData";

interface StudentData {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  classSection: string;
  educationLevel: "nursery" | "primary" | "secondary";
  annualResult: StudentAnnualResult;
  averageScore: number;
  totalScore: number;
  position: number;
  isPromoted: boolean;
}

interface ClassData {
  classId: string;
  className: string;
  classLevel: string;
  sections: string[];
  students: StudentData[];
  totalStudents: number;
  averageScore: number;
  bestStudent: string;
  worstStudent: string;
  classAverage: number;
  highestAverage: number;
  lowestAverage: number;
}

export default function AnnualResultsTable() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter states
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("2024-2025");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<string>("className");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // View states
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("all");

  // Data states
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [currentStudents, setCurrentStudents] = useState<StudentData[]>([]);

  useEffect(() => {
    // Filter results based on current filters
    const filteredResults = mockStudentAnnualResults.filter((result) => {
      if (selectedAcademicYear && result.academicYear !== selectedAcademicYear) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          result.studentName.toLowerCase().includes(query) ||
          result.admissionNumber.toLowerCase().includes(query) ||
          result.className.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Group by class
    const classMap = new Map<string, ClassData>();

    filteredResults.forEach((result) => {
      if (!classMap.has(result.classId)) {
        const classItem = mockClasses.find((c) => c.id === result.classId);
        classMap.set(result.classId, {
          classId: result.classId,
          className: result.className,
          classLevel: classItem?.level || "unknown",
          sections: [],
          students: [],
          totalStudents: 0,
          averageScore: 0,
          bestStudent: "",
          worstStudent: "",
          classAverage: 0,
          highestAverage: 0,
          lowestAverage: 0,
        });
      }

      const classData = classMap.get(result.classId)!;

      // Add section if not already present
      if (!classData.sections.includes(result.classSection)) {
        classData.sections.push(result.classSection);
      }

      // Add student
      const student: StudentData = {
        studentId: result.studentId,
        studentName: result.studentName,
        admissionNumber: result.admissionNumber,
        classId: result.classId,
        className: result.className,
        classSection: result.classSection,
        educationLevel: result.educationLevel,
        annualResult: result,
        averageScore: result.averageScore,
        totalScore: result.totalScore,
        position: result.position,
        isPromoted: result.isPromoted,
      };

      classData.students.push(student);
    });

    // Calculate class-level statistics
    classMap.forEach((classData) => {
      classData.totalStudents = classData.students.length;
      classData.averageScore =
        classData.students.reduce((sum, student) => sum + student.averageScore, 0) /
        classData.students.length;
      classData.classAverage = classData.averageScore;

      if (classData.students.length > 0) {
        const bestStudent = classData.students.reduce((best, current) =>
          current.averageScore > best.averageScore ? current : best,
        );
        const worstStudent = classData.students.reduce((worst, current) =>
          current.averageScore < worst.averageScore ? current : worst,
        );
        classData.bestStudent = bestStudent.studentName;
        classData.worstStudent = worstStudent.studentName;
        classData.highestAverage = bestStudent.averageScore;
        classData.lowestAverage = worstStudent.averageScore;
      }
    });

    const classes = Array.from(classMap.values());

    // Sort classes
    classes.sort((a, b) => {
      let aValue: any = a[sortField as keyof ClassData];
      let bValue: any = b[sortField as keyof ClassData];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setClassData(classes);

    // If a class is selected, filter students for that class
    if (selectedClass) {
      const classItem = classMap.get(selectedClass);
      if (classItem) {
        let students = classItem.students;

        // Filter by section if specified
        if (selectedSection !== "all") {
          students = students.filter((student) => student.classSection === selectedSection);
        }

        // Sort students by position
        students.sort((a, b) => a.position - b.position);

        setCurrentStudents(students);
      } else {
        setCurrentStudents([]);
      }
    } else {
      setCurrentStudents([]);
    }
  }, [selectedAcademicYear, searchQuery, sortField, sortDirection, selectedClass, selectedSection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

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

  const formatScore = (score: number) => {
    return score.toFixed(1);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const handleExportPDF = () => {
    toast({
      title: "Export started",
      description: "PDF export is being prepared. You will receive a download link shortly.",
    });
  };

  const handleExportCSV = () => {
    toast({
      title: "Export started",
      description: "CSV export is being prepared. You will receive a download link shortly.",
    });
  };

  const handlePrintStudent = (student: StudentData) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Generate the print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${student.studentName} - Annual Results</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .student-info { margin-bottom: 30px; }
            .student-info table { width: 100%; border-collapse: collapse; }
            .student-info td { padding: 8px; border: 1px solid #ddd; }
            .student-info td:first-child { font-weight: bold; background-color: #f5f5f5; }
            .results-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .results-table th, .results-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .results-table th { background-color: #f5f5f5; font-weight: bold; }
            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
            .summary-card { border: 1px solid #ddd; padding: 15px; }
            .summary-card h4 { margin: 0 0 10px 0; color: #333; }
            .summary-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .position-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
            .position-1 { background-color: #ffd700; color: #000; }
            .position-2 { background-color: #c0c0c0; color: #000; }
            .position-3 { background-color: #cd7f32; color: #fff; }
            .position-other { background-color: #f8f9fa; color: #6c757d; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Student Annual Results Report</h1>
            <h2>${student.studentName}</h2>
            <p>Academic Year: ${selectedAcademicYear}</p>
          </div>

          <div class="student-info">
            <table>
              <tr>
                <td>Student Name:</td>
                <td>${student.studentName}</td>
                <td>Admission Number:</td>
                <td>${student.admissionNumber}</td>
              </tr>
              <tr>
                <td>Class:</td>
                <td>${student.className} ${student.classSection}</td>
                <td>Education Level:</td>
                <td>${student.educationLevel.charAt(0).toUpperCase() + student.educationLevel.slice(1)}</td>
              </tr>
              <tr>
                <td>Position:</td>
                <td>${student.position}${student.position === 1 ? "st" : student.position === 2 ? "nd" : student.position === 3 ? "rd" : "th"}</td>
                <td>Average Score:</td>
                <td>${formatScore(student.averageScore)}</td>
              </tr>
            </table>
          </div>

          <table class="results-table">
            <thead>
              <tr>
                <th>Term</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1st Term</td>
                <td>${student.annualResult.firstTermScore}</td>
                <td>${formatPercentage((student.annualResult.firstTermScore / 500) * 100)}</td>
                <td>${student.annualResult.firstTermScore >= 400 ? "Excellent" : student.annualResult.firstTermScore >= 300 ? "Good" : "Needs Improvement"}</td>
              </tr>
              <tr>
                <td>2nd Term</td>
                <td>${student.annualResult.secondTermScore}</td>
                <td>${formatPercentage((student.annualResult.secondTermScore / 500) * 100)}</td>
                <td>${student.annualResult.secondTermScore >= 400 ? "Excellent" : student.annualResult.secondTermScore >= 300 ? "Good" : "Needs Improvement"}</td>
              </tr>
              <tr>
                <td>3rd Term</td>
                <td>${student.annualResult.thirdTermScore}</td>
                <td>${formatPercentage((student.annualResult.thirdTermScore / 500) * 100)}</td>
                <td>${student.annualResult.thirdTermScore >= 400 ? "Excellent" : student.annualResult.thirdTermScore >= 300 ? "Good" : "Needs Improvement"}</td>
              </tr>
              <tr style="font-weight: bold; background-color: #f8f9fa;">
                <td>Total</td>
                <td>${student.annualResult.totalScore}</td>
                <td>${formatPercentage((student.annualResult.totalScore / 1500) * 100)}</td>
                <td>Overall Performance</td>
              </tr>
            </tbody>
          </table>

          <div class="summary-grid">
            <div class="summary-card">
              <h4>Performance Summary</h4>
              <div class="summary-item">
                <span>Total Score:</span>
                <span>${student.annualResult.totalScore}/1500</span>
              </div>
              <div class="summary-item">
                <span>Average Score:</span>
                <span>${formatScore(student.averageScore)}</span>
              </div>
              <div class="summary-item">
                <span>Position:</span>
                <span><span class="position-badge position-${student.position <= 3 ? student.position : "other"}">${student.position}${student.position === 1 ? "st" : student.position === 2 ? "nd" : student.position === 3 ? "rd" : "th"}</span></span>
              </div>
            </div>
            
            <div class="summary-card">
              <h4>Academic Status</h4>
              <div class="summary-item">
                <span>Promotion:</span>
                <span>${student.isPromoted ? "Promoted" : "Not Promoted"}</span>
              </div>
              <div class="summary-item">
                <span>Class:</span>
                <span>${student.className} ${student.classSection}</span>
              </div>
              <div class="summary-item">
                <span>Remarks:</span>
                <span>${student.annualResult.remarks}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
            <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>School Management Portal - Annual Results Report</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const getAcademicYears = () => {
    return ["2024-2025", "2023-2024", "2022-2023"];
  };

  const handleBackToClasses = () => {
    setSelectedClass("");
    setSelectedSection("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/school-admin/grading/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          {selectedClass && (
            <Button variant="outline" size="sm" onClick={handleBackToClasses}>
              <ChevronUp className="mr-2 h-4 w-4" />
              Back to Classes
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedClass
                ? `${classData.find((c) => c.classId === selectedClass)?.className} - Annual Results`
                : "Annual Results by Class"}
            </h1>
            <p className="text-muted-foreground">
              {selectedClass
                ? `View annual results for students in ${classData.find((c) => c.classId === selectedClass)?.className}`
                : "Select a class to view student annual results"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {getAcademicYears().map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClass && (
              <div>
                <Label htmlFor="section">Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {classData
                      .find((c) => c.classId === selectedClass)
                      ?.sections.map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={selectedClass ? "Search students..." : "Search classes..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes List or Students List */}
      {!selectedClass ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Classes ({classData.length})</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Click on a class to view student annual results
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classData.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No classes found for the selected criteria</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classData.map((classItem) => (
                  <Card
                    key={classItem.classId}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedClass(classItem.classId)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{classItem.className}</span>
                        <Badge variant="outline">{classItem.classLevel}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Students:</span>
                          <span className="font-medium">{classItem.totalStudents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Sections:</span>
                          <span className="font-medium">{classItem.sections.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Class Average:</span>
                          <span className="font-medium">{formatScore(classItem.classAverage)}</span>
                        </div>
                        {classItem.bestStudent && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Best Student:</span>
                            <span className="font-medium text-sm">{classItem.bestStudent}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Students ({currentStudents.length})</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Annual results for students in{" "}
                {classData.find((c) => c.classId === selectedClass)?.className}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No students found for the selected criteria</p>
              </div>
            ) : (
              <>
                {/* Summary Statistics */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{currentStudents.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Class Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatScore(
                          currentStudents.reduce((sum, student) => sum + student.averageScore, 0) /
                            currentStudents.length,
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Highest Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatScore(Math.max(...currentStudents.map((s) => s.averageScore)))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Lowest Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatScore(Math.min(...currentStudents.map((s) => s.averageScore)))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Students Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Admission Number</TableHead>
                        <TableHead>1st Term</TableHead>
                        <TableHead>2nd Term</TableHead>
                        <TableHead>3rd Term</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Average</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentStudents.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell className="font-medium">{student.studentName}</TableCell>
                          <TableCell>{student.admissionNumber}</TableCell>
                          <TableCell>{student.annualResult.firstTermScore}</TableCell>
                          <TableCell>{student.annualResult.secondTermScore}</TableCell>
                          <TableCell>{student.annualResult.thirdTermScore}</TableCell>
                          <TableCell className="font-bold">
                            {student.annualResult.totalScore}
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatScore(student.averageScore)}
                          </TableCell>
                          <TableCell>{getPositionBadge(student.position)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/dashboard/school-admin/grading/annual/${student.studentId}/${student.annualResult.academicYear}`,
                                  )
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintStudent(student)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
