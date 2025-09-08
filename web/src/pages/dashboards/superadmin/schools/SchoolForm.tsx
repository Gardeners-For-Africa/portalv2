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
import { School } from "@/types";
import { mockSchools } from "@/utils/mockData";

interface SchoolFormData {
  name: string;
  code: string;
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
  academicYear: string;
  isActive: boolean;
  maxStudents: number;
  maxTeachers: number;
}

const initialFormData: SchoolFormData = {
  name: "",
  code: "",
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
  academicYear: new Date().getFullYear().toString(),
  isActive: true,
  maxStudents: 1000,
  maxTeachers: 100,
};

export default function SchoolForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SchoolFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SchoolFormData>>({});

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      const school = mockSchools.find((s) => s.id === id);
      if (school) {
        setFormData({
          name: school.name,
          code: school.code,
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
          academicYear: school.academicYear,
          isActive: school.isActive,
          maxStudents: school.maxStudents,
          maxTeachers: school.maxTeachers,
        });
      }
    }
  }, [id, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Partial<SchoolFormData> = {};

    if (!formData.name.trim()) newErrors.name = "School name is required";
    if (!formData.code.trim()) newErrors.code = "School code is required";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: isEditing ? "School updated" : "School created",
        description: `${formData.name} has been ${isEditing ? "updated" : "created"} successfully.`,
      });

      navigate("/dashboard/super-admin/schools");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SchoolFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/super-admin/schools")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schools
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
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter school name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">School Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder="Enter school code"
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
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
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive">School is active</Label>
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
