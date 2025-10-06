import { ArrowLeft, Building, Save } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { mockSchools } from "@/utils/mockData";

interface SchoolFormData {
  schoolName: string;
  schoolCode: string;
  schoolType: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  adminContactName: string;
  adminContactEmail: string;
  adminContactPhone: string;
  documents: {
    registrationCertificate: File | null;
    taxExemptionCertificate: File | null;
    accreditationDocument: File | null;
    principalIdDocument: File | null;
    otherDocuments: File[];
  };
  settings: {
    academicYear: string;
    gradingSystem: string;
    languageOfInstruction: string;
    timezone: string;
    currency: string;
    maxStudentsPerClass: number;
    features: string[];
  };
  metadata: {
    notes: string;
    priority: string;
  };
  isActive?: boolean;
}

const initialFormData: SchoolFormData = {
  schoolName: "",
  schoolCode: "",
  schoolType: "",
  description: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  phone: "",
  email: "",
  website: "",
  principalName: "",
  principalEmail: "",
  principalPhone: "",
  adminContactName: "",
  adminContactEmail: "",
  adminContactPhone: "",
  documents: {
    registrationCertificate: null,
    taxExemptionCertificate: null,
    accreditationDocument: null,
    principalIdDocument: null,
    otherDocuments: [],
  },
  settings: {
    academicYear: "",
    gradingSystem: "",
    languageOfInstruction: "",
    timezone: "",
    currency: "",
    maxStudentsPerClass: 0,
    features: [],
  },
  metadata: {
    notes: "",
    priority: "",
  },
};

