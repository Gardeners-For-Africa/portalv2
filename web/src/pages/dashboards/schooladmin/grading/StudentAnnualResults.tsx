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
  BarChart3,
  LineChart,
  TrendingDown,
  Minus,
  Eye
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
import { StudentResult, Student } from '@/types';
import { mockStudentResults, mockStudents, mockClasses } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

export default function StudentAnnualResults() {
  const navigate = useNavigate();
  const { studentId, academicYear } = useParams();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [annualResults, setAnnualResults] = useState<StudentResult[]>([]);

  useEffect(() => {
    if (studentId && academicYear) {
      const foundStudent = mockStudents.find(s => s.id === studentId);
      if (foundStudent) {
        setStudent(foundStudent);
        // Get all results for this student in this academic year
        const results = mockStudentResults.filter(r => 
          r.studentId === studentId && r.academicYear === academicYear
        );
        setAnnualResults(results.sort((a, b) => {
          const termOrder = { 'first_term': 1, 'second_term': 2, 'third_term': 3 };
          return termOrder[a.term] - termOrder[b.term];
        }));
      } else {
        toast({
          title: "Student not found",
          description: "The student you're looking for could not be found.",
          variant: "destructive",
        });
        navigate('/dashboard/school-admin/grading/termly-results');
      }
    }
  }, [studentId, academicYear, navigate, toast]);

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

  const getPerformanceTrend = (current: number, previous: number) => {
    if (current > previous) return 'improved';
    if (current < previous) return 'declined';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improved':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declined':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improved':
        return 'text-green-600';
      case 'declined':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculateAnnualStats = () => {
    if (annualResults.length === 0) return null;

    const totalScore = annualResults.reduce((sum, r) => sum + r.totalScore, 0);
    const maxPossibleScore = annualResults.reduce((sum, r) => sum + r.maxPossibleScore, 0);
    const averagePercentage = (totalScore / maxPossibleScore) * 100;
    const averageGradePoints = annualResults.reduce((sum, r) => sum + r.averageGradePoints, 0) / annualResults.length;
    const totalGradePoints = annualResults.reduce((sum, r) => sum + r.totalGradePoints, 0);
    const totalSubjects = annualResults.reduce((sum, r) => sum + r.totalSubjects, 0);

    // Calculate overall grade based on average percentage
    let letterGrade = 'F';
    if (averagePercentage >= 80) letterGrade = 'A';
    else if (averagePercentage >= 70) letterGrade = 'B';
    else if (averagePercentage >= 60) letterGrade = 'C';
    else if (averagePercentage >= 50) letterGrade = 'D';
    else if (averagePercentage >= 40) letterGrade = 'E';

    return {
      totalScore,
      maxPossibleScore,
      averagePercentage,
      averageGradePoints,
      totalGradePoints,
      totalSubjects,
      letterGrade,
      totalTerms: annualResults.length
    };
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

  if (!student || !annualResults.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading annual results...</p>
        </div>
      </div>
    );
  }

  const annualStats = calculateAnnualStats();

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
            <h1 className="text-3xl font-bold tracking-tight">Annual Results</h1>
            <p className="text-muted-foreground">
              {student.firstName} {student.lastName} • {getClassName(annualResults[0].classId)} • {academicYear}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
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
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>
                    {student.firstName[0]}{student.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{student.firstName} {student.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{student.studentId}</p>
                  <p className="text-sm text-muted-foreground">{getClassName(annualResults[0].classId)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Academic Year:</span>
                  <span className="font-medium">{academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Terms Completed:</span>
                  <span className="font-medium">{annualStats?.totalTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Subjects:</span>
                  <span className="font-medium">{annualStats?.totalSubjects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admission Date:</span>
                  <span className="font-medium">{new Date(student.admissionDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Annual Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Annual Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatPercentage(annualStats?.averagePercentage || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Annual Average</div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{annualStats?.totalScore}</div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{annualStats?.maxPossibleScore}</div>
                  <div className="text-sm text-muted-foreground">Max Possible</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Overall Grade:</span>
                  <div className="flex items-center space-x-2">
                    {getGradeBadge(annualStats?.letterGrade || 'F')}
                    <span className="text-sm">({annualStats?.averageGradePoints.toFixed(1)} points)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Grade Points:</span>
                  <span className="font-medium">{annualStats?.totalGradePoints.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Terms Completed:</span>
                  <span className="font-medium">{annualStats?.totalTerms}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChart className="h-5 w-5" />
                <span>Performance Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {annualResults.map((result, index) => {
                const previousResult = index > 0 ? annualResults[index - 1] : null;
                const trend = previousResult 
                  ? getPerformanceTrend(result.averagePercentage, previousResult.averagePercentage)
                  : null;
                
                return (
                  <div key={result.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{getTermLabel(result.term)}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{formatPercentage(result.averagePercentage)}</span>
                        {trend && getTrendIcon(trend)}
                      </div>
                    </div>
                    {trend && (
                      <div className={`text-xs ${getTrendColor(trend)}`}>
                        {trend === 'improved' && `+${(result.averagePercentage - previousResult!.averagePercentage).toFixed(1)}% from previous term`}
                        {trend === 'declined' && `${(result.averagePercentage - previousResult!.averagePercentage).toFixed(1)}% from previous term`}
                        {trend === 'stable' && 'No change from previous term'}
                      </div>
                    )}
                    {index < annualResults.length - 1 && <Separator />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Term-by-Term Results */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Term-by-Term Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Term</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {annualResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{getTermLabel(result.term)}</div>
                            <div className="text-sm text-muted-foreground">
                              {result.academicYear}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPercentage(result.averagePercentage)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.totalScore}/{result.maxPossibleScore}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getGradeBadge(result.letterGrade)}
                            <span className="text-sm">({result.averageGradePoints.toFixed(1)})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPositionBadge(result.position)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {result.totalSubjects} subjects
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.subjectGrades.length} grades
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={result.isPromoted ? "default" : "destructive"}>
                            {result.isPromoted ? 'Promoted' : 'Not Promoted'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/school-admin/grading/results/${result.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance Across Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Subject Performance Across Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  // Get all unique subjects across all terms
                  const allSubjects = new Set<string>();
                  annualResults.forEach(result => {
                    result.subjectGrades.forEach(grade => {
                      allSubjects.add(grade.subjectName);
                    });
                  });

                  return Array.from(allSubjects).map(subjectName => {
                    const subjectGrades = annualResults.map(result => {
                      const grade = result.subjectGrades.find(g => g.subjectName === subjectName);
                      return {
                        term: result.term,
                        grade: grade,
                        result: result
                      };
                    }).filter(item => item.grade);

                    return (
                      <div key={subjectName} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{subjectName}</h4>
                          <div className="flex items-center space-x-2">
                            {subjectGrades.map((item, index) => (
                              <div key={item.term} className="flex items-center space-x-1">
                                <span className="text-xs text-muted-foreground">{getTermLabel(item.term)}</span>
                                {getGradeBadge(item.grade!.letterGrade)}
                                {index < subjectGrades.length - 1 && <span className="text-muted-foreground">•</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          {subjectGrades.map((item) => (
                            <div key={item.term} className="text-center">
                              <div className="text-sm font-medium">{getTermLabel(item.term)}</div>
                              <div className="text-lg font-bold">{formatPercentage(item.grade!.percentage)}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.grade!.value}/{item.grade!.maxValue}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Annual Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Annual Performance Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Consistent Performance</h4>
                  <div className="space-y-2">
                    {(() => {
                      const consistentSubjects = Array.from(new Set(
                        annualResults.flatMap(r => 
                          r.subjectGrades.filter(g => g.letterGrade === 'A').map(g => g.subjectName)
                        )
                      ));
                      
                      return consistentSubjects.length > 0 ? (
                        consistentSubjects.map(subject => (
                          <div key={subject} className="flex items-center space-x-2 text-sm">
                            <Star className="h-4 w-4 text-yellow-600" />
                            <span>{subject} - Consistently Excellent</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No consistently excellent subjects</p>
                      );
                    })()}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Improvement Areas</h4>
                  <div className="space-y-2">
                    {(() => {
                      const weakSubjects = Array.from(new Set(
                        annualResults.flatMap(r => 
                          r.subjectGrades.filter(g => ['D', 'E', 'F'].includes(g.letterGrade)).map(g => g.subjectName)
                        )
                      ));
                      
                      return weakSubjects.length > 0 ? (
                        weakSubjects.map(subject => (
                          <div key={subject} className="flex items-center space-x-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <span>{subject} - Needs Improvement</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No subjects requiring improvement</p>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Annual Recommendations</h4>
                <div className="space-y-2 text-sm">
                  {annualStats && annualStats.averagePercentage >= 80 && (
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <span>Outstanding annual performance! Consider advanced placement opportunities.</span>
                    </div>
                  )}
                  {annualStats && annualStats.averagePercentage >= 70 && annualStats.averagePercentage < 80 && (
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span>Strong annual performance. Continue building on strengths while addressing weaknesses.</span>
                    </div>
                  )}
                  {annualStats && annualStats.averagePercentage >= 50 && annualStats.averagePercentage < 70 && (
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span>Average annual performance. Focus on consistent improvement across all subjects.</span>
                    </div>
                  )}
                  {annualStats && annualStats.averagePercentage < 50 && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>Below average annual performance. Comprehensive academic support recommended.</span>
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
