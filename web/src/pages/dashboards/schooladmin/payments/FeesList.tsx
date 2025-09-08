import {
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import type { Fee } from "@/types";
import { mockClasses, mockFees, mockPayments } from "@/utils/mockData";

export default function FeesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fees, setFees] = useState<Fee[]>(mockFees);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [termFilter, setTermFilter] = useState<string>("all");

  const handleDeleteFee = async (feeId: string) => {
    try {
      setFees((prev) => prev.filter((f) => f.id !== feeId));
      toast({
        title: "Fee deleted",
        description: "The fee has been deleted successfully.",
      });
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

  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || fee.category === categoryFilter;
    const matchesTerm = termFilter === "all" || fee.term === termFilter;

    return matchesSearch && matchesCategory && matchesTerm;
  });

  const stats = {
    total: fees.length,
    active: fees.filter((f) => f.isActive).length,
    schoolFees: fees.filter((f) => f.category === "school_fees").length,
    ptaFees: fees.filter((f) => f.category === "pta_fees").length,
    boardingFees: fees.filter((f) => f.category === "boarding_fees").length,
    otherFees: fees.filter((f) => f.category === "other").length,
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

  const getStudentPaymentCount = (feeId: string) => {
    const feePayments = mockPayments.filter((p) => p.feeId === feeId);
    const paidCount = feePayments.filter((p) => p.status === "paid").length;
    const totalCount = feePayments.length;
    return { paidCount, totalCount };
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fees Management</h1>
          <p className="text-muted-foreground">
            Create and manage fees for different categories and terms
          </p>
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
          <Button onClick={() => navigate("/dashboard/school-admin/payments/fees/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Fee
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Fees</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">School Fees</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.schoolFees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PTA Fees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ptaFees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boarding Fees</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.boardingFees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Other Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.otherFees}</div>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Search fees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="school_fees">School Fees</SelectItem>
                <SelectItem value="pta_fees">PTA Fees</SelectItem>
                <SelectItem value="boarding_fees">Boarding Fees</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                <SelectItem value="first_term">First Term</SelectItem>
                <SelectItem value="second_term">Second Term</SelectItem>
                <SelectItem value="third_term">Third Term</SelectItem>
                <SelectItem value="all_terms">All Terms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fees Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFees.map((fee) => (
          <Card key={fee.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{fee.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{fee.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/dashboard/school-admin/payments/fees/${fee.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details & Payments
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/dashboard/school-admin/payments/fees/edit/${fee.id}`)
                      }
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Fee
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteFee(fee.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Fee
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(fee.amount, fee.currency)}
                </span>
                <div className="flex flex-col items-end space-y-1">
                  {getCategoryBadge(fee.category)}
                  {getTermBadge(fee.term)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Academic Year:</span>
                  <span className="font-medium">{fee.academicYear}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{formatDate(fee.dueDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={fee.isActive ? "default" : "secondary"}>
                    {fee.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Students Paid:</span>
                  <span className="font-medium">
                    {(() => {
                      const { paidCount, totalCount } = getStudentPaymentCount(fee.id);
                      return `${paidCount}/${totalCount}`;
                    })()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Applicable Classes:</span>
                <p className="text-sm font-medium mt-1">{getClassNames(fee.applicableClasses)}</p>
              </div>

              {fee.isRecurring && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Recurring: {fee.recurringFrequency}</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/dashboard/school-admin/payments/fees/${fee.id}`)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Students & Payments
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFees.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No fees found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== "all" || termFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Get started by creating your first fee."}
            </p>
            <Button onClick={() => navigate("/dashboard/school-admin/payments/fees/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Fee
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
