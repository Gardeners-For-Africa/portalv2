import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OnboardingAnalytics from "./OnboardingAnalytics";
import OnboardingManagement from "./OnboardingManagement";

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState("management");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <OnboardingManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <OnboardingAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
