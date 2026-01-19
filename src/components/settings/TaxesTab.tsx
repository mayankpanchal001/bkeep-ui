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
import { Plus } from 'lucide-react';
import * as React from 'react';

import {
    useDeleteTax,
    useDisableTax,
    useEnableTax,
    useTaxes,
} from '../../services/apis/taxApi';
import { Tax, TaxFilters } from '../../types/tax';
import ActionMenu, { type ActionMenuItem } from '../shared/ActionMenu';
import { Icons } from '../shared/Icons';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import Input from '../ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import TaxDetailDrawer from './TaxDetailDrawer';
import TaxForm from './TaxForm';

const TaxesTab = () => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const [search, setSearch] = React.useState('');
    const [isDialogOpen, setDialogOpen] = React.useState(false);
    const [editTax, setEditTax] = React.useState<Tax | null>(null);
    const [detailTaxId, setDetailTaxId] = React.useState<string | null>(null);
    const [isDetailOpen, setDetailOpen] = React.useState(false);

    // columns defined after handlers

    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const queryParams: TaxFilters = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search || undefined,
        sort: sorting.length > 0 ? sorting[0].id : 'name',
        order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'asc',
    };

    const { data, isLoading } = useTaxes(queryParams);
    const taxes = (data?.data?.items || []) as Tax[];
    const pageCount = data?.data?.pagination?.totalPages || 0;

    // table created after columns are defined

    const { mutate: deleteTax } = useDeleteTax();
    const { mutate: enableTax } = useEnableTax();
    const { mutate: disableTax } = useDisableTax();

    const handleDelete = React.useCallback(
        (id: string) => deleteTax(id),
        [deleteTax]
    );
    const handleEnable = React.useCallback(
        (id: string) => enableTax(id),
        [enableTax]
    );
    const handleDisable = React.useCallback(
        (id: string) => disableTax(id),
        [disableTax]
    );

    const columns = React.useMemo<ColumnDef<Tax, unknown>[]>(() => {
        return [
            {
                accessorKey: 'name',
                header: 'Name',
            },
            {
                accessorKey: 'code',
                header: 'Code',
                cell: ({ row }) => (
                    <span className="text-xs text-primary/50">
                        {row.original.code || '—'}
                    </span>
                ),
            },
            {
                accessorKey: 'rate',
                header: 'Rate',
                cell: ({ row }) => (
                    <span className="font-medium text-primary">
                        {((row.original.rate || 0) * 100).toFixed(2)}%
                    </span>
                ),
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                cell: ({ row }) => (
                    <span
                        className={`text-xs px-2 py-1 rounded ${
                            row.original.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-primary/10 text-primary/50'
                        }`}
                    >
                        {row.original.isActive ? 'Active' : 'Inactive'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                    const tax = row.original;

                    const actionItems: ActionMenuItem[] = [
                        {
                            label: 'View details',
                            icon: <Icons.Eye className="mr-2 w-4 h-4" />,
                            onClick: () => {
                                setDetailTaxId(tax.id);
                                setDetailOpen(true);
                            },
                        },
                        {
                            label: 'Edit',
                            icon: <Icons.Edit className="mr-2 w-4 h-4" />,
                            onClick: () => {
                                setEditTax(tax);
                                setDialogOpen(true);
                            },
                            separator: true,
                        },
                        tax.isActive
                            ? {
                                  label: 'Disable',
                                  onClick: () => handleDisable(tax.id),
                                  separator: true,
                              }
                            : {
                                  label: 'Enable',
                                  onClick: () => handleEnable(tax.id),
                                  separator: true,
                              },
                        {
                            label: 'Delete',
                            icon: <Icons.Trash className="mr-2 w-4 h-4" />,
                            onClick: () => handleDelete(tax.id),
                            destructive: true,
                            separator: true,
                        },
                    ];

                    return <ActionMenu items={actionItems} />;
                },
            },
        ];
    }, [handleDelete, handleEnable, handleDisable]);

    const openCreateDialog = () => {
        setEditTax(null);
        setDialogOpen(true);
    };

    const table = useReactTable({
        data: taxes,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        pageCount,
        manualPagination: true,
    });
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search taxes..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearch(e.target.value)
                        }
                        className="w-[300px]"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={openCreateDialog} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New tax
                    </Button>
                </div>
            </div>

            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card rounded shadow-sm border border-primary/10 p-4">
                    <p className="text-xs text-primary/50 uppercase">Total</p>
                    <p className="text-lg font-bold text-primary">
                        {statsData?.data?.total ?? taxes.length}
                    </p>
                </div>
                <div className="bg-card rounded shadow-sm border border-primary/10 p-4">
                    <p className="text-xs text-primary/50 uppercase">Active</p>
                    <p className="text-lg font-bold text-primary">
                        {statsData?.data?.active ??
                            taxes.filter((t) => t.isActive).length}
                    </p>
                </div>
                <div className="bg-card rounded shadow-sm border border-primary/10 p-4">
                    <p className="text-xs text-primary/50 uppercase">
                        Inactive
                    </p>
                    <p className="text-lg font-bold text-primary">
                        {statsData?.data?.inactive ??
                            taxes.filter((t) => !t.isActive).length}
                    </p>
                </div>
            </div> */}

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
                    ) : taxes.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={(e) => {
                                    // Prevent opening drawer if clicking on actions or checkbox
                                    const target = e.target as HTMLElement;
                                    if (
                                        target.closest('[role="menuitem"]') ||
                                        target.closest('button') ||
                                        target.closest('.dropdown-trigger')
                                    ) {
                                        return;
                                    }
                                    setDetailTaxId(row.original.id);
                                    setDetailOpen(true);
                                }}
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
                                No taxes found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="flex items-center justify-end gap-2 p-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setPagination((p) => ({
                            ...p,
                            pageIndex: p.pageIndex - 1,
                        }))
                    }
                    disabled={pagination.pageIndex === 0}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setPagination((p) => ({
                            ...p,
                            pageIndex: p.pageIndex + 1,
                        }))
                    }
                    disabled={pagination.pageIndex + 1 >= pageCount}
                >
                    Next
                </Button>
            </div>

            <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent className="sm:max-w-[600px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {editTax ? 'Edit Tax' : 'Create Tax'}
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <TaxForm
                        initialData={editTax || undefined}
                        onClose={() => {
                            setDialogOpen(false);
                            setEditTax(null);
                        }}
                    />
                </AlertDialogContent>
            </AlertDialog>

            <TaxDetailDrawer
                taxId={detailTaxId}
                open={isDetailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    );
};

export default TaxesTab;
