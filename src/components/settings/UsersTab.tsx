import { useEffect, useState } from 'react';
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
import Button from '../typography/Button';
import Chips from '../typography/Chips';
import { InputField } from '../typography/InputFields';
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

const UsersTab = () => {
    const [search, setSearch] = useState('');
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

    // Sync search input with filters.search
    useEffect(() => {
        if (filters.search !== undefined) {
            setSearch(filters.search);
        }
    }, [filters.search]);

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
        setFilters((prev) => ({
            ...prev,
            search: search.trim() || undefined,
            page: 1, // Reset to first page on new search
        }));
    };

    const handleClearSearch = () => {
        setSearch('');
        setFilters((prev) => ({
            ...prev,
            search: undefined,
            page: 1,
        }));
    };

    const handleResendInvitation = async (userId: string) => {
        try {
            await resendInvitation(userId);
        } catch (error) {
            // Error is handled by the mutation's onError
            console.error('Resend invitation error:', error);
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
            page: 1, // Reset to first page on filter change
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

    const users = data?.data?.items || [];
    const pagination = data?.data?.pagination;
    const pendingInvitations = invitationsData?.data?.items || [];
    const invitationsPagination = invitationsData?.data?.pagination;
    const userRowIds = users.map((u: UserType) => u.id);
    const invitationRowIds = pendingInvitations.map(
        (i: PendingInvitation) => i.id
    );

    const handleBulkExport = () => {
        console.log('Exporting users:', selectedItems);
        setSelectedItems([]);
    };

    const handleBulkRevokeInvitations = () => {
        console.log('Revoking invitations:', selectedInvitations);
        setSelectedInvitations([]);
    };

    if (isError) {
        return (
            <div className="text-center py-8 text-red-500">
                Failed to load users. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary">
                    Users Management
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-primary/50">
                        <Icons.Users className="w-4 h-4" />
                        <span>
                            {pagination?.total || 0} user
                            {pagination?.total !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsInviteModalOpen(true)}
                    >
                        <Icons.Plus className="mr-2 w-4 h-4" />
                        Invite User
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1 relative">
                        <InputField
                            id="user-search"
                            placeholder="Search users by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Icons.Search className="w-4 h-4" />}
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
                    <Button type="submit" variant="primary">
                        Search
                    </Button>
                </form>

                {/* Filter Toggles */}
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.isVerified === true}
                            onChange={(e) =>
                                handleFilterChange(
                                    'isVerified',
                                    e.target.checked ? true : undefined
                                )
                            }
                            className="w-4 h-4 text-primary border-primary/10 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-primary">
                            Verified Only
                        </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.isActive === true}
                            onChange={(e) =>
                                handleFilterChange(
                                    'isActive',
                                    e.target.checked ? true : undefined
                                )
                            }
                            className="w-4 h-4 text-primary border-primary/10 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-primary">
                            Active Only
                        </span>
                    </label>
                </div>
            </div>

            {/* Pending Invitations Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-primary">
                        Pending Invitations
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-primary/50">
                        <Icons.Send className="w-4 h-4" />
                        <span>
                            {invitationsPagination?.total ||
                                pendingInvitations.length ||
                                0}{' '}
                            invitation
                            {(invitationsPagination?.total ||
                                pendingInvitations.length ||
                                0) !== 1
                                ? 's'
                                : ''}
                        </span>
                    </div>
                </div>

                {isInvitationsError ? (
                    <div className="text-center py-6 text-red-500">
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
                                <button
                                    onClick={handleBulkRevokeInvitations}
                                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                                >
                                    Revoke Selected
                                </button>
                            </TableSelectionToolbar>

                            <TableHeader>
                                <tr>
                                    <TableHead>
                                        <TableSelectAllCheckbox />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead sortable sortKey="createdAt">
                                        Invited At
                                    </TableHead>
                                    <TableHead align="right">Actions</TableHead>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {isLoadingInvitations ? (
                                    <TableLoadingState colSpan={6} rows={3} />
                                ) : pendingInvitations.length === 0 ? (
                                    <TableEmptyState
                                        colSpan={6}
                                        message="No pending invitations"
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
                                                        rowId={invitation.id}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium text-primary">
                                                        {invitation.userName}
                                                    </span>
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
                                                    <span className="text-primary/75">
                                                        {new Date(
                                                            invitation.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleResendInvitation(
                                                                    invitation.id
                                                                )
                                                            }
                                                            loading={
                                                                isResendingInvitation
                                                            }
                                                            disabled={
                                                                isResendingInvitation
                                                            }
                                                            title="Resend invitation email"
                                                        >
                                                            <Icons.Send className="mr-1 w-3 h-3" />
                                                            Resend
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                revokeInvitation(
                                                                    invitation.id
                                                                )
                                                            }
                                                            loading={
                                                                isRevokingInvitation
                                                            }
                                                            disabled={
                                                                isRevokingInvitation
                                                            }
                                                            title="Revoke invitation"
                                                        >
                                                            <Icons.Close className="mr-1 w-3 h-3" />
                                                            Revoke
                                                        </Button>
                                                    </div>
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
                                    onPageChange={handleInvitationPageChange}
                                />
                            )}
                    </>
                )}
            </div>

            {/* Users Table */}
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
                    <button
                        onClick={handleBulkExport}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                    >
                        Export Selected
                    </button>
                </TableSelectionToolbar>

                <TableHeader>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead sortable sortKey="name">
                            Name
                        </TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead align="right">Actions</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableLoadingState colSpan={6} rows={5} />
                    ) : users.length === 0 ? (
                        <TableEmptyState colSpan={6} message="No users found" />
                    ) : (
                        users.map((user: UserType) => (
                            <TableRow key={user.id} rowId={user.id}>
                                <TableCell>
                                    <TableRowCheckbox rowId={user.id} />
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium text-primary">
                                        {user.name}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-primary/75">
                                        {user.email}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-primary/75">
                                        {user.role?.displayName ||
                                            user.role?.name ||
                                            user.roles?.[0]?.displayName ||
                                            user.roles?.[0]?.name ||
                                            'N/A'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Chips
                                        label={
                                            user.isVerified
                                                ? 'Verified'
                                                : 'Unverified'
                                        }
                                        variant={
                                            user.isVerified
                                                ? 'success'
                                                : 'danger'
                                        }
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditUser(user)}
                                        >
                                            <Icons.Edit className="mr-1 w-3 h-3" />
                                            Edit
                                        </Button>
                                    </div>
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
