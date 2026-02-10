import { useEffect, useMemo, useState } from 'react';
import { useGetRoles } from '../../services/apis/roleApi';
import {
    useInvitations,
    useResendInvitation,
    useRevokeInvitation,
    useUsers,
    type InvitationsQueryParams,
    type PendingInvitation,
    type UsersQueryParams,
} from '../../services/apis/usersApi';

import { UserType } from '../../types';
import { Icons } from '../shared/Icons';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import Input from '../ui/input';
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
import EditUserModal from './EditUserModal';
import InviteUserModal from './InviteUserModal';

// Helper function to get user initials
const getUserInitials = (name: string): string => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
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

const UsersTab = () => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
    const [selectedInvitations, setSelectedInvitations] = useState<
        (string | number)[]
    >([]);
    const [sortKey, setSortKey] = useState<string | null>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [filters, setFilters] = useState<UsersQueryParams>({
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'asc',
    });

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

    const { data, isLoading, isError } = useUsers(filters);

    const { data: rolesData } = useGetRoles();
    const roles = rolesData?.data?.items || [];

    const { mutateAsync: resendInvitation, isPending: isResendingInvitation } =
        useResendInvitation();
    const { mutateAsync: revokeInvitation, isPending: isRevokingInvitation } =
        useRevokeInvitation();

    const [invitationFilters, setInvitationFilters] =
        useState<InvitationsQueryParams>({
            page: 1,
            limit: 10,
            sort: 'createdAt',
            order: 'asc',
        });

    const {
        data: invitationsData,
        isLoading: isLoadingInvitations,
        isError: isInvitationsError,
    } = useInvitations(invitationFilters);

    const handleEditUser = (user: UserType) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setDebouncedSearch(search.trim());
    };

    const handleClearSearch = () => {
        setSearch('');
        setDebouncedSearch('');
    };

    const handleResendInvitation = async (invitationId: string) => {
        try {
            await resendInvitation(invitationId);
        } catch (error) {
            console.error('Resend invitation error:', error);
        }
    };

    const handleRevokeInvitation = async (invitationId: string) => {
        try {
            await revokeInvitation(invitationId);
        } catch (error) {
            console.error('Revoke invitation error:', error);
        }
    };

    const handleInvitationPageChange = (newPage: number) => {
        setInvitationFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const handleFilterChange = (
        key: keyof UsersQueryParams,
        value: boolean | undefined
    ) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1,
        }));
    };

    const handleSortChange = (key: string, direction: SortDirection) => {
        setSortKey(direction ? key : null);
        setSortDirection(direction);
        setFilters((prev) => ({
            ...prev,
            sort: key,
            order: direction || 'asc',
            page: 1,
        }));
    };

    const users = useMemo(() => data?.data?.items || [], [data?.data?.items]);
    const pagination = data?.data?.pagination;
    const pendingInvitations = useMemo(
        () => invitationsData?.data?.items || [],
        [invitationsData?.data?.items]
    );
    const invitationsPagination = invitationsData?.data?.pagination;
    const userRowIds = users.map((u: UserType) => u.id);
    const invitationRowIds = pendingInvitations.map(
        (i: PendingInvitation) => i.id
    );

    const handleBulkExport = () => {
        console.log('Exporting users:', selectedItems);
        setSelectedItems([]);
    };

    const handleBulkRevokeInvitations = async () => {
        try {
            await Promise.all(
                selectedInvitations.map((id) => revokeInvitation(String(id)))
            );
            setSelectedInvitations([]);
        } catch (error) {
            console.error('Bulk revoke error:', error);
        }
    };

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <Icons.Close className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">
                    Failed to load users
                </h3>
                <p className="text-sm text-primary/60 text-center max-w-md">
                    There was an error loading the users. Please try refreshing
                    the page.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary">
                        Users Management
                    </h2>
                    <p className="text-sm text-primary/60 mt-1">
                        Manage your team members and their access
                    </p>
                </div>
                <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
                    <Icons.Plus className="mr-2 w-4 h-4" />
                    Invite User
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4">
                <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-2"
                >
                    <div className="flex-1 relative">
                        <Input
                            id="user-search"
                            placeholder="Search users by name or email..."
                            value={search}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setSearch(e.target.value)}
                            startIcon={<Icons.Search className="w-4 h-4" />}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-primary/50 hover:text-primary transition-colors"
                                aria-label="Clear search"
                            >
                                <Icons.Close className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <Button
                        type="submit"
                        size="sm"
                        startIcon={<Icons.Search className="w-4 h-4" />}
                        disabled={isLoading}
                    >
                        Search
                    </Button>
                </form>

                {/* Filter Chips */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-primary/60 mr-1">
                        Filters:
                    </span>
                    <button
                        type="button"
                        onClick={() =>
                            handleFilterChange(
                                'isVerified',
                                filters.isVerified === true ? undefined : true
                            )
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            filters.isVerified === true
                                ? 'bg-secondary text-foreground'
                                : 'bg-primary/5 text-primary/70 hover:bg-primary/10'
                        }`}
                    >
                        <Icons.Check className="inline w-3 h-3 mr-1" />
                        Verified Only
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            handleFilterChange(
                                'isActive',
                                filters.isActive === true ? undefined : true
                            )
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            filters.isActive === true
                                ? 'bg-secondary text-foreground'
                                : 'bg-primary/5 text-primary/70 hover:bg-primary/10'
                        }`}
                    >
                        <Icons.UserCircle className="inline w-3 h-3 mr-1" />
                        Active Only
                    </button>
                    {(filters.isVerified === true ||
                        filters.isActive === true) && (
                        <button
                            type="button"
                            onClick={() => {
                                setFilters((prev) => ({
                                    ...prev,
                                    isVerified: undefined,
                                    isActive: undefined,
                                    page: 1,
                                }));
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary/5 text-primary/70 hover:bg-primary/10 transition-colors"
                        >
                            <Icons.Close className="inline w-3 h-3 mr-1" />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Pending Invitations Section */}
            {pendingInvitations.length > 0 || isLoadingInvitations ? (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-primary">
                                Pending Invitations
                            </h3>
                            <p className="text-sm text-primary/60 mt-1">
                                {invitationsPagination?.total ||
                                    pendingInvitations.length ||
                                    0}{' '}
                                invitation
                                {(invitationsPagination?.total ||
                                    pendingInvitations.length ||
                                    0) !== 1
                                    ? 's'
                                    : ''}{' '}
                                awaiting acceptance
                            </p>
                        </div>
                    </div>

                    {isInvitationsError ? (
                        <div className="text-center py-8 text-destructive">
                            Failed to load invitations. Please try again.
                        </div>
                    ) : (
                        <>
                            <Table
                                enableSelection
                                rowIds={invitationRowIds}
                                selectedIds={selectedInvitations}
                                onSelectionChange={setSelectedInvitations}
                            >
                                <TableSelectionToolbar>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkRevokeInvitations}
                                        disabled={isRevokingInvitation}
                                    >
                                        <Icons.Trash className="mr-2 w-4 h-4" />
                                        Revoke Selected
                                    </Button>
                                </TableSelectionToolbar>

                                <TableHeader>
                                    <tr>
                                        <TableHead>
                                            <TableSelectAllCheckbox />
                                        </TableHead>
                                        <TableHead>Invitee</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead sortable sortKey="createdAt">
                                            Invited At
                                        </TableHead>
                                        <TableHead align="center">
                                            Actions
                                        </TableHead>
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingInvitations ? (
                                        <TableLoadingState
                                            colSpan={6}
                                            rows={3}
                                        />
                                    ) : pendingInvitations.length === 0 ? (
                                        <TableEmptyState
                                            colSpan={6}
                                            message="No pending invitations"
                                            description="All invitations have been accepted or revoked"
                                        />
                                    ) : (
                                        pendingInvitations.map(
                                            (invitation: PendingInvitation) => (
                                                <TableRow
                                                    key={invitation.id}
                                                    rowId={invitation.id}
                                                >
                                                    <TableCell>
                                                        <TableRowCheckbox
                                                            rowId={
                                                                invitation.id
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-medium text-secondary">
                                                                {getUserInitials(
                                                                    invitation.userName
                                                                )}
                                                            </div>
                                                            <span className="font-medium text-primary">
                                                                {
                                                                    invitation.userName
                                                                }
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-primary/75">
                                                            {invitation.email}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-primary/75">
                                                            {invitation.tenant
                                                                ?.name || '—'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-primary/75 text-sm">
                                                                {new Date(
                                                                    invitation.createdAt
                                                                ).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-primary/50 text-xs">
                                                                {formatRelativeTime(
                                                                    invitation.createdAt
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="min-w-[1rem]"
                                                                >
                                                                    <Icons.More className="w-4 shrink-0 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="center">
                                                                <DropdownMenuLabel>
                                                                    Actions
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleResendInvitation(
                                                                            invitation.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isResendingInvitation
                                                                    }
                                                                >
                                                                    <Icons.Send className="mr-2 w-4 h-4" />
                                                                    Resend
                                                                    Invitation
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleRevokeInvitation(
                                                                            invitation.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isRevokingInvitation
                                                                    }
                                                                    variant="destructive"
                                                                >
                                                                    <Icons.Trash className="mr-2 w-4 h-4" />
                                                                    Revoke
                                                                    Invitation
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    )}
                                </TableBody>
                            </Table>

                            {invitationsPagination &&
                                invitationsPagination.totalPages > 1 && (
                                    <TablePagination
                                        page={invitationsPagination.page}
                                        totalPages={
                                            invitationsPagination.totalPages
                                        }
                                        totalItems={invitationsPagination.total}
                                        itemsPerPage={10}
                                        onPageChange={
                                            handleInvitationPageChange
                                        }
                                    />
                                )}
                        </>
                    )}
                </div>
            ) : null}

            {/* Users Table */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-primary">
                            All Users
                        </h3>
                        <p className="text-sm text-primary/60 mt-1">
                            {pagination?.total || 0} user
                            {pagination?.total !== 1 ? 's' : ''} in total
                        </p>
                    </div>
                </div>

                <Table
                    enableSelection
                    rowIds={userRowIds}
                    selectedIds={selectedItems}
                    onSelectionChange={setSelectedItems}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                >
                    <TableSelectionToolbar>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkExport}
                        >
                            <Icons.Download className="mr-2 w-4 h-4" />
                            Export Selected
                        </Button>
                    </TableSelectionToolbar>

                    <TableHeader>
                        <tr>
                            <TableHead>
                                <TableSelectAllCheckbox />
                            </TableHead>
                            <TableHead sortable sortKey="name">
                                User
                            </TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead sortable sortKey="createdAt">
                                Joined
                            </TableHead>
                            <TableHead align="center">Actions</TableHead>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableLoadingState colSpan={7} rows={5} />
                        ) : users.length === 0 ? (
                            <TableEmptyState
                                colSpan={7}
                                message="No users found"
                                description={
                                    search ||
                                    filters.isVerified ||
                                    filters.isActive
                                        ? 'Try adjusting your search or filters'
                                        : 'Get started by inviting your first user'
                                }
                                action={
                                    !search &&
                                    !filters.isVerified &&
                                    !filters.isActive ? (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setIsInviteModalOpen(true)
                                            }
                                            startIcon={
                                                <Icons.Plus className="w-4 h-4" />
                                            }
                                        >
                                            Invite User
                                        </Button>
                                    ) : null
                                }
                            />
                        ) : (
                            users.map((user: UserType) => (
                                <TableRow key={user.id} rowId={user.id}>
                                    <TableCell>
                                        <TableRowCheckbox rowId={user.id} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-secondary/30 to-primary/30 flex items-center justify-center text-sm font-medium text-primary">
                                                {getUserInitials(user.name)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-primary">
                                                    {user.name}
                                                </span>
                                                {user.lastLoggedInAt && (
                                                    <span className="text-xs text-primary/50">
                                                        Last seen{' '}
                                                        {formatRelativeTime(
                                                            user.lastLoggedInAt
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-primary/75">
                                            {user.email}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {user.role?.displayName ||
                                                user.role?.name ||
                                                user.roles?.[0]?.displayName ||
                                                user.roles?.[0]?.name ||
                                                'N/A'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge
                                                variant={
                                                    user.isVerified
                                                        ? 'success'
                                                        : 'warning'
                                                }
                                            >
                                                {user.isVerified
                                                    ? 'Verified'
                                                    : 'Unverified'}
                                            </Badge>
                                            {user.isActive === false && (
                                                <Badge variant="destructive">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-primary/75 text-sm">
                                                {user.createdAt
                                                    ? new Date(
                                                          user.createdAt
                                                      ).toLocaleDateString()
                                                    : '—'}
                                            </span>
                                            {user.createdAt && (
                                                <span className="text-primary/50 text-xs">
                                                    {formatRelativeTime(
                                                        user.createdAt
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell align="center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="min-w-[1rem]"
                                                >
                                                    <Icons.More className="w-4 shrink-0 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="center">
                                                <DropdownMenuLabel>
                                                    Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleEditUser(user)
                                                    }
                                                >
                                                    <Icons.Edit className="mr-2 w-4 h-4" />
                                                    Edit User
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <Icons.Eye className="mr-2 w-4 h-4" />
                                                    View Details
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
                        itemsPerPage={10}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {/* Modals */}
            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                roles={roles}
            />

            {selectedUser && (
                <EditUserModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    user={selectedUser}
                />
            )}
        </div>
    );
};

export default UsersTab;
