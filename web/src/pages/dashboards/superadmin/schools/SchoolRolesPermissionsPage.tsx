import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { School } from "@/types";
import { mockSchools } from "@/utils/mockData";
import SchoolRolesPermissions from "./SchoolRolesPermissions";

export default function SchoolRolesPermissionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the active tab from URL params
  const activeTab = searchParams.get("tab") || "overview";

  useEffect(() => {
    if (id) {
      const foundSchool = mockSchools.find((s) => s.id === id);
      if (foundSchool) {
        setSchool(foundSchool);
      } else {
        toast({
          title: "School not found",
          description: "The requested school could not be found.",
          variant: "destructive",
        });
        navigate("/dashboard/super-admin/schools");
      }
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading school settings...</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/dashboard/super-admin/schools/${school.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to School Details
        </Button>
      </div>

      {/* Main Content */}
      <SchoolRolesPermissions
        schoolId={school.id}
        schoolName={school.name}
        initialTab={activeTab}
      />
    </div>
  );
}
