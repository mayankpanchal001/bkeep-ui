import { Icons } from '@/components/shared/Icons';
import PageHeader from '@/components/shared/PageHeader';
import { CreateRuleDrawer } from '@/components/transactions/CreateRuleDrawer';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
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
import {
    Table,
    TableBody,
    TableCell,
    TableEmptyState,
    TableHead,
    TableHeader,
    TablePagination,
    TableRow,
    TableRowCheckbox,
    TableSelectAllCheckbox,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useChartOfAccounts } from '@/services/apis/chartsAccountApi';
import { useContacts } from '@/services/apis/contactsApi';
import {
    useCreateRule,
    useDeleteRule,
    useRules,
    useTestRule,
    type CreateRulePayload,
    type Rule,
    type RuleAction,
    type RuleCondition,
    type TestRulePayload,
    type TestRuleResponse,
} from '@/services/apis/rules';
import { useTaxes } from '@/services/apis/taxApi';
import { useTransactionById } from '@/services/apis/transactions';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { FlaskConical, MoreVertical, Pencil, Trash2 } from 'lucide-react';

const Rulespage = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [openCreate, setOpenCreate] = useState(false);
    const [editRule, setEditRule] = useState<Rule | null>(null);
    const [openEdit, setOpenEdit] = useState(false);
    const limit = 20;

    const { data, isLoading } = useRules({
        page,
        limit,
        search: search || undefined,
        sort: 'priority',
        order: 'asc',
    });

    const items: Rule[] = useMemo(() => data?.data?.items || [], [data]);
    const pagination = data?.data?.pagination;

    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    useEffect(() => {
        setSelectedIds([]);
    }, [items]);

    const [openTest, setOpenTest] = useState(false);
    const [ruleUnderTest, setRuleUnderTest] = useState<Rule | null>(null);
    const [testResult, setTestResult] = useState<
        TestRuleResponse['data'] | null
    >(null);
    const [testErrorMessage, setTestErrorMessage] = useState<string | null>(
        null
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [ruleIdToDelete, setRuleIdToDelete] = useState<string | null>(null);
    const { mutate: runRuleTest, isPending: isTesting } = useTestRule();
    const { mutate: createRule, isPending: isCreating } = useCreateRule();
    const { mutate: deleteRule } = useDeleteRule();
    const searchForm = useForm<{ search: string }>({
        defaultValues: { search },
    });
    type TestFormValues = {
        transactionType: 'any' | 'income' | 'expense';
        matchType: 'all' | 'any';
        accountScope: 'all' | 'selected';
        accountIdsCsv: string;
        againstAll: boolean;
        limit: number;
        transactionId: string;
        includeActions: boolean;
    };
    const testForm = useForm<TestFormValues>({
        defaultValues: {
            transactionType: 'any',
            matchType: 'all',
            accountScope: 'all',
            accountIdsCsv: '',
            againstAll: true,
            limit: 25,
            transactionId: '',
            includeActions: true,
        },
    });
    const testAgainstAll = testForm.watch('againstAll');
    const testTransactionId = testForm.watch('transactionId');
    const { data: testTransaction } = useTransactionById(
        testTransactionId,
        !testAgainstAll && !!testTransactionId
    );

    type QuickFormValues = {
        name: string;
        description: string;
        transactionType: 'any' | 'income' | 'expense';
        matchType: 'all' | 'any';
        autoApply: boolean;
        stopOnMatch: boolean;
        priority: number;
        accountScope: 'all' | 'selected';
        accountIdsCsv: string;
        conditionField: 'description';
        conditionOperator: 'contains';
        conditionValue: string;
        caseSensitive: boolean;
        actionType:
            | 'set_category'
            | 'set_contact'
            | 'set_memo'
            | 'set_taxes'
            | 'set_type'
            | 'set_splits'
            | 'exclude';
        actionCategoryId: string;
        actionContactId: string;
        actionMemo: string;
        actionTaxIds: string[];
        actionTypeValue: 'income' | 'expense';
        splitsMode: 'none' | 'percent' | 'amount';
        splitLines: Array<{
            percent?: number;
            amount?: number;
            categoryId?: string;
            description?: string;
        }>;
    };
    const quickForm = useForm<QuickFormValues>({
        defaultValues: {
            name: 'Bank FEE',
            description: 'NA',
            transactionType: 'any',
            matchType: 'all',
            autoApply: true,
            stopOnMatch: true,
            priority: 1,
            accountScope: 'all',
            accountIdsCsv: '',
            conditionField: 'description',
            conditionOperator: 'contains',
            conditionValue: 'BANK FEE',
            caseSensitive: false,
            actionType: 'set_category',
            actionCategoryId: '',
            actionContactId: '',
            actionMemo: '',
            actionTaxIds: [],
            actionTypeValue: 'income',
            splitsMode: 'none',
            splitLines: [],
        },
    });

    const { data: accountsData } = useChartOfAccounts({
        isActive: true,
        limit: 1000,
    });
    const accounts = useMemo(
        () => accountsData?.data?.items || [],
        [accountsData]
    );
    const categories = useMemo(
        () =>
            accounts.filter(
                (a) => a.accountType === 'income' || a.accountType === 'expense'
            ),
        [accounts]
    );
    const { data: contactsData } = useContacts({
        isActive: true,
        limit: 1000,
    });
    const contacts = useMemo(
        () => contactsData?.data?.items || [],
        [contactsData]
    );
    const { data: taxesData } = useTaxes({
        isActive: true,
        limit: 1000,
    });
    const taxes = useMemo(() => taxesData?.data?.items || [], [taxesData]);

    const appliedToLabel = (r: Rule) => {
        if (r.accountScope === 'selected') {
            if (Array.isArray(r.accountIds) && r.accountIds.length > 0) {
                return 'Selected accounts';
            }
            return 'Selected accounts';
        }
        return 'All accounts';
    };

    const conditionLabel = (c: RuleCondition) => {
        const field =
            c.field?.charAt(0)?.toUpperCase() + c.field?.slice(1) || 'Field';
        const op = c.operator || '';
        const vs =
            typeof c.valueString === 'string' && c.valueString
                ? c.valueString
                : '';
        const vn =
            typeof c.valueNumber === 'number'
                ? String(c.valueNumber)
                : typeof c.valueNumber === 'string'
                  ? c.valueNumber
                  : '';
        const vnt =
            typeof c.valueNumberTo === 'number'
                ? String(c.valueNumberTo)
                : typeof c.valueNumberTo === 'string'
                  ? c.valueNumberTo
                  : '';
        if (op === 'contains') {
            return `${field} contains "${vs}"`;
        }
        if (op === 'equals') {
            return `${field} equals "${vs || vn}"`;
        }
        if (op === 'between' && vn && vnt) {
            return `${field} between ${vn} and ${vnt}`;
        }
        return `${field} ${op} ${vs || vn || ''}`.trim();
    };

    const settingsLabel = (a: RuleAction) => {
        if (
            a.actionType === 'set_category' &&
            a.payload &&
            'categoryId' in a.payload
        ) {
            return 'Set Category';
        }
        if (a.actionType === 'set_type' && a.payload && 'type' in a.payload) {
            return `Set Type to ${(a.payload as Record<string, unknown>).type}`;
        }
        if (
            a.actionType === 'set_contact' &&
            a.payload &&
            'contactId' in a.payload
        ) {
            return 'Set Contact';
        }
        return a.actionType;
    };

    const filteredItems = items;

    const headerActions = (
        <div className="flex gap-2  max-sm:w-full sm:w-auto">
            <Form {...searchForm}>
                <FormField
                    control={searchForm.control}
                    name="search"
                    render={({ field }) => (
                        <FormItem className="w-full sm:w-[260px]">
                            <FormControl>
                                <Input
                                    value={field.value}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search by name or conditions"
                                    startIcon={
                                        <Icons.Search className="w-4 h-4" />
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </Form>
            <Button
                // className="max-sm:w-full"
                onClick={() => {
                    setEditRule(null);
                    setOpenCreate(true);
                }}
            >
                New rule
            </Button>
        </div>
    );

    return (
        <div className="flex flex-col gap-4 w-full lg:mx-auto">
            <PageHeader
                title="Rules"
                subtitle="Create and manage bank rules"
                actions={headerActions}
            />

            <div className="border border-primary/10 rounded-lg overflow-hidden h-full">
                <Table
                    enableSelection={true}
                    onSelectionChange={setSelectedIds}
                    rowIds={filteredItems.map((r) => r.id)}
                    selectedIds={selectedIds}
                    sortKey={'priority'}
                    sortDirection={'asc'}
                    onSortChange={() => {}}
                >
                    <TableHeader>
                        <tr>
                            <TableHead>
                                <TableSelectAllCheckbox />
                            </TableHead>
                            <TableHead sortable sortKey="priority">
                                Priority
                            </TableHead>
                            <TableHead>Rule Name</TableHead>
                            <TableHead>Applied To</TableHead>
                            <TableHead>Conditions</TableHead>
                            <TableHead>Settings</TableHead>
                            <TableHead>Auto‑apply</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[1%] whitespace-nowrap">
                                Actions
                            </TableHead>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.length === 0 ? (
                            <TableEmptyState
                                colSpan={9}
                                message={
                                    isLoading
                                        ? 'Loading rules...'
                                        : 'No rules found'
                                }
                                description={
                                    isLoading
                                        ? ''
                                        : 'Try adjusting search or create a new rule.'
                                }
                            />
                        ) : (
                            filteredItems.map((r) => (
                                <TableRow key={r.id} rowId={r.id}>
                                    <TableCell data-label="">
                                        <TableRowCheckbox rowId={r.id} />
                                    </TableCell>
                                    <TableCell data-label="Priority">
                                        <span className="text-sm font-medium text-primary">
                                            {r.priority ?? ''}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        data-label="Rule Name"
                                        noTruncate
                                    >
                                        <span className="text-sm font-medium text-primary">
                                            {r.name}
                                        </span>
                                    </TableCell>
                                    <TableCell data-label="Applied To">
                                        <div className="inline-flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                                                {appliedToLabel(r)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        data-label="Conditions"
                                        noTruncate
                                    >
                                        <div className="text-sm text-primary/80">
                                            {(r.conditions || [])
                                                .map((c) => conditionLabel(c))
                                                .join('; ')}
                                        </div>
                                    </TableCell>
                                    <TableCell data-label="Settings" noTruncate>
                                        <div className="text-sm text-primary/80">
                                            {(r.actions || [])
                                                .map((a) => settingsLabel(a))
                                                .join(', ')}
                                        </div>
                                    </TableCell>
                                    <TableCell data-label="Auto‑apply">
                                        {r.autoApply ? (
                                            <Icons.Check className="w-4 h-4 text-primary" />
                                        ) : (
                                            ''
                                        )}
                                    </TableCell>
                                    <TableCell data-label="Status">
                                        <span className="text-xs font-medium text-primary">
                                            {r.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell data-label="Actions">
                                        <div className="flex items-center gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 min-w-[1rem]"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditRule(r);
                                                            setOpenEdit(true);
                                                        }}
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            const updatedRule: Rule =
                                                                {
                                                                    ...r,
                                                                    transactionType:
                                                                        'any',
                                                                    matchType:
                                                                        'all',
                                                                    accountScope:
                                                                        'all',
                                                                    accountIds:
                                                                        [],
                                                                    conditions:
                                                                        [
                                                                            {
                                                                                id: 'temp-description-contains-bank-fee',
                                                                                field: 'description',
                                                                                operator:
                                                                                    'contains',
                                                                                valueString:
                                                                                    'BANK FEE',
                                                                                caseSensitive: false,
                                                                            },
                                                                        ],
                                                                    actions: [
                                                                        {
                                                                            id: '940e13fb-f0f8-4caf-a755-a32ae7f869c6',
                                                                            actionType:
                                                                                'set_category',
                                                                            payload:
                                                                                {
                                                                                    categoryId:
                                                                                        'bd68e04d-7a14-4dd8-8818-3ba181755e0c',
                                                                                },
                                                                        },
                                                                    ],
                                                                };
                                                            setRuleUnderTest(
                                                                updatedRule
                                                            );
                                                            setTestResult(null);
                                                            setTestErrorMessage(
                                                                null
                                                            );
                                                            testForm.reset({
                                                                transactionType:
                                                                    'any',
                                                                matchType:
                                                                    'all',
                                                                accountScope:
                                                                    'all',
                                                                accountIdsCsv:
                                                                    '',
                                                                againstAll: true,
                                                                limit: 25,
                                                                transactionId:
                                                                    '',
                                                                includeActions: true,
                                                            });
                                                            setOpenTest(true);
                                                        }}
                                                    >
                                                        <FlaskConical className="mr-2 h-4 w-4" />
                                                        Test
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setRuleIdToDelete(
                                                                r.id
                                                            );
                                                            setDeleteDialogOpen(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {pagination && (pagination.totalPages || 0) > 1 ? (
                    <div className="border-t bg-card p-4">
                        <TablePagination
                            page={pagination.page || page}
                            totalPages={pagination.totalPages || 1}
                            totalItems={
                                pagination.total || filteredItems.length
                            }
                            itemsPerPage={pagination.limit || limit}
                            onPageChange={(p) => setPage(p)}
                        />
                    </div>
                ) : null}
            </div>
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(o) => {
                    setDeleteDialogOpen(o);
                    if (!o) setRuleIdToDelete(null);
                }}
            >
                <AlertDialogContent className="z-60">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete rule</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the rule.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (ruleIdToDelete) {
                                    deleteRule(ruleIdToDelete);
                                }
                                setDeleteDialogOpen(false);
                                setRuleIdToDelete(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div style={{ display: 'none' }}>
                <Form {...quickForm}>
                    <div className="border border-primary/10 rounded-lg p-4 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-primary">
                                    Rule name
                                </span>
                                <FormField
                                    control={quickForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(e)
                                                    }
                                                    placeholder="Rule name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-primary">
                                    Description
                                </span>
                                <FormField
                                    control={quickForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(e)
                                                    }
                                                    placeholder="Description"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-primary">
                                    Transaction type
                                </span>
                                <Select
                                    value={quickForm.watch('transactionType')}
                                    onValueChange={(val) =>
                                        quickForm.setValue(
                                            'transactionType',
                                            val as 'any' | 'income' | 'expense'
                                        )
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Any</SelectItem>
                                        <SelectItem value="income">
                                            Income
                                        </SelectItem>
                                        <SelectItem value="expense">
                                            Expense
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-primary">
                                    Match type
                                </span>
                                <Select
                                    value={quickForm.watch('matchType')}
                                    onValueChange={(val) =>
                                        quickForm.setValue(
                                            'matchType',
                                            val as 'all' | 'any'
                                        )
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="any">Any</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-primary">
                                    Priority
                                </span>
                                <FormField
                                    control={quickForm.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    placeholder="1"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-primary">
                                    Account scope
                                </span>
                                <Select
                                    value={quickForm.watch('accountScope')}
                                    onValueChange={(val) =>
                                        quickForm.setValue(
                                            'accountScope',
                                            val as 'all' | 'selected'
                                        )
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="selected">
                                            Selected
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {quickForm.watch('accountScope') === 'selected' && (
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-primary">
                                        Account IDs (comma-separated)
                                    </span>
                                    <FormField
                                        control={quickForm.control}
                                        name="accountIdsCsv"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        value={field.value}
                                                        onChange={(e) =>
                                                            field.onChange(e)
                                                        }
                                                        placeholder="uuid-1, uuid-2"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <FormField
                                    control={quickForm.control}
                                    name="autoApply"
                                    render={({ field }) => (
                                        <>
                                            <Input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.checked
                                                    )
                                                }
                                                inputSize="sm"
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm text-primary">
                                                Auto-apply
                                            </span>
                                        </>
                                    )}
                                />
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <FormField
                                    control={quickForm.control}
                                    name="stopOnMatch"
                                    render={({ field }) => (
                                        <>
                                            <Input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.checked
                                                    )
                                                }
                                                inputSize="sm"
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm text-primary">
                                                Stop on match
                                            </span>
                                        </>
                                    )}
                                />
                            </label>
                        </div>

                        <div className="space-y-3">
                            <span className="text-sm font-medium text-primary">
                                Condition
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex flex-col">
                                    <span className="text-xs text-primary/60">
                                        Field
                                    </span>
                                    <Select
                                        value={quickForm.watch(
                                            'conditionField'
                                        )}
                                        onValueChange={(val) =>
                                            quickForm.setValue(
                                                'conditionField',
                                                val as 'description'
                                            )
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="description">
                                                Description
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-primary/60">
                                        Operator
                                    </span>
                                    <Select
                                        value={quickForm.watch(
                                            'conditionOperator'
                                        )}
                                        onValueChange={(val) =>
                                            quickForm.setValue(
                                                'conditionOperator',
                                                val as 'contains'
                                            )
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contains">
                                                Contains
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-primary/60">
                                        Value
                                    </span>
                                    <FormField
                                        control={quickForm.control}
                                        name="conditionValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        value={field.value}
                                                        onChange={(e) =>
                                                            field.onChange(e)
                                                        }
                                                        placeholder="BANK FEE"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <FormField
                                    control={quickForm.control}
                                    name="caseSensitive"
                                    render={({ field }) => (
                                        <>
                                            <Input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.checked
                                                    )
                                                }
                                                inputSize="sm"
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm text-primary">
                                                Case sensitive
                                            </span>
                                        </>
                                    )}
                                />
                            </label>
                        </div>

                        <div className="space-y-3">
                            <span className="text-sm font-medium text-primary">
                                Action
                            </span>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex flex-col">
                                    <span className="text-xs text-primary/60">
                                        Action Type
                                    </span>
                                    <Select
                                        value={quickForm.watch('actionType')}
                                        onValueChange={(val) =>
                                            quickForm.setValue(
                                                'actionType',
                                                val as QuickFormValues['actionType']
                                            )
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
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
                                </div>
                                {quickForm.watch('actionType') ===
                                    'set_category' && (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-primary/60">
                                            Category
                                        </span>
                                        <Select
                                            value={quickForm.watch(
                                                'actionCategoryId'
                                            )}
                                            onValueChange={(val) =>
                                                quickForm.setValue(
                                                    'actionCategoryId',
                                                    val
                                                )
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={c.id}
                                                    >
                                                        {c.accountName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {quickForm.watch('actionType') ===
                                    'set_contact' && (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-primary/60">
                                            Contact
                                        </span>
                                        <Select
                                            value={quickForm.watch(
                                                'actionContactId'
                                            )}
                                            onValueChange={(val) =>
                                                quickForm.setValue(
                                                    'actionContactId',
                                                    val
                                                )
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select contact" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contacts.map((c) => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={c.id}
                                                    >
                                                        {c.displayName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {quickForm.watch('actionType') ===
                                    'set_memo' && (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-primary/60">
                                            Memo
                                        </span>
                                        <FormField
                                            control={quickForm.control}
                                            name="actionMemo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            value={field.value}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e
                                                                )
                                                            }
                                                            placeholder="Enter memo"
                                                            className="min-h-20"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                                {quickForm.watch('actionType') ===
                                    'set_taxes' && (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-primary/60">
                                            Taxes
                                        </span>
                                        <FormField
                                            control={quickForm.control}
                                            name="actionTaxIds"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {taxes.map((tax) => {
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
                                                                    key={tax.id}
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
                                                                            quickForm.setValue(
                                                                                'actionTaxIds',
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
                                                        })}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                                {quickForm.watch('actionType') ===
                                    'set_type' && (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-primary/60">
                                            Type
                                        </span>
                                        <Select
                                            value={quickForm.watch(
                                                'actionTypeValue'
                                            )}
                                            onValueChange={(val) =>
                                                quickForm.setValue(
                                                    'actionTypeValue',
                                                    val as 'income' | 'expense'
                                                )
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="income">
                                                    Income
                                                </SelectItem>
                                                <SelectItem value="expense">
                                                    Expense
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {quickForm.watch('actionType') ===
                                    'set_splits' && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-primary/60">
                                                Splits
                                            </span>
                                            <Select
                                                value={quickForm.watch(
                                                    'splitsMode'
                                                )}
                                                onValueChange={(val) =>
                                                    quickForm.setValue(
                                                        'splitsMode',
                                                        val as QuickFormValues['splitsMode']
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="No splits" />
                                                </SelectTrigger>
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
                                        </div>
                                        {quickForm.watch('splitsMode') !==
                                            'none' && (
                                            <div className="space-y-3">
                                                {(
                                                    quickForm.watch(
                                                        'splitLines'
                                                    ) || []
                                                ).map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border rounded"
                                                    >
                                                        {quickForm.watch(
                                                            'splitsMode'
                                                        ) === 'percent' ? (
                                                            <FormField
                                                                control={
                                                                    quickForm.control
                                                                }
                                                                name={`splitLines.${idx}.percent`}
                                                                render={({
                                                                    field,
                                                                }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                value={
                                                                                    field.value ??
                                                                                    ''
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    field.onChange(
                                                                                        e
                                                                                            .currentTarget
                                                                                            .value ===
                                                                                            ''
                                                                                            ? undefined
                                                                                            : e
                                                                                                  .currentTarget
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
                                                                    quickForm.control
                                                                }
                                                                name={`splitLines.${idx}.amount`}
                                                                render={({
                                                                    field,
                                                                }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                value={
                                                                                    field.value ??
                                                                                    ''
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    field.onChange(
                                                                                        e
                                                                                            .currentTarget
                                                                                            .value ===
                                                                                            ''
                                                                                            ? undefined
                                                                                            : e
                                                                                                  .currentTarget
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
                                                                quickForm.control
                                                            }
                                                            name={`splitLines.${idx}.categoryId`}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <FormItem>
                                                                    <Select
                                                                        value={
                                                                            field.value
                                                                        }
                                                                        onValueChange={
                                                                            field.onChange
                                                                        }
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select category" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {categories.map(
                                                                                (
                                                                                    c
                                                                                ) => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            c.id
                                                                                        }
                                                                                        value={
                                                                                            c.id
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            c.accountName
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
                                                            control={
                                                                quickForm.control
                                                            }
                                                            name={`splitLines.${idx}.description`}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <FormItem className="sm:col-span-2">
                                                                    <FormControl>
                                                                        <Input
                                                                            value={
                                                                                field.value ??
                                                                                ''
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                field.onChange(
                                                                                    e
                                                                                )
                                                                            }
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
                                                                onClick={() => {
                                                                    const arr =
                                                                        [
                                                                            ...(quickForm.getValues(
                                                                                'splitLines'
                                                                            ) ||
                                                                                []),
                                                                        ];
                                                                    arr.splice(
                                                                        idx,
                                                                        1
                                                                    );
                                                                    quickForm.setValue(
                                                                        'splitLines',
                                                                        arr
                                                                    );
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const mode =
                                                            quickForm.getValues(
                                                                'splitsMode'
                                                            );
                                                        const arr = [
                                                            ...(quickForm.getValues(
                                                                'splitLines'
                                                            ) || []),
                                                        ];
                                                        arr.push({
                                                            percent:
                                                                mode ===
                                                                'percent'
                                                                    ? 0
                                                                    : undefined,
                                                            amount:
                                                                mode ===
                                                                'amount'
                                                                    ? 0
                                                                    : undefined,
                                                            categoryId: '',
                                                            description: '',
                                                        });
                                                        quickForm.setValue(
                                                            'splitLines',
                                                            arr
                                                        );
                                                    }}
                                                >
                                                    Add Split Line
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Button
                                disabled={isCreating}
                                onClick={() => {
                                    const {
                                        name,
                                        description,
                                        transactionType,
                                        matchType,
                                        autoApply,
                                        stopOnMatch,
                                        priority,
                                        accountScope,
                                        accountIdsCsv,
                                        conditionField,
                                        conditionOperator,
                                        conditionValue,
                                        caseSensitive,
                                        actionType,
                                        actionCategoryId,
                                        actionContactId,
                                        actionMemo,
                                        actionTaxIds,
                                        actionTypeValue,
                                        splitsMode,
                                        splitLines,
                                    } = quickForm.getValues();
                                    const generateId = () =>
                                        `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
                                    const condition: RuleCondition = {
                                        id: generateId(),
                                        field: conditionField,
                                        operator: conditionOperator,
                                        valueString: conditionValue,
                                        caseSensitive,
                                    };
                                    const accountIds =
                                        accountScope === 'selected'
                                            ? (accountIdsCsv || '')
                                                  .split(',')
                                                  .map((s) => s.trim())
                                                  .filter((s) => s.length > 0)
                                            : [];
                                    const actions: RuleAction[] = [];
                                    if (
                                        actionType === 'set_category' &&
                                        actionCategoryId
                                    ) {
                                        actions.push({
                                            actionType: 'set_category',
                                            payload: {
                                                categoryId: actionCategoryId,
                                            },
                                        });
                                    } else if (
                                        actionType === 'set_contact' &&
                                        actionContactId
                                    ) {
                                        actions.push({
                                            actionType: 'set_contact',
                                            payload: {
                                                contactId: actionContactId,
                                            },
                                        });
                                    } else if (
                                        actionType === 'set_memo' &&
                                        actionMemo &&
                                        actionMemo.trim().length > 0
                                    ) {
                                        actions.push({
                                            actionType: 'set_memo',
                                            payload: {
                                                memo: actionMemo.trim(),
                                            },
                                        });
                                    } else if (
                                        actionType === 'set_taxes' &&
                                        Array.isArray(actionTaxIds) &&
                                        actionTaxIds.length > 0
                                    ) {
                                        actions.push({
                                            actionType: 'set_taxes',
                                            payload: { taxIds: actionTaxIds },
                                        });
                                    } else if (
                                        actionType === 'set_type' &&
                                        actionTypeValue
                                    ) {
                                        actions.push({
                                            actionType: 'set_type',
                                            payload: {
                                                type: actionTypeValue.toLowerCase(),
                                            },
                                        });
                                    } else if (
                                        actionType === 'set_splits' &&
                                        splitsMode !== 'none' &&
                                        (splitLines || []).length > 0
                                    ) {
                                        const lines = (splitLines || []).map(
                                            (l) => {
                                                const line: Record<
                                                    string,
                                                    unknown
                                                > = {};
                                                if (
                                                    splitsMode === 'percent' &&
                                                    typeof l.percent ===
                                                        'number'
                                                ) {
                                                    line.percent = l.percent;
                                                }
                                                if (
                                                    splitsMode === 'amount' &&
                                                    typeof l.amount === 'number'
                                                ) {
                                                    line.amount = l.amount;
                                                }
                                                if (l.categoryId)
                                                    line.categoryId =
                                                        l.categoryId;
                                                if (l.description)
                                                    line.description =
                                                        l.description;
                                                return line;
                                            }
                                        );
                                        actions.push({
                                            actionType: 'set_splits',
                                            payload: {
                                                mode:
                                                    splitsMode === 'percent'
                                                        ? 'percent'
                                                        : 'amount',
                                                lines,
                                            },
                                        });
                                    } else if (actionType === 'exclude') {
                                        actions.push({
                                            actionType: 'exclude',
                                        });
                                    }
                                    const payload: CreateRulePayload = {
                                        name: name.trim(),
                                        description:
                                            description.trim() || undefined,
                                        active: true,
                                        transactionType,
                                        matchType,
                                        autoApply,
                                        stopOnMatch,
                                        priority,
                                        accountScope,
                                        accountIds,
                                        conditions: [condition],
                                        actions,
                                    };
                                    createRule(payload, {
                                        onSuccess: () => {
                                            quickForm.reset({
                                                name: 'Bank FEE',
                                                description: 'NA',
                                                transactionType: 'any',
                                                matchType: 'all',
                                                autoApply: true,
                                                stopOnMatch: true,
                                                priority: 1,
                                                accountScope: 'all',
                                                accountIdsCsv: '',
                                                conditionField: 'description',
                                                conditionOperator: 'contains',
                                                conditionValue: 'BANK FEE',
                                                caseSensitive: false,
                                                actionType: 'set_category',
                                                actionCategoryId: '',
                                                actionContactId: '',
                                                actionMemo: '',
                                                actionTaxIds: [],
                                                actionTypeValue: 'income',
                                                splitsMode: 'none',
                                                splitLines: [],
                                            });
                                        },
                                    });
                                }}
                            >
                                {isCreating ? 'Creating…' : 'Create Rule'}
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>

            <CreateRuleDrawer
                open={openCreate}
                onOpenChange={(o) => {
                    setOpenCreate(o);
                    if (!o) setEditRule(null);
                }}
                mode="create"
            />
            <CreateRuleDrawer
                open={openEdit}
                onOpenChange={(o) => {
                    setOpenEdit(o);
                    if (!o) setEditRule(null);
                }}
                rule={editRule || undefined}
                mode="edit"
            />

            <Drawer
                open={openTest}
                onOpenChange={setOpenTest}
                direction="right"
            >
                <DrawerContent className="h-full w-full sm:w-full mt-0 rounded-none flex flex-col">
                    <DrawerHeader>
                        <DrawerTitle>Test Rule</DrawerTitle>
                    </DrawerHeader>
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        <Form {...testForm}>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="text-sm text-primary/60">
                                        {ruleUnderTest
                                            ? ruleUnderTest.name
                                            : ''}
                                    </div>
                                    <div className="text-xs text-primary/50">
                                        Configure how to test this rule against
                                        transactions
                                    </div>
                                </div>
                                {!testAgainstAll && testTransaction ? (
                                    <div className="rounded-md bg-muted/40 p-3 text-xs text-primary/70">
                                        <div className="font-medium text-primary">
                                            Selected Transaction
                                        </div>
                                        <div className="mt-1">
                                            Description:{' '}
                                            {testTransaction.description || '—'}
                                        </div>
                                    </div>
                                ) : null}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-primary">
                                                Transaction type
                                            </span>
                                            <Select
                                                value={testForm.watch(
                                                    'transactionType'
                                                )}
                                                onValueChange={(val) =>
                                                    testForm.setValue(
                                                        'transactionType',
                                                        val as
                                                            | 'any'
                                                            | 'income'
                                                            | 'expense'
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="any">
                                                        Any
                                                    </SelectItem>
                                                    <SelectItem value="income">
                                                        Income
                                                    </SelectItem>
                                                    <SelectItem value="expense">
                                                        Expense
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-primary">
                                                Match type
                                            </span>
                                            <Select
                                                value={testForm.watch(
                                                    'matchType'
                                                )}
                                                onValueChange={(val) =>
                                                    testForm.setValue(
                                                        'matchType',
                                                        val as 'all' | 'any'
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All
                                                    </SelectItem>
                                                    <SelectItem value="any">
                                                        Any
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-primary">
                                                Account scope
                                            </span>
                                            <Select
                                                value={testForm.watch(
                                                    'accountScope'
                                                )}
                                                onValueChange={(val) =>
                                                    testForm.setValue(
                                                        'accountScope',
                                                        val as
                                                            | 'all'
                                                            | 'selected'
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All
                                                    </SelectItem>
                                                    <SelectItem value="selected">
                                                        Selected
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {testForm.watch('accountScope') ===
                                            'selected' && (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-primary">
                                                    Account IDs
                                                    (comma-separated)
                                                </span>
                                                <FormField
                                                    control={testForm.control}
                                                    name="accountIdsCsv"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    value={
                                                                        field.value
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        field.onChange(
                                                                            e
                                                                        )
                                                                    }
                                                                    placeholder="uuid-1, uuid-2"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-primary">
                                                Test against all
                                            </span>
                                            <span className="text-xs text-primary/50">
                                                Sample recent transactions
                                            </span>
                                        </div>
                                        <FormField
                                            control={testForm.control}
                                            name="againstAll"
                                            render={({ field }) => (
                                                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                                    <div className="w-4">
                                                        <Input
                                                            type="checkbox"
                                                            checked={
                                                                field.value
                                                            }
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .checked
                                                                )
                                                            }
                                                            inputSize="sm"
                                                            className="h-4 p-0"
                                                        />
                                                    </div>
                                                    <span className="text-sm text-primary">
                                                        Enable
                                                    </span>
                                                </label>
                                            )}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-primary">
                                                Limit
                                            </span>
                                            <span className="text-xs text-primary/50">
                                                Max transactions to test (1–500)
                                            </span>
                                        </div>
                                        <FormField
                                            control={testForm.control}
                                            name="limit"
                                            render={({ field }) => (
                                                <div className="w-24">
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={500}
                                                        value={field.value}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                        inputSize="sm"
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                    {!testForm.watch('againstAll') && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-primary">
                                                    Transaction ID
                                                </span>
                                                <span className="text-xs text-primary/50">
                                                    Test against a single
                                                    transaction
                                                </span>
                                            </div>
                                            <FormField
                                                control={testForm.control}
                                                name="transactionId"
                                                render={({ field }) => (
                                                    <div className="w-64">
                                                        <Input
                                                            type="text"
                                                            value={field.value}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e
                                                                )
                                                            }
                                                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                                            inputSize="sm"
                                                        />
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-primary">
                                                Include actions (preview)
                                            </span>
                                            <span className="text-xs text-primary/50">
                                                Use rule actions for preview
                                            </span>
                                        </div>
                                        <FormField
                                            control={testForm.control}
                                            name="includeActions"
                                            render={({ field }) => (
                                                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                                    <div className="w-4">
                                                        <Input
                                                            type="checkbox"
                                                            checked={
                                                                field.value
                                                            }
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .checked
                                                                )
                                                            }
                                                            inputSize="sm"
                                                            className="h-4 p-0"
                                                        />
                                                    </div>
                                                    <span className="text-sm text-primary">
                                                        Enable
                                                    </span>
                                                </label>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            disabled={
                                                !ruleUnderTest || isTesting
                                            }
                                            onClick={() => {
                                                if (!ruleUnderTest) return;
                                                const sanitizedConditions: RuleCondition[] =
                                                    (
                                                        ruleUnderTest.conditions ||
                                                        []
                                                    ).map((c) => {
                                                        const cond: RuleCondition =
                                                            { ...c };
                                                        if (
                                                            cond.field ===
                                                            'amount'
                                                        ) {
                                                            if (
                                                                typeof cond.valueNumber ===
                                                                'string'
                                                            ) {
                                                                const n =
                                                                    Number(
                                                                        cond.valueNumber
                                                                    );
                                                                cond.valueNumber =
                                                                    Number.isFinite(
                                                                        n
                                                                    )
                                                                        ? n
                                                                        : undefined;
                                                            }
                                                            if (
                                                                typeof cond.valueNumberTo ===
                                                                'string'
                                                            ) {
                                                                const n2 =
                                                                    Number(
                                                                        cond.valueNumberTo
                                                                    );
                                                                cond.valueNumberTo =
                                                                    Number.isFinite(
                                                                        n2
                                                                    )
                                                                        ? n2
                                                                        : undefined;
                                                            }
                                                        }
                                                        return cond;
                                                    });
                                                const {
                                                    transactionType,
                                                    matchType,
                                                    accountScope,
                                                    accountIdsCsv,
                                                    againstAll,
                                                    limit,
                                                    transactionId,
                                                    includeActions,
                                                } = testForm.getValues();
                                                const accountIds =
                                                    accountScope === 'selected'
                                                        ? (accountIdsCsv || '')
                                                              .split(',')
                                                              .map((s) =>
                                                                  s.trim()
                                                              )
                                                              .filter(
                                                                  (s) =>
                                                                      s.length >
                                                                      0
                                                              )
                                                        : [];
                                                const payload: TestRulePayload =
                                                    {
                                                        transactionType,
                                                        matchType,
                                                        conditions:
                                                            sanitizedConditions,
                                                        actions: includeActions
                                                            ? ruleUnderTest.actions ||
                                                              []
                                                            : undefined,
                                                        accountScope,
                                                        accountIds,
                                                        testAgainstAll:
                                                            againstAll,
                                                        transactionId:
                                                            againstAll
                                                                ? undefined
                                                                : transactionId ||
                                                                  undefined,
                                                        limit,
                                                    };
                                                setTestErrorMessage(null);
                                                runRuleTest(payload, {
                                                    onSuccess: (res) => {
                                                        setTestResult(
                                                            res.data || null
                                                        );
                                                    },
                                                    onError: (
                                                        error: unknown
                                                    ) => {
                                                        const maybeAxiosError =
                                                            error as {
                                                                response?: {
                                                                    data?: {
                                                                        message?: string;
                                                                    };
                                                                };
                                                            };
                                                        const message =
                                                            maybeAxiosError
                                                                .response?.data
                                                                ?.message ||
                                                            'Failed to test rule';
                                                        setTestErrorMessage(
                                                            message
                                                        );
                                                    },
                                                });
                                            }}
                                        >
                                            {isTesting
                                                ? 'Testing…'
                                                : 'Run Test'}
                                        </Button>
                                    </div>
                                </div>

                                {testErrorMessage && (
                                    <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {testErrorMessage}
                                    </div>
                                )}

                                {testResult && (
                                    <div className="space-y-3 border-t pt-4">
                                        <div className="text-sm text-primary">
                                            Tested {testResult.totalTested} •
                                            Matched {testResult.totalMatched}
                                        </div>
                                        <div className="space-y-2">
                                            {(testResult.matches || []).map(
                                                (m) => (
                                                    <div
                                                        key={m.transactionId}
                                                        className="flex items-start justify-between rounded border px-3 py-2"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-primary/60">
                                                                Transaction
                                                            </span>
                                                            <span className="text-sm font-medium text-primary">
                                                                {
                                                                    m.transactionId
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="text-sm">
                                                            {m.match ? (
                                                                <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">
                                                                    Matched
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                                                    No match
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Form>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default Rulespage;
