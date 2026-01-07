# Modern Table Component - Complete Documentation

## Overview

A best-in-class, reusable table component with:
- ✅ **Built-in Bulk Selection** - Select all/individual rows
- ✅ **Built-in Sorting** - Click column headers to sort
- ✅ **Controlled & Uncontrolled Modes** - Works both ways
- ✅ **Selection Toolbar** - Auto-shows when items selected
- ✅ **Pagination** - Built-in pagination component
- ✅ **Loading & Empty States** - Beautiful fallback UIs
- ✅ **Fully Typed** - Complete TypeScript support
- ✅ **Accessible** - ARIA labels and keyboard support
- ✅ **Dark Mode** - Full dark mode support

---

## Quick Start

### Basic Table with Selection

```tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableSelectAllCheckbox,
    TableRowCheckbox,
    TableSelectionToolbar,
    TablePagination,
} from '@/components/ui/table';

function MyTable() {
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const data = [...]; // Your data
    const rowIds = data.map(item => item.id);

    return (
        <Table
            enableSelection
            rowIds={rowIds}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
        >
            {/* Auto-showing toolbar when items selected */}
            <TableSelectionToolbar>
                <button onClick={handleBulkDelete}>Delete Selected</button>
                <button onClick={handleBulkExport}>Export Selected</button>
            </TableSelectionToolbar>

            <TableHeader>
                <tr>
                    <TableHead>
                        <TableSelectAllCheckbox />
                    </TableHead>
                    <TableHead sortable sortKey="name">Name</TableHead>
                    <TableHead sortable sortKey="email">Email</TableHead>
                </tr>
            </TableHeader>
            <TableBody>
                {data.map(row => (
                    <TableRow key={row.id} rowId={row.id}>
                        <TableCell>
                            <TableRowCheckbox rowId={row.id} />
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.email}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
```

---

## Migration from DataTable

### Before (Old DataTable)
```tsx
import { DataTable, type Column } from '@/components/shared/DataTable';

const columns: Column<User>[] = [
    { header: 'Name', accessorKey: 'name', sortable: true },
    { header: 'Email', accessorKey: 'email' },
];

<DataTable
    data={data}
    columns={columns}
    selectedItems={selectedItems}
    onSelectionChange={setSelectedItems}
    sorting={{ sort, order, onSortChange }}
    pagination={{ page, totalPages, onPageChange }}
/>
```

### After (New Table)
```tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableSelectAllCheckbox,
    TableRowCheckbox,
    TableSelectionToolbar,
    TablePagination,
    type SortDirection,
} from '@/components/ui/table';

<Table
    enableSelection
    rowIds={data.map(d => d.id)}
    selectedIds={selectedItems}
    onSelectionChange={setSelectedItems}
    sortKey={sortKey}
    sortDirection={sortDirection}
    onSortChange={(key, dir) => {
        setSortKey(key);
        setSortDirection(dir);
    }}
>
    <TableSelectionToolbar>
        {/* Your bulk actions */}
    </TableSelectionToolbar>

    <TableHeader>
        <tr>
            <TableHead><TableSelectAllCheckbox /></TableHead>
            <TableHead sortable sortKey="name">Name</TableHead>
            <TableHead sortable sortKey="email">Email</TableHead>
        </tr>
    </TableHeader>
    <TableBody>
        {data.map(row => (
            <TableRow key={row.id} rowId={row.id}>
                <TableCell><TableRowCheckbox rowId={row.id} /></TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
            </TableRow>
        ))}
    </TableBody>
</Table>

<TablePagination
    page={page}
    totalPages={totalPages}
    totalItems={data.length}
    itemsPerPage={20}
    onPageChange={setPage}
/>
```

---

## Component API

### Table

