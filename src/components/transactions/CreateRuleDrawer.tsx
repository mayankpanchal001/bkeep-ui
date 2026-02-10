import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useChartOfAccounts } from '@/services/apis/chartsAccountApi';
import { useContacts } from '@/services/apis/contactsApi';
import {
    CreateRulePayload,
    Rule,
    RuleCondition,
    useCreateRule,
    useUpdateRule,
} from '@/services/apis/rules';
import { useTaxes } from '@/services/apis/taxApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    useFieldArray,
    useForm,
    UseFormReturn,
    type Resolver,
} from 'react-hook-form';
import { z } from 'zod';

// Simple ID generator
const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const conditionSchema = z.object({
    field: z.string(),
    operator: z.string(),
    value: z.string().optional(),
    valueNumber: z.number().optional(),
    valueNumberTo: z.number().optional(),
    caseSensitive: z.boolean().default(false),
});

const formSchema = z.object({
    name: z.string().min(1, 'Rule name is required'),
    description: z.string().optional(),
    transactionType: z.string(),
    accountId: z.string().optional(),
    matchType: z.enum(['all', 'any']),
    conditions: z.array(conditionSchema),
    actionType: z
        .enum([
            'set_category',
            'set_contact',
            'set_memo',
            'set_taxes',
            'set_type',
            'set_splits',
            'exclude',
        ])
        .default('set_category'),
    actionTransactionType: z.string().optional(),
    actionCategory: z.string().optional(),
    actionPayee: z.string().optional(),
    actionMemo: z.string().optional(),
    actionTaxIds: z.array(z.string()).default([]).optional(),
    splitsMode: z.enum(['none', 'percent', 'amount']).default('none'),
    splitLines: z
        .array(
            z.object({
                percent: z.number().optional(),
                amount: z.number().optional(),
                categoryId: z.string().optional(),
                description: z.string().optional(),
                taxIds: z.array(z.string()).optional(),
            })
        )
        .default([])
        .optional(),
    actionExclude: z.boolean().default(false),
    autoApply: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface Contact {
    id: string;
    displayName: string;
}

const ConditionRow = ({
    index,
    form,
    remove,
    isOnly,
    contacts,
}: {
    index: number;
    form: UseFormReturn<FormValues>;
    remove: (index: number) => void;
    isOnly: boolean;
    contacts: Contact[];
}) => {
    const fieldType = form.watch(`conditions.${index}.field`);
    const operator = form.watch(`conditions.${index}.operator`);

    return (
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg border relative">
            {!isOnly && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => remove(index)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            )}

            <div className="grid grid-cols-1 gap-3">
                {/* Field Selection */}
                <FormField
                    control={form.control}
                    name={`conditions.${index}.field`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Field</FormLabel>
                            <Select
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    // Reset operator and value when field changes
                                    form.setValue(
                                        `conditions.${index}.operator`,
                                        val === 'amount' ? 'equals' : 'contains'
                                    );
                                    form.setValue(
                                        `conditions.${index}.value`,
                                        ''
                                    );
                                    form.setValue(
                                        `conditions.${index}.valueNumber`,
                                        undefined
                                    );
                                    form.setValue(
                                        `conditions.${index}.valueNumberTo`,
                                        undefined
                                    );
                                }}
                                value={field.value}
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

                {/* Operator Selection */}
                <FormField
                    control={form.control}
                    name={`conditions.${index}.operator`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Operator</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {fieldType === 'amount' ? (
                                        <>
                                            <SelectItem value="equals">
                                                Equals
                                            </SelectItem>
                                            <SelectItem value="greater_than">
                                                Greater than
                                            </SelectItem>
                                            <SelectItem value="less_than">
                                                Less than
                                            </SelectItem>
                                            <SelectItem value="between">
                                                Between
                                            </SelectItem>
                                        </>
                                    ) : fieldType === 'contactId' ? (
                                        <SelectItem value="equals">
                                            Equals
                                        </SelectItem>
                                    ) : (
                                        <>
                                            <SelectItem value="contains">
                                                Contains
                                            </SelectItem>
                                            <SelectItem value="equals">
                                                Equals
                                            </SelectItem>
                                            <SelectItem value="starts_with">
                                                Starts with
                                            </SelectItem>
                                            <SelectItem value="ends_with">
                                                Ends with
                                            </SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Value Input */}
                {fieldType === 'amount' ? (
                    <div
                        className={
                            operator === 'between'
                                ? 'col-span-1 sm:col-span-3 grid grid-cols-2 gap-3'
                                : ''
                        }
                    >
                        <FormField
                            control={form.control}
                            name={`conditions.${index}.valueNumber`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">
                                        {operator === 'between'
                                            ? 'From Amount'
                                            : 'Amount'}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ''
                                                        ? undefined
                                                        : e.target.valueAsNumber
                                                )
                                            }
                                            placeholder="0.00"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {operator === 'between' && (
                            <FormField
                                control={form.control}
                                name={`conditions.${index}.valueNumberTo`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">
                                            To Amount
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === ''
                                                            ? undefined
                                                            : e.target
                                                                .valueAsNumber
                                                    )
                                                }
                                                placeholder="0.00"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                ) : fieldType === 'contactId' ? (
                    <FormField
                        control={form.control}
                        name={`conditions.${index}.value`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">
                                    Contact
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select contact" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {contacts.map((contact) => (
                                            <SelectItem
                                                key={contact.id}
                                                value={contact.id}
                                            >
                                                {contact.displayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <FormField
                        control={form.control}
                        name={`conditions.${index}.value`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Value</FormLabel>
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
                )}
            </div>

            {fieldType !== 'amount' && fieldType !== 'contactId' && (
                <div className="flex items-center gap-2">
                    <FormField
                        control={form.control}
                        name={`conditions.${index}.caseSensitive`}
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormLabel className="text-xs font-normal cursor-pointer">
                                    Case sensitive
                                </FormLabel>
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </div>
    );
};

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
    rule?: Rule;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
}

export function CreateRuleDrawer({
    transaction,
    rule,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    mode = 'create',
}: CreateRuleDrawerProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange || setInternalOpen;
    const { mutate: createRule, isPending } = useCreateRule();
    const { mutate: updateRule, isPending: isUpdating } = useUpdateRule();
    const { data: accountsData, isLoading: isLoadingAccounts } =
        useChartOfAccounts({
            isActive: true,
            limit: 1000,
        });
    const { data: contactsData, isLoading: isLoadingContacts } = useContacts({
        isActive: true,
        limit: 1000,
    });
    const { data: taxesData, isLoading: isLoadingTaxes } = useTaxes({
        isActive: true,
        limit: 1000,
    });

    // Check if data is still loading
    const isLoadingData =
        isLoadingAccounts || isLoadingContacts || isLoadingTaxes;

    // Get accounts from API data
    const accounts = useMemo(() => {
        return accountsData?.data?.items || [];
    }, [accountsData]);

    // Get contacts from API data
    const contacts = useMemo(() => {
        return contactsData?.data?.items || [];
    }, [contactsData]);

    // Get taxes from API data
    const taxes = useMemo(() => {
        return taxesData?.data?.items || [];
    }, [taxesData]);

    // Filter bank/cash accounts for "Apply To" section
    const bankAccounts = useMemo(() => {
        const allowed = new Set([
            'chequing',
            'savings',
            'money-market',
            'trust-account',
            'cash-on-hand',
            'undeposited-funds',
        ]);
        return accounts.filter(
            (acc) =>
                acc.accountType === 'asset' &&
                allowed.has(acc.accountDetailType as unknown as string)
        );
    }, [accounts]);

    // Filter categories from Chart of Accounts (expense and income accounts)
    const categories = useMemo(() => {
        return accounts.filter(
            (acc) =>
                acc.accountType === 'expense' || acc.accountType === 'income'
        );
    }, [accounts]);

    // Determine transaction type based on spent/received
    const getTransactionType = (tx?: TransactionData): string => {
        if (!tx) return 'any';
        if (tx.received && tx.received > 0) return 'income';
        if (tx.spent && tx.spent > 0) return 'expense';
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
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: {
            name:
                transaction && transaction.description
                    ? `Rule for ${transaction.description.substring(0, 30)}${transaction.description.length > 30 ? '...' : ''}`
                    : '',
            description: '',
            transactionType: getTransactionType(transaction),
            accountId: transaction?.accountId || 'all',
            matchType: 'all',
            conditions: [
                {
                    field: 'description',
                    operator: 'contains',
                    value: transaction?.description || '',
                    valueNumber: undefined,
                    valueNumberTo: undefined,
                    caseSensitive: false,
                },
            ],
            actionType: 'set_category',
            actionTransactionType:
                getActionTransactionType(transaction).toLowerCase() ===
                    'deposit'
                    ? 'income'
                    : 'expense',
            actionCategory: transaction?.category || '',
            actionPayee: transaction?.fromTo || '',
            actionMemo: '',
            actionTaxIds: transaction?.taxId ? [transaction.taxId] : [],
            splitsMode: 'none',
            splitLines: [],
            autoApply: false,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'conditions',
    });
    const {
        fields: splitFields,
        append: appendSplit,
        remove: removeSplit,
    } = useFieldArray({
        control: form.control,
        name: 'splitLines',
    });

    // Update form when transaction changes
    useEffect(() => {
        if (transaction && open) {
            form.reset({
                name: transaction.description
                    ? `Rule for ${transaction.description.substring(0, 30)}${transaction.description.length > 30 ? '...' : ''}`
                    : '',
                description: '',
                transactionType: getTransactionType(transaction),
                accountId: transaction.accountId || 'all',
                matchType: 'all',
                conditions: [
                    {
                        field: 'description',
                        operator: 'contains',
                        value: transaction.description || '',
                        valueNumber: undefined,
                        valueNumberTo: undefined,
                        caseSensitive: false,
                    },
                ],
                actionType: 'set_category',
                actionTransactionType:
                    getActionTransactionType(transaction).toLowerCase() ===
                        'deposit'
                        ? 'income'
                        : 'expense',
                actionCategory: transaction.category || '',
                actionPayee: transaction.fromTo || '',
                actionMemo: '',
                actionTaxIds: transaction.taxId ? [transaction.taxId] : [],
                splitsMode: 'none',
                splitLines: [],
                autoApply: false,
            });
        }
    }, [transaction, open, form]);

    const handleAddCondition = () => {
        append({
            field: 'description',
            operator: 'contains',
            value: '',
            valueNumber: undefined,
            valueNumberTo: undefined,
            caseSensitive: false,
        });
    };

    useEffect(() => {
        if (rule && open) {
            const mappedConditions =
                (rule.conditions || []).length > 0
                    ? (rule.conditions || []).map((c) => {
                        const isAmount = c.field === 'amount';
                        const vNum =
                            typeof c.valueNumber === 'string'
                                ? Number(c.valueNumber)
                                : c.valueNumber;
                        const vNumTo =
                            typeof c.valueNumberTo === 'string'
                                ? Number(c.valueNumberTo)
                                : c.valueNumberTo;
                        return {
                            field: c.field,
                            operator: c.operator,
                            value: isAmount ? undefined : c.valueString || '',
                            valueNumber: isAmount
                                ? typeof vNum === 'number' &&
                                    Number.isFinite(vNum)
                                    ? vNum
                                    : undefined
                                : undefined,
                            valueNumberTo: isAmount
                                ? typeof vNumTo === 'number' &&
                                    Number.isFinite(vNumTo)
                                    ? vNumTo
                                    : undefined
                                : undefined,
                            caseSensitive: !!c.caseSensitive,
                        };
                    })
                    : [
                        {
                            field: 'description',
                            operator: 'contains',
                            value: '',
                            valueNumber: undefined,
                            valueNumberTo: undefined,
                            caseSensitive: false,
                        },
                    ];
            const typeAction = (rule.actions || []).find(
                (a) => a.actionType === 'set_type'
            );
            const categoryAction = (rule.actions || []).find(
                (a) => a.actionType === 'set_category'
            );
            const contactAction = (rule.actions || []).find(
                (a) => a.actionType === 'set_contact'
            );
            const taxAction = (rule.actions || []).find(
                (a) => a.actionType === 'set_taxes'
            );
            const memoAction = (rule.actions || []).find(
                (a) => a.actionType === 'set_memo'
            );
            const excludeAction = (rule.actions || []).find(
                (a) => a.actionType === 'exclude'
            );
            const splitsAction = (rule.actions || []).find(
                (a) => a.actionType === 'set_splits'
            );
            const typePayload = (typeAction?.payload || {}) as Record<
                string,
                unknown
            >;
            const typeVal =
                typeof typePayload.type === 'string' ? typePayload.type : '';
            const actionTypeValue =
                typeVal.toLowerCase() === 'income'
                    ? 'income'
                    : typeVal.toLowerCase() === 'expense'
                        ? 'expense'
                        : '';
            const categoryPayload = (categoryAction?.payload || {}) as Record<
                string,
                unknown
            >;
            const contactPayload = (contactAction?.payload || {}) as Record<
                string,
                unknown
            >;
            const taxPayload = (taxAction?.payload || {}) as Record<
                string,
                unknown
            >;
            const memoPayload = (memoAction?.payload || {}) as Record<
                string,
                unknown
            >;
            const splitsPayload = (splitsAction?.payload || {}) as Record<
                string,
                unknown
            >;
            const selectedActionType = categoryAction
                ? 'set_category'
                : contactAction
                    ? 'set_contact'
                    : memoAction
                        ? 'set_memo'
                        : taxAction
                            ? 'set_taxes'
                            : typeAction
                                ? 'set_type'
                                : splitsAction
                                    ? 'set_splits'
                                    : excludeAction
                                        ? 'exclude'
                                        : 'set_category';
            form.reset({
                name: rule.name || '',
                description: rule.description || '',
                transactionType: rule.transactionType || 'any',
                accountId:
                    rule.accountScope === 'selected' &&
                        Array.isArray(rule.accountIds) &&
                        rule.accountIds.length > 0
                        ? rule.accountIds[0]
                        : 'all',
                matchType: rule.matchType || 'all',
                conditions: mappedConditions,
                actionType: selectedActionType as FormValues['actionType'],
                actionTransactionType: actionTypeValue,
                actionCategory:
                    typeof categoryPayload.categoryId === 'string'
                        ? (categoryPayload.categoryId as string)
                        : '',
                actionPayee:
                    typeof contactPayload.contactId === 'string'
                        ? (contactPayload.contactId as string)
                        : '',
                actionMemo:
                    typeof memoPayload.memo === 'string'
                        ? (memoPayload.memo as string)
                        : '',
                actionTaxIds: (() => {
                    const taxObj = taxPayload as { taxIds?: unknown };
                    const arr = Array.isArray(taxObj.taxIds)
                        ? taxObj.taxIds
                        : [];
                    return (arr as unknown[]).filter(
                        (t): t is string => typeof t === 'string'
                    ) as string[];
                })(),
                splitsMode: (() => {
                    const sObj = splitsPayload as { mode?: unknown };
                    const m =
                        typeof sObj.mode === 'string' ? sObj.mode : undefined;
                    return m === 'percent' || m === 'amount'
                        ? (m as 'percent' | 'amount')
                        : 'none';
                })(),
                splitLines: (() => {
                    const sObj = splitsPayload as { lines?: unknown };
                    const lines = Array.isArray(sObj.lines)
                        ? (sObj.lines as unknown[])
                        : [];
                    return lines.map((item) => {
                        const l = item as {
                            percent?: unknown;
                            amount?: unknown;
                            categoryId?: unknown;
                            description?: unknown;
                            taxIds?: unknown;
                        };
                        const percent =
                            typeof l.percent === 'number'
                                ? l.percent
                                : undefined;
                        const amount =
                            typeof l.amount === 'number' ? l.amount : undefined;
                        const categoryId =
                            typeof l.categoryId === 'string'
                                ? l.categoryId
                                : undefined;
                        const description =
                            typeof l.description === 'string'
                                ? l.description
                                : undefined;
                        const taxIds = Array.isArray(l.taxIds)
                            ? (l.taxIds as unknown[]).filter(
                                (t): t is string => typeof t === 'string'
                            )
                            : [];
                        return {
                            percent,
                            amount,
                            categoryId,
                            description,
                            taxIds,
                        };
                    });
                })(),
                autoApply: !!rule.autoApply,
            });
        }
    }, [rule, open, form]);

    const onSubmit = (values: FormValues) => {
        const actionId = generateId();

        // Build conditions array matching the API payload structure
        const conditions: RuleCondition[] = values.conditions.map((cond) => {
            const condition: RuleCondition = {
                id: generateId(),
                field: cond.field,
                operator: cond.operator,
                caseSensitive: cond.caseSensitive || false,
            };

            // Add value fields based on condition field type
            if (cond.field === 'amount') {
                // For amount field, use numeric values
                if (cond.valueNumber !== undefined) {
                    condition.valueNumber = cond.valueNumber;
                }
                if (cond.valueNumberTo !== undefined) {
                    condition.valueNumberTo = cond.valueNumberTo;
                }
            } else {
                // For string fields (description, reference, contactId), use valueString
                if (cond.value) {
                    condition.valueString = cond.value;
                }
            }
            return condition;
        });

        const accountScope =
            values.accountId && values.accountId !== 'all' ? 'selected' : 'all';
        const accountIds =
            values.accountId && values.accountId !== 'all'
                ? [values.accountId]
                : [];

        if (mode === 'edit' && rule?.id) {
            const updateActions: Array<{
                actionType: string;
                payload?: Record<string, unknown>;
            }> = [];
            switch (values.actionType) {
                case 'set_type': {
                    if (values.actionTransactionType) {
                        updateActions.push({
                            actionType: 'set_type',
                            payload: {
                                type: values.actionTransactionType.toLowerCase(),
                            },
                        });
                    }
                    break;
                }
                case 'set_category': {
                    if (values.actionCategory) {
                        updateActions.push({
                            actionType: 'set_category',
                            payload: { categoryId: values.actionCategory },
                        });
                    }
                    break;
                }
                case 'set_contact': {
                    if (values.actionPayee) {
                        const isDisplayName = !values.actionPayee.match(
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                        );
                        let contactId = values.actionPayee;
                        if (isDisplayName) {
                            const contact = contacts.find(
                                (c) => c.displayName === values.actionPayee
                            );
                            if (contact) {
                                contactId = contact.id;
                            }
                        }
                        updateActions.push({
                            actionType: 'set_contact',
                            payload: { contactId },
                        });
                    }
                    break;
                }
                case 'set_memo': {
                    if (
                        values.actionMemo &&
                        values.actionMemo.trim().length > 0
                    ) {
                        updateActions.push({
                            actionType: 'set_memo',
                            payload: { memo: values.actionMemo.trim() },
                        });
                    }
                    break;
                }
                case 'set_taxes': {
                    if (
                        Array.isArray(values.actionTaxIds) &&
                        values.actionTaxIds.length > 0
                    ) {
                        updateActions.push({
                            actionType: 'set_taxes',
                            payload: { taxIds: values.actionTaxIds },
                        });
                    }
                    break;
                }
                case 'set_splits': {
                    if (
                        values.splitsMode !== 'none' &&
                        (values.splitLines || []).length > 0
                    ) {
                        const lines = (values.splitLines || [])
                            .map((l) => {
                                const base: Record<string, unknown> = {};
                                if (values.splitsMode === 'percent') {
                                    if (typeof l.percent === 'number') {
                                        base.percent = l.percent;
                                    }
                                } else if (values.splitsMode === 'amount') {
                                    if (typeof l.amount === 'number') {
                                        base.amount = l.amount;
                                    }
                                }
                                if (l.categoryId)
                                    base.categoryId = l.categoryId;
                                if (
                                    l.description &&
                                    l.description.trim().length > 0
                                )
                                    base.description = l.description.trim();
                                return base;
                            })
                            .filter((b) => Object.keys(b).length > 0);
                        if (lines.length > 0) {
                            updateActions.push({
                                actionType: 'set_splits',
                                payload: {
                                    mode:
                                        values.splitsMode === 'percent'
                                            ? 'percent'
                                            : 'amount',
                                    lines,
                                },
                            });
                        }
                    }
                    break;
                }
                case 'exclude': {
                    updateActions.push({ actionType: 'exclude' });
                    break;
                }
                default:
                    break;
            }
            updateRule(
                {
                    id: rule.id,
                    payload: {
                        name: values.name.trim(),
                        description: values.description?.trim() || undefined,
                        transactionType: (values.transactionType || 'any') as
                            | 'any'
                            | 'income'
                            | 'expense',
                        matchType: values.matchType,
                        autoApply: values.autoApply,
                        stopOnMatch: true,
                        accountScope,
                        accountIds,
                        conditions,
                        actions: updateActions,
                    },
                },
                {
                    onSuccess: () => {
                        setOpen(false);
                    },
                }
            );
            return;
        }

        const payload: CreateRulePayload = {
            name: values.name.trim(),
            description: values.description?.trim() || undefined,
            active: true,
            transactionType: values.transactionType || 'any',
            matchType: values.matchType,
            autoApply: values.autoApply,
            stopOnMatch: true,
            priority: 1,
            accountScope,
            accountIds,
            conditions: conditions,
            actions: [],
        };

        switch (values.actionType) {
            case 'set_type': {
                if (values.actionTransactionType) {
                    payload.actions?.push({
                        id: generateId(),
                        actionType: 'set_type',
                        payload: {
                            type: values.actionTransactionType.toLowerCase(),
                        },
                    });
                }
                break;
            }
            case 'set_category': {
                if (values.actionCategory) {
                    payload.actions?.push({
                        id: generateId(),
                        actionType: 'set_category',
                        payload: { categoryId: values.actionCategory },
                    });
                }
                break;
            }
            case 'set_contact': {
                if (values.actionPayee) {
                    const isDisplayName = !values.actionPayee.match(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                    );
                    let contactId = values.actionPayee;
                    if (isDisplayName) {
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
                break;
            }
            case 'set_memo': {
                if (values.actionMemo && values.actionMemo.trim().length > 0) {
                    payload.actions?.push({
                        id: generateId(),
                        actionType: 'set_memo',
                        payload: { memo: values.actionMemo.trim() },
                    });
                }
                break;
            }
            case 'set_taxes': {
                if (
                    Array.isArray(values.actionTaxIds) &&
                    values.actionTaxIds.length > 0
                ) {
                    payload.actions?.push({
                        id: generateId(),
                        actionType: 'set_taxes',
                        payload: { taxIds: values.actionTaxIds },
                    });
                }
                break;
            }
            case 'set_splits': {
                if (
                    values.splitsMode !== 'none' &&
                    (values.splitLines || []).length > 0
                ) {
                    const lines = (values.splitLines || [])
                        .map((l) => {
                            const base: Record<string, unknown> = {};
                            if (values.splitsMode === 'percent') {
                                if (typeof l.percent === 'number') {
                                    base.percent = l.percent;
                                }
                            } else if (values.splitsMode === 'amount') {
                                if (typeof l.amount === 'number') {
                                    base.amount = l.amount;
                                }
                            }
                            if (l.categoryId) base.categoryId = l.categoryId;
                            if (
                                l.description &&
                                l.description.trim().length > 0
                            )
                                base.description = l.description.trim();
                            return base;
                        })
                        .filter((b) => Object.keys(b).length > 0);
                    if (lines.length > 0) {
                        payload.actions?.push({
                            id: generateId(),
                            actionType: 'set_splits',
                            payload: {
                                mode:
                                    values.splitsMode === 'percent'
                                        ? 'percent'
                                        : 'amount',
                                lines,
                            },
                        });
                    }
                }
                break;
            }
            case 'exclude': {
                payload.actions?.push({
                    id: generateId(),
                    actionType: 'exclude',
                });
                break;
            }
            default:
                break;
        }

        if (!payload.actions || payload.actions.length === 0) {
            payload.actions = [
                {
                    id: actionId,
                    actionType: 'exclude',
                },
            ];
        }

        createRule(payload, {
            onSuccess: () => {
                form.reset({
                    name: '',
                    description: '',
                    transactionType: 'income',
                    accountId: 'all',
                    matchType: 'all',
                    conditions: [
                        {
                            field: 'description',
                            operator: 'contains',
                            value: '',
                            valueNumber: undefined,
                            valueNumberTo: undefined,
                            caseSensitive: false,
                        },
                    ],
                    actionType: 'set_category',
                    actionTransactionType: 'income',
                    actionCategory: '',
                    actionPayee: '',
                    actionMemo: '',
                    actionTaxIds: [],
                    splitsMode: 'none',
                    splitLines: [],
                    autoApply: false,
                });
                setOpen(false);
            },
        });
    };

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerContent className="h-full w-full mt-0 rounded-none flex flex-col">
                <DrawerHeader className="border-b px-6 py-4 flex flex-col items-start">
                    <DrawerTitle>
                        {mode === 'edit' ? 'Edit rule' : 'Create rule'}
                    </DrawerTitle>
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
                                    <h3 className="text-sm font-medium text-foreground">
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
                                    <h3 className="text-sm font-medium text-foreground">
                                        Apply To
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-3">
                                            <Label className="text-sm font-normal min-w-[120px] pt-2">
                                                Transaction Type
                                            </Label>
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
                                                                <SelectItem value="income">
                                                                    Money in
                                                                </SelectItem>
                                                                <SelectItem value="expense">
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

                                        <div className="flex flex-col gap-3">
                                            <Label className="text-sm font-normal min-w-[120px] pt-2">
                                                Account
                                            </Label>
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
                                                                {bankAccounts.map(
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
                                        <h3 className="text-sm font-medium text-foreground">
                                            Conditions
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs"
                                            onClick={handleAddCondition}
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add Condition
                                        </Button>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-3">
                                            <Label className="text-sm font-normal min-w-[120px] pt-2">
                                                Match Type
                                            </Label>
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

                                        {fields.map((fieldItem, index) => (
                                            <ConditionRow
                                                key={fieldItem.id}
                                                index={index}
                                                form={form}
                                                remove={remove}
                                                isOnly={fields.length === 1}
                                                contacts={contacts}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Actions Section */}
                                <div className="space-y-4 border-t pt-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-foreground">
                                            Actions
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            Assign
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="actionType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-normal">
                                                        Action Type
                                                    </FormLabel>
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
                                                            <SelectItem value="set_category">
                                                                Set category
                                                            </SelectItem>
                                                            <SelectItem value="set_contact">
                                                                Set contact
                                                            </SelectItem>
                                                            <SelectItem value="set_memo">
                                                                Set memo
                                                            </SelectItem>
                                                            <SelectItem value="set_taxes">
                                                                Set taxes
                                                            </SelectItem>
                                                            <SelectItem value="set_type">
                                                                Set type
                                                            </SelectItem>
                                                            <SelectItem value="set_splits">
                                                                Set splits
                                                            </SelectItem>
                                                            <SelectItem value="exclude">
                                                                Exclude
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch('actionType') ===
                                            'set_type' && (
                                                <FormField
                                                    control={form.control}
                                                    name="actionTransactionType"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-normal">
                                                                Type
                                                            </FormLabel>
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
                                                                    <SelectItem value="income">
                                                                        Income
                                                                    </SelectItem>
                                                                    <SelectItem value="expense">
                                                                        Expense
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                        {form.watch('actionType') ===
                                            'set_category' && (
                                                <FormField
                                                    control={form.control}
                                                    name="actionCategory"
                                                    render={({ field }) => {
                                                        const incomeCategories =
                                                            categories.filter(
                                                                (acc) =>
                                                                    acc.accountType ===
                                                                    'income'
                                                            );
                                                        const expenseCategories =
                                                            categories.filter(
                                                                (acc) =>
                                                                    acc.accountType ===
                                                                    'expense'
                                                            );
                                                        return (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-normal">
                                                                    Category
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
                                                                            <SelectValue placeholder="Select category (optional)" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {incomeCategories.length >
                                                                            0 && (
                                                                                <>
                                                                                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                                                                        Income
                                                                                    </div>
                                                                                    {incomeCategories.map(
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
                                                                                </>
                                                                            )}
                                                                        {expenseCategories.length >
                                                                            0 && (
                                                                                <>
                                                                                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground mt-1">
                                                                                        Expense
                                                                                    </div>
                                                                                    {expenseCategories.map(
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
                                                                                </>
                                                                            )}
                                                                        {categories.length ===
                                                                            0 && (
                                                                                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                                                                    No
                                                                                    categories
                                                                                    available
                                                                                </div>
                                                                            )}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            )}

                                        {form.watch('actionType') ===
                                            'set_contact' && (
                                                <FormField
                                                    control={form.control}
                                                    name="actionPayee"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-normal">
                                                                Contact / Payee
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                value={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select contact (optional)" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {contacts.length >
                                                                        0 ? (
                                                                        contacts.map(
                                                                            (
                                                                                contact
                                                                            ) => (
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
                                                                        )
                                                                    ) : (
                                                                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                                                            No
                                                                            contacts
                                                                            available
                                                                        </div>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                        {form.watch('actionType') ===
                                            'set_taxes' && (
                                                <FormField
                                                    control={form.control}
                                                    name="actionTaxIds"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-normal">
                                                                Taxes
                                                            </FormLabel>
                                                            <div className="space-y-2">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {taxes.length >
                                                                        0
                                                                        ? taxes.map(
                                                                            (
                                                                                tax
                                                                            ) => {
                                                                                const checked =
                                                                                    Array.isArray(
                                                                                        field.value
                                                                                    )
                                                                                        ? field.value.includes(
                                                                                            tax.id
                                                                                        )
                                                                                        : false;
                                                                                return (
                                                                                    <label
                                                                                        key={
                                                                                            tax.id
                                                                                        }
                                                                                        className="flex items-center gap-2 rounded border px-2 py-1.5"
                                                                                    >
                                                                                        <Checkbox
                                                                                            checked={
                                                                                                checked
                                                                                            }
                                                                                            onCheckedChange={(
                                                                                                c
                                                                                            ) => {
                                                                                                const current =
                                                                                                    Array.isArray(
                                                                                                        field.value
                                                                                                    )
                                                                                                        ? [
                                                                                                            ...field.value,
                                                                                                        ]
                                                                                                        : [];
                                                                                                if (
                                                                                                    c
                                                                                                ) {
                                                                                                    if (
                                                                                                        !current.includes(
                                                                                                            tax.id
                                                                                                        )
                                                                                                    ) {
                                                                                                        current.push(
                                                                                                            tax.id
                                                                                                        );
                                                                                                    }
                                                                                                } else {
                                                                                                    const idx =
                                                                                                        current.indexOf(
                                                                                                            tax.id
                                                                                                        );
                                                                                                    if (
                                                                                                        idx >=
                                                                                                        0
                                                                                                    )
                                                                                                        current.splice(
                                                                                                            idx,
                                                                                                            1
                                                                                                        );
                                                                                                }
                                                                                                field.onChange(
                                                                                                    current
                                                                                                );
                                                                                            }}
                                                                                        />
                                                                                        <span className="text-sm">
                                                                                            {
                                                                                                tax.name
                                                                                            }{' '}
                                                                                            (
                                                                                            {(
                                                                                                tax.rate *
                                                                                                100
                                                                                            ).toFixed(
                                                                                                (tax.rate *
                                                                                                    100) %
                                                                                                    1 ===
                                                                                                    0
                                                                                                    ? 0
                                                                                                    : 2
                                                                                            )}
                                                                                            %)
                                                                                        </span>
                                                                                    </label>
                                                                                );
                                                                            }
                                                                        )
                                                                        : null}
                                                                </div>
                                                                <FormMessage />
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                        {form.watch('actionType') ===
                                            'set_memo' && (
                                                <FormField
                                                    control={form.control}
                                                    name="actionMemo"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-normal">
                                                                Memo
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    {...field}
                                                                    placeholder="Enter memo (optional)"
                                                                    className="min-h-20"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                        {form.watch('actionType') ===
                                            'set_splits' && (
                                                <FormField
                                                    control={form.control}
                                                    name="splitsMode"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-normal">
                                                                Splits
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                value={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="No splits" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="none">
                                                                        None
                                                                    </SelectItem>
                                                                    <SelectItem value="percent">
                                                                        Percent
                                                                    </SelectItem>
                                                                    <SelectItem value="amount">
                                                                        Fixed amount
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                        {form.watch('actionType') ===
                                            'set_splits' &&
                                            form.watch('splitsMode') !==
                                            'none' && (
                                                <div className="space-y-3">
                                                    {splitFields.map(
                                                        (sf, idx) => (
                                                            <div
                                                                key={sf.id}
                                                                className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border rounded"
                                                            >
                                                                {form.watch(
                                                                    'splitsMode'
                                                                ) ===
                                                                    'percent' ? (
                                                                    <FormField
                                                                        control={
                                                                            form.control
                                                                        }
                                                                        name={`splitLines.${idx}.percent`}
                                                                        render={({
                                                                            field,
                                                                        }) => (
                                                                            <FormItem>
                                                                                <FormLabel className="text-xs">
                                                                                    Percent
                                                                                </FormLabel>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="number"
                                                                                        {...field}
                                                                                        value={
                                                                                            field.value ??
                                                                                            ''
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            field.onChange(
                                                                                                e
                                                                                                    .target
                                                                                                    .value ===
                                                                                                    ''
                                                                                                    ? undefined
                                                                                                    : e
                                                                                                        .target
                                                                                                        .valueAsNumber
                                                                                            )
                                                                                        }
                                                                                        placeholder="0"
                                                                                    />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                ) : (
                                                                    <FormField
                                                                        control={
                                                                            form.control
                                                                        }
                                                                        name={`splitLines.${idx}.amount`}
                                                                        render={({
                                                                            field,
                                                                        }) => (
                                                                            <FormItem>
                                                                                <FormLabel className="text-xs">
                                                                                    Amount
                                                                                </FormLabel>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="number"
                                                                                        {...field}
                                                                                        value={
                                                                                            field.value ??
                                                                                            ''
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            field.onChange(
                                                                                                e
                                                                                                    .target
                                                                                                    .value ===
                                                                                                    ''
                                                                                                    ? undefined
                                                                                                    : e
                                                                                                        .target
                                                                                                        .valueAsNumber
                                                                                            )
                                                                                        }
                                                                                        placeholder="0.00"
                                                                                    />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                )}
                                                                <FormField
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name={`splitLines.${idx}.categoryId`}
                                                                    render={({
                                                                        field,
                                                                    }) => (
                                                                        <FormItem>
                                                                            <FormLabel className="text-xs">
                                                                                Category
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
                                                                                        <SelectValue placeholder="Select category" />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    {categories.length >
                                                                                        0
                                                                                        ? categories.map(
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
                                                                                        )
                                                                                        : null}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name={`splitLines.${idx}.description`}
                                                                    render={({
                                                                        field,
                                                                    }) => (
                                                                        <FormItem className="sm:col-span-2">
                                                                            <FormLabel className="text-xs">
                                                                                Description
                                                                            </FormLabel>
                                                                            <FormControl>
                                                                                <Input
                                                                                    {...field}
                                                                                    placeholder="Optional description"
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <div className="sm:col-span-2 flex justify-end">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() =>
                                                                            removeSplit(
                                                                                idx
                                                                            )
                                                                        }
                                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            appendSplit({
                                                                percent:
                                                                    form.watch(
                                                                        'splitsMode'
                                                                    ) ===
                                                                        'percent'
                                                                        ? 0
                                                                        : undefined,
                                                                amount:
                                                                    form.watch(
                                                                        'splitsMode'
                                                                    ) ===
                                                                        'amount'
                                                                        ? 0
                                                                        : undefined,
                                                                categoryId: '',
                                                                description: '',
                                                                taxIds: [],
                                                            })
                                                        }
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        Add Split Line
                                                    </Button>
                                                </div>
                                            )}
                                    </div>
                                </div>

                                {/* Auto-apply Section */}
                                <div className="space-y-4 border-t pt-6">
                                    {form.watch('actionType') === 'exclude' && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-sm font-medium leading-tight">
                                                    Exclude transaction
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    When matched, void and mark
                                                    as reviewed
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="autoApply"
                                        render={({ field }) => (
                                            <FormItem className="flex items-start gap-3">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                                <div className="flex-1 space-y-1">
                                                    <FormLabel className="text-sm font-medium leading-tight cursor-pointer">
                                                        Auto-apply rule
                                                    </FormLabel>
                                                    <p className="text-xs text-muted-foreground">
                                                        Automatically apply this
                                                        rule to matching
                                                        transactions without
                                                        review
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
                            disabled={
                                (mode === 'edit' ? isUpdating : isPending) ||
                                isLoadingData
                            }
                            onClick={form.handleSubmit(onSubmit)}
                            className="flex-1"
                        >
                            {mode === 'edit'
                                ? isUpdating
                                    ? 'Updating...'
                                    : 'Update Rule'
                                : isPending
                                    ? 'Saving...'
                                    : 'Save Rule'}
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
