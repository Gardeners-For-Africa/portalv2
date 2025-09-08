import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Fee } from '@/types';
import { mockFees, mockClasses } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

export default function FeeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Partial<Fee>>({
    name: '',
    description: '',
    category: 'school_fees',
    amount: 0,
    currency: 'NGN',
    academicYear: '2024-2025',
    term: 'first_term',
    applicableClasses: [],
    dueDate: '',
    isActive: true,
    isRecurring: false,
    recurringFrequency: 'annually',
    schoolId: 'school-1',
    schoolName: 'Green Valley High School',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      const fee = mockFees.find(f => f.id === id);
      if (fee) {
        setFormData(fee);
      } else {
        toast({
          title: "Fee not found",
          description: "The fee you're trying to edit could not be found.",
          variant: "destructive",
        });
        navigate('/dashboard/school-admin/payments/fees');
      }
    }
  }, [id, isEditing, navigate, toast]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClassToggle = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableClasses: prev.applicableClasses?.includes(classId)
        ? prev.applicableClasses.filter(id => id !== classId)
        : [...(prev.applicableClasses || []), classId]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Fee name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (!formData.applicableClasses || formData.applicableClasses.length === 0) {
      newErrors.applicableClasses = 'At least one class must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: isEditing ? "Fee updated" : "Fee created",
        description: isEditing 
          ? "The fee has been updated successfully."
          : "The fee has been created successfully.",
      });

      navigate('/dashboard/school-admin/payments/fees');
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing 
          ? "Failed to update fee. Please try again."
          : "Failed to create fee. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/school-admin/payments/fees')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fees
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? 'Edit Fee' : 'Create New Fee'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update fee information and settings' : 'Create a new fee for students'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Fee Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., First Term School Fees"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this fee covers..."
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school_fees">School Fees</SelectItem>
                    <SelectItem value="pta_fees">PTA Fees</SelectItem>
                    <SelectItem value="boarding_fees">Boarding Fees</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select value={formData.academicYear} onValueChange={(value) => handleInputChange('academicYear', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                    <SelectItem value="2026-2027">2026-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="term">Term *</Label>
                <Select value={formData.term} onValueChange={(value) => handleInputChange('term', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_term">First Term</SelectItem>
                    <SelectItem value="second_term">Second Term</SelectItem>
                    <SelectItem value="third_term">Third Term</SelectItem>
                    <SelectItem value="all_terms">All Terms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={errors.dueDate ? 'border-red-500' : ''}
                />
                {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isRecurring">Recurring Fee</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                  />
                  <Label htmlFor="isRecurring">This fee repeats automatically</Label>
                </div>
              </div>

              {formData.isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurringFrequency">Recurring Frequency</Label>
                  <Select 
                    value={formData.recurringFrequency} 
                    onValueChange={(value) => handleInputChange('recurringFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Applicable Classes */}
        <Card>
          <CardHeader>
            <CardTitle>Applicable Classes *</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select which classes this fee applies to
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={classItem.id}
                    checked={formData.applicableClasses?.includes(classItem.id) || false}
                    onCheckedChange={() => handleClassToggle(classItem.id)}
                  />
                  <Label htmlFor={classItem.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {classItem.name}
                  </Label>
                </div>
              ))}
            </div>
            {errors.applicableClasses && (
              <p className="text-sm text-red-500 mt-2">{errors.applicableClasses}</p>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{formData.name || 'Fee Name'}</h3>
                  <p className="text-sm text-muted-foreground">{formData.description || 'Fee description'}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formData.amount ? formatCurrency(formData.amount, formData.currency || 'NGN') : '₦0.00'}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {formData.category?.replace('_', ' ').toUpperCase() || 'CATEGORY'}
                    </Badge>
                    <Badge variant="outline">
                      {formData.term?.replace('_', ' ').toUpperCase() || 'TERM'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Academic Year:</span>
                  <p className="font-medium">{formData.academicYear}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date:</span>
                  <p className="font-medium">
                    {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={formData.isActive ? "default" : "secondary"}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Applicable Classes:</span>
                  <p className="font-medium">
                    {formData.applicableClasses?.length || 0} class(es) selected
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/school-admin/payments/fees')}
          >
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Update Fee' : 'Create Fee'}
          </Button>
        </div>
      </form>
    </div>
  );
}
