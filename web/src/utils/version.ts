/**
 * Version utility to get the current application version from package.json
 *
 * This utility provides functions to access version information dynamically
 * from the package.json file, ensuring the version displayed in the UI
 * stays in sync with the actual package version.
 *
 * @example
 * // Get version with 'v' prefix
 * const version = getAppVersionWithPrefix(); // "v1.14.0"
 *
 * // Get detailed version info
 * const info = getVersionInfo();
 * console.log(info.version); // "1.14.0"
 * console.log(info.environment); // "development" | "production"
 */

import packageJson from "../../../package.json";

/**
 * Get the current application version from package.json
 * @returns The version string (e.g., "1.14.0")
 */
export function getAppVersion(): string {
  return packageJson.version;
}

/**
 * Get the application version with a 'v' prefix
 * @returns The version string with 'v' prefix (e.g., "v1.14.0")
 */
export function getAppVersionWithPrefix(): string {
  return `v${packageJson.version}`;
}

/**
 * Get detailed version information including build info
 * @returns Object containing version and build information
 */
export function getVersionInfo() {
  return {
    version: packageJson.version,
    name: packageJson.name,
    buildTime: new Date().toISOString(),
    environment: import.meta.env.MODE || "development",
  };
}
