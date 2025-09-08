import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Award,
  FileText,
  BarChart3,
  Bell,
  MapPin,
  UserCheck,
  GraduationCap,
  Target,
  Activity,
  DollarSign
} from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  totalStudents: number;
  averageScore: number;
  totalClasses: number;
  color: string;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  totalStudents: number;
  averageAttendance: number;
  nextClass: string;
  subjects: string[];
  recentActivity: string;
}

interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'exam' | 'holiday' | 'meeting' | 'activity' | 'other';
  location?: string;
  time?: string;
}

const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    code: 'MATH101',
    description: 'Advanced Mathematics including Algebra, Geometry, and Calculus',
    totalStudents: 45,
    averageScore: 78.5,
    totalClasses: 3,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    name: 'Physics',
    code: 'PHYS101',
    description: 'Fundamental Physics concepts and laboratory experiments',
    totalStudents: 32,
    averageScore: 82.3,
    totalClasses: 2,
    color: 'bg-green-500'
  },
  {
    id: '3',
    name: 'Chemistry',
    code: 'CHEM101',
    description: 'General Chemistry with practical laboratory work',
    totalStudents: 28,
    averageScore: 75.8,
    totalClasses: 2,
    color: 'bg-purple-500'
  }
];

const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Form 3A',
    grade: 'Grade 9',
    totalStudents: 25,
    averageAttendance: 94.2,
    nextClass: 'Mathematics - Tomorrow 8:00 AM',
    subjects: ['Mathematics', 'Physics'],
    recentActivity: 'Mid-term exam completed'
  },
  {
    id: '2',
    name: 'Form 4A',
    grade: 'Grade 10',
    totalStudents: 22,
    averageAttendance: 91.8,
    nextClass: 'Physics - Today 2:00 PM',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    recentActivity: 'Lab experiment scheduled'
  },
  {
    id: '3',
    name: 'Form 5A',
    grade: 'Grade 11',
    totalStudents: 20,
    averageAttendance: 89.5,
    nextClass: 'Chemistry - Friday 10:00 AM',
    subjects: ['Physics', 'Chemistry'],
    recentActivity: 'Assignment due next week'
  }
];

const mockEvents: SchoolEvent[] = [
  {
    id: '1',
    title: 'Mid-Term Examinations',
    description: 'School-wide mid-term examinations for all classes',
    date: new Date(2024, 2, 15),
    type: 'exam',
    location: 'All Classrooms',
    time: '8:00 AM - 3:00 PM'
  },
  {
    id: '2',
    title: 'Staff Meeting',
    description: 'Monthly staff meeting to discuss academic progress',
    date: new Date(2024, 2, 20),
    type: 'meeting',
    location: 'Staff Room',
    time: '2:00 PM - 3:30 PM'
  },
  {
    id: '3',
    title: 'Science Fair',
    description: 'Annual science fair showcasing student projects',
    date: new Date(2024, 2, 25),
    type: 'activity',
    location: 'School Hall',
    time: '9:00 AM - 4:00 PM'
  },
  {
    id: '4',
    title: 'Easter Holiday',
    description: 'School closed for Easter holiday',
    date: new Date(2024, 3, 1),
    type: 'holiday',
    location: 'School Closed'
  }
];

export default function TeacherDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);

  const getEventTypeBadge = (type: string) => {
    const typeConfig = {
      exam: { className: 'bg-red-100 text-red-800', icon: FileText },
      holiday: { className: 'bg-blue-100 text-blue-800', icon: Calendar },
      meeting: { className: 'bg-yellow-100 text-yellow-800', icon: Users },
      activity: { className: 'bg-green-100 text-green-800', icon: Activity },
      other: { className: 'bg-gray-100 text-gray-800', icon: Bell }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <Badge className={config.className}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getEventTypeColor = (type: string) => {
    const colorConfig = {
      exam: 'text-red-600',
      holiday: 'text-blue-600',
      meeting: 'text-yellow-600',
      activity: 'text-green-600',
      other: 'text-gray-600'
    };
    
    return colorConfig[type as keyof typeof colorConfig] || 'text-gray-600';
  };

  const todayEvents = mockEvents.filter(event => 
    event.date.toDateString() === new Date().toDateString()
  );

  const upcomingEvents = mockEvents
    .filter(event => event.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const totalStudents = mockClasses.reduce((sum, cls) => sum + cls.totalStudents, 0);
  const averageAttendance = mockClasses.reduce((sum, cls) => sum + cls.averageAttendance, 0) / mockClasses.length;
  const totalSubjects = mockSubjects.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your teaching activities</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across {mockClasses.length} classes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Taught</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Active subjects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Class attendance rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Class</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Form 4A</div>
            <p className="text-xs text-muted-foreground">
              Physics - 2:00 PM
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subjects Overview
              </CardTitle>
              <CardDescription>
                Overview of subjects you teach and student performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSubjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${subject.color} flex items-center justify-center`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{subject.name}</h3>
                        <p className="text-sm text-gray-500">{subject.code}</p>
                        <p className="text-xs text-gray-400">{subject.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">{subject.totalStudents}</div>
                          <div className="text-xs text-gray-500">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{subject.averageScore}%</div>
                          <div className="text-xs text-gray-500">Avg Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{subject.totalClasses}</div>
                          <div className="text-xs text-gray-500">Classes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Classes Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Classes Overview
              </CardTitle>
              <CardDescription>
                Your assigned classes and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClasses.map((cls) => (
                  <div key={cls.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{cls.name}</h3>
                        <p className="text-sm text-gray-500">{cls.grade}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{cls.totalStudents} Students</div>
                        <div className="text-xs text-gray-500">Enrolled</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Attendance</span>
                          <span className="font-medium">{cls.averageAttendance}%</span>
                        </div>
                        <Progress value={cls.averageAttendance} className="h-2" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">Next Class:</div>
                          <div className="text-xs">{cls.nextClass}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {cls.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {cls.recentActivity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                School Calendar
              </CardTitle>
              <CardDescription>
                View upcoming events and important dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Today's Events
              </CardTitle>
              <CardDescription>
                Events scheduled for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayEvents.length > 0 ? (
                <div className="space-y-3">
                  {todayEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                          {event.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{event.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {getEventTypeBadge(event.type)}
                          {event.time && (
                            <div className="text-xs text-gray-500 mt-1">{event.time}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No events today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>
                Next 5 upcoming events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {format(event.date, 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getEventTypeBadge(event.type)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Grade Assignments
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Classes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Update Syllabus
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/teacher/payments'}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Student Payments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
