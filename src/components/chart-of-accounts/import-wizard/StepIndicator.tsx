import { Check } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useImportChartOfAccountsWizardContext } from './ImportChartOfAccountsWizardContext';
import { ImportStep, STEP_TITLES } from './types';

interface StepIndicatorProps {
    currentStep: ImportStep;
    orientation?: 'horizontal' | 'vertical';
    className?: string; // Added className prop to match other usage
}

const STEPS: ImportStep[] = [1, 2, 3, 4];

export function StepIndicator({
    currentStep,
    orientation = 'vertical',
    className,
}: StepIndicatorProps) {
    // Keep context just for the skipping logic if absolutely necessary,
    // but the visual style matters most.
    const { state, actions } = useImportChartOfAccountsWizardContext();

    // Helper to determine if a step should be shown as completed/active
    // Step 2 (Mapping) is skipped for Template method
    const isStepCompleted = (step: number) => {
        if (state.importMethod === 'template' && step === 2) {
            return currentStep > 2; // Step 2 is effectively "completed" automatically
        }
        return currentStep > step;
    };

    const isStepActive = (step: number) => {
        return currentStep === step;
    };

    const isStepSkipped = (step: number) => {
        return state.importMethod === 'template' && step === 2;
    };

    const handleStepClick = (step: number) => {
        if (step < currentStep) {
            actions.goToStep(step as ImportStep);
        }
    };

    if (orientation === 'horizontal') {
        return (
            <div className={cn('w-full', className)}>
                <div className="flex items-center justify-between">
                    {STEPS.map((step, index) => {
                        const isSkipped = isStepSkipped(step);
                        if (isSkipped) return null;

                        const isCompleted = isStepCompleted(step);
                        const isCurrent = isStepActive(step);
                        const isLast = index === STEPS.length - 1;
                        const isClickable = step < currentStep;

                        return (
                            <div
                                key={step}
                                className={cn(
                                    'flex items-center flex-1 last:flex-none',
                                    isClickable
                                        ? 'cursor-pointer'
                                        : 'cursor-default'
                                )}
                                onClick={() => handleStepClick(step)}
                            >
                                {/* Step circle and label */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
                                            isCompleted &&
                                                'bg-secondary border-secondary text-secondary-foreground',
                                            isCurrent &&
                                                'bg-primary border-primary text-primary-foreground',
                                            !isCompleted &&
                                                !isCurrent &&
                                                'bg-card border-border text-muted-foreground'
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <span className="text-sm font-medium">
                                                {step}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            'mt-2 text-xs font-medium text-center whitespace-nowrap',
                                            isCurrent && 'text-primary',
                                            isCompleted && 'text-secondary',
                                            !isCompleted &&
                                                !isCurrent &&
                                                'text-muted-foreground'
                                        )}
                                    >
                                        {STEP_TITLES[step]}
                                    </span>
                                </div>

                                {/* Connector line */}
                                {!isLast && (
                                    <div
                                        className={cn(
                                            'flex-1 h-0.5 mx-2 transition-all duration-200',
                                            isCompleted
                                                ? 'bg-secondary'
                                                : 'bg-border'
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Vertical layout (default)
    return (
        <div className={cn('flex flex-col', className)}>
            {STEPS.map((step, index) => {
                const isSkipped = isStepSkipped(step);
                const isCompleted = isStepCompleted(step);
                const isCurrent = isStepActive(step);
                const isLast = index === STEPS.length - 1;
                const isClickable = step < currentStep;

                return (
                    <div
                        key={step}
                        className={cn(
                            'flex',
                            isSkipped && 'opacity-50',
                            isClickable ? 'cursor-pointer' : 'cursor-default'
                        )}
                        onClick={() => handleStepClick(step)}
                    >
                        {/* Step circle and connector */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 shrink-0',
                                    isCompleted &&
                                        'bg-secondary border-secondary text-secondary-foreground',
                                    isCurrent &&
                                        'bg-primary border-primary text-primary-foreground',
                                    !isCompleted &&
                                        !isCurrent &&
                                        'bg-card border-border text-muted-foreground'
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <span className="text-sm font-medium">
                                        {step}
                                    </span>
                                )}
                            </div>

                            {/* Vertical connector line */}
                            {!isLast && (
                                <div
                                    className={cn(
                                        'w-0.5 h-12 transition-all duration-200',
                                        isCompleted
                                            ? 'bg-secondary'
                                            : 'bg-border'
                                    )}
                                />
                            )}
                        </div>

                        {/* Step label */}
                        <div className="ml-3 pt-1">
                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    isCurrent && 'text-primary',
                                    isCompleted && 'text-secondary',
                                    !isCompleted &&
                                        !isCurrent &&
                                        'text-muted-foreground'
                                )}
                            >
                                {STEP_TITLES[step]}
                            </span>
                            {isSkipped && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    (Skipped)
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
