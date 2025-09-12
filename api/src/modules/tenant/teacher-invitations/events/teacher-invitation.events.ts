import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class TeacherInvitationEvents {
  @OnEvent("teacher.invitation.created")
  handleInvitationCreated(payload: { invitation: any; tenantId: string }) {
    console.log(
      `Teacher invitation created: ${payload.invitation.email} for school ${payload.invitation.schoolId}`,
    );
    // Add any additional logic here (e.g., audit logging, notifications)
  }

  @OnEvent("teacher.invitation.updated")
  handleInvitationUpdated(payload: { invitation: any; tenantId: string }) {
    console.log(`Teacher invitation updated: ${payload.invitation.id}`);
    // Add any additional logic here
  }

  @OnEvent("teacher.invitation.resent")
  handleInvitationResent(payload: { invitation: any; tenantId: string }) {
    console.log(`Teacher invitation resent: ${payload.invitation.email}`);
    // Add any additional logic here
  }

  @OnEvent("teacher.invitation.cancelled")
  handleInvitationCancelled(payload: { invitation: any; tenantId: string }) {
    console.log(`Teacher invitation cancelled: ${payload.invitation.email}`);
    // Add any additional logic here
  }

  @OnEvent("teacher.invitation.accepted")
  handleInvitationAccepted(payload: { invitation: any; user: any; tenantId: string }) {
    console.log(
      `Teacher invitation accepted: ${payload.invitation.email} by user ${payload.user.id}`,
    );
    // Add any additional logic here (e.g., welcome email, role assignment notifications)
  }

  @OnEvent("teacher.invitation.declined")
  handleInvitationDeclined(payload: { invitation: any; tenantId: string }) {
    console.log(`Teacher invitation declined: ${payload.invitation.email}`);
    // Add any additional logic here (e.g., notify school admin)
  }

  @OnEvent("teacher.invitation.expired")
  handleInvitationExpired(payload: { invitation: any; tenantId: string }) {
    console.log(`Teacher invitation expired: ${payload.invitation.email}`);
    // Add any additional logic here (e.g., cleanup, notifications)
  }
}
