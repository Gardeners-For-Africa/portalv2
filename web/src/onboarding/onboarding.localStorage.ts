import { OnboardingState } from "./onboarding.constants";
import { IOnboardingStorage } from "./onboarding.storage";

const STORAGE_KEY = "onboarding_state";

export class LocalStorageAdapter implements IOnboardingStorage {
  load(): OnboardingState | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (raw as OnboardingState) : null;
  }

  save(state: OnboardingState): void {
    localStorage.setItem(STORAGE_KEY, state);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
