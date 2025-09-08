import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  FileSpreadsheet,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Calendar,
  Users,
  BookOpen,
  Award,
  LayoutGrid,
  Printer,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { StudentTermlyResult, ScoringConfiguration, SchoolClass } from '@/types';
import { mockStudentTermlyResults, mockScoringConfigurations, mockClasses, mockStudents } from '@/utils/mockData';

interface StudentData {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  classSection: string;
  educationLevel: 'nursery' | 'primary' | 'secondary';
  termlyResults: StudentTermlyResult[];
  averageScore: number;
  totalSubjects: number;
  bestPosition: number;
  worstPosition: number;
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
}

export default function TermlyResultsTable() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Filter states
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2024-2025');
  const [selectedTerm, setSelectedTerm] = useState<string>('first_term');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<string>('className');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // View states
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Data states
  const [scoringConfig, setScoringConfig] = useState<ScoringConfiguration | null>(null);
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [currentStudents, setCurrentStudents] = useState<StudentData[]>([]);

  useEffect(() => {
    // Load scoring configuration based on selected class
    if (selectedClass) {
      const classItem = mockClasses.find(c => c.id === selectedClass);
      if (classItem) {
        const level = classItem.level === 'nursery' ? 'nursery' : 
                     classItem.level === 'primary' ? 'primary' : 'secondary';
        const config = mockScoringConfigurations.find(c => 
          c.educationLevel === level && c.isActive
        );
        setScoringConfig(config || null);
      }
    }

    // Filter results based on current filters
    const filteredResults = mockStudentTermlyResults.filter(result => {
      if (selectedAcademicYear && result.academicYear !== selectedAcademicYear) return false;
      if (selectedTerm && result.term !== selectedTerm) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return result.studentName.toLowerCase().includes(query) ||
               result.admissionNumber.toLowerCase().includes(query) ||
               result.className.toLowerCase().includes(query);
      }
      return true;
    });

    // Group by class
    const classMap = new Map<string, ClassData>();
    
    filteredResults.forEach(result => {
      if (!classMap.has(result.classId)) {
        const classItem = mockClasses.find(c => c.id === result.classId);
        classMap.set(result.classId, {
          classId: result.classId,
          className: result.className,
          classLevel: classItem?.level || 'unknown',
          sections: [],
          students: [],
          totalStudents: 0,
          averageScore: 0,
          bestStudent: '',
          worstStudent: '',
        });
      }
      
      const classData = classMap.get(result.classId)!;
      
      // Add section if not already present
      if (!classData.sections.includes(result.classSection)) {
        classData.sections.push(result.classSection);
      }
      
      // Add student if not already present
      let student = classData.students.find(s => s.studentId === result.studentId);
      if (!student) {
        student = {
          studentId: result.studentId,
          studentName: result.studentName,
          admissionNumber: result.admissionNumber,
          classId: result.classId,
          className: result.className,
          classSection: result.classSection,
          educationLevel: result.educationLevel,
          termlyResults: [],
          averageScore: 0,
          totalSubjects: 0,
          bestPosition: Infinity,
          worstPosition: 0,
        };
        classData.students.push(student);
      }
      
      student.termlyResults.push(result);
      student.averageScore = (student.averageScore + result.averagePercentage) / student.termlyResults.length;
      student.totalSubjects = Math.max(student.totalSubjects, result.subjectScores.length);
      student.bestPosition = Math.min(student.bestPosition, result.position);
      student.worstPosition = Math.max(student.worstPosition, result.position);
    });

    // Calculate class-level statistics
    classMap.forEach(classData => {
      classData.totalStudents = classData.students.length;
      classData.averageScore = classData.students.reduce((sum, student) => sum + student.averageScore, 0) / classData.students.length;
      
      if (classData.students.length > 0) {
        const bestStudent = classData.students.reduce((best, current) => 
          current.averageScore > best.averageScore ? current : best
        );
        const worstStudent = classData.students.reduce((worst, current) => 
          current.averageScore < worst.averageScore ? current : worst
        );
        classData.bestStudent = bestStudent.studentName;
        classData.worstStudent = worstStudent.studentName;
      }
    });

    const classes = Array.from(classMap.values());

    // Sort classes
    classes.sort((a, b) => {
      let aValue: any = a[sortField as keyof ClassData];
      let bValue: any = b[sortField as keyof ClassData];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
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
        if (selectedSection !== 'all') {
          students = students.filter(student => student.classSection === selectedSection);
        }
        
        setCurrentStudents(students);
      } else {
        setCurrentStudents([]);
      }
    } else {
      setCurrentStudents([]);
    }
  }, [selectedAcademicYear, selectedTerm, searchQuery, sortField, sortDirection, selectedClass, selectedSection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

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

  const getTermLabel = (term: string) => {
    const labels: Record<string, string> = {
      'first_term': 'First Term',
      'second_term': 'Second Term',
      'third_term': 'Third Term'
    };
    return labels[term] || term;
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate the print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${student.studentName} - Termly Results</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .student-info { margin-bottom: 30px; }
            .student-info table { width: 100%; border-collapse: collapse; }
            .student-info td { padding: 8px; border: 1px solid #ddd; }
            .student-info td:first-child { font-weight: bold; background-color: #f5f5f5; }
            .term-section { margin-bottom: 40px; page-break-inside: avoid; }
            .term-header { background-color: #f0f0f0; padding: 10px; margin-bottom: 15px; font-weight: bold; }
            .results-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .results-table th, .results-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .results-table th { background-color: #f5f5f5; font-weight: bold; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
            .summary-card { border: 1px solid #ddd; padding: 15px; }
            .summary-card h4 { margin: 0 0 10px 0; color: #333; }
            .summary-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .grade-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
            .grade-a { background-color: #d4edda; color: #155724; }
            .grade-b { background-color: #d1ecf1; color: #0c5460; }
            .grade-c { background-color: #fff3cd; color: #856404; }
            .grade-d { background-color: #f8d7da; color: #721c24; }
            .grade-e, .grade-f { background-color: #f5c6cb; color: #721c24; }
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
            <h1>Student Termly Results Report</h1>
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
                <td>Total Terms:</td>
                <td>${student.termlyResults.length}</td>
                <td>Average Score:</td>
                <td>${formatPercentage(student.averageScore)}</td>
              </tr>
            </table>
          </div>

          ${student.termlyResults.map(result => `
            <div class="term-section">
              <div class="term-header">
                ${getTermLabel(result.term)} Results
              </div>
              
              <table class="results-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    ${scoringConfig?.educationLevel === 'nursery' ? `
                      <th>First Test (20%)</th>
                      <th>Second Test (20%)</th>
                      <th>Total Test (40%)</th>
                      <th>Exam (60%)</th>
                      <th>Total (100%)</th>
                    ` : `
                      <th>Kick-Off Test (5%)</th>
                      <th>First Test (10%)</th>
                      <th>Second Test (10%)</th>
                      <th>Note (5%)</th>
                      <th>Project (10%)</th>
                      <th>Total Test (40%)</th>
                      <th>Exam (60%)</th>
                      <th>Total (100%)</th>
                    `}
                    <th>Position</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${result.subjectScores.map(score => `
                    <tr>
                      <td>${score.subjectName}</td>
                      ${scoringConfig?.educationLevel === 'nursery' ? `
                        <td>${score.nurseryFirstTest || '-'}</td>
                        <td>${score.nurserySecondTest || '-'}</td>
                        <td>${score.nurseryTotalTest || '-'}</td>
                        <td>${score.nurseryExam || '-'}</td>
                        <td><strong>${score.nurseryTotal || '-'}</strong></td>
                      ` : `
                        <td>${score.kickOffTest || '-'}</td>
                        <td>${score.firstTest || '-'}</td>
                        <td>${score.secondTest || '-'}</td>
                        <td>${score.note || '-'}</td>
                        <td>${score.project || '-'}</td>
                        <td>${score.totalTest || '-'}</td>
                        <td>${score.exam || '-'}</td>
                        <td><strong>${score.total || '-'}</strong></td>
                      `}
                      <td>${score.subjectPosition ? score.subjectPosition + (score.subjectPosition === 1 ? 'st' : score.subjectPosition === 2 ? 'nd' : score.subjectPosition === 3 ? 'rd' : 'th') : '-'}</td>
                      <td><span class="grade-badge grade-${score.grade?.toLowerCase() || 'other'}">${score.grade || '-'}</span></td>
                      <td>${score.remarks || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="summary-grid">
                <div class="summary-card">
                  <h4>Performance Summary</h4>
                  <div class="summary-item">
                    <span>Total Score:</span>
                    <span>${result.totalScore}/${result.maxPossibleScore}</span>
                  </div>
                  <div class="summary-item">
                    <span>Average:</span>
                    <span>${formatPercentage(result.averagePercentage)}</span>
                  </div>
                  <div class="summary-item">
                    <span>Grade Points:</span>
                    <span>${result.totalGradePoints.toFixed(1)}</span>
                  </div>
                </div>
                
                <div class="summary-card">
                  <h4>Academic Status</h4>
                  <div class="summary-item">
                    <span>Position:</span>
                    <span><span class="position-badge position-${result.position <= 3 ? result.position : 'other'}">${result.position}${result.position === 1 ? 'st' : result.position === 2 ? 'nd' : result.position === 3 ? 'rd' : 'th'}</span></span>
                  </div>
                  <div class="summary-item">
                    <span>Promotion:</span>
                    <span>${result.isPromoted ? 'Promoted' : 'Not Promoted'}</span>
                  </div>
                  <div class="summary-item">
                    <span>Subjects:</span>
                    <span>${result.subjectScores.length}</span>
                  </div>
                </div>
                
                <div class="summary-card">
                  <h4>Grade Information</h4>
                  <div class="summary-item">
                    <span>Letter Grade:</span>
                    <span><span class="grade-badge grade-${result.letterGrade.toLowerCase()}">${result.letterGrade}</span></span>
                  </div>
                  <div class="summary-item">
                    <span>Grade Points:</span>
                    <span>${result.averageGradePoints.toFixed(1)}</span>
                  </div>
                  <div class="summary-item">
                    <span>Remarks:</span>
                    <span>${result.remarks}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}

          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
            <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>School Management Portal - Termly Results Report</p>
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
    return ['2024-2025', '2023-2024', '2022-2023'];
  };

  const getTerms = () => {
    return ['first_term', 'second_term', 'third_term'];
  };

  const handleBackToClasses = () => {
    setSelectedClass('');
    setSelectedSection('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/school-admin/grading/dashboard')}>
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
              {selectedClass ? `${classData.find(c => c.classId === selectedClass)?.className} - Student Results` : 'Termly Results by Class'}
            </h1>
            <p className="text-muted-foreground">
              {selectedClass 
                ? `View detailed termly results for students in ${classData.find(c => c.classId === selectedClass)?.className}`
                : 'Select a class to view student results'
              }
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
          <Button variant="outline" onClick={() => navigate('/dashboard/school-admin/grading/termly-cards')}>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {getTerms().map((term) => (
                    <SelectItem key={term} value={term}>
                      {getTermLabel(term)}
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
                    {classData.find(c => c.classId === selectedClass)?.sections.map((section) => (
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
                Click on a class to view student results
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
                          <span className="text-sm text-muted-foreground">Average Score:</span>
                          <span className="font-medium">{formatPercentage(classItem.averageScore)}</span>
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
                Click on a student to view their detailed results
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
              <div className="space-y-4">
                {currentStudents.map((student) => (
                  <Accordion key={student.studentId} type="single" collapsible>
                    <AccordionItem value={student.studentId}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center space-x-4">
                            <div className="text-left">
                              <div className="font-medium">{student.studentName}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.admissionNumber} • {student.className} {student.classSection}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="font-bold text-lg">{formatPercentage(student.averageScore)}</div>
                              <div className="text-sm text-muted-foreground">Average</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{student.totalSubjects}</div>
                              <div className="text-sm text-muted-foreground">Subjects</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{student.termlyResults.length}</div>
                              <div className="text-sm text-muted-foreground">Terms</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">
                                {student.bestPosition === Infinity ? '-' : student.bestPosition}
                                {student.bestPosition !== student.worstPosition && student.bestPosition !== Infinity && student.worstPosition !== 0 && 
                                  `-${student.worstPosition}`
                                }
                              </div>
                              <div className="text-sm text-muted-foreground">Position Range</div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrintStudent(student);
                              }}
                              className="ml-2"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {student.termlyResults.map((result) => (
                            <Card key={result.id}>
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>{getTermLabel(result.term)} Results</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="text-center">
                                      <div className="font-bold text-lg">{formatPercentage(result.averagePercentage)}</div>
                                      <div className="text-sm text-muted-foreground">Average</div>
                                    </div>
                                    <div className="text-center">
                                      {getGradeBadge(result.letterGrade)}
                                      <div className="text-sm text-muted-foreground">{result.averageGradePoints.toFixed(1)} pts</div>
                                    </div>
                                    <div className="text-center">
                                      {getPositionBadge(result.position)}
                                      <div className="text-sm text-muted-foreground">Position</div>
                                    </div>
                                  </div>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {/* Subject Scores Table */}
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Subject</TableHead>
                                        {scoringConfig?.educationLevel === 'nursery' ? (
                                          <>
                                            <TableHead>First Test (20%)</TableHead>
                                            <TableHead>Second Test (20%)</TableHead>
                                            <TableHead>Total Test (40%)</TableHead>
                                            <TableHead>Exam (60%)</TableHead>
                                            <TableHead>Total (100%)</TableHead>
                                          </>
                                        ) : (
                                          <>
                                            <TableHead>Kick-Off Test (5%)</TableHead>
                                            <TableHead>First Test (10%)</TableHead>
                                            <TableHead>Second Test (10%)</TableHead>
                                            <TableHead>Note (5%)</TableHead>
                                            <TableHead>Project (10%)</TableHead>
                                            <TableHead>Total Test (40%)</TableHead>
                                            <TableHead>Exam (60%)</TableHead>
                                            <TableHead>Total (100%)</TableHead>
                                          </>
                                        )}
                                        <TableHead>Position</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Remarks</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {result.subjectScores.map((score) => (
                                        <TableRow key={score.id}>
                                          <TableCell className="font-medium">{score.subjectName}</TableCell>
                                          {scoringConfig?.educationLevel === 'nursery' ? (
                                            <>
                                              <TableCell>{score.nurseryFirstTest || '-'}</TableCell>
                                              <TableCell>{score.nurserySecondTest || '-'}</TableCell>
                                              <TableCell>{score.nurseryTotalTest || '-'}</TableCell>
                                              <TableCell>{score.nurseryExam || '-'}</TableCell>
                                              <TableCell className="font-bold">{score.nurseryTotal || '-'}</TableCell>
                                            </>
                                          ) : (
                                            <>
                                              <TableCell>{score.kickOffTest || '-'}</TableCell>
                                              <TableCell>{score.firstTest || '-'}</TableCell>
                                              <TableCell>{score.secondTest || '-'}</TableCell>
                                              <TableCell>{score.note || '-'}</TableCell>
                                              <TableCell>{score.project || '-'}</TableCell>
                                              <TableCell>{score.totalTest || '-'}</TableCell>
                                              <TableCell>{score.exam || '-'}</TableCell>
                                              <TableCell className="font-bold">{score.total || '-'}</TableCell>
                                            </>
                                          )}
                                          <TableCell>{score.subjectPosition ? getPositionBadge(score.subjectPosition) : '-'}</TableCell>
                                          <TableCell>{score.grade ? getGradeBadge(score.grade) : '-'}</TableCell>
                                          <TableCell className="max-w-xs">
                                            <div className="text-sm">{score.remarks || '-'}</div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* Summary Information */}
                                <div className="grid gap-4 md:grid-cols-3 mt-4">
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Performance Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm">Total Score:</span>
                                        <span className="font-medium">{result.totalScore}/{result.maxPossibleScore}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Average:</span>
                                        <span className="font-medium">{formatPercentage(result.averagePercentage)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Grade Points:</span>
                                        <span className="font-medium">{result.totalGradePoints.toFixed(1)}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Academic Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm">Position:</span>
                                        <span className="font-medium">{getPositionBadge(result.position)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Promotion:</span>
                                        <Badge variant={result.isPromoted ? "default" : "destructive"}>
                                          {result.isPromoted ? 'Promoted' : 'Not Promoted'}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Subjects:</span>
                                        <span className="font-medium">{result.subjectScores.length}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => navigate(`/dashboard/school-admin/grading/results/${result.id}`)}
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => navigate(`/dashboard/school-admin/grading/annual/${result.studentId}/${result.academicYear}`)}
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Annual Results
                                      </Button>
                                    </CardContent>
                                  </Card>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
