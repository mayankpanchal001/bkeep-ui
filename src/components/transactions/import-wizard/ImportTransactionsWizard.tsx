import { X } from 'lucide-react';
import { Button } from '../../ui/button';
import { ImportWizardProvider } from './ImportWizardContext';
import { StepIndicator } from './StepIndicator';
import {
    Step1Upload,
    Step2Account,
    Step3FileSetup,
    Step4ReviewSelect,
    Step5Results,
} from './steps';
import { useImportWizard } from './useImportWizard';

interface ImportTransactionsWizardProps {
    onClose: () => void;
}

function WizardContent({ onClose }: ImportTransactionsWizardProps) {
    const {
        state,
        actions,
        canProceed,
        handleImport,
        importMutation,
        prepareReview,
    } = useImportWizard();

    const handleNext = () => {
        if (state.currentStep === 3) {
            // Prepare transactions for review before going to step 4
            prepareReview();
        }
        if (state.currentStep === 4) {
            // Start import
            handleImport();
            return;
        }
        actions.nextStep();
    };

    const handleBack = () => {
        actions.prevStep();
    };

    const handleClose = () => {
        if (importMutation.isPending) return;
        actions.reset();
        onClose();
    };

    const isLoading = importMutation.isPending || state.isLoading;
    const showBackButton = state.currentStep > 1 && state.currentStep < 5;
    const showNextButton = state.currentStep < 5;
    const showDoneButton = state.currentStep === 5 && !state.isLoading;

    const getNextButtonText = () => {
        if (state.currentStep === 4) return 'Import';
        return 'Continue';
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border">
                <h2 className="text-lg md:text-xl font-medium text-primary">
                    Import Transactions
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

            {/* Mobile/Tablet: Horizontal Step Indicator on top */}
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
                        {state.currentStep === 1 && <Step1Upload />}
                        {state.currentStep === 2 && <Step2Account />}
                        {state.currentStep === 3 && <Step3FileSetup />}
                        {state.currentStep === 4 && <Step4ReviewSelect />}
                        {state.currentStep === 5 && <Step5Results />}
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
                                {state.currentStep === 5 ? 'Close' : 'Cancel'}
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

export function ImportTransactionsWizard({
    onClose,
}: ImportTransactionsWizardProps) {
    return (
        <ImportWizardProvider>
            <WizardContent onClose={onClose} />
        </ImportWizardProvider>
    );
}
