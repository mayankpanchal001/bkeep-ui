import CreateInvoiceModal from '@/components/invoice/CreateInvoiceModal';
import Button from '@/components/typography/Button';
import { InputField } from '@/components/typography/InputFields';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { useState } from 'react';
import {
    FaCheckCircle,
    FaClock,
    FaEdit,
    FaEye,
    FaFileInvoiceDollar,
    FaFilter,
    FaPlus,
    FaSearch,
    FaTimesCircle,
    FaTrash,
} from 'react-icons/fa';

type Invoice = {
    id: string;
    invoiceNumber: string;
    clientName: string;
    date: string;
    dueDate: string;
    amount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    description: string;
};

const MOCK_INVOICES: Invoice[] = [
    {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        clientName: 'Acme Corporation',
        date: '2024-01-15',
        dueDate: '2024-02-15',
        amount: 5000,
        status: 'paid',
        description: 'Monthly accounting services',
    },
    {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        clientName: 'Tech Solutions Inc',
        date: '2024-01-20',
        dueDate: '2024-02-20',
        amount: 7500,
        status: 'sent',
        description: 'Q1 Financial reporting',
    },
    {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        clientName: 'Global Enterprises',
        date: '2024-01-25',
        dueDate: '2024-02-25',
        amount: 12000,
        status: 'overdue',
        description: 'Annual audit services',
    },
    {
        id: '4',
        invoiceNumber: 'INV-2024-004',
        clientName: 'Startup Co',
        date: '2024-02-01',
        dueDate: '2024-03-01',
        amount: 3000,
        status: 'draft',
        description: 'Bookkeeping services',
    },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

const statusConfig = {
    draft: {
        label: 'Draft',
        color: 'bg-gray-100 text-primary/70',
        icon: FaFileInvoiceDollar,
    },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: FaClock },
    paid: {
        label: 'Paid',
        color: 'bg-green-100 text-green-700',
        icon: FaCheckCircle,
    },
    overdue: {
        label: 'Overdue',
        color: 'bg-red-100 text-red-700',
        icon: FaTimesCircle,
    },
};

const Invoicepage = () => {
    const [invoices] = useState<Invoice[]>(MOCK_INVOICES);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);

    const filteredInvoices = invoices.filter((invoice) => {
        const matchesSearch =
            invoice.clientName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            invoice.invoiceNumber
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const rowIds = filteredInvoices.map((i) => i.id);

    // When modal is open, show it instead of the regular content
    if (showCreateModal) {
        return (
            <div className="relative h-full -m-4">
                <CreateInvoiceModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSaveDraft={(data) => {
                        console.log('Saving draft:', data);
                        setShowCreateModal(false);
                    }}
                    onSendInvoice={(data) => {
                        console.log('Sending invoice:', data);
                        setShowCreateModal(false);
                    }}
                />
            </div>
        );
    }

    const handleBulkAction = (action: string) => {
        console.log(`${action} invoices:`, selectedItems);
        setSelectedItems([]);
    };

    return (
        <div className="max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ">
                    <div>
                        <h1 className="text-2xl font-semibold text-primary">
                            Invoices
                        </h1>
                        <p className="text-primary/75 text-sm mt-1">
                            Manage your company invoices and payments
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        icon={<FaPlus className="w-4 h-4" />}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Create Invoice
                    </Button>
                </div>

                {/* Filters */}

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 w-4 h-4" />
                            <InputField
                                id="search-invoices"
                                placeholder="Search invoices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-primary/50" />
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Invoices Table */}

                <Table
                    enableSelection
                    rowIds={rowIds}
                    selectedIds={selectedItems}
                    onSelectionChange={setSelectedItems}
                >
                    <TableSelectionToolbar>
                        <button
                            onClick={() => handleBulkAction('Send')}
                            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                        >
                            Send Selected
                        </button>
                        <button
                            onClick={() => handleBulkAction('Delete')}
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
                            <TableHead sortable sortKey="invoiceNumber">
                                Invoice #
                            </TableHead>
                            <TableHead sortable sortKey="clientName">
                                Company
                            </TableHead>
                            <TableHead sortable sortKey="date">
                                Date
                            </TableHead>
                            <TableHead sortable sortKey="dueDate">
                                Due Date
                            </TableHead>
                            <TableHead align="right" sortable sortKey="amount">
                                Amount
                            </TableHead>
                            <TableHead align="center">Status</TableHead>
                            <TableHead align="center">Actions</TableHead>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.length === 0 ? (
                            <TableEmptyState
                                colSpan={8}
                                message="No invoices found"
                                description="Create your first invoice to get started"
                            />
                        ) : (
                            filteredInvoices.map((invoice) => {
                                const StatusIcon =
                                    statusConfig[invoice.status].icon;
                                return (
                                    <TableRow
                                        key={invoice.id}
                                        rowId={invoice.id}
                                        onClick={() =>
                                            console.log(
                                                'Clicked invoice:',
                                                invoice
                                            )
                                        }
                                    >
                                        <TableCell>
                                            <TableRowCheckbox
                                                rowId={invoice.id}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-primary">
                                                {invoice.invoiceNumber}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-primary">
                                                {invoice.clientName}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-primary/75">
                                                {new Date(
                                                    invoice.date
                                                ).toLocaleDateString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-primary/75">
                                                {new Date(
                                                    invoice.dueDate
                                                ).toLocaleDateString()}
                                            </span>
                                        </TableCell>
                                        <TableCell align="right">
                                            <span className="font-semibold text-primary">
                                                {currencyFormatter.format(
                                                    invoice.amount
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                                    statusConfig[invoice.status]
                                                        .color
                                                }`}
                                            >
                                                <StatusIcon className="w-3 h-3" />
                                                {
                                                    statusConfig[invoice.status]
                                                        .label
                                                }
                                            </span>
                                        </TableCell>
                                        <TableCell align="center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                                    title="View"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                                    title="Edit"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Invoicepage;
