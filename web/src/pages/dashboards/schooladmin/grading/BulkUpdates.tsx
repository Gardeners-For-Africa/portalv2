import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkUpdateRecord {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  subject: string;
  exam: string;
  currentScore: number;
  newScore: number;
  totalMarks: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason?: string;
  updatedBy: string;
  updatedAt: string;
}

const mockBulkUpdates: BulkUpdateRecord[] = [
  {
    id: '1',
    studentName: 'John Doe',
    studentId: 'ST001',
    class: 'Form 3A',
    subject: 'Mathematics',
    exam: 'Mid-Term Mathematics',
    currentScore: 75,
    newScore: 82,
    totalMarks: 100,
    status: 'pending',
    reason: 'Grade adjustment after review',
    updatedBy: 'Admin User',
    updatedAt: '2024-03-15'
  },
  {
    id: '2',
    studentName: 'Jane Smith',
    studentId: 'ST002',
    class: 'Form 3A',
    subject: 'Mathematics',
    exam: 'Mid-Term Mathematics',
    currentScore: 88,
    newScore: 88,
    totalMarks: 100,
    status: 'completed',
    reason: 'No change required',
    updatedBy: 'Admin User',
    updatedAt: '2024-03-15'
  },
  {
    id: '3',
    studentName: 'Mike Johnson',
    studentId: 'ST003',
    class: 'Form 3A',
    subject: 'Mathematics',
    exam: 'Mid-Term Mathematics',
    currentScore: 70,
    newScore: 78,
    totalMarks: 100,
    status: 'approved',
    reason: 'Marking error correction',
    updatedBy: 'Admin User',
    updatedAt: '2024-03-15'
  }
];

