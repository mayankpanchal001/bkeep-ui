import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
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
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { CurrencyInput } from '../../pages/protected/CreateJournalEntrypage';
import { useChartOfAccounts } from '../../services/apis/chartsAccountApi';
import { useContacts } from '../../services/apis/contactsApi';
import { useTaxes } from '../../services/apis/taxApi';
import { useCreateTransaction } from '../../services/apis/transactions';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
    type: z.enum(['income', 'expense', 'transfer']),
    accountId: z.string().min(1, 'Account is required'),
    paidAt: z.string().min(1, 'Date is required'),
    amount: z.coerce.number().min(0, 'Amount must be positive'),
    currencyCode: z.string().default('CAD'),
    currencyRate: z.number().default(1),
    contactId: z.string().optional(),
    paymentMethod: z
        .enum(['cash', 'card', 'bank', 'check', 'other'])
        .optional(),
    reference: z.string().optional(),
    description: z.string().optional(),
    taxIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTransactionDrawer() {
    const [open, setOpen] = useState(false);
    const { mutate: createTransaction, isPending } = useCreateTransaction();
    const { data: accountsData } = useChartOfAccounts({
        isActive: true,
        limit: 100,
    });
    const { data: contactsData } = useContacts({ isActive: true, limit: 100 });
    const { data: taxesData } = useTaxes({ isActive: true, limit: 100 });

    const filteredAccounts = useMemo(() => {
        const items = accountsData?.data?.items;
        if (!items) return [];
        const allowedTypes = [
            'checking',
            'savings',
            'cash',
            'credit-card',
            'money-market',
        ];
        return items.filter((account) =>
            allowedTypes.includes(account.accountDetailType)
        );
    }, [accountsData]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: {
            type: 'expense',
            currencyCode: 'CAD',
            currencyRate: 1,
            paidAt: new Date().toISOString().split('T')[0],
            amount: 0,
        },
    });

    const onSubmit = (values: FormValues) => {
        // Ensure date is in ISO format with time to avoid timezone issues
        const date = new Date(values.paidAt);
        const isoDate = date.toISOString();

        createTransaction(
            {
                ...values,
                paidAt: isoDate,
                amount: Number(values.amount),
                // Handle optional fields that might be empty strings
                contactId: values.contactId || undefined,
                reference: values.reference || undefined,
                description: values.description || undefined,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    form.reset({
                        type: 'expense',
                        currencyCode: 'CAD',
                        currencyRate: 1,
                        paidAt: new Date().toISOString().split('T')[0],
                        amount: 0,
                        accountId: '',
                        contactId: '',
                        description: '',
                        reference: '',
                        paymentMethod: undefined,
                        taxIds: [],
                    });
                },
            }
        );
    };

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerTrigger asChild>
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Transaction
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-full w-[400px] sm:w-[540px]">
                <DrawerHeader>
                    <DrawerTitle>Create New Transaction</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 overflow-y-auto h-full pb-20">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="income">
                                                        Income
                                                    </SelectItem>
                                                    <SelectItem value="expense">
                                                        Expense
                                                    </SelectItem>
                                                    <SelectItem value="transfer">
                                                        Transfer
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="accountId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select account" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {filteredAccounts.map(
                                                        (account) => (
                                                            <SelectItem
                                                                key={account.id}
                                                                value={
                                                                    account.id
                                                                }
                                                            >
                                                                {
                                                                    account.accountName
                                                                }
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <CurrencyInput
                                                    placeholder="Amount"
                                                    step="0.01"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="taxIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tax</FormLabel>
                                            <Select
                                                onValueChange={(val) =>
                                                    field.onChange([val])
                                                }
                                                defaultValue={field.value?.[0]}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full overflow-hidden">
                                                        <SelectValue placeholder="Select tax" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {taxesData?.data?.items?.map(
                                                        (tax) => (
                                                            <SelectItem
                                                                key={tax.id}
                                                                value={tax.id}
                                                            >
                                                                {tax.name} (
                                                                {tax.rate * 100}
                                                                %)
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="contactId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact / Payee</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select contact" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {contactsData?.data?.items?.map(
                                                    (contact) => (
                                                        <SelectItem
                                                            key={contact.id}
                                                            value={contact.id}
                                                        >
                                                            {
                                                                contact.displayName
                                                            }
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paidAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Method</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="cash">
                                                    Cash
                                                </SelectItem>
                                                <SelectItem value="card">
                                                    Card
                                                </SelectItem>
                                                <SelectItem value="bank">
                                                    Bank Transfer
                                                </SelectItem>
                                                <SelectItem value="check">
                                                    Check
                                                </SelectItem>
                                                <SelectItem value="other">
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="h-24"
                                                placeholder="Description"
                                                {...field}
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
                                                placeholder="Ref #"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
                <DrawerFooter className="border-t border-border bg-background">
                    <div className="flex justify-end gap-3">
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isPending}
                        >
                            {isPending ? 'Creating...' : 'Create Transaction'}
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
