/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { cn } from '@/utils/cn';
import type { Layout } from 'react-resizable-panels';
import { Button } from './button';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type SortDirection = 'asc' | 'desc' | null;

type TableColumnRegistration = {
    id: string;
    resizable: boolean;
    minWidth?: number;
    maxWidth?: number;
};

export interface TableSelectionContextValue {
    selectedRows: Set<string | number>;
    toggleRow: (id: string | number) => void;
    toggleAll: () => void;
    selectRows: (ids: (string | number)[]) => void;
    isAllSelected: boolean;
    isIndeterminate: boolean;
    clearSelection: () => void;
    selectedCount: number;
    totalCount: number;
}

export interface TableSortContextValue {
    sortKey: string | null;
    sortDirection: SortDirection;
    onSort: (key: string) => void;
}

// Contexts
const TableSelectionContext =
    React.createContext<TableSelectionContextValue | null>(null);
const TableSortContext = React.createContext<TableSortContextValue | null>(
    null
);
const TableColumnResizeContext = React.createContext<{
    columns: TableColumnRegistration[];
    registerColumn: (col: TableColumnRegistration) => void;
    unregisterColumn: (id: string) => void;
    columnLayout: number[] | null;
    setColumnLayout: (layout: number[]) => void;
} | null>(null);

const TableCompactContext = React.createContext<boolean>(false);
const TableTransposeMobileContext = React.createContext<boolean>(false);

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook to access table selection state and methods
 * Must be used within a Table component with enableSelection={true}
 */
export function useTableSelection() {
    const context = React.useContext(TableSelectionContext);
    if (!context) {
        throw new Error(
            'useTableSelection must be used within a Table with enableSelection={true}'
        );
    }
    return context;
}

/**
 * Optional hook to access table sort state
 * Returns null if sorting is not enabled
 */
export function useTableSort() {
    return React.useContext(TableSortContext);
}

/**
 * Hook to check if a specific row is selected
 */
export function useIsRowSelected(rowId: string | number) {
    const context = React.useContext(TableSelectionContext);
    return context?.selectedRows.has(rowId) ?? false;
}

// ============================================================================
// Table Container with Selection & Sort Provider
// ============================================================================

interface TableProps extends React.ComponentProps<'table'> {
    /** Enable row selection with checkboxes */
    enableSelection?: boolean;
    /** Callback when selection changes */
    onSelectionChange?: (selectedIds: (string | number)[]) => void;
    /** Array of all row IDs for selection tracking */
    rowIds?: (string | number)[];
    /** Controlled selected IDs (makes selection controlled) */
    selectedIds?: (string | number)[];
    /** Current sort key */
    sortKey?: string | null;
    /** Current sort direction */
    sortDirection?: SortDirection;
    /** Callback when sort changes */
    onSortChange?: (key: string, direction: SortDirection) => void;
    /** Compact mode reduces padding */
    compact?: boolean;
    /** Striped rows for better readability */
    striped?: boolean;
    /** Hover effect style */
    hoverStyle?: 'default' | 'highlight' | 'none';
    /** Border style */
    borderStyle?: 'default' | 'minimal' | 'none';
    /** Enable shadcn resizable-based column resizing (TableHead resizable) */
    enableColumnResize?: boolean;
    /** Class name applied to the table container */
    containerClassName?: string;
    /** Transpose table axis on mobile (rows become columns, columns become rows) */
    transposeOnMobile?: boolean;
}

