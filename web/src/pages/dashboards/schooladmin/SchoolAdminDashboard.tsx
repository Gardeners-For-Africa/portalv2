import React from 'react';
import { Users, GraduationCap, BookOpen, CreditCard, Calendar, TrendingUp, UserPlus, BookPlus } from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockDashboardStats } from '@/utils/mockData';

const recentEnrollments = [
  {
    id: '1',
    name: 'Emma Johnson',
    class: 'Grade 8A',
    enrolledDate: '2024-01-15',
    status: 'active',
    parentContact: 'sarah.johnson@email.com',
  },
  {
    id: '2',
    name: 'Michael Chen',
    class: 'Grade 7B',
    enrolledDate: '2024-01-14',
    status: 'pending',
    parentContact: 'li.chen@email.com',
  },
  {
    id: '3',
    name: 'Sofia Rodriguez',
    class: 'Grade 9A',
    enrolledDate: '2024-01-13',
    status: 'active',
    parentContact: 'carlos.rodriguez@email.com',
  },
];

const upcomingEvents = [
  {
    id: '1',
    title: 'Parent-Teacher Conference',
    date: '2024-01-25',
    time: '9:00 AM',
    attendees: 45,
    type: 'meeting',
  },
  {
    id: '2',
    title: 'Science Fair',
    date: '2024-02-01',
    time: '10:00 AM',
    attendees: 120,
    type: 'event',
  },
  {
    id: '3',
    title: 'Monthly Staff Meeting',
    date: '2024-01-30',
    time: '3:00 PM',
    attendees: 25,
    type: 'meeting',
  },
];

const paymentStats = [
  { month: 'Sep', collected: 85, pending: 15 },
  { month: 'Oct', collected: 92, pending: 8 },
  { month: 'Nov', collected: 88, pending: 12 },
  { month: 'Dec', collected: 95, pending: 5 },
];

export default function SchoolAdminDashboard() {
  const stats = mockDashboardStats.school_admin;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">
            School Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at your school today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90">
            <BookPlus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          description="Enrolled this year"
          icon={GraduationCap}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Teachers"
          value={stats.totalTeachers}
          description="Active staff"
          icon={Users}
          variant="success"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Total Classes"
          value={stats.totalClasses}
          description="All grade levels"
          icon={BookOpen}
          variant="default"
        />
        <StatsCard
          title="Pending Payments"
          value={stats.pendingPayments}
          description="Requires attention"
          icon={CreditCard}
          variant="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Enrollments */}
        <Card className="card-interactive lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Recent Enrollments
            </CardTitle>
            <CardDescription>
              New student registrations this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{enrollment.name}</h4>
                      <Badge
                        variant={enrollment.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {enrollment.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Class: {enrollment.class}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Parent: {enrollment.parentContact}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(enrollment.enrolledDate).toLocaleDateString()}
                    </p>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="card-interactive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Scheduled events and meetings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border border-border"
                >
                  <h4 className="font-medium text-sm mb-2">{event.title}</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                    <p>{event.attendees} attendees</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`mt-2 text-xs ${
                      event.type === 'meeting' ? 'border-primary' : 'border-success'
                    }`}
                  >
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Collection Overview */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Payment Collection Overview
          </CardTitle>
          <CardDescription>
            Monthly payment collection rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {paymentStats.map((stat) => (
              <div key={stat.month} className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stat.month} 2024</span>
                  <span className="text-muted-foreground">{stat.collected}%</span>
                </div>
                <Progress value={stat.collected} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Collected: {stat.collected}%</span>
                  <span>Pending: {stat.pending}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}