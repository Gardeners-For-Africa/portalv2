import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Building, MapPin, Phone, Mail, Globe, User, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { School } from '@/types';
import { mockSchools } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

export default function SchoolDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundSchool = mockSchools.find(s => s.id === id);
      if (foundSchool) {
        setSchool(foundSchool);
      } else {
        toast({
          title: "School not found",
          description: "The requested school could not be found.",
          variant: "destructive",
        });
        navigate('/schools');
      }
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading school details...</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return null;
  }

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );

  const getCapacityPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/super-admin/schools')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schools
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{school.name}</h1>
            <p className="text-muted-foreground">School Code: {school.code}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(school.isActive)}
          <Button onClick={() => navigate(`/dashboard/super-admin/schools/edit/${school.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit School
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <p className="font-medium">{school.email}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>Phone</span>
              </div>
              <p className="font-medium">{school.phone}</p>
            </div>

            {school.website && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                </div>
                <a 
                  href={school.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {school.website}
                </a>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Academic Year</span>
              </div>
              <p className="font-medium">{school.academicYear}</p>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Street Address</div>
              <p className="font-medium">{school.address}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">City</div>
                <p className="font-medium">{school.city}</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">State</div>
                <p className="font-medium">{school.state}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Country</div>
                <p className="font-medium">{school.country}</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Postal Code</div>
                <p className="font-medium">{school.postalCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Principal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Name</div>
              <p className="font-medium">{school.principalName}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <p className="font-medium">{school.principalEmail}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>Phone</span>
              </div>
              <p className="font-medium">{school.principalPhone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacity & Enrollment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Students */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Students</h3>
                <Badge variant="outline">
                  {getCapacityPercentage(school.currentStudents, school.maxStudents)}% Full
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Enrollment</span>
                  <span className="font-medium">{school.currentStudents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Maximum Capacity</span>
                  <span className="font-medium">{school.maxStudents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available Spots</span>
                  <span className="font-medium text-green-600">
                    {school.maxStudents - school.currentStudents}
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getCapacityPercentage(school.currentStudents, school.maxStudents)}%` }}
                ></div>
              </div>
            </div>

            {/* Teachers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Teachers</h3>
                <Badge variant="outline">
                  {getCapacityPercentage(school.currentTeachers, school.maxTeachers)}% Full
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Staff</span>
                  <span className="font-medium">{school.currentTeachers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Maximum Staff</span>
                  <span className="font-medium">{school.maxTeachers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available Positions</span>
                  <span className="font-medium text-green-600">
                    {school.maxTeachers - school.currentTeachers}
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getCapacityPercentage(school.currentTeachers, school.maxTeachers)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Created</div>
              <p className="font-medium">
                {new Date(school.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <p className="font-medium">
                {new Date(school.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
