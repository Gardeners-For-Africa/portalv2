import { OnboardingState } from "./onboarding.constants";

export interface IOnboardingStorage {
  load(): OnboardingState | null;
  save(state: OnboardingState): void;
  clear(): void;
}
