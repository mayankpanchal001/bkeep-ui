import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateBill } from '@/services/apis/billsApi';
import { useChartOfAccounts } from '@/services/apis/chartsAccountApi';
import { useContacts } from '@/services/apis/contactsApi';
import { useActiveTaxes } from '@/services/apis/taxApi';
import { CreateBillPayload } from '@/types/bill';
import { showSuccessToast } from '@/utills/toast';
import { cn } from '@/utils/cn';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Copy,
    GripVertical,
    Pencil,
    Plus,
    Settings,
    Trash2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';
import Input from '../../components/ui/input';

const lineItemSchema = z.object({
    accountId: z.string().optional(),
    description: z.string().min(1, 'Required'),
    amount: z.number().min(0),
    taxId: z.string().optional(),
});

const formSchema = z.object({
    supplierId: z.string().min(1, 'Choose a supplier'),
    mailingAddress: z.string().optional(),
    terms: z.string().optional(),
    billDate: z.string().min(1, 'Required'),
    dueDate: z.string().min(1, 'Required'),
    billNo: z.string().optional(),
    amountsAre: z.enum(['exclusive', 'inclusive']),
    lineItems: z.array(lineItemSchema).min(1, 'Add at least one line'),
    memo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TERMS_OPTIONS = [
    { value: 'due_on_receipt', label: 'Due on receipt' },
    { value: 'net_15', label: 'Net 15' },
    { value: 'net_30', label: 'Net 30' },
    { value: 'net_45', label: 'Net 45' },
    { value: 'net_60', label: 'Net 60' },
];

const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

const CreateBillpage = () => {
    const navigate = useNavigate();
    const [balanceDue] = useState(0);

    const { data: contactsData } = useContacts({
        type: 'supplier',
        isActive: true,
        limit: 100,
    });
    const { data: accountsData } = useChartOfAccounts({
        accountType: 'expense',
        isActive: true,
        limit: 100,
    });
    const { data: taxesData } = useActiveTaxes();

    const supplierOptions = useMemo(() => {
        const items = contactsData?.data?.items ?? [];
        return items.map((c) => ({
            value: c.id,
            label: c.displayName || c.companyName || c.id,
        }));
    }, [contactsData]);

    const categoryOptions = useMemo(() => {
        const items = accountsData?.data?.items ?? [];
        return items.map((a) => ({
            value: a.id,
            label: `${a.accountNumber} – ${a.accountName}`,
        }));
    }, [accountsData]);

    const taxOptions = useMemo(() => {
        const items = taxesData?.data?.items ?? [];
        return items.map((t) => ({
            value: t.id,
            label: `${t.name}${t.rate != null ? ` (${t.rate}%)` : ''}`,
        }));
    }, [taxesData]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            supplierId: '',
            mailingAddress: '',
            terms: '',
            billDate: new Date().toISOString().slice(0, 10),
            dueDate: new Date().toISOString().slice(0, 10),
            billNo: '',
            amountsAre: 'exclusive',
            lineItems: [
                {
                    accountId: '',
                    description: '',
                    amount: 0,
                    taxId: '',
                },
            ],
            memo: '',
        },
    });

    const { fields, append, remove, replace, insert, move } = useFieldArray({
        control: form.control,
        name: 'lineItems',
    });

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const createBill = useCreateBill();

    const lineItems = form.watch('lineItems');
    const subtotal = useMemo(
        () =>
            lineItems.reduce(
                (sum, item) => sum + (Number(item.amount) || 0),
                0
            ),
        [lineItems]
    );
    const total = subtotal;

    const onSubmit = useCallback(
        async (data: FormValues, options?: { andNew?: boolean }) => {
            const payload: CreateBillPayload = {
                supplierId: data.supplierId,
                billDate: data.billDate,
                dueDate: data.dueDate,
                amount: total,
                mailingAddress: data.mailingAddress || undefined,
                terms: data.terms || undefined,
                billNo: data.billNo || undefined,
                memo: data.memo || undefined,
                lineItems: data.lineItems.map((item) => ({
                    description: item.description,
                    amount: item.amount,
                    accountId: item.accountId || undefined,
                })),
            };
            try {
                await createBill.mutateAsync(payload);
                showSuccessToast('Bill created successfully');
                if (options?.andNew) {
                    form.reset({
                        supplierId: data.supplierId,
                        mailingAddress: '',
                        terms: data.terms,
                        billDate: new Date().toISOString().slice(0, 10),
                        dueDate: new Date().toISOString().slice(0, 10),
                        billNo: '',
                        amountsAre: 'exclusive',
                        lineItems: [
                            {
                                accountId: '',
                                description: '',
                                amount: 0,
                                taxId: '',
                            },
                        ],
                        memo: '',
                    });
                } else {
                    navigate('/expenses/bills');
                }
            } catch {
                // Error toast handled in mutation
            }
        },
        [total, createBill, navigate, form]
    );

    const addLine = useCallback(() => {
        append({
            accountId: '',
            description: '',
            amount: 0,
            taxId: '',
        });
    }, [append]);

    const clearAllLines = useCallback(() => {
        replace([
            {
                accountId: '',
                description: '',
                amount: 0,
                taxId: '',
            },
        ]);
    }, [replace]);

    const duplicateLine = useCallback(
        (index: number) => {
            const current = form.getValues(`lineItems.${index}`);
            if (current) {
                insert(index + 1, {
                    accountId: current.accountId ?? '',
                    description: current.description ?? '',
                    amount: current.amount ?? 0,
                    taxId: current.taxId ?? '',
                });
            }
        },
        [form, insert]
    );

    const handleDragStart = useCallback((index: number) => {
        setDraggedIndex(index);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedIndex(null);
    }, []);

    const handleDragOver = useCallback(
        (e: React.DragEvent, dropIndex: number) => {
            e.preventDefault();
            if (draggedIndex === null || draggedIndex === dropIndex) return;
            move(draggedIndex, dropIndex);
            setDraggedIndex(dropIndex);
        },
        [draggedIndex, move]
    );

    return (
        <div className="flex flex-col gap-6 w-full mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                    <div className="text-right text-sm">
                        <div className="text-muted-foreground">BALANCE DUE</div>
                        <div className="font-medium text-primary">
                            {CURRENCY_FORMAT.format(balanceDue)}
                        </div>
                    </div>
                </div>
            </div>

            <form
                onSubmit={form.handleSubmit((data) => onSubmit(data))}
                className="flex flex-col gap-6"
            >
                {/* Bill details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="supplier">Supplier</Label>
                        <Combobox
                            options={supplierOptions}
                            value={form.watch('supplierId')}
                            onChange={(v) => form.setValue('supplierId', v)}
                            placeholder="Choose a supplier"
                            searchPlaceholder="Search suppliers..."
                            emptyText="No suppliers found."
                            className="border-primary"
                        />
                        {form.formState.errors.supplierId && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.supplierId.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mailingAddress">Mailing address</Label>
                        <Textarea
                            id="mailingAddress"
                            placeholder="Mailing address"
                            rows={2}
                            className="resize-none"
                            {...form.register('mailingAddress')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Terms</Label>
                        <Select
                            value={form.watch('terms')}
                            onValueChange={(v) => form.setValue('terms', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Terms" />
                            </SelectTrigger>
                            <SelectContent>
                                {TERMS_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="billDate">Bill date</Label>
                        <Input
                            id="billDate"
                            type="date"
                            {...form.register('billDate')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due date</Label>

                        <Input
                            id="dueDate"
                            type="date"
                            {...form.register('dueDate')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="billNo">Bill no.</Label>
                        <input
                            id="billNo"
                            type="text"
                            placeholder="Bill no."
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            {...form.register('billNo')}
                        />
                    </div>
                </div>

                {/* Line items */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label>Amounts are</Label>
                            <Select
                                value={form.watch('amountsAre')}
                                onValueChange={(v: 'exclusive' | 'inclusive') =>
                                    form.setValue('amountsAre', v)
                                }
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="exclusive">
                                        Exclusive of Tax
                                    </SelectItem>
                                    <SelectItem value="inclusive">
                                        Inclusive of Tax
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button type="button" variant="ghost" size="icon">
                                <Copy className="size-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon">
                                <Pencil className="size-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon">
                                <Settings className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="w-10 p-2" />
                                    <th className="w-8 p-2 text-left font-medium text-muted-foreground">
                                        #
                                    </th>
                                    <th className="p-2 text-left font-medium text-muted-foreground">
                                        CATEGORY
                                    </th>
                                    <th className="p-2 text-left font-medium text-muted-foreground">
                                        DESCRIPTION
                                    </th>
                                    <th className="p-2 text-right font-medium text-muted-foreground">
                                        AMOUNT
                                    </th>
                                    <th className="p-2 text-left font-medium text-muted-foreground">
                                        SALES TAX
                                    </th>
                                    <th className="w-24 p-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => (
                                    <tr
                                        key={field.id}
                                        draggable={index > 0}
                                        onDragStart={(e) => {
                                            if (index > 0) {
                                                handleDragStart(index);
                                                e.dataTransfer.effectAllowed =
                                                    'move';
                                                e.dataTransfer.setData(
                                                    'text/plain',
                                                    String(index)
                                                );
                                            }
                                        }}
                                        onDragOver={(e) => {
                                            if (index > 0)
                                                handleDragOver(e, index);
                                        }}
                                        onDragEnd={handleDragEnd}
                                        className={cn(
                                            'border-b border-border last:border-0 transition-colors',
                                            draggedIndex === index &&
                                                'opacity-50 bg-muted/50'
                                        )}
                                    >
                                        <td className="p-1 w-10 align-middle">
                                            {index === 0 ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8 rounded-full border-primary text-primary hover:bg-primary/10 hover:text-primary"
                                                    onClick={addLine}
                                                    aria-label="Add line"
                                                >
                                                    <Plus className="size-4" />
                                                </Button>
                                            ) : (
                                                <div
                                                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                                                    title="Drag to reorder"
                                                >
                                                    <GripVertical className="size-4" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-2 text-muted-foreground align-middle">
                                            {index + 1}
                                        </td>
                                        <td className="p-2 align-middle">
                                            <Select
                                                value={form.watch(
                                                    `lineItems.${index}.accountId`
                                                )}
                                                onValueChange={(v) =>
                                                    form.setValue(
                                                        `lineItems.${index}.accountId`,
                                                        v
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-8 border-0 shadow-none bg-transparent">
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categoryOptions.map(
                                                        (opt) => (
                                                            <SelectItem
                                                                key={opt.value}
                                                                value={
                                                                    opt.value
                                                                }
                                                            >
                                                                {opt.label}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                className="flex h-8 w-full rounded border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                {...form.register(
                                                    `lineItems.${index}.description`
                                                )}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                placeholder="0.00"
                                                className="flex h-8 w-full rounded border border-input bg-transparent px-2 text-sm text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                {...form.register(
                                                    `lineItems.${index}.amount`,
                                                    {
                                                        valueAsNumber: true,
                                                    }
                                                )}
                                            />
                                        </td>
                                        <td className="p-2 align-middle">
                                            <Select
                                                value={
                                                    form.watch(
                                                        `lineItems.${index}.taxId`
                                                    ) || 'none'
                                                }
                                                onValueChange={(v) =>
                                                    form.setValue(
                                                        `lineItems.${index}.taxId`,
                                                        v === 'none' ? '' : v
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-8 border-0 shadow-none bg-transparent min-w-[100px]">
                                                    <SelectValue placeholder="Tax" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        None
                                                    </SelectItem>
                                                    {taxOptions.map((opt) => (
                                                        <SelectItem
                                                            key={opt.value}
                                                            value={opt.value}
                                                        >
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7"
                                                    onClick={() =>
                                                        duplicateLine(index)
                                                    }
                                                    aria-label="Duplicate line"
                                                >
                                                    <Copy className="size-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        remove(index)
                                                    }
                                                    disabled={
                                                        fields.length === 1
                                                    }
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addLine}
                        >
                            Add lines
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearAllLines}
                        >
                            Clear all lines
                        </Button>
                    </div>
                </div>

                {/* Summary */}
                <div className="flex flex-col items-end gap-1 max-w-xs ml-auto">
                    <div className="flex justify-between w-full text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{CURRENCY_FORMAT.format(subtotal)}</span>
                    </div>
                    <div className="flex justify-between w-full text-sm font-medium">
                        <span>Total</span>
                        <span>{CURRENCY_FORMAT.format(total)}</span>
                    </div>
                </div>

                {/* Memo & Attachments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="memo">Memo</Label>
                        <Textarea
                            id="memo"
                            placeholder="Memo"
                            rows={3}
                            className="resize-none"
                            {...form.register('memo')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Attachments</Label>
                        <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                            <p className="font-medium text-primary mb-1">
                                Add attachment
                            </p>
                            <p className="text-xs mb-2">Max file size: 20 MB</p>
                            <div className="flex gap-2 justify-center">
                                <button
                                    type="button"
                                    className="text-primary hover:underline text-xs"
                                >
                                    Show existing
                                </button>
                                <button
                                    type="button"
                                    className="text-primary hover:underline text-xs"
                                >
                                    Privacy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur py-3 px-4 z-10">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        <Button type="button" variant="outline" asChild>
                            <Link to="/expenses/bills">Cancel</Link>
                        </Button>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                className="text-sm text-primary hover:underline"
                            >
                                Print
                            </button>
                            <button
                                type="button"
                                className="text-sm text-primary hover:underline"
                            >
                                Make recurring
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="submit"
                                disabled={createBill.isPending}
                            >
                                Save
                            </Button>
                            <Button
                                type="button"
                                disabled={createBill.isPending}
                                onClick={form.handleSubmit((data) =>
                                    onSubmit(data, { andNew: true })
                                )}
                            >
                                Save and new
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateBillpage;
