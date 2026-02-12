import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useInvoice } from '@/services/apis/invoicesApi';
import { InvoiceStatus } from '@/types/invoice';
import {
    CheckCircle2,
    ChevronDown,
    Clock,
    Edit,
    FileText,
    Mail,
    Printer,
    Send,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useMemo } from 'react';

type InvoiceDetailsDrawerProps = {
    invoiceId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
};

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
        icon: React.ReactNode;
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

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const InvoiceDetailsDrawer = ({
    invoiceId,
    isOpen,
    onClose,
    onEdit,
    onDelete,
}: InvoiceDetailsDrawerProps) => {
    const { data: invoiceData, isLoading } = useInvoice(invoiceId || '');
    const invoice = invoiceData?.data;

    const statusInfo = invoice
        ? statusConfig[invoice.status] || statusConfig.draft
        : statusConfig.draft;

    // Mock timeline data based on status
    const timeline = useMemo(() => {
        if (!invoice) return [];
        const steps = [
            {
                label: 'Created',
                date: invoice.createdAt,
                completed: true,
            },
            {
                label: 'Sent',
                date: invoice.status !== 'draft' ? invoice.updatedAt : null,
                completed: invoice.status !== 'draft',
            },
            {
                label: 'Viewed',
                date: null,
                completed: false,
            },
            {
                label: 'Paid',
                date: invoice.status === 'paid' ? invoice.updatedAt : null,
                completed: invoice.status === 'paid',
            },
        ];
        return steps;
    }, [invoice]);

    if (!invoiceId) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col gap-0">
                <SheetHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
                    <SheetTitle>
                        {isLoading
                            ? 'Loading...'
                            : `Invoice ${invoice?.invoiceNumber}`}
                    </SheetTitle>
                </SheetHeader>

                {isLoading || !invoice ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            <div className="p-6 space-y-8">
                                {/* Status and Amount */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Badge
                                            variant={statusInfo.variant}
                                            className="gap-1.5"
                                        >
                                            {statusInfo.icon}
                                            {statusInfo.label}
                                        </Badge>
                                        {invoice.status === 'overdue' && (
                                            <span className="text-sm">
                                                (Not sent)
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Total due
                                        </p>
                                        <h2 className="text-4xl font-bold tracking-tight">
                                            {currencyFormatter.format(
                                                invoice.balanceRemaining ||
                                                    invoice.totalAmount
                                            )}
                                        </h2>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Invoice date
                                        </p>
                                        <p className="font-medium">
                                            {formatDate(invoice.invoiceDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Due date
                                        </p>
                                        <p className="font-medium">
                                            {formatDate(invoice.dueDate)}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Customer Accordion */}
                                <Accordion
                                    type="single"
                                    collapsible
                                    defaultValue="customer"
                                >
                                    <AccordionItem
                                        value="customer"
                                        className="border-none"
                                    >
                                        <AccordionTrigger className="hover:no-underline py-2">
                                            <span className="font-semibold text-base">
                                                {invoice.customer.displayName}
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-2 text-sm text-muted-foreground pt-2 pl-1">
                                                {invoice.customer.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4" />
                                                        {invoice.customer.email}
                                                    </div>
                                                )}
                                                {invoice.billingAddress && (
                                                    <div className="flex items-start gap-2">
                                                        <FileText className="w-4 h-4 mt-0.5" />
                                                        {invoice.billingAddress}
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Separator />

                                {/* Activity Timeline */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">
                                        Invoice activity
                                    </h3>
                                    <div className="relative pl-2 ml-2 border-l-2 border-border space-y-6 pb-2">
                                        {timeline.map((step, index) => (
                                            <div
                                                key={index}
                                                className="relative pl-6"
                                            >
                                                <div
                                                    className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${
                                                        step.completed
                                                            ? 'bg-success border-success'
                                                            : 'bg-background border-muted-foreground'
                                                    }`}
                                                />
                                                <div className="flex flex-col">
                                                    <span
                                                        className={`text-sm font-medium ${
                                                            step.completed
                                                                ? 'text-foreground'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {step.label}
                                                    </span>
                                                    {step.date && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(
                                                                step.date
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Products and Services */}
                                <Accordion type="single" collapsible>
                                    <AccordionItem
                                        value="items"
                                        className="border-none"
                                    >
                                        <AccordionTrigger className="hover:no-underline py-2">
                                            <span className="font-semibold text-base">
                                                Products and services
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pt-4">
                                                {invoice.lines.map(
                                                    (line, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex justify-between items-start text-sm"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="font-medium">
                                                                    {
                                                                        line.productService
                                                                    }
                                                                </p>
                                                                {line.description && (
                                                                    <p className="text-muted-foreground">
                                                                        {
                                                                            line.description
                                                                        }
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {
                                                                        line.quantity
                                                                    }{' '}
                                                                    x{' '}
                                                                    {currencyFormatter.format(
                                                                        Number(
                                                                            line.rate
                                                                        )
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <p className="font-medium">
                                                                {currencyFormatter.format(
                                                                    line.amount
                                                                )}
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                                <div className="pt-4 border-t border-border flex justify-between items-center font-medium">
                                                    <span>Total</span>
                                                    <span>
                                                        {currencyFormatter.format(
                                                            invoice.totalAmount
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                    >
                                        More actions
                                        <ChevronDown className="w-4 h-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Printer className="w-4 h-4 mr-2" />
                                        Print
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <FileText className="w-4 h-4 mr-2" />
                                        View PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => onDelete(invoice.id)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button onClick={() => onEdit(invoice.id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit invoice
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default InvoiceDetailsDrawer;
