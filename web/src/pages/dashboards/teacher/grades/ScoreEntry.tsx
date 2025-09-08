import {
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  Calculator,
  CheckCircle,
  FileText,
  Info,
  Save,
  Target,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  studentId: string;
  avatar?: string;
  class: string;
  grade: string;
}

interface SubjectScore {
  id: string;
  subjectName: string;
  subjectCode: string;
  // Primary and Secondary scores
  kickOffTest?: number;
  firstTest?: number;
  secondTest?: number;
  note?: number;
  project?: number;
  totalTest?: number;
  exam?: number;
  total?: number;
  // Nursery scores
  nurseryFirstTest?: number;
  nurserySecondTest?: number;
  nurseryTotalTest?: number;
  nurseryExam?: number;
  nurseryTotal?: number;
  // Common fields
  grade?: string;
  gradePoints?: number;
  remarks?: string;
  maxMarks: number;
}

interface ScoringConfiguration {
  educationLevel: "nursery" | "primary" | "secondary";
  kickOffTestWeight?: number;
  firstTestWeight?: number;
  secondTestWeight?: number;
  noteWeight?: number;
  projectWeight?: number;
  totalTestWeight?: number;
  examWeight?: number;
  nurseryFirstTestWeight?: number;
  nurserySecondTestWeight?: number;
  nurseryTotalTestWeight?: number;
  nurseryExamWeight?: number;
}

const mockStudent: Student = {
  id: "1",
  name: "Emma Wilson",
  studentId: "ST001",
  avatar:
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  class: "Form 3A",
  grade: "Grade 9",
};

const mockSubjects: SubjectScore[] = [
  {
    id: "1",
    subjectName: "Mathematics",
    subjectCode: "MATH101",
    kickOffTest: 8,
    firstTest: 18,
    secondTest: 17,
    note: 9,
    project: 19,
    totalTest: 71,
    exam: 58,
    total: 129,
    grade: "A",
    gradePoints: 5.0,
    remarks: "Excellent performance in algebra and geometry",
    maxMarks: 100,
  },
  {
    id: "2",
    subjectName: "Physics",
    subjectCode: "PHYS101",
    kickOffTest: 9,
    firstTest: 19,
    secondTest: 18,
    note: 9,
    project: 20,
    totalTest: 75,
    exam: 60,
    total: 135,
    grade: "A+",
    gradePoints: 5.0,
    remarks: "Outstanding laboratory work and theoretical understanding",
    maxMarks: 100,
  },
  {
    id: "3",
    subjectName: "Chemistry",
    subjectCode: "CHEM101",
    kickOffTest: 7,
    firstTest: 16,
    secondTest: 15,
    note: 8,
    project: 17,
    totalTest: 63,
    exam: 52,
    total: 115,
    grade: "B+",
    gradePoints: 4.0,
    remarks: "Good understanding of concepts, needs improvement in organic chemistry",
    maxMarks: 100,
  },
];

const mockScoringConfig: ScoringConfiguration = {
  educationLevel: "secondary",
  kickOffTestWeight: 5,
  firstTestWeight: 10,
  secondTestWeight: 10,
  noteWeight: 5,
  projectWeight: 10,
  totalTestWeight: 40,
  examWeight: 60,
};

