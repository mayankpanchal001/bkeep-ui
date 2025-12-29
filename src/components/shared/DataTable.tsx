import { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import Button from '../typography/Button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import { Icons } from './Icons';

export interface Column<T> {
    header: string | ReactNode;
    accessorKey?: keyof T;
    cell?: (item: T) => ReactNode;
    className?: string;
    cellClassName?: (item: T) => string;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    keyField?: keyof T;

    // Pagination
    pagination?: {
        page: number;
        totalPages: number;
        totalItems: number;
        onPageChange: (page: number) => void;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
    };

    // Sorting
    sorting?: {
        sort: string;
        order: 'asc' | 'desc';
        onSortChange: (sort: string, order: 'asc' | 'desc') => void;
    };

    // Selection
    selectedItems?: string[];
    onSelectionChange?: (selectedIds: string[]) => void;
    onRowClick?: (item: T) => void;

    // Custom Messages
    emptyMessage?: string | ReactNode;

    // Footer
    footerContent?: ReactNode;

    // Styling
    containerClassName?: string;
    tableClassName?: string;
    rowClassName?: (item: T) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends { [key: string]: any }>({
    data,
    columns,
    isLoading,
    keyField = 'id' as keyof T,
    pagination,
    sorting,
    selectedItems,
    onSelectionChange,
    onRowClick,
    emptyMessage = 'No data available',
    footerContent,
    containerClassName,
    tableClassName,
    rowClassName,
}: DataTableProps<T>) {
    const handleSort = (key: string) => {
        if (!sorting) return;
        const newOrder =
            sorting.sort === key && sorting.order === 'asc' ? 'desc' : 'asc';
        sorting.onSortChange(key, newOrder);
    };

    const handleSelectAll = () => {
        if (!onSelectionChange) return;
        if (selectedItems?.length === data.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(data.map((item) => String(item[keyField])));
        }
    };

    const handleSelectOne = (id: string) => {
        if (!onSelectionChange || !selectedItems) return;
        if (selectedItems.includes(id)) {
            onSelectionChange(selectedItems.filter((item) => item !== id));
        } else {
            onSelectionChange([...selectedItems, id]);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center border rounded-md bg-white">
                <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin w-8 h-8 border-2 border-primary/50 border-t-transparent rounded-full"></div>
                    <span className="text-gray-500 text-sm">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <div
                className={cn(
                    'rounded-md border border-primary/20 bg-white overflow-hidden',
                    containerClassName
                )}
            >
                <Table className={tableClassName}>
                    <TableHeader>
                        <TableRow>
                            {onSelectionChange && (
                                <TableHead className="w-[50px]">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                        checked={
                                            data.length > 0 &&
                                            selectedItems?.length ===
                                                data.length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </TableHead>
                            )}
                            {columns.map((column, index) => (
                                <TableHead
                                    key={index}
                                    className={cn(
                                        column.sortable &&
                                            'cursor-pointer select-none group',
                                        column.className
                                    )}
                                    onClick={() =>
                                        column.sortable &&
                                        column.accessorKey &&
                                        handleSort(String(column.accessorKey))
                                    }
                                >
                                    <div className="flex items-center gap-1">
                                        {column.header}
                                        {column.sortable &&
                                            sorting &&
                                            column.accessorKey && (
                                                <span className="text-gray-400 group-hover:text-gray-600">
                                                    {sorting.sort ===
                                                    String(
                                                        column.accessorKey
                                                    ) ? (
                                                        sorting.order ===
                                                        'asc' ? (
                                                            <Icons.ChevronDown className="w-3 h-3 rotate-180" />
                                                        ) : (
                                                            <Icons.ChevronDown className="w-3 h-3" />
                                                        )
                                                    ) : (
                                                        <Icons.ChevronsUpDown className="w-3 h-3 opacity-50" />
                                                    )}
                                                </span>
                                            )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={
                                        columns.length +
                                        (onSelectionChange ? 1 : 0)
                                    }
                                    className="h-24 text-center text-gray-500"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => {
                                const id = String(item[keyField]);
                                const isSelected = selectedItems?.includes(id);

                                return (
                                    <TableRow
                                        key={id}
                                        data-state={
                                            isSelected ? 'selected' : undefined
                                        }
                                        className={cn(
                                            onRowClick &&
                                                'cursor-pointer hover:bg-gray-50',
                                            rowClassName?.(item)
                                        )}
                                        onClick={(e) => {
                                            // Prevent row click when clicking checkbox or interactive elements
                                            if (
                                                (
                                                    e.target as HTMLElement
                                                ).closest(
                                                    'input[type="checkbox"], button, a'
                                                )
                                            ) {
                                                return;
                                            }
                                            onRowClick?.(item);
                                        }}
                                    >
                                        {onSelectionChange && (
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        handleSelectOne(id)
                                                    }
                                                />
                                            </TableCell>
                                        )}
                                        {columns.map((column, index) => (
                                            <TableCell
                                                key={String(
                                                    column.accessorKey || index
                                                )}
                                                className={cn(
                                                    column.className,
                                                    column.cellClassName?.(item)
                                                )}
                                            >
                                                {column.cell
                                                    ? column.cell(item)
                                                    : column.accessorKey
                                                      ? (item[
                                                            column.accessorKey
                                                        ] as ReactNode)
                                                      : null}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                    {footerContent && (
                        <tfoot className="bg-gray-50 border-t">
                            {footerContent}
                        </tfoot>
                    )}
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-gray-500">
                        {selectedItems && selectedItems.length > 0 ? (
                            <span>
                                {selectedItems.length} of{' '}
                                {pagination.totalItems} row(s) selected.
                            </span>
                        ) : (
                            <span>
                                Page {pagination.page} of{' '}
                                {pagination.totalPages} ({pagination.totalItems}{' '}
                                items)
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                pagination.onPageChange(pagination.page - 1)
                            }
                            disabled={!pagination.hasPreviousPage}
                        >
                            <Icons.ChevronDown className="w-4 h-4 rotate-90 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                pagination.onPageChange(pagination.page + 1)
                            }
                            disabled={!pagination.hasNextPage}
                        >
                            Next
                            <Icons.ChevronDown className="w-4 h-4 -rotate-90 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
