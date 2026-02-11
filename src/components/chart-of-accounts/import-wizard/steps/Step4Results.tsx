import { AlertTriangle, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useImportChartOfAccountsWizard } from '../useImportChartOfAccountsWizard';

export function Step4Results() {
    const { state, pollImportProgress } = useImportChartOfAccountsWizard();
    const { importResults, isLoading } = state;
    const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasStartedPolling = useRef(false);

    // Poll for import progress
    useEffect(() => {
        if (!state.importId || hasStartedPolling.current) return;

        hasStartedPolling.current = true;

        const poll = async () => {
            const isComplete = await pollImportProgress();
            if (!isComplete) {
                // Continue polling every 1.5 seconds
                pollingRef.current = setTimeout(poll, 1500);
            }
        };

        // Start polling immediately
        poll();

        // Cleanup on unmount
        return () => {
            if (pollingRef.current) {
                clearTimeout(pollingRef.current);
            }
        };
    }, [state.importId, pollImportProgress]);

    // Loading state for async import (polling) or initial submission
    if (isLoading || (!importResults && state.importId)) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="mt-4 text-lg font-medium text-primary">
                    Importing chart of accounts...
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    This may take a few moments
                </p>
            </div>
        );
    }

    if (!importResults) {
        return null;
    }

    const isSuccess = importResults.status === 'completed' && importResults.failed === 0;
    const hasFailures = importResults.failed > 0;
    const hasSkipped = importResults.skipped > 0;

    return (
        <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
            <div
                className={`flex items-center justify-center w-16 h-16 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'
                    }`}
            >
                {isSuccess ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                )}
            </div>

            <div>
                <h2 className="text-2xl font-bold text-foreground">
                    {isSuccess ? 'Import Completed' : 'Import Issues Found'}
                </h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    {isSuccess
                        ? 'Your chart of accounts has been successfully imported.'
                        : importResults.errorMessage ||
                        'There were issues importing some accounts.'}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-6">
                <div className="bg-muted p-4 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">
                        {importResults.total}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Processed
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-2xl font-bold text-green-600">
                        {importResults.created}
                    </p>
                    <p className="text-xs text-green-700/70 uppercase tracking-wide">
                        Created
                    </p>
                </div>
                <div
                    className={`${hasSkipped || hasFailures
                        ? 'bg-amber-50 border-amber-100'
                        : 'bg-muted border-transparent'
                        } p-4 rounded-lg border`}
                >
                    <p
                        className={`text-2xl font-bold ${hasSkipped || hasFailures
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                            }`}
                    >
                        {importResults.skipped + importResults.failed}
                    </p>
                    <p
                        className={`text-xs uppercase tracking-wide ${hasSkipped || hasFailures
                            ? 'text-amber-700/70'
                            : 'text-muted-foreground'
                            }`}
                    >
                        Skipped/Failed
                    </p>
                </div>
            </div>

            {hasFailures && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-lg max-w-md mx-auto">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                        <span className="font-semibold">{importResults.failed}</span> accounts failed to import.
                    </span>
                </div>
            )}
        </div>
    );
}
