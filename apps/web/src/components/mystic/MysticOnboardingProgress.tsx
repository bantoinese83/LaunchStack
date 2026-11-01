import {
  MYSTIC_ONBOARDING_STEP_HINT,
  MYSTIC_ONBOARDING_STEP_LABEL,
  MYSTIC_ONBOARDING_STEPS,
  mysticOnboardingStepIndex,
  type MysticOnboardingStep,
} from '@template/mystic';

type Props = {
  step: MysticOnboardingStep;
};

export function MysticOnboardingProgress({ step }: Props) {
  const currentIndex = mysticOnboardingStepIndex(step);

  return (
    <div
      className="space-y-2"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={MYSTIC_ONBOARDING_STEPS.length}
      aria-valuenow={currentIndex + 1}
      aria-label={`Onboarding step ${currentIndex + 1} of ${MYSTIC_ONBOARDING_STEPS.length}`}
    >
      <div className="flex gap-1.5">
        {MYSTIC_ONBOARDING_STEPS.map((id, index) => (
          <div
            key={id}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index <= currentIndex ? 'bg-gold' : 'bg-line'
            }`}
          />
        ))}
      </div>
      <p className="type-eyebrow text-muted">
        Step {currentIndex + 1} of {MYSTIC_ONBOARDING_STEPS.length} ·{' '}
        {MYSTIC_ONBOARDING_STEP_LABEL[step]}
      </p>
      <p className="text-sm font-semibold text-plum">{MYSTIC_ONBOARDING_STEP_HINT[step]}</p>
    </div>
  );
}
