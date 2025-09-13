import { ModuleCategory, TenantModule } from "./tenant-module.entity";

describe("TenantModule Entity", () => {
  let tenantModule: TenantModule;

  beforeEach(() => {
    tenantModule = new TenantModule();
  });

  it("should be defined", () => {
    expect(tenantModule).toBeDefined();
  });

  it("should have correct default values", () => {
    expect(tenantModule.isSystemModule).toBe(true);
    expect(tenantModule.isActive).toBe(true);
    expect(tenantModule.order).toBe(0);
    expect(tenantModule.category).toBe(ModuleCategory.ADMINISTRATIVE);
    expect(tenantModule.permissions).toEqual([]);
  });

  it("should accept valid category values", () => {
    const categories = [
      ModuleCategory.ACADEMIC,
      ModuleCategory.FINANCIAL,
      ModuleCategory.ADMINISTRATIVE,
      ModuleCategory.COMMUNICATION,
      ModuleCategory.REPORTING,
      ModuleCategory.SYSTEM,
      ModuleCategory.STUDENT_LIFE,
      ModuleCategory.HUMAN_RESOURCES,
    ];

    categories.forEach((category) => {
      tenantModule.category = category;
      expect(tenantModule.category).toBe(category);
    });
  });

  it("should handle permissions array correctly", () => {
    const permissions = ["read", "write", "manage"];
    tenantModule.permissions = permissions;
    expect(tenantModule.permissions).toEqual(permissions);
    expect(tenantModule.permissions).toHaveLength(3);
  });

  it("should handle dependencies array correctly", () => {
    const dependencies = ["user_management", "classroom_management"];
    tenantModule.dependencies = dependencies;
    expect(tenantModule.dependencies).toEqual(dependencies);
    expect(tenantModule.dependencies).toHaveLength(2);
  });

  it("should handle exclusions array correctly", () => {
    const exclusions = ["module1", "module2"];
    tenantModule.exclusions = exclusions;
    expect(tenantModule.exclusions).toEqual(exclusions);
    expect(tenantModule.exclusions).toHaveLength(2);
  });

  it("should handle configuration schema as string", () => {
    const schema = '{"type": "object", "properties": {"setting": {"type": "string"}}}';
    tenantModule.configurationSchema = schema;
    expect(tenantModule.configurationSchema).toBe(schema);
  });

  it("should handle null configuration schema", () => {
    tenantModule.configurationSchema = null;
    expect(tenantModule.configurationSchema).toBeNull();
  });

  it("should create a complete module instance", () => {
    const completeModule = new TenantModule();
    completeModule.id = "module-123";
    completeModule.code = "GRADES";
    completeModule.name = "Grades Management";
    completeModule.description = "Manage student grades and academic records";
    completeModule.icon = "GraduationCap";
    completeModule.category = ModuleCategory.ACADEMIC;
    completeModule.isSystemModule = true;
    completeModule.isActive = true;
    completeModule.order = 1;
    completeModule.permissions = ["grades:read", "grades:write", "grades:manage"];
    completeModule.dependencies = ["user_management"];
    completeModule.exclusions = [];
    completeModule.configurationSchema = '{"type": "object"}';
    completeModule.createdAt = new Date();
    completeModule.updatedAt = new Date();

    expect(completeModule.id).toBe("module-123");
    expect(completeModule.code).toBe("GRADES");
    expect(completeModule.name).toBe("Grades Management");
    expect(completeModule.description).toBe("Manage student grades and academic records");
    expect(completeModule.icon).toBe("GraduationCap");
    expect(completeModule.category).toBe(ModuleCategory.ACADEMIC);
    expect(completeModule.isSystemModule).toBe(true);
    expect(completeModule.isActive).toBe(true);
    expect(completeModule.order).toBe(1);
    expect(completeModule.permissions).toEqual(["grades:read", "grades:write", "grades:manage"]);
    expect(completeModule.dependencies).toEqual(["user_management"]);
    expect(completeModule.exclusions).toEqual([]);
    expect(completeModule.configurationSchema).toBe('{"type": "object"}');
    expect(completeModule.createdAt).toBeInstanceOf(Date);
    expect(completeModule.updatedAt).toBeInstanceOf(Date);
  });

  it("should handle boolean properties correctly", () => {
    tenantModule.isSystemModule = false;
    tenantModule.isActive = false;

    expect(tenantModule.isSystemModule).toBe(false);
    expect(tenantModule.isActive).toBe(false);
  });

  it("should handle numeric order correctly", () => {
    tenantModule.order = 10;
    expect(tenantModule.order).toBe(10);

    tenantModule.order = -1;
    expect(tenantModule.order).toBe(-1);
  });
});
