
import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../../ui/alert';
import { ContactPreviewTable } from '../components/ContactPreviewTable';
import { useImportContactsWizard } from '../useImportContactsWizard';

export function Step3Review() {
    const { state, actions, prepareReview, importFields } = useImportContactsWizard();
    const hasInitialized = useRef(false);

    // Parse contacts when entering this step (only once)
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            prepareReview();
        }
    }, [prepareReview]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-primary">
                    Review & Select Contacts
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Review the parsed contacts and select which ones to import
                </p>
            </div>

            {/* Warning Alert */}
            <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">
                    Before you import
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                    Please review the contacts below. Ensure columns are mapped correctly.
                </AlertDescription>
            </Alert>

            {/* Contact Preview Table */}
            <ContactPreviewTable
                contacts={state.parsedContacts}
                selectedIds={state.selectedContactIds}
                onToggleSelection={actions.toggleContactSelection}
                onSelectAll={actions.selectAllContacts}
                onDeselectAll={actions.deselectAllContacts}
                importFields={importFields}
                mappedFields={state.fieldMappings}
            />

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-primary">
                            {state.parsedContacts.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Total Contacts
                        </p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-secondary">
                            {state.selectedContactIds.size}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Selected to Import
                        </p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-muted-foreground">
                            {state.parsedContacts.length -
                                state.selectedContactIds.size}
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
