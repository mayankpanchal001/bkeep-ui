import CreateInvoiceModal from '@/components/invoice/CreateInvoiceModal';
import PageHeader from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Input from '@/components/ui/input';
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
import {
    CheckCircle2,
    Clock,
    Edit,
    Eye,
    FileText,
    Filter,
    MoreVertical,
    Plus,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

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
        variant: 'outline' as const,
        icon: FileText,
    },
    sent: {
        label: 'Sent',
        variant: 'secondary' as const,
        icon: Clock,
    },
    paid: {
        label: 'Paid',
        variant: 'success' as const,
        icon: CheckCircle2,
    },
    overdue: {
        label: 'Overdue',
        variant: 'destructive' as const,
        icon: XCircle,
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

    const totalAmount = filteredInvoices.reduce(
        (sum, invoice) => sum + invoice.amount,
        0
    );

    const statusCounts = {
        all: invoices.length,
        draft: invoices.filter((i) => i.status === 'draft').length,
        sent: invoices.filter((i) => i.status === 'sent').length,
        paid: invoices.filter((i) => i.status === 'paid').length,
        overdue: invoices.filter((i) => i.status === 'overdue').length,
    };

    return (
        <div className="space-y-4">
            <PageHeader
                title="Invoices"
                subtitle={`${filteredInvoices.length} invoice${filteredInvoices.length !== 1 ? 's' : ''} • ${currencyFormatter.format(totalAmount)} total`}
            />

            {/* Filters */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-[260px]">
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search invoices..."
                            startIcon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <Button size="sm" onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        New Invoice
                    </Button>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All ({statusCounts.all})
                            </SelectItem>
                            <SelectItem value="draft">
                                Draft ({statusCounts.draft})
                            </SelectItem>
                            <SelectItem value="sent">
                                Sent ({statusCounts.sent})
                            </SelectItem>
                            <SelectItem value="paid">
                                Paid ({statusCounts.paid})
                            </SelectItem>
                            <SelectItem value="overdue">
                                Overdue ({statusCounts.overdue})
                            </SelectItem>
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('Send')}
                    >
                        Send Selected
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('Delete')}
                    >
                        Delete Selected
                    </Button>
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
                            Client
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
                        <TableHead align="center" className="w-[100px]">
                            Actions
                        </TableHead>
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
                            const statusVariant =
                                statusConfig[invoice.status].variant;

                            return (
                                <TableRow
                                    key={invoice.id}
                                    rowId={invoice.id}
                                    onClick={() =>
                                        console.log('Clicked invoice:', invoice)
                                    }
                                >
                                    <TableCell>
                                        <TableRowCheckbox rowId={invoice.id} />
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-foreground">
                                            {invoice.invoiceNumber}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-foreground">
                                            {invoice.clientName}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-muted-foreground">
                                            {new Date(
                                                invoice.date
                                            ).toLocaleDateString()}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-muted-foreground">
                                            {new Date(
                                                invoice.dueDate
                                            ).toLocaleDateString()}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <span className="font-semibold text-foreground">
                                            {currencyFormatter.format(
                                                invoice.amount
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Badge
                                            variant={statusVariant}
                                            className="gap-1.5"
                                        >
                                            <StatusIcon className="w-3 h-3" />
                                            {statusConfig[invoice.status].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell align="center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log(
                                                            'View invoice:',
                                                            invoice.id
                                                        );
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log(
                                                            'Edit invoice:',
                                                            invoice.id
                                                        );
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log(
                                                            'Delete invoice:',
                                                            invoice.id
                                                        );
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default Invoicepage;