function Table({
    className,
    enableSelection = false,
    onSelectionChange,
    rowIds = [],
    selectedIds,
    sortKey: controlledSortKey,
    sortDirection: controlledSortDirection,
    onSortChange,
    compact = false,
    striped = false,
    hoverStyle = 'default',
    borderStyle = 'default',
    enableColumnResize = true,
    containerClassName,
    transposeOnMobile = false,
    children,
    ...props
}: TableProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const tableRef = React.useRef<HTMLTableElement>(null);
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [overlayWidth, setOverlayWidth] = React.useState<number>(0);

    // Selection state (uncontrolled)
    const [internalSelectedRows, setInternalSelectedRows] = React.useState<
        Set<string | number>
    >(new Set());

    // Use controlled or uncontrolled selection
    const isControlled = selectedIds !== undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const selectedRows = isControlled
        ? new Set(selectedIds)
        : internalSelectedRows;

    // Sort state (uncontrolled)
    const [internalSortKey, setInternalSortKey] = React.useState<string | null>(
        null
    );
    const [internalSortDirection, setInternalSortDirection] =
        React.useState<SortDirection>(null);

    // Use controlled or uncontrolled sort
    const sortKey =
        controlledSortKey !== undefined ? controlledSortKey : internalSortKey;
    const sortDirection =
        controlledSortDirection !== undefined
            ? controlledSortDirection
            : internalSortDirection;

    // Selection handlers
    const toggleRow = React.useCallback(
        (id: string | number) => {
            if (isControlled) {
                const newSelection = selectedRows.has(id)
                    ? Array.from(selectedRows).filter((i) => i !== id)
                    : [...Array.from(selectedRows), id];
                onSelectionChange?.(newSelection);
            } else {
                setInternalSelectedRows((prev) => {
                    const newSet = new Set(prev);
                    if (newSet.has(id)) {
                        newSet.delete(id);
                    } else {
                        newSet.add(id);
                    }
                    onSelectionChange?.(Array.from(newSet));
                    return newSet;
                });
            }
        },
        [isControlled, selectedRows, onSelectionChange]
    );

    const toggleAll = React.useCallback(() => {
        if (isControlled) {
            const newSelection =
                selectedRows.size === rowIds.length ? [] : [...rowIds];
            onSelectionChange?.(newSelection);
        } else {
            setInternalSelectedRows((prev) => {
                const newSet: Set<string | number> =
                    prev.size === rowIds.length ? new Set() : new Set(rowIds);
                onSelectionChange?.(Array.from(newSet));
                return newSet;
            });
        }
    }, [isControlled, selectedRows, rowIds, onSelectionChange]);

    const selectRows = React.useCallback(
        (ids: (string | number)[]) => {
            if (isControlled) {
                const newSelection = [
                    ...new Set([...Array.from(selectedRows), ...ids]),
                ];
                onSelectionChange?.(newSelection);
            } else {
                setInternalSelectedRows((prev) => {
                    const newSet: Set<string | number> = new Set([
                        ...Array.from(prev),
                        ...ids,
                    ]);
                    onSelectionChange?.(Array.from(newSet));
                    return newSet;
                });
            }
        },
        [isControlled, selectedRows, onSelectionChange]
    );

    const clearSelection = React.useCallback(() => {
        if (isControlled) {
            onSelectionChange?.([]);
        } else {
            setInternalSelectedRows(new Set());
            onSelectionChange?.([]);
        }
    }, [isControlled, onSelectionChange]);

    // Sort handler
    const handleSort = React.useCallback(
        (key: string) => {
            let newDirection: SortDirection = 'asc';
            if (sortKey === key) {
                if (sortDirection === 'asc') newDirection = 'desc';
                else if (sortDirection === 'desc') newDirection = null;
                else newDirection = 'asc';
            }

            if (controlledSortKey !== undefined) {
                onSortChange?.(key, newDirection);
            } else {
                setInternalSortKey(newDirection ? key : null);
                setInternalSortDirection(newDirection);
                onSortChange?.(key, newDirection);
            }
        },
        [sortKey, sortDirection, controlledSortKey, onSortChange]
    );

    const isAllSelected =
        rowIds.length > 0 && selectedRows.size === rowIds.length;
    const isIndeterminate =
        selectedRows.size > 0 && selectedRows.size < rowIds.length;

    const selectionContextValue: TableSelectionContextValue = React.useMemo(
        () => ({
            selectedRows,
            toggleRow,
            toggleAll,
            selectRows,
            isAllSelected,
            isIndeterminate,
            clearSelection,
            selectedCount: selectedRows.size,
            totalCount: rowIds.length,
        }),
        [
            selectedRows,
            toggleRow,
            toggleAll,
            selectRows,
            isAllSelected,
            isIndeterminate,
            clearSelection,
            rowIds.length,
        ]
    );

    const sortContextValue: TableSortContextValue = React.useMemo(
        () => ({
            sortKey,
            sortDirection,
            onSort: handleSort,
        }),
        [sortKey, sortDirection, handleSort]
    );

    const [columns, setColumns] = React.useState<TableColumnRegistration[]>([]);
    const [columnLayout, setColumnLayout] = React.useState<number[] | null>(
        null
    );

    React.useEffect(() => {
        const el = scrollRef.current;
        const onScroll = () => setScrollLeft(el?.scrollLeft ?? 0);
        if (el) {
            el.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }
        return () => el?.removeEventListener('scroll', onScroll);
    }, []);

    const updateOverlayWidth = React.useCallback(() => {
        const w =
            (tableRef.current?.scrollWidth ?? 0) ||
            (scrollRef.current?.clientWidth ?? 0);
        setOverlayWidth(w);
    }, []);

    React.useEffect(() => {
        updateOverlayWidth();
        const onResize = () => updateOverlayWidth();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns.length, columnLayout]);

    const registerColumn = React.useCallback((col: TableColumnRegistration) => {
        setColumns((prev) => {
            const idx = prev.findIndex((c) => c.id === col.id);
            if (idx >= 0) {
                const next = prev.slice();
                next[idx] = col;
                return next;
            }
            return [...prev, col];
        });
    }, []);

    const unregisterColumn = React.useCallback((id: string) => {
        setColumns((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const hasResizableColumns =
        enableColumnResize && columns.some((c) => c.resizable);

    const computedLayout = React.useMemo(() => {
        if (!hasResizableColumns) return null;
        if (columnLayout && columnLayout.length === columns.length) {
            return columnLayout;
        }
        if (columns.length === 0) return null;
        const base = columns.map((c) =>
            typeof c.maxWidth === 'number' ? Math.max(c.maxWidth, 1) : 10
        );
        const sum = base.reduce((acc, n) => acc + n, 0);
        if (sum <= 0) {
            const even = 100 / columns.length;
            return Array.from({ length: columns.length }).map(() => even);
        }
        return base.map((n) => (n / sum) * 100);
    }, [hasResizableColumns, columnLayout, columns]);

    // Container styles based on borderStyle
    const containerClasses = cn(
        'relative w-full overflow-hidden max-h-full',
        borderStyle === 'default' &&
            'rounded-md border border-border bg-background',
        borderStyle === 'minimal' &&
            'rounded-md border border-border/60 bg-background',
        borderStyle === 'none' && '',
        containerClassName
    );

    // Separate toolbar children from table children
    const childArray = React.Children.toArray(children);
    const toolbarChildren: React.ReactNode[] = [];
    const tableChildren: React.ReactNode[] = [];

    childArray.forEach((child) => {
        if (
            React.isValidElement(child) &&
            (child.type as React.ComponentType & { displayName?: string })
                ?.displayName === 'TableSelectionToolbar'
        ) {
            toolbarChildren.push(child);
        } else {
            tableChildren.push(child);
        }
    });

    return (
        <TableSelectionContext.Provider
            value={enableSelection ? selectionContextValue : null}
        >
            <TableSortContext.Provider value={sortContextValue}>
                <TableCompactContext.Provider value={compact}>
                    <TableTransposeMobileContext.Provider
                        value={transposeOnMobile}
                    >
                        <TableColumnResizeContext.Provider
                            value={
                                hasResizableColumns
                                    ? {
                                          columns,
                                          registerColumn,
                                          unregisterColumn,
                                          columnLayout: computedLayout,
                                          setColumnLayout,
                                      }
                                    : null
                            }
                        >
                            {/* Render toolbar OUTSIDE the table container */}
                            {toolbarChildren}

                            <div
                                data-slot="table-container"
                                data-compact={compact || undefined}
                                data-striped={striped || undefined}
                                data-hover={hoverStyle}
                                data-transpose-mobile={
                                    transposeOnMobile || undefined
                                }
                                className={containerClasses}
                            >
                                <div
                                    ref={scrollRef}
                                    className={cn(
                                        'relative overflow-auto h-full',
                                        transposeOnMobile &&
                                            'md:overflow-auto overflow-visible'
                                    )}
                                >
                                    {hasResizableColumns && computedLayout && (
                                        <div
                                            className="pointer-events-none absolute left-0 top-0 z-20 h-10"
                                            style={{
                                                width: overlayWidth,
                                                transform: `translateX(-${scrollLeft}px)`,
                                            }}
                                        >
                                            <ResizablePanelGroup
                                                orientation="horizontal"
                                                onLayoutChange={(
                                                    layout: Layout
                                                ) => {
                                                    const next: number[] =
                                                        Array.isArray(layout)
                                                            ? (layout as number[])
                                                            : columns.map(
                                                                  (c) =>
                                                                      (
                                                                          layout as Record<
                                                                              string,
                                                                              number
                                                                          >
                                                                      )[c.id] ??
                                                                      0
                                                              );
                                                    setColumnLayout(next);
                                                    updateOverlayWidth();
                                                }}
                                                className="h-full w-full pointer-events-none"
                                            >
                                                {columns.map((col, idx) => {
                                                    return (
                                                        <React.Fragment
                                                            key={col.id}
                                                        >
                                                            <ResizablePanel
                                                                id={col.id}
                                                                defaultSize={
                                                                    computedLayout[
                                                                        idx
                                                                    ]
                                                                }
                                                                minSize={
                                                                    col.minWidth
                                                                }
                                                                maxSize={
                                                                    col.maxWidth
                                                                }
                                                                className="pointer-events-none"
                                                            />
                                                            {idx <
                                                                columns.length -
                                                                    1 && (
                                                                <ResizableHandle className="pointer-events-auto w-2 bg-transparent after:w-1 after:bg-border/40 hover:after:bg-border" />
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </ResizablePanelGroup>
                                        </div>
                                    )}
                                    <table
                                        ref={tableRef}
                                        data-slot="table"
                                        data-compact={compact || undefined}
                                        className={cn(
                                            'w-full caption-bottom text-sm table-auto',
                                            transposeOnMobile &&
                                                'block md:table',
                                            className
                                        )}
                                        {...props}
                                    >
                                        {hasResizableColumns &&
                                            computedLayout && (
                                                <colgroup>
                                                    {computedLayout.map(
                                                        (size, idx) => (
                                                            <col
                                                                key={
                                                                    columns[idx]
                                                                        ?.id ??
                                                                    idx
                                                                }
                                                                style={{
                                                                    width: `${size}%`,
                                                                }}
                                                            />
                                                        )
                                                    )}
                                                </colgroup>
                                            )}
                                        {tableChildren}
                                    </table>
                                </div>
                            </div>
                        </TableColumnResizeContext.Provider>
                    </TableTransposeMobileContext.Provider>
                </TableCompactContext.Provider>
            </TableSortContext.Provider>
        </TableSelectionContext.Provider>
    );
}

// ============================================================================
// Table Header
// ============================================================================

interface TableHeaderProps extends React.ComponentProps<'thead'> {
    sticky?: boolean;
}

function TableHeader({ className, sticky = true, ...props }: TableHeaderProps) {
    const transposeOnMobile = React.useContext(TableTransposeMobileContext);
    return (
        <thead
            data-slot="table-header"
            className={cn(
                sticky && 'sticky top-0 z-10',
                // Modern gradient background using theme colors
                'backdrop-blur-md backdrop-saturate-150',
                // Enhanced border with subtle shadow using theme border color
                'border-b-2',
                'border-border',
                // Smooth transitions
                'transition-all duration-200',
                transposeOnMobile && 'hidden md:table-header-group',
                className
            )}
            {...props}
        />
    );
}

// ============================================================================
// Table Body
// ============================================================================

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
    const transposeOnMobile = React.useContext(TableTransposeMobileContext);
    return (
        <tbody
            data-slot="table-body"
            className={cn(
                '[&_tr:last-child]:border-0',
                'divide-y divide-border',
                transposeOnMobile &&
                    'block md:table-row-group space-y-3 md:space-y-0',
                className
            )}
            {...props}
        />
    );
}

// ============================================================================
// Table Footer
// ============================================================================

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                'bg-muted/40 border-t border-border font-medium',
                '[&>tr]:last:border-b-0',
                className
            )}
            {...props}
        />
    );
}

// ============================================================================
// Table Row
// ============================================================================

interface TableRowProps extends React.ComponentProps<'tr'> {
    /** Unique row identifier for selection tracking */
    rowId?: string | number;
    /** Disable selection for this row */
    disableSelection?: boolean;
    /** Custom click handler */
    onClick?: (e: React.MouseEvent<HTMLTableRowElement>) => void;
}

function TableRow({ className, rowId, onClick, ...props }: TableRowProps) {
    const selectionContext = React.useContext(TableSelectionContext);
    const transposeOnMobile = React.useContext(TableTransposeMobileContext);
    const isSelected =
        rowId !== undefined && selectionContext?.selectedRows.has(rowId);

    const handleClick = React.useCallback(
        (e: React.MouseEvent<HTMLTableRowElement>) => {
            // Don't trigger row click if clicking on draggable elements or during drag
            const target = e.target as HTMLElement;
            if (
                target.closest('[draggable="true"]') ||
                target.closest('[data-drag-handle]') ||
                target.closest('input[type="checkbox"]') ||
                target.closest('[role="checkbox"]') ||
                target.closest('button') ||
                target.closest('a')
            ) {
                return;
            }
            onClick?.(e);
        },
        [onClick]
    );

    return (
        <tr
            data-slot="table-row"
            data-state={isSelected ? 'selected' : undefined}
            data-row-id={rowId}
            onClick={handleClick}
            className={cn(
                'transition-colors',
                'hover:bg-muted/50 data-[state=selected]:bg-accent/30',
                'group-data-[hover=none]/table:hover:bg-transparent',
                'group-data-[striped=true]/table:odd:bg-muted/30',
                onClick && 'cursor-pointer',
                transposeOnMobile &&
                    'block md:table-row mb-3 md:mb-0 border border-primary/10 md:border-0 rounded-lg md:rounded-none bg-card md:bg-transparent p-0 md:p-0 last:mb-0',
                className
            )}
            {...props}
        />
    );
}

// ============================================================================
// Table Head
// ============================================================================

type TableHeadProps = React.ComponentProps<'th'> & {
    /** Enable column resizing */
    resizable?: boolean;
    /** Minimum width when resizing */
    minWidth?: number;
    /** Maximum width when resizing */
    maxWidth?: number;
    /** Enable sorting for this column */
    sortable?: boolean;
    /** Sort key identifier (defaults to children text) */
    sortKey?: string;
    /** Alignment */
    align?: 'left' | 'center' | 'right';
};

function TableHead({
    className,
    children,
    resizable = false,
    minWidth = 8,
    maxWidth = 92,
    sortable = false,
    sortKey: columnSortKey,
    align = 'left',
    ...props
}: TableHeadProps) {
    const sortContext = useTableSort();
    const colResizeContext = React.useContext(TableColumnResizeContext);
    const isCompact = React.useContext(TableCompactContext);
    const transposeOnMobile = React.useContext(TableTransposeMobileContext);
    const colId = React.useId();
    const sortKey =
        columnSortKey || (typeof children === 'string' ? children : '');
    const isCurrentSort = sortContext?.sortKey === sortKey;
    const currentSortDirection = isCurrentSort
        ? sortContext?.sortDirection
        : null;

    React.useEffect(() => {
        if (!colResizeContext) return;
        colResizeContext.registerColumn({
            id: colId,
            resizable,
            minWidth,
            maxWidth,
        });
        return () => colResizeContext.unregisterColumn(colId);
    }, [colResizeContext, colId, resizable, minWidth, maxWidth]);

    const handleClick = React.useCallback(() => {
        if (sortable && sortContext && sortKey) {
            sortContext.onSort(sortKey);
        }
    }, [sortable, sortContext, sortKey]);

    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[align];

    // Get label text for mobile transpose
    const labelText =
        typeof children === 'string'
            ? children
            : React.isValidElement(children) &&
                typeof (children.props as { children?: unknown }).children ===
                    'string'
              ? ((children.props as { children?: unknown }).children as string)
              : '';
    return (
        <th
            data-slot="table-head"
            data-sortable={sortable || undefined}
            data-sorted={isCurrentSort || undefined}
            data-label={transposeOnMobile ? labelText : undefined}
            className={cn(
                // Compact spacing and sizing
                'relative align-middle',
                isCompact ? 'h-8 px-1.5 py-1' : 'h-9 px-2 py-1.5',
                // Modern typography with better hierarchy
                'text-xs font-semibold uppercase tracking-wider',
                'text-muted-foreground',
                'whitespace-nowrap select-none',
                alignClass,
                transposeOnMobile && 'hidden md:table-cell',
                // Checkbox column styling
                isCompact
                    ? '[&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:px-1.5 [&:has([role=checkbox])>div]:justify-center'
                    : '[&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:px-2 [&:has([role=checkbox])>div]:justify-center',
                // Interactive states for sortable columns
                sortable && [
                    'cursor-pointer',
                    'hover:text-foreground',
                    'hover:bg-muted/50',
                ],
                // Active sort state - use primary color for sorted column
                isCurrentSort && ['text-primary', 'bg-primary/5'],
                // Smooth transitions
                'transition-all duration-200 ease-in-out',
                // Subtle border between columns using theme border color
                'border-r border-border/50 last:border-r-0',
                className
            )}
            onClick={handleClick}
            {...props}
        >
            <div
                className={cn(
                    'flex items-center',
                    isCompact ? 'gap-1' : 'gap-1.5',
                    align === 'center' && 'justify-center',
                    align === 'right' && 'justify-end'
                )}
            >
                <span className="flex-1">{children}</span>
                {sortable && <SortIndicator direction={currentSortDirection} />}
            </div>
        </th>
    );
}

// Sort Indicator Component
function SortIndicator({ direction }: { direction: SortDirection }) {
    const isCompact = React.useContext(TableCompactContext);
    return (
        <span
            className={cn(
                'inline-flex items-center justify-center rounded transition-all duration-200',
                isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'
            )}
        >
            {direction === 'asc' && (
                <svg
                    className={cn(
                        'text-primary',
                        isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'
                    )}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 15l7-7 7 7"
                    />
                </svg>
            )}
            {direction === 'desc' && (
                <svg
                    className={cn(
                        'text-primary',
                        isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'
                    )}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            )}
            {direction === null && (
                <svg
                    className={cn(
                        'text-muted-foreground/40 hover:text-muted-foreground transition-colors',
                        isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'
                    )}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 9l4-4 4 4M16 15l-4 4-4-4"
                    />
                </svg>
            )}
        </span>
    );
}

// ============================================================================
// Table Cell
// ============================================================================

interface TableCellProps extends React.ComponentProps<'td'> {
    /** Alignment */
    align?: 'left' | 'center' | 'right';
    /** Disable text truncation */
    noTruncate?: boolean;
}

function TableCell({
    className,
    align = 'left',
    noTruncate,
    children,
    ...props
}: TableCellProps) {
    const isCompact = React.useContext(TableCompactContext);
    const transposeOnMobile = React.useContext(TableTransposeMobileContext);
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[align];

    const label = (props as { 'data-label'?: string })['data-label'];

    return (
        <td
            data-slot="table-cell"
            className={cn(
                // Compact cell padding
                'align-middle text-foreground',
                isCompact ? 'px-1.5 py-1 text-xs' : 'px-2 py-1.5 text-sm',
                noTruncate
                    ? 'whitespace-normal wrap-break-word'
                    : 'whitespace-nowrap',
                alignClass,
                isCompact
                    ? '[&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:px-1.5'
                    : '[&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:px-2',
                transposeOnMobile &&
                    'flex md:table-cell items-start md:items-middle gap-2 md:gap-0 px-3 md:px-2 py-2.5 md:py-1.5 border-b border-primary/10 md:border-b-0 last:border-b-0',
                className
            )}
            {...props}
        >
            {transposeOnMobile && label && (
                <span className="md:hidden font-medium text-primary/70 text-xs min-w-[100px] mr-2 shrink-0">
                    {label}
                </span>
            )}
            <span
                className={
                    transposeOnMobile ? 'md:contents flex-1 min-w-0' : ''
                }
            >
                {children}
            </span>
        </td>
    );
}

// ============================================================================
// Table Caption
// ============================================================================

function TableCaption({
    className,
    ...props
}: React.ComponentProps<'caption'>) {
    return (
        <caption
            data-slot="table-caption"
            className={cn('mt-4 text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

// ============================================================================
// Checkbox Component for Selection
// ============================================================================

interface TableCheckboxProps {
    checked?: boolean;
    indeterminate?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    'aria-label'?: string;
}

function TableCheckbox({
    checked = false,
    indeterminate = false,
    onChange,
    disabled = false,
    'aria-label': ariaLabel,
}: TableCheckboxProps) {
    const ref = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <div className="flex items-center justify-center mx-auto ">
            <input
                ref={ref}
                type="checkbox"
                role="checkbox"
                aria-label={ariaLabel}
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.checked)}
                className={cn(
                    'h-3 w-3 rounded border-2 transition-all duration-150',
                    'border-border',
                    'bg-card',
                    'focus:ring-2 focus:ring-ring/40 focus:ring-offset-0 focus:outline-none',
                    'hover:border-secondary',
                    'cursor-pointer',
                    'checked:bg-secondary checked:border-secondary',
                    'checked:hover:bg-secondary/90 checked:hover:border-secondary/90',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'disabled:hover:border-border'
                )}
            />
        </div>
    );
}

// ============================================================================
// Select All Checkbox for Header
// ============================================================================

interface TableSelectAllCheckboxProps {
    disabled?: boolean;
}

function TableSelectAllCheckbox({ disabled }: TableSelectAllCheckboxProps) {
    const context = React.useContext(TableSelectionContext);

    if (!context) {
        console.warn(
            'TableSelectAllCheckbox must be used within a Table with enableSelection={true}'
        );
        return null;
    }

    const {
        isAllSelected,
        isIndeterminate,
        toggleAll,
        selectedCount,
        totalCount,
    } = context;

    return (
        <TableCheckbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={toggleAll}
            disabled={disabled || totalCount === 0}
            aria-label={`Select all ${totalCount} rows (${selectedCount} selected)`}
        />
    );
}

// ============================================================================
// Row Selection Checkbox
// ============================================================================

interface TableRowCheckboxProps {
    rowId: string | number;
    disabled?: boolean;
}

function TableRowCheckbox({ rowId, disabled }: TableRowCheckboxProps) {
    const context = React.useContext(TableSelectionContext);

    if (!context) {
        console.warn(
            'TableRowCheckbox must be used within a Table with enableSelection={true}'
        );
        return null;
    }

    const { selectedRows, toggleRow } = context;
    const isSelected = selectedRows.has(rowId);

    return (
        <TableCheckbox
            checked={isSelected}
            onChange={() => toggleRow(rowId)}
            disabled={disabled}
            aria-label={`Select row ${rowId}`}
        />
    );
}

// ============================================================================
// Selection Toolbar Component
// ============================================================================

interface TableSelectionToolbarProps {
    children?: React.ReactNode;
    className?: string;
}

function TableSelectionToolbar({
    children,
    className,
}: TableSelectionToolbarProps) {
    const context = React.useContext(TableSelectionContext);

    if (!context || context.selectedCount === 0) {
        return null;
    }

    const { selectedCount, clearSelection } = context;

    return (
        <div
            className={cn(
                'flex items-center justify-between px-4 py-3 mb-3',
                'bg-accent/20 border border-border rounded-lg',
                'animate-in slide-in-from-top-2 duration-200',
                className
            )}
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {selectedCount}
                </div>
                <span className="text-sm font-medium text-foreground">
                    {selectedCount === 1 ? 'Item selected' : 'Items selected'}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {children}
                <Button size="sm" onClick={clearSelection}>
                    Clear
                </Button>
            </div>
        </div>
    );
}

// Add displayName for reliable child detection in Table component
TableSelectionToolbar.displayName = 'TableSelectionToolbar';

// ============================================================================
// Empty State Component
// ============================================================================

interface TableEmptyStateProps {
    colSpan?: number;
    message?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

function TableEmptyState({
    colSpan,
    message = 'No data available',
    description,
    icon,
    action,
}: TableEmptyStateProps) {
    return (
        <tr>
            <td colSpan={colSpan} className="h-64">
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                        {icon || (
                            <svg
                                className="w-8 h-8 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-base font-medium text-foreground">
                            {message}
                        </p>
                        {description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && <div className="mt-2">{action}</div>}
                </div>
            </td>
        </tr>
    );
}

// ============================================================================
// Loading State Component
// ============================================================================

interface TableLoadingStateProps {
    colSpan?: number;
    rows?: number;
}

function TableLoadingState({ colSpan, rows = 5 }: TableLoadingStateProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                    <td colSpan={colSpan} className="px-3 py-3">
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded bg-muted" />
                            <div className="flex-1 flex flex-col gap-2">
                                <div
                                    className="h-4 rounded bg-muted"
                                    style={{
                                        width: `${60 + Math.random() * 30}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>
            ))}
        </>
    );
}

// ============================================================================
// Pagination Component
// ============================================================================

interface TablePaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    className?: string;
}

function TablePagination({
    page,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    className,
}: TablePaginationProps) {
    const startItem = (page - 1) * itemsPerPage + 1;
    const endItem = Math.min(page * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const showPages = 5;

        if (totalPages <= showPages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            if (page > 3) pages.push('ellipsis');

            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (page < totalPages - 2) pages.push('ellipsis');

            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div
            className={cn(
                'flex items-center justify-between px-2 py-3 mt-4',
                'text-sm text-muted-foreground',
                className
            )}
        >
            <div>
                Showing{' '}
                <span className="font-medium text-foreground">{startItem}</span>{' '}
                to{' '}
                <span className="font-medium text-foreground">{endItem}</span>{' '}
                of{' '}
                <span className="font-medium text-foreground">
                    {totalItems}
                </span>{' '}
                results
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className={cn(
                        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                        'hover:bg-muted',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
                    )}
                >
                    Previous
                </button>

                <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((p, i) =>
                        p === 'ellipsis' ? (
                            <span
                                key={`ellipsis-${i}`}
                                className="px-2 text-muted-foreground"
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={cn(
                                    'w-8 h-8 rounded-md text-sm font-medium transition-colors',
                                    page === p
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                )}
                            >
                                {p}
                            </button>
                        )
                    )}
                </div>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className={cn(
                        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                        'hover:bg-muted',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
                    )}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// Exports
// ============================================================================

export {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableCheckbox,
    TableEmptyState,
    TableFooter,
    TableHead,
    TableHeader,
    TableLoadingState,
    TablePagination,
    TableRow,
    TableRowCheckbox,
    TableSelectAllCheckbox,
    TableSelectionToolbar,
};
