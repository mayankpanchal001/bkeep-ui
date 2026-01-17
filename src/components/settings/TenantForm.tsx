import { SINGLE_TENANT_PREFIX } from '@/components/homepage/constants';
import { useEffect, useState } from 'react';
import {
    useCreateTenant,
    useUpdateTenant,
    type CreateTenantRequest,
} from '../../services/apis/tenantApi';
import { Tenant } from '../../types';
import { Icons } from '../shared/Icons';
import { Button } from '../ui/button';
import Input from '../ui/input';
import { Textarea } from '../ui/textarea';

const CAP_SINGULAR =
    SINGLE_TENANT_PREFIX.charAt(0).toUpperCase() +
    SINGLE_TENANT_PREFIX.slice(1);

interface TenantFormProps {
    onClose: () => void;
    initialData?: Tenant;
}

const TenantForm = ({ onClose, initialData }: TenantFormProps) => {
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState<CreateTenantRequest>({
        name: '',
        schemaName: '',
        email: '',
        phone: '',
        address: '',
        fiscalYear: '',
        dateOfIncorporation: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                schemaName: initialData.schemaName || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                address: initialData.address || '',
                fiscalYear: initialData.fiscalYear
                    ? new Date(initialData.fiscalYear)
                          .toISOString()
                          .split('T')[0]
                    : '',
                dateOfIncorporation: initialData.dateOfIncorporation
                    ? new Date(initialData.dateOfIncorporation)
                          .toISOString()
                          .split('T')[0]
                    : '',
            });
        }
    }, [initialData]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const { mutateAsync: createTenant, isPending: isCreating } =
        useCreateTenant();
    const { mutateAsync: updateTenant, isPending: isUpdating } =
        useUpdateTenant();

    const isPending = isCreating || isUpdating;

    // Generate schema name from tenant name
    const generateSchemaName = (name: string): string => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/_+/g, '_') // Replace multiple underscores with single
            .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    };

    const handleNameChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            name: value,
            schemaName: isEditMode
                ? prev.schemaName
                : generateSchemaName(value),
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = `${CAP_SINGULAR} name is required`;
        } else if (formData.name.trim().length < 2) {
            newErrors.name = `${CAP_SINGULAR} name must be at least 2 characters`;
        }

        if (!formData.schemaName.trim()) {
            newErrors.schemaName = 'Schema name is required';
        } else if (!/^[a-z0-9_]+$/.test(formData.schemaName)) {
            newErrors.schemaName =
                'Schema name can only contain lowercase letters, numbers, and underscores';
        } else if (formData.schemaName.length < 2) {
            newErrors.schemaName = 'Schema name must be at least 2 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const payload = {
                name: formData.name.trim(),
                schemaName: formData.schemaName.trim(),
                email: formData.email?.trim() || '',
                phone: formData.phone?.trim() || '',
                address: formData.address?.trim() || '',
                fiscalYear: formData.fiscalYear || '',
                dateOfIncorporation: formData.dateOfIncorporation || '',
            };

            if (isEditMode && initialData) {
                const updatePayload: Partial<CreateTenantRequest> = {
                    ...payload,
                };
                delete updatePayload.schemaName;
                await updateTenant({
                    id: initialData.id,
                    data: updatePayload,
                });
            } else {
                await createTenant(payload);
            }

            // Reset form on success (optional since we close)
            setFormData({
                name: '',
                schemaName: '',
                email: '',
                phone: '',
                address: '',
                fiscalYear: '',
                dateOfIncorporation: '',
            });
            setErrors({});
            onClose();
        } catch (error) {
            // Error is handled by the mutation's onError
            console.error(`Save ${SINGLE_TENANT_PREFIX} error:`, error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Input
                    id="client-name"
                    placeholder="e.g., Sun Medicose"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(e.target.value)}
                    required
                />
                {errors.name && (
                    <p className="text-destructive text-xs mt-1 pl-1">
                        {errors.name}
                    </p>
                )}
            </div>

            <div>
                <Input
                    id="schema-name"
                    placeholder="e.g., sun_medicose"
                    value={formData.schemaName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                            ...formData,
                            schemaName: e.target.value.toLowerCase(),
                        })
                    }
                    required
                    readOnly={isEditMode}
                />
                {errors.schemaName && (
                    <p className="text-destructive text-xs mt-1 pl-1">
                        {errors.schemaName}
                    </p>
                )}
                <p className="text-primary/50 text-xs mt-1 pl-1">
                    Lowercase letters, numbers, and underscores only.
                    {!isEditMode &&
                        ` Auto-generated from ${SINGLE_TENANT_PREFIX} name.`}
                </p>
            </div>

            <div>
                <Input
                    id="client-email"
                    placeholder="e.g., contact@acmecorp.com"
                    value={formData.email || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>   ) =>
                        setFormData({
                            ...formData,
                            email: e.target.value,
                        })
                    }
                    type="email"
                />
            </div>

            <div>
                <Input
                    id="client-phone"
                    placeholder="e.g., +1-555-123-4567"
                    value={formData.phone || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                            ...formData,
                            phone: e.target.value,
                        })
                    }
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="client-fiscal-year"
                        className="input-label block mb-1.5"
                    >
                        {`${CAP_SINGULAR} Fiscal Year Start`}
                    </label>
                    <Input
                        id="client-fiscal-year"
                        type="date"
                        placeholder="Select fiscal year start date"
                        value={formData.fiscalYear || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData({
                                ...formData,
                                fiscalYear: e.target.value,
                            })
                        }
                    />
                </div>
                <div>
                    <label
                        htmlFor="client-incorporation-date"
                        className="input-label block mb-1.5"
                    >
                        {`${CAP_SINGULAR} Incorporation Date`}
                    </label>
                    <Input
                        id="client-incorporation-date"
                        type="date"
                        placeholder="Select incorporation date"
                        value={formData.dateOfIncorporation || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData({
                                ...formData,
                                dateOfIncorporation: e.target.value,
                            })
                        }
                    />
                </div>
            </div>

            <div>
                <Textarea
                    id="client-address"
                    placeholder="e.g., 123 Main St, City, State 12345"
                    value={formData.address || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({
                            ...formData,
                            address: e.target.value,
                        })
                    }
                />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 sm:flex-initial"
                    onClick={onClose}
                    disabled={isPending}
                    startIcon={<Icons.Close className="w-4 h-4" />}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                        variant="default"
                    className="flex-1 sm:flex-initial"
                    loading={isPending}
                    startIcon={<Icons.Save className="w-4 h-4" />}
                >
                    Save
                </Button>
            </div>
        </form>
    );
};

export default TenantForm;