export default function ScoreEntry() {
  const { studentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<SubjectScore[]>([]);
  const [scoringConfig, setScoringConfig] = useState<ScoringConfiguration | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingScores, setEditingScores] = useState<SubjectScore | null>(null);

  useEffect(() => {
    // In a real app, fetch student data based on studentId
    setStudent(mockStudent);
    setSubjects(mockSubjects);
    setScoringConfig(mockScoringConfig);

    // Set initial subject if available
    if (mockSubjects.length > 0) {
      setSelectedSubject(mockSubjects[0].id);
    }
  }, [studentId]);

  const getGradeForScore = (score: number): string => {
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    if (score >= 40) return "E";
    return "F";
  };

  const getGradePoints = (score: number): number => {
    const grade = getGradeForScore(score);
    switch (grade) {
      case "A":
        return 5.0;
      case "B":
        return 4.0;
      case "C":
        return 3.0;
      case "D":
        return 2.0;
      case "E":
        return 1.0;
      case "F":
        return 0.0;
      default:
        return 0;
    }
  };

  const calculateTotalTest = (subject: SubjectScore): number => {
    if (scoringConfig?.educationLevel === "nursery") {
      return (subject.nurseryFirstTest || 0) + (subject.nurserySecondTest || 0);
    } else {
      return (
        (subject.kickOffTest || 0) +
        (subject.firstTest || 0) +
        (subject.secondTest || 0) +
        (subject.note || 0) +
        (subject.project || 0)
      );
    }
  };

  const calculateTotal = (subject: SubjectScore): number => {
    if (scoringConfig?.educationLevel === "nursery") {
      return (subject.nurseryTotalTest || 0) + (subject.nurseryExam || 0);
    } else {
      return (subject.totalTest || 0) + (subject.exam || 0);
    }
  };

  const calculatePercentage = (score: number, maxMarks: number): number => {
    return Math.round((score / maxMarks) * 100);
  };

  const handleScoreChange = (subjectId: string, field: string, value: string) => {
    const numValue = value === "" ? undefined : parseInt(value, 10);

    setSubjects((prev) =>
      prev.map((subject) => {
        if (subject.id === subjectId) {
          const updatedSubject = { ...subject, [field]: numValue };

          // Recalculate totals
          if (scoringConfig?.educationLevel === "nursery") {
            updatedSubject.nurseryTotalTest = calculateTotalTest(updatedSubject);
            updatedSubject.total = calculateTotal(updatedSubject);
          } else {
            updatedSubject.totalTest = calculateTotalTest(updatedSubject);
            updatedSubject.total = calculateTotal(updatedSubject);
          }

          // Calculate grade and points
          if (updatedSubject.total !== undefined) {
            const percentage = calculatePercentage(updatedSubject.total, updatedSubject.maxMarks);
            updatedSubject.grade = getGradeForScore(percentage);
            updatedSubject.gradePoints = getGradePoints(percentage);
          }

          return updatedSubject;
        }
        return subject;
      }),
    );
  };

  const handleEditSubject = (subject: SubjectScore) => {
    setEditingScores({ ...subject });
    setIsEditing(true);
  };

  const handleSaveSubject = () => {
    if (editingScores) {
      setSubjects((prev) =>
        prev.map((subject) => (subject.id === editingScores.id ? editingScores : subject)),
      );
      setIsEditing(false);
      setEditingScores(null);
      toast({
        title: "Scores Updated",
        description: "Subject scores have been successfully updated.",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingScores(null);
  };

  const handleSaveAll = () => {
    toast({
      title: "All Scores Saved",
      description: "All subject scores have been successfully saved.",
    });
    // In a real app, save to database
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubject);

  if (!student || !scoringConfig) {
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
            onClick={() => navigate("/dashboard/teacher/grades/scores")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scores
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Score Entry</h1>
            <p className="text-gray-600 mt-2">Enter detailed scores for {student.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSaveAll}>
            <Save className="h-4 w-4 mr-2" />
            Save All
          </Button>
          <Button onClick={handleSaveAll}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Grades
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

      {/* Scoring Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Scoring Configuration
          </CardTitle>
          <CardDescription>
            Current scoring weights for {scoringConfig.educationLevel} level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scoringConfig.educationLevel === "nursery" ? (
              <>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {scoringConfig.nurseryFirstTestWeight}%
                  </div>
                  <div className="text-sm text-gray-600">First Test</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {scoringConfig.nurserySecondTestWeight}%
                  </div>
                  <div className="text-sm text-gray-600">Second Test</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {scoringConfig.nurseryExamWeight}%
                  </div>
                  <div className="text-sm text-gray-600">Exam</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">100%</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {scoringConfig.kickOffTestWeight}%
                  </div>
                  <div className="text-sm text-gray-600">Kick-off Test</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {scoringConfig.firstTestWeight}%
                  </div>
                  <div className="text-sm text-gray-600">First Test</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {scoringConfig.secondTestWeight}%
                  </div>
                  <div className="text-sm text-gray-600">Second Test</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{scoringConfig.noteWeight}%</div>
                  <div className="text-sm text-gray-600">Note</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {scoringConfig.projectWeight}%
                  </div>
                  <div className="text-sm text-gray-600">Project</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {scoringConfig.examWeight}%
                  </div>
                  <div className="text-sm text-gray-600">Exam</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">100%</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Subject</CardTitle>
          <CardDescription>Choose a subject to enter or edit scores</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.subjectName} ({subject.subjectCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Score Entry Form */}
      {currentSubject && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {currentSubject.subjectName} - Score Entry
                </CardTitle>
                <CardDescription>
                  Enter scores for each grade item. Max marks: {currentSubject.maxMarks}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => handleEditSubject(currentSubject)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Edit Scores
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSubject}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {scoringConfig.educationLevel === "nursery" ? (
              /* Nursery Score Entry */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nurseryFirstTest">First Test</Label>
                    <Input
                      id="nurseryFirstTest"
                      type="number"
                      value={
                        editingScores?.nurseryFirstTest || currentSubject.nurseryFirstTest || ""
                      }
                      onChange={(e) =>
                        editingScores &&
                        handleScoreChange(currentSubject.id, "nurseryFirstTest", e.target.value)
                      }
                      placeholder={`Max: ${currentSubject.maxMarks}`}
                      max={currentSubject.maxMarks}
                      disabled={!isEditing}
                    />
                    <div className="text-sm text-gray-500">
                      Weight: {scoringConfig.nurseryFirstTestWeight}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nurserySecondTest">Second Test</Label>
                    <Input
                      id="nurserySecondTest"
                      type="number"
                      value={
                        editingScores?.nurserySecondTest || currentSubject.nurserySecondTest || ""
                      }
                      onChange={(e) =>
                        editingScores &&
                        handleScoreChange(currentSubject.id, "nurserySecondTest", e.target.value)
                      }
                      placeholder={`Max: ${currentSubject.maxMarks}`}
                      max={currentSubject.maxMarks}
                      disabled={!isEditing}
                    />
                    <div className="text-sm text-gray-500">
                      Weight: {scoringConfig.nurserySecondTestWeight}%
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nurseryTotalTest">Total Test Score</Label>
                    <Input
                      id="nurseryTotalTest"
                      type="number"
                      value={currentSubject.nurseryTotalTest || 0}
                      disabled
                      className="bg-gray-50"
                    />
                    <div className="text-sm text-gray-500">
                      Weight: {scoringConfig.nurseryTotalTestWeight}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nurseryExam">Exam</Label>
                    <Input
                      id="nurseryExam"
                      type="number"
                      value={editingScores?.nurseryExam || currentSubject.nurseryExam || ""}
                      onChange={(e) =>
                        editingScores &&
                        handleScoreChange(currentSubject.id, "nurseryExam", e.target.value)
                      }
                      placeholder={`Max: ${currentSubject.maxMarks}`}
                      max={currentSubject.maxMarks}
                      disabled={!isEditing}
                    />
                    <div className="text-sm text-gray-500">
                      Weight: {scoringConfig.nurseryExamWeight}%
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Primary/Secondary Score Entry */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kickOffTest">Kick-off Test</Label>
                    <Input
                      id="kickOffTest"
                      type="number"
                      value={editingScores?.kickOffTest || currentSubject.kickOffTest || ""}
                      onChange={(e) =>
                        editingScores &&
                        handleScoreChange(currentSubject.id, "kickOffTest", e.target.value)
                      }
                      placeholder={`Max: ${currentSubject.maxMarks}`}
                      max={currentSubject.maxMarks}
                      disabled={!isEditing}
                    />
                    <div className="text-sm text-gray-500">
                      Weight: {scoringConfig.kickOffTestWeight}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstTest">First Test</Label>
                    <Input
                      id="firstTest"
                      type="number"
                      value={editingScores?.firstTest || currentSubject.firstTest || ""}
                      onChange={(e) =>
                        editingScores &&
                        handleScoreChange(currentSubject.id, "firstTest", e.target.value)
                      }
                      placeholder={`Max: ${currentSubject.maxMarks}`}
                      max={currentSubject.maxMarks}
                      disabled={!isEditing}
                    />
                    <div className="text-sm text-gray-500">
                      Weight: {scoringConfig.firstTestWeight}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondTest">Second Test</Label>
                    <Input
                      id="secondTest"
                      type="number"
                      value={editingScores?.secondTest || currentSubject.secondTest || ""}
                      onChange={(e) =>
                        editingScores &&
                        handleScoreChange(currentSubject.id, "secondTest", e.target.value)
                      }
                      placeholder={`Max: ${currentSubject.maxMarks}`}
                      max={currentSubject.maxMarks}
                      disabled={!isEditing}
                    />
                    <div className="text-sm text-gray-500">
                      Weight: {scoringConfig.secondTestWeight}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="note">Note</Label>
                    <Input
                      id="note"
                      type="number"
                      value={editingScores?.note || currentSubject.note || ""}
                      onChange={(e) =>
                        editingScores &&
                        handleScoreChange(currentSubject.id, "note", e.target.value)
                      }
                      placeholder={`Max: ${currentSubject.maxMarks}`}
                      max={currentSubject.maxMarks}
                      disabled={!isEditing}
                    />
                    <div className="text-sm text-gray-500">Weight: {scoringConfig.noteWeight}%</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Input
                      id="project"
                      type="number"
                      value={editingScores?.project || currentSubject.project || ""}
                      onChange={(e) =>
                        editingScores &&
                        handleScoreChange(currentSubject.id, "project", e.target.value)
                      }
                      placeholder={`Max: ${currentSubject.maxMarks}`}
                      max={currentSubject.maxMarks}
                      disabled={!isEditing}
                    />
                    <div className="text-sm text-gray-500">
                      Weight: {scoringConfig.projectWeight}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalTest">Total Test Score</Label>
                    <Input
                      id="totalTest"
                      type="number"
                      value={currentSubject.totalTest || 0}
                      disabled
                      className="bg-gray-50"
                    />
                    <div className="text-sm text-gray-500">
                      Weight: {scoringConfig.totalTestWeight}%
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="exam">Exam</Label>
                    <Input
                      id="exam"
                      type="number"
                      value={editingScores?.exam || currentSubject.exam || ""}
                      onChange={(e) =>
                        editingScores &&
                        handleScoreChange(currentSubject.id, "exam", e.target.value)
                      }
                      placeholder={`Max: ${currentSubject.maxMarks}`}
                      max={currentSubject.maxMarks}
                      disabled={!isEditing}
                    />
                    <div className="text-sm text-gray-500">Weight: {scoringConfig.examWeight}%</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total">Total Score</Label>
                    <Input
                      id="total"
                      type="number"
                      value={currentSubject.total || 0}
                      disabled
                      className="bg-gray-50"
                    />
                    <div className="text-sm text-gray-500">Final Score</div>
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {currentSubject.total || 0}/{currentSubject.maxMarks}
                </div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {currentSubject.total
                    ? calculatePercentage(currentSubject.total, currentSubject.maxMarks)
                    : 0}
                  %
                </div>
                <div className="text-sm text-gray-600">Percentage</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {currentSubject.grade || "N/A"}
                </div>
                <div className="text-sm text-gray-600">Grade</div>
              </div>
            </div>

            {/* Remarks */}
            <div className="mt-6">
              <Label htmlFor="remarks">Teacher Remarks</Label>
              <Textarea
                id="remarks"
                value={editingScores?.remarks || currentSubject.remarks || ""}
                onChange={(e) =>
                  setEditingScores((prev) => (prev ? { ...prev, remarks: e.target.value } : null))
                }
                placeholder="Enter remarks about the student's performance..."
                rows={3}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Subjects Summary */}
      <Card>
        <CardHeader>
          <CardTitle>All Subjects Summary</CardTitle>
          <CardDescription>Overview of scores across all subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{subject.subjectName}</h3>
                    <p className="text-sm text-gray-500">{subject.subjectCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{subject.total || 0}</div>
                      <div className="text-xs text-gray-500">Total Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {subject.total ? calculatePercentage(subject.total, subject.maxMarks) : 0}%
                      </div>
                      <div className="text-xs text-gray-500">Percentage</div>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-blue-100 text-blue-800">{subject.grade || "N/A"}</Badge>
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
