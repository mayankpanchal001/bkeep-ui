import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/cn';
import {
    Building2,
    Calendar,
    Check,
    ChevronsUpDown,
    FileText,
    GripVertical,
    Mail,
    MapPin,
    Package,
    Percent,
    Plus,
    Receipt,
    Settings,
    Trash2,
    Upload,
    User,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Customer = {
    id: string;
    name: string;
    email?: string;
    address?: string;
};

type LineItem = {
    id: string;
    description: string;
    qty: number;
    price: number;
    tax: number;
};

type CompanyInfo = {
    name: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    email: string;
    logo?: string;
};

type InvoiceFormData = {
    invoiceNumber: string;
    customer: Customer | null;
    issueDate: string;
    dueDate: string;
    paymentMethods: {
        interacTransfer: boolean;
        eftTransfer: boolean;
    };
    isRecurring: boolean;
    ccEmail: string;
    memo: string;
    notes: string;
    lineItems: LineItem[];
    subtotal: number;
    taxRate: number;
    discount: number;
    discountType: 'percentage' | 'fixed';
};

const MOCK_CUSTOMERS: Customer[] = [
    {
        id: '1',
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        address: '123 Business St, City, State 12345',
    },
    {
        id: '2',
        name: 'Blue Ocean Enterprises',
        email: 'info@blueocean.com',
        address: '456 Commerce Ave, City, State 67890',
    },
    { id: '3', name: 'Cyberdyne Systems', email: 'hello@cyberdyne.com' },
    { id: '4', name: 'Delta Dynamics', email: 'contact@delta.com' },
    { id: '5', name: 'Emerald Innovations', email: 'info@emerald.com' },
    { id: '6', name: 'Firefly Technologies', email: 'hello@firefly.com' },
    { id: '7', name: 'Galactic Industries', email: 'contact@galactic.com' },
];

type CreateInvoiceModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSaveDraft?: (data: InvoiceFormData) => void;
    onSendInvoice?: (data: InvoiceFormData) => void;
};

