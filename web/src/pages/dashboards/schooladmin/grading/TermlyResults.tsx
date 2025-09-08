import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
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
  MoreHorizontal,
  TableIcon,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentResult, Grade } from '@/types';
import { mockStudentResults, mockGrades, mockStudents, mockClasses } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TermlyResults() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<StudentResult[]>(mockStudentResults);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [termFilter, setTermFilter] = useState<string>('all');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');

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
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = classFilter === 'all' || result.classId === classFilter;
    const matchesTerm = termFilter === 'all' || result.term === termFilter;
    const matchesYear = academicYearFilter === 'all' || result.academicYear === academicYearFilter;
    
    return matchesSearch && matchesClass && matchesTerm && matchesYear;
  });

  const stats = {
    totalResults: results.length,
    totalStudents: new Set(results.map(r => r.studentId)).size,
    averageScore: results.reduce((sum, r) => sum + r.averageScore, 0) / results.length || 0,
    topPerformers: results.filter(r => r.position <= 3).length,
  };

  const handleViewDetails = (resultId: string) => {
    navigate(`/dashboard/school-admin/grading/results/${resultId}`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/school-admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Termly Results</h1>
            <p className="text-muted-foreground">
              View and manage student academic performance by term
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
          <Button onClick={() => navigate('/dashboard/school-admin/grading/termly-results')}>
            <TableIcon className="mr-2 h-4 w-4" />
            Tabular View
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard/school-admin/grading/termly-cards')}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Card View
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResults}</div>
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
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topPerformers}</div>
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
            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                <SelectItem value="first_term">First Term</SelectItem>
                <SelectItem value="second_term">Second Term</SelectItem>
                <SelectItem value="third_term">Third Term</SelectItem>
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

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Results ({filteredResults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Average Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={mockStudents.find(s => s.id === result.studentId)?.avatar} />
                          <AvatarFallback>
                            {result.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{result.studentName}</div>
                          <div className="text-sm text-muted-foreground">
                            {result.studentId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getClassName(result.classId)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{getTermLabel(result.term)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPositionBadge(result.position)}
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
                      {getGradeBadge(result.letterGrade)}
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
                      <div className="flex items-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(result.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Term Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/school-admin/grading/annual/${result.studentId}/${result.academicYear}`)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              View Annual Results
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.print()}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Result
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || classFilter !== 'all' || termFilter !== 'all' || academicYearFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'No student results have been recorded yet.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
