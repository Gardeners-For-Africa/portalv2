import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { School } from "../../../database/entities/school.entity";
import { SchoolRegistration } from "../../../database/entities/school-registration.entity";
import { Tenant } from "../../../database/entities/tenant.entity";
import { User } from "../../../database/entities/user.entity";
import { SchoolRegistrationController } from "./school-registration.controller";
import { SchoolRegistrationService } from "./school-registration.service";

@Module({
  imports: [TypeOrmModule.forFeature([SchoolRegistration, School, User, Tenant])],
  controllers: [SchoolRegistrationController],
  providers: [SchoolRegistrationService],
  exports: [SchoolRegistrationService],
})
export class SchoolRegistrationModule {}
