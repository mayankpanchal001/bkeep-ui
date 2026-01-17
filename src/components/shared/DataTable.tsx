import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import type { SortDirection } from '../ui/table';
import {
    Table,
    TableBody,
    TableCell,
    TableEmptyState,
    TableFooter,
    TableHead,
    TableHeader,
    TableLoadingState,
    TableRow,
    TableRowCheckbox,
    TableSelectAllCheckbox,
} from '../ui/table';

export interface Column<T> {
    header: string | ReactNode;
    accessorKey?: keyof T;
    cell?: (item: T) => ReactNode;
    className?: string;
    cellClassName?: (item: T) => string;
    sortable?: boolean;
    resizable?: boolean;
    minWidth?: number;
    maxWidth?: number;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    keyField?: keyof T;
    enableColumnResize?: boolean;

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

    // Drag and Drop
    onRowDragStart?: (item: T) => void;
    onRowDragOver?: (e: React.DragEvent, item: T) => void;
    onRowDragLeave?: () => void;
    onRowDrop?: (e: React.DragEvent, item: T) => void;
    onRowDragEnd?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends { [key: string]: any }>({
    data,
    columns,
    isLoading,
    keyField = 'id' as keyof T,
    enableColumnResize = true,
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
    onRowDragOver,
    onRowDragLeave,
    onRowDrop,
    onRowDragEnd,
}: DataTableProps<T>) {
    const rowIds = data.map((item) => item[keyField]) as Array<string | number>;

    const sortDirection: SortDirection | undefined = sorting
        ? sorting.order
        : undefined;

    return (
        <div className="w-full space-y-4">
            <Table
                enableSelection={!!onSelectionChange}
                rowIds={rowIds}
                selectedIds={
                    selectedItems as Array<string | number> | undefined
                }
                onSelectionChange={(ids) =>
                    onSelectionChange?.(ids.map(String))
                }
                sortKey={sorting?.sort}
                sortDirection={sortDirection}
                onSortChange={(key, direction) => {
                    if (!sorting) return;
                    const nextOrder = direction === 'desc' ? 'desc' : 'asc';
                    sorting.onSortChange(key, nextOrder);
                }}
                enableColumnResize={enableColumnResize}
                containerClassName={cn(containerClassName)}
                className={cn('text-sm', tableClassName)}
                borderStyle="default"
            >
                <TableHeader>
                    <tr>
                        {onSelectionChange && (
                            <TableHead className="w-12">
                                <TableSelectAllCheckbox />
                            </TableHead>
                        )}
                        {columns.map((column, index) => (
                            <TableHead
                                key={String(column.accessorKey || index)}
                                sortable={!!(sorting && column.sortable)}
                                sortKey={
                                    column.accessorKey
                                        ? String(column.accessorKey)
                                        : undefined
                                }
                                resizable={column.resizable ?? true}
                                minWidth={column.minWidth}
                                maxWidth={column.maxWidth}
                                className={column.className}
                            >
                                {column.header}
                            </TableHead>
                        ))}
                    </tr>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableLoadingState
                            colSpan={
                                columns.length + (onSelectionChange ? 1 : 0)
                            }
                        />
                    ) : data.length === 0 ? (
                        typeof emptyMessage === 'string' ? (
                            <TableEmptyState
                                colSpan={
                                    columns.length + (onSelectionChange ? 1 : 0)
                                }
                                message={emptyMessage}
                            />
                        ) : (
                            <tr>
                                <td
                                    colSpan={
                                        columns.length +
                                        (onSelectionChange ? 1 : 0)
                                    }
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )
                    ) : (
                        data.map((item) => {
                            const id = item[keyField] as string | number;
                            return (
                                <TableRow
                                    key={String(id)}
                                    rowId={id}
                                    className={cn(
                                        onRowClick && 'cursor-pointer',
                                        rowClassName?.(item)
                                    )}
                                    onClick={(e) => {
                                        if (
                                            (e.target as HTMLElement).closest(
                                                'input[type="checkbox"], button, a, [role="checkbox"]'
                                            )
                                        ) {
                                            return;
                                        }
                                        onRowClick?.(item);
                                    }}
                                    onDragOver={
                                        onRowDragOver
                                            ? (e) => onRowDragOver(e, item)
                                            : undefined
                                    }
                                    onDragLeave={onRowDragLeave}
                                    onDrop={
                                        onRowDrop
                                            ? (e) => onRowDrop(e, item)
                                            : undefined
                                    }
                                    onDragEnd={onRowDragEnd}
                                >
                                    {onSelectionChange && (
                                        <TableCell className="w-12">
                                            <TableRowCheckbox rowId={id} />
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
                {footerContent && <TableFooter>{footerContent}</TableFooter>}
            </Table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                        {selectedItems && selectedItems.length > 0 ? (
                            <span>
                                {selectedItems.length} of{' '}
                                {pagination.totalItems} selected
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
                            <ChevronLeft className="size-4" />
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
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
