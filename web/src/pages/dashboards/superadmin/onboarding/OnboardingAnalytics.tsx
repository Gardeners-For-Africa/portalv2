import { BarChart3, Calendar, Download, RefreshCw, TrendingUp, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { schoolOnboardingService } from "@/services/school-onboarding.service";
import { ONBOARDING_STEPS, OnboardingStep } from "@/types/school-onboarding";

interface OnboardingAnalytics {
  completionRate: number;
  averageCompletionTime: number;
  stepCompletionRates: Record<OnboardingStep, number>;
  abandonmentReasons: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    started: number;
    completed: number;
    abandoned: number;
  }>;
}

export default function OnboardingAnalytics() {
  const [analytics, setAnalytics] = useState<OnboardingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");

  // Load analytics
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await schoolOnboardingService.getOnboardingAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  // Export analytics
  const handleExportAnalytics = async () => {
    try {
      const blob = await schoolOnboardingService.exportOnboardingData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `onboarding-analytics-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export analytics:", error);
    }
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  // Format time
  const formatTime = (hours: number) => {
    if (hours < 24) {
      return `${Math.round(hours)} hours`;
    }
    const days = Math.round(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""}`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Analytics data is not available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Analytics</h1>
          <p className="text-gray-600 mt-2">Insights into school onboarding performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(analytics.completionRate)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Schools successfully completing onboarding
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Completion Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(analytics.averageCompletionTime)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Time from start to completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.monthlyTrends.reduce((sum, month) => sum + month.started, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Schools that started onboarding</p>
          </CardContent>
        </Card>
      </div>

      {/* Step Completion Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Step Completion Rates</CardTitle>
          <CardDescription>Percentage of schools completing each onboarding step</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ONBOARDING_STEPS.map((step) => {
              const completionRate = analytics.stepCompletionRates[step.step] || 0;
              return (
                <div key={step.step} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-gray-500">{step.description}</div>
                    </div>
                    <div className="text-sm font-medium">{formatPercentage(completionRate)}</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>Onboarding activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.monthlyTrends.map((month, index) => (
              <div
                key={month.month}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="font-medium">{month.month}</div>
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Started: {month.started}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Completed: {month.completed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Abandoned: {month.abandoned}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Abandonment Reasons */}
      {Object.keys(analytics.abandonmentReasons).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Abandonment Reasons</CardTitle>
            <CardDescription>Common reasons why schools abandon onboarding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.abandonmentReasons)
                .sort(([, a], [, b]) => b - a)
                .map(([reason, count]) => (
                  <div
                    key={reason}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="font-medium capitalize">{reason.replace("_", " ")}</div>
                    <div className="text-sm text-gray-600">{count} schools</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.completionRate < 0.7 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="font-medium text-yellow-800">Low Completion Rate</div>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Only {formatPercentage(analytics.completionRate)} of schools complete onboarding.
                  Consider simplifying the process or providing more support.
                </p>
              </div>
            )}

            {analytics.averageCompletionTime > 168 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="font-medium text-orange-800">Long Completion Time</div>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  Average completion time is {formatTime(analytics.averageCompletionTime)}. Consider
                  breaking down complex steps or providing better guidance.
                </p>
              </div>
            )}

            {analytics.completionRate >= 0.8 && analytics.averageCompletionTime <= 72 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="font-medium text-green-800">Excellent Performance</div>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Great job! Your onboarding process is performing well with a{" "}
                  {formatPercentage(analytics.completionRate)}
                  completion rate and {formatTime(analytics.averageCompletionTime)} average
                  completion time.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
