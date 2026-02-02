import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../../ui/alert';
import { Label } from '../../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../../ui/radio-group';
import { TransactionPreviewTable } from '../components/TransactionPreviewTable';
import { useImportWizard } from '../useImportWizard';

export function Step4ReviewSelect() {
    const { state, actions, prepareReview } = useImportWizard();
    const hasInitialized = useRef(false);
    const prevReverseValue = useRef(state.isReverseValues);

    // Parse transactions when entering this step (only once)
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            prepareReview();
        }
    }, [prepareReview]);

    // Re-parse when reverse values changes
    useEffect(() => {
        if (
            hasInitialized.current &&
            prevReverseValue.current !== state.isReverseValues
        ) {
            prevReverseValue.current = state.isReverseValues;
            prepareReview();
        }
    }, [state.isReverseValues, prepareReview]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-primary">
                    Review & Select Transactions
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Review the parsed transactions and select which ones to
                    import
                </p>
            </div>

            {/* Warning Alert */}
            <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">
                    Before you import
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                    Please review the transactions below. Some data may be
                    missing if columns weren't mapped correctly. You can go back
                    to fix the mapping if needed.
                </AlertDescription>
            </Alert>

            {/* Reverse Values Option */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Amount values</Label>
                <RadioGroup
                    value={state.isReverseValues ? 'reverse' : 'original'}
                    onValueChange={(value) => {
                        actions.setIsReverseValues(value === 'reverse');
                    }}
                    className="flex gap-6"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="original" id="original" />
                        <Label
                            htmlFor="original"
                            className="font-normal cursor-pointer"
                        >
                            Keep original values
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="reverse" id="reverse" />
                        <Label
                            htmlFor="reverse"
                            className="font-normal cursor-pointer"
                        >
                            Reverse all values (flip signs)
                        </Label>
                    </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                    Some bank exports show withdrawals as positive. Use
                    "Reverse" to fix this.
                </p>
            </div>

            {/* Transaction Preview Table */}
            <TransactionPreviewTable
                transactions={state.parsedTransactions}
                selectedIds={state.selectedTransactionIds}
                onToggleSelection={actions.toggleTransactionSelection}
                onSelectAll={actions.selectAllTransactions}
                onDeselectAll={actions.deselectAllTransactions}
            />

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-primary">
                            {state.parsedTransactions.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Total Transactions
                        </p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-secondary">
                            {state.selectedTransactionIds.size}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Selected to Import
                        </p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-muted-foreground">
                            {state.parsedTransactions.length -
                                state.selectedTransactionIds.size}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Will be Skipped
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
