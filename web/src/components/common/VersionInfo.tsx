import { Info, Package, Settings as SettingsIcon } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppVersionWithPrefix, getVersionInfo } from "@/utils/version";

interface VersionInfoProps {
  variant?: "card" | "badge" | "inline";
  showDetails?: boolean;
  className?: string;
}

export default function VersionInfo({
  variant = "inline",
  showDetails = false,
  className = "",
}: VersionInfoProps) {
  const versionInfo = getVersionInfo();
  const versionWithPrefix = getAppVersionWithPrefix();

  if (variant === "badge") {
    return (
      <Badge variant="outline" className={className}>
        {versionWithPrefix}
      </Badge>
    );
  }

  if (variant === "card") {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Version Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Version</span>
            <Badge variant="outline">{versionWithPrefix}</Badge>
          </div>
          {showDetails && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Application</span>
                <span className="text-sm text-muted-foreground">{versionInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Environment</span>
                <Badge variant="secondary" className="capitalize">
                  {versionInfo.environment}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Build Time</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(versionInfo.buildTime).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default inline variant
  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <Info className="h-3 w-3" />
      <span>{versionWithPrefix}</span>
      {showDetails && (
        <>
          <span>•</span>
          <span className="capitalize">{versionInfo.environment}</span>
        </>
      )}
    </div>
  );
}

// Export individual components for specific use cases
export function VersionBadge({ className }: { className?: string }) {
  return <VersionInfo variant="badge" className={className} />;
}

export function VersionCard({
  showDetails = true,
  className,
}: {
  showDetails?: boolean;
  className?: string;
}) {
  return <VersionInfo variant="card" showDetails={showDetails} className={className} />;
}
