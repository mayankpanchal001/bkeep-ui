import CreateInvoiceModal, { InvoiceFormData } from '@/components/invoice/CreateInvoiceModal';
import InvoiceDetailsDrawer from '@/components/invoice/InvoiceDetailsDrawer';
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
    useCreateInvoice,
    useDeleteInvoice,
    useInvoices,
} from '@/services/apis/invoicesApi';
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
import { toast } from 'sonner';
import { InvoiceStatus } from '../../types/invoice';

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

const statusConfig: Record<
    InvoiceStatus,
    {
        label: string;
        variant:
        | 'default'
        | 'secondary'
        | 'destructive'
        | 'outline'
        | 'success'
        | 'warning';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        icon: any;
    }
> = {
    draft: {
        label: 'Draft',
        variant: 'outline',
        icon: <FileText className="w-4 h-4" />,
    },
    sent: {
        label: 'Sent',
        variant: 'secondary',
        icon: <Clock className="w-4 h-4" />,
    },
    paid: {
        label: 'Paid',
        variant: 'success',
        icon: <CheckCircle2 className="w-4 h-4" />,
    },
    overdue: {
        label: 'Overdue',
        variant: 'destructive',
        icon: <XCircle className="w-4 h-4" />,
    },
    voided: {
        label: 'Voided',
        variant: 'outline',
        icon: <XCircle className="w-4 h-4" />,
    },
};

const Invoicepage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { data, isLoading } = useInvoices({
        page: 1,
        limit: 20,
        sort: 'documentDate',
        order: 'desc',
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
    });

    const createInvoiceMutation = useCreateInvoice();
    const deleteInvoiceMutation = useDeleteInvoice();

    const invoices = data?.data.items || [];
    const rowIds = invoices.map((i) => i.id);

    // When modal is open, show it instead of the regular content
    if (showCreateModal) {
        return (
            <div className="relative h-full">
                <CreateInvoiceModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSaveDraft={(data) => {
                        console.log('Saving draft:', data);
                        setShowCreateModal(false);
                    }}
                    onSave={(data: InvoiceFormData, action: 'new' | 'close' | 'share') => {
                        if (!data.customer) {
                            toast.error('Please select a customer');
                            return;
                        }

                        const payload = {
                            customerId: data.customer.id,
                            billingAddress: data.customer.address || '',
                            customerEmail: data.customer.email || '',
                            invoiceDate: data.issueDate,
                            dueDate: data.dueDate,
                            invoiceNumber: data.invoiceNumber,
                            messageOnInvoice: data.notes,
                            statementMessage: data.memo,
                            sendLater: false,
                            onlinePaymentsEnabled: false,
                            isTaxInclusive: false,
                            lines: data.lineItems.map((item) => ({
                                productService: item.description || 'Product',
                                description: item.description || '',
                                quantity: item.qty,
                                rate: item.price,
                                taxId: data.taxId // Use the selected global tax ID
                            })),
                        };

                        createInvoiceMutation.mutate(payload, {
                            onSuccess: () => {
                                toast.success('Invoice created successfully');
                                if (action === 'close') {
                                    setShowCreateModal(false);
                                } else if (action === 'new') {
                                    // Reset form by re-mounting (simple approach)
                                    setShowCreateModal(false);
                                    setTimeout(() => setShowCreateModal(true), 0);
                                } else if (action === 'share') {
                                    setShowCreateModal(false);
                                    toast.info('Invoice saved. Share link feature coming soon.');
                                }
                            },
                            onError: (error: Error) => {
                                toast.error(`Failed to create invoice: ${error.message}`);
                            },
                        });
                    }}
                />
            </div>
        );
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            deleteInvoiceMutation.mutate(id, {
                onSuccess: () => {
                    toast.success('Invoice deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete invoice');
                }
            });
        }
    };

    const handleBulkAction = (action: string) => {
        console.log(`${action} invoices:`, selectedItems);
        setSelectedItems([]);
    };

    const handleRowClick = (id: string) => {
        setSelectedInvoiceId(id);
        setIsDrawerOpen(true);
    };

    const totalAmount = invoices.reduce(
        (sum, invoice) => sum + (invoice.totalAmount || 0),
        0
    );

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title="Invoices"
                subtitle={`${invoices.length} invoice${invoices.length !== 1 ? 's' : ''} • ${currencyFormatter.format(totalAmount)} total`}
            />

            {/* Filters */}
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
                <Button onClick={() => setShowCreateModal(true)}>
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
                            All
                        </SelectItem>
                        <SelectItem value="draft">
                            Draft
                        </SelectItem>
                        <SelectItem value="sent">
                            Sent
                        </SelectItem>
                        <SelectItem value="paid">
                            Paid
                        </SelectItem>
                        <SelectItem value="overdue">
                            Overdue
                        </SelectItem>
                    </SelectContent>
                </Select>
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
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                                Loading invoices...
                            </TableCell>
                        </TableRow>
                    ) : invoices.length === 0 ? (
                        <TableEmptyState
                            colSpan={8}
                            message="No invoices found"
                            description="Create your first invoice to get started"
                        />
                    ) : (
                        invoices.map((invoice) => {
                            const config = statusConfig[invoice.status] || statusConfig.draft;
                            const statusVariant = config.variant;

                            return (
                                <TableRow
                                    key={invoice.id}
                                    rowId={invoice.id}
                                    onClick={() => handleRowClick(invoice.id)}
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
                                            {invoice.clientName || invoice.customerName}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-muted-foreground">
                                            {new Date(
                                                invoice.invoiceDate
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
                                        <span className="font-medium text-foreground">
                                            {currencyFormatter.format(
                                                invoice.totalAmount || 0
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Badge
                                            variant={statusVariant}
                                            className="gap-1.5"
                                        >
                                            {config.icon}
                                            {config.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell align="center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="min-w-[1rem]"
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
                                                        handleDelete(invoice.id);
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

            <InvoiceDetailsDrawer
                invoiceId={selectedInvoiceId}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onEdit={(id) => {
                    console.log('Edit', id);
                    // Add edit logic here later
                }}
                onDelete={(id) => {
                    handleDelete(id);
                    setIsDrawerOpen(false);
                }}
            />
        </div>
    );
};

export default Invoicepage;
