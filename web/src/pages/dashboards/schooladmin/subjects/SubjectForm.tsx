import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Subject } from '@/types';
import { mockSubjects } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

interface SubjectFormData {
  name: string;
  code: string;
  description: string;
  category: 'core' | 'elective' | 'optional';
  level: 'primary' | 'junior_secondary' | 'senior_secondary' | 'all';
  gradeLevels: string[];
  credits: number;
  hoursPerWeek: number;
  isActive: boolean;
}

const initialFormData: SubjectFormData = {
  name: '',
  code: '',
  description: '',
  category: 'core',
  level: 'primary',
  gradeLevels: [],
  credits: 1,
  hoursPerWeek: 1,
  isActive: true,
};

const gradeOptions = [
  'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3'
];

export default function SubjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SubjectFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SubjectFormData>>({});

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      const existingSubject = mockSubjects.find(s => s.id === id);
      if (existingSubject) {
        setFormData({
          name: existingSubject.name,
          code: existingSubject.code,
          description: existingSubject.description,
          category: existingSubject.category,
          level: existingSubject.level,
          gradeLevels: existingSubject.gradeLevels,
          credits: existingSubject.credits,
          hoursPerWeek: existingSubject.hoursPerWeek,
          isActive: existingSubject.isActive,
        });
      }
    }
  }, [id, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Partial<SubjectFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Subject name is required';
    if (!formData.code.trim()) newErrors.code = 'Subject code is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.gradeLevels.length === 0) newErrors.gradeLevels = ['At least one grade level must be selected'];
    if (formData.credits < 1) newErrors.credits = 1;
    if (formData.hoursPerWeek < 1) newErrors.hoursPerWeek = 1;

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
        title: isEditing ? "Subject updated" : "Subject created",
        description: isEditing
          ? "The subject has been updated successfully."
          : "The subject has been created successfully.",
      });

      navigate('/dashboard/school-admin/subjects');
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update subject. Please try again."
          : "Failed to create subject. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SubjectFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleGradeLevelToggle = (grade: string) => {
    setFormData(prev => ({
      ...prev,
      gradeLevels: prev.gradeLevels.includes(grade)
        ? prev.gradeLevels.filter(g => g !== grade)
        : [...prev.gradeLevels, grade]
    }));
    if (errors.gradeLevels) {
      setErrors(prev => ({ ...prev, gradeLevels: undefined }));
    }
  };

  const getLevelGradeOptions = () => {
    switch (formData.level) {
      case 'primary':
        return gradeOptions.filter(grade => grade.startsWith('Basic'));
      case 'junior_secondary':
        return gradeOptions.filter(grade => grade.startsWith('JSS'));
      case 'senior_secondary':
        return gradeOptions.filter(grade => grade.startsWith('SSS'));
      case 'all':
        return gradeOptions;
      default:
        return gradeOptions;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/school-admin/subjects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subjects
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Subject' : 'Add New Subject'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update subject information' : 'Create a new subject for your school'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Mathematics"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Subject Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="MATH"
                  className={errors.code ? 'border-red-500' : ''}
                />
                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the subject..."
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Subject Details */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: 'core' | 'elective' | 'optional') => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                    <SelectItem value="optional">Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value: 'primary' | 'junior_secondary' | 'senior_secondary' | 'all') => {
                    handleInputChange('level', value);
                    // Reset grade levels when level changes
                    setFormData(prev => ({ ...prev, gradeLevels: [] }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="junior_secondary">Junior Secondary</SelectItem>
                    <SelectItem value="senior_secondary">Senior Secondary</SelectItem>
                    <SelectItem value="all">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">{formData.isActive ? 'Active' : 'Inactive'}</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.credits}
                  onChange={(e) => handleInputChange('credits', parseInt(e.target.value) || 1)}
                  className={errors.credits ? 'border-red-500' : ''}
                />
                {errors.credits && <p className="text-sm text-red-500">{errors.credits}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hoursPerWeek">Hours per Week *</Label>
                <Input
                  id="hoursPerWeek"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.hoursPerWeek}
                  onChange={(e) => handleInputChange('hoursPerWeek', parseInt(e.target.value) || 1)}
                  className={errors.hoursPerWeek ? 'border-red-500' : ''}
                />
                {errors.hoursPerWeek && <p className="text-sm text-red-500">{errors.hoursPerWeek}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grade Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Levels</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select the grade levels where this subject will be taught
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {getLevelGradeOptions().map((grade) => (
                  <Badge
                    key={grade}
                    variant={formData.gradeLevels.includes(grade) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handleGradeLevelToggle(grade)}
                  >
                    {grade}
                  </Badge>
                ))}
              </div>
              {errors.gradeLevels && <p className="text-sm text-red-500">{errors.gradeLevels}</p>}
              {formData.gradeLevels.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected: {formData.gradeLevels.join(', ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/school-admin/subjects')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : (isEditing ? 'Update Subject' : 'Create Subject')}
          </Button>
        </div>
      </form>
    </div>
  );
}
