import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  DollarSign, 
  Calendar,
  Users,
  Eye,
  FileText,
  Download,
  MoreHorizontal,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { mockStudents, mockPayments, mockFees, mockClasses } from '@/utils/mockData';
import { Student, Payment, Fee } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface PaymentSummary {
  totalStudents: number;
  paidStudents: number;
  owingStudents: number;
  totalAmount: number;
  paidAmount: number;
  owingAmount: number;
}

export default function TeacherPaymentsDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [termFilter, setTermFilter] = useState<string>('all');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);

  useEffect(() => {
    // Filter students based on teacher's classes (assuming teacher has access to specific classes)
    const teacherClasses = ['class-1', 'class-2', 'class-3']; // This should come from teacher context
    const filteredStudents = mockStudents.filter(student => 
      student.currentClassId && teacherClasses.includes(student.currentClassId)
    );
    setStudents(filteredStudents);
    setPayments(mockPayments);
    setFees(mockFees);
  }, []);

  const getPaymentSummary = (): PaymentSummary => {
    const totalStudents = students.length;
    const studentIds = students.map(s => s.id);
    
    const studentPayments = payments.filter(p => studentIds.includes(p.studentId));
    const paidStudents = new Set(studentPayments.filter(p => p.status === 'paid').map(p => p.studentId)).size;
    const owingStudents = totalStudents - paidStudents;
    
    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0) * totalStudents;
    const paidAmount = studentPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const owingAmount = totalAmount - paidAmount;

    return {
      totalStudents,
      paidStudents,
      owingStudents,
      totalAmount,
      paidAmount,
      owingAmount
    };
  };

  const getStudentPaymentStatus = (studentId: string) => {
    const studentPayments = payments.filter(p => p.studentId === studentId);
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = studentPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    if (paidAmount >= totalFees) {
      return { status: 'paid', amount: paidAmount, owing: 0 };
    } else {
      return { status: 'owing', amount: paidAmount, owing: totalFees - paidAmount };
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    } else if (status === 'owing') {
      return <Badge className="bg-red-100 text-red-800">Owing</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
    }
  };

  const handleGenerateInvoice = (studentId: string) => {
    window.location.href = `/dashboard/teacher/payments/invoice/${studentId}`;
  };

  const handleViewDetails = (studentId: string) => {
    window.location.href = `/dashboard/teacher/payments/student/${studentId}`;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = classFilter === 'all' || student.currentClassId === classFilter;
    
    return matchesSearch && matchesClass;
  });

  const summary = getPaymentSummary();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Payments</h1>
          <p className="text-gray-600 mt-2">Monitor student fee payments and generate invoices</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/dashboard/teacher/payments/reports'}>
            <FileText className="h-4 w-4" />
            View Reports
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Bulk Invoices
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              In your classes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Students</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.paidStudents}</div>
            <p className="text-xs text-muted-foreground">
              {((summary.paidStudents / summary.totalStudents) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owing Students</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.owingStudents}</div>
            <p className="text-xs text-muted-foreground">
              Need to pay fees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owing</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₦{summary.owingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Outstanding fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Students</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Term</label>
              <Select value={termFilter} onValueChange={setTermFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="first_term">First Term</SelectItem>
                  <SelectItem value="second_term">Second Term</SelectItem>
                  <SelectItem value="third_term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Year</label>
              <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Payment Status
          </CardTitle>
          <CardDescription>
            View payment status for all students in your classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Amount Owing</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                const paymentStatus = getStudentPaymentStatus(student.id);
                const studentPayments = payments.filter(p => p.studentId === student.id);
                const lastPayment = studentPayments
                  .filter(p => p.status === 'paid')
                  .sort((a, b) => new Date(b.paidDate || '').getTime() - new Date(a.paidDate || '').getTime())[0];

                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{student.firstName} {student.lastName}</div>
                          <div className="text-sm text-gray-500">{student.studentId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.currentClassName || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(paymentStatus.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">
                        ₦{paymentStatus.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600 font-medium">
                        ₦{paymentStatus.owing.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {lastPayment ? (
                        <div className="text-sm">
                          <div className="font-medium">₦{lastPayment.amount.toLocaleString()}</div>
                          <div className="text-gray-500">
                            {new Date(lastPayment.paidDate || '').toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No payments</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(student.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateInvoice(student.id)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
