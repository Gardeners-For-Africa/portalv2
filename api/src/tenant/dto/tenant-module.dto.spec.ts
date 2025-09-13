import { validate } from "class-validator";
import { ModuleCategory } from "../../database/entities/tenant-module.entity";
import {
  AuditFiltersDto,
  BulkModuleUpdateDto,
  CreateTenantModuleDto,
  DisableModuleDto,
  EnableModuleDto,
  ModuleFiltersDto,
  UpdateTenantModuleDto,
  ValidateModuleConfigurationDto,
} from "./tenant-module.dto";

describe("Tenant Module DTOs", () => {
  describe("CreateTenantModuleDto", () => {
    it("should pass validation with valid data", async () => {
      const dto = new CreateTenantModuleDto();
      dto.code = "TEST_MODULE";
      dto.name = "Test Module";
      dto.description = "A test module for validation";
      dto.icon = "TestIcon";
      dto.category = ModuleCategory.ACADEMIC;
      dto.isSystemModule = true;
      dto.isActive = true;
      dto.order = 1;
      dto.permissions = ["test:read", "test:write"];
      dto.dependencies = ["user_management"];
      dto.exclusions = [];
      dto.configurationSchema = '{"type": "object"}';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation with missing required fields", async () => {
      const dto = new CreateTenantModuleDto();
      // Missing all required fields

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === "code")).toBe(true);
      expect(errors.some((e) => e.property === "name")).toBe(true);
      expect(errors.some((e) => e.property === "description")).toBe(true);
      expect(errors.some((e) => e.property === "icon")).toBe(true);
      expect(errors.some((e) => e.property === "category")).toBe(true);
    });

    it("should fail validation with invalid code length", async () => {
      const dto = new CreateTenantModuleDto();
      dto.code = "X"; // Too short
      dto.name = "Test Module";
      dto.description = "A test module";
      dto.icon = "TestIcon";
      dto.category = ModuleCategory.ACADEMIC;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "code" && e.constraints?.minLength)).toBe(true);
    });

    it("should fail validation with code too long", async () => {
      const dto = new CreateTenantModuleDto();
      dto.code = "A".repeat(51); // Too long
      dto.name = "Test Module";
      dto.description = "A test module";
      dto.icon = "TestIcon";
      dto.category = ModuleCategory.ACADEMIC;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "code" && e.constraints?.maxLength)).toBe(true);
    });

    it("should fail validation with invalid category", async () => {
      const dto = new CreateTenantModuleDto();
      dto.code = "TEST_MODULE";
      dto.name = "Test Module";
      dto.description = "A test module";
      dto.icon = "TestIcon";
      dto.category = "invalid_category" as any;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "category" && e.constraints?.isEnum)).toBe(true);
    });

    it("should pass validation with valid permissions array", async () => {
      const dto = new CreateTenantModuleDto();
      dto.code = "TEST_MODULE";
      dto.name = "Test Module";
      dto.description = "A test module";
      dto.icon = "TestIcon";
      dto.category = ModuleCategory.ACADEMIC;
      dto.permissions = ["read", "write", "manage"];

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation with non-string permissions", async () => {
      const dto = new CreateTenantModuleDto();
      dto.code = "TEST_MODULE";
      dto.name = "Test Module";
      dto.description = "A test module";
      dto.icon = "TestIcon";
      dto.category = ModuleCategory.ACADEMIC;
      dto.permissions = [123, "write"] as any;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "permissions")).toBe(true);
    });
  });

  describe("UpdateTenantModuleDto", () => {
    it("should pass validation with partial data", async () => {
      const dto = new UpdateTenantModuleDto();
      dto.name = "Updated Module Name";
      dto.description = "Updated description";

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should pass validation with empty object", async () => {
      const dto = new UpdateTenantModuleDto();

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation with invalid category", async () => {
      const dto = new UpdateTenantModuleDto();
      dto.category = "invalid_category" as any;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "category" && e.constraints?.isEnum)).toBe(true);
    });

    it("should fail validation with invalid boolean values", async () => {
      const dto = new UpdateTenantModuleDto();
      dto.isActive = "not_a_boolean" as any;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "isActive" && e.constraints?.isBoolean)).toBe(true);
    });
  });

  describe("EnableModuleDto", () => {
    it("should pass validation with valid data", async () => {
      const dto = new EnableModuleDto();
      dto.moduleId = "module-123";
      dto.notes = "Enabling for new academic year";
      dto.configuration = { setting1: "value1" };

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation with missing moduleId", async () => {
      const dto = new EnableModuleDto();
      dto.notes = "Some notes";

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "moduleId" && e.constraints?.isNotEmpty)).toBe(true);
    });

    it("should fail validation with empty moduleId", async () => {
      const dto = new EnableModuleDto();
      dto.moduleId = "";

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "moduleId" && e.constraints?.isNotEmpty)).toBe(true);
    });

    it("should pass validation without optional fields", async () => {
      const dto = new EnableModuleDto();
      dto.moduleId = "module-123";

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe("DisableModuleDto", () => {
    it("should pass validation with valid data", async () => {
      const dto = new DisableModuleDto();
      dto.moduleId = "module-123";
      dto.reason = "No longer needed for this tenant";

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation with missing moduleId", async () => {
      const dto = new DisableModuleDto();
      dto.reason = "Some reason";

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "moduleId" && e.constraints?.isNotEmpty)).toBe(true);
    });

    it("should pass validation without optional reason", async () => {
      const dto = new DisableModuleDto();
      dto.moduleId = "module-123";

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe("BulkModuleUpdateDto", () => {
    it("should pass validation with valid data", async () => {
      const dto = new BulkModuleUpdateDto();
      dto.moduleIds = ["module-1", "module-2", "module-3"];
      dto.enabled = true;
      dto.notes = "Bulk enabling modules";

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation with empty moduleIds array", async () => {
      const dto = new BulkModuleUpdateDto();
      dto.moduleIds = [];
      dto.enabled = true;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "moduleIds" && e.constraints?.arrayNotEmpty)).toBe(
        true,
      );
    });

    it("should fail validation with non-string moduleIds", async () => {
      const dto = new BulkModuleUpdateDto();
      dto.moduleIds = [123, "module-2"] as any;
      dto.enabled = true;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "moduleIds")).toBe(true);
    });

    it("should fail validation with missing enabled field", async () => {
      const dto = new BulkModuleUpdateDto();
      dto.moduleIds = ["module-1"];

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "enabled" && e.constraints?.isBoolean)).toBe(true);
    });

    it("should pass validation without optional notes", async () => {
      const dto = new BulkModuleUpdateDto();
      dto.moduleIds = ["module-1"];
      dto.enabled = false;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe("ModuleFiltersDto", () => {
    it("should pass validation with all fields", async () => {
      const dto = new ModuleFiltersDto();
      dto.category = ModuleCategory.ACADEMIC;
      dto.isEnabled = true;
      dto.search = "grades";
      dto.page = 1;
      dto.limit = 20;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should pass validation with empty object", async () => {
      const dto = new ModuleFiltersDto();

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation with invalid category", async () => {
      const dto = new ModuleFiltersDto();
      dto.category = "invalid_category" as any;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "category" && e.constraints?.isEnum)).toBe(true);
    });

    it("should fail validation with invalid boolean isEnabled", async () => {
      const dto = new ModuleFiltersDto();
      dto.isEnabled = "not_a_boolean" as any;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "isEnabled" && e.constraints?.isBoolean)).toBe(true);
    });

    it("should fail validation with negative page", async () => {
      const dto = new ModuleFiltersDto();
      dto.page = -1;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "page" && e.constraints?.min)).toBe(true);
    });

    it("should fail validation with zero limit", async () => {
      const dto = new ModuleFiltersDto();
      dto.limit = 0;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "limit" && e.constraints?.min)).toBe(true);
    });
  });

  describe("AuditFiltersDto", () => {
    it("should pass validation with all fields", async () => {
      const dto = new AuditFiltersDto();
      dto.moduleId = "module-123";
      dto.action = "enabled";
      dto.userId = "user-123";
      dto.dateFrom = "2024-01-01";
      dto.dateTo = "2024-12-31";
      dto.page = 1;
      dto.limit = 20;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should pass validation with empty object", async () => {
      const dto = new AuditFiltersDto();

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation with invalid page", async () => {
      const dto = new AuditFiltersDto();
      dto.page = "not_a_number" as any;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "page" && e.constraints?.isNumber)).toBe(true);
    });

    it("should fail validation with invalid limit", async () => {
      const dto = new AuditFiltersDto();
      dto.limit = "not_a_number" as any;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "limit" && e.constraints?.isNumber)).toBe(true);
    });
  });

  describe("ValidateModuleConfigurationDto", () => {
    it("should pass validation with valid module IDs", async () => {
      const dto = new ValidateModuleConfigurationDto();
      dto.moduleIds = ["module-1", "module-2", "module-3"];

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation with empty moduleIds array", async () => {
      const dto = new ValidateModuleConfigurationDto();
      dto.moduleIds = [];

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "moduleIds" && e.constraints?.arrayNotEmpty)).toBe(
        true,
      );
    });

    it("should fail validation with non-string moduleIds", async () => {
      const dto = new ValidateModuleConfigurationDto();
      dto.moduleIds = [123, "module-2", null] as any;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "moduleIds")).toBe(true);
    });

    it("should pass validation with single module ID", async () => {
      const dto = new ValidateModuleConfigurationDto();
      dto.moduleIds = ["module-123"];

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe("Integration Tests", () => {
    it("should validate complete module creation workflow", async () => {
      // Create module
      const createDto = new CreateTenantModuleDto();
      createDto.code = "INTEGRATION_TEST";
      createDto.name = "Integration Test Module";
      createDto.description = "Module for integration testing";
      createDto.icon = "TestIcon";
      createDto.category = ModuleCategory.ADMINISTRATIVE;
      createDto.permissions = ["test:read", "test:write"];

      let errors = await validate(createDto);
      expect(errors).toHaveLength(0);

      // Enable module
      const enableDto = new EnableModuleDto();
      enableDto.moduleId = "integration-test-module-id";
      enableDto.notes = "Enabling for testing";
      enableDto.configuration = { testSetting: "value" };

      errors = await validate(enableDto);
      expect(errors).toHaveLength(0);

      // Bulk update
      const bulkDto = new BulkModuleUpdateDto();
      bulkDto.moduleIds = ["module-1", "module-2"];
      bulkDto.enabled = true;
      bulkDto.notes = "Bulk enabling for testing";

      errors = await validate(bulkDto);
      expect(errors).toHaveLength(0);

      // Validate configuration
      const validateDto = new ValidateModuleConfigurationDto();
      validateDto.moduleIds = ["module-1", "module-2"];

      errors = await validate(validateDto);
      expect(errors).toHaveLength(0);
    });

    it("should validate audit and filtering workflow", async () => {
      // Module filters
      const moduleFilters = new ModuleFiltersDto();
      moduleFilters.category = ModuleCategory.ACADEMIC;
      moduleFilters.isEnabled = true;
      moduleFilters.search = "grades";
      moduleFilters.page = 1;
      moduleFilters.limit = 10;

      let errors = await validate(moduleFilters);
      expect(errors).toHaveLength(0);

      // Audit filters
      const auditFilters = new AuditFiltersDto();
      auditFilters.moduleId = "module-123";
      auditFilters.action = "enabled";
      auditFilters.userId = "user-123";
      auditFilters.dateFrom = "2024-01-01";
      auditFilters.dateTo = "2024-12-31";
      auditFilters.page = 1;
      auditFilters.limit = 20;

      errors = await validate(auditFilters);
      expect(errors).toHaveLength(0);
    });
  });
});
