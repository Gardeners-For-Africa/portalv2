import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Fee, Payment, Student } from "@/types";
import { mockClasses, mockFees, mockPayments, mockStudents } from "@/utils/mockData";

interface PaymentHistoryItem {
  id: string;
  feeName: string;
  feeCategory: string;
  amount: number;
  status: string;
  date: string;
  receiptNumber?: string;
  paymentMethod?: string;
}

export default function StudentPaymentDetails() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);

  useEffect(() => {
    if (studentId) {
      const foundStudent = mockStudents.find((s) => s.id === studentId);
      const studentPayments = mockPayments.filter((p) => p.studentId === studentId);

      setStudent(foundStudent || null);
      setPayments(studentPayments);
      setFees(mockFees);

      // Create payment history
      const history = studentPayments.map((payment) => {
        const fee = mockFees.find((f) => f.id === payment.feeId);
        return {
          id: payment.id,
          feeName: fee?.name || "Unknown Fee",
          feeCategory: fee?.category || "Unknown",
          amount: payment.amount,
          status: payment.status,
          date: payment.paidDate || payment.createdAt,
          receiptNumber: payment.receiptNumber,
          paymentMethod: payment.paymentMethod,
        };
      });

      setPaymentHistory(history);
    }
  }, [studentId]);

  if (!student) {
    return (
      <div className="p-6 text-center">
        <p>Student not found</p>
      </div>
    );
  }

  const getPaymentSummary = () => {
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    const owingAmount = totalFees - paidAmount;
    const paymentPercentage = (paidAmount / totalFees) * 100;

    return {
      totalFees,
      paidAmount,
      owingAmount,
      paymentPercentage,
    };
  };

  const getStatusBadge = (status: string) => {
    if (status === "paid") {
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    } else if (status === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    } else if (status === "failed") {
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    } else {
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <DollarSign className="h-4 w-4" />;
      case "bank_transfer":
        return <Download className="h-4 w-4" />;
      case "card":
        return <FileText className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const handleGenerateInvoice = () => {
    toast({
      title: "Invoice Generated",
      description: "Invoice has been generated successfully.",
    });
    // TODO: Implement invoice generation logic
  };

  const handleBackToPayments = () => {
    navigate("/dashboard/teacher/payments");
  };

  const summary = getPaymentSummary();

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
            <h1 className="text-3xl font-bold text-gray-900">Student Payment Details</h1>
            <p className="text-gray-600 mt-2">
              Payment information for {student.firstName} {student.lastName}
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <span>Payments</span>
              <span>/</span>
              <span>
                {student.firstName} {student.lastName}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleGenerateInvoice}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Details
          </Button>
        </div>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-medium">
                    {student.firstName.charAt(0)}
                    {student.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-gray-500">{student.studentId}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  <span>{student.currentClassName || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Admitted: {new Date(student.admissionDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Contact Information</h4>
              <div className="space-y-2 text-sm">
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
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {student.address.city}, {student.address.state}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Parent/Guardian</h4>
              <div className="space-y-2 text-sm">
                <div className="font-medium">{student.parentGuardian.name}</div>
                <div className="text-gray-500">{student.parentGuardian.relationship}</div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{student.parentGuardian.phone}</span>
                </div>
                {student.parentGuardian.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{student.parentGuardian.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{summary.totalFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Required for current term</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₦{summary.paidAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.paymentPercentage.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Owing</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₦{summary.owingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Outstanding balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.paymentPercentage >= 100 ? (
                <Badge className="bg-green-100 text-green-800">Fully Paid</Badge>
              ) : summary.paymentPercentage > 0 ? (
                <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">Not Paid</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.paymentPercentage.toFixed(1)}% complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="fees">Fee Breakdown</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Complete record of all payments made by this student
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{item.feeName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.feeCategory}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₦{item.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          {item.paymentMethod ? (
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(item.paymentMethod)}
                              <span className="capitalize">
                                {item.paymentMethod.replace("_", " ")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.receiptNumber ? (
                            <Badge variant="outline">{item.receiptNumber}</Badge>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payment history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Breakdown</CardTitle>
              <CardDescription>
                Detailed breakdown of all applicable fees for this student
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((fee) => {
                    const payment = payments.find((p) => p.feeId === fee.id);
                    const isPaid = payment && payment.status === "paid";

                    return (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">{fee.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{fee.category.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₦{fee.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{fee.term.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {isPaid ? (
                            <Badge className="bg-green-100 text-green-800">Paid</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Documents</CardTitle>
              <CardDescription>
                Invoices, receipts, and other payment-related documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No documents available</p>
                <p className="text-sm">Documents will appear here once generated</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
