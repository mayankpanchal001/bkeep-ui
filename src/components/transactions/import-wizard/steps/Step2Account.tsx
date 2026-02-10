import { Building2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../ui/select';
import { useImportWizard } from '../useImportWizard';

export function Step2Account() {
    const { state, actions, validAccounts } = useImportWizard();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-medium text-primary">
                    Which account are these transactions from?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Select the bank account or credit card these transactions
                    belong to
                </p>
            </div>

            {/* Account Selection */}
            <div className="max-w-md">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">
                        Target Account
                    </label>
                    <Select
                        value={state.targetAccountId}
                        onValueChange={actions.setTargetAccountId}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an account..." />
                        </SelectTrigger>
                        <SelectContent>
                            {validAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                        <span>{account.accountName}</span>
                                        <span className="text-xs text-muted-foreground ml-auto">
                                            {account.accountDetailType ||
                                                account.accountType}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Selected Account Info */}
            {state.targetAccountId && (
                <div className="bg-muted/50 rounded-lg p-4">
                    {(() => {
                        const selected = validAccounts.find(
                            (a) => a.id === state.targetAccountId
                        );
                        if (!selected) return null;
                        return (
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-primary">
                                        {selected.accountName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {selected.accountDetailType ||
                                            selected.accountType}
                                    </p>
                                    {selected.accountNumber && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Code: {selected.accountNumber}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Empty State */}
            {validAccounts.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                        No eligible accounts found. Please create a bank account
                        or credit card account first.
                    </p>
                </div>
            )}
        </div>
    );
}
