import { ArrowLeft, ArrowUp, Check, Save, X } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/types";
import { mockStudents } from "@/utils/mockData";

interface PromotionData {
  studentId: string;
  currentGrade: string;
  newGrade: string;
  action: "promote" | "retain" | "graduate";
}

export default function StudentPromotion() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [promotionData, setPromotionData] = useState<PromotionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const gradeOptions = [
    "Basic 1",
    "Basic 2",
    "Basic 3",
    "Basic 4",
    "Basic 5",
    "Basic 6",
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SSS 1",
    "SSS 2",
    "SSS 3",
  ];

  const getNextGrade = (currentGrade: string): string => {
    const gradeProgression: Record<string, string> = {
      "Basic 1": "Basic 2",
      "Basic 2": "Basic 3",
      "Basic 3": "Basic 4",
      "Basic 4": "Basic 5",
      "Basic 5": "Basic 6",
      "Basic 6": "JSS 1",
      "JSS 1": "JSS 2",
      "JSS 2": "JSS 3",
      "JSS 3": "SSS 1",
      "SSS 1": "SSS 2",
      "SSS 2": "SSS 3",
      "SSS 3": "Graduated",
    };
    return gradeProgression[currentGrade] || currentGrade;
  };

  const getFilteredStudents = () => {
    if (!selectedGrade) return [];
    return students.filter(
      (student) =>
        student.gradeLevel === selectedGrade &&
        student.enrollmentStatus === "enrolled" &&
        student.academicStatus === "active",
    );
  };

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    const filteredStudents = students.filter(
      (student) =>
        student.gradeLevel === grade &&
        student.enrollmentStatus === "enrolled" &&
        student.academicStatus === "active",
    );

    const newPromotionData = filteredStudents.map((student) => ({
      studentId: student.id,
      currentGrade: student.gradeLevel,
      newGrade: getNextGrade(student.gradeLevel),
      action: "promote" as const,
    }));

    setPromotionData(newPromotionData);
  };

  const handleActionChange = (studentId: string, action: "promote" | "retain" | "graduate") => {
    setPromotionData((prev) =>
      prev.map((item) => {
        if (item.studentId === studentId) {
          return {
            ...item,
            action,
            newGrade: action === "promote" ? getNextGrade(item.currentGrade) : item.currentGrade,
          };
        }
        return item;
      }),
    );
  };

  const handleSelectAll = (action: "promote" | "retain" | "graduate") => {
    setPromotionData((prev) =>
      prev.map((item) => ({
        ...item,
        action,
        newGrade: action === "promote" ? getNextGrade(item.currentGrade) : item.currentGrade,
      })),
    );
  };

  const handlePromoteStudents = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update students based on promotion data
      setStudents((prev) =>
        prev.map((student) => {
          const promotion = promotionData.find((p) => p.studentId === student.id);
          if (promotion) {
            if (promotion.action === "graduate") {
              return {
                ...student,
                enrollmentStatus: "graduated",
                academicStatus: "graduated",
              };
            } else if (promotion.action === "promote") {
              return {
                ...student,
                gradeLevel: promotion.newGrade,
                academicYear: "2025-2026",
              };
            }
          }
          return student;
        }),
      );

      const promotedCount = promotionData.filter((p) => p.action === "promote").length;
      const graduatedCount = promotionData.filter((p) => p.action === "graduate").length;
      const retainedCount = promotionData.filter((p) => p.action === "retain").length;

      toast({
        title: "Promotion completed",
        description: `Successfully processed ${promotedCount} promotions, ${graduatedCount} graduations, and ${retainedCount} retentions.`,
      });

      navigate("/dashboard/school-admin/students");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process promotions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = getFilteredStudents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/school-admin/students")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Promotion</h1>
          <p className="text-muted-foreground">
            Promote students to the next grade level or graduate them
          </p>
        </div>
      </div>

      {/* Grade Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Grade Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGrade && (
              <Badge variant="outline">{filteredStudents.length} students found</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedGrade && filteredStudents.length > 0 && (
        <>
          {/* Bulk Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handleSelectAll("promote")}
                  disabled={isLoading}
                >
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Promote All
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSelectAll("retain")}
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Retain All
                </Button>
                {selectedGrade === "SSS 3" && (
                  <Button
                    variant="outline"
                    onClick={() => handleSelectAll("graduate")}
                    disabled={isLoading}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Graduate All
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle>Students - {selectedGrade}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStudents.map((student) => {
                  const promotion = promotionData.find((p) => p.studentId === student.id);
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-semibold">
                            {student.firstName} {student.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {student.studentId} • {student.currentSectionName || "No section"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Current: </span>
                          <Badge variant="outline">{student.gradeLevel}</Badge>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">New: </span>
                          <Badge
                            variant={promotion?.action === "promote" ? "default" : "secondary"}
                          >
                            {promotion?.newGrade}
                          </Badge>
                        </div>
                        <Select
                          value={promotion?.action || "promote"}
                          onValueChange={(value: "promote" | "retain" | "graduate") =>
                            handleActionChange(student.id, value)
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="promote">Promote</SelectItem>
                            <SelectItem value="retain">Retain</SelectItem>
                            {selectedGrade === "SSS 3" && (
                              <SelectItem value="graduate">Graduate</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/school-admin/students")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handlePromoteStudents} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "Process Promotions"}
            </Button>
          </div>
        </>
      )}

      {selectedGrade && filteredStudents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No eligible students found in {selectedGrade}. Students must be enrolled and active to
              be promoted.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
