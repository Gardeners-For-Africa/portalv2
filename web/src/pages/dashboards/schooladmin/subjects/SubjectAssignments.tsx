import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  BookOpen, 
  GraduationCap,
  Save,
  Trash2,
  Edit,
  Search,
  Filter
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SubjectAssignment, Subject, SchoolClass } from '@/types';
import { mockSubjectAssignments, mockSubjects, mockClasses, mockUsers } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

interface AssignmentFormData {
  subjectId: string;
  classId: string;
  teacherId: string;
  academicYear: string;
}

const initialFormData: AssignmentFormData = {
  subjectId: '',
  classId: '',
  teacherId: '',
  academicYear: '2024-2025',
};

export default function SubjectAssignments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<SubjectAssignment[]>(mockSubjectAssignments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  const teachers = mockUsers.filter(user => user.role === 'teacher');
  const subjects = mockSubjects.filter(subject => subject.isActive);
  const classes = mockClasses.filter(cls => cls.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subjectId || !formData.classId || !formData.teacherId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const subject = subjects.find(s => s.id === formData.subjectId);
      const classItem = classes.find(c => c.id === formData.classId);
      const teacher = teachers.find(t => t.id === formData.teacherId);

      if (!subject || !classItem || !teacher) {
        throw new Error('Invalid data');
      }

      const newAssignment: SubjectAssignment = {
        id: `assignment-${Date.now()}`,
        subjectId: formData.subjectId,
        subjectName: subject.name,
        classId: formData.classId,
        className: classItem.name,
        teacherId: formData.teacherId,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        academicYear: formData.academicYear,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAssignments(prev => [...prev, newAssignment]);
      setFormData(initialFormData);
      setIsDialogOpen(false);

      toast({
        title: "Assignment created",
        description: "Subject assignment has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      toast({
        title: "Assignment deleted",
        description: "The assignment has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = subjectFilter === 'all' || assignment.subjectId === subjectFilter;
    const matchesClass = classFilter === 'all' || assignment.classId === classFilter;
    
    return matchesSearch && matchesSubject && matchesClass;
  });

  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.isActive).length,
    subjects: new Set(assignments.map(a => a.subjectId)).size,
    classes: new Set(assignments.map(a => a.classId)).size,
    teachers: new Set(assignments.map(a => a.teacherId)).size,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/school-admin/subjects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subjects
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subject Assignments</h1>
          <p className="text-muted-foreground">
            Manage subject assignments to classes and teachers
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Assigned</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Covered</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers Assigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>
                    Assign a subject to a class and teacher for the academic year.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select
                        value={formData.subjectId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name} ({subject.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class">Class *</Label>
                      <Select
                        value={formData.classId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((classItem) => (
                            <SelectItem key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacher">Teacher *</Label>
                      <Select
                        value={formData.teacherId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, teacherId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.firstName} {teacher.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Input
                        id="academicYear"
                        value={formData.academicYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                        placeholder="2024-2025"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Creating...' : 'Create Assignment'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Assignments ({filteredAssignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.subjectName}</div>
                        <div className="text-sm text-muted-foreground">
                          {subjects.find(s => s.id === assignment.subjectId)?.code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{assignment.className}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{assignment.teacherName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{assignment.academicYear}</Badge>
                    </TableCell>
                    <TableCell>
                      {assignment.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAssignments.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No assignments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || subjectFilter !== 'all' || classFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first assignment.'
                }
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Assignment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
