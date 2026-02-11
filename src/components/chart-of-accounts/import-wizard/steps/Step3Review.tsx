
import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../../ui/alert';
import { AccountPreviewTable } from '../components/AccountPreviewTable';
import { useImportChartOfAccountsWizardContext } from '../ImportChartOfAccountsWizardContext';
import { useImportChartOfAccountsWizard } from '../useImportChartOfAccountsWizard';

export function Step3Review() {
    const { state, actions } = useImportChartOfAccountsWizardContext();
    const { prepareReview, importFields, templatePreviewData, isTemplatePreviewLoading } =
        useImportChartOfAccountsWizard();
    const hasInitialized = useRef(false);

    // Parse accounts when entering this step (only once for file)
    useEffect(() => {
        if (!hasInitialized.current && state.importMethod === 'file') {
            hasInitialized.current = true;
            prepareReview();
        }
    }, [prepareReview, state.importMethod]);

    if (state.importMethod === 'template' && isTemplatePreviewLoading) {
        return (
            <div className="flex justify-center p-8">
                <span className="text-muted-foreground">Loading template preview...</span>
            </div>
        );
    }

    // Prepare data based on method
    let accountsToDisplay = state.parsedAccounts;
    let isReadOnly = false;

    if (state.importMethod === 'template') {
        isReadOnly = true;
        if (templatePreviewData?.data?.accounts) {
            accountsToDisplay = templatePreviewData.data.accounts.map((acc, index) => ({
                id: `template-acc-${index}`,
                rawData: acc as unknown as Record<string, unknown>,
                // Map template fields to standard keys
                accountNumber: acc.accountNumber,
                accountName: acc.accountName,
                accountType: acc.accountType,
                accountDetailType: acc.accountDetailType,
                description: acc.description,
                openingBalance: acc.openingBalance,
                currencyCode: acc.currencyCode,
                // ... other fields
            }));
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-primary">
                    Review Accounts
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {state.importMethod === 'template'
                        ? 'Review the accounts included in this template.'
                        : 'Review the parsed accounts and select which ones to import.'}
                </p>
            </div>

            {/* Warning Alert */}
            {!isReadOnly && (
                <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">
                        Before you import
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                        Please review the accounts below. Ensure columns are mapped
                        correctly.
                    </AlertDescription>
                </Alert>
            )}

            {/* Account Preview Table */}
            <AccountPreviewTable
                accounts={accountsToDisplay}
                selectedIds={state.selectedAccountIds}
                onToggleSelection={actions.toggleAccountSelection}
                onSelectAll={actions.selectAllAccounts}
                onDeselectAll={actions.deselectAllAccounts}
                importFields={importFields}
                mappedFields={state.importMethod === 'file' ? state.fieldMappings : undefined}
                readOnly={isReadOnly}
            />

            {/* Summary */}
            {!isReadOnly && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-primary">
                                {accountsToDisplay.length}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Total Accounts
                            </p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">
                                {state.selectedAccountIds.size}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Selected to Import
                            </p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-muted-foreground">
                                {accountsToDisplay.length -
                                    state.selectedAccountIds.size}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Will be Skipped
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* For Template Summary */}
            {state.importMethod === 'template' && templatePreviewData?.data?.summary && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-primary">
                                {templatePreviewData.data.summary.totalAccounts}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Total Accounts
                            </p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">
                                {templatePreviewData.data.summary.newAccounts}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                New Accounts
                            </p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">
                                {templatePreviewData.data.summary.skippedAccounts}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Will separate/skipped
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
