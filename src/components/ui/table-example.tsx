/**
 * Modern Table Component - Usage Examples
 *
 * This file demonstrates all features of the redesigned table component
 * that can be used across your entire codebase.
 */

import { useMemo, useState } from 'react';
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
} from './table';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

// ============================================================================
// Example 1: Basic Table with Selection
// ============================================================================

interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'User' | 'Manager';
    status: 'active' | 'inactive';
    joinDate: string;
}

const SAMPLE_USERS: User[] = [
    {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Admin',
        status: 'active',
        joinDate: '2024-01-15',
    },
    {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'User',
        status: 'active',
        joinDate: '2024-02-20',
    },
    {
        id: '3',
        name: 'Charlie Davis',
        email: 'charlie@example.com',
        role: 'Manager',
        status: 'inactive',
        joinDate: '2024-03-10',
    },
    {
        id: '4',
        name: 'Diana Prince',
        email: 'diana@example.com',
        role: 'User',
        status: 'active',
        joinDate: '2024-04-05',
    },
    {
        id: '5',
        name: 'Ethan Hunt',
        email: 'ethan@example.com',
        role: 'Admin',
        status: 'active',
        joinDate: '2024-05-12',
    },
    {
        id: '6',
        name: 'Fiona Green',
        email: 'fiona@example.com',
        role: 'User',
        status: 'inactive',
        joinDate: '2024-06-18',
    },
    {
        id: '7',
        name: 'George Wilson',
        email: 'george@example.com',
        role: 'Manager',
        status: 'active',
        joinDate: '2024-07-22',
    },
    {
        id: '8',
        name: 'Helen Troy',
        email: 'helen@example.com',
        role: 'User',
        status: 'active',
        joinDate: '2024-08-30',
    },
];

