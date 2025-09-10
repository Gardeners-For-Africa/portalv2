import { Module } from "@nestjs/common";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { RbacModule } from "./rbac/rbac.module";
import { SchoolRegistrationModule } from "./school-registration/school-registration.module";

@Module({
  imports: [OnboardingModule, SchoolRegistrationModule, RbacModule],
  exports: [OnboardingModule, SchoolRegistrationModule, RbacModule],
})
export class SuperadminModule {}
