import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
} from '@tanstack/react-table';
import { ArrowUp, ChevronDown, MoreHorizontal, Plus } from 'lucide-react';
import * as React from 'react';

import {
    PLURAL_TENANT_PREFIX,
    SINGLE_TENANT_PREFIX,
} from '@/components/homepage/constants';
import {
    useTenantById,
    useTenants,
    useUpdateTenant,
    type CreateTenantRequest,
    type TenantsQueryParams,
} from '../../services/apis/tenantApi';
import { Tenant } from '../../types';
import Chips from '../typography/Chips';
import { InputField, TextareaField } from '../typography/InputFields';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import TenantForm from './TenantForm';

const CAP_SINGULAR =
    SINGLE_TENANT_PREFIX.charAt(0).toUpperCase() +
    SINGLE_TENANT_PREFIX.slice(1);
const CAP_PLURAL =
    PLURAL_TENANT_PREFIX.charAt(0).toUpperCase() +
    PLURAL_TENANT_PREFIX.slice(1);

export default function TenantsTab() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    // Server-side pagination state
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showDetailsModal, setShowDetailsModal] = React.useState(false);
    const [editingTenant, setEditingTenant] = React.useState<
        Tenant | undefined
    >(undefined);
    const [detailsTenantId, setDetailsTenantId] = React.useState<string>('');

    const [editFormData, setEditFormData] = React.useState<CreateTenantRequest>(
        {
            name: '',
            schemaName: '',
            email: '',
            phone: '',
            address: '',
            fiscalYear: '',
            dateOfIncorporation: '',
        }
    );
    const [editErrors, setEditErrors] = React.useState<Record<string, string>>(
        {}
    );

    const { mutateAsync: updateTenant, isPending: isUpdatingTenant } =
        useUpdateTenant();

    const editingTenantId = editingTenant?.id;
    const { data: editingTenantResponse, isLoading: isLoadingEditTenant } =
        useTenantById(editingTenantId, { enabled: showEditModal });

    const { data: detailsTenantResponse, isLoading: isLoadingDetailsTenant } =
        useTenantById(detailsTenantId, { enabled: showDetailsModal });

    const resetEditState = () => {
        setEditingTenant(undefined);
        setEditFormData({
            name: '',
            schemaName: '',
            email: '',
            phone: '',
            address: '',
            fiscalYear: '',
            dateOfIncorporation: '',
        });
        setEditErrors({});
    };

    const resetDetailsState = () => {
        setDetailsTenantId('');
    };

    const handleCreateOpenChange = (open: boolean) => {
        setShowCreateModal(open);
        if (!open) {
            setEditingTenant(undefined);
        }
    };

    const handleEditOpenChange = (open: boolean) => {
        setShowEditModal(open);
        if (!open) {
            resetEditState();
        }
    };

    const handleDetailsOpenChange = (open: boolean) => {
        setShowDetailsModal(open);
        if (!open) {
            resetDetailsState();
        }
    };

    const handleEditClick = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setEditFormData({
            name: tenant.name || '',
            schemaName: tenant.schemaName || '',
            email: tenant.email || '',
            phone: tenant.phone || '',
            address: tenant.address || '',
            fiscalYear: tenant.fiscalYear
                ? new Date(tenant.fiscalYear).toISOString().split('T')[0]
                : '',
            dateOfIncorporation: tenant.dateOfIncorporation
                ? new Date(tenant.dateOfIncorporation)
                      .toISOString()
                      .split('T')[0]
                : '',
        });
        setEditErrors({});
        setShowEditModal(true);
    };

    const handleViewDetailsClick = (tenant: Tenant) => {
        setDetailsTenantId(tenant.id);
        setShowDetailsModal(true);
    };

    const handleCreateClick = () => {
        setEditingTenant(undefined);
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setEditingTenant(undefined);
    };

    const validateEditForm = () => {
        const newErrors: Record<string, string> = {};
        if (!editFormData.name.trim()) {
            newErrors.name = `${CAP_SINGULAR} name is required`;
        } else if (editFormData.name.trim().length < 2) {
            newErrors.name = `${CAP_SINGULAR} name must be at least 2 characters`;
        }

        setEditErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTenant) return;
        if (!validateEditForm()) return;

        const updatePayload: Partial<CreateTenantRequest> = {
            name: editFormData.name.trim(),
            email: editFormData.email?.trim() || '',
            phone: editFormData.phone?.trim() || '',
            address: editFormData.address?.trim() || '',
            fiscalYear: editFormData.fiscalYear || '',
            dateOfIncorporation: editFormData.dateOfIncorporation || '',
        };

        try {
            await updateTenant({ id: editingTenant.id, data: updatePayload });
            setShowEditModal(false);
            resetEditState();
        } catch (error) {
            void error;
        }
    };

    React.useEffect(() => {
        const tenant = editingTenantResponse?.data;
        if (!tenant) return;

        setEditFormData({
            name: tenant.name || '',
            schemaName: tenant.schemaName || '',
            email: tenant.email || '',
            phone: tenant.phone || '',
            address: tenant.address || '',
            fiscalYear: tenant.fiscalYear
                ? new Date(tenant.fiscalYear).toISOString().split('T')[0]
                : '',
            dateOfIncorporation: tenant.dateOfIncorporation
                ? new Date(tenant.dateOfIncorporation)
                      .toISOString()
                      .split('T')[0]
                : '',
        });
    }, [editingTenantResponse?.data]);

    const columns: ColumnDef<Tenant>[] = React.useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                                'indeterminate')
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'name',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() =>
                                column.toggleSorting(
                                    column.getIsSorted() === 'asc'
                                )
                            }
                            className="!pl-0 hover:bg-transparent"
                        >
                            Name
                            {column.getIsSorted() ? (
                                column.getIsSorted() === 'asc' ? (
                                    <ArrowUp className="ml-1 h-4 w-4 transition-all duration-200" />
                                ) : (
                                    <ArrowUp className="ml-1 h-4 w-4 rotate-180 transform transition-all duration-200" />
                                )
                            ) : null}
                        </Button>
                    );
                },
                cell: ({ row }) => (
                    <div className="font-normal text-primary/85">
                        {row.getValue('name')}
                    </div>
                ),
            },
            {
                accessorKey: 'createdAt',
                header: 'Created At',
                cell: ({ row }) => {
                    const date = row.getValue('createdAt') as string;
                    return (
                        <div className="text-primary/50">
                            {date ? new Date(date).toLocaleDateString() : '—'}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                cell: ({ row }) => (
                    <Chips
                        label={row.getValue('isActive') ? 'Active' : 'Inactive'}
                        variant={
                            row.getValue('isActive') ? 'success' : 'danger'
                        }
                    />
                ),
            },
            {
                accessorKey: 'isPrimary',
                header: () => <div className="text-center">Is Primary</div>,
                cell: ({ row }) => (
                    <div className="text-center">
                        {row.getValue('isPrimary') ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                Primary
                            </span>
                        ) : (
                            <span className="text-primary/40">—</span>
                        )}
                    </div>
                ),
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const tenant = row.original;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() =>
                                        navigator.clipboard.writeText(tenant.id)
                                    }
                                >
                                    Copy {SINGLE_TENANT_PREFIX} ID
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleViewDetailsClick(tenant)
                                    }
                                >
                                    View details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleEditClick(tenant)}
                                >
                                    Edit {SINGLE_TENANT_PREFIX}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        []
    );

    const queryParams: TenantsQueryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sort: sorting.length > 0 ? sorting[0].id : 'createdAt',
        order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'asc',
    };

    const { data, isLoading, isError } = useTenants(queryParams);
    const tenants = (data?.data?.items || []) as Tenant[];
    const totalItems = data?.data?.pagination?.total || 0;
    const pageCount = data?.data?.pagination?.totalPages || 0;

    const table = useReactTable({
        data: tenants,
        columns,
        getRowId: (row) => row.id,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        manualPagination: true,
        pageCount: pageCount,
        onPaginationChange: setPagination,
        manualSorting: true,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });

    if (isError) {
        return (
            <div className="text-center py-12 text-destructive">
                Failed to load {PLURAL_TENANT_PREFIX}. Please try again.
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-primary">
                        {CAP_PLURAL} Management
                    </h3>
                    <p className="text-sm text-primary/50">
                        Manage your organization's {PLURAL_TENANT_PREFIX}.
                    </p>
                </div>
                <Button onClick={handleCreateClick}>
                    <Plus className="h-4 w-4" />
                    Create {CAP_SINGULAR}
                </Button>
            </div>

            <div className="flex items-center py-4 gap-2">
                <Input
                    placeholder="Filter names..."
                    value={
                        (table.getColumn('name')?.getFilterValue() as string) ??
                        ''
                    }
                    onChange={(event) =>
                        table
                            .getColumn('name')
                            ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border overflow-hidden border-primary/10">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    <div className="flex justify-center items-center gap-2 text-primary/50">
                                        <div className="animate-spin w-4 h-4 border-2 border-primary/50 border-t-transparent rounded-full" />
                                        Loading...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-primary/50">
                    {table.getFilteredSelectedRowModel().rows.length} of{' '}
                    {totalItems} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <AlertDialog
                open={showCreateModal}
                onOpenChange={handleCreateOpenChange}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Create New {CAP_SINGULAR}
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <TenantForm onClose={handleCloseModal} />
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={showEditModal}
                onOpenChange={handleEditOpenChange}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {editingTenant
                                ? `Edit ${CAP_SINGULAR}`
                                : `Edit ${CAP_SINGULAR}`}
                        </AlertDialogTitle>
                    </AlertDialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        {isLoadingEditTenant ? (
                            <div className="flex justify-center items-center gap-2 text-primary/50">
                                <div className="animate-spin w-4 h-4 border-2 border-primary/50 border-t-transparent rounded-full" />
                                Loading...
                            </div>
                        ) : null}
                        <div>
                            <InputField
                                id="edit-tenant-name"
                                label={`${CAP_SINGULAR} Name`}
                                placeholder="e.g., Sun Medicose"
                                value={editFormData.name}
                                onChange={(e) =>
                                    setEditFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                required
                            />
                            {editErrors.name && (
                                <p className="text-red-500 text-xs mt-1 pl-1">
                                    {editErrors.name}
                                </p>
                            )}
                        </div>

                        {/* <div>
                            <InputField
                                id="edit-tenant-schema-name"
                                label="Schema Name"
                                value={editFormData.schemaName}
                                readOnly
                            />
                        </div> */}

                        <div>
                            <InputField
                                id="edit-tenant-email"
                                label="Contact Email"
                                placeholder="e.g., contact@acmecorp.com"
                                value={editFormData.email || ''}
                                onChange={(e) =>
                                    setEditFormData((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                type="email"
                            />
                        </div>

                        <div>
                            <InputField
                                id="edit-tenant-phone"
                                label={`${CAP_SINGULAR} Phone`}
                                placeholder="e.g., +1-555-123-4567"
                                value={editFormData.phone || ''}
                                onChange={(e) =>
                                    setEditFormData((prev) => ({
                                        ...prev,
                                        phone: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputField
                                    id="edit-tenant-fiscal-year"
                                    label={`${CAP_SINGULAR} Fiscal Year Start`}
                                    placeholder="YYYY-MM-DD"
                                    value={editFormData.fiscalYear || ''}
                                    onChange={(e) =>
                                        setEditFormData((prev) => ({
                                            ...prev,
                                            fiscalYear: e.target.value,
                                        }))
                                    }
                                    type="date"
                                />
                            </div>
                            <div>
                                <InputField
                                    id="edit-tenant-incorporation-date"
                                    label={`${CAP_SINGULAR} Incorporation Date`}
                                    placeholder="YYYY-MM-DD"
                                    value={
                                        editFormData.dateOfIncorporation || ''
                                    }
                                    onChange={(e) =>
                                        setEditFormData((prev) => ({
                                            ...prev,
                                            dateOfIncorporation: e.target.value,
                                        }))
                                    }
                                    type="date"
                                />
                            </div>
                        </div>

                        <div>
                            <TextareaField
                                id="edit-tenant-address"
                                label={`${CAP_SINGULAR} Address`}
                                placeholder="e.g., 123 Main St, City, State 12345"
                                value={editFormData.address || ''}
                                onChange={(e) =>
                                    setEditFormData((prev) => ({
                                        ...prev,
                                        address: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 sm:flex-initial"
                                onClick={() => handleEditOpenChange(false)}
                                disabled={isUpdatingTenant}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="default"
                                className="flex-1 sm:flex-initial"
                                disabled={
                                    isUpdatingTenant || isLoadingEditTenant
                                }
                            >
                                {isUpdatingTenant
                                    ? `Updating ${CAP_SINGULAR}...`
                                    : `Update ${CAP_SINGULAR}`}
                            </Button>
                        </div>
                    </form>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={showDetailsModal}
                onOpenChange={handleDetailsOpenChange}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {CAP_SINGULAR} Details
                        </AlertDialogTitle>
                    </AlertDialogHeader>

                    {isLoadingDetailsTenant ? (
                        <div className="flex justify-center items-center gap-2 text-primary/50">
                            <div className="animate-spin w-4 h-4 border-2 border-primary/50 border-t-transparent rounded-full" />
                            Loading...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <InputField
                                id="details-tenant-name"
                                label={`${CAP_SINGULAR} Name`}
                                value={detailsTenantResponse?.data?.name || ''}
                                readOnly
                            />
                            <InputField
                                id="details-tenant-schema"
                                label="Schema Name"
                                value={
                                    detailsTenantResponse?.data?.schemaName ||
                                    ''
                                }
                                readOnly
                            />
                            <InputField
                                id="details-tenant-email"
                                label="Contact Email"
                                value={detailsTenantResponse?.data?.email || ''}
                                readOnly
                            />
                            <InputField
                                id="details-tenant-phone"
                                label={`${CAP_SINGULAR} Phone`}
                                value={detailsTenantResponse?.data?.phone || ''}
                                readOnly
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField
                                    id="details-tenant-fiscal-year"
                                    label={`${CAP_SINGULAR} Fiscal Year Start`}
                                    value={
                                        detailsTenantResponse?.data?.fiscalYear
                                            ? new Date(
                                                  detailsTenantResponse.data.fiscalYear
                                              )
                                                  .toISOString()
                                                  .split('T')[0]
                                            : ''
                                    }
                                    type="date"
                                    readOnly
                                />
                                <InputField
                                    id="details-tenant-incorporation-date"
                                    label={`${CAP_SINGULAR} Incorporation Date`}
                                    value={
                                        detailsTenantResponse?.data
                                            ?.dateOfIncorporation
                                            ? new Date(
                                                  detailsTenantResponse.data.dateOfIncorporation
                                              )
                                                  .toISOString()
                                                  .split('T')[0]
                                            : ''
                                    }
                                    type="date"
                                    readOnly
                                />
                            </div>
                            <TextareaField
                                id="details-tenant-address"
                                label={`${CAP_SINGULAR} Address`}
                                value={
                                    detailsTenantResponse?.data?.address || ''
                                }
                                readOnly
                            />
                            <div className="mt-6 flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        handleDetailsOpenChange(false)
                                    }
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
