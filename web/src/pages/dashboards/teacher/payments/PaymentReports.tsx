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
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { mockStudents, mockPayments, mockFees, mockClasses } from '@/utils/mockData';
import { Student, Payment, Fee } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface PaymentAnalytics {
  totalStudents: number;
  paidStudents: number;
  owingStudents: number;
  totalFees: number;
  paidAmount: number;
  owingAmount: number;
  paymentRate: number;
  averagePayment: number;
  monthlyTrends: Array<{
    month: string;
    paid: number;
    owing: number;
  }>;
  classBreakdown: Array<{
    className: string;
    totalStudents: number;
    paidStudents: number;
    owingStudents: number;
    totalAmount: number;
    paidAmount: number;
    owingAmount: number;
  }>;
  feeCategoryBreakdown: Array<{
    category: string;
    totalAmount: number;
    paidAmount: number;
    owingAmount: number;
    paymentRate: number;
  }>;
}

export default function PaymentReports() {
  const { toast } = useToast();
  const [classFilter, setClassFilter] = useState<string>('all');
  const [termFilter, setTermFilter] = useState<string>('all');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('current_term');
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);

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

  useEffect(() => {
    if (students.length > 0 && payments.length > 0 && fees.length > 0) {
      calculateAnalytics();
    }
  }, [students, payments, fees, classFilter, termFilter, academicYearFilter, dateRangeFilter]);

  const calculateAnalytics = () => {
    const filteredStudents = classFilter === 'all' 
      ? students 
      : students.filter(s => s.currentClassId === classFilter);

    const totalStudents = filteredStudents.length;
    const studentIds = filteredStudents.map(s => s.id);
    
    const studentPayments = payments.filter(p => studentIds.includes(p.studentId));
    const paidStudents = new Set(studentPayments.filter(p => p.status === 'paid').map(p => p.studentId)).size;
    const owingStudents = totalStudents - paidStudents;
    
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0) * totalStudents;
    const paidAmount = studentPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const owingAmount = totalFees - paidAmount;
    const paymentRate = totalStudents > 0 ? (paidStudents / totalStudents) * 100 : 0;
    const averagePayment = paidStudents > 0 ? paidAmount / paidStudents : 0;

    // Monthly trends (mock data for demonstration)
    const monthlyTrends = [
      { month: 'Jan', paid: 45000, owing: 15000 },
      { month: 'Feb', paid: 52000, owing: 8000 },
      { month: 'Mar', paid: 48000, owing: 12000 },
      { month: 'Apr', paid: 55000, owing: 5000 },
      { month: 'May', paid: 60000, owing: 0 },
      { month: 'Jun', paid: 58000, owing: 2000 }
    ];

    // Class breakdown
    const classBreakdown = mockClasses
      .filter(cls => teacherClasses.includes(cls.id))
      .map(cls => {
        const classStudents = filteredStudents.filter(s => s.currentClassId === cls.id);
        const classStudentIds = classStudents.map(s => s.id);
        const classPayments = studentPayments.filter(p => classStudentIds.includes(p.studentId));
        const classPaidStudents = new Set(classPayments.filter(p => p.status === 'paid').map(p => p.studentId)).size;
        const classTotalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0) * classStudents.length;
        const classPaidAmount = classPayments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);

        return {
          className: cls.name,
          totalStudents: classStudents.length,
          paidStudents: classPaidStudents,
          owingStudents: classStudents.length - classPaidStudents,
          totalAmount: classTotalAmount,
          paidAmount: classPaidAmount,
          owingAmount: classTotalAmount - classPaidAmount
        };
      });

    // Fee category breakdown
    const feeCategoryBreakdown = fees.reduce((acc, fee) => {
      const category = fee.category;
      const existing = acc.find(item => item.category === category);
      
      if (existing) {
        existing.totalAmount += fee.amount * totalStudents;
        // Calculate paid amount for this category
        const categoryPayments = studentPayments.filter(p => p.feeId === fee.id && p.status === 'paid');
        existing.paidAmount += categoryPayments.reduce((sum, p) => sum + p.amount, 0);
      } else {
        const categoryPayments = studentPayments.filter(p => p.feeId === fee.id && p.status === 'paid');
        const paidAmount = categoryPayments.reduce((sum, p) => sum + p.amount, 0);
        acc.push({
          category: category.replace('_', ' '),
          totalAmount: fee.amount * totalStudents,
          paidAmount,
          owingAmount: (fee.amount * totalStudents) - paidAmount,
          paymentRate: totalStudents > 0 ? (paidAmount / (fee.amount * totalStudents)) * 100 : 0
        });
      }
      
      return acc;
    }, [] as Array<{
      category: string;
      totalAmount: number;
      paidAmount: number;
      owingAmount: number;
      paymentRate: number;
    }>);

    setAnalytics({
      totalStudents,
      paidStudents,
      owingStudents,
      totalFees,
      paidAmount,
      owingAmount,
      paymentRate,
      averagePayment,
      monthlyTrends,
      classBreakdown,
      feeCategoryBreakdown
    });
  };

  const handleExportReport = () => {
    toast({
      title: "Report Exported",
      description: "Payment report has been exported successfully.",
    });
    // TODO: Implement actual export functionality
  };

  const getPaymentRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPaymentRateBadge = (rate: number) => {
    if (rate >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (rate >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
  };

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/teacher/payments'}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Reports</h1>
            <p className="text-gray-600 mt-2">Analytics and insights for student payments</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <span>Payments</span>
              <span>/</span>
              <span>Reports</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_term">Current Term</SelectItem>
                  <SelectItem value="current_year">Current Year</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              In selected classes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPaymentRateColor(analytics.paymentRate)}`}>
              {analytics.paymentRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Students who have paid
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₦{analytics.paidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Out of ₦{analytics.totalFees.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₦{analytics.owingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Still to be collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Monthly Payment Trends
          </CardTitle>
          <CardDescription>
            Payment collection trends over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4">
              {analytics.monthlyTrends.map((month) => (
                <div key={month.month} className="text-center">
                  <div className="text-sm font-medium text-gray-600">{month.month}</div>
                  <div className="text-lg font-bold text-green-600">₦{month.paid.toLocaleString()}</div>
                  <div className="text-xs text-red-600">₦{month.owing.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Chart visualization would go here</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Class Payment Breakdown
          </CardTitle>
          <CardDescription>
            Payment status breakdown by class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Total Students</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Owing</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Payment Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.classBreakdown.map((cls) => {
                const paymentRate = cls.totalStudents > 0 ? (cls.paidStudents / cls.totalStudents) * 100 : 0;
                return (
                  <TableRow key={cls.className}>
                    <TableCell className="font-medium">{cls.className}</TableCell>
                    <TableCell>{cls.totalStudents}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">{cls.paidStudents}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800">{cls.owingStudents}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">₦{cls.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600 font-medium">₦{cls.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600 font-medium">₦{cls.owingAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getPaymentRateColor(paymentRate)}`}>
                          {paymentRate.toFixed(1)}%
                        </span>
                        {getPaymentRateBadge(paymentRate)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fee Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Fee Category Breakdown
          </CardTitle>
          <CardDescription>
            Payment status by fee category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Payment Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.feeCategoryBreakdown.map((category) => (
                <TableRow key={category.category}>
                  <TableCell className="font-medium capitalize">{category.category}</TableCell>
                  <TableCell className="font-medium">₦{category.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600 font-medium">₦{category.paidAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600 font-medium">₦{category.owingAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPaymentRateColor(category.paymentRate)}`}>
                      {category.paymentRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {getPaymentRateBadge(category.paymentRate)}
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
