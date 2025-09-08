import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  ExternalLink,
  Copy,
  Download,
  Printer,
  CreditCard,
  Building,
  User,
  Receipt,
  Hash,
  Globe,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Payment, Student } from '@/types';
import { mockPayments, mockStudents, mockClasses, mockFees } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

export default function PaymentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (id) {
      const foundPayment = mockPayments.find(p => p.id === id);
      if (foundPayment) {
        setPayment(foundPayment);
        const foundStudent = mockStudents.find(s => s.id === foundPayment.studentId);
        setStudent(foundStudent || null);
      } else {
        toast({
          title: "Payment not found",
          description: "The payment you're looking for could not be found.",
          variant: "destructive",
        });
        navigate('/dashboard/school-admin/payments');
      }
    }
  }, [id, navigate, toast]);

  const handleDeletePayment = async () => {
    if (!payment) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Payment deleted",
        description: "The payment has been deleted successfully.",
      });
      navigate('/dashboard/school-admin/payments');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`,
    });
  };

  const handleViewInvoice = () => {
    if (payment?.paymentUrl) {
      window.open(payment.paymentUrl, '_blank');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (!payment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/school-admin/payments')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
            <p className="text-muted-foreground">
              Receipt #{payment.receiptNumber} • {payment.studentName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrintReceipt}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/dashboard/school-admin/payments/edit/${payment.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Payment
              </DropdownMenuItem>
              {payment.paymentUrl && (
                <DropdownMenuItem onClick={handleViewInvoice}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Invoice
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={handleDeletePayment}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Payment Information */}
        <div className="md:col-span-2 space-y-6">
          {/* Payment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>Payment Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-600">
                    {formatCurrency(payment.amount, payment.currency)}
                  </h3>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(payment.status)}
                  <p className="text-sm text-muted-foreground mt-1">Payment Status</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium">Receipt Number</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-mono text-sm">{payment.receiptNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(payment.receiptNumber, 'Receipt number')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Payment Method</h4>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {payment.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Payment Provider</h4>
                  <div className="mt-1">
                    {getProviderBadge(payment.paymentProvider)}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Fee Category</h4>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {payment.feeCategory.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium">Payment Date</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {payment.paidDate ? formatDate(payment.paidDate) : 'Not paid yet'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Due Date</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(payment.dueDate)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Academic Year</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {payment.academicYear}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Term</h4>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {payment.term.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {payment.description && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium">Description</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {payment.description}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Monnify Integration Details */}
          {payment.paymentProvider === 'monnify' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Monnify Integration Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Invoice ID</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-sm">{payment.invoiceId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(payment.invoiceId || '', 'Invoice ID')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Invoice Reference</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-sm">{payment.invoiceReference}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(payment.invoiceReference || '', 'Invoice reference')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Provider Transaction ID</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-sm">{payment.providerTransactionId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(payment.providerTransactionId || '', 'Transaction ID')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Provider Status</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {payment.providerStatus}
                    </p>
                  </div>
                </div>

                {payment.paymentUrl && (
                  <div>
                    <Button onClick={handleViewInvoice} className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Invoice on Monnify
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Fee Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Fee Name</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {payment.feeName}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Class</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {payment.className}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Student Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student?.avatar} />
                  <AvatarFallback>
                    {payment.studentName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{payment.studentName}</h3>
                  <p className="text-sm text-muted-foreground">{payment.studentId}</p>
                </div>
              </div>

              <Separator />

              {student && (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Parent/Guardian</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {student.parentGuardian.name}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Contact Information</h4>
                    <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{student.parentGuardian.phone}</span>
                    </div>
                    {student.parentGuardian.email && (
                      <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{student.parentGuardian.email}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Address</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {student.address.street}, {student.address.city}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {student.address.state}, {student.address.country}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Payment Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Payment Created</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>
                {payment.paidDate && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Payment Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.paidDate)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.dueDate)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
