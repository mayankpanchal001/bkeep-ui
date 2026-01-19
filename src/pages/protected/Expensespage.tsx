import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableEmptyState,
    TableHead,
    TableHeader,
    TableRow,
    TableRowCheckbox,
    TableSelectAllCheckbox,
    TableSelectionToolbar,
} from '@/components/ui/table';
import { Filter, Pencil, Receipt, Search, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Expense = {
    id: string;
    date: string;
    vendor: string;
    category: string;
    amount: number;
    description: string;
    receipt?: string;
    paymentMethod: string;
};

const MOCK_EXPENSES: Expense[] = [
    {
        id: '1',
        date: '2024-01-15',
        vendor: 'Office Supplies Co',
        category: 'Office Supplies',
        amount: 250.5,
        description: 'Printer paper and pens',
        paymentMethod: 'Credit Card',
    },
    {
        id: '2',
        date: '2024-01-18',
        vendor: 'Cloud Services Inc',
        category: 'Software',
        amount: 99.99,
        description: 'Monthly subscription',
        paymentMethod: 'Bank Transfer',
    },
    {
        id: '3',
        date: '2024-01-20',
        vendor: 'Utility Company',
        category: 'Utilities',
        amount: 450.0,
        description: 'Electricity bill',
        paymentMethod: 'Bank Transfer',
    },
    {
        id: '4',
        date: '2024-01-22',
        vendor: 'Marketing Agency',
        category: 'Marketing',
        amount: 1500.0,
        description: 'Q1 Marketing campaign',
        paymentMethod: 'Check',
    },
];

const CATEGORIES = [
    'Office Supplies',
    'Software',
    'Utilities',
    'Marketing',
    'Travel',
    'Meals',
    'Rent',
    'Insurance',
    'Other',
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

const Expensespage = () => {
    const [expenses] = useState<Expense[]>(MOCK_EXPENSES);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);

    const filteredExpenses = expenses.filter((expense) => {
        const matchesSearch =
            expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesCategory =
            categoryFilter === 'all' || expense.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const totalAmount = filteredExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    const expensesByCategory = filteredExpenses.reduce(
        (acc, expense) => {
            acc[expense.category] =
                (acc[expense.category] || 0) + expense.amount;
            return acc;
        },
        {} as Record<string, number>
    );

    const rowIds = filteredExpenses.map((e) => e.id);

    const handleBulkDelete = () => {
        console.log('Deleting expenses:', selectedItems);
        setSelectedItems([]);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card rounded shadow-sm border border-primary/10 p-4">
                    <div className="text-sm text-primary/50 mb-1">
                        Total Expenses
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        {currencyFormatter.format(totalAmount)}
                    </div>
                    <div className="text-xs text-primary/50 mt-1">
                        {filteredExpenses.length} expenses
                    </div>
                </div>
                {Object.entries(expensesByCategory)
                    .slice(0, 3)
                    .map(([category, amount]) => (
                        <div
                            key={category}
                            className="bg-card rounded shadow-sm border border-primary/10 p-4"
                        >
                            <div className="text-sm text-primary/50 mb-1">
                                {category}
                            </div>
                            <div className="text-xl font-bold text-primary">
                                {currencyFormatter.format(amount)}
                            </div>
                        </div>
                    ))}
            </div>

            {/* Filters */}

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 w-4 h-4" />
                        <Input
                            id="search-expenses"
                            placeholder="Search expenses..."
                            value={searchQuery}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-primary/50 h-4 w-4" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-primary/10 rounded text-sm text-primary focus:outline-none focus:border-primary"
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Expenses Table */}
            <Table
                enableSelection
                rowIds={rowIds}
                selectedIds={selectedItems}
                onSelectionChange={setSelectedItems}
            >
                <TableSelectionToolbar>
                    <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                    >
                        Delete Selected
                    </button>
                </TableSelectionToolbar>

                <TableHeader>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead sortable sortKey="date">
                            Date
                        </TableHead>
                        <TableHead sortable sortKey="vendor">
                            Vendor
                        </TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead align="right" sortable sortKey="amount">
                            Amount
                        </TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead align="center">Actions</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {filteredExpenses.length === 0 ? (
                        <TableEmptyState
                            colSpan={8}
                            message="No expenses found"
                            description="Try adjusting your search or filters"
                        />
                    ) : (
                        filteredExpenses.map((expense) => (
                            <TableRow key={expense.id} rowId={expense.id}>
                                <TableCell>
                                    <TableRowCheckbox rowId={expense.id} />
                                </TableCell>
                                <TableCell>
                                    <span className="text-primary/75">
                                        {new Date(
                                            expense.date
                                        ).toLocaleDateString()}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-primary">
                                        {expense.vendor}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                        <Tag className="w-3 h-3" />
                                        {expense.category}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-primary/75">
                                        {expense.description}
                                    </span>
                                </TableCell>
                                <TableCell align="right">
                                    <span className="font-semibold text-primary">
                                        {currencyFormatter.format(
                                            expense.amount
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-primary/75">
                                        {expense.paymentMethod}
                                    </span>
                                </TableCell>
                                <TableCell align="center">
                                    <div className="flex items-center justify-center gap-2">
                                        {expense.receipt && (
                                            <button
                                                className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                                title="View Receipt"
                                            >
                                                <Receipt className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Create Expense Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-2xl rounded bg-card p-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-primary">
                                Add New Expense
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-primary/50 hover:text-primary"
                            >
                                ×
                            </button>
                        </div>
                        <form className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input id="expense-date" type="date" required />
                                <Input
                                    id="vendor"
                                    placeholder="Enter vendor name"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        Category
                                    </label>
                                    <select className="w-full px-4 py-2 border border-primary/10 rounded text-sm text-primary focus:outline-none focus:border-primary">
                                        {CATEGORIES.map((category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <Input
                                id="description"
                                placeholder="Enter description"
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-primary mb-2">
                                    Payment Method
                                </label>
                                <select className="w-full px-4 py-2 border border-primary/10 rounded text-sm text-primary focus:outline-none focus:border-primary">
                                    <option>Credit Card</option>
                                    <option>Bank Transfer</option>
                                    <option>Check</option>
                                    <option>Cash</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Add Expense
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expensespage;
