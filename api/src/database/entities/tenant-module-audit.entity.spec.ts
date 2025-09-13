import { ModuleAuditAction, TenantModuleAudit } from "./tenant-module-audit.entity";

describe("TenantModuleAudit Entity", () => {
  let audit: TenantModuleAudit;

  beforeEach(() => {
    audit = new TenantModuleAudit();
  });

  it("should be defined", () => {
    expect(audit).toBeDefined();
  });

  it("should have correct default values", () => {
    expect(audit.userId).toBeUndefined();
    expect(audit.changes).toBeUndefined();
    expect(audit.notes).toBeUndefined();
    expect(audit.metadata).toBeUndefined();
  });

  it("should accept valid action values", () => {
    const actions = [
      ModuleAuditAction.ENABLED,
      ModuleAuditAction.DISABLED,
      ModuleAuditAction.UPDATED,
      ModuleAuditAction.CONFIGURED,
    ];

    actions.forEach((action) => {
      audit.action = action;
      expect(audit.action).toBe(action);
    });
  });

  it("should handle changes object correctly", () => {
    const changes = {
      enabled: { from: false, to: true },
      notes: { from: null, to: "Enabled for new academic year" },
      configuration: { from: {}, to: { setting1: "value1" } },
      updatedBy: { from: null, to: "user-123" },
    };

    audit.changes = changes;
    expect(audit.changes).toEqual(changes);
    expect(audit.changes.enabled.from).toBe(false);
    expect(audit.changes.enabled.to).toBe(true);
    expect(audit.changes.notes.from).toBeNull();
    expect(audit.changes.notes.to).toBe("Enabled for new academic year");
    expect(audit.changes.configuration.from).toEqual({});
    expect(audit.changes.configuration.to).toEqual({ setting1: "value1" });
  });

  it("should handle metadata object correctly", () => {
    const metadata = {
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      sessionId: "session-123",
      requestId: "req-456",
      additionalInfo: {
        browser: "Chrome",
        os: "Windows",
        version: "10.0",
      },
    };

    audit.metadata = metadata;
    expect(audit.metadata).toEqual(metadata);
    expect(audit.metadata.ipAddress).toBe("192.168.1.1");
    expect(audit.metadata.userAgent).toContain("Mozilla/5.0");
    expect(audit.metadata.sessionId).toBe("session-123");
    expect(audit.metadata.requestId).toBe("req-456");
    expect(audit.metadata.additionalInfo.browser).toBe("Chrome");
  });

  it("should handle null values correctly", () => {
    audit.userId = null;
    audit.changes = null;
    audit.notes = null;
    audit.metadata = null;

    expect(audit.userId).toBeNull();
    expect(audit.changes).toBeNull();
    expect(audit.notes).toBeNull();
    expect(audit.metadata).toBeNull();
  });

  it("should create a complete audit instance", () => {
    const completeAudit = new TenantModuleAudit();
    completeAudit.id = "audit-123";
    completeAudit.tenantId = "tenant-123";
    completeAudit.moduleId = "module-123";
    completeAudit.action = ModuleAuditAction.ENABLED;
    completeAudit.userId = "user-123";
    completeAudit.changes = {
      enabled: { from: false, to: true },
      updatedBy: { from: null, to: "user-123" },
    };
    completeAudit.notes = "Enabled for new academic year";
    completeAudit.metadata = {
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      sessionId: "session-123",
    };
    completeAudit.createdAt = new Date();

    expect(completeAudit.id).toBe("audit-123");
    expect(completeAudit.tenantId).toBe("tenant-123");
    expect(completeAudit.moduleId).toBe("module-123");
    expect(completeAudit.action).toBe(ModuleAuditAction.ENABLED);
    expect(completeAudit.userId).toBe("user-123");
    expect(completeAudit.changes).toEqual({
      enabled: { from: false, to: true },
      updatedBy: { from: null, to: "user-123" },
    });
    expect(completeAudit.notes).toBe("Enabled for new academic year");
    expect(completeAudit.metadata).toEqual({
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      sessionId: "session-123",
    });
    expect(completeAudit.createdAt).toBeInstanceOf(Date);
  });

  it("should handle different action types with appropriate changes", () => {
    // ENABLED action
    audit.action = ModuleAuditAction.ENABLED;
    audit.changes = {
      enabled: { from: false, to: true },
      enabledAt: { from: null, to: new Date().toISOString() },
      enabledBy: { from: null, to: "user-123" },
    };
    audit.notes = "Module enabled for tenant";

    expect(audit.action).toBe(ModuleAuditAction.ENABLED);
    expect(audit.changes.enabled.from).toBe(false);
    expect(audit.changes.enabled.to).toBe(true);

    // DISABLED action
    audit.action = ModuleAuditAction.DISABLED;
    audit.changes = {
      enabled: { from: true, to: false },
      disabledAt: { from: null, to: new Date().toISOString() },
      disabledBy: { from: null, to: "user-456" },
      reason: { from: null, to: "No longer needed" },
    };
    audit.notes = "Module disabled for tenant";

    expect(audit.action).toBe(ModuleAuditAction.DISABLED);
    expect(audit.changes.enabled.from).toBe(true);
    expect(audit.changes.enabled.to).toBe(false);
    expect(audit.changes.reason.to).toBe("No longer needed");

    // UPDATED action
    audit.action = ModuleAuditAction.UPDATED;
    audit.changes = {
      notes: { from: "Old notes", to: "New notes" },
      configuration: {
        from: { setting1: "old_value" },
        to: { setting1: "new_value", setting2: "added_value" },
      },
    };
    audit.notes = "Module configuration updated";

    expect(audit.action).toBe(ModuleAuditAction.UPDATED);
    expect(audit.changes.notes.from).toBe("Old notes");
    expect(audit.changes.notes.to).toBe("New notes");
    expect(audit.changes.configuration.from.setting1).toBe("old_value");
    expect(audit.changes.configuration.to.setting1).toBe("new_value");
    expect(audit.changes.configuration.to.setting2).toBe("added_value");

    // CONFIGURED action
    audit.action = ModuleAuditAction.CONFIGURED;
    audit.changes = {
      configuration: {
        from: {},
        to: {
          theme: "dark",
          layout: "compact",
          features: ["feature1", "feature2"],
        },
      },
    };
    audit.notes = "Module configuration customized";

    expect(audit.action).toBe(ModuleAuditAction.CONFIGURED);
    expect(audit.changes.configuration.from).toEqual({});
    expect(audit.changes.configuration.to.theme).toBe("dark");
    expect(audit.changes.configuration.to.layout).toBe("compact");
    expect(audit.changes.configuration.to.features).toEqual(["feature1", "feature2"]);
  });

  it("should handle empty objects", () => {
    audit.changes = {};
    audit.metadata = {};

    expect(audit.changes).toEqual({});
    expect(audit.metadata).toEqual({});
  });

  it("should handle complex nested changes", () => {
    const complexChanges = {
      configuration: {
        from: {
          ui: { theme: "light", layout: "standard" },
          features: { enabled: ["feature1"], disabled: [] },
          permissions: { read: ["user"], write: ["admin"] },
        },
        to: {
          ui: { theme: "dark", layout: "compact", sidebar: true },
          features: { enabled: ["feature1", "feature2"], disabled: ["feature3"] },
          permissions: { read: ["user", "guest"], write: ["admin"], manage: ["super_admin"] },
          newSection: { setting: "value" },
        },
      },
      metadata: {
        from: { version: "1.0", environment: "dev" },
        to: { version: "2.0", environment: "prod", region: "us-east-1" },
      },
    };

    audit.changes = complexChanges;

    expect(audit.changes.configuration.from.ui.theme).toBe("light");
    expect(audit.changes.configuration.to.ui.theme).toBe("dark");
    expect(audit.changes.configuration.to.ui.sidebar).toBe(true);
    expect(audit.changes.configuration.from.features.enabled).toEqual(["feature1"]);
    expect(audit.changes.configuration.to.features.enabled).toEqual(["feature1", "feature2"]);
    expect(audit.changes.configuration.to.features.disabled).toEqual(["feature3"]);
    expect(audit.changes.configuration.from.permissions.read).toEqual(["user"]);
    expect(audit.changes.configuration.to.permissions.read).toEqual(["user", "guest"]);
    expect(audit.changes.configuration.to.permissions.manage).toEqual(["super_admin"]);
    expect(audit.changes.configuration.to.newSection.setting).toBe("value");
    expect(audit.changes.metadata.from.version).toBe("1.0");
    expect(audit.changes.metadata.to.version).toBe("2.0");
    expect(audit.changes.metadata.to.region).toBe("us-east-1");
  });

  it("should handle array changes in audit logs", () => {
    const arrayChanges = {
      permissions: {
        from: ["read"],
        to: ["read", "write", "manage"],
      },
      dependencies: {
        from: ["user_management"],
        to: ["user_management", "classroom_management", "grades"],
      },
      exclusions: {
        from: [],
        to: ["module1", "module2"],
      },
    };

    audit.changes = arrayChanges;

    expect(audit.changes.permissions.from).toEqual(["read"]);
    expect(audit.changes.permissions.to).toEqual(["read", "write", "manage"]);
    expect(audit.changes.dependencies.from).toEqual(["user_management"]);
    expect(audit.changes.dependencies.to).toEqual([
      "user_management",
      "classroom_management",
      "grades",
    ]);
    expect(audit.changes.exclusions.from).toEqual([]);
    expect(audit.changes.exclusions.to).toEqual(["module1", "module2"]);
  });

  it("should handle timestamp changes correctly", () => {
    const timestampChanges = {
      enabledAt: {
        from: null,
        to: "2024-01-01T00:00:00.000Z",
      },
      disabledAt: {
        from: "2024-01-01T00:00:00.000Z",
        to: null,
      },
      updatedAt: {
        from: "2024-01-01T00:00:00.000Z",
        to: "2024-06-01T12:00:00.000Z",
      },
    };

    audit.changes = timestampChanges;

    expect(audit.changes.enabledAt.from).toBeNull();
    expect(audit.changes.enabledAt.to).toBe("2024-01-01T00:00:00.000Z");
    expect(audit.changes.disabledAt.from).toBe("2024-01-01T00:00:00.000Z");
    expect(audit.changes.disabledAt.to).toBeNull();
    expect(audit.changes.updatedAt.from).toBe("2024-01-01T00:00:00.000Z");
    expect(audit.changes.updatedAt.to).toBe("2024-06-01T12:00:00.000Z");
  });
});
