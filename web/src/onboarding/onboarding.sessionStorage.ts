import { OnboardingState } from "./onboarding.constants";
import { IOnboardingStorage } from "./onboarding.storage";

const STORAGE_KEY = "onboarding_state";

export class SessionStorageAdapter implements IOnboardingStorage {
  load(): OnboardingState | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (raw as OnboardingState) : null;
  }

  save(state: OnboardingState): void {
    sessionStorage.setItem(STORAGE_KEY, state);
  }

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
