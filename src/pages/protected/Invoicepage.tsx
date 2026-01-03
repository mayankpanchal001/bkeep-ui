/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, useState } from 'react';
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
import CreateInvoiceModal from '@/components/invoice/CreateInvoiceModal';
import { Column, DataTable } from '@/components/shared/DataTable';
import Button from '@/components/typography/Button';
import { InputField } from '@/components/typography/InputFields';

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

    const columns: Column<Invoice>[] = useMemo(
        () => [
            {
                header: 'Invoice #',
                accessorKey: 'invoiceNumber',
                className: 'text-left font-medium text-primary',
            },
            {
                header: 'Client',
                accessorKey: 'clientName',
                className: 'text-left text-primary',
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: (invoice) => (
                    <span className="text-primary/75">
                        {new Date(invoice.date).toLocaleDateString()}
                    </span>
                ),
                className: 'text-left',
            },
            {
                header: 'Due Date',
                accessorKey: 'dueDate',
                cell: (invoice) => (
                    <span className="text-primary/75">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                    </span>
                ),
                className: 'text-left',
            },
            {
                header: 'Amount',
                accessorKey: 'amount',
                cell: (invoice) => currencyFormatter.format(invoice.amount),
                className: 'text-right font-semibold text-primary',
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (invoice) => {
                    const StatusIcon = statusConfig[invoice.status].icon;
                    return (
                        <div className="flex justify-center">
                            <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                    statusConfig[invoice.status].color
                                }`}
                            >
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig[invoice.status].label}
                            </span>
                        </div>
                    );
                },
                className: 'text-center',
            },
            {
                header: 'Actions',
                cell: () => (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="View"
                        >
                            <FaEye className="w-4 h-4" />
                        </button>
                        <button
                            className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Edit"
                        >
                            <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                        >
                            <FaTrash className="w-4 h-4" />
                        </button>
                    </div>
                ),
                className: 'text-center w-32',
            },
        ],
        []
    );

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-primary">
                        Invoices
                    </h1>
                    <p className="text-primary/75 text-sm mt-1">
                        Manage your client invoices and payments
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
            <div className="bg-white p-4 rounded-2 shadow-sm border border-primary/10 mb-6">
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
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-primary/10 rounded-2 text-sm text-primary focus:outline-none focus:border-primary"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-2 shadow-sm border border-primary/10 overflow-hidden">
                <DataTable
                    data={filteredInvoices}
                    columns={columns}
                    emptyMessage={
                        <div className="px-4 py-8 text-center text-primary/50">
                            No invoices found
                        </div>
                    }
                    onRowClick={(invoice) => {
                        // Optional: Navigate to detail view
                        console.log('Clicked invoice:', invoice);
                    }}
                />
            </div>
        </div>
    );
};

export default Invoicepage;
