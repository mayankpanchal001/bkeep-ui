import { Button } from '@/components/ui/button';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    useBulkUpdateTransactions,
    type BulkUpdateTransactionsPayload,
} from '@/services/apis/transactions';
import { useState } from 'react';

export interface BulkUpdateTransactionsDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedIds: string[];
    accountOptions: ComboboxOption[];
    categoryOptions: ComboboxOption[];
    contactOptions: ComboboxOption[];
    taxOptions: ComboboxOption[];
    onSuccess?: () => void;
}

export function BulkUpdateTransactionsDrawer({
    open,
    onOpenChange,
    selectedIds,
    accountOptions,
    categoryOptions,
    contactOptions,
    taxOptions,
    onSuccess,
}: BulkUpdateTransactionsDrawerProps) {
    const { mutate: bulkUpdate, isPending } = useBulkUpdateTransactions();
    const [accountId, setAccountId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [contactId, setContactId] = useState('');
    const [taxId, setTaxId] = useState('');

    const hasAnyValue = accountId || categoryId || contactId || taxId;

    const handleSubmit = () => {
        if (!hasAnyValue || selectedIds.length === 0) return;
        const payload: BulkUpdateTransactionsPayload = {
            ids: selectedIds,
        };
        if (accountId) payload.accountId = accountId;
        if (categoryId) payload.categoryId = categoryId;
        if (contactId) payload.contactId = contactId;
        if (taxId) payload.taxIds = [taxId];
        bulkUpdate(payload, {
            onSuccess: () => {
                setAccountId('');
                setCategoryId('');
                setContactId('');
                setTaxId('');
                onSuccess?.();
                onOpenChange(false);
            },
        });
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent className="h-full w-full sm:max-w-md">
                <DrawerHeader className="border-b border-primary/10">
                    <DrawerTitle>Bulk update transactions</DrawerTitle>
                    <DrawerDescription>
                        Update account, category, contact, or tax for{' '}
                        {selectedIds.length} selected transaction
                        {selectedIds.length !== 1 ? 's' : ''}. Leave a field
                        empty to leave it unchanged.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium text-primary/70 mb-2 block">
                            Account
                        </label>
                        <Combobox
                            options={accountOptions}
                            value={accountId}
                            onChange={(value) => setAccountId(value || '')}
                            placeholder="Leave unchanged"
                            searchPlaceholder="Search account..."
                            className="h-9"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-primary/70 mb-2 block">
                            Category
                        </label>
                        <Combobox
                            options={categoryOptions}
                            value={categoryId}
                            onChange={(value) => setCategoryId(value || '')}
                            placeholder="Leave unchanged"
                            searchPlaceholder="Search category..."
                            className="h-9"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-primary/70 mb-2 block">
                            Contact
                        </label>
                        <Combobox
                            options={contactOptions}
                            value={contactId}
                            onChange={(value) => setContactId(value || '')}
                            placeholder="Leave unchanged"
                            searchPlaceholder="Search contact..."
                            className="h-9"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-primary/70 mb-2 block">
                            Tax
                        </label>
                        <Combobox
                            options={taxOptions}
                            value={taxId}
                            onChange={(value) => setTaxId(value || '')}
                            placeholder="Leave unchanged"
                            searchPlaceholder="Search tax..."
                            className="h-9"
                        />
                    </div>
                </div>
                <DrawerFooter className="border-t border-primary/10">
                    <DrawerClose asChild>
                        <Button variant="outline" disabled={isPending}>
                            Cancel
                        </Button>
                    </DrawerClose>
                    <Button
                        onClick={handleSubmit}
                        disabled={!hasAnyValue || isPending}
                    >
                        {isPending ? 'Updating...' : `Update ${selectedIds.length} transaction${selectedIds.length !== 1 ? 's' : ''}`}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

