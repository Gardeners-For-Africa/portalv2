#!/usr/bin/env node

/**
 * Test runner script for Tenant Module System
 *
 * This script runs all tests related to the tenant module system including:
 * - Service tests
 * - Controller tests
 * - DTO validation tests
 * - Entity tests
 * - Integration tests
 * - Seeder tests
 *
 * Usage:
 * npm run test:tenant-modules
 * or
 * node src/tenant/run-tenant-module-tests.ts
 */

import { execSync } from "node:child_process";
import { resolve } from "node:path";

const testFiles = [
  // Service tests
  "src/tenant/tenant-module.service.spec.ts",

  // Controller tests
  "src/tenant/tenant-module.controller.spec.ts",

  // Seeder tests
  "src/tenant/tenant-module-seeder.service.spec.ts",

  // DTO tests
  "src/tenant/dto/tenant-module.dto.spec.ts",

  // Integration tests
  "src/tenant/tenant-module.integration.spec.ts",

  // Entity tests
  "src/database/entities/tenant-module.entity.spec.ts",
  "src/database/entities/tenant-module-assignment.entity.spec.ts",
  "src/database/entities/tenant-module-audit.entity.spec.ts",
];

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(file: string): { success: boolean; output: string } {
  try {
    const testPath = resolve(process.cwd(), file);
    log(`\n🧪 Running ${file}...`, "blue");

    const output = execSync(`npm test -- ${testPath}`, {
      encoding: "utf8",
      stdio: "pipe",
    });

    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: error.stdout || error.message };
  }
}

function runAllTests(): void {
  log("🚀 Starting Tenant Module System Test Suite", "bold");
  log("=".repeat(60), "blue");

  const results: Array<{ file: string; success: boolean; output: string }> = [];

  for (const file of testFiles) {
    const result = runTest(file);
    results.push({ file, ...result });

    if (result.success) {
      log(`✅ ${file} - PASSED`, "green");
    } else {
      log(`❌ ${file} - FAILED`, "red");
    }
  }

  log("\n" + "=".repeat(60), "blue");
  log("📊 Test Results Summary", "bold");
  log("=".repeat(60), "blue");

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const total = results.length;

  log(`Total Tests: ${total}`, "blue");
  log(`Passed: ${passed}`, "green");
  log(`Failed: ${failed}`, failed > 0 ? "red" : "green");

  if (failed > 0) {
    log("\n❌ Failed Tests:", "red");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        log(`  - ${r.file}`, "red");
        log(`    ${r.output.split("\n")[0]}`, "yellow");
      });
  }

  log("\n" + "=".repeat(60), "blue");

  if (failed === 0) {
    log("🎉 All Tenant Module Tests Passed!", "green");
    log("The tenant module system is working correctly.", "green");
  } else {
    log("⚠️  Some tests failed. Please review the output above.", "yellow");
    process.exit(1);
  }
}

function runSpecificTest(testName: string): void {
  log(`🎯 Running specific test: ${testName}`, "blue");

  const file = testFiles.find((f) => f.includes(testName));
  if (!file) {
    log(`❌ Test file not found: ${testName}`, "red");
    log("Available test files:", "yellow");
    testFiles.forEach((f) => log(`  - ${f}`, "blue"));
    process.exit(1);
  }

  const result = runTest(file);

  if (result.success) {
    log(`✅ ${testName} - PASSED`, "green");
  } else {
    log(`❌ ${testName} - FAILED`, "red");
    log("\nTest Output:", "yellow");
    log(result.output, "yellow");
    process.exit(1);
  }
}

function showHelp(): void {
  log("Tenant Module System Test Runner", "bold");
  log("=".repeat(40), "blue");
  log("");
  log("Usage:");
  log("  npm run test:tenant-modules [test-name]", "blue");
  log("");
  log("Examples:");
  log("  npm run test:tenant-modules                    # Run all tests", "green");
  log("  npm run test:tenant-modules service           # Run service tests", "green");
  log("  npm run test:tenant-modules controller        # Run controller tests", "green");
  log("  npm run test:tenant-modules dto               # Run DTO tests", "green");
  log("  npm run test:tenant-modules integration       # Run integration tests", "green");
  log("  npm run test:tenant-modules entities          # Run entity tests", "green");
  log("");
  log("Available test suites:");
  testFiles.forEach((file) => {
    const name = file.split("/").pop()?.replace(".spec.ts", "").replace(".integration.spec.ts", "");
    log(`  - ${name}`, "blue");
  });
}

// Main execution
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  showHelp();
} else if (args.length === 0) {
  runAllTests();
} else {
  const testName = args[0];
  runSpecificTest(testName);
}
