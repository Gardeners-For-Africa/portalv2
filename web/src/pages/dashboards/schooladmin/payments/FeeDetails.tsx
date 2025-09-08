import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  MoreHorizontal,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import type { Fee, Payment } from "@/types";
import { mockClasses, mockFees, mockPayments, mockStudents } from "@/utils/mockData";
import FeeDetailsTabs from "./FeeDetailsTabs";

export default function FeeDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [fee, setFee] = useState<Fee | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (id) {
      const foundFee = mockFees.find((f) => f.id === id);
      if (foundFee) {
        setFee(foundFee);
        // Get payments for this fee
        const feePayments = mockPayments.filter((p) => p.feeId === id);
        setPayments(feePayments);
      } else {
        toast({
          title: "Fee not found",
          description: "The fee you're looking for could not be found.",
          variant: "destructive",
        });
        navigate("/dashboard/school-admin/payments/fees");
      }
    }
  }, [id, navigate, toast]);

  const handleDeleteFee = async () => {
    if (!fee) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Fee deleted",
        description: "The fee has been deleted successfully.",
      });
      navigate("/dashboard/school-admin/payments/fees");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete fee. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      school_fees: "default",
      pta_fees: "secondary",
      boarding_fees: "outline",
      other: "outline",
    };
    const labels: Record<string, string> = {
      school_fees: "School Fees",
      pta_fees: "PTA Fees",
      boarding_fees: "Boarding Fees",
      other: "Other",
    };
    return <Badge variant={variants[category] || "outline"}>{labels[category] || category}</Badge>;
  };

  const getTermBadge = (term: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      first_term: "default",
      second_term: "secondary",
      third_term: "outline",
      all_terms: "default",
    };
    const labels: Record<string, string> = {
      first_term: "First Term",
      second_term: "Second Term",
      third_term: "Third Term",
      all_terms: "All Terms",
    };
    return <Badge variant={variants[term] || "outline"}>{labels[term] || term}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getClassNames = (classIds: string[]) => {
    return classIds
      .map((id) => {
        const classItem = mockClasses.find((c) => c.id === id);
        return classItem ? classItem.name : "Unknown Class";
      })
      .join(", ");
  };

  const handleExportPDF = () => {
    toast({
      title: "Export started",
      description: "PDF export is being prepared. You will receive a download link shortly.",
    });
  };

  const handleExportExcel = () => {
    toast({
      title: "Export started",
      description: "Excel export is being prepared. You will receive a download link shortly.",
    });
  };

  if (!fee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading fee details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/school-admin/payments/fees")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fees
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{fee.name}</h1>
            <p className="text-muted-foreground">{fee.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/dashboard/school-admin/payments/fees/edit/${fee.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Fee
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteFee} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Fee
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Fee Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(fee.amount, fee.currency)}
              </span>
              <div className="flex gap-2">
                {getCategoryBadge(fee.category)}
                {getTermBadge(fee.term)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Academic Year:</span>
                <span className="font-medium">{fee.academicYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium">{formatDate(fee.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={fee.isActive ? "default" : "secondary"}>
                  {fee.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recurring:</span>
                <span className="font-medium">
                  {fee.isRecurring ? `${fee.recurringFrequency} (${fee.recurringFrequency})` : "No"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Applicable Classes:</span>
              <p className="text-sm font-medium mt-1">{getClassNames(fee.applicableClasses)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center">
                <div className="text-2xl font-bold">{payments.length}</div>
                <div className="text-sm text-muted-foreground">Total Payments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {payments.filter((p) => p.status === "paid").length}
                </div>
                <div className="text-sm text-muted-foreground">Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {payments.filter((p) => p.status === "pending").length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    payments
                      .filter((p) => p.status === "paid")
                      .reduce((sum, p) => sum + p.amount, 0),
                    fee.currency,
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Total Collected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Student Payments */}
      <FeeDetailsTabs fee={fee} payments={payments} />
    </div>
  );
}
