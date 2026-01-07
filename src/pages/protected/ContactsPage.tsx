import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
    useContacts,
    useDeleteContact,
    useDisableContact,
    useEnableContact,
    useRestoreContact,
} from '../../services/apis/contactsApi';
import { Contact, ContactsQueryParams } from '../../types/contact';
import { Icons } from '../../components/shared/Icons';
import Button from '../../components/typography/Button';
import Chips from '../../components/typography/Chips';
import { InputField } from '../../components/typography/InputFields';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
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
} from '../../components/ui/table';

const ContactsPage = () => {
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
    const navigate = useNavigate();

    const { data, isLoading, isError } = useContacts(filters);
    const pagination = data?.data?.pagination;

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

    const handleGoToCreate = () => navigate('/expenses/contacts/new');
    const handleEdit = (contact: Contact) =>
        navigate(`/expenses/contacts/${contact.id}`);

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
                                    <span
                                        className="font-medium text-primary text-sm cursor-pointer hover:underline"
                                        onClick={() => handleEdit(contact)}
                                    >
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
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleEdit(contact)
                                                }
                                            >
                                                <Icons.Edit className="mr-2 w-4 h-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
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

export default ContactsPage;