export default function SchoolForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SchoolFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SchoolFormData>>({});
  const { registerSchool } = useAuth();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      const school = mockSchools.find((s) => s.id === id);
      if (school) {
        setFormData({
          ...initialFormData,
          schoolName: school.name,
          schoolCode: school.code,
          address: school.address,
          city: school.city,
          state: school.state,
          country: school.country,
          postalCode: school.postalCode,
          phone: school.phone,
          email: school.email,
          website: school.website || "",
          principalName: school.principalName,
          principalEmail: school.principalEmail,
          principalPhone: school.principalPhone,
        });
      }
    }
  }, [id, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Partial<SchoolFormData> = {};
    if (!formData.schoolName.trim()) newErrors.schoolName = "School name is required";
    if (!formData.schoolCode.trim()) newErrors.schoolCode = "School code is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.principalName.trim()) newErrors.principalName = "Principal name is required";
    if (!formData.principalEmail.trim()) newErrors.principalEmail = "Principal email is required";
    if (!formData.principalPhone.trim()) newErrors.principalPhone = "Principal phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SchoolFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSettingsChange = (field: keyof SchoolFormData["settings"], value: any) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [field]: value },
    }));
  };

  const handleOtherFilesChange = (files: FileList | null) => {
    if (!files) return;
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        otherDocuments: Array.from(files),
      },
    }));
  };

  const handleFileChange = (field: keyof SchoolFormData["documents"], file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const data = new FormData();

      // Basic info
      Object.entries({
        schoolName: formData.schoolName,
        schoolCode: formData.schoolCode,
        schoolType: formData.schoolType,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        principalName: formData.principalName,
        principalEmail: formData.principalEmail,
        principalPhone: formData.principalPhone,
        adminContactName: formData.adminContactName,
        adminContactEmail: formData.adminContactEmail,
        adminContactPhone: formData.adminContactPhone,
      }).forEach(([key, value]) => data.append(key, value));

      // Documents
      const docs = formData.documents;
      if (docs.registrationCertificate)
        data.append("registrationCertificate", docs.registrationCertificate);
      if (docs.taxExemptionCertificate)
        data.append("taxExemptionCertificate", docs.taxExemptionCertificate);
      if (docs.accreditationDocument)
        data.append("accreditationDocument", docs.accreditationDocument);
      if (docs.principalIdDocument) data.append("principalIdDocument", docs.principalIdDocument);
      docs.otherDocuments.forEach((file, i) => data.append(`otherDocuments[${i}]`, file));

      // Settings
      Object.entries(formData.settings).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => data.append(`${key}[]`, v));
        } else {
          data.append(key, value as string);
        }
      });

      // Metadata
      Object.entries(formData.metadata).forEach(([key, value]) => {
        data.append(key, value as string);
      });

      // Call useAuth registerSchool
      await registerSchool(data);

      navigate("/dashboard/super-admin/schools");
    } catch (err) {
      // Errors are handled inside registerSchool
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/super-admin/schools")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit School" : "Add New School"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update school information" : "Create a new school in the system"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange("schoolName", e.target.value)}
                  placeholder="Enter school name"
                  className={errors.schoolName ? "border-red-500" : ""}
                />
                {errors.schoolName && <p className="text-sm text-red-500">{errors.schoolName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">School Code *</Label>
                <Input
                  id="code"
                  value={formData.schoolCode}
                  onChange={(e) => handleInputChange("schoolCode", e.target.value)}
                  placeholder="Enter school code"
                  className={errors.schoolCode ? "border-red-500" : ""}
                />
                {errors.schoolCode && <p className="text-sm text-red-500">{errors.schoolCode}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter school email"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter school phone"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="schooltype">School Type *</Label>
                <Input
                  id="schooltype"
                  value={formData.schoolType}
                  onChange={(e) => handleInputChange("schoolType", e.target.value)}
                  placeholder="Enter school type e.g Primary, Secondary"
                  className={errors.schoolType ? "border-red-500" : ""}
                />
                {errors.schoolType && <p className="text-sm text-red-500">{errors.schoolType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website *</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="Enter school website"
                  className={errors.website ? "border-red-500" : ""}
                />
                {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter complete address"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description *</Label>
                <Textarea
                  id="desc"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter description"
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter state"
                  className={errors.state ? "border-red-500" : ""}
                />
                {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Enter country"
                  className={errors.country ? "border-red-500" : ""}
                />
                {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Principal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principalName">Principal Name *</Label>
                <Input
                  id="principalName"
                  value={formData.principalName}
                  onChange={(e) => handleInputChange("principalName", e.target.value)}
                  placeholder="Enter principal name"
                  className={errors.principalName ? "border-red-500" : ""}
                />
                {errors.principalName && (
                  <p className="text-sm text-red-500">{errors.principalName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="principalEmail">Principal Email *</Label>
                <Input
                  id="principalEmail"
                  type="email"
                  value={formData.principalEmail}
                  onChange={(e) => handleInputChange("principalEmail", e.target.value)}
                  placeholder="Enter principal email"
                  className={errors.principalEmail ? "border-red-500" : ""}
                />
                {errors.principalEmail && (
                  <p className="text-sm text-red-500">{errors.principalEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="principalPhone">Principal Phone *</Label>
                <Input
                  id="principalPhone"
                  value={formData.principalPhone}
                  onChange={(e) => handleInputChange("principalPhone", e.target.value)}
                  placeholder="Enter principal phone"
                  className={errors.principalPhone ? "border-red-500" : ""}
                />
                {errors.principalPhone && (
                  <p className="text-sm text-red-500">{errors.principalPhone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminContactName">Admin Name *</Label>
                <Input
                  id="adminContactName"
                  value={formData.adminContactName}
                  onChange={(e) => handleInputChange("adminContactName", e.target.value)}
                  placeholder="Enter Admin name"
                  className={errors.adminContactName ? "border-red-500" : ""}
                />
                {errors.adminContactName && (
                  <p className="text-sm text-red-500">{errors.adminContactName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminContactEmail">Admin Email *</Label>
                <Input
                  id="adminContactEmail"
                  type="email"
                  value={formData.adminContactEmail}
                  onChange={(e) => handleInputChange("adminContactEmail", e.target.value)}
                  placeholder="Enter admin email"
                  className={errors.adminContactEmail ? "border-red-500" : ""}
                />
                {errors.adminContactEmail && (
                  <p className="text-sm text-red-500">{errors.adminContactEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminContactPhone">Admin Phone *</Label>
                <Input
                  id="adminContactPhone"
                  value={formData.adminContactPhone}
                  onChange={(e) => handleInputChange("adminContactPhone", e.target.value)}
                  placeholder="Enter admin phone"
                  className={errors.adminContactPhone ? "border-red-500" : ""}
                />
                {errors.adminContactPhone && (
                  <p className="text-sm text-red-500">{errors.adminContactPhone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add new fields for Settings */}
        <Card>
          <CardHeader>
            <CardTitle>School Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Academic Year</Label>
              <Input
                value={formData.settings.academicYear}
                onChange={(e) => handleSettingsChange("academicYear", e.target.value)}
              />
            </div>
            <div>
              <Label>Grading System</Label>
              <Input
                value={formData.settings.gradingSystem}
                onChange={(e) => handleSettingsChange("gradingSystem", e.target.value)}
              />
            </div>
            <div>
              <Label>Language of Instruction</Label>
              <Input
                value={formData.settings.languageOfInstruction}
                onChange={(e) => handleSettingsChange("languageOfInstruction", e.target.value)}
              />
            </div>
            <div>
              <Label>Timezone</Label>
              <Input
                value={formData.settings.timezone}
                onChange={(e) => handleSettingsChange("timezone", e.target.value)}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Input
                value={formData.settings.currency}
                onChange={(e) => handleSettingsChange("currency", e.target.value)}
              />
            </div>
            <div>
              <Label>Max Students Per Class</Label>
              <Input
                type="number"
                value={formData.settings.maxStudentsPerClass}
                onChange={(e) =>
                  handleSettingsChange("maxStudentsPerClass", Number(e.target.value))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationCertificate">Registration Certificate</Label>
                <Input
                  id="registrationCertificate"
                  type="file"
                  onChange={(e) =>
                    handleFileChange("registrationCertificate", e.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxExemptionCertificate">Tax Exemption Certificate</Label>
                <Input
                  id="taxExemptionCertificate"
                  type="file"
                  onChange={(e) =>
                    handleFileChange("taxExemptionCertificate", e.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accreditationDocument">Accreditation Document</Label>
                <Input
                  id="accreditationDocument"
                  type="file"
                  onChange={(e) =>
                    handleFileChange("accreditationDocument", e.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="principalIdDocument">Principal ID Document</Label>
                <Input
                  id="principalIdDocument"
                  type="file"
                  onChange={(e) =>
                    handleFileChange("principalIdDocument", e.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="otherDocuments">Other Documents</Label>
                <Input
                  id="otherDocuments"
                  type="file"
                  multiple
                  onChange={(e) => handleOtherFilesChange(e.target.files)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meta Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.metadata.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, notes: e.target.value },
                    }))
                  }
                  placeholder="Any special notes"
                  className={errors.metadata ? "border-red-500" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  value={formData.metadata.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, priority: e.target.value },
                    }))
                  }
                  placeholder="Priority level"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/super-admin/schools")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : isEditing ? "Update School" : "Create School"}
          </Button>
        </div>
      </form>
    </div>
  );
}