const CreateInvoiceModal = ({
    isOpen,
    onClose,
    onSaveDraft,
    onSendInvoice,
}: CreateInvoiceModalProps) => {
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
        name: 'Excel Studio Inc.',
        address: '1401 Rockland Ave',
        city: 'Victoria, BC',
        country: 'Canada',
        postalCode: 'V8S 1V9',
        email: 'ar@excel.studio',
    });

    const [formData, setFormData] = useState<InvoiceFormData>({
        invoiceNumber: 'INV-' + Math.floor(Math.random() * 10000),
        customer: null,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        paymentMethods: {
            interacTransfer: false,
            eftTransfer: false,
        },
        isRecurring: false,
        ccEmail: '',
        memo: '',
        notes: 'Thank you for your business!',
        lineItems: [],
        subtotal: 0,
        taxRate: 13,
        discount: 0,
        discountType: 'percentage',
    });

    const [customerOpen, setCustomerOpen] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');

    // Filter customers based on search
    const filteredCustomers = useMemo(() => {
        const q = customerSearch.trim().toLowerCase();
        return q
            ? MOCK_CUSTOMERS.filter(
                  (c) =>
                      c.name.toLowerCase().includes(q) ||
                      c.email?.toLowerCase().includes(q)
              )
            : MOCK_CUSTOMERS;
    }, [customerSearch]);

    // Calculate totals
    const subtotal = formData.lineItems.reduce(
        (sum, item) => sum + item.qty * item.price,
        0
    );

    const discountAmount =
        formData.discountType === 'percentage'
            ? (subtotal * formData.discount) / 100
            : formData.discount;

    const taxableAmount = subtotal - discountAmount;
    const totalTax = (taxableAmount * formData.taxRate) / 100;
    const total = taxableAmount + totalTax;

    // Handle ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSelectCustomer = (customer: Customer) => {
        setFormData({ ...formData, customer });
        setCustomerOpen(false);
        setCustomerSearch('');
    };

    const handleAddLineItem = () => {
        const newItem: LineItem = {
            id: Date.now().toString(),
            description: '',
            qty: 1,
            price: 0,
            tax: 0,
        };
        setFormData({
            ...formData,
            lineItems: [...formData.lineItems, newItem],
        });
    };

    const handleUpdateLineItem = (
        id: string,
        field: keyof LineItem,
        value: string | number
    ) => {
        setFormData({
            ...formData,
            lineItems: formData.lineItems.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        });
    };

    const handleDeleteLineItem = (id: string) => {
        setFormData({
            ...formData,
            lineItems: formData.lineItems.filter((item) => item.id !== id),
        });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompanyInfo({
                    ...companyInfo,
                    logo: reader.result as string,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
        }).format(amount);
    };

    const canSend = formData.customer && formData.lineItems.length > 0;

    return (
        <div className="absolute inset-0 z-40 bg-background flex flex-col rounded overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-9 w-9"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-foreground">
                                Create Invoice
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {formData.invoiceNumber}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onSaveDraft?.(formData)}
                    >
                        Save Draft
                    </Button>
                    <Button
                        onClick={() => onSendInvoice?.(formData)}
                        disabled={!canSend}
                    >
                        Send Invoice
                    </Button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side - Form */}
                <div className="w-full md:w-[520px] border-r border-border overflow-y-auto bg-card">
                    <Tabs
                        defaultValue="details"
                        className="h-full flex flex-col"
                    >
                        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
                            <TabsTrigger
                                value="details"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
                            >
                                <Receipt className="h-4 w-4 mr-2" />
                                Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="items"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
                            >
                                <Package className="h-4 w-4 mr-2" />
                                Items
                                {formData.lineItems.length > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {formData.lineItems.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="settings"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </TabsTrigger>
                        </TabsList>

                        {/* Details Tab */}
                        <TabsContent
                            value="details"
                            className="flex-1 p-6 space-y-6 mt-0"
                        >
                            {/* Invoice Number */}
                            <div className="space-y-2">
                                <Label htmlFor="invoiceNumber">
                                    Invoice Number
                                </Label>
                                <Input
                                    id="invoiceNumber"
                                    value={formData.invoiceNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            invoiceNumber: e.target.value,
                                        })
                                    }
                                    startIcon={<FileText className="h-4 w-4" />}
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="issueDate">
                                        Issue Date
                                    </Label>
                                    <Input
                                        id="issueDate"
                                        type="date"
                                        value={formData.issueDate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                issueDate: e.target.value,
                                            })
                                        }
                                        startIcon={
                                            <Calendar className="h-4 w-4" />
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                dueDate: e.target.value,
                                            })
                                        }
                                        startIcon={
                                            <Calendar className="h-4 w-4" />
                                        }
                                    />
                                </div>
                            </div>

                            {/* Customer Selection */}
                            <div className="space-y-2">
                                <Label>Customer</Label>
                                <Popover
                                    open={customerOpen}
                                    onOpenChange={setCustomerOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={customerOpen}
                                            className="w-full justify-between h-10 font-normal"
                                        >
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {formData.customer ? (
                                                    <span>
                                                        {formData.customer.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Select customer...
                                                    </span>
                                                )}
                                            </div>
                                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[--radix-popover-trigger-width] p-0"
                                        align="start"
                                    >
                                        <Command>
                                            <CommandInput
                                                placeholder="Search customers..."
                                                value={customerSearch}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setCustomerSearch(e.target.value)
                                                }
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    No customers found.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {filteredCustomers.map(
                                                        (customer) => (
                                                            <CommandItem
                                                                key={
                                                                    customer.id
                                                                }
                                                                onSelect={() =>
                                                                    handleSelectCustomer(
                                                                        customer
                                                                    )
                                                                }
                                                                className="flex flex-col items-start py-3"
                                                            >
                                                                <div className="flex items-center w-full">
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-2 h-4 w-4',
                                                                            formData
                                                                                .customer
                                                                                ?.id ===
                                                                                customer.id
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
                                                                        )}
                                                                    />
                                                                    <span className="font-medium">
                                                                        {
                                                                            customer.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {customer.email && (
                                                                    <span className="ml-6 text-xs text-muted-foreground">
                                                                        {
                                                                            customer.email
                                                                        }
                                                                    </span>
                                                                )}
                                                            </CommandItem>
                                                        )
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <Separator />

                            {/* Payment Methods */}
                            <div className="space-y-3">
                                <Label>Payment Methods</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="interac"
                                            checked={
                                                formData.paymentMethods
                                                    .interacTransfer
                                            }
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    paymentMethods: {
                                                        ...formData.paymentMethods,
                                                        interacTransfer:
                                                            checked === true,
                                                    },
                                                })
                                            }
                                        />
                                        <Label
                                            htmlFor="interac"
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            Interac e-Transfer
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="eft"
                                            checked={
                                                formData.paymentMethods
                                                    .eftTransfer
                                            }
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    paymentMethods: {
                                                        ...formData.paymentMethods,
                                                        eftTransfer:
                                                            checked === true,
                                                    },
                                                })
                                            }
                                        />
                                        <Label
                                            htmlFor="eft"
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            EFT Transfer
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Recurring Invoice */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="recurring">
                                        Recurring Invoice
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Automatically send this invoice on a
                                        schedule
                                    </p>
                                </div>
                                <Switch
                                    id="recurring"
                                    checked={formData.isRecurring}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            isRecurring: checked,
                                        })
                                    }
                                />
                            </div>

                            <Separator />

                            {/* CC Email */}
                            <div className="space-y-2">
                                <Label htmlFor="ccEmail">
                                    CC Email (optional)
                                </Label>
                                <Input
                                    id="ccEmail"
                                    type="email"
                                    value={formData.ccEmail}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            ccEmail: e.target.value,
                                        })
                                    }
                                    placeholder="email@example.com"
                                    startIcon={<Mail className="h-4 w-4" />}
                                />
                            </div>

                            {/* Memo */}
                            <div className="space-y-2">
                                <Label htmlFor="memo">
                                    Internal Memo (optional)
                                </Label>
                                <Textarea
                                    id="memo"
                                    value={formData.memo}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            memo: e.target.value,
                                        })
                                    }
                                    placeholder="Internal notes not shown on invoice..."
                                    rows={2}
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">
                                    Notes (shown on invoice)
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="Thank you for your business!"
                                    rows={3}
                                />
                            </div>
                        </TabsContent>

                        {/* Items Tab */}
                        <TabsContent
                            value="items"
                            className="flex-1 p-6 space-y-6 mt-0"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Line Items
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Add products or services to your invoice
                                    </p>
                                </div>
                                <Button size="sm" onClick={handleAddLineItem}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Item
                                </Button>
                            </div>

                            {formData.lineItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-lg bg-muted/30">
                                    <Package className="h-10 w-10 text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground mb-3">
                                        No items added yet
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddLineItem}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add First Item
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formData.lineItems.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="border border-border rounded-lg p-4 bg-card hover:border-primary/30 transition-colors"
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                                    <Badge variant="outline">
                                                        Item {index + 1}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() =>
                                                        handleDeleteLineItem(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            handleUpdateLineItem(
                                                                item.id,
                                                                'description',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Item description"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="space-y-2">
                                                        <Label>Quantity</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.qty}
                                                            onChange={(e) =>
                                                                handleUpdateLineItem(
                                                                    item.id,
                                                                    'qty',
                                                                    parseFloat(
                                                                        e.target
                                                                            .value
                                                                    ) || 0
                                                                )
                                                            }
                                                            min="0"
                                                            step="1"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Price</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) =>
                                                                handleUpdateLineItem(
                                                                    item.id,
                                                                    'price',
                                                                    parseFloat(
                                                                        e.target
                                                                            .value
                                                                    ) || 0
                                                                )
                                                            }
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Total</Label>
                                                        <div className="h-10 px-3 flex items-center bg-muted rounded-md text-sm font-medium">
                                                            {formatCurrency(
                                                                item.qty *
                                                                    item.price
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tax and Discount */}
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="taxRate">Tax Rate</Label>
                                    <Input
                                        id="taxRate"
                                        type="number"
                                        value={formData.taxRate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                taxRate:
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0,
                                            })
                                        }
                                        min="0"
                                        step="0.1"
                                        endIcon={
                                            <Percent className="h-4 w-4" />
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discount">Discount</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="discount"
                                            type="number"
                                            value={formData.discount}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    discount:
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0,
                                                })
                                            }
                                            min="0"
                                            step="0.01"
                                            className="flex-1"
                                        />
                                        <Select
                                            value={formData.discountType}
                                            onValueChange={(
                                                value: 'percentage' | 'fixed'
                                            ) =>
                                                setFormData({
                                                    ...formData,
                                                    discountType: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">
                                                    %
                                                </SelectItem>
                                                <SelectItem value="fixed">
                                                    $
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Totals Summary */}
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>
                                {formData.discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Discount (
                                            {formData.discountType ===
                                            'percentage'
                                                ? `${formData.discount}%`
                                                : formatCurrency(
                                                      formData.discount
                                                  )}
                                            )
                                        </span>
                                        <span className="font-medium text-destructive">
                                            -{formatCurrency(discountAmount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Tax ({formData.taxRate}%)
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(totalTax)}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold text-lg">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent
                            value="settings"
                            className="flex-1 p-6 space-y-6 mt-0"
                        >
                            <div>
                                <h3 className="text-sm font-semibold text-foreground mb-1">
                                    Company Information
                                </h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    This information appears on your invoice
                                </p>

                                {/* Logo Upload */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Company Logo</Label>
                                        <div className="flex items-center gap-4">
                                            {companyInfo.logo ? (
                                                <div className="relative group">
                                                    <img
                                                        src={companyInfo.logo}
                                                        alt="Company Logo"
                                                        className="w-16 h-16 object-contain border border-border rounded-lg bg-card"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            setCompanyInfo({
                                                                ...companyInfo,
                                                                logo: undefined,
                                                            })
                                                        }
                                                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30">
                                                    <Building2 className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            <label className="cursor-pointer">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <span>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Upload Logo
                                                    </span>
                                                </Button>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">
                                            Company Name
                                        </Label>
                                        <Input
                                            id="companyName"
                                            value={companyInfo.name}
                                            onChange={(e) =>
                                                setCompanyInfo({
                                                    ...companyInfo,
                                                    name: e.target.value,
                                                })
                                            }
                                            startIcon={
                                                <Building2 className="h-4 w-4" />
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="companyAddress">
                                            Address
                                        </Label>
                                        <Input
                                            id="companyAddress"
                                            value={companyInfo.address}
                                            onChange={(e) =>
                                                setCompanyInfo({
                                                    ...companyInfo,
                                                    address: e.target.value,
                                                })
                                            }
                                            startIcon={
                                                <MapPin className="h-4 w-4" />
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="companyCity">
                                                City
                                            </Label>
                                            <Input
                                                id="companyCity"
                                                value={companyInfo.city}
                                                onChange={(e) =>
                                                    setCompanyInfo({
                                                        ...companyInfo,
                                                        city: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyPostal">
                                                Postal Code
                                            </Label>
                                            <Input
                                                id="companyPostal"
                                                value={companyInfo.postalCode}
                                                onChange={(e) =>
                                                    setCompanyInfo({
                                                        ...companyInfo,
                                                        postalCode:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="companyCountry">
                                            Country
                                        </Label>
                                        <Input
                                            id="companyCountry"
                                            value={companyInfo.country}
                                            onChange={(e) =>
                                                setCompanyInfo({
                                                    ...companyInfo,
                                                    country: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="companyEmail">
                                            Email
                                        </Label>
                                        <Input
                                            id="companyEmail"
                                            type="email"
                                            value={companyInfo.email}
                                            onChange={(e) =>
                                                setCompanyInfo({
                                                    ...companyInfo,
                                                    email: e.target.value,
                                                })
                                            }
                                            startIcon={
                                                <Mail className="h-4 w-4" />
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Side - Invoice Preview */}
                <div className="hidden md:flex flex-1 bg-muted/30 items-start justify-center p-8 overflow-y-auto">
                    <div className="w-full max-w-xl bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                        {/* Preview Header */}
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-8 py-6 border-b border-border">
                            <div className="flex justify-between items-start">
                                {companyInfo.logo ? (
                                    <img
                                        src={companyInfo.logo}
                                        alt="Company Logo"
                                        className="w-14 h-14 object-contain"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-7 w-7 text-primary" />
                                    </div>
                                )}
                                <div className="text-right">
                                    <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                        INVOICE
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {formData.invoiceNumber}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Invoice Meta */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                            From
                                        </p>
                                        <p className="font-semibold text-foreground">
                                            {companyInfo.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {companyInfo.address}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {companyInfo.city},{' '}
                                            {companyInfo.postalCode}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {companyInfo.country}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {companyInfo.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                            Bill To
                                        </p>
                                        {formData.customer ? (
                                            <>
                                                <p className="font-semibold text-foreground">
                                                    {formData.customer.name}
                                                </p>
                                                {formData.customer.email && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            formData.customer
                                                                .email
                                                        }
                                                    </p>
                                                )}
                                                {formData.customer.address && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            formData.customer
                                                                .address
                                                        }
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">
                                                No customer selected
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                                Issue Date
                                            </p>
                                            <p className="text-sm font-medium">
                                                {formatDate(formData.issueDate)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                                Due Date
                                            </p>
                                            <p className="text-sm font-medium">
                                                {formatDate(formData.dueDate)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Due Banner */}
                            <div className="bg-primary/5 rounded-lg p-4 mb-6 border border-primary/10">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    Amount Due
                                </p>
                                <p className="text-2xl font-bold text-primary">
                                    {formatCurrency(total)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Due {formatDate(formData.dueDate)}
                                </p>
                            </div>

                            {/* Line Items Table */}
                            <div className="mb-6">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 font-medium text-muted-foreground">
                                                Description
                                            </th>
                                            <th className="text-center py-3 font-medium text-muted-foreground w-16">
                                                Qty
                                            </th>
                                            <th className="text-right py-3 font-medium text-muted-foreground w-24">
                                                Price
                                            </th>
                                            <th className="text-right py-3 font-medium text-muted-foreground w-24">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.lineItems.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No items added
                                                </td>
                                            </tr>
                                        ) : (
                                            formData.lineItems.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b border-border/50"
                                                >
                                                    <td className="py-3 text-foreground">
                                                        {item.description ||
                                                            'Untitled Item'}
                                                    </td>
                                                    <td className="py-3 text-center text-foreground">
                                                        {item.qty}
                                                    </td>
                                                    <td className="py-3 text-right text-foreground">
                                                        {formatCurrency(
                                                            item.price
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-right font-medium text-foreground">
                                                        {formatCurrency(
                                                            item.qty *
                                                                item.price
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="border-t border-border pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span className="text-foreground">
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>
                                {formData.discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Discount (
                                            {formData.discountType ===
                                            'percentage'
                                                ? `${formData.discount}%`
                                                : formatCurrency(
                                                      formData.discount
                                                  )}
                                            )
                                        </span>
                                        <span className="text-destructive">
                                            -{formatCurrency(discountAmount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Tax ({formData.taxRate}%)
                                    </span>
                                    <span className="text-foreground">
                                        {formatCurrency(totalTax)}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between pt-2">
                                    <span className="font-semibold text-foreground">
                                        Total
                                    </span>
                                    <span className="font-bold text-lg text-foreground">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>

                            {/* Notes */}
                            {formData.notes && (
                                <div className="mt-8 pt-6 border-t border-border">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                        Notes
                                    </p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {formData.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Preview Footer */}
                        <div className="px-8 py-4 bg-muted/50 border-t border-border flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                                {formData.invoiceNumber} •{' '}
                                {formatCurrency(total)} due{' '}
                                {formatDate(formData.dueDate)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Page 1 of 1
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateInvoiceModal;
