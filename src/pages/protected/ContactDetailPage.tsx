import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
    useContact,
    useCreateContact,
    useUpdateContact,
    useEnableContact,
    useDisableContact,
} from '../../services/apis/contactsApi';
import {
    ContactType,
    CreateContactPayload,
    UpdateContactPayload,
} from '../../types/contact';
import { Loader2 } from 'lucide-react';
import Button from '../../components/typography/Button';
import {
    InputField,
    SelectField,
} from '../../components/typography/InputFields';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import Chips from '../../components/typography/Chips';
import { Icons } from '../../components/shared/Icons';

const contactTypeOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'supplier', label: 'Supplier' },
];

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

    const isBusy = isCreating || isUpdating || (isLoading && !isNew);
    const isStatusBusy = isEnabling || isDisabling;

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

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

        if (!payload.displayName) {
            showErrorToast('Display name is required');
            return;
        }

        try {
            if (isNew) {
                await createContact(payload);
                showSuccessToast('Contact created successfully');
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
        return (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm text-primary/60">
                        Loading contact details...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 max-w-7xl mx-auto pb-10"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-primary tracking-tight">
                            {isNew
                                ? 'New Contact'
                                : contact?.displayName || 'Edit Contact'}
                        </h1>
                        {!isNew && contact && (
                            <Chips
                                label={contact.isActive ? 'Active' : 'Inactive'}
                                variant={
                                    contact.isActive ? 'success' : 'danger'
                                }
                            />
                        )}
                    </div>
                    <div className="text-sm text-primary/60 font-medium">
                        {isNew
                            ? 'Create a new customer or supplier'
                            : `Manage details for ${contact?.companyName || contact?.displayName}`}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToList}
                        disabled={isBusy}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={isBusy}>
                        {isNew ? 'Create Contact' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectField
                                    id="type"
                                    label="Contact Type"
                                    labelShow
                                    required
                                    defaultValue={contact?.type || 'customer'}
                                    options={contactTypeOptions}
                                />
                                <InputField
                                    id="displayName"
                                    label="Display Name"
                                    required
                                    placeholder="e.g. Acme Corporation"
                                    defaultValue={contact?.displayName || ''}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                                <div className="sm:col-span-1">
                                    <InputField
                                        id="title"
                                        label="Title"
                                        placeholder="Mr."
                                        defaultValue={contact?.title || ''}
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    icon={<Icons.Mail className="w-4 h-4" />}
                                    placeholder="john.doe@example.com"
                                    defaultValue={contact?.email || ''}
                                />
                                <InputField
                                    id="phoneNumber"
                                    label="Phone Number"
                                    icon={<Icons.Phone className="w-4 h-4" />}
                                    placeholder="+1-555-123-4567"
                                    defaultValue={contact?.phoneNumber || ''}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <InputField
                                    id="nameOnCheques"
                                    label="Name on Cheques"
                                    placeholder="Acme Corporation"
                                    defaultValue={contact?.nameOnCheques || ''}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Addresses Card with Tabs */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle>Addresses</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copyBillingToShipping}
                                className="bg-transparent shadow-none text-primary/70 hover:text-primary hover:bg-primary/5"
                            >
                                Copy billing to shipping
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="billing" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="billing">
                                        Billing Address
                                    </TabsTrigger>
                                    <TabsTrigger value="shipping">
                                        Shipping Address
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    value="billing"
                                    className="space-y-4"
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
                                    className="space-y-4"
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
                                            placeholder=""
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
                    {/* Status Card (Edit Mode Only) */}
                    {!isNew && contact && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">
                                    Contact Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between pb-4">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-medium">
                                        {contact.isActive
                                            ? 'Active'
                                            : 'Inactive'}
                                    </div>
                                    <div className="text-xs text-primary/60">
                                        {contact.isActive
                                            ? 'Contact is enabled'
                                            : 'Contact is disabled'}
                                    </div>
                                </div>
                                <Switch
                                    checked={contact.isActive}
                                    onCheckedChange={handleToggleStatus}
                                    disabled={isStatusBusy}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Financial Defaults */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Details</CardTitle>
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
                            <div className="border-t border-primary/5 my-4"></div>
                            <InputField
                                id="openingBalance"
                                label="Opening Balance"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                defaultValue={contact?.openingBalance ?? ''}
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
