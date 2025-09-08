import React, { useState } from 'react';
import { FileText, Download, TrendingUp, Award, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockGrades, mockSubjects } from '@/utils/mockData';

const studentGrades = [
  {
    id: '1',
    subject: 'Mathematics',
    code: 'MATH8',
    grades: [
      { type: 'Assignment 1', score: 87, maxScore: 100, date: '2024-10-15', weight: 10 },
      { type: 'Quiz 1', score: 92, maxScore: 100, date: '2024-10-20', weight: 15 },
      { type: 'Midterm', score: 85, maxScore: 100, date: '2024-11-10', weight: 25 },
      { type: 'Assignment 2', score: 89, maxScore: 100, date: '2024-11-15', weight: 10 },
    ],
    currentAverage: 87.2,
    trend: 'up',
    teacher: 'Mr. John Smith',
  },
  {
    id: '2',
    subject: 'English Language Arts',
    code: 'ENG8',
    grades: [
      { type: 'Essay 1', score: 94, maxScore: 100, date: '2024-10-12', weight: 20 },
      { type: 'Reading Quiz', score: 88, maxScore: 100, date: '2024-10-25', weight: 15 },
      { type: 'Presentation', score: 91, maxScore: 100, date: '2024-11-05', weight: 25 },
    ],
    currentAverage: 91.0,
    trend: 'up',
    teacher: 'Ms. Sarah Davis',
  },
  {
    id: '3',
    subject: 'Science',
    code: 'SCI8',
    grades: [
      { type: 'Lab Report 1', score: 82, maxScore: 100, date: '2024-10-18', weight: 20 },
      { type: 'Quiz 1', score: 79, maxScore: 100, date: '2024-10-30', weight: 15 },
      { type: 'Project', score: 86, maxScore: 100, date: '2024-11-12', weight: 30 },
    ],
    currentAverage: 82.9,
    trend: 'down',
    teacher: 'Dr. Emily Wilson',
  },
  {
    id: '4',
    subject: 'History',
    code: 'HIST8',
    grades: [
      { type: 'Test 1', score: 90, maxScore: 100, date: '2024-10-22', weight: 25 },
      { type: 'Research Paper', score: 88, maxScore: 100, date: '2024-11-08', weight: 35 },
    ],
    currentAverage: 88.8,
    trend: 'stable',
    teacher: 'Mr. Robert Chen',
  },
];

const academicPeriods = [
  { value: 'fall-2024', label: 'Fall 2024' },
  { value: 'spring-2024', label: 'Spring 2024' },
  { value: 'fall-2023', label: 'Fall 2023' },
];

export default function StudentResults() {
  const [selectedPeriod, setSelectedPeriod] = useState('fall-2024');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const overallAverage = studentGrades.reduce((sum, subject) => sum + subject.currentAverage, 0) / studentGrades.length;

  const getGradeColor = (average: number) => {
    if (average >= 90) return 'text-success';
    if (average >= 80) return 'text-warning';
    if (average >= 70) return 'text-orange-500';
    return 'text-destructive';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-destructive rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-muted rounded-full" />;
    }
  };

  const filteredGrades = selectedSubject === 'all' 
    ? studentGrades 
    : studentGrades.filter(subject => subject.id === selectedSubject);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">
            My Academic Results
          </h1>
          <p className="text-muted-foreground">
            Track your academic progress and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-full sm:w-48">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <SelectValue placeholder="Select period" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {academicPeriods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-48">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <SelectValue placeholder="All subjects" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {studentGrades.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overall Performance */}
      <Card className="card-interactive bg-gradient-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-poppins font-semibold mb-2">
                Overall Academic Performance
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">
                  {overallAverage.toFixed(1)}%
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span className="text-sm">Grade: A-</span>
                </div>
              </div>
              <p className="text-sm text-primary-foreground/80 mt-2">
                Excellent performance across all subjects
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-1">12th</div>
              <div className="text-sm text-primary-foreground/80">Class Rank</div>
              <div className="text-sm text-primary-foreground/80">out of 28</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Details */}
      <div className="grid gap-6">
        {filteredGrades.map((subject) => (
          <Card key={subject.id} className="card-interactive">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {subject.subject}
                  </CardTitle>
                  <CardDescription>
                    {subject.code} • Teacher: {subject.teacher}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-2xl font-bold ${getGradeColor(subject.currentAverage)}`}>
                      {subject.currentAverage.toFixed(1)}%
                    </span>
                    {getTrendIcon(subject.trend)}
                  </div>
                  <Badge variant="secondary">
                    Current Average
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-3">
                  {subject.grades.map((grade, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{grade.type}</h4>
                          <Badge variant="outline" className="text-xs">
                            {grade.weight}% weight
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(grade.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getGradeColor((grade.score / grade.maxScore) * 100)}`}>
                          {grade.score}/{grade.maxScore}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {((grade.score / grade.maxScore) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Subject Progress</span>
                    <span>{subject.currentAverage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={subject.currentAverage} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}