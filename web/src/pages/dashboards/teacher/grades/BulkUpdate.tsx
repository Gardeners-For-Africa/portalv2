import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  FileSpreadsheet,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";

interface BulkScoreUpdate {
  id: string;
  studentName: string;
  studentId: string;
  subject: string;
  class: string;
  currentScore: number;
  newScore: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: "pending" | "approved" | "rejected" | "completed";
  remarks?: string;
  updatedBy: string;
  updatedAt: string;
}

const mockBulkUpdates: BulkScoreUpdate[] = [
  {
    id: "1",
    studentName: "Emma Wilson",
    studentId: "ST001",
    subject: "Mathematics",
    class: "Form 3A",
    currentScore: 75,
    newScore: 82,
    totalMarks: 100,
    percentage: 82,
    grade: "B+",
    status: "pending",
    remarks: "Grade adjustment after review",
    updatedBy: "Teacher Smith",
    updatedAt: "2024-03-15",
  },
  {
    id: "2",
    studentName: "James Brown",
    studentId: "ST002",
    subject: "Mathematics",
    class: "Form 3A",
    currentScore: 88,
    newScore: 88,
    totalMarks: 100,
    percentage: 88,
    grade: "A",
    status: "completed",
    remarks: "No change required",
    updatedBy: "Teacher Smith",
    updatedAt: "2024-03-15",
  },
  {
    id: "3",
    studentName: "Sophia Davis",
    studentId: "ST003",
    subject: "Mathematics",
    class: "Form 3A",
    currentScore: 70,
    newScore: 78,
    totalMarks: 100,
    percentage: 78,
    grade: "B+",
    status: "approved",
    remarks: "Marking error correction",
    updatedBy: "Teacher Smith",
    updatedAt: "2024-03-15",
  },
];