export function BasicTableExample() {
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const rowIds = SAMPLE_USERS.map((u) => u.id);

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
                Basic Table with Selection
            </h2>

            <Table
                enableSelection
                rowIds={rowIds}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
            >
                <TableHeader>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {SAMPLE_USERS.map((user) => (
                        <TableRow key={user.id} rowId={user.id}>
                            <TableCell>
                                <TableRowCheckbox rowId={user.id} />
                            </TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <RoleBadge role={user.role} />
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={user.status} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {selectedIds.length > 0 && (
                <div className="mt-4 p-3 bg-secondary/20 rounded-lg text-sm">
                    Selected: {selectedIds.join(', ')}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Example 2: Full Featured Table
// ============================================================================

export function FullFeaturedTableExample() {
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [sortKey, setSortKey] = useState<string | null>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const rowIds = SAMPLE_USERS.map((u) => u.id);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortKey || !sortDirection) return SAMPLE_USERS;

        return [...SAMPLE_USERS].sort((a, b) => {
            const aVal = a[sortKey as keyof User];
            const bVal = b[sortKey as keyof User];
            const comparison = String(aVal).localeCompare(String(bVal));
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [sortKey, sortDirection]);

    // Paginate data
    const paginatedData = sortedData.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const handleSortChange = (key: string, direction: SortDirection) => {
        setSortKey(direction ? key : null);
        setSortDirection(direction);
    };

    const handleBulkDelete = () => {
        alert(
            `Deleting ${selectedIds.length} items: ${selectedIds.join(', ')}`
        );
        setSelectedIds([]);
    };

    const handleBulkExport = () => {
        alert(`Exporting ${selectedIds.length} items`);
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Full Featured Table</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setIsLoading(true);
                            setTimeout(() => setIsLoading(false), 1500);
                        }}
                        className="px-4 py-2 text-sm bg-muted hover:bg-accent/30 rounded-lg"
                    >
                        Toggle Loading
                    </button>
                </div>
            </div>

            {/* Selection Toolbar - Shows when items selected */}
            <Table
                enableSelection
                rowIds={rowIds}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
            >
                {/* This toolbar auto-hides when nothing selected */}
                <TableSelectionToolbar>
                    <button
                        onClick={handleBulkExport}
                        className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md"
                    >
                        Export
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md"
                    >
                        Delete
                    </button>
                </TableSelectionToolbar>

                <TableHeader>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead sortable sortKey="name" resizable>
                            Name
                        </TableHead>
                        <TableHead sortable sortKey="email" resizable>
                            Email
                        </TableHead>
                        <TableHead sortable sortKey="role">
                            Role
                        </TableHead>
                        <TableHead sortable sortKey="status">
                            Status
                        </TableHead>
                        <TableHead sortable sortKey="joinDate">
                            Join Date
                        </TableHead>
                        <TableHead align="right">Actions</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableLoadingState colSpan={7} rows={itemsPerPage} />
                    ) : paginatedData.length === 0 ? (
                        <TableEmptyState
                            colSpan={7}
                            message="No users found"
                            description="Try adjusting your filters or add new users."
                            action={
                                <button className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/90 rounded-lg">
                                    Add User
                                </button>
                            }
                        />
                    ) : (
                        paginatedData.map((user) => (
                            <TableRow key={user.id} rowId={user.id}>
                                <TableCell>
                                    <TableRowCheckbox rowId={user.id} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar name={user.name} />
                                        <span className="font-medium">
                                            {user.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-muted-foreground">
                                        {user.email}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <RoleBadge role={user.role} />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={user.status} />
                                </TableCell>
                                <TableCell>
                                    {new Date(user.joinDate).toLocaleDateString(
                                        'en-US',
                                        {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        }
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <ActionButtons userId={user.id} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <TablePagination
                page={page}
                totalPages={Math.ceil(SAMPLE_USERS.length / itemsPerPage)}
                totalItems={SAMPLE_USERS.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
            />
        </div>
    );
}

// ============================================================================
// Example 3: Minimal Table (No Selection)
// ============================================================================

export function MinimalTableExample() {
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Minimal Table</h2>

            <Table borderStyle="minimal">
                <TableHeader>
                    <tr>
                        <TableHead>Product</TableHead>
                        <TableHead align="right">Price</TableHead>
                        <TableHead align="right">Quantity</TableHead>
                        <TableHead align="right">Total</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Widget Pro</TableCell>
                        <TableCell align="right">$29.99</TableCell>
                        <TableCell align="right">3</TableCell>
                        <TableCell align="right">$89.97</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Gadget X</TableCell>
                        <TableCell align="right">$49.99</TableCell>
                        <TableCell align="right">2</TableCell>
                        <TableCell align="right">$99.98</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Super Tool</TableCell>
                        <TableCell align="right">$19.99</TableCell>
                        <TableCell align="right">5</TableCell>
                        <TableCell align="right">$99.95</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}

// ============================================================================
// Helper Components
// ============================================================================

function Avatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');
    return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-foreground text-xs font-semibold">
            {initials}
        </div>
    );
}

function RoleBadge({ role }: { role: User['role'] }) {
    const styles = {
        Admin: 'bg-secondary/20 text-secondary-foreground',
        Manager: 'bg-secondary/20 text-secondary-foreground',
        User: 'bg-muted text-muted-foreground',
    };

    return (
        <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[role]}`}
        >
            {role}
        </span>
    );
}

function StatusBadge({ status }: { status: User['status'] }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={`w-2 h-2 rounded-full ${
                    status === 'active'
                        ? 'bg-green-500'
                        : 'bg-muted-foreground/40'
                }`}
            />
            <span className="capitalize text-sm">{status}</span>
        </div>
    );
}

function ActionButtons({ userId }: { userId: string }) {
    return (
        <div className="flex items-center justify-end gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => alert(`Edit user ${userId}`)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded transition-colors"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => alert(`Delete user ${userId}`)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}

// ============================================================================
// Main Demo Page
// ============================================================================

export default function TableExample() {
    return (
        <div className="min-h-screen bg-muted py-8">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                        Modern Table Component
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Reusable table with bulk selection, sorting, pagination,
                        and more
                    </p>
                </div>

                <div className="space-y-8">
                    <section className="bg-card dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <FullFeaturedTableExample />
                    </section>

                    <section className="bg-card dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <BasicTableExample />
                    </section>

                    <section className="bg-card dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <MinimalTableExample />
                    </section>
                </div>
            </div>
        </div>
    );
}