Main wrapper component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableSelection` | `boolean` | `false` | Enable row selection checkboxes |
| `rowIds` | `(string\|number)[]` | `[]` | All row IDs for selection tracking |
| `selectedIds` | `(string\|number)[]` | - | Controlled selected IDs |
| `onSelectionChange` | `(ids) => void` | - | Selection change callback |
| `sortKey` | `string\|null` | - | Current sort column key |
| `sortDirection` | `SortDirection` | - | Current sort direction |
| `onSortChange` | `(key, dir) => void` | - | Sort change callback |
| `compact` | `boolean` | `false` | Compact mode (less padding) |
| `striped` | `boolean` | `false` | Striped rows |
| `borderStyle` | `'default'\|'minimal'\|'none'` | `'default'` | Border style |

### TableHead

Column header with sorting support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sortable` | `boolean` | `false` | Enable sorting |
| `sortKey` | `string` | - | Sort key (defaults to text content) |
| `align` | `'left'\|'center'\|'right'` | `'left'` | Text alignment |
| `resizable` | `boolean` | `false` | Enable column resizing |

### TableRow

Table row with selection support.

| Prop | Type | Description |
|------|------|-------------|
| `rowId` | `string\|number` | Unique row ID for selection |

### TableSelectionToolbar

Auto-hiding toolbar that appears when rows are selected.

```tsx
<TableSelectionToolbar>
    <button>Delete</button>
    <button>Export</button>
</TableSelectionToolbar>
```

### TablePagination

Pagination controls.

| Prop | Type | Description |
|------|------|-------------|
| `page` | `number` | Current page |
| `totalPages` | `number` | Total pages |
| `totalItems` | `number` | Total item count |
| `itemsPerPage` | `number` | Items per page |
| `onPageChange` | `(page) => void` | Page change callback |

### TableEmptyState

Empty state placeholder.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colSpan` | `number` | - | Columns to span |
| `message` | `string` | `'No data available'` | Main message |
| `description` | `string` | - | Description text |
| `action` | `ReactNode` | - | Action button |

### TableLoadingState

Loading skeleton.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colSpan` | `number` | - | Columns to span |
| `rows` | `number` | `5` | Loading rows to show |

---

## Hooks

### useTableSelection

Access selection state within Table context.

```tsx
const {
    selectedRows,      // Set<string | number>
    selectedCount,     // number
    totalCount,        // number
    toggleRow,         // (id) => void
    toggleAll,         // () => void
    selectRows,        // (ids) => void
    clearSelection,    // () => void
    isAllSelected,     // boolean
    isIndeterminate,   // boolean
} = useTableSelection();
```

### useTableSort

Access sort state within Table context.

```tsx
const {
    sortKey,        // string | null
    sortDirection,  // 'asc' | 'desc' | null
    onSort,         // (key) => void
} = useTableSort();
```

---

## Examples

### Full Featured Table

See `src/components/ui/table-example.tsx` for complete examples.

### Minimal Table (No Selection)

```tsx
<Table borderStyle="minimal">
    <TableHeader>
        <tr>
            <TableHead>Product</TableHead>
            <TableHead align="right">Price</TableHead>
        </tr>
    </TableHeader>
    <TableBody>
        <TableRow>
            <TableCell>Widget</TableCell>
            <TableCell align="right">$29.99</TableCell>
        </TableRow>
    </TableBody>
</Table>
```

---

## Files Using DataTable That Could Be Migrated

The following files currently use the old `DataTable` component and could benefit from migrating to the new `Table`:

1. `src/components/settings/UsersTab.tsx`
2. `src/components/settings/RolesTab.tsx`
3. `src/pages/protected/JournalEntriespage.tsx`
4. `src/pages/protected/Expensespage.tsx`
5. `src/pages/protected/Invoicepage.tsx`
6. `src/pages/protected/ChartOfAccountspage.tsx`
7. `src/components/transactions/TransactionsTable.tsx`
8. `src/components/reports/IncomeStatementTable.tsx`

---

## Best Practices

1. **Always provide `rowId`** on TableRow when using selection
2. **Use built-in sorting** via Table props instead of manual handlers
3. **Place TableSelectionToolbar** as first child of Table
4. **Use TablePagination** outside the Table component
5. **Memoize data transformations** for performance
6. **Use controlled mode** for complex state management
