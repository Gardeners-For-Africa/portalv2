import { ArrowLeft, Plus, Save, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SchoolClass } from "@/types";
import { mockClasses } from "@/utils/mockData";

interface ClassFormData {
  name: string;
  code: string;
  description: string;
  level: "nursery" | "primary" | "secondary" | "junior_secondary" | "senior_secondary";
  grade: string;
  academicYear: string;
  maxStudentsPerSection: number;
  subjects: string[];
  isActive: boolean;
}

const initialFormData: ClassFormData = {
  name: "",
  code: "",
  description: "",
  level: "primary",
  grade: "",
  academicYear: "2024-2025",
  maxStudentsPerSection: 30,
  subjects: [],
  isActive: true,
};

const availableSubjects = [
  "Mathematics",
  "English",
  "Science",
  "Social Studies",
  "Art",
  "Music",
  "Physical Education",
  "Basic Science",
  "Basic Technology",
  "Business Studies",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Literature",
  "History",
  "Geography",
  "Computer Science",
  "French",
  "Spanish",
  "Religious Studies",
];

export default function ClassForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ClassFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ClassFormData>>({});
  const [newSubject, setNewSubject] = useState("");

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      const existingClass = mockClasses.find((c) => c.id === id);
      if (existingClass) {
        setFormData({
          name: existingClass.name,
          code: existingClass.code,
          description: existingClass.description || "",
          level: existingClass.level,
          grade: existingClass.grade,
          academicYear: existingClass.academicYear,
          maxStudentsPerSection: existingClass.maxStudentsPerSection,
          subjects: existingClass.subjects,
          isActive: existingClass.isActive,
        });
      }
    }
  }, [id, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ClassFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Class name is required";
    if (!formData.code.trim()) newErrors.code = "Class code is required";
    if (!formData.grade.trim()) newErrors.grade = "Grade is required";
    if (formData.maxStudentsPerSection <= 0) newErrors.maxStudentsPerSection = 1;
    if (formData.maxStudentsPerSection > 100) newErrors.maxStudentsPerSection = 100;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: isEditing ? "Class updated" : "Class created",
        description: isEditing
          ? "The class has been updated successfully."
          : "The class has been created successfully.",
      });

      navigate("/dashboard/school-admin/classes");
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update class. Please try again."
          : "Failed to create class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ClassFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()],
      }));
      setNewSubject("");
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((subject) => subject !== subjectToRemove),
    }));
  };

  const getGradeOptions = (level: string) => {
    const gradeOptions: Record<string, string[]> = {
      nursery: ["Nursery 1", "Nursery 2", "Nursery 3"],
      primary: ["Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6"],
      junior_secondary: ["JSS 1", "JSS 2", "JSS 3"],
      senior_secondary: ["SSS 1", "SSS 2", "SSS 3"],
      secondary: ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"],
    };
    return gradeOptions[level] || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/school-admin/classes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Classes
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Class" : "Add New Class"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update class information and settings"
              : "Create a new class with sections"}
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
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Basic 1, JSS 1"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Class Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                  placeholder="e.g., B1, JSS1"
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the class"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(
                    value:
                      | "nursery"
                      | "primary"
                      | "secondary"
                      | "junior_secondary"
                      | "senior_secondary",
                  ) => {
                    handleInputChange("level", value);
                    handleInputChange("grade", ""); // Reset grade when level changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nursery">Nursery</SelectItem>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="junior_secondary">Junior Secondary</SelectItem>
                    <SelectItem value="senior_secondary">Senior Secondary</SelectItem>
                    <SelectItem value="secondary">Secondary (Combined)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade *</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => handleInputChange("grade", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {getGradeOptions(formData.level).map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grade && <p className="text-sm text-red-500">{errors.grade}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange("academicYear", e.target.value)}
                  placeholder="2024-2025"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStudentsPerSection">Maximum Students per Section *</Label>
              <Input
                id="maxStudentsPerSection"
                type="number"
                value={formData.maxStudentsPerSection}
                onChange={(e) =>
                  handleInputChange("maxStudentsPerSection", parseInt(e.target.value, 10) || 0)
                }
                min="1"
                max="100"
                className={errors.maxStudentsPerSection ? "border-red-500" : ""}
              />
              {errors.maxStudentsPerSection && (
                <p className="text-sm text-red-500">{errors.maxStudentsPerSection}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={newSubject} onValueChange={setNewSubject}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects
                    .filter((subject) => !formData.subjects.includes(subject))
                    .map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addSubject} disabled={!newSubject.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Active Class</Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Active classes can have students assigned and sections created.
            </p>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/school-admin/classes")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : isEditing ? "Update Class" : "Create Class"}
          </Button>
        </div>
      </form>
    </div>
  );
}
