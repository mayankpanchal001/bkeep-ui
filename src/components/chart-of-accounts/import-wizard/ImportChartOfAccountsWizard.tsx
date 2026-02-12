import { X } from 'lucide-react';
import { Button } from '../../ui/button';
import { ImportChartOfAccountsWizardProvider } from './ImportChartOfAccountsWizardContext';
import { StepIndicator } from './StepIndicator';
import { Step1MethodAndUpload } from './steps/Step1MethodAndUpload';
import { Step2Mapping } from './steps/Step2Mapping';
import { Step3Review } from './steps/Step3Review';
import { Step4Results } from './steps/Step4Results';
import { useImportChartOfAccountsWizard } from './useImportChartOfAccountsWizard';

interface ImportChartOfAccountsWizardProps {
    onClose: () => void;
}

function WizardContent({ onClose }: ImportChartOfAccountsWizardProps) {
    const {
        state,
        actions,
        canProceed,
        handleImport,
        prepareReview,
        isTemplatePreviewLoading,
    } = useImportChartOfAccountsWizard();

    const handleNext = () => {
        if (state.currentStep === 1) {
            // If template method, skip Step 2 (Mapping)
            if (state.importMethod === 'template') {
                actions.goToStep(3);
                // Template preview is handled by hook/component state
                return;
            }
        }

        if (state.currentStep === 2) {
            // Prepare review data
            prepareReview();
        }

        if (state.currentStep === 3) {
            handleImport();
            return;
        }

        actions.nextStep();
    };

    const handleBack = () => {
        if (state.currentStep === 3) {
            if (state.importMethod === 'template') {
                actions.goToStep(1);
                return;
            }
        }
        actions.prevStep();
    };

    const handleClose = () => {
        if (state.isLoading) return;
        actions.reset();
        onClose();
    };

    const isLoading =
        state.isLoading ||
        (state.importMethod === 'template' && isTemplatePreviewLoading);
    const showBackButton = state.currentStep > 1 && state.currentStep < 4;
    const showNextButton = state.currentStep < 4;
    const showDoneButton = state.currentStep === 4 && !state.isLoading;

    const getNextButtonText = () => {
        if (state.currentStep === 3)
            return state.importMethod === 'template'
                ? 'Apply Template'
                : 'Import';
        return 'Continue';
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border">
                <h2 className="text-lg md:text-xl font-semibold text-primary">
                    Import Chart of Accounts
                </h2>
                <button
                    onClick={handleClose}
                    className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                    aria-label="Close"
                    disabled={isLoading}
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Mobile/Tablet: Horizontal Step Indicator */}
            <div className="lg:hidden px-4 py-4 border-b border-border bg-muted/30">
                <StepIndicator
                    currentStep={state.currentStep}
                    orientation="horizontal"
                />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop: Left Sidebar with Vertical Step Indicator */}
                <div className="hidden lg:block w-56 shrink-0 border-r border-border bg-muted/30 p-6">
                    <StepIndicator
                        currentStep={state.currentStep}
                        orientation="vertical"
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
                        {state.currentStep === 1 && <Step1MethodAndUpload />}
                        {state.currentStep === 2 && <Step2Mapping />}
                        {state.currentStep === 3 && <Step3Review />}
                        {state.currentStep === 4 && <Step4Results />}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 md:px-8 py-4 border-t border-border bg-card">
                        <div>
                            {showBackButton && (
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={isLoading}
                                >
                                    Back
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                {state.currentStep === 4 ? 'Close' : 'Cancel'}
                            </Button>
                            {showNextButton && (
                                <Button
                                    onClick={handleNext}
                                    disabled={!canProceed() || isLoading}
                                    loading={isLoading}
                                >
                                    {getNextButtonText()}
                                </Button>
                            )}
                            {showDoneButton && (
                                <Button onClick={handleClose}>Done</Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ImportChartOfAccountsWizard({
    onClose,
}: ImportChartOfAccountsWizardProps) {
    return (
        <ImportChartOfAccountsWizardProvider>
            <WizardContent onClose={onClose} />
        </ImportChartOfAccountsWizardProvider>
    );
}
