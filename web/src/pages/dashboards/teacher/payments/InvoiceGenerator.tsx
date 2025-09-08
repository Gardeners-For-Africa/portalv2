import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  ArrowLeft,
  FileText,
  Download,
  DollarSign,
  Calendar,
  User,
  GraduationCap,
  Building,
  Mail,
  Phone,
  MapPin,
  Printer,
  Send
} from 'lucide-react';
import { mockStudents, mockFees, mockClasses } from '@/utils/mockData';
import { Student, Fee } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface InvoiceItem {
  feeId: string;
  feeName: string;
  feeCategory: string;
  amount: number;
  description: string;
  isSelected: boolean;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  studentId: string;
  studentName: string;
  className: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  terms: string;
}

export default function InvoiceGenerator() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    studentId: '',
    studentName: '',
    className: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: '',
    terms: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.'
  });

  useEffect(() => {
    if (studentId) {
      const foundStudent = mockStudents.find(s => s.id === studentId);
      if (foundStudent) {
        setStudent(foundStudent);
        setInvoiceData(prev => ({
          ...prev,
          studentId: foundStudent.id,
          studentName: `${foundStudent.firstName} ${foundStudent.lastName}`,
          className: foundStudent.currentClassName || 'N/A'
        }));
      }
      setFees(mockFees);
    }
  }, [studentId]);

  useEffect(() => {
    if (fees.length > 0) {
      const items = fees.map(fee => ({
        feeId: fee.id,
        feeName: fee.name,
        feeCategory: fee.category,
        amount: fee.amount,
        description: fee.description,
        isSelected: false
      }));
      setInvoiceItems(items);
    }
  }, [fees]);

  useEffect(() => {
    const selectedItems = invoiceItems.filter(item => item.isSelected);
    const subtotal = selectedItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    setInvoiceData(prev => ({
      ...prev,
      items: selectedItems,
      subtotal,
      tax,
      total
    }));
  }, [invoiceItems]);

  const handleItemToggle = (feeId: string, isSelected: boolean) => {
    setInvoiceItems(prev => 
      prev.map(item => 
        item.feeId === feeId ? { ...item, isSelected } : item
      )
    );
  };

  const handleSelectAll = () => {
    setInvoiceItems(prev => prev.map(item => ({ ...item, isSelected: true })));
  };

  const handleDeselectAll = () => {
    setInvoiceItems(prev => prev.map(item => ({ ...item, isSelected: false })));
  };

  const handleGenerateInvoice = () => {
    if (invoiceData.items.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one fee item to generate an invoice.",
        variant: "destructive",
      });
      return;
    }

    // Generate invoice number
    const newInvoiceNumber = `INV-${Date.now()}`;
    setInvoiceData(prev => ({ ...prev, invoiceNumber: newInvoiceNumber }));

    toast({
      title: "Invoice Generated",
      description: "Invoice has been generated successfully.",
    });
  };

  const handleDownloadInvoice = () => {
    toast({
      title: "Download Started",
      description: "Invoice download has started.",
    });
    // TODO: Implement actual PDF generation and download
  };

  const handlePrintInvoice = () => {
    toast({
      title: "Printing",
      description: "Opening print dialog for invoice.",
    });
    // TODO: Implement print functionality
  };

  const handleSendInvoice = () => {
    toast({
      title: "Invoice Sent",
      description: "Invoice has been sent to the student/parent.",
    });
    // TODO: Implement email sending functionality
  };

  const handleBackToPayments = () => {
    navigate('/dashboard/teacher/payments');
  };

  if (!student) {
    return (
      <div className="p-6 text-center">
        <p>Student not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToPayments}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generate Invoice</h1>
            <p className="text-gray-600 mt-2">Create invoice for {student.firstName} {student.lastName}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <span>Payments</span>
              <span>/</span>
              <span>{student.firstName} {student.lastName}</span>
              <span>/</span>
              <span>Generate Invoice</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrintInvoice}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleSendInvoice}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
          <Button onClick={handleDownloadInvoice}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>
                Basic information for the invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="Auto-generated"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={invoiceData.issueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="className">Class</Label>
                  <Input
                    id="className"
                    value={invoiceData.className}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, className: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Select Fees</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Choose which fees to include in this invoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Fee Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceItems.map((item) => (
                    <TableRow key={item.feeId}>
                      <TableCell>
                        <Checkbox
                          checked={item.isSelected}
                          onCheckedChange={(checked) => 
                            handleItemToggle(item.feeId, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.feeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.feeCategory.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₦{item.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Notes and terms for the invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the invoice..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={invoiceData.terms}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Payment terms and conditions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Preview */}
        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{student.firstName} {student.lastName}</div>
                  <div className="text-sm text-gray-500">{student.studentId}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  <span>{student.currentClassName || 'N/A'}</span>
                </div>
                {student.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{student.email}</span>
                  </div>
                )}
                {student.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{student.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">₦{invoiceData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (5%):</span>
                  <span className="font-medium">₦{invoiceData.tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₦{invoiceData.total.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleGenerateInvoice} 
                  className="w-full"
                  disabled={invoiceData.items.length === 0}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Invoice
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* School Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="font-medium">Sample School Name</div>
              <div className="text-gray-600">
                <div>123 Education Street</div>
                <div>City, State 12345</div>
                <div>Phone: (123) 456-7890</div>
                <div>Email: info@school.com</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
