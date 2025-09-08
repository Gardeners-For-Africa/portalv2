import {
  Activity,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  Download,
  FileText,
  GraduationCap,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  remarks?: string;
}

interface TermResult {
  term: string;
  academicYear: string;
  subjects: SubjectResult[];
  averageScore: number;
  overallGrade: string;
  classPosition: number;
  totalStudents: number;
  remarks: string;
}

const mockStudent: Student = {
  id: "1",
  name: "Emma Wilson",
  studentId: "ST001",
  avatar:
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  class: "Form 3A",
  grade: "Grade 9",
  subjects: [
    {
      name: "Mathematics",
      score: 85,
      totalMarks: 100,
      percentage: 85,
      grade: "A",
      rank: 3,
      remarks: "Excellent work in algebra",
    },
    {
      name: "Physics",
      score: 92,
      totalMarks: 100,
      percentage: 92,
      grade: "A+",
      rank: 1,
      remarks: "Outstanding performance",
    },
    {
      name: "Chemistry",
      score: 78,
      totalMarks: 100,
      percentage: 78,
      grade: "B+",
      rank: 5,
      remarks: "Good understanding of concepts",
    },
    {
      name: "English",
      score: 88,
      totalMarks: 100,
      percentage: 88,
      grade: "A",
      rank: 2,
      remarks: "Strong analytical skills",
    },
    {
      name: "Biology",
      score: 82,
      totalMarks: 100,
      percentage: 82,
      grade: "A",
      rank: 4,
      remarks: "Good practical work",
    },
    {
      name: "History",
      score: 90,
      totalMarks: 100,
      percentage: 90,
      grade: "A+",
      rank: 1,
      remarks: "Excellent research skills",
    },
  ],
  averageScore: 85.8,
  overallGrade: "A",
  term: "Term 1",
  academicYear: "2024",
  lastUpdated: "2024-03-15",
};

const mockTermResults: TermResult[] = [
  {
    term: "Term 1",
    academicYear: "2024",
    subjects: mockStudent.subjects,
    averageScore: 85.8,
    overallGrade: "A",
    classPosition: 3,
    totalStudents: 25,
    remarks:
      "Emma has shown consistent improvement throughout the term. Her analytical skills in Physics and Mathematics are exceptional. She should focus on Chemistry to improve her overall performance.",
  },
  {
    term: "Term 2",
    academicYear: "2024",
    subjects: [
      {
        name: "Mathematics",
        score: 88,
        totalMarks: 100,
        percentage: 88,
        grade: "A",
        rank: 2,
        remarks: "Improved problem-solving skills",
      },
      {
        name: "Physics",
        score: 95,
        totalMarks: 100,
        percentage: 95,
        grade: "A+",
        rank: 1,
        remarks: "Excellent laboratory work",
      },
      {
        name: "Chemistry",
        score: 82,
        totalMarks: 100,
        percentage: 82,
        grade: "A",
        rank: 4,
        remarks: "Better understanding of organic chemistry",
      },
      {
        name: "English",
        score: 90,
        totalMarks: 100,
        percentage: 90,
        grade: "A+",
        rank: 1,
        remarks: "Outstanding essay writing",
      },
      {
        name: "Biology",
        score: 85,
        totalMarks: 100,
        percentage: 85,
        grade: "A",
        rank: 3,
        remarks: "Good practical skills",
      },
      {
        name: "History",
        score: 88,
        totalMarks: 100,
        percentage: 88,
        grade: "A",
        rank: 2,
        remarks: "Excellent research and analysis",
      },
    ],
    averageScore: 88.0,
    overallGrade: "A",
    classPosition: 2,
    totalStudents: 25,
    remarks:
      "Emma has made significant progress in Chemistry and maintained her high standards in other subjects. Her class position has improved from 3rd to 2nd.",
  },
];

export default function StudentResults() {
  const { studentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTerm, setSelectedTerm] = useState<string>("Term 1");
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [student, setStudent] = useState<Student | null>(null);
  const [currentTermResult, setCurrentTermResult] = useState<TermResult | null>(null);

  useEffect(() => {
    // In a real app, fetch student data based on studentId
    setStudent(mockStudent);

    // Set initial term result
    const initialResult = mockTermResults.find(
      (result) => result.term === selectedTerm && result.academicYear === selectedYear,
    );
    setCurrentTermResult(initialResult || null);
  }, [studentId]);

  useEffect(() => {
    // Update current term result when selection changes
    const result = mockTermResults.find(
      (result) => result.term === selectedTerm && result.academicYear === selectedYear,
    );
    setCurrentTermResult(result || null);
  }, [selectedTerm, selectedYear]);

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

  const getUniqueTerms = () => [...new Set(mockTermResults.map((result) => result.term))];
  const getUniqueYears = () => [...new Set(mockTermResults.map((result) => result.academicYear))];

  if (!student || !currentTermResult) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/teacher/grades/results")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Results</h1>
            <p className="text-gray-600 mt-2">Detailed academic performance for {student.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          <Button className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance Analysis
          </Button>
        </div>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback className="text-2xl">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Student Name</div>
                  <div className="text-lg font-semibold">{student.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Student ID</div>
                  <div className="text-lg font-semibold">{student.studentId}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Class</div>
                  <div className="text-lg font-semibold">{student.class}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Grade Level</div>
                  <div className="text-lg font-semibold">{student.grade}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Term Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Term and Academic Year</CardTitle>
          <CardDescription>Choose the term to view detailed results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getUniqueTerms().map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Academic Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

      {/* Term Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentTermResult.averageScore}%
            </div>
            <Progress value={currentTermResult.averageScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getGradeBadge(currentTermResult.overallGrade)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Position</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentTermResult.classPosition}
            </div>
            <p className="text-xs text-muted-foreground">
              out of {currentTermResult.totalStudents}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTermResult.subjects.length}</div>
            <p className="text-xs text-muted-foreground">subjects taken</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Subject Results - {selectedTerm} {selectedYear}
          </CardTitle>
          <CardDescription>Detailed breakdown of performance in each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Class Rank</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTermResult.subjects.map((subject, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">{subject.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {subject.score}/{subject.totalMarks}
                      </span>
                      <Progress value={subject.percentage} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPerformanceColor(subject.percentage)}`}>
                      {subject.percentage}%
                    </span>
                  </TableCell>
                  <TableCell>{getGradeBadge(subject.grade)}</TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-medium">{subject.rank}</div>
                      <div className="text-xs text-gray-500">
                        out of {currentTermResult.totalStudents}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] text-sm text-gray-600">{subject.remarks}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Teacher Remarks */}
      <Card>
        <CardHeader>
          <CardTitle>
            Teacher Remarks - {selectedTerm} {selectedYear}
          </CardTitle>
          <CardDescription>Overall assessment and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{currentTermResult.remarks}</p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Compare performance across terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTermResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {result.term} {result.academicYear}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Class Position: {result.classPosition} out of {result.totalStudents}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{result.averageScore}%</div>
                      <div className="text-xs text-gray-500">Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{getGradeBadge(result.overallGrade)}</div>
                      <div className="text-xs text-gray-500">Grade</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
