import { OnboardingEvent, OnboardingState } from "./onboarding.constants";

export const OnboardingTransitions: Record<
  OnboardingState,
  Partial<Record<OnboardingEvent, OnboardingState>>
> = {
  [OnboardingState.START]: {
    [OnboardingEvent.NEXT]: OnboardingState.PROFILE_SETUP,
  },
  [OnboardingState.PROFILE_SETUP]: {
    [OnboardingEvent.NEXT]: OnboardingState.DOCUMENT_UPLOAD,
  },
  [OnboardingState.DOCUMENT_UPLOAD]: {
    [OnboardingEvent.NEXT]: OnboardingState.VERIFICATION,
    [OnboardingEvent.FAIL]: OnboardingState.REJECTED,
  },
  [OnboardingState.VERIFICATION]: {
    [OnboardingEvent.COMPLETE]: OnboardingState.COMPLETED,
    [OnboardingEvent.FAIL]: OnboardingState.REJECTED,
  },
  [OnboardingState.REJECTED]: {
    [OnboardingEvent.RETRY]: OnboardingState.DOCUMENT_UPLOAD,
  },
  [OnboardingState.COMPLETED]: {},
};
