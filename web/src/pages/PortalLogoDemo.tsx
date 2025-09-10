import React from "react";
import { PortalLogo, PortalLogoExample } from "@/components/common";

/**
 * Demo page showing PortalLogo usage
 * This can be accessed at /portal-logo-demo for testing
 */
export default function PortalLogoDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <PortalLogo size={64} className="mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">PortalLogo Component Demo</h1>
              <p className="text-gray-600">
                A logo component that accepts the same props as lucide-react icons
              </p>
            </div>

            <PortalLogoExample />
          </div>
        </div>
      </div>
    </div>
  );
}
