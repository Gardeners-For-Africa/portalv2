import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  MoreHorizontal,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  ExternalLink
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fee, Payment } from '@/types';
import { mockPayments, mockStudents, mockClasses } from '@/utils/mockData';

interface FeeDetailsTabsProps {
  fee: Fee;
  payments: Payment[];
}

export default function FeeDetailsTabs({ fee, payments }: FeeDetailsTabsProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      'paid': 'default',
      'pending': 'outline',
      'failed': 'destructive',
      'refunded': 'secondary',
      'cancelled': 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>;
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, React.ReactNode> = {
      'cash': <DollarSign className="h-4 w-4" />,
      'bank_transfer': <FileText className="h-4 w-4" />,
      'card': <FileText className="h-4 w-4" />,
      'mobile_money': <Users className="h-4 w-4" />,
      'check': <FileText className="h-4 w-4" />
    };
    return icons[method] || <DollarSign className="h-4 w-4" />;
  };

  const getProviderBadge = (provider: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      'monnify': 'default',
      'manual': 'secondary',
      'cash': 'outline',
      'bank_transfer': 'outline'
    };
    const labels: Record<string, string> = {
      'monnify': 'Monnify',
      'manual': 'Manual',
      'cash': 'Cash',
      'bank_transfer': 'Bank Transfer'
    };
    return <Badge variant={variants[provider] || 'outline'}>{labels[provider] || provider}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Group payments by class
  const paymentsByClass = useMemo(() => {
    const grouped: Record<string, Payment[]> = {};
    
    payments.forEach(payment => {
      if (!grouped[payment.classId]) {
        grouped[payment.classId] = [];
      }
      grouped[payment.classId].push(payment);
    });

    return grouped;
  }, [payments]);

  // Filter payments based on search and status
  const filteredPaymentsByClass = useMemo(() => {
    const filtered: Record<string, Payment[]> = {};
    
    Object.keys(paymentsByClass).forEach(classId => {
      const classPayments = paymentsByClass[classId].filter(payment => {
        const matchesSearch = 
          payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      });
      
      if (classPayments.length > 0) {
        filtered[classId] = classPayments;
      }
    });

    return filtered;
  }, [paymentsByClass, searchTerm, statusFilter]);

  // Get class statistics
  const getClassStats = (classId: string) => {
    const classPayments = paymentsByClass[classId] || [];
    const totalPayments = classPayments.length;
    const paidPayments = classPayments.filter(p => p.status === 'paid').length;
    const totalAmount = classPayments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = classPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    
    return { totalPayments, paidPayments, totalAmount, paidAmount };
  };

  // Get class name
  const getClassName = (classId: string) => {
    const classItem = mockClasses.find(c => c.id === classId);
    return classItem ? classItem.name : 'Unknown Class';
  };

  const handleViewPaymentDetails = (paymentId: string) => {
    navigate(`/dashboard/school-admin/payments/${paymentId}`);
  };

  const handleViewInvoice = (payment: Payment) => {
    if (payment.paymentUrl) {
      window.open(payment.paymentUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
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
                  placeholder="Search students, receipts, or invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue={Object.keys(paymentsByClass)[0] || ''} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          {Object.keys(paymentsByClass).map((classId) => {
            const stats = getClassStats(classId);
            return (
              <TabsTrigger key={classId} value={classId} className="flex flex-col items-start space-y-1">
                <div className="font-medium">{getClassName(classId)}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.paidPayments}/{stats.totalPayments} paid
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.keys(paymentsByClass).map((classId) => {
          const classPayments = filteredPaymentsByClass[classId] || [];
          const stats = getClassStats(classId);
          
          return (
            <TabsContent key={classId} value={classId} className="space-y-4">
              {/* Class Statistics */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPayments}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Paid</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.paidPayments}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.totalPayments - stats.paidPayments}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.paidAmount, fee.currency)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Students Table */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {getClassName(classId)} Students ({classPayments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Payment Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={mockStudents.find(s => s.id === payment.studentId)?.avatar} />
                                  <AvatarFallback>
                                    {payment.studentName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{payment.studentName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {payment.studentId}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {formatCurrency(payment.amount, payment.currency)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(payment.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getPaymentMethodIcon(payment.paymentMethod)}
                                <span className="capitalize">
                                  {payment.paymentMethod.replace('_', ' ')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getProviderBadge(payment.paymentProvider)}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {payment.invoiceId && (
                                  <div className="text-sm font-mono">
                                    {payment.invoiceId}
                                  </div>
                                )}
                                {payment.invoiceReference && (
                                  <div className="text-xs text-muted-foreground">
                                    {payment.invoiceReference}
                                  </div>
                                )}
                                {payment.paymentUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewInvoice(payment)}
                                    className="h-6 px-2"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="text-sm">
                                  {payment.paidDate ? formatDate(payment.paidDate) : 'Not paid'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Due: {formatDate(payment.dueDate)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewPaymentDetails(payment.id)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/dashboard/school-admin/payments/edit/${payment.id}`)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Payment
                                  </DropdownMenuItem>
                                  {payment.paymentUrl && (
                                    <DropdownMenuItem onClick={() => handleViewInvoice(payment)}>
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      View Invoice
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {classPayments.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No students found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== 'all'
                          ? 'Try adjusting your filters or search terms.'
                          : 'No students have made payments for this fee in this class yet.'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
