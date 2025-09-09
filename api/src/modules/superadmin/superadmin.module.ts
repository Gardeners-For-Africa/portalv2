import { Module } from "@nestjs/common";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { SchoolRegistrationModule } from "./school-registration/school-registration.module";

@Module({
  imports: [OnboardingModule, SchoolRegistrationModule],
  exports: [OnboardingModule, SchoolRegistrationModule],
})
export class SuperadminModule {}
