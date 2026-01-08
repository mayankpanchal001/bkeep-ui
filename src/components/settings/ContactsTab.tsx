import { showErrorToast } from '@/utills/toast.tsx';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
    useContacts,
    useCreateContact,
    useDeleteContact,
    useDisableContact,
    useEnableContact,
    useRestoreContact,
} from '../../services/apis/contactsApi';
import {
    Contact,
    ContactsQueryParams,
    ContactType,
    CreateContactPayload,
} from '../../types/contact';
import { Icons } from '../shared/Icons';
import Button from '../typography/Button';
import Chips from '../typography/Chips';
import { InputField, SelectField } from '../typography/InputFields';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableEmptyState,
    TableHead,
    TableHeader,
    TableLoadingState,
    TablePagination,
    TableRow,
    TableRowCheckbox,
    TableSelectAllCheckbox,
    TableSelectionToolbar,
    type SortDirection,
} from '../ui/table';

const contactTypeOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'supplier', label: 'Supplier' },
];

const ContactsTab = () => {
    const [search, setSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
    const [sortKey, setSortKey] = useState<string | null>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [filters, setFilters] = useState<ContactsQueryParams>({
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'asc',
    });
    const location = useLocation();
    const navigate = useNavigate();
    const isCreatePage = location.pathname === '/settings/contacts/new';

    const { data, isLoading, isError } = useContacts(filters);
    const pagination = data?.data?.pagination;

    const { mutateAsync: createContact, isPending: isCreating } =
        useCreateContact();
    const { mutateAsync: deleteContact, isPending: isDeleting } =
        useDeleteContact();
    const { mutateAsync: enableContact, isPending: isEnabling } =
        useEnableContact();
    const { mutateAsync: disableContact, isPending: isDisabling } =
        useDisableContact();
    const { mutateAsync: restoreContact, isPending: isRestoring } =
        useRestoreContact();

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setFilters((prev) => ({
                ...prev,
                search: search.trim() || undefined,
                page: 1,
            }));
        }, 300);
        return () => window.clearTimeout(handle);
    }, [search]);

    const displayed = useMemo(() => {
        const contacts = data?.data?.items || [];
        const list = [...contacts];
        if (!sortKey || !sortDirection) return list;
        const direction = sortDirection === 'asc' ? 1 : -1;
        list.sort((a, b) => {
            if (sortKey === 'createdAt') {
                return (
                    (new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()) *
                    direction
                );
            }
            if (sortKey === 'displayName') {
                return a.displayName.localeCompare(b.displayName) * direction;
            }
            return 0;
        });
        return list;
    }, [data, sortKey, sortDirection]);

    const rowIds = useMemo(
        () => displayed.map((c: Contact) => c.id),
        [displayed]
    );

    const handlePageChange = (page: number) =>
        setFilters((prev) => ({ ...prev, page }));

    const copyBillingToShipping = (form: HTMLFormElement) => {
        const fields = [
            'streetAddress1',
            'streetAddress2',
            'city',
            'province',
            'postalCode',
            'country',
        ];
        fields.forEach((field) => {
            const b = form.querySelector<HTMLInputElement>(`#billing_${field}`);
            const s = form.querySelector<HTMLInputElement>(
                `#shipping_${field}`
            );
            if (b && s) s.value = b.value;
        });
    };

    const handleSubmitCreate = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const payload: CreateContactPayload = {
            type: (formData.get('type') as ContactType) || 'customer',
            displayName: (formData.get('displayName') as string) || '',
            companyName: (formData.get('companyName') as string) || null,
            title: (formData.get('title') as string) || null,
            firstName: (formData.get('firstName') as string) || null,
            middleName: (formData.get('middleName') as string) || null,
            lastName: (formData.get('lastName') as string) || null,
            suffix: (formData.get('suffix') as string) || null,
            email: (formData.get('email') as string) || null,
            phoneNumber: (formData.get('phoneNumber') as string) || null,
            nameOnCheques: (formData.get('nameOnCheques') as string) || null,
            defaultAccountId:
                (formData.get('defaultAccountId') as string) || null,
            defaultTaxId: (formData.get('defaultTaxId') as string) || null,
            openingBalance:
                formData.get('openingBalance') !== null &&
                formData.get('openingBalance') !== ''
                    ? Number(formData.get('openingBalance'))
                    : null,
            openingBalanceDate:
                (formData.get('openingBalanceDate') as string) || null,
            notes: (formData.get('notes') as string) || null,
            billingAddress: {
                streetAddress1:
                    (formData.get('billing_streetAddress1') as string) || null,
                streetAddress2:
                    (formData.get('billing_streetAddress2') as string) || null,
                city: (formData.get('billing_city') as string) || null,
                province: (formData.get('billing_province') as string) || null,
                postalCode:
                    (formData.get('billing_postalCode') as string) || null,
                country: (formData.get('billing_country') as string) || null,
            },
            shippingAddress: {
                streetAddress1:
                    (formData.get('shipping_streetAddress1') as string) || null,
                streetAddress2:
                    (formData.get('shipping_streetAddress2') as string) || null,
                city: (formData.get('shipping_city') as string) || null,
                province: (formData.get('shipping_province') as string) || null,
                postalCode:
                    (formData.get('shipping_postalCode') as string) || null,
                country: (formData.get('shipping_country') as string) || null,
            },
        };

        if (!payload.displayName) {
            showErrorToast('Display name is required');
            return;
        }

        await createContact(payload);
        form.reset();
        navigate('/settings/contacts');
    };

    const handleEnable = async (contact: Contact) => {
        await enableContact(contact.id);
    };
    const handleDisable = async (contact: Contact) => {
        await disableContact(contact.id);
    };
    const handleDelete = async (contact: Contact) => {
        await deleteContact(contact.id);
    };
    const handleRestore = async (contact: Contact) => {
        await restoreContact(contact.id);
    };

    const isRowActionBusy =
        isDeleting || isEnabling || isDisabling || isRestoring;

    const handleGoToCreate = () => navigate('/settings/contacts/new');
    const handleBackToList = () => navigate('/settings/contacts');

    if (isCreatePage) {
        return (
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-primary">
                            New Contact
                        </div>
                        <div className="text-xs text-primary/50">
                            Create a customer or supplier
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBackToList}
                    >
                        Back
                    </Button>
                </div>

                <form onSubmit={handleSubmitCreate} className="space-y-4">
                    <div className="space-y-4">
                        <div className="rounded-md border border-primary/10 p-4 space-y-3">
                            <div className="text-sm font-semibold text-primary">
                                Basic Information
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <SelectField
                                        id="type"
                                        label="Type"
                                        labelShow
                                        required
                                        defaultValue="customer"
                                        options={contactTypeOptions}
                                    />
                                    <InputField
                                        id="displayName"
                                        label="Display Name"
                                        required
                                        placeholder="Acme Corporation"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                                    <div className="sm:col-span-1">
                                        <InputField
                                            id="title"
                                            label="Title"
                                            placeholder="Mr."
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <InputField
                                            id="firstName"
                                            label="First Name"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <InputField
                                            id="middleName"
                                            label="Middle"
                                            placeholder="A."
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <InputField
                                            id="lastName"
                                            label="Last Name"
                                            placeholder="Doe"
                                        />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <InputField
                                            id="suffix"
                                            label="Suffix"
                                            placeholder="Jr."
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <InputField
                                            id="companyName"
                                            label="Company Name"
                                            placeholder="Acme Corporation"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <InputField
                                            id="nameOnCheques"
                                            label="Name on Cheques"
                                            placeholder="Acme Corporation"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <InputField
                                        id="email"
                                        label="Email"
                                        type="email"
                                        placeholder="john.doe@acme.com"
                                    />
                                    <InputField
                                        id="phoneNumber"
                                        label="Phone"
                                        placeholder="+1-555-123-4567"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border border-primary/10 p-4 space-y-3">
                            <div className="text-sm font-semibold text-primary">
                                Financial Defaults
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <InputField
                                    id="defaultAccountId"
                                    label="Default Account ID"
                                />
                                <InputField
                                    id="defaultTaxId"
                                    label="Default Tax ID"
                                />
                                <InputField
                                    id="openingBalance"
                                    label="Opening Balance"
                                    type="number"
                                    step="0.01"
                                />
                                <InputField
                                    id="openingBalanceDate"
                                    label="Opening Balance Date"
                                    type="date"
                                />
                            </div>
                        </div>

                        <div className="rounded-md border border-primary/10 p-4 space-y-3">
                            <div className="text-sm font-semibold text-primary">
                                Notes
                            </div>
                            <InputField
                                id="notes"
                                label="Notes"
                                placeholder="Important supplier for office supplies"
                            />
                        </div>

                        <div className="rounded-md border border-primary/10 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="text-sm font-semibold text-primary">
                                    Addresses
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) =>
                                        copyBillingToShipping(
                                            e.currentTarget.closest(
                                                'form'
                                            ) as HTMLFormElement
                                        )
                                    }
                                >
                                    Copy Billing to Shipping
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-primary/70">
                                        Billing Address
                                    </div>
                                    <InputField
                                        id="billing_streetAddress1"
                                        label="Street 1"
                                    />
                                    <InputField
                                        id="billing_streetAddress2"
                                        label="Street 2"
                                    />
                                    <InputField
                                        id="billing_city"
                                        label="City"
                                    />
                                    <InputField
                                        id="billing_province"
                                        label="Province"
                                    />
                                    <InputField
                                        id="billing_postalCode"
                                        label="Postal Code"
                                    />
                                    <InputField
                                        id="billing_country"
                                        label="Country"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-primary/70">
                                        Shipping Address
                                    </div>
                                    <InputField
                                        id="shipping_streetAddress1"
                                        label="Street 1"
                                    />
                                    <InputField
                                        id="shipping_streetAddress2"
                                        label="Street 2"
                                    />
                                    <InputField
                                        id="shipping_city"
                                        label="City"
                                    />
                                    <InputField
                                        id="shipping_province"
                                        label="Province"
                                    />
                                    <InputField
                                        id="shipping_postalCode"
                                        label="Postal Code"
                                    />
                                    <InputField
                                        id="shipping_country"
                                        label="Country"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBackToList}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isCreating}
                        >
                            Create
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="w-full sm:min-w-[320px]">
                    <InputField
                        id="search"
                        type="search"
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleGoToCreate}
                    className="shrink-0"
                >
                    <Icons.Plus className="mr-2 w-4 h-4" /> New Contact
                </Button>
            </div>

            <Table
                enableSelection
                rowIds={rowIds}
                selectedIds={selectedItems}
                onSelectionChange={setSelectedItems}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortChange={(key, dir) => {
                    setSortKey(dir ? key : null);
                    setSortDirection(dir);
                }}
            >
                <TableSelectionToolbar className="px-4 py-2">
                    <span className="text-sm text-primary/70 font-medium">
                        {selectedItems.length} selected
                    </span>
                    {isLoading && (
                        <span className="ml-auto text-sm text-primary/60">
                            Loading...
                        </span>
                    )}
                </TableSelectionToolbar>
                <TableHeader>
                    <tr>
                        <TableHead className="w-12">
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead
                            sortable
                            sortKey="displayName"
                            className="min-w-[180px]"
                        >
                            Name
                        </TableHead>
                        <TableHead className="min-w-[100px]">Type</TableHead>
                        <TableHead className="min-w-[200px]">Email</TableHead>
                        <TableHead className="min-w-[140px]">Phone</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead
                            sortable
                            sortKey="createdAt"
                            className="min-w-[120px]"
                        >
                            Created
                        </TableHead>
                        <TableHead className="w-16 text-center">
                            Actions
                        </TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {isError ? (
                        <TableRow>
                            <TableCell colSpan={8}>
                                <div className="text-sm text-red-600">
                                    Failed to load contacts
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : isLoading ? (
                        <TableLoadingState colSpan={8} />
                    ) : displayed.length === 0 ? (
                        <TableEmptyState
                            colSpan={8}
                            message="No contacts found"
                            description="Add your first contact to get started"
                            action={
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleGoToCreate}
                                >
                                    <Icons.Plus className="w-4 h-4 mr-2" />
                                    New Contact
                                </Button>
                            }
                        />
                    ) : (
                        displayed.map((contact) => (
                            <TableRow key={contact.id} rowId={contact.id}>
                                <TableCell className="py-3">
                                    <TableRowCheckbox rowId={contact.id} />
                                </TableCell>
                                <TableCell className="py-3">
                                    <span className="font-medium text-primary text-sm">
                                        {contact.displayName}
                                    </span>
                                </TableCell>
                                <TableCell className="py-3">
                                    <span className="text-primary/75 capitalize text-sm">
                                        {contact.type}
                                    </span>
                                </TableCell>
                                <TableCell className="py-3">
                                    <span className="text-primary/75 text-sm">
                                        {contact.email || '—'}
                                    </span>
                                </TableCell>
                                <TableCell className="py-3">
                                    <span className="text-primary/75 text-sm">
                                        {contact.phoneNumber || '—'}
                                    </span>
                                </TableCell>
                                <TableCell className="py-3">
                                    <Chips
                                        label={
                                            contact.isActive
                                                ? 'Active'
                                                : 'Inactive'
                                        }
                                        variant={
                                            contact.isActive
                                                ? 'success'
                                                : 'danger'
                                        }
                                    />
                                </TableCell>
                                <TableCell className="py-3">
                                    <span className="whitespace-nowrap text-primary/70 text-sm">
                                        {new Date(
                                            contact.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                </TableCell>
                                <TableCell className="py-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                disabled={isRowActionBusy}
                                                aria-label="Row actions"
                                            >
                                                <Icons.More className="w-4 h-4 text-primary/70" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-48"
                                        >
                                            {contact.isActive ? (
                                                <DropdownMenuItem
                                                    disabled={isRowActionBusy}
                                                    onSelect={() =>
                                                        void handleDisable(
                                                            contact
                                                        )
                                                    }
                                                >
                                                    Disable
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    disabled={isRowActionBusy}
                                                    onSelect={() =>
                                                        void handleEnable(
                                                            contact
                                                        )
                                                    }
                                                >
                                                    Enable
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                disabled={isRowActionBusy}
                                                onSelect={() =>
                                                    void handleRestore(contact)
                                                }
                                            >
                                                Restore
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                variant="destructive"
                                                disabled={isRowActionBusy}
                                                onSelect={() =>
                                                    void handleDelete(contact)
                                                }
                                            >
                                                <Icons.Trash className="w-4 h-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {pagination && pagination.totalPages > 1 && (
                <TablePagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit || 10}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default ContactsTab;
