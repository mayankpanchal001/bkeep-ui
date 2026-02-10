import { FileUp, MoreVertical } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import ImportContactsDrawer from '../../components/contacts/ImportContactsDrawer';
import { Icons } from '../../components/shared/Icons';
import PageHeader from '../../components/shared/PageHeader';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import Input from '../../components/ui/input';
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
import {
    useContacts,
    useDeleteContact,
    useDisableContact,
    useEnableContact,
    useRestoreContact,
} from '../../services/apis/contactsApi';
import { Contact, ContactsQueryParams } from '../../types/contact';

// Helper function to get contact initials
const getContactInitials = (contact: Contact): string => {
    if (contact.firstName && contact.lastName) {
        return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
    }
    if (contact.displayName) {
        const parts = contact.displayName.trim().split(/\s+/);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return contact.displayName.substring(0, 2).toUpperCase();
    }
    return '??';
};

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
        const mins = Math.floor(diffInSeconds / 60);
        return `${mins}m ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    }
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    }
    return date.toLocaleDateString();
};

const ContactsPage = () => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
    const [sortKey, setSortKey] = useState<string | null>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [filters, setFilters] = useState<ContactsQueryParams>({
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'desc',
    });
    const navigate = useNavigate();
    const [isImportDrawerOpen, setIsImportDrawerOpen] = useState(false);

    const { data, isLoading, isError } = useContacts(filters);
    const pagination = data?.data?.pagination;
    const contacts = useMemo(
        () => data?.data?.items || [],
        [data?.data?.items]
    );

    const { mutateAsync: deleteContact, isPending: isDeleting } =
        useDeleteContact();
    const { mutateAsync: enableContact, isPending: isEnabling } =
        useEnableContact();
    const { mutateAsync: disableContact, isPending: isDisabling } =
        useDisableContact();
    const { mutateAsync: restoreContact, isPending: isRestoring } =
        useRestoreContact();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Update filters when debounced search changes
    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            search: debouncedSearch || undefined,
            page: 1,
        }));
    }, [debouncedSearch]);

    const rowIds = useMemo(
        () => contacts.map((c: Contact) => c.id),
        [contacts]
    );

    const handlePageChange = (page: number) =>
        setFilters((prev) => ({ ...prev, page }));

    const handleSortChange = (key: string, direction: SortDirection) => {
        setSortKey(direction ? key : null);
        setSortDirection(direction);
        setFilters((prev) => ({
            ...prev,
            sort: key,
            order: direction || 'desc',
            page: 1,
        }));
    };

    const handleFilterChange = (
        key: keyof ContactsQueryParams,
        value: boolean | string | undefined
    ) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1,
        }));
    };

    const handleEnable = async (contact: Contact) => {
        await enableContact(contact.id);
    };

    const handleDisable = async (contact: Contact) => {
        await disableContact(contact.id);
    };

    const handleDelete = async (contact: Contact) => {
        if (
            window.confirm(
                `Are you sure you want to delete ${contact.displayName}?`
            )
        ) {
            await deleteContact(contact.id);
        }
    };

    const handleRestore = async (contact: Contact) => {
        await restoreContact(contact.id);
    };

    const isRowActionBusy =
        isDeleting || isEnabling || isDisabling || isRestoring;

    const handleGoToCreate = () => navigate('/expenses/contacts/new');
    const handleEdit = (contact: Contact) =>
        navigate(`/expenses/contacts/${contact.id}`);

    const handleBulkDelete = async () => {
        if (
            window.confirm(
                `Are you sure you want to delete ${selectedItems.length} contact(s)?`
            )
        ) {
            await Promise.all(
                selectedItems.map((id) => deleteContact(String(id)))
            );
            setSelectedItems([]);
        }
    };

    const handleImportClick = () => {
        setIsImportDrawerOpen(true);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <PageHeader
                title="Contacts"
                subtitle="Manage your customers and suppliers"
            />

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 w-full sm:max-w-md">
                    <Input
                        id="search"
                        type="search"
                        placeholder="Search contacts by name, email, or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        startIcon={<Icons.Search className="w-4 h-4" />}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handleFilterChange(
                                'type',
                                filters.type === 'customer'
                                    ? undefined
                                    : 'customer'
                            )
                        }
                        className={
                            filters.type === 'customer'
                                ? 'bg-primary/10 border-primary/20'
                                : ''
                        }
                    >
                        <Icons.UserCircle className="w-4 h-4 mr-2" />
                        Customers
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handleFilterChange(
                                'type',
                                filters.type === 'supplier'
                                    ? undefined
                                    : 'supplier'
                            )
                        }
                        className={
                            filters.type === 'supplier'
                                ? 'bg-primary/10 border-primary/20'
                                : ''
                        }
                    >
                        <Icons.Building className="w-4 h-4 mr-2" />
                        Suppliers
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            handleFilterChange(
                                'isActive',
                                filters.isActive === true ? undefined : true
                            )
                        }
                        className={
                            filters.isActive === true
                                ? 'bg-primary/10 border-primary/20'
                                : ''
                        }
                    >
                        <Icons.Check className="w-4 h-4 mr-2" />
                        Active Only
                    </Button>
                    {(filters.type || filters.isActive) && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setFilters((prev) => ({
                                    ...prev,
                                    type: undefined,
                                    isActive: undefined,
                                    page: 1,
                                }));
                            }}
                        >
                            <Icons.Close className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                    )}

                    <Button onClick={handleImportClick} variant="outline">
                        <FileUp size={16} className="mr-2" /> Import
                    </Button>

                    <Button
                        type="button"
                        onClick={handleGoToCreate}
                        className="shrink-0"
                    >
                        <Icons.Plus className="mr-2 w-4 h-4" />
                        New Contact
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex flex-col flex-1 min-h-0">
                <Table
                    containerClassName="h-full"
                    enableSelection
                    rowIds={rowIds}
                    selectedIds={selectedItems}
                    onSelectionChange={setSelectedItems}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                >
                    <TableSelectionToolbar>
                        <span className="text-sm text-primary/70 font-medium">
                            {selectedItems.length} selected
                        </span>
                        {selectedItems.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={isDeleting}
                            >
                                <Icons.Trash className="mr-2 w-4 h-4" />
                                Delete Selected
                            </Button>
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
                                className="min-w-[200px]"
                            >
                                Contact
                            </TableHead>
                            <TableHead className="min-w-[100px]">
                                Type
                            </TableHead>
                            <TableHead className="min-w-[200px]">
                                Contact Info
                            </TableHead>
                            <TableHead className="min-w-[100px]">
                                Status
                            </TableHead>
                            <TableHead
                                sortable
                                sortKey="createdAt"
                                className="min-w-[140px]"
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
                                <TableCell colSpan={7}>
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                                            <Icons.Close className="w-6 h-6 text-destructive" />
                                        </div>
                                        <p className="text-sm font-medium text-destructive">
                                            Failed to load contacts
                                        </p>
                                        <p className="text-xs text-primary/60 mt-1">
                                            Please try refreshing the page
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : isLoading ? (
                            <TableLoadingState colSpan={7} rows={5} />
                        ) : contacts.length === 0 ? (
                            <TableEmptyState
                                colSpan={7}
                                message="No contacts found"
                                description={
                                    search || filters.type || filters.isActive
                                        ? 'Try adjusting your search or filters'
                                        : 'Get started by creating your first contact'
                                }
                                action={
                                    !search &&
                                        !filters.type &&
                                        !filters.isActive ? (
                                        <Button
                                            size="sm"
                                            onClick={handleGoToCreate}
                                        >
                                            <Icons.Plus className="w-4 h-4 mr-2" />
                                            Create Contact
                                        </Button>
                                    ) : null
                                }
                            />
                        ) : (
                            contacts.map((contact: Contact) => (
                                <TableRow
                                    key={contact.id}
                                    rowId={contact.id}
                                    className="hover:bg-primary/5 cursor-pointer"
                                    onClick={() => handleEdit(contact)}
                                >
                                    <TableCell
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <TableRowCheckbox rowId={contact.id} />
                                    </TableCell>
                                    <TableCell className="">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-10">
                                                <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 text-primary font-medium">
                                                    {getContactInitials(
                                                        contact
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-primary text-xm">
                                                    {contact.displayName}
                                                </span>
                                                {contact.companyName && (
                                                    <span className="text-[10px] text-primary/60">
                                                        {contact.companyName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="">
                                        <Badge
                                            variant={
                                                contact.type === 'customer'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className="capitalize"
                                        >
                                            {contact.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="">
                                        <div className="flex flex-col gap-1">
                                            {contact.email && (
                                                <div className="flex items-center gap-2 text-sm text-primary/75">
                                                    <Icons.Mail className="w-3.5 h-3.5" />
                                                    <span className="truncate">
                                                        {contact.email}
                                                    </span>
                                                </div>
                                            )}
                                            {contact.phoneNumber && (
                                                <div className="flex items-center gap-2 text-sm text-primary/75">
                                                    <Icons.Phone className="w-3.5 h-3.5" />
                                                    <span>
                                                        {contact.phoneNumber}
                                                    </span>
                                                </div>
                                            )}
                                            {!contact.email &&
                                                !contact.phoneNumber && (
                                                    <span className="text-xm text-primary/50">
                                                        No contact info
                                                    </span>
                                                )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="">
                                        <Badge
                                            variant={
                                                contact.isActive
                                                    ? 'success'
                                                    : 'destructive'
                                            }
                                            className="text-[10px] px-1.5 py-0 h-5"
                                        >
                                            {contact.isActive
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="">
                                        <div className="flex flex-col">
                                            <span className="text-xm text-primary/75">
                                                {new Date(
                                                    contact.createdAt
                                                ).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] text-primary/50">
                                                {formatRelativeTime(
                                                    contact.createdAt
                                                )}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        className=""
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="min-w-[1rem]"
                                                    disabled={isRowActionBusy}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>
                                                    Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
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
                                                        disabled={
                                                            isRowActionBusy
                                                        }
                                                        onSelect={() =>
                                                            void handleDisable(
                                                                contact
                                                            )
                                                        }
                                                    >
                                                        <Icons.Close className="mr-2 w-4 h-4" />
                                                        Disable
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        disabled={
                                                            isRowActionBusy
                                                        }
                                                        onSelect={() =>
                                                            void handleEnable(
                                                                contact
                                                            )
                                                        }
                                                    >
                                                        <Icons.Check className="mr-2 w-4 h-4" />
                                                        Enable
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    disabled={isRowActionBusy}
                                                    onSelect={() =>
                                                        void handleRestore(
                                                            contact
                                                        )
                                                    }
                                                >
                                                    <Icons.Check className="mr-2 w-4 h-4" />
                                                    Restore
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    disabled={isRowActionBusy}
                                                    onSelect={() =>
                                                        void handleDelete(
                                                            contact
                                                        )
                                                    }
                                                >
                                                    <Icons.Trash className="mr-2 w-4 h-4" />
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
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <TablePagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit || 10}
                    onPageChange={handlePageChange}
                />
            )}
            <ImportContactsDrawer
                isOpen={isImportDrawerOpen}
                onClose={() => setIsImportDrawerOpen(false)}
            />
        </div>
    );
};

export default ContactsPage;