export default function BulkUpdates() {
  const [bulkUpdates, setBulkUpdates] = useState<BulkUpdateRecord[]>(mockBulkUpdates);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [newBulkUpdate, setNewBulkUpdate] = useState({
    studentName: '',
    studentId: '',
    class: '',
    subject: '',
    exam: '',
    currentScore: '',
    newScore: '',
    totalMarks: '',
    reason: ''
  });

  const filteredBulkUpdates = bulkUpdates.filter(update => {
    const matchesSearch = update.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || update.status === statusFilter;
    const matchesClass = classFilter === 'all' || update.class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { className: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      approved: { className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      rejected: { className: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { className: 'bg-green-100 text-green-800', icon: CheckCircle }
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
      const newUpdates: BulkUpdateRecord[] = [
        {
          id: Date.now().toString(),
          studentName: 'New Student',
          studentId: 'ST999',
          class: 'Form 2B',
          subject: 'English',
          exam: 'English Test',
          currentScore: 65,
          newScore: 72,
          totalMarks: 100,
          status: 'pending',
          reason: 'Bulk upload from file',
          updatedBy: 'Admin User',
          updatedAt: new Date().toISOString().split('T')[0]
        }
      ];
      
      setBulkUpdates([...bulkUpdates, ...newUpdates]);
      setUploadedFile(null);
      setIsUploadDialogOpen(false);
    }
  };

  const handleCreateBulkUpdate = () => {
    if (newBulkUpdate.studentName && newBulkUpdate.studentId && newBulkUpdate.class && 
        newBulkUpdate.subject && newBulkUpdate.exam && newBulkUpdate.currentScore && 
        newBulkUpdate.newScore && newBulkUpdate.totalMarks) {
      
      const bulkUpdate: BulkUpdateRecord = {
        id: Date.now().toString(),
        studentName: newBulkUpdate.studentName,
        studentId: newBulkUpdate.studentId,
        class: newBulkUpdate.class,
        subject: newBulkUpdate.subject,
        exam: newBulkUpdate.exam,
        currentScore: parseInt(newBulkUpdate.currentScore),
        newScore: parseInt(newBulkUpdate.newScore),
        totalMarks: parseInt(newBulkUpdate.totalMarks),
        status: 'pending',
        reason: newBulkUpdate.reason,
        updatedBy: 'Admin User',
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setBulkUpdates([...bulkUpdates, bulkUpdate]);
      setNewBulkUpdate({
        studentName: '',
        studentId: '',
        class: '',
        subject: '',
        exam: '',
        currentScore: '',
        newScore: '',
        totalMarks: '',
        reason: ''
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setBulkUpdates(prev => 
      prev.map(update => 
        update.id === id ? { ...update, status: newStatus as any } : update
      )
    );
  };

  const handleDeleteUpdate = (id: string) => {
    setBulkUpdates(prev => prev.filter(update => update.id !== id));
  };

  const getUniqueClasses = () => [...new Set(bulkUpdates.map(update => update.class))];

  const getStats = () => {
    const total = bulkUpdates.length;
    const pending = bulkUpdates.filter(u => u.status === 'pending').length;
    const approved = bulkUpdates.filter(u => u.status === 'approved').length;
    const completed = bulkUpdates.filter(u => u.status === 'completed').length;
    
    return { total, pending, approved, completed };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Updates Management</h1>
          <p className="text-gray-600 mt-2">Manage bulk grade and score updates</p>
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
                <DialogTitle>Upload Bulk Updates File</DialogTitle>
                <DialogDescription>
                  Upload a CSV or Excel file with bulk update data
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
                    <AlertDescription>
                      File selected: {uploadedFile.name}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleProcessUpload}
                  disabled={!uploadedFile}
                >
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
                <DialogTitle>Create Bulk Update</DialogTitle>
                <DialogDescription>
                  Manually create a new bulk update entry
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      value={newBulkUpdate.studentName}
                      onChange={(e) => setNewBulkUpdate({...newBulkUpdate, studentName: e.target.value})}
                      placeholder="Student name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={newBulkUpdate.studentId}
                      onChange={(e) => setNewBulkUpdate({...newBulkUpdate, studentId: e.target.value})}
                      placeholder="Student ID"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Input
                      id="class"
                      value={newBulkUpdate.class}
                      onChange={(e) => setNewBulkUpdate({...newBulkUpdate, class: e.target.value})}
                      placeholder="e.g., Form 3A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newBulkUpdate.subject}
                      onChange={(e) => setNewBulkUpdate({...newBulkUpdate, subject: e.target.value})}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam">Exam</Label>
                    <Input
                      id="exam"
                      value={newBulkUpdate.exam}
                      onChange={(e) => setNewBulkUpdate({...newBulkUpdate, exam: e.target.value})}
                      placeholder="Exam name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      value={newBulkUpdate.totalMarks}
                      onChange={(e) => setNewBulkUpdate({...newBulkUpdate, totalMarks: e.target.value})}
                      placeholder="100"
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
                      onChange={(e) => setNewBulkUpdate({...newBulkUpdate, currentScore: e.target.value})}
                      placeholder="75"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newScore">New Score</Label>
                    <Input
                      id="newScore"
                      type="number"
                      value={newBulkUpdate.newScore}
                      onChange={(e) => setNewBulkUpdate({...newBulkUpdate, newScore: e.target.value})}
                      placeholder="82"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Update</Label>
                  <Textarea
                    id="reason"
                    value={newBulkUpdate.reason}
                    onChange={(e) => setNewBulkUpdate({...newBulkUpdate, reason: e.target.value})}
                    placeholder="Brief explanation for the score update..."
                    rows={3}
                  />
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
          <CardTitle>Bulk Updates</CardTitle>
          <CardDescription>Review and manage all bulk update requests</CardDescription>
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
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {getUniqueClasses().map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Score Change</TableHead>
                <TableHead>Reason</TableHead>
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
                  <TableCell>{update.class}</TableCell>
                  <TableCell>{update.subject}</TableCell>
                  <TableCell>{update.exam}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{update.currentScore}/{update.totalMarks}</span>
                      <span className="text-lg">→</span>
                      <span className="font-medium">{update.newScore}/{update.totalMarks}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={update.reason}>
                      {update.reason}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {update.status === 'pending' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(update.id, 'approved')}
                              className="text-blue-600"
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(update.id, 'rejected')}
                              className="text-red-600"
                            >
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteUpdate(update.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}
