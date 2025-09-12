import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TypeOrmModule } from "@nestjs/typeorm";
import { School } from "../../../database/entities/school.entity";
import { User } from "../../../database/entities/user.entity";
import { AuthModule } from "../../../shared/auth/auth.module";
import { MailModule } from "../../../shared/services/mail/mail.module";
import { TeacherInvitation } from "./entities/teacher-invitation.entity";
import {
  TeacherInvitationAcceptanceController,
  TeacherInvitationController,
} from "./teacher-invitation.controller";
import { TeacherInvitationService } from "./teacher-invitation.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([TeacherInvitation, User, School]),
    EventEmitterModule,
    MailModule,
    AuthModule,
  ],
  controllers: [TeacherInvitationController, TeacherInvitationAcceptanceController],
  providers: [TeacherInvitationService],
  exports: [TeacherInvitationService],
})
export class TeacherInvitationModule {}
