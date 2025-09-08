import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Calculator,
  Settings,
  BookOpen,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { GradingParameters, ScoringConfiguration } from '@/types';
import { mockGradingParameters, mockScoringConfigurations } from '@/utils/mockData';

export default function GradingSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'grading' | 'scoring'>('grading');
  
  // Grading Parameters State
  const [gradingParams, setGradingParams] = useState<GradingParameters>({
    id: '',
    schoolId: 'school-1',
    schoolName: 'Green Valley High School',
    aMin: 80, aMax: 100, aPoints: 5.0, aDescription: 'Excellent',
    bMin: 70, bMax: 79, bPoints: 4.0, bDescription: 'Very Good',
    cMin: 60, cMax: 69, cPoints: 3.0, cDescription: 'Good',
    dMin: 50, dMax: 59, dPoints: 2.0, dDescription: 'Pass',
    eMin: 40, eMax: 49, ePoints: 1.0, eDescription: 'Fair',
    fMin: 0, fMax: 39, fPoints: 0.0, fDescription: 'Fail',
    passMark: 50,
    maxScore: 100,
    academicYear: '2024-2025',
    isActive: true,
    createdAt: '',
    updatedAt: '',
  });

  // Scoring Configuration State
  const [scoringConfig, setScoringConfig] = useState<ScoringConfiguration>({
    id: '',
    schoolId: 'school-1',
    schoolName: 'Green Valley High School',
    educationLevel: 'primary',
    academicYear: '2024-2025',
    isActive: true,
    kickOffTestWeight: 5,
    firstTestWeight: 10,
    secondTestWeight: 10,
    noteWeight: 5,
    projectWeight: 10,
    totalTestWeight: 40,
    examWeight: 60,
    nurseryFirstTestWeight: 20,
    nurserySecondTestWeight: 20,
    nurseryTotalTestWeight: 40,
    nurseryExamWeight: 60,
    createdAt: '',
    updatedAt: '',
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Load existing grading parameters
    const existingParams = mockGradingParameters.find(p => p.isActive);
    if (existingParams) {
      setGradingParams(existingParams);
    }

    // Load existing scoring configuration
    const existingScoring = mockScoringConfigurations.find(s => s.isActive && s.educationLevel === 'primary');
    if (existingScoring) {
      setScoringConfig(existingScoring);
    }
  }, []);

  const handleGradingInputChange = (field: string, value: number) => {
    setGradingParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScoringInputChange = (field: string, value: number | string) => {
    setScoringConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateGradingParameters = () => {
    const errors: string[] = [];

    // Check for overlapping ranges
    if (gradingParams.aMin <= gradingParams.aMax && gradingParams.bMin <= gradingParams.bMax) {
      if (gradingParams.aMax >= gradingParams.bMin) {
        errors.push('Grade A and B ranges overlap');
      }
    }
    if (gradingParams.bMin <= gradingParams.bMax && gradingParams.cMin <= gradingParams.cMax) {
      if (gradingParams.bMax >= gradingParams.cMin) {
        errors.push('Grade B and C ranges overlap');
      }
    }
    if (gradingParams.cMin <= gradingParams.cMax && gradingParams.dMin <= gradingParams.dMax) {
      if (gradingParams.cMax >= gradingParams.dMin) {
        errors.push('Grade C and D ranges overlap');
      }
    }
    if (gradingParams.dMin <= gradingParams.dMax && gradingParams.eMin <= gradingParams.eMax) {
      if (gradingParams.dMax >= gradingParams.eMin) {
        errors.push('Grade D and E ranges overlap');
      }
    }
    if (gradingParams.eMin <= gradingParams.eMax && gradingParams.fMin <= gradingParams.fMax) {
      if (gradingParams.eMax >= gradingParams.fMin) {
        errors.push('Grade E and F ranges overlap');
      }
    }

    // Check pass mark
    if (gradingParams.passMark < gradingParams.dMin || gradingParams.passMark > gradingParams.dMax) {
      errors.push('Pass mark should be within the D grade range');
    }

    setValidationErrors(errors);
    setIsValid(errors.length === 0);
    return errors.length === 0;
  };

  const validateScoringConfiguration = () => {
    const errors: string[] = [];

    if (scoringConfig.educationLevel === 'nursery') {
      const total = (scoringConfig.nurseryFirstTestWeight || 0) + 
                   (scoringConfig.nurserySecondTestWeight || 0) + 
                   (scoringConfig.nurseryExamWeight || 0);
      if (total !== 100) {
        errors.push('Nursery scoring weights must total 100%');
      }
    } else {
      const total = (scoringConfig.kickOffTestWeight || 0) + 
                   (scoringConfig.firstTestWeight || 0) + 
                   (scoringConfig.secondTestWeight || 0) + 
                   (scoringConfig.noteWeight || 0) + 
                   (scoringConfig.projectWeight || 0) + 
                   (scoringConfig.examWeight || 0);
      if (total !== 100) {
        errors.push('Primary/Secondary scoring weights must total 100%');
      }
    }

    setValidationErrors(errors);
    setIsValid(errors.length === 0);
    return errors.length === 0;
  };

  const getGradeForScore = (score: number): string => {
    if (score >= gradingParams.aMin && score <= gradingParams.aMax) return 'A';
    if (score >= gradingParams.bMin && score <= gradingParams.bMax) return 'B';
    if (score >= gradingParams.cMin && score <= gradingParams.cMax) return 'C';
    if (score >= gradingParams.dMin && score <= gradingParams.dMax) return 'D';
    if (score >= gradingParams.eMin && score <= gradingParams.eMax) return 'E';
    return 'F';
  };

  const getGradePoints = (score: number): number => {
    const grade = getGradeForScore(score);
    switch (grade) {
      case 'A': return gradingParams.aPoints;
      case 'B': return gradingParams.bPoints;
      case 'C': return gradingParams.cPoints;
      case 'D': return gradingParams.dPoints;
      case 'E': return gradingParams.ePoints;
      case 'F': return gradingParams.fPoints;
      default: return 0;
    }
  };

  const handleSave = () => {
    if (activeTab === 'grading') {
      if (validateGradingParameters()) {
        toast({
          title: "Grading parameters saved",
          description: "Your grading parameters have been updated successfully.",
        });
      } else {
        toast({
          title: "Validation errors",
          description: "Please fix the validation errors before saving.",
          variant: "destructive",
        });
      }
    } else {
      if (validateScoringConfiguration()) {
        toast({
          title: "Scoring configuration saved",
          description: "Your scoring configuration has been updated successfully.",
        });
      } else {
        toast({
          title: "Validation errors",
          description: "Please fix the validation errors before saving.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/school-admin/grading/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Grading Settings</h1>
            <p className="text-muted-foreground">
              Configure grading parameters and scoring weights for different education levels
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!isValid}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('grading')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'grading'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calculator className="inline mr-2 h-4 w-4" />
          Grading Parameters
        </button>
        <button
          onClick={() => setActiveTab('scoring')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'scoring'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="inline mr-2 h-4 w-4" />
          Scoring Configuration
        </button>
      </div>

      {activeTab === 'grading' ? (
        <div className="space-y-6">
          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure the grading parameters for your school. These settings will be used to calculate grades and determine student performance levels.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Grade Boundaries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Grade Boundaries</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Grade A */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Grade A</Label>
                    <Badge variant="default">Excellent</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="aMin">Min Score</Label>
                      <Input
                        id="aMin"
                        type="number"
                        value={gradingParams.aMin}
                        onChange={(e) => handleGradingInputChange('aMin', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="aMax">Max Score</Label>
                      <Input
                        id="aMax"
                        type="number"
                        value={gradingParams.aMax}
                        onChange={(e) => handleGradingInputChange('aMax', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="aPoints">Points</Label>
                      <Input
                        id="aPoints"
                        type="number"
                        step="0.1"
                        value={gradingParams.aPoints}
                        onChange={(e) => handleGradingInputChange('aPoints', Number(e.target.value))}
                        min="0"
                        max="5"
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Description"
                    value={gradingParams.aDescription}
                    onChange={(e) => handleGradingInputChange('aDescription', e.target.value)}
                  />
                </div>

                <Separator />

                {/* Grade B */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Grade B</Label>
                    <Badge variant="secondary">Very Good</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="bMin">Min Score</Label>
                      <Input
                        id="bMin"
                        type="number"
                        value={gradingParams.bMin}
                        onChange={(e) => handleGradingInputChange('bMin', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bMax">Max Score</Label>
                      <Input
                        id="bMax"
                        type="number"
                        value={gradingParams.bMax}
                        onChange={(e) => handleGradingInputChange('bMax', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bPoints">Points</Label>
                      <Input
                        id="bPoints"
                        type="number"
                        step="0.1"
                        value={gradingParams.bPoints}
                        onChange={(e) => handleGradingInputChange('bPoints', Number(e.target.value))}
                        min="0"
                        max="5"
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Description"
                    value={gradingParams.bDescription}
                    onChange={(e) => handleGradingInputChange('bDescription', e.target.value)}
                  />
                </div>

                <Separator />

                {/* Grade C */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Grade C</Label>
                    <Badge variant="outline">Good</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="cMin">Min Score</Label>
                      <Input
                        id="cMin"
                        type="number"
                        value={gradingParams.cMin}
                        onChange={(e) => handleGradingInputChange('cMin', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cMax">Max Score</Label>
                      <Input
                        id="cMax"
                        type="number"
                        value={gradingParams.cMax}
                        onChange={(e) => handleGradingInputChange('cMax', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cPoints">Points</Label>
                      <Input
                        id="cPoints"
                        type="number"
                        step="0.1"
                        value={gradingParams.cPoints}
                        onChange={(e) => handleGradingInputChange('cPoints', Number(e.target.value))}
                        min="0"
                        max="5"
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Description"
                    value={gradingParams.cDescription}
                    onChange={(e) => handleGradingInputChange('cDescription', e.target.value)}
                  />
                </div>

                <Separator />

                {/* Grade D */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Grade D</Label>
                    <Badge variant="outline">Pass</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="dMin">Min Score</Label>
                      <Input
                        id="dMin"
                        type="number"
                        value={gradingParams.dMin}
                        onChange={(e) => handleGradingInputChange('dMin', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dMax">Max Score</Label>
                      <Input
                        id="dMax"
                        type="number"
                        value={gradingParams.dMax}
                        onChange={(e) => handleGradingInputChange('dMax', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dPoints">Points</Label>
                      <Input
                        id="dPoints"
                        type="number"
                        step="0.1"
                        value={gradingParams.dPoints}
                        onChange={(e) => handleGradingInputChange('dPoints', Number(e.target.value))}
                        min="0"
                        max="5"
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Description"
                    value={gradingParams.dDescription}
                    onChange={(e) => handleGradingInputChange('dDescription', e.target.value)}
                  />
                </div>

                <Separator />

                {/* Grade E */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Grade E</Label>
                    <Badge variant="destructive">Fair</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="eMin">Min Score</Label>
                      <Input
                        id="eMin"
                        type="number"
                        value={gradingParams.eMin}
                        onChange={(e) => handleGradingInputChange('eMin', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eMax">Max Score</Label>
                      <Input
                        id="eMax"
                        type="number"
                        value={gradingParams.eMax}
                        onChange={(e) => handleGradingInputChange('eMax', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ePoints">Points</Label>
                      <Input
                        id="ePoints"
                        type="number"
                        step="0.1"
                        value={gradingParams.ePoints}
                        onChange={(e) => handleGradingInputChange('ePoints', Number(e.target.value))}
                        min="0"
                        max="5"
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Description"
                    value={gradingParams.eDescription}
                    onChange={(e) => handleGradingInputChange('eDescription', e.target.value)}
                  />
                </div>

                <Separator />

                {/* Grade F */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Grade F</Label>
                    <Badge variant="destructive">Fail</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="fMin">Min Score</Label>
                      <Input
                        id="fMin"
                        type="number"
                        value={gradingParams.fMin}
                        onChange={(e) => handleGradingInputChange('fMin', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fMax">Max Score</Label>
                      <Input
                        id="fMax"
                        type="number"
                        value={gradingParams.fMax}
                        onChange={(e) => handleGradingInputChange('fMax', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fPoints">Points</Label>
                      <Input
                        id="fPoints"
                        type="number"
                        step="0.1"
                        value={gradingParams.fPoints}
                        onChange={(e) => handleGradingInputChange('fPoints', Number(e.target.value))}
                        min="0"
                        max="5"
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Description"
                    value={gradingParams.fDescription}
                    onChange={(e) => handleGradingInputChange('fDescription', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* General Settings & Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="passMark">Pass Mark (%)</Label>
                    <Input
                      id="passMark"
                      type="number"
                      value={gradingParams.passMark}
                      onChange={(e) => handleGradingInputChange('passMark', Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxScore">Maximum Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      value={gradingParams.maxScore}
                      onChange={(e) => handleGradingInputChange('maxScore', Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      value={gradingParams.academicYear}
                      onChange={(e) => handleGradingInputChange('academicYear', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Grade Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">85</div>
                      <div className="text-sm text-muted-foreground">Score</div>
                      <Badge variant="default">{getGradeForScore(85)}</Badge>
                      <div className="text-xs text-muted-foreground">{getGradePoints(85)} points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">72</div>
                      <div className="text-sm text-muted-foreground">Score</div>
                      <Badge variant="secondary">{getGradeForScore(72)}</Badge>
                      <div className="text-xs text-muted-foreground">{getGradePoints(72)} points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Validation Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {isValid ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>All parameters are valid</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Validation errors found:</span>
                      </div>
                      <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure the scoring weights for different education levels. These weights determine how different assessment components contribute to the final grade.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Education Level Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Education Level</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={scoringConfig.educationLevel}
                  onValueChange={(value) => handleScoringInputChange('educationLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nursery">Nursery</SelectItem>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Scoring Weights */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {scoringConfig.educationLevel === 'nursery' ? 'Nursery Scoring Weights' : 'Primary/Secondary Scoring Weights'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scoringConfig.educationLevel === 'nursery' ? (
                  <>
                    <div>
                      <Label htmlFor="nurseryFirstTest">First Test Weight (%)</Label>
                      <Input
                        id="nurseryFirstTest"
                        type="number"
                        value={scoringConfig.nurseryFirstTestWeight}
                        onChange={(e) => handleScoringInputChange('nurseryFirstTestWeight', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nurserySecondTest">Second Test Weight (%)</Label>
                      <Input
                        id="nurserySecondTest"
                        type="number"
                        value={scoringConfig.nurserySecondTestWeight}
                        onChange={(e) => handleScoringInputChange('nurserySecondTestWeight', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nurseryExam">Exam Weight (%)</Label>
                      <Input
                        id="nurseryExam"
                        type="number"
                        value={scoringConfig.nurseryExamWeight}
                        onChange={(e) => handleScoringInputChange('nurseryExamWeight', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="kickOffTest">Kick-Off Test Weight (%)</Label>
                      <Input
                        id="kickOffTest"
                        type="number"
                        value={scoringConfig.kickOffTestWeight}
                        onChange={(e) => handleScoringInputChange('kickOffTestWeight', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstTest">First Test Weight (%)</Label>
                      <Input
                        id="firstTest"
                        type="number"
                        value={scoringConfig.firstTestWeight}
                        onChange={(e) => handleScoringInputChange('firstTestWeight', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondTest">Second Test Weight (%)</Label>
                      <Input
                        id="secondTest"
                        type="number"
                        value={scoringConfig.secondTestWeight}
                        onChange={(e) => handleScoringInputChange('secondTestWeight', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="note">Note Weight (%)</Label>
                      <Input
                        id="note"
                        type="number"
                        value={scoringConfig.noteWeight}
                        onChange={(e) => handleScoringInputChange('noteWeight', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="project">Project Weight (%)</Label>
                      <Input
                        id="project"
                        type="number"
                        value={scoringConfig.projectWeight}
                        onChange={(e) => handleScoringInputChange('projectWeight', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exam">Exam Weight (%)</Label>
                      <Input
                        id="exam"
                        type="number"
                        value={scoringConfig.examWeight}
                        onChange={(e) => handleScoringInputChange('examWeight', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Weight Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Weight Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scoringConfig.educationLevel === 'nursery' ? (
                    <>
                      <div className="flex justify-between">
                        <span>First Test:</span>
                        <span>{scoringConfig.nurseryFirstTestWeight || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Second Test:</span>
                        <span>{scoringConfig.nurserySecondTestWeight || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exam:</span>
                        <span>{scoringConfig.nurseryExamWeight || 0}%</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{(scoringConfig.nurseryFirstTestWeight || 0) + (scoringConfig.nurserySecondTestWeight || 0) + (scoringConfig.nurseryExamWeight || 0)}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Kick-Off Test:</span>
                        <span>{scoringConfig.kickOffTestWeight || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>First Test:</span>
                        <span>{scoringConfig.firstTestWeight || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Second Test:</span>
                        <span>{scoringConfig.secondTestWeight || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Note:</span>
                        <span>{scoringConfig.noteWeight || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Project:</span>
                        <span>{scoringConfig.projectWeight || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exam:</span>
                        <span>{scoringConfig.examWeight || 0}%</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{(scoringConfig.kickOffTestWeight || 0) + (scoringConfig.firstTestWeight || 0) + (scoringConfig.secondTestWeight || 0) + (scoringConfig.noteWeight || 0) + (scoringConfig.projectWeight || 0) + (scoringConfig.examWeight || 0)}%</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Validation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Validation Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isValid ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Scoring configuration is valid</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Validation errors found:</span>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
