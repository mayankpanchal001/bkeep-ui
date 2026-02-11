import { ArrowLeft, Mail, Phone, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Icons } from '../../components/shared/Icons';
import Loading from '../../components/shared/Loading';
import PageHeader from '../../components/shared/PageHeader';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../components/ui/card';
import Input from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../components/ui/tabs';
import {
    useContact,
    useCreateContact,
    useDisableContact,
    useEnableContact,
    useUpdateContact,
} from '../../services/apis/contactsApi';
import {
    ContactType,
    CreateContactPayload,
    UpdateContactPayload,
} from '../../types/contact';
import { showErrorToast, showSuccessToast } from '../../utills/toast';

const contactTypeOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'supplier', label: 'Supplier' },
];

const titleOptions = [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Dr', label: 'Dr' },
    { value: 'Prof', label: 'Prof' },
    { value: 'Sir', label: 'Sir' },
    { value: 'Madam', label: 'Madam' },
];

// Helper function to get contact initials
const getContactInitials = (displayName: string): string => {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
};

// Helper component for Input with Label
interface InputFieldProps
    extends Omit<React.ComponentProps<typeof Input>, 'error'> {
    label?: string;
    required?: boolean;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    id,
    label,
    required,
    error,
    ...props
}) => {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                    {required && (
                        <span className="text-destructive ml-1">*</span>
                    )}
                </Label>
            )}
            <Input id={id} name={id} {...props} />
            {error && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <Icons.Close className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );
};

// Helper component for Select with Label
interface SelectFieldProps {
    id: string;
    label?: string;
    required?: boolean;
    value?: string;
    defaultValue?: string;
    options: { value: string; label: string }[];
    onChange?: (value: string) => void;
    error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
    id,
    label,
    required,
    value,
    defaultValue,
    options,
    onChange,
    error,
}) => {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                    {required && (
                        <span className="text-destructive ml-1">*</span>
                    )}
                </Label>
            )}
            <Select
                name={id}
                value={value || undefined}
                defaultValue={defaultValue || undefined}
                onValueChange={onChange}
            >
                <SelectTrigger id={id}>
                    <SelectValue
                        placeholder={`Select ${label?.toLowerCase() || 'option'}`}
                    />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <Icons.Close className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );
};

const ContactDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const {
        data: contactData,
        isLoading,
        refetch,
    } = useContact(isNew ? '' : id || '');
    const contact = contactData?.data;

    const { mutateAsync: createContact, isPending: isCreating } =
        useCreateContact();
    const { mutateAsync: updateContact, isPending: isUpdating } =
        useUpdateContact();
    const { mutateAsync: enableContact, isPending: isEnabling } =
        useEnableContact();
    const { mutateAsync: disableContact, isPending: isDisabling } =
        useDisableContact();

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [contactType, setContactType] = useState<ContactType>(
        contact?.type || 'customer'
    );

    const isBusy = isCreating || isUpdating || (isLoading && !isNew);
    const isStatusBusy = isEnabling || isDisabling;

    useEffect(() => {
        if (contact?.type) {
            setContactType(contact.type);
        }
    }, [contact]);

    useEffect(() => {
        if (!isNew && !isLoading && !contact && id) {
            showErrorToast('Contact not found');
            navigate('/expenses/contacts');
        }
    }, [isNew, isLoading, contact, id, navigate]);

    const handleToggleStatus = async (checked: boolean) => {
        if (!contact?.id) return;
        try {
            if (checked) {
                await enableContact(contact.id);
                showSuccessToast('Contact enabled');
            } else {
                await disableContact(contact.id);
                showSuccessToast('Contact disabled');
            }
            refetch();
        } catch {
            showErrorToast('Failed to update contact status');
        }
    };

    const validateForm = (formData: FormData): boolean => {
        const newErrors: Record<string, string> = {};
        const displayName = formData.get('displayName') as string;

        if (!displayName?.trim()) {
            newErrors.displayName = 'Display name is required';
        }

        const email = formData.get('email') as string;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        if (!validateForm(formData)) {
            return;
        }

        const payload: CreateContactPayload = {
            type: (formData.get('type') as ContactType) || 'customer',
            displayName: (formData.get('displayName') as string) || '',
            companyName: (formData.get('companyName') as string) || null,
            title: (formData.get('title') as string) || null,
            firstName: (formData.get('firstName') as string) || null,
            middleName: (formData.get('middleName') as string) || null,
            lastName: (formData.get('lastName') as string) || null,
            suffix: (formData.get('suffix') as string) || null,
            email: (formData.get('email') as string) || null,
            phoneNumber: (formData.get('phoneNumber') as string) || null,
            nameOnCheques: (formData.get('nameOnCheques') as string) || null,
            defaultAccountId:
                (formData.get('defaultAccountId') as string) || null,
            defaultTaxId: (formData.get('defaultTaxId') as string) || null,
            openingBalance:
                formData.get('openingBalance') !== null &&
                formData.get('openingBalance') !== ''
                    ? Number(formData.get('openingBalance'))
                    : null,
            openingBalanceDate:
                (formData.get('openingBalanceDate') as string) || null,
            notes: (formData.get('notes') as string) || null,
            billingAddress: {
                streetAddress1:
                    (formData.get('billing_streetAddress1') as string) || null,
                streetAddress2:
                    (formData.get('billing_streetAddress2') as string) || null,
                city: (formData.get('billing_city') as string) || null,
                province: (formData.get('billing_province') as string) || null,
                postalCode:
                    (formData.get('billing_postalCode') as string) || null,
                country: (formData.get('billing_country') as string) || null,
            },
            shippingAddress: {
                streetAddress1:
                    (formData.get('shipping_streetAddress1') as string) || null,
                streetAddress2:
                    (formData.get('shipping_streetAddress2') as string) || null,
                city: (formData.get('shipping_city') as string) || null,
                province: (formData.get('shipping_province') as string) || null,
                postalCode:
                    (formData.get('shipping_postalCode') as string) || null,
                country: (formData.get('shipping_country') as string) || null,
            },
        };

        try {
            if (isNew) {
                await createContact(payload);
            } else if (id) {
                await updateContact({
                    id,
                    payload: payload as UpdateContactPayload,
                });
                showSuccessToast('Contact updated successfully');
            }
            navigate('/expenses/contacts');
        } catch {
            showErrorToast('Failed to save contact');
        }
    };

    const copyBillingToShipping = (e: React.MouseEvent<HTMLButtonElement>) => {
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const fields = [
            'streetAddress1',
            'streetAddress2',
            'city',
            'province',
            'postalCode',
            'country',
        ];
        fields.forEach((field) => {
            const b = form.querySelector<HTMLInputElement>(`#billing_${field}`);
            const s = form.querySelector<HTMLInputElement>(
                `#shipping_${field}`
            );
            if (b && s) s.value = b.value;
        });
        showSuccessToast('Billing address copied to shipping');
    };

    const handleBackToList = () => navigate('/expenses/contacts');

    if (isLoading && !isNew) {
        return <Loading />;
    }

    const displayName = contact?.displayName || 'New Contact';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToList}
                        className="shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        {!isNew && (
                            <Avatar className="size-12">
                                <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 text-primary font-medium text-lg">
                                    {getContactInitials(displayName)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div>
                            <PageHeader
                                title={isNew ? 'New Contact' : displayName}
                                subtitle={
                                    isNew
                                        ? 'Create a new customer or supplier'
                                        : `Manage details for ${contact?.companyName || contact?.displayName}`
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!isNew && contact && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/10 bg-card">
                            <Switch
                                checked={contact.isActive}
                                onCheckedChange={handleToggleStatus}
                                disabled={isStatusBusy}
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-primary">
                                    {contact.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToList}
                        disabled={isBusy}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        loading={isBusy}
                        startIcon={<Save className="w-4 h-4" />}
                    >
                        {isNew ? 'Create Contact' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Primary contact details and identification
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectField
                                    id="type"
                                    label="Contact Type"
                                    required
                                    value={contactType}
                                    defaultValue={contact?.type || 'customer'}
                                    options={contactTypeOptions}
                                    onChange={(value) =>
                                        setContactType(value as ContactType)
                                    }
                                    error={errors.type}
                                />
                                <InputField
                                    id="displayName"
                                    label="Display Name"
                                    required
                                    placeholder="e.g. Acme Corporation"
                                    defaultValue={contact?.displayName || ''}
                                    error={errors.displayName}
                                />
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                                <div className="sm:col-span-1">
                                    <SelectField
                                        id="title"
                                        label="Title"
                                        defaultValue={
                                            contact?.title || undefined
                                        }
                                        options={titleOptions}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <InputField
                                        id="firstName"
                                        label="First Name"
                                        placeholder="John"
                                        defaultValue={contact?.firstName || ''}
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <InputField
                                        id="middleName"
                                        label="Middle"
                                        placeholder="A."
                                        defaultValue={contact?.middleName || ''}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <InputField
                                        id="lastName"
                                        label="Last Name"
                                        placeholder="Doe"
                                        defaultValue={contact?.lastName || ''}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="sm:col-span-1">
                                    <InputField
                                        id="suffix"
                                        label="Suffix"
                                        placeholder="Jr."
                                        defaultValue={contact?.suffix || ''}
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <InputField
                                        id="companyName"
                                        label="Company Name"
                                        placeholder="Acme Corporation"
                                        defaultValue={
                                            contact?.companyName || ''
                                        }
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    startIcon={<Mail className="w-4 h-4" />}
                                    placeholder="john.doe@example.com"
                                    defaultValue={contact?.email || ''}
                                    error={errors.email}
                                />
                                <InputField
                                    id="phoneNumber"
                                    label="Phone Number"
                                    startIcon={<Phone className="w-4 h-4" />}
                                    placeholder="+1-555-123-4567"
                                    defaultValue={contact?.phoneNumber || ''}
                                />
                            </div>

                            <InputField
                                id="nameOnCheques"
                                label="Name on Cheques"
                                placeholder="Acme Corporation"
                                defaultValue={contact?.nameOnCheques || ''}
                            />
                        </CardContent>
                    </Card>

                    {/* Addresses */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                                <CardTitle>Addresses</CardTitle>
                                <CardDescription>
                                    Billing and shipping addresses
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copyBillingToShipping}
                            >
                                <Icons.Download className="w-4 h-4 mr-2" />
                                Copy Billing
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="billing" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="billing">
                                        Billing Address
                                    </TabsTrigger>
                                    <TabsTrigger value="shipping">
                                        Shipping Address
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    value="billing"
                                    className="space-y-4 mt-4"
                                >
                                    <div className="grid grid-cols-1 gap-4">
                                        <InputField
                                            id="billing_streetAddress1"
                                            label="Street Address 1"
                                            placeholder="123 Main St"
                                            defaultValue={
                                                contact?.billingAddress
                                                    ?.streetAddress1 || ''
                                            }
                                        />
                                        <InputField
                                            id="billing_streetAddress2"
                                            label="Street Address 2"
                                            placeholder="Suite 100"
                                            defaultValue={
                                                contact?.billingAddress
                                                    ?.streetAddress2 || ''
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            id="billing_city"
                                            label="City"
                                            placeholder="Toronto"
                                            defaultValue={
                                                contact?.billingAddress?.city ||
                                                ''
                                            }
                                        />
                                        <InputField
                                            id="billing_province"
                                            label="Province/State"
                                            placeholder="Ontario"
                                            defaultValue={
                                                contact?.billingAddress
                                                    ?.province || ''
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            id="billing_postalCode"
                                            label="Postal/Zip Code"
                                            placeholder="M5H 2N2"
                                            defaultValue={
                                                contact?.billingAddress
                                                    ?.postalCode || ''
                                            }
                                        />
                                        <InputField
                                            id="billing_country"
                                            label="Country"
                                            placeholder="Canada"
                                            defaultValue={
                                                contact?.billingAddress
                                                    ?.country || ''
                                            }
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent
                                    value="shipping"
                                    className="space-y-4 mt-4"
                                >
                                    <div className="grid grid-cols-1 gap-4">
                                        <InputField
                                            id="shipping_streetAddress1"
                                            label="Street Address 1"
                                            placeholder="456 Shipping Ave"
                                            defaultValue={
                                                contact?.shippingAddress
                                                    ?.streetAddress1 || ''
                                            }
                                        />
                                        <InputField
                                            id="shipping_streetAddress2"
                                            label="Street Address 2"
                                            placeholder="Suite 200"
                                            defaultValue={
                                                contact?.shippingAddress
                                                    ?.streetAddress2 || ''
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            id="shipping_city"
                                            label="City"
                                            placeholder="Toronto"
                                            defaultValue={
                                                contact?.shippingAddress
                                                    ?.city || ''
                                            }
                                        />
                                        <InputField
                                            id="shipping_province"
                                            label="Province/State"
                                            placeholder="Ontario"
                                            defaultValue={
                                                contact?.shippingAddress
                                                    ?.province || ''
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            id="shipping_postalCode"
                                            label="Postal/Zip Code"
                                            placeholder="M5H 3N3"
                                            defaultValue={
                                                contact?.shippingAddress
                                                    ?.postalCode || ''
                                            }
                                        />
                                        <InputField
                                            id="shipping_country"
                                            label="Country"
                                            placeholder="Canada"
                                            defaultValue={
                                                contact?.shippingAddress
                                                    ?.country || ''
                                            }
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (Settings & Financials) */}
                <div className="space-y-6">
                    {/* Financial Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Details</CardTitle>
                            <CardDescription>
                                Default accounts and opening balance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InputField
                                id="defaultAccountId"
                                label="Default Account ID"
                                placeholder="Enter account ID"
                                defaultValue={contact?.defaultAccountId || ''}
                            />
                            <InputField
                                id="defaultTaxId"
                                label="Default Tax ID"
                                placeholder="Enter tax ID"
                                defaultValue={contact?.defaultTaxId || ''}
                            />
                            <Separator />
                            <InputField
                                id="openingBalance"
                                label="Opening Balance"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                defaultValue={
                                    contact?.openingBalance?.toString() || ''
                                }
                            />
                            <InputField
                                id="openingBalanceDate"
                                label="As of Date"
                                type="date"
                                defaultValue={
                                    contact?.openingBalanceDate
                                        ? new Date(contact.openingBalanceDate)
                                              .toISOString()
                                              .split('T')[0]
                                        : ''
                                }
                            />
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                            <CardDescription>
                                Internal notes about this contact
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InputField
                                id="notes"
                                label="Internal Notes"
                                placeholder="Add notes about this contact..."
                                defaultValue={contact?.notes || ''}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
};

export default ContactDetailPage;
