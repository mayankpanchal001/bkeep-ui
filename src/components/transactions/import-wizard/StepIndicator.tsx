import { Check } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { ImportStep, STEP_TITLES } from './types';

interface StepIndicatorProps {
    currentStep: ImportStep;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

const STEPS: ImportStep[] = [1, 2, 3, 4, 5];

export function StepIndicator({
    currentStep,
    orientation = 'vertical',
    className,
}: StepIndicatorProps) {
    if (orientation === 'horizontal') {
        return (
            <div className={cn('w-full', className)}>
                <div className="flex items-center justify-between">
                    {STEPS.map((step, index) => {
                        const isCompleted = step < currentStep;
                        const isCurrent = step === currentStep;
                        const isLast = index === STEPS.length - 1;

                        return (
                            <div
                                key={step}
                                className="flex items-center flex-1 last:flex-none"
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
                const isCompleted = step < currentStep;
                const isCurrent = step === currentStep;
                const isLast = index === STEPS.length - 1;

                return (
                    <div key={step} className="flex">
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
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
