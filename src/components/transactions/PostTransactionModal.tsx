import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import Input from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useChartOfAccounts } from '../../services/apis/chartsAccountApi';
import {
    usePostTransaction,
    type PostTransactionPayload,
} from '../../services/apis/transactions';

const formSchema = z.object({
    counterAccountId: z.string().min(1, 'Counter Account is required'),
    entryDate: z.string().min(1, 'Entry Date is required'),
    reference: z.string().optional(),
    memo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PostTransactionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionId: string;
    transactionDate?: string;
    defaultCounterAccountId?: string;
    onSuccess?: () => void;
}

export function PostTransactionModal({
    open,
    onOpenChange,
    transactionId,
    transactionDate,
    defaultCounterAccountId,
    onSuccess,
}: PostTransactionModalProps) {
    const { mutate: postTransaction, isPending } = usePostTransaction();
    const { data: accountsData } = useChartOfAccounts({
        isActive: true,
        limit: 200,
    });

    const accounts = useMemo(
        () => accountsData?.data?.items || [],
        [accountsData]
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            counterAccountId: defaultCounterAccountId || '',
            entryDate: transactionDate
                ? new Date(transactionDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            reference: '',
            memo: '',
        },
    });

    // Reset form when transaction changes
    useEffect(() => {
        if (open) {
            form.reset({
                counterAccountId: defaultCounterAccountId || '',
                entryDate: transactionDate
                    ? new Date(transactionDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                reference: '',
                memo: '',
            });
        }
    }, [transactionId, transactionDate, defaultCounterAccountId, open, form]);

    const onSubmit = (values: FormValues) => {
        const payload: PostTransactionPayload = {
            counterAccountId: values.counterAccountId,
            entryDate: new Date(values.entryDate).toISOString(),
            reference: values.reference || undefined,
            memo: values.memo || undefined,
        };

        postTransaction(
            { id: transactionId, payload },
            {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                    onOpenChange(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Post Transaction</DialogTitle>
                    <DialogDescription>
                        Provide the required information to post this
                        transaction.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="counterAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Counter Account *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select counter account" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts.map((account) => (
                                                <SelectItem
                                                    key={account.id}
                                                    value={account.id}
                                                >
                                                    {account.accountName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="entryDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Entry Date *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={
                                                field.value
                                                    ? new Date(field.value)
                                                          .toISOString()
                                                          .split('T')[0]
                                                    : ''
                                            }
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reference</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter reference (optional)"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="memo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Memo</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter memo (optional)"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Posting...' : 'Post Transaction'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
