import React from "react";
import logoImage from "@/assets/logo.png";
import { cn } from "@/lib/utils";

// Define the same props interface as lucide-react icons
export interface PortalLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number | string;
  fill?: string;
  stroke?: string;
  strokeLinecap?: "butt" | "round" | "square";
  strokeLinejoin?: "miter" | "round" | "bevel";
  viewBox?: string;
  xmlns?: string;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
  role?: string;
}

export const PortalLogo = React.forwardRef<HTMLImageElement, PortalLogoProps>(
  (
    {
      size,
      width,
      height,
      className,
      color,
      strokeWidth,
      fill,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      viewBox,
      xmlns,
      "aria-hidden": ariaHidden,
      "aria-label": ariaLabel,
      role,
      style,
      ...props
    },
    ref,
  ) => {
    // Calculate dimensions - prioritize size, then width/height, then default
    const calculatedWidth = size || width || 24;
    const calculatedHeight = size || height || 24;

    // Convert to numbers if they're strings with units
    const finalWidth =
      typeof calculatedWidth === "string" ? calculatedWidth : `${calculatedWidth}px`;
    const finalHeight =
      typeof calculatedHeight === "string" ? calculatedHeight : `${calculatedHeight}px`;

    return (
      <img
        ref={ref}
        src={logoImage}
        alt={ariaLabel || "Portal Logo"}
        width={finalWidth}
        height={finalHeight}
        className={cn("inline-block", className)}
        style={{
          ...style,
          // Apply color as a filter if provided (for PNG images)
          ...(color && {
            filter: `hue-rotate(${getHueFromColor(color)}deg) saturate(${getSaturationFromColor(color)}) brightness(${getBrightnessFromColor(color)})`,
          }),
        }}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel}
        role={role || "img"}
        {...props}
      />
    );
  },
);

PortalLogo.displayName = "PortalLogo";

// Helper functions to convert color to CSS filter values
function getHueFromColor(color: string): number {
  // Simple color to hue conversion for common colors
  const colorMap: Record<string, number> = {
    red: 0,
    orange: 30,
    yellow: 60,
    green: 120,
    blue: 240,
    purple: 270,
    pink: 300,
    black: 0,
    white: 0,
    gray: 0,
  };

  const normalizedColor = color.toLowerCase().replace(/#/g, "");
  if (colorMap[normalizedColor]) {
    return colorMap[normalizedColor];
  }

  // For hex colors, extract hue
  if (normalizedColor.length === 6) {
    const r = parseInt(normalizedColor.substr(0, 2), 16);
    const g = parseInt(normalizedColor.substr(2, 2), 16);
    const b = parseInt(normalizedColor.substr(4, 2), 16);
    return rgbToHue(r, g, b);
  }

  return 0; // Default hue
}

function getSaturationFromColor(color: string): number {
  // Return a moderate saturation value
  return 1.2;
}

function getBrightnessFromColor(color: string): number {
  // Return a moderate brightness value
  return 1.1;
}

function rgbToHue(r: number, g: number, b: number): number {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  if (diff === 0) return 0;

  let hue = 0;
  if (max === r) {
    hue = ((g - b) / diff) % 6;
  } else if (max === g) {
    hue = (b - r) / diff + 2;
  } else {
    hue = (r - g) / diff + 4;
  }

  return Math.round(hue * 60);
}

// Export as default for easier importing
export default PortalLogo;
