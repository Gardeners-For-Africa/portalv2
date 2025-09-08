import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  FileText, 
  FileSpreadsheet,
  GraduationCap,
  TrendingUp,
  Award,
  Users,
  Calculator,
  Calendar,
  BookOpen,
  Target,
  Star,
  Trophy,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { StudentResult, Grade, Student } from '@/types';
import { mockStudentResults, mockGrades, mockStudents, mockClasses, mockSubjects } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

export default function StudentResultDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [result, setResult] = useState<StudentResult | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (id) {
      const foundResult = mockStudentResults.find(r => r.id === id);
      if (foundResult) {
        setResult(foundResult);
        const foundStudent = mockStudents.find(s => s.id === foundResult.studentId);
        setStudent(foundStudent || null);
      } else {
        toast({
          title: "Result not found",
          description: "The student result you're looking for could not be found.",
          variant: "destructive",
        });
        navigate('/dashboard/school-admin/grading/termly-results');
      }
    }
  }, [id, navigate, toast]);

  const getGradeBadge = (grade: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      'A': 'default',
      'B': 'secondary',
      'C': 'outline',
      'D': 'outline',
      'E': 'destructive',
      'F': 'destructive'
    };
    return <Badge variant={variants[grade] || 'outline'}>{grade}</Badge>;
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge variant="default" className="bg-yellow-600">1st</Badge>;
    if (position === 2) return <Badge variant="default" className="bg-gray-600">2nd</Badge>;
    if (position === 3) return <Badge variant="default" className="bg-orange-600">3rd</Badge>;
    return <Badge variant="outline">{position}th</Badge>;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getClassName = (classId: string) => {
    const classItem = mockClasses.find(c => c.id === classId);
    return classItem ? classItem.name : 'Unknown Class';
  };

  const getTermLabel = (term: string) => {
    const labels: Record<string, string> = {
      'first_term': 'First Term',
      'second_term': 'Second Term',
      'third_term': 'Third Term'
    };
    return labels[term] || term;
  };

  const getSubjectPosition = (subjectId: string) => {
    // This would typically come from the backend
    // For now, we'll simulate positions based on the grade
    const subjectGrade = result?.subjectGrades.find(g => g.subjectId === subjectId);
    if (!subjectGrade) return null;
    
    // Simulate position based on percentage
    const percentage = subjectGrade.percentage;
    if (percentage >= 90) return 1;
    if (percentage >= 80) return 2;
    if (percentage >= 70) return 3;
    if (percentage >= 60) return 5;
    if (percentage >= 50) return 8;
    return 12;
  };

  const handlePrint = () => {
    window.print();
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

  if (!result) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/school-admin/grading/termly-results')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Result Details</h1>
            <p className="text-muted-foreground">
              {result.studentName} • {getClassName(result.classId)} • {getTermLabel(result.term)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Result
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Student Information */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Student Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={student?.avatar} />
                  <AvatarFallback>
                    {result.studentName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{result.studentName}</h3>
                  <p className="text-sm text-muted-foreground">{result.studentId}</p>
                  <p className="text-sm text-muted-foreground">{getClassName(result.classId)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Academic Year:</span>
                  <span className="font-medium">{result.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Term:</span>
                  <span className="font-medium">{getTermLabel(result.term)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Subjects:</span>
                  <span className="font-medium">{result.totalSubjects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Class Position:</span>
                  <div>{getPositionBadge(result.position)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatPercentage(result.averagePercentage)}
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.totalScore}</div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.maxPossibleScore}</div>
                  <div className="text-sm text-muted-foreground">Max Possible</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Overall Grade:</span>
                  <div className="flex items-center space-x-2">
                    {getGradeBadge(result.letterGrade)}
                    <span className="text-sm">({result.averageGradePoints.toFixed(1)} points)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Grade Points:</span>
                  <span className="font-medium">{result.totalGradePoints.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={result.isPromoted ? "default" : "destructive"}>
                    {result.isPromoted ? 'Promoted' : 'Not Promoted'}
                  </Badge>
                </div>
              </div>

              {result.remarks && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Remarks</h4>
                    <p className="text-sm text-muted-foreground">{result.remarks}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Performance Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Excellent (A)</span>
                    <span>{result.subjectGrades.filter(g => g.letterGrade === 'A').length} subjects</span>
                  </div>
                  <Progress value={result.subjectGrades.filter(g => g.letterGrade === 'A').length / result.totalSubjects * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Very Good (B)</span>
                    <span>{result.subjectGrades.filter(g => g.letterGrade === 'B').length} subjects</span>
                  </div>
                  <Progress value={result.subjectGrades.filter(g => g.letterGrade === 'B').length / result.totalSubjects * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Good (C)</span>
                    <span>{result.subjectGrades.filter(g => g.letterGrade === 'C').length} subjects</span>
                  </div>
                  <Progress value={result.subjectGrades.filter(g => g.letterGrade === 'C').length / result.totalSubjects * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pass (D)</span>
                    <span>{result.subjectGrades.filter(g => g.letterGrade === 'D').length} subjects</span>
                  </div>
                  <Progress value={result.subjectGrades.filter(g => g.letterGrade === 'D').length / result.totalSubjects * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fail (E/F)</span>
                    <span>{result.subjectGrades.filter(g => ['E', 'F'].includes(g.letterGrade)).length} subjects</span>
                  </div>
                  <Progress value={result.subjectGrades.filter(g => ['E', 'F'].includes(g.letterGrade)).length / result.totalSubjects * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Results */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Subject Results ({result.subjectGrades.length} subjects)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.subjectGrades.map((grade) => {
                      const subjectPosition = getSubjectPosition(grade.subjectId);
                      return (
                        <TableRow key={grade.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{grade.subjectName}</div>
                              <div className="text-sm text-muted-foreground">
                                {grade.type.replace('_', ' ').toUpperCase()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {grade.teacherName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{grade.teacherName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {grade.value}/{grade.maxValue}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatPercentage(grade.percentage)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getGradeBadge(grade.letterGrade)}
                              <span className="text-sm">({grade.gradePoints})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {subjectPosition ? getPositionBadge(subjectPosition) : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="text-sm font-medium">{grade.remarks}</div>
                              {grade.comments && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {grade.comments}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Performance Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Strengths</h4>
                  <div className="space-y-2">
                    {result.subjectGrades
                      .filter(g => g.letterGrade === 'A')
                      .map((grade) => (
                        <div key={grade.id} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{grade.subjectName} - {formatPercentage(grade.percentage)}</span>
                        </div>
                      ))}
                    {result.subjectGrades.filter(g => g.letterGrade === 'A').length === 0 && (
                      <p className="text-sm text-muted-foreground">No A grades recorded</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Areas for Improvement</h4>
                  <div className="space-y-2">
                    {result.subjectGrades
                      .filter(g => ['D', 'E', 'F'].includes(g.letterGrade))
                      .map((grade) => (
                        <div key={grade.id} className="flex items-center space-x-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <span>{grade.subjectName} - {formatPercentage(grade.percentage)}</span>
                        </div>
                      ))}
                    {result.subjectGrades.filter(g => ['D', 'E', 'F'].includes(g.letterGrade)).length === 0 && (
                      <p className="text-sm text-muted-foreground">No areas for improvement identified</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Recommendations</h4>
                <div className="space-y-2 text-sm">
                  {result.averagePercentage >= 80 && (
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span>Excellent performance! Maintain this high standard.</span>
                    </div>
                  )}
                  {result.averagePercentage >= 70 && result.averagePercentage < 80 && (
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span>Good performance. Focus on weak subjects to improve further.</span>
                    </div>
                  )}
                  {result.averagePercentage >= 50 && result.averagePercentage < 70 && (
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span>Average performance. Consider additional support for challenging subjects.</span>
                    </div>
                  )}
                  {result.averagePercentage < 50 && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>Below average performance. Immediate intervention recommended.</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
