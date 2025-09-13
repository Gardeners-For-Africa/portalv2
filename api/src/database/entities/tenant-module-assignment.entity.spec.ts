import { TenantModuleAssignment } from "./tenant-module-assignment.entity";

describe("TenantModuleAssignment Entity", () => {
  let assignment: TenantModuleAssignment;

  beforeEach(() => {
    assignment = new TenantModuleAssignment();
  });

  it("should be defined", () => {
    expect(assignment).toBeDefined();
  });

  it("should have correct default values", () => {
    expect(assignment.isEnabled).toBe(false);
    expect(assignment.enabledAt).toBeUndefined();
    expect(assignment.enabledBy).toBeUndefined();
    expect(assignment.disabledAt).toBeUndefined();
    expect(assignment.disabledBy).toBeUndefined();
    expect(assignment.notes).toBeUndefined();
    expect(assignment.reason).toBeUndefined();
    expect(assignment.configuration).toBeUndefined();
    expect(assignment.metadata).toBeUndefined();
  });

  it("should handle enabled state correctly", () => {
    assignment.isEnabled = true;
    assignment.enabledAt = new Date();
    assignment.enabledBy = "user-123";
    assignment.notes = "Enabled for new academic year";

    expect(assignment.isEnabled).toBe(true);
    expect(assignment.enabledAt).toBeInstanceOf(Date);
    expect(assignment.enabledBy).toBe("user-123");
    expect(assignment.notes).toBe("Enabled for new academic year");
  });

  it("should handle disabled state correctly", () => {
    assignment.isEnabled = false;
    assignment.disabledAt = new Date();
    assignment.disabledBy = "user-456";
    assignment.reason = "No longer needed";

    expect(assignment.isEnabled).toBe(false);
    expect(assignment.disabledAt).toBeInstanceOf(Date);
    expect(assignment.disabledBy).toBe("user-456");
    expect(assignment.reason).toBe("No longer needed");
  });

  it("should handle configuration object correctly", () => {
    const config = {
      setting1: "value1",
      setting2: true,
      setting3: 123,
      nested: {
        property: "nested_value",
      },
    };

    assignment.configuration = config;
    expect(assignment.configuration).toEqual(config);
    expect(assignment.configuration.setting1).toBe("value1");
    expect(assignment.configuration.setting2).toBe(true);
    expect(assignment.configuration.setting3).toBe(123);
    expect(assignment.configuration.nested.property).toBe("nested_value");
  });

  it("should handle metadata object correctly", () => {
    const metadata = {
      source: "api",
      version: "1.0",
      tags: ["academic", "core"],
      customData: {
        priority: "high",
        department: "academics",
      },
    };

    assignment.metadata = metadata;
    expect(assignment.metadata).toEqual(metadata);
    expect(assignment.metadata.source).toBe("api");
    expect(assignment.metadata.version).toBe("1.0");
    expect(assignment.metadata.tags).toEqual(["academic", "core"]);
    expect(assignment.metadata.customData.priority).toBe("high");
  });

  it("should handle null values correctly", () => {
    assignment.enabledAt = null;
    assignment.enabledBy = null;
    assignment.disabledAt = null;
    assignment.disabledBy = null;
    assignment.notes = null;
    assignment.reason = null;
    assignment.configuration = null;
    assignment.metadata = null;

    expect(assignment.enabledAt).toBeNull();
    expect(assignment.enabledBy).toBeNull();
    expect(assignment.disabledAt).toBeNull();
    expect(assignment.disabledBy).toBeNull();
    expect(assignment.notes).toBeNull();
    expect(assignment.reason).toBeNull();
    expect(assignment.configuration).toBeNull();
    expect(assignment.metadata).toBeNull();
  });

  it("should create a complete assignment instance", () => {
    const completeAssignment = new TenantModuleAssignment();
    completeAssignment.id = "assignment-123";
    completeAssignment.tenantId = "tenant-123";
    completeAssignment.moduleId = "module-123";
    completeAssignment.isEnabled = true;
    completeAssignment.enabledAt = new Date("2024-01-01T00:00:00.000Z");
    completeAssignment.enabledBy = "user-123";
    completeAssignment.disabledAt = null;
    completeAssignment.disabledBy = null;
    completeAssignment.notes = "Enabled for new academic year";
    completeAssignment.reason = null;
    completeAssignment.configuration = { setting1: "value1" };
    completeAssignment.metadata = { source: "admin" };
    completeAssignment.createdAt = new Date();
    completeAssignment.updatedAt = new Date();

    expect(completeAssignment.id).toBe("assignment-123");
    expect(completeAssignment.tenantId).toBe("tenant-123");
    expect(completeAssignment.moduleId).toBe("module-123");
    expect(completeAssignment.isEnabled).toBe(true);
    expect(completeAssignment.enabledAt).toEqual(new Date("2024-01-01T00:00:00.000Z"));
    expect(completeAssignment.enabledBy).toBe("user-123");
    expect(completeAssignment.disabledAt).toBeNull();
    expect(completeAssignment.disabledBy).toBeNull();
    expect(completeAssignment.notes).toBe("Enabled for new academic year");
    expect(completeAssignment.reason).toBeNull();
    expect(completeAssignment.configuration).toEqual({ setting1: "value1" });
    expect(completeAssignment.metadata).toEqual({ source: "admin" });
    expect(completeAssignment.createdAt).toBeInstanceOf(Date);
    expect(completeAssignment.updatedAt).toBeInstanceOf(Date);
  });

  it("should handle transition from enabled to disabled", () => {
    // Initially enabled
    assignment.isEnabled = true;
    assignment.enabledAt = new Date("2024-01-01T00:00:00.000Z");
    assignment.enabledBy = "user-123";
    assignment.notes = "Initially enabled";

    // Transition to disabled
    assignment.isEnabled = false;
    assignment.disabledAt = new Date("2024-06-01T00:00:00.000Z");
    assignment.disabledBy = "user-456";
    assignment.reason = "No longer needed";
    // Clear enabled fields
    assignment.enabledAt = null;
    assignment.enabledBy = null;

    expect(assignment.isEnabled).toBe(false);
    expect(assignment.disabledAt).toEqual(new Date("2024-06-01T00:00:00.000Z"));
    expect(assignment.disabledBy).toBe("user-456");
    expect(assignment.reason).toBe("No longer needed");
    expect(assignment.enabledAt).toBeNull();
    expect(assignment.enabledBy).toBeNull();
  });

  it("should handle transition from disabled to enabled", () => {
    // Initially disabled
    assignment.isEnabled = false;
    assignment.disabledAt = new Date("2024-01-01T00:00:00.000Z");
    assignment.disabledBy = "user-123";
    assignment.reason = "Initially disabled";

    // Transition to enabled
    assignment.isEnabled = true;
    assignment.enabledAt = new Date("2024-06-01T00:00:00.000Z");
    assignment.enabledBy = "user-456";
    assignment.notes = "Re-enabled after review";
    // Clear disabled fields
    assignment.disabledAt = null;
    assignment.disabledBy = null;
    assignment.reason = null;

    expect(assignment.isEnabled).toBe(true);
    expect(assignment.enabledAt).toEqual(new Date("2024-06-01T00:00:00.000Z"));
    expect(assignment.enabledBy).toBe("user-456");
    expect(assignment.notes).toBe("Re-enabled after review");
    expect(assignment.disabledAt).toBeNull();
    expect(assignment.disabledBy).toBeNull();
    expect(assignment.reason).toBeNull();
  });

  it("should handle empty configuration and metadata", () => {
    assignment.configuration = {};
    assignment.metadata = {};

    expect(assignment.configuration).toEqual({});
    expect(assignment.metadata).toEqual({});
  });

  it("should handle complex nested objects", () => {
    const complexConfig = {
      ui: {
        theme: "dark",
        layout: {
          sidebar: true,
          header: true,
          footer: false,
        },
      },
      features: {
        enabled: ["feature1", "feature2"],
        disabled: ["feature3"],
        settings: {
          feature1: { setting1: "value1" },
          feature2: { setting2: "value2" },
        },
      },
      permissions: {
        read: ["user", "admin"],
        write: ["admin"],
        manage: ["super_admin"],
      },
    };

    const complexMetadata = {
      version: "2.0.0",
      environment: "production",
      deployment: {
        region: "us-east-1",
        cluster: "prod-cluster",
        replicas: 3,
      },
      monitoring: {
        enabled: true,
        alerts: ["cpu", "memory", "disk"],
        thresholds: {
          cpu: 80,
          memory: 90,
          disk: 85,
        },
      },
    };

    assignment.configuration = complexConfig;
    assignment.metadata = complexMetadata;

    expect(assignment.configuration.ui.theme).toBe("dark");
    expect(assignment.configuration.ui.layout.sidebar).toBe(true);
    expect(assignment.configuration.features.enabled).toEqual(["feature1", "feature2"]);
    expect(assignment.configuration.permissions.read).toEqual(["user", "admin"]);

    expect(assignment.metadata.version).toBe("2.0.0");
    expect(assignment.metadata.environment).toBe("production");
    expect(assignment.metadata.deployment.region).toBe("us-east-1");
    expect(assignment.metadata.monitoring.thresholds.cpu).toBe(80);
  });
});
