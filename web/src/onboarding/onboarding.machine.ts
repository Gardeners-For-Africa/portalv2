import { OnboardingEvent, OnboardingState } from "./onboarding.constants";
import { IOnboardingStorage } from "./onboarding.storage";
import { OnboardingTransitions } from "./onboarding.transitions";

export class OnboardingStateMachine {
  private state: OnboardingState;
  private storage?: IOnboardingStorage;

  constructor(initialState: OnboardingState = OnboardingState.START, storage?: IOnboardingStorage) {
    this.storage = storage;

    // Restore from storage if available
    const storedState = this.storage?.load();
    this.state = storedState ?? initialState;

    // Ensure it's saved on init
    this.storage?.save(this.state);
  }

  public getState(): OnboardingState {
    return this.state;
  }

  public transition(event: OnboardingEvent): OnboardingState {
    const nextState = OnboardingTransitions[this.state]?.[event];
    if (!nextState) {
      throw new Error(`Invalid transition: ${this.state} -> (${event})`);
    }
    this.state = nextState;
    this.storage?.save(this.state);
    return this.state;
  }

  public reset(): void {
    this.state = OnboardingState.START;
    this.storage?.clear();
    this.storage?.save(this.state);
  }

  public isFinal(): boolean {
    return this.state === OnboardingState.COMPLETED || this.state === OnboardingState.REJECTED;
  }
}
