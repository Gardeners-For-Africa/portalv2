import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User, Mail, Calendar, Shield, UserCheck, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserType, UserRole } from '@/types';
import { mockUsers } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

const roleIcons = {
  super_admin: Shield,
  school_admin: UserCheck,
  teacher: User,
  student: GraduationCap,
  parent: Users,
};

const roleColors = {
  super_admin: 'bg-red-100 text-red-800',
  school_admin: 'bg-blue-100 text-blue-800',
  teacher: 'bg-green-100 text-green-800',
  student: 'bg-purple-100 text-purple-800',
  parent: 'bg-orange-100 text-orange-800',
};

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundUser = mockUsers.find(u => u.id === id);
      if (foundUser) {
        setUser(foundUser);
      } else {
        toast({
          title: "User not found",
          description: "The requested user could not be found.",
          variant: "destructive",
        });
        navigate('/dashboard/super-admin/users');
      }
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleBadge = (role: UserRole) => {
    const Icon = roleIcons[role];
    return (
      <Badge className={roleColors[role]}>
        <Icon className="mr-1 h-3 w-3" />
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/super-admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xl">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(user.isActive)}
          {getRoleBadge(user.role)}
          <Button onClick={() => navigate(`/dashboard/super-admin/users/edit/${user.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Full Name</div>
              <p className="font-medium">{user.firstName} {user.lastName}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <p className="font-medium">{user.email}</p>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Role</div>
              <div>{getRoleBadge(user.role)}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Status</div>
              <div>{getStatusBadge(user.isActive)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">User ID</div>
              <p className="font-mono text-sm">{user.id}</p>
            </div>

            {user.tenantId && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Tenant ID</div>
                <p className="font-mono text-sm">{user.tenantId}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created</span>
              </div>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last Updated</span>
              </div>
              <p className="font-medium">{formatDate(user.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Role-Specific Information */}
        <Card>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.role === 'student' && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Student ID</div>
                <p className="font-medium">{(user as any).studentId || 'N/A'}</p>
              </div>
            )}

            {user.role === 'teacher' && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Employee ID</div>
                <p className="font-medium">{(user as any).employeeId || 'N/A'}</p>
              </div>
            )}

            {user.role === 'parent' && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Children Count</div>
                <p className="font-medium">{(user as any).studentIds?.length || 0}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Account Type</div>
              <p className="font-medium capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Avatar URL</div>
              <p className="font-medium break-all">
                {user.avatar || 'No avatar set'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Account Age</div>
              <p className="font-medium">
                {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate(`/dashboard/super-admin/users/edit/${user.id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/super-admin/users')}>
              <User className="mr-2 h-4 w-4" />
              View All Users
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
