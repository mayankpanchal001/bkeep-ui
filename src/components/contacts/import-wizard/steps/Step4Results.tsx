import { AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../../ui/alert';
import { useImportContactsWizard } from '../useImportContactsWizard';

export function Step4Results() {
    const { state, pollImportProgress } = useImportContactsWizard();
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

    const { importResults, isLoading } = state;

    // Loading state
    if (isLoading || !importResults) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="mt-4 text-lg font-medium text-primary">
                        Importing contacts...
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        This may take a few moments
                    </p>
                </div>
            </div>
        );
    }

    const isSuccess =
        importResults.status === 'completed' && importResults.failed === 0;
    const hasWarnings =
        importResults.status === 'completed' && importResults.failed > 0;
    const isFailed = importResults.status === 'failed';

    return (
        <div className="space-y-6">
            {/* Header with Status */}
            {isSuccess && (
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <AlertTitle className="text-green-800">
                        Import Successful
                    </AlertTitle>
                    <AlertDescription className="text-green-700">
                        All {importResults.created} contacts were imported
                        successfully.
                    </AlertDescription>
                </Alert>
            )}

            {hasWarnings && (
                <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="text-amber-800">
                        Import Completed with Warnings
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                        {importResults.created} contacts imported,{' '}
                        {importResults.failed} failed.
                    </AlertDescription>
                </Alert>
            )}

            {isFailed && (
                <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <AlertTitle className="text-red-800">
                        Import Failed
                    </AlertTitle>
                    <AlertDescription className="text-red-700">
                        {importResults.errorMessage ||
                            'The import process failed. Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">
                        {importResults.total}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Total Rows
                    </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">
                        {importResults.created}
                    </p>
                    <p className="text-sm text-green-700 mt-1">Imported</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-amber-600">
                        {importResults.skipped}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">Skipped</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">
                        {importResults.failed}
                    </p>
                    <p className="text-sm text-red-700 mt-1">Failed</p>
                </div>
            </div>

            {/* Error Details */}
            {importResults.errorMessage &&
                importResults.status === 'failed' && (
                    <div className="space-y-3">
                        <h3 className="font-medium text-primary">
                            Error Details
                        </h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700">
                                {importResults.errorMessage}
                            </p>
                        </div>
                    </div>
                )}

            {/* Success Message */}
            {isSuccess && (
                <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                        Your contacts have been imported and are ready to use.
                    </p>
                </div>
            )}
        </div>
    );
}
