import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Plus, 
  Save, 
  MoreHorizontal, 
  Edit, 
  Eye,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Calendar,
  FileText
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: string;
  name: string;
  studentId: string;
  avatar?: string;
  currentScore: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  lastUpdated: string;
  status: 'pending' | 'submitted' | 'graded';
}

interface Subject {
  id: string;
  name: string;
  code: string;
  class: string;
  totalStudents: number;
  averageScore: number;
}

const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    code: 'MATH101',
    class: 'Form 3A',
    totalStudents: 25,
    averageScore: 78.5
  },
  {
    id: '2',
    name: 'Physics',
    code: 'PHYS101',
    class: 'Form 4A',
    totalStudents: 22,
    averageScore: 82.3
  }
];

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Emma Wilson',
    studentId: 'ST001',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    currentScore: 85,
    totalMarks: 100,
    percentage: 85,
    grade: 'A',
    lastUpdated: '2024-03-15',
    status: 'graded'
  },
  {
    id: '2',
    name: 'James Brown',
    studentId: 'ST002',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    currentScore: 92,
    totalMarks: 100,
    percentage: 92,
    grade: 'A+',
    lastUpdated: '2024-03-15',
    status: 'graded'
  },
  {
    id: '3',
    name: 'Sophia Davis',
    studentId: 'ST003',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    currentScore: 0,
    totalMarks: 100,
    percentage: 0,
    grade: 'N/A',
    lastUpdated: 'Not set',
    status: 'pending'
  }
];

export default function Scores() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { className: 'bg-yellow-100 text-yellow-800' },
      submitted: { className: 'bg-blue-100 text-blue-800' },
      graded: { className: 'bg-green-100 text-green-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getGradeBadge = (grade: string) => {
    if (grade === 'N/A') return <Badge variant="outline">N/A</Badge>;
    
    const gradeConfig = {
      'A+': { className: 'bg-green-100 text-green-800' },
      'A': { className: 'bg-green-100 text-green-800' },
      'B+': { className: 'bg-blue-100 text-blue-800' },
      'B': { className: 'bg-blue-100 text-blue-800' },
      'C+': { className: 'bg-yellow-100 text-yellow-800' },
      'C': { className: 'bg-yellow-100 text-yellow-800' },
      'D': { className: 'bg-orange-100 text-orange-800' },
      'F': { className: 'bg-red-100 text-red-800' }
    };
    
    const config = gradeConfig[grade as keyof typeof gradeConfig];
    return config ? (
      <Badge className={config.className}>{grade}</Badge>
    ) : (
      <Badge variant="outline">{grade}</Badge>
    );
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleAddScore = (student: Student) => {
    // Navigate to detailed score entry page
    navigate(`/dashboard/teacher/grades/score-entry/${student.id}`, {
      state: {
        student,
        mode: 'add'
      }
    });
  };

  const handleEditScore = (student: Student) => {
    // Navigate to detailed score entry page
    navigate(`/dashboard/teacher/grades/score-entry/${student.id}`, {
      state: {
        student,
        mode: 'edit'
      }
    });
  };

  const openAddScoreDialog = (student: Student) => {
    if (student.status === 'pending') {
      handleAddScore(student);
    } else {
      handleEditScore(student);
    }
  };

  const getGradeFromPercentage = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getUniqueClasses = () => [...new Set(mockSubjects.map(subject => subject.class))];

  const getStats = () => {
    const totalStudents = mockStudents.length;
    const graded = mockStudents.filter(s => s.status === 'graded').length;
    const pending = mockStudents.filter(s => s.status === 'pending').length;
    const averageScore = mockStudents
      .filter(s => s.status === 'graded')
      .reduce((sum, s) => sum + s.percentage, 0) / Math.max(graded, 1);
    
    return { totalStudents, graded, pending, averageScore: Math.round(averageScore) };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scores Management</h1>
          <p className="text-gray-600 mt-2">Enter and manage student scores for your subjects</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export Scores
          </Button>
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select subject and class to view students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {mockSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {getUniqueClasses().map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="search">Search Students</Label>
              <Input
                id="search"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
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
      </div>

      {/* Students Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Scores</CardTitle>
          <CardDescription>Manage individual student scores and grades</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
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
                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">ID: {student.studentId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{student.currentScore}/{student.totalMarks}</span>
                      <Progress value={student.percentage} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPerformanceColor(student.percentage)}`}>
                      {student.percentage}%
                    </span>
                  </TableCell>
                  <TableCell>{getGradeBadge(student.grade)}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
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
                        <DropdownMenuItem onClick={() => openAddScoreDialog(student)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {student.status === 'pending' ? 'Add Score' : 'Edit Score'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
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
