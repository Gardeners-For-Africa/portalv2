import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  UserCheck
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  hireDate: string;
  qualification: string;
  specialization: string;
  status: 'active' | 'inactive' | 'on_leave';
  subjects: string[];
  classes: string[];
  avatar?: string;
}

const mockTeachers: Teacher[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@school.com',
    phone: '+1234567890',
    address: '123 Education St, City',
    dateOfBirth: '1985-03-15',
    hireDate: '2020-09-01',
    qualification: 'Master of Education',
    specialization: 'Mathematics',
    status: 'active',
    subjects: ['Mathematics', 'Advanced Mathematics'],
    classes: ['Form 3A', 'Form 4A', 'Form 5A'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@school.com',
    phone: '+1234567891',
    address: '456 Learning Ave, City',
    dateOfBirth: '1990-07-22',
    hireDate: '2021-01-15',
    qualification: 'Bachelor of Science',
    specialization: 'Physics',
    status: 'active',
    subjects: ['Physics', 'Chemistry'],
    classes: ['Form 2B', 'Form 3B'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@school.com',
    phone: '+1234567892',
    address: '789 Knowledge Rd, City',
    dateOfBirth: '1988-11-08',
    hireDate: '2019-08-20',
    qualification: 'Master of Arts',
    specialization: 'English Literature',
    status: 'on_leave',
    subjects: ['English', 'Literature'],
    classes: ['Form 1A', 'Form 2A'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  }
];

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [newTeacher, setNewTeacher] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    hireDate: '',
    qualification: '',
    specialization: '',
    subjects: '',
    classes: ''
  });

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    const matchesSpecialization = specializationFilter === 'all' || teacher.specialization === specializationFilter;
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: 'bg-green-100 text-green-800' },
      inactive: { className: 'bg-red-100 text-red-800' },
      on_leave: { className: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.className}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const handleCreateTeacher = () => {
    if (newTeacher.firstName && newTeacher.lastName && newTeacher.email) {
      const teacher: Teacher = {
        id: Date.now().toString(),
        firstName: newTeacher.firstName,
        lastName: newTeacher.lastName,
        email: newTeacher.email,
        phone: newTeacher.phone,
        address: newTeacher.address,
        dateOfBirth: newTeacher.dateOfBirth,
        hireDate: newTeacher.hireDate,
        qualification: newTeacher.qualification,
        specialization: newTeacher.specialization,
        status: 'active',
        subjects: newTeacher.subjects ? newTeacher.subjects.split(',').map(s => s.trim()) : [],
        classes: newTeacher.classes ? newTeacher.classes.split(',').map(c => c.trim()) : []
      };
      
      setTeachers([...teachers, teacher]);
      setNewTeacher({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        hireDate: '',
        qualification: '',
        specialization: '',
        subjects: '',
        classes: ''
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditTeacher = () => {
    if (selectedTeacher && newTeacher.firstName && newTeacher.lastName && newTeacher.email) {
      const updatedTeacher: Teacher = {
        ...selectedTeacher,
        firstName: newTeacher.firstName,
        lastName: newTeacher.lastName,
        email: newTeacher.email,
        phone: newTeacher.phone,
        address: newTeacher.address,
        dateOfBirth: newTeacher.dateOfBirth,
        hireDate: newTeacher.hireDate,
        qualification: newTeacher.qualification,
        specialization: newTeacher.specialization,
        subjects: newTeacher.subjects ? newTeacher.subjects.split(',').map(s => s.trim()) : [],
        classes: newTeacher.classes ? newTeacher.classes.split(',').map(c => c.trim()) : []
      };
      
      setTeachers(teachers.map(t => t.id === selectedTeacher.id ? updatedTeacher : t));
      setIsEditDialogOpen(false);
      setSelectedTeacher(null);
    }
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers(teachers.filter(teacher => teacher.id !== id));
  };

  const openEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setNewTeacher({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
      dateOfBirth: teacher.dateOfBirth,
      hireDate: teacher.hireDate,
      qualification: teacher.qualification,
      specialization: teacher.specialization,
      subjects: teacher.subjects.join(', '),
      classes: teacher.classes.join(', ')
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsViewDialogOpen(true);
  };

  const getUniqueSpecializations = () => [...new Set(teachers.map(teacher => teacher.specialization))];

  const getStats = () => {
    const total = teachers.length;
    const active = teachers.filter(t => t.status === 'active').length;
    const onLeave = teachers.filter(t => t.status === 'on_leave').length;
    const inactive = teachers.filter(t => t.status === 'inactive').length;
    
    return { total, active, onLeave, inactive };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers Management</h1>
          <p className="text-gray-600 mt-2">Manage school teaching staff and their information</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>
                Add a new teacher to the school staff
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newTeacher.firstName}
                    onChange={(e) => setNewTeacher({...newTeacher, firstName: e.target.value})}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newTeacher.lastName}
                    onChange={(e) => setNewTeacher({...newTeacher, lastName: e.target.value})}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                    placeholder="email@school.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newTeacher.address}
                  onChange={(e) => setNewTeacher({...newTeacher, address: e.target.value})}
                  placeholder="Full address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newTeacher.dateOfBirth}
                    onChange={(e) => setNewTeacher({...newTeacher, dateOfBirth: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={newTeacher.hireDate}
                    onChange={(e) => setNewTeacher({...newTeacher, hireDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={newTeacher.qualification}
                    onChange={(e) => setNewTeacher({...newTeacher, qualification: e.target.value})}
                    placeholder="e.g., Master of Education"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={newTeacher.specialization}
                    onChange={(e) => setNewTeacher({...newTeacher, specialization: e.target.value})}
                    placeholder="e.g., Mathematics"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                  <Input
                    id="subjects"
                    value={newTeacher.subjects}
                    onChange={(e) => setNewTeacher({...newTeacher, subjects: e.target.value})}
                    placeholder="e.g., Mathematics, Advanced Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classes">Classes (comma-separated)</Label>
                  <Input
                    id="classes"
                    value={newTeacher.classes}
                    onChange={(e) => setNewTeacher({...newTeacher, classes: e.target.value})}
                    placeholder="e.g., Form 3A, Form 4A"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeacher}>Add Teacher</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.onLeave}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Teachers List</CardTitle>
          <CardDescription>Manage all teaching staff members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {getUniqueSpecializations().map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={teacher.avatar} alt={`${teacher.firstName} ${teacher.lastName}`} />
                        <AvatarFallback>{teacher.firstName[0]}{teacher.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{teacher.firstName} {teacher.lastName}</div>
                        <div className="text-sm text-gray-500">{teacher.qualification}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        {teacher.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="h-3 w-3" />
                        {teacher.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      {teacher.specialization}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.map((cls, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openViewDialog(teacher)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(teacher)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the teacher account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update teacher information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={newTeacher.firstName}
                  onChange={(e) => setNewTeacher({...newTeacher, firstName: e.target.value})}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={newTeacher.lastName}
                  onChange={(e) => setNewTeacher({...newTeacher, lastName: e.target.value})}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                  placeholder="email@school.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAddress">Address</Label>
              <Input
                id="editAddress"
                value={newTeacher.address}
                onChange={(e) => setNewTeacher({...newTeacher, address: e.target.value})}
                placeholder="Full address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editDateOfBirth">Date of Birth</Label>
                <Input
                  id="editDateOfBirth"
                  type="date"
                  value={newTeacher.dateOfBirth}
                  onChange={(e) => setNewTeacher({...newTeacher, dateOfBirth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editHireDate">Hire Date</Label>
                <Input
                  id="editHireDate"
                  type="date"
                  value={newTeacher.hireDate}
                  onChange={(e) => setNewTeacher({...newTeacher, hireDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editQualification">Qualification</Label>
                <Input
                  id="editQualification"
                  value={newTeacher.qualification}
                  onChange={(e) => setNewTeacher({...newTeacher, qualification: e.target.value})}
                  placeholder="e.g., Master of Education"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSpecialization">Specialization</Label>
                <Input
                  id="editSpecialization"
                  value={newTeacher.specialization}
                  onChange={(e) => setNewTeacher({...newTeacher, specialization: e.target.value})}
                  placeholder="e.g., Mathematics"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editSubjects">Subjects (comma-separated)</Label>
                <Input
                  id="editSubjects"
                  value={newTeacher.subjects}
                  onChange={(e) => setNewTeacher({...newTeacher, subjects: e.target.value})}
                  placeholder="e.g., Mathematics, Advanced Mathematics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClasses">Classes (comma-separated)</Label>
                <Input
                  id="editClasses"
                  value={newTeacher.classes}
                  onChange={(e) => setNewTeacher({...newTeacher, classes: e.target.value})}
                  placeholder="e.g., Form 3A, Form 4A"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTeacher}>Update Teacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Teacher Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
            <DialogDescription>
              View complete teacher information
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedTeacher.avatar} alt={`${selectedTeacher.firstName} ${selectedTeacher.lastName}`} />
                  <AvatarFallback className="text-lg">{selectedTeacher.firstName[0]}{selectedTeacher.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedTeacher.firstName} {selectedTeacher.lastName}</h3>
                  <p className="text-gray-600">{selectedTeacher.qualification}</p>
                  <div className="mt-2">{getStatusBadge(selectedTeacher.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {selectedTeacher.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {selectedTeacher.phone}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Address</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {selectedTeacher.address}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {selectedTeacher.dateOfBirth}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Hire Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {selectedTeacher.hireDate}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Specialization</Label>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  {selectedTeacher.specialization}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Subjects</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTeacher.subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Classes</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTeacher.classes.map((cls, index) => (
                    <Badge key={index} variant="outline">
                      {cls}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
