import { Download, Eye, Filter, MoreHorizontal, Plus, Search, Upload } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface Score {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  subject: string;
  exam: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  term: string;
  academicYear: string;
  date: string;
}

const mockScores: Score[] = [
  {
    id: "1",
    studentName: "John Doe",
    studentId: "ST001",
    class: "Form 3A",
    subject: "Mathematics",
    exam: "Mid-Term Mathematics",
    score: 85,
    totalMarks: 100,
    percentage: 85,
    grade: "A",
    term: "Term 1",
    academicYear: "2024",
    date: "2024-03-15",
  },
  {
    id: "2",
    studentName: "Jane Smith",
    studentId: "ST002",
    class: "Form 3A",
    subject: "Mathematics",
    exam: "Mid-Term Mathematics",
    score: 92,
    totalMarks: 100,
    percentage: 92,
    grade: "A+",
    term: "Term 1",
    academicYear: "2024",
    date: "2024-03-15",
  },
  {
    id: "3",
    studentName: "Mike Johnson",
    studentId: "ST003",
    class: "Form 3A",
    subject: "Mathematics",
    exam: "Mid-Term Mathematics",
    score: 78,
    totalMarks: 100,
    percentage: 78,
    grade: "B+",
    term: "Term 1",
    academicYear: "2024",
    date: "2024-03-15",
  },
  {
    id: "4",
    studentName: "Sarah Wilson",
    studentId: "ST004",
    class: "Form 3A",
    subject: "Mathematics",
    exam: "Mid-Term Mathematics",
    score: 95,
    totalMarks: 100,
    percentage: 95,
    grade: "A+",
    term: "Term 1",
    academicYear: "2024",
    date: "2024-03-15",
  },
];

export default function Scores() {
  const [scores, setScores] = useState<Score[]>(mockScores);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [termFilter, setTermFilter] = useState<string>("all");
  const [isAddScoreDialogOpen, setIsAddScoreDialogOpen] = useState(false);
  const [newScore, setNewScore] = useState({
    studentName: "",
    studentId: "",
    class: "",
    subject: "",
    exam: "",
    score: "",
    totalMarks: "",
    term: "",
    academicYear: "",
  });

  const filteredScores = scores.filter((score) => {
    const matchesSearch =
      score.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      score.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || score.class === classFilter;
    const matchesSubject = subjectFilter === "all" || score.subject === subjectFilter;
    const matchesTerm = termFilter === "all" || score.term === termFilter;
    return matchesSearch && matchesClass && matchesSubject && matchesTerm;
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

    const config = gradeConfig[grade as keyof typeof gradeConfig] || {
      className: "bg-gray-100 text-gray-800",
    };
    return <Badge className={config.className}>{grade}</Badge>;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const handleAddScore = () => {
    if (
      newScore.studentName &&
      newScore.studentId &&
      newScore.class &&
      newScore.subject &&
      newScore.exam &&
      newScore.score &&
      newScore.totalMarks
    ) {
      const score: Score = {
        id: Date.now().toString(),
        studentName: newScore.studentName,
        studentId: newScore.studentId,
        class: newScore.class,
        subject: newScore.subject,
        exam: newScore.exam,
        score: parseInt(newScore.score, 10),
        totalMarks: parseInt(newScore.totalMarks, 10),
        percentage: Math.round(
          (parseInt(newScore.score, 10) / parseInt(newScore.totalMarks, 10)) * 100,
        ),
        grade: getGradeFromPercentage(
          Math.round((parseInt(newScore.score, 10) / parseInt(newScore.totalMarks, 10)) * 100),
        ),
        term: newScore.term,
        academicYear: newScore.academicYear,
        date: new Date().toISOString().split("T")[0],
      };

      setScores([...scores, score]);
      setNewScore({
        studentName: "",
        studentId: "",
        class: "",
        subject: "",
        exam: "",
        score: "",
        totalMarks: "",
        term: "",
        academicYear: "",
      });
      setIsAddScoreDialogOpen(false);
    }
  };

  const getGradeFromPercentage = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 75) return "B+";
    if (percentage >= 70) return "B";
    if (percentage >= 65) return "C+";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  const calculateAverageScore = () => {
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, score) => sum + score.percentage, 0);
    return Math.round(total / scores.length);
  };

  const getUniqueClasses = () => [...new Set(scores.map((score) => score.class))];
  const getUniqueSubjects = () => [...new Set(scores.map((score) => score.subject))];
  const getUniqueTerms = () => [...new Set(scores.map((score) => score.term))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Scores Management</h1>
          <p className="text-gray-600 mt-2">Manage and track student academic performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Scores
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Scores
          </Button>
          <Dialog open={isAddScoreDialogOpen} onOpenChange={setIsAddScoreDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Score
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Score</DialogTitle>
                <DialogDescription>Add a new student score entry</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      value={newScore.studentName}
                      onChange={(e) => setNewScore({ ...newScore, studentName: e.target.value })}
                      placeholder="Student name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={newScore.studentId}
                      onChange={(e) => setNewScore({ ...newScore, studentId: e.target.value })}
                      placeholder="Student ID"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Input
                      id="class"
                      value={newScore.class}
                      onChange={(e) => setNewScore({ ...newScore, class: e.target.value })}
                      placeholder="e.g., Form 3A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newScore.subject}
                      onChange={(e) => setNewScore({ ...newScore, subject: e.target.value })}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam">Exam</Label>
                    <Input
                      id="exam"
                      value={newScore.exam}
                      onChange={(e) => setNewScore({ ...newScore, exam: e.target.value })}
                      placeholder="Exam name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term">Term</Label>
                    <Input
                      id="term"
                      value={newScore.term}
                      onChange={(e) => setNewScore({ ...newScore, term: e.target.value })}
                      placeholder="e.g., Term 1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Score</Label>
                    <Input
                      id="score"
                      type="number"
                      value={newScore.score}
                      onChange={(e) => setNewScore({ ...newScore, score: e.target.value })}
                      placeholder="e.g., 85"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      value={newScore.totalMarks}
                      onChange={(e) => setNewScore({ ...newScore, totalMarks: e.target.value })}
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={newScore.academicYear}
                    onChange={(e) => setNewScore({ ...newScore, academicYear: e.target.value })}
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddScoreDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddScore}>Add Score</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{calculateAverageScore()}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {scores.filter((s) => s.grade === "A+" || s.grade === "A").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {scores.filter((s) => s.grade === "D" || s.grade === "F").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Student Scores</CardTitle>
          <CardDescription>View and manage all student scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
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
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {getUniqueSubjects().map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Term" />
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScores.map((score) => (
                <TableRow key={score.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{score.studentName}</div>
                      <div className="text-sm text-gray-500">{score.studentId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{score.class}</TableCell>
                  <TableCell>{score.subject}</TableCell>
                  <TableCell>{score.exam}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {score.score}/{score.totalMarks}
                      </span>
                      <Progress value={score.percentage} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPerformanceColor(score.percentage)}`}>
                      {score.percentage}%
                    </span>
                  </TableCell>
                  <TableCell>{getGradeBadge(score.grade)}</TableCell>
                  <TableCell>{score.term}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
