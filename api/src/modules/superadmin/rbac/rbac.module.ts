import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "../../../database/entities/permission.entity";
import { Role } from "../../../database/entities/role.entity";
import { User } from "../../../database/entities/user.entity";
import { RbacEvents } from "./events/rbac.events";
import { RbacController } from "./rbac.controller";
import { RbacService } from "./rbac.service";

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, User]), EventEmitterModule],
  controllers: [RbacController],
  providers: [RbacService, RbacEvents],
  exports: [RbacService],
})
export class RbacModule {}