export default function BulkUpdate() {
  const [bulkUpdates, setBulkUpdates] = useState<BulkScoreUpdate[]>(mockBulkUpdates);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [newBulkUpdate, setNewBulkUpdate] = useState({
    studentName: "",
    studentId: "",
    subject: "",
    class: "",
    currentScore: "",
    newScore: "",
    totalMarks: "",
    remarks: "",
  });

  const filteredBulkUpdates = bulkUpdates.filter((update) => {
    const matchesSearch =
      update.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || update.status === statusFilter;
    const matchesSubject = subjectFilter === "all" || update.subject === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { className: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      approved: { className: "bg-blue-100 text-blue-800", icon: CheckCircle },
      rejected: { className: "bg-red-100 text-red-800", icon: AlertCircle },
      completed: { className: "bg-green-100 text-green-800", icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;

    return (
      <Badge className={config.className}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleProcessUpload = () => {
    if (uploadedFile) {
      // Simulate processing uploaded file
      const newUpdates: BulkScoreUpdate[] = [
        {
          id: Date.now().toString(),
          studentName: "New Student",
          studentId: "ST999",
          subject: "Physics",
          class: "Form 4A",
          currentScore: 65,
          newScore: 72,
          totalMarks: 100,
          percentage: 72,
          grade: "B+",
          status: "pending",
          remarks: "Bulk upload from file",
          updatedBy: "Teacher Smith",
          updatedAt: new Date().toISOString().split("T")[0],
        },
      ];

      setBulkUpdates([...bulkUpdates, ...newUpdates]);
      setUploadedFile(null);
      setIsUploadDialogOpen(false);
    }
  };

  const handleCreateBulkUpdate = () => {
    if (
      newBulkUpdate.studentName &&
      newBulkUpdate.studentId &&
      newBulkUpdate.subject &&
      newBulkUpdate.class &&
      newBulkUpdate.currentScore &&
      newBulkUpdate.newScore &&
      newBulkUpdate.totalMarks
    ) {
      const currentScore = parseInt(newBulkUpdate.currentScore, 10);
      const newScore = parseInt(newBulkUpdate.newScore, 10);
      const totalMarks = parseInt(newBulkUpdate.totalMarks, 10);
      const percentage = Math.round((newScore / totalMarks) * 100);

      const bulkUpdate: BulkScoreUpdate = {
        id: Date.now().toString(),
        studentName: newBulkUpdate.studentName,
        studentId: newBulkUpdate.studentId,
        subject: newBulkUpdate.subject,
        class: newBulkUpdate.class,
        currentScore: currentScore,
        newScore: newScore,
        totalMarks: totalMarks,
        percentage: percentage,
        grade: getGradeFromPercentage(percentage),
        status: "pending",
        remarks: newBulkUpdate.remarks,
        updatedBy: "Teacher Smith",
        updatedAt: new Date().toISOString().split("T")[0],
      };

      setBulkUpdates([...bulkUpdates, bulkUpdate]);
      setNewBulkUpdate({
        studentName: "",
        studentId: "",
        subject: "",
        class: "",
        currentScore: "",
        newScore: "",
        totalMarks: "",
        remarks: "",
      });
      setIsCreateDialogOpen(false);
    }
  };

  const getGradeFromPercentage = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 75) return "B+";
    if (percentage >= 70) return "B";
    if (percentage >= 65) return "C+";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setBulkUpdates((prev) =>
      prev.map((update) => (update.id === id ? { ...update, status: newStatus as any } : update)),
    );
  };

  const handleDeleteUpdate = (id: string) => {
    setBulkUpdates((prev) => prev.filter((update) => update.id !== id));
  };

  const getUniqueSubjects = () => [...new Set(bulkUpdates.map((update) => update.subject))];

  const getStats = () => {
    const total = bulkUpdates.length;
    const pending = bulkUpdates.filter((u) => u.status === "pending").length;
    const approved = bulkUpdates.filter((u) => u.status === "approved").length;
    const completed = bulkUpdates.filter((u) => u.status === "completed").length;

    return { total, pending, approved, completed };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Score Updates</h1>
          <p className="text-gray-600 mt-2">Perform bulk operations on subject scores</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Bulk Score Updates</DialogTitle>
                <DialogDescription>
                  Upload a CSV or Excel file with bulk score update data
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                  />
                  <p className="text-sm text-gray-500">
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>
                {uploadedFile && (
                  <Alert>
                    <FileSpreadsheet className="h-4 w-4" />
                    <AlertDescription>File selected: {uploadedFile.name}</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProcessUpload} disabled={!uploadedFile}>
                  Process File
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Update
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Bulk Score Update</DialogTitle>
                <DialogDescription>Manually create a new bulk score update entry</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      value={newBulkUpdate.studentName}
                      onChange={(e) =>
                        setNewBulkUpdate({ ...newBulkUpdate, studentName: e.target.value })
                      }
                      placeholder="Student name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={newBulkUpdate.studentId}
                      onChange={(e) =>
                        setNewBulkUpdate({ ...newBulkUpdate, studentId: e.target.value })
                      }
                      placeholder="Student ID"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newBulkUpdate.subject}
                      onChange={(e) =>
                        setNewBulkUpdate({ ...newBulkUpdate, subject: e.target.value })
                      }
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Input
                      id="class"
                      value={newBulkUpdate.class}
                      onChange={(e) =>
                        setNewBulkUpdate({ ...newBulkUpdate, class: e.target.value })
                      }
                      placeholder="e.g., Form 3A"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentScore">Current Score</Label>
                    <Input
                      id="currentScore"
                      type="number"
                      value={newBulkUpdate.currentScore}
                      onChange={(e) =>
                        setNewBulkUpdate({ ...newBulkUpdate, currentScore: e.target.value })
                      }
                      placeholder="75"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newScore">New Score</Label>
                    <Input
                      id="newScore"
                      type="number"
                      value={newBulkUpdate.newScore}
                      onChange={(e) =>
                        setNewBulkUpdate({ ...newBulkUpdate, newScore: e.target.value })
                      }
                      placeholder="82"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      value={newBulkUpdate.totalMarks}
                      onChange={(e) =>
                        setNewBulkUpdate({ ...newBulkUpdate, totalMarks: e.target.value })
                      }
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Input
                      id="remarks"
                      value={newBulkUpdate.remarks}
                      onChange={(e) =>
                        setNewBulkUpdate({ ...newBulkUpdate, remarks: e.target.value })
                      }
                      placeholder="Reason for update..."
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBulkUpdate}>Create Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Score Updates</CardTitle>
          <CardDescription>Review and manage all bulk score update requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search students..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {getUniqueSubjects().map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Subject & Class</TableHead>
                <TableHead>Score Change</TableHead>
                <TableHead>New Grade</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBulkUpdates.map((update) => (
                <TableRow key={update.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{update.studentName}</div>
                      <div className="text-sm text-gray-500">{update.studentId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{update.subject}</div>
                      <div className="text-sm text-gray-500">{update.class}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {update.currentScore}/{update.totalMarks}
                      </span>
                      <span className="text-lg">→</span>
                      <span className="font-medium">
                        {update.newScore}/{update.totalMarks}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">{update.grade}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={update.remarks}>
                      {update.remarks || "No remarks"}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(update.status)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{update.updatedBy}</div>
                      <div className="text-xs text-gray-500">{update.updatedAt}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {update.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(update.id, "approved")}
                            className="text-blue-600"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(update.id, "rejected")}
                            className="text-red-600"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUpdate(update.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
