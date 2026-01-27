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
import { useChartOfAccounts } from '@/services/apis/chartsAccountApi';
import { useContacts } from '@/services/apis/contactsApi';
import {
    CreateRulePayload,
    RuleCondition,
    useCreateRule,
} from '@/services/apis/rules';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Simple ID generator
const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const formSchema = z.object({
    name: z.string().min(1, 'Rule name is required'),
    description: z.string().optional(),
    transactionType: z.string(),
    accountId: z.string().optional(),
    matchType: z.enum(['all', 'any']),
    conditionField: z.string(),
    conditionOperator: z.string(),
    conditionValue: z.string(),
    conditionValueNumber: z.number().optional(),
    conditionValueNumberTo: z.number().optional(),
    conditionCaseSensitive: z.boolean().default(false),
    actionTransactionType: z.string().optional(),
    actionCategory: z.string().optional(),
    actionPayee: z.string().optional(),
    actionTax: z.string().optional(),
    autoApply: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export interface TransactionData {
    id: string;
    description: string;
    spent?: number;
    received?: number;
    category?: string;
    fromTo?: string;
    accountId?: string;
    taxId?: string;
}

interface CreateRuleDrawerProps {
    trigger?: React.ReactNode;
    transaction?: TransactionData;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateRuleDrawer({
    trigger,
    transaction,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: CreateRuleDrawerProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange || setInternalOpen;
    const { mutate: createRule, isPending } = useCreateRule();
    const { data: accountsData, isLoading: isLoadingAccounts } =
        useChartOfAccounts({
            isActive: true,
            limit: 1000,
        });
    const { data: contactsData, isLoading: isLoadingContacts } = useContacts({
        isActive: true,
        limit: 1000,
    });

    // Check if data is still loading
    const isLoadingData = isLoadingAccounts || isLoadingContacts;

    // Get accounts from API data
    const accounts = useMemo(() => {
        return accountsData?.data?.items || [];
    }, [accountsData]);

    // Get contacts from API data
    const contacts = useMemo(() => {
        return contactsData?.data?.items || [];
    }, [contactsData]);

    // Filter categories from Chart of Accounts (expense and income accounts)
    const categories = useMemo(() => {
        return accounts.filter(
            (acc) =>
                acc.accountType === 'expense' || acc.accountType === 'income'
        );
    }, [accounts]);

    // Determine transaction type based on spent/received
    const getTransactionType = (tx?: TransactionData): string => {
        if (!tx) return 'Money in';
        if (tx.received && tx.received > 0) return 'Money in';
        if (tx.spent && tx.spent > 0) return 'Money out';
        return 'any';
    };

    // Determine action transaction type
    const getActionTransactionType = (tx?: TransactionData): string => {
        if (!tx) return 'Deposit';
        if (tx.received && tx.received > 0) return 'Deposit';
        if (tx.spent && tx.spent > 0) return 'Expense';
        return 'Deposit';
    };

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: transaction
                ? `Rule for ${transaction.description.substring(0, 30)}${transaction.description.length > 30 ? '...' : ''}`
                : '',
            description: '',
            transactionType: getTransactionType(transaction),
            accountId: transaction?.accountId || 'all',
            matchType: 'all',
            conditionField: 'description',
            conditionOperator: 'contains',
            conditionValue: transaction?.description || '',
            conditionValueNumber: undefined,
            conditionValueNumberTo: undefined,
            conditionCaseSensitive: false,
            actionTransactionType: getActionTransactionType(transaction),
            actionCategory: transaction?.category || '',
            actionPayee: transaction?.fromTo || '',
            actionTax: transaction?.taxId || '',
            autoApply: false,
        },
    });

    // Update form when transaction changes
    useEffect(() => {
        if (transaction && open) {
            form.reset({
                name: `Rule for ${transaction.description.substring(0, 30)}${transaction.description.length > 30 ? '...' : ''}`,
                description: '',
                transactionType: getTransactionType(transaction),
                accountId: transaction.accountId || 'all',
                matchType: 'all',
                conditionField: 'description',
                conditionOperator: 'contains',
                conditionValue: transaction.description || '',
                conditionValueNumber: undefined,
                conditionValueNumberTo: undefined,
                conditionCaseSensitive: false,
                actionTransactionType: getActionTransactionType(transaction),
                actionCategory: transaction.category || '',
                actionPayee: transaction.fromTo || '',
                actionTax: transaction.taxId || '',
                autoApply: false,
            });
        }
    }, [transaction, open, form]);

    const onSubmit = (values: FormValues) => {
        const conditionId = generateId();
        const actionId = generateId();

        // Build condition object matching the API payload structure
        const condition: RuleCondition = {
            id: conditionId,
            field: values.conditionField,
            operator: values.conditionOperator,
            caseSensitive: values.conditionCaseSensitive || false,
        };

        // Add value fields based on condition field type
        if (values.conditionField === 'amount') {
            // For amount field, use numeric values
            if (values.conditionValueNumber !== undefined) {
                condition.valueNumber = values.conditionValueNumber;
            }
            if (values.conditionValueNumberTo !== undefined) {
                condition.valueNumberTo = values.conditionValueNumberTo;
            }
        } else {
            // For string fields (description, reference, contactId), use valueString
            if (values.conditionValue) {
                condition.valueString = values.conditionValue;
            }
        }

        const payload: CreateRulePayload = {
            name: values.name.trim(),
            description: values.description?.trim() || undefined,
            active: true,
            transactionType: values.transactionType || 'any',
            matchType: values.matchType,
            autoApply: values.autoApply,
            stopOnMatch: true,
            priority: 100,
            accountScope:
                values.accountId && values.accountId !== 'all'
                    ? 'selected'
                    : 'all',
            accountIds:
                values.accountId && values.accountId !== 'all'
                    ? [values.accountId]
                    : [],
            conditions: [condition],
            actions: [],
        };

        // Add actions based on what's filled out
        if (values.actionTransactionType) {
            payload.actions?.push({
                id: generateId(),
                actionType: 'set_type',
                payload: { type: values.actionTransactionType.toLowerCase() },
            });
        }

        if (values.actionCategory) {
            payload.actions?.push({
                id: generateId(),
                actionType: 'set_category',
                payload: { categoryId: values.actionCategory },
            });
        }

        if (values.actionPayee) {
            // Convert displayName to contactId if needed
            // Check if actionPayee is a displayName (not a UUID)
            const isDisplayName = !values.actionPayee.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            );
            let contactId = values.actionPayee;
            if (isDisplayName) {
                // Find contactId by displayName
                const contact = contacts.find(
                    (c) => c.displayName === values.actionPayee
                );
                if (contact) {
                    contactId = contact.id;
                }
            }
            payload.actions?.push({
                id: generateId(),
                actionType: 'set_contact',
                payload: { contactId },
            });
        }

        if (values.actionTax && values.actionTax !== 'none') {
            payload.actions?.push({
                id: generateId(),
                actionType: 'set_tax',
                payload: { taxId: values.actionTax },
            });
        }

        // Ensure at least one action
        if (!payload.actions || payload.actions.length === 0) {
            payload.actions = [
                {
                    id: actionId,
                    actionType: 'set_category',
                    payload: {},
                },
            ];
        }

        createRule(payload, {
            onSuccess: () => {
                form.reset({
                    name: '',
                    description: '',
                    transactionType: 'Money in',
                    accountId: 'all',
                    matchType: 'all',
                    conditionField: 'description',
                    conditionOperator: 'contains',
                    conditionValue: '',
                    conditionValueNumber: undefined,
                    conditionValueNumberTo: undefined,
                    conditionCaseSensitive: false,
                    actionTransactionType: 'Deposit',
                    actionCategory: '',
                    actionPayee: '',
                    actionTax: '',
                    autoApply: false,
                });
                setOpen(false);
            },
        });
    };

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerTrigger asChild>
                {trigger || (
                    <Button size="sm" tooltip="Create transaction rule">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Rule
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="h-full w-full sm:w-[600px]">
                <DrawerHeader className="border-b">
                    <DrawerTitle>Create rule</DrawerTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Rules only apply to unreviewed transactions.
                    </p>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto">
                    {isLoadingData ? (
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">
                                    Loading rule data...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="p-6 space-y-6"
                            >
                                {/* Basic Information Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Basic Information
                                    </h3>

                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Rule Name{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter rule name"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Description
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Describe this rule (optional)"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Apply To Section */}
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Apply To
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                            <FormLabel className="text-sm font-normal min-w-[120px] pt-2">
                                                Transaction Type
                                            </FormLabel>
                                            <FormField
                                                control={form.control}
                                                name="transactionType"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            value={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Money in">
                                                                    Money in
                                                                </SelectItem>
                                                                <SelectItem value="Money out">
                                                                    Money out
                                                                </SelectItem>
                                                                <SelectItem value="any">
                                                                    Any
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                            <FormLabel className="text-sm font-normal min-w-[120px] pt-2">
                                                Account
                                            </FormLabel>
                                            <FormField
                                                control={form.control}
                                                name="accountId"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            value={
                                                                field.value ||
                                                                'all'
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select account" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="all">
                                                                    All accounts
                                                                </SelectItem>
                                                                {accounts.map(
                                                                    (
                                                                        account
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                account.id
                                                                            }
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
                                    </div>
                                </div>

                                {/* Conditions Section */}
                                <div className="space-y-4 border-t pt-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Conditions
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add Condition
                                        </Button>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                            <FormLabel className="text-sm font-normal min-w-[120px] pt-2">
                                                Match Type
                                            </FormLabel>
                                            <FormField
                                                control={form.control}
                                                name="matchType"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            value={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="all">
                                                                    All
                                                                    conditions
                                                                    must match
                                                                </SelectItem>
                                                                <SelectItem value="any">
                                                                    Any
                                                                    condition
                                                                    can match
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                                            <div className="flex flex-col gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="conditionField"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">
                                                                Field
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                value={
                                                                    field.value
                                                                }
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="description">
                                                                        Description
                                                                    </SelectItem>
                                                                    <SelectItem value="amount">
                                                                        Amount
                                                                    </SelectItem>
                                                                    <SelectItem value="reference">
                                                                        Reference
                                                                    </SelectItem>
                                                                    <SelectItem value="contactId">
                                                                        Contact
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="conditionOperator"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">
                                                                Operator
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                value={
                                                                    field.value
                                                                }
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="contains">
                                                                        Contains
                                                                    </SelectItem>
                                                                    <SelectItem value="equals">
                                                                        Equals
                                                                    </SelectItem>
                                                                    <SelectItem value="starts_with">
                                                                        Starts
                                                                        with
                                                                    </SelectItem>
                                                                    <SelectItem value="ends_with">
                                                                        Ends
                                                                        with
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="conditionValue"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">
                                                                Value
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Enter value"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name="conditionCaseSensitive"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center gap-2">
                                                            <FormControl>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        field.value
                                                                    }
                                                                    onChange={
                                                                        field.onChange
                                                                    }
                                                                    className="rounded"
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-xs font-normal cursor-pointer">
                                                                Case sensitive
                                                            </FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Section */}
                                <div className="space-y-4 border-t pt-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Actions
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            Assign
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="actionTransactionType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-normal">
                                                        Transaction Type
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select type (optional)" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Deposit">
                                                                Deposit
                                                            </SelectItem>
                                                            <SelectItem value="Expense">
                                                                Expense
                                                            </SelectItem>
                                                            <SelectItem value="Transfer">
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
                                            name="actionCategory"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-normal">
                                                        Category
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select category (optional)" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {categories.map(
                                                                (account) => (
                                                                    <SelectItem
                                                                        key={
                                                                            account.id
                                                                        }
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

                                        <FormField
                                            control={form.control}
                                            name="actionPayee"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-normal">
                                                        Payee
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select payee (optional)" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {contacts.map(
                                                                (contact) => (
                                                                    <SelectItem
                                                                        key={
                                                                            contact.id
                                                                        }
                                                                        value={
                                                                            contact.id
                                                                        }
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
                                            name="actionTax"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-normal">
                                                        Tax
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select tax (optional)" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="none">
                                                                None
                                                            </SelectItem>
                                                            {/* Add tax options here when tax API is available */}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Auto-apply Section */}
                                <div className="space-y-4 border-t pt-6">
                                    <FormField
                                        control={form.control}
                                        name="autoApply"
                                        render={({ field }) => (
                                            <FormItem className="flex items-start gap-3">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        className="mt-1 rounded"
                                                    />
                                                </FormControl>
                                                <div className="flex-1 space-y-1">
                                                    <FormLabel className="text-sm font-normal leading-tight cursor-pointer">
                                                        Automatically confirm
                                                        transactions this rule
                                                        applies to
                                                    </FormLabel>
                                                    <p className="text-xs text-muted-foreground">
                                                        Rules will be applied
                                                        automatically when
                                                        transactions match
                                                    </p>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </form>
                        </Form>
                    )}
                </div>

                <DrawerFooter className="border-t p-4">
                    <div className="flex items-center gap-3 w-full">
                        <DrawerClose asChild className="flex-1">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </DrawerClose>
                        <Button
                            type="submit"
                            disabled={isPending || isLoadingData}
                            onClick={form.handleSubmit(onSubmit)}
                            className="flex-1"
                        >
                            {isPending ? 'Saving...' : 'Save Rule'}
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
