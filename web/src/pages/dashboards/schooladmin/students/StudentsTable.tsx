import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpDown, 
  ChevronDown, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowUp,
  Award,
  Filter,
  Search,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Student, StudentStatus, AcademicStatus } from '@/types';
import { mockStudents, mockClasses } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

type SortField = 'name' | 'studentId' | 'gradeLevel' | 'enrollmentStatus' | 'admissionDate';
type SortDirection = 'asc' | 'desc';

export default function StudentsTable() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      toast({
        title: "Student deleted",
        description: "The student has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePromoteStudent = async (studentId: string) => {
    try {
      setStudents(prev => prev.map(student => {
        if (student.id === studentId) {
          const nextGrade = getNextGrade(student.gradeLevel);
          return {
            ...student,
            gradeLevel: nextGrade,
            academicYear: '2025-2026',
          };
        }
        return student;
      }));
      toast({
        title: "Student promoted",
        description: "The student has been promoted to the next grade.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to promote student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGraduateStudent = async (studentId: string) => {
    try {
      setStudents(prev => prev.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            enrollmentStatus: 'graduated',
            academicStatus: 'graduated',
          };
        }
        return student;
      }));
      toast({
        title: "Student graduated",
        description: "The student has been graduated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to graduate student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getNextGrade = (currentGrade: string): string => {
    const gradeProgression: Record<string, string> = {
      'Basic 1': 'Basic 2',
      'Basic 2': 'Basic 3',
      'Basic 3': 'Basic 4',
      'Basic 4': 'Basic 5',
      'Basic 5': 'Basic 6',
      'Basic 6': 'JSS 1',
      'JSS 1': 'JSS 2',
      'JSS 2': 'JSS 3',
      'JSS 3': 'SSS 1',
      'SSS 1': 'SSS 2',
      'SSS 2': 'SSS 3',
      'SSS 3': 'Graduated',
    };
    return gradeProgression[currentGrade] || currentGrade;
  };

  const getStatusBadge = (status: StudentStatus) => {
    const variants: Record<StudentStatus, "default" | "secondary" | "outline" | "destructive"> = {
      'enrolled': 'default',
      'pending': 'outline',
      'withdrawn': 'destructive',
      'graduated': 'secondary',
      'suspended': 'destructive'
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getAcademicStatusBadge = (status: AcademicStatus) => {
    const variants: Record<AcademicStatus, "default" | "secondary" | "outline" | "destructive"> = {
      'active': 'default',
      'inactive': 'secondary',
      'on_leave': 'outline',
      'graduated': 'secondary'
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = selectedClass === 'all' || 
        (student.currentClassId === selectedClass);
      
      const matchesStatus = statusFilter === 'all' || 
        student.enrollmentStatus === statusFilter;
      
      return matchesSearch && matchesClass && matchesStatus;
    });

    // Sort students
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'studentId':
          aValue = a.studentId.toLowerCase();
          bValue = b.studentId.toLowerCase();
          break;
        case 'gradeLevel':
          aValue = a.gradeLevel;
          bValue = b.gradeLevel;
          break;
        case 'enrollmentStatus':
          aValue = a.enrollmentStatus;
          bValue = b.enrollmentStatus;
          break;
        case 'admissionDate':
          aValue = new Date(a.admissionDate);
          bValue = new Date(b.admissionDate);
          break;
        default:
          aValue = a.firstName.toLowerCase();
          bValue = b.firstName.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [students, searchTerm, selectedClass, statusFilter, sortField, sortDirection]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getClassOptions = () => {
    return [
      { value: 'all', label: 'All Classes' },
      ...mockClasses.map(c => ({ value: c.id, label: c.name }))
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students Table</h1>
          <p className="text-muted-foreground">
            View and manage students in a tabular format
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/school-admin/students/promote')}>
            <ArrowUp className="mr-2 h-4 w-4" />
            Promote Students
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard/school-admin/students/graduate')}>
            <Award className="mr-2 h-4 w-4" />
            Graduation
          </Button>
          <Button onClick={() => navigate('/dashboard/school-admin/students/new')}>
            <Users className="mr-2 h-4 w-4" />
            Admit Student
          </Button>
        </div>
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
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                {getClassOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Students ({filteredAndSortedStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('studentId')}
                      className="h-8 flex items-center gap-1"
                    >
                      Student ID
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('gradeLevel')}
                      className="h-8 flex items-center gap-1"
                    >
                      Grade Level
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('enrollmentStatus')}
                      className="h-8 flex items-center gap-1"
                    >
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('admissionDate')}
                      className="h-8 flex items-center gap-1"
                    >
                      Admission Date
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar} alt={`${student.firstName} ${student.lastName}`} />
                          <AvatarFallback>{getInitials(student.firstName, student.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.studentId}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.gradeLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      {student.currentSectionName ? (
                        <Badge variant="outline">{student.currentSectionName}</Badge>
                      ) : (
                        <span className="text-muted-foreground">No section</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(student.enrollmentStatus)}
                        {getAcademicStatusBadge(student.academicStatus)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(student.admissionDate)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/school-admin/students/${student.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/school-admin/students/edit/${student.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Student
                          </DropdownMenuItem>
                          {student.enrollmentStatus === 'enrolled' && student.academicStatus === 'active' && (
                            <DropdownMenuItem onClick={() => handlePromoteStudent(student.id)}>
                              <ArrowUp className="mr-2 h-4 w-4" />
                              Promote Student
                            </DropdownMenuItem>
                          )}
                          {student.gradeLevel === 'SSS 3' && student.enrollmentStatus === 'enrolled' && (
                            <DropdownMenuItem onClick={() => handleGraduateStudent(student.id)}>
                              <Award className="mr-2 h-4 w-4" />
                              Graduate Student
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedStudents.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No students found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedClass !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by admitting your first student.'
                }
              </p>
              <Button onClick={() => navigate('/dashboard/school-admin/students/new')}>
                <Users className="mr-2 h-4 w-4" />
                Admit Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
