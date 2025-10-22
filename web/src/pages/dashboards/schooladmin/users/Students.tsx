import {
  Edit,
  Eye,
  GraduationCap,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  phone: string;
  class: string;
  grade: string;
  parentName: string;
  status: "active" | "inactive" | "graduated";
  subjects: string[];
}

const mockStudents: Student[] = [
  {
    id: "1",
    firstName: "Emma",
    lastName: "Wilson",
    studentId: "ST001",
    email: "emma.wilson@student.school.com",
    phone: "+1234567890",
    class: "Form 3A",
    grade: "Grade 9",
    parentName: "John Wilson",
    status: "active",
    subjects: ["Mathematics", "English", "Science", "History"],
  },
  {
    id: "2",
    firstName: "James",
    lastName: "Brown",
    studentId: "ST002",
    email: "james.brown@student.school.com",
    phone: "+1234567892",
    class: "Form 4A",
    grade: "Grade 10",
    parentName: "Sarah Brown",
    status: "active",
    subjects: ["Mathematics", "Physics", "Chemistry", "English"],
  },
];

export default function Students() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    phone: "",
    class: "",
    grade: "",
    parentName: "",
    subjects: "",
  });

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesClass = classFilter === "all" || student.class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-green-100 text-green-800" },
      inactive: { className: "bg-red-100 text-red-800" },
      graduated: { className: "bg-blue-100 text-blue-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.className}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    );
  };

  const handleCreateStudent = () => {
    if (newStudent.firstName && newStudent.lastName && newStudent.studentId && newStudent.email) {
      const student: Student = {
        id: Date.now().toString(),
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        studentId: newStudent.studentId,
        email: newStudent.email,
        phone: newStudent.phone,
        class: newStudent.class,
        grade: newStudent.grade,
        parentName: newStudent.parentName,
        status: "active",
        subjects: newStudent.subjects ? newStudent.subjects.split(",").map((s) => s.trim()) : [],
      };

      setStudents([...students, student]);
      setNewStudent({
        firstName: "",
        lastName: "",
        studentId: "",
        email: "",
        phone: "",
        class: "",
        grade: "",
        parentName: "",
        subjects: "",
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter((student) => student.id !== id));
  };

  const getUniqueClasses = () => [...new Set(students.map((student) => student.class))];

  const getStats = () => {
    const total = students.length;
    const active = students.filter((s) => s.status === "active").length;
    const graduated = students.filter((s) => s.status === "graduated").length;
    const inactive = students.filter((s) => s.status === "inactive").length;

    return { total, active, graduated, inactive };
  };

  const stats = getStats();

  return (
    <div className="p-3 space-y-6">
      {/* Header: Responsive flex */}
      <div className="flex flex-col gap-3 items-start sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage school student information and records
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 text-base sm:text-base">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[100vh]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Add a new student to the school</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Responsive form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newStudent.firstName}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={newStudent.studentId}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        studentId: e.target.value,
                      })
                    }
                    placeholder="Student ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="email@student.school.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    value={newStudent.class}
                    onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                    placeholder="e.g., Form 3A"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    placeholder="e.g., Grade 9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentName">Parent Name</Label>
                  <Input
                    id="parentName"
                    value={newStudent.parentName}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        parentName: e.target.value,
                      })
                    }
                    placeholder="Parent full name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                <Input
                  id="subjects"
                  value={newStudent.subjects}
                  onChange={(e) => setNewStudent({ ...newStudent, subjects: e.target.value })}
                  placeholder="e.g., Mathematics, English, Science"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateStudent}>Add Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards: Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduated</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.graduated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Students List</CardTitle>
          <CardDescription className="text-sm">Manage all student records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] text-sm sm:text-base">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[150px] text-sm sm:text-base">
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
          </div>
          {/* 📱 Card view on small screens */}
          <div className="space-y-4 md:hidden">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="p-4 shadow-sm">
                {/* Top Section: Avatar + Name + Status + Actions */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-base">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-gray-500">ID: {student.studentId}</div>

                      {/* Status Badge under the name */}
                      <div className="mt-1">{getStatusBadge(student.status)}</div>
                    </div>
                  </div>

                  {/* Actions Dropdown on the right */}
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
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Details Section */}
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Phone:</span> {student.phone}
                  </div>
                  <div>
                    <span className="font-semibold">Class:</span> {student.class}
                  </div>
                  <div>
                    <span className="font-semibold">Grade:</span> {student.grade}
                  </div>
                  <div>
                    <span className="font-semibold">Parent:</span> {student.parentName}
                  </div>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {student.subjects.map((subject, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden xs:table-cell">Contact</TableHead>
                  <TableHead>Class & Grade</TableHead>
                  <TableHead className="hidden sm:table-cell">Parent Info</TableHead>
                  <TableHead className="hidden md:table-cell">Subjects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarFallback>
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm sm:text-base">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            ID: {student.studentId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xs:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                          <Phone className="h-3 w-3" />
                          {student.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm sm:text-base">{student.class}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{student.grade}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-xs sm:text-sm">{student.parentName}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {student.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
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
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
