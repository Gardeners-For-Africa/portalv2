import React from "react";
import { PortalLogo } from "./PortalLogo";

/**
 * Example component demonstrating how to use PortalLogo
 * with the same props as lucide-react icons
 */
export function PortalLogoExample() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-2xl font-bold">PortalLogo Examples</h2>

      <div className="flex flex-wrap gap-4 items-center">
        {/* Basic usage */}
        <div className="flex flex-col items-center gap-2">
          <PortalLogo size={32} />
          <span className="text-sm text-gray-600">Basic (32px)</span>
        </div>

        {/* With custom size */}
        <div className="flex flex-col items-center gap-2">
          <PortalLogo width={48} height={48} />
          <span className="text-sm text-gray-600">Custom size (48x48)</span>
        </div>

        {/* With color filter */}
        <div className="flex flex-col items-center gap-2">
          <PortalLogo size={32} color="blue" />
          <span className="text-sm text-gray-600">Blue tint</span>
        </div>

        {/* With className */}
        <div className="flex flex-col items-center gap-2">
          <PortalLogo size={32} className="rounded-lg border-2 border-gray-300 p-2" />
          <span className="text-sm text-gray-600">With border</span>
        </div>

        {/* Different sizes */}
        <div className="flex flex-col items-center gap-2">
          <PortalLogo size={16} />
          <span className="text-sm text-gray-600">Small (16px)</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <PortalLogo size={64} />
          <span className="text-sm text-gray-600">Large (64px)</span>
        </div>

        {/* With accessibility props */}
        <div className="flex flex-col items-center gap-2">
          <PortalLogo size={32} aria-label="Gardeners for Africa Portal Logo" role="img" />
          <span className="text-sm text-gray-600">With aria-label</span>
        </div>
      </div>

      {/* Usage in a header-like context */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Usage in Header</h3>
        <div className="flex items-center gap-3">
          <PortalLogo size={40} />
          <div>
            <h1 className="text-xl font-bold">Gardeners for Africa Portal</h1>
            <p className="text-sm text-gray-600">School Management System</p>
          </div>
        </div>
      </div>

      {/* Usage with different colors */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Color Variations</h3>
        <div className="flex gap-4 items-center">
          <PortalLogo size={32} color="red" />
          <PortalLogo size={32} color="green" />
          <PortalLogo size={32} color="blue" />
          <PortalLogo size={32} color="purple" />
          <PortalLogo size={32} color="orange" />
        </div>
      </div>
    </div>
  );
}
