import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Save, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Student } from '@/types';
import { mockStudents } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

interface GraduationData {
  studentId: string;
  studentName: string;
  studentId: string;
  graduationDate: string;
  certificateNumber: string;
  remarks: string;
}

export default function StudentGraduation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [graduationData, setGraduationData] = useState<GraduationData[]>([]);
  const [graduationDate, setGraduationDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const eligibleStudents = students.filter(student => 
    student.gradeLevel === 'SSS 3' && 
    student.enrollmentStatus === 'enrolled' && 
    student.academicStatus === 'active'
  );

  React.useEffect(() => {
    const initialGraduationData = eligibleStudents.map(student => ({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      graduationDate: graduationDate,
      certificateNumber: `CERT-${student.studentId}-${new Date().getFullYear()}`,
      remarks: '',
    }));
    setGraduationData(initialGraduationData);
  }, [eligibleStudents, graduationDate]);

  const handleGraduationDateChange = (date: string) => {
    setGraduationDate(date);
    setGraduationData(prev => prev.map(item => ({
      ...item,
      graduationDate: date,
    })));
  };

  const handleCertificateNumberChange = (studentId: string, certificateNumber: string) => {
    setGraduationData(prev => prev.map(item => 
      item.studentId === studentId 
        ? { ...item, certificateNumber }
        : item
    ));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setGraduationData(prev => prev.map(item => 
      item.studentId === studentId 
        ? { ...item, remarks }
        : item
    ));
  };

  const handleGraduateStudents = async () => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update students to graduated status
      setStudents(prev => prev.map(student => {
        const graduation = graduationData.find(g => g.studentId === student.id);
        if (graduation) {
          return {
            ...student,
            enrollmentStatus: 'graduated',
            academicStatus: 'graduated',
          };
        }
        return student;
      }));

      toast({
        title: "Graduation completed",
        description: `Successfully graduated ${graduationData.length} students.`,
      });

      navigate('/dashboard/school-admin/students');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process graduation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Student Graduation</h1>
          <p className="text-muted-foreground">
            Graduate SSS 3 students and issue certificates
          </p>
        </div>
      </div>

      {/* Graduation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Graduation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="graduationDate">Graduation Date</Label>
              <Input
                id="graduationDate"
                type="date"
                value={graduationDate}
                onChange={(e) => handleGraduationDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Eligible Students</Label>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">{eligibleStudents.length}</span>
                <Badge variant="outline">SSS 3 Students</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {eligibleStudents.length > 0 ? (
        <>
          {/* Graduation List */}
          <Card>
            <CardHeader>
              <CardTitle>Graduation Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {graduationData.map((graduation) => (
                  <div key={graduation.studentId} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold">{graduation.studentName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {graduation.studentId}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`cert-${graduation.studentId}`}>Certificate Number</Label>
                        <Input
                          id={`cert-${graduation.studentId}`}
                          value={graduation.certificateNumber}
                          onChange={(e) => handleCertificateNumberChange(graduation.studentId, e.target.value)}
                          placeholder="Certificate number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`remarks-${graduation.studentId}`}>Remarks</Label>
                        <Textarea
                          id={`remarks-${graduation.studentId}`}
                          value={graduation.remarks}
                          onChange={(e) => handleRemarksChange(graduation.studentId, e.target.value)}
                          placeholder="Additional remarks"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/school-admin/students')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGraduateStudents}
              disabled={isLoading}
            >
              <Award className="mr-2 h-4 w-4" />
              {isLoading ? 'Processing...' : `Graduate ${eligibleStudents.length} Students`}
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No eligible students for graduation</h3>
            <p className="text-muted-foreground mb-4">
              Only SSS 3 students who are enrolled and active can be graduated.
            </p>
            <Button onClick={() => navigate('/dashboard/school-admin/students')}>
              Back to Students
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
