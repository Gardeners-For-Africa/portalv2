import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { ModuleCategory } from "../../database/entities/tenant-module.entity";

export class CreateTenantModuleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  icon: string;

  @IsEnum(ModuleCategory)
  category: ModuleCategory;

  @IsOptional()
  @IsBoolean()
  isSystemModule?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @IsOptional()
  @IsString()
  configurationSchema?: string;
}

export class UpdateTenantModuleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsEnum(ModuleCategory)
  category?: ModuleCategory;

  @IsOptional()
  @IsBoolean()
  isSystemModule?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @IsOptional()
  @IsString()
  configurationSchema?: string;
}

export class EnableModuleDto {
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}

export class DisableModuleDto {
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class BulkModuleUpdateDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  moduleIds: string[];

  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ModuleFiltersDto {
  @IsOptional()
  @IsEnum(ModuleCategory)
  category?: ModuleCategory;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class AuditFiltersDto {
  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class ValidateModuleConfigurationDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  moduleIds: string[];
}
