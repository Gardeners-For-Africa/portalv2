import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Student, StudentStatus, AcademicStatus } from '@/types';
import { mockStudents } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

interface StudentFormData {
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  gradeLevel: string;
  enrollmentStatus: StudentStatus;
  academicStatus: AcademicStatus;
  isActive: boolean;
}

const initialFormData: StudentFormData = {
  studentId: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'male',
  email: '',
  phone: '',
  gradeLevel: '',
  enrollmentStatus: 'pending',
  academicStatus: 'active',
  isActive: true,
};

export default function StudentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<StudentFormData>>({});

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      const existingStudent = mockStudents.find(s => s.id === id);
      if (existingStudent) {
        setFormData({
          studentId: existingStudent.studentId,
          firstName: existingStudent.firstName,
          lastName: existingStudent.lastName,
          dateOfBirth: existingStudent.dateOfBirth,
          gender: existingStudent.gender,
          email: existingStudent.email || '',
          phone: existingStudent.phone || '',
          gradeLevel: existingStudent.gradeLevel,
          enrollmentStatus: existingStudent.enrollmentStatus,
          academicStatus: existingStudent.academicStatus,
          isActive: existingStudent.isActive,
        });
      }
    }
  }, [id, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentFormData> = {};

    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: isEditing ? "Student updated" : "Student admitted",
        description: isEditing 
          ? "The student has been updated successfully."
          : "The student has been admitted successfully.",
      });

      navigate('/dashboard/school-admin/students');
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing 
          ? "Failed to update student. Please try again."
          : "Failed to admit student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getGradeOptions = () => {
    return ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/school-admin/students')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Student' : 'Admit New Student'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update student information' : 'Complete student admission process'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value.toUpperCase())}
                  placeholder="STU001"
                  className={errors.studentId ? 'border-red-500' : ''}
                />
                {errors.studentId && <p className="text-sm text-red-500">{errors.studentId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: 'male' | 'female' | 'other') => handleInputChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select
                  value={formData.gradeLevel}
                  onValueChange={(value) => handleInputChange('gradeLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {getGradeOptions().map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="student@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enrollmentStatus">Enrollment Status</Label>
                <Select
                  value={formData.enrollmentStatus}
                  onValueChange={(value: StudentStatus) => handleInputChange('enrollmentStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicStatus">Academic Status</Label>
                <Select
                  value={formData.academicStatus}
                  onValueChange={(value: AcademicStatus) => handleInputChange('academicStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/school-admin/students')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : (isEditing ? 'Update Student' : 'Admit Student')}
          </Button>
        </div>
      </form>
    </div>
  );
}
