import { useState, useEffect } from 'react';
import {
    useCreateTenant,
    useUpdateTenant,
    type CreateTenantRequest,
} from '../../services/apis/tenantApi';
import { Tenant } from '../../types';
import Button from '../typography/Button';
import { InputField, TextareaField } from '../typography/InputFields';

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
            newErrors.name = 'Client name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Client name must be at least 2 characters';
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
                await updateTenant({
                    id: initialData.id,
                    data: payload,
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
            console.error('Save client error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <InputField
                    id="client-name"
                    label="Client Name"
                    placeholder="e.g., Sun Medicose"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                />
                {errors.name && (
                    <p className="text-red-500 text-xs mt-1 pl-1">
                        {errors.name}
                    </p>
                )}
            </div>

            <div>
                <InputField
                    id="schema-name"
                    label="Schema Name"
                    placeholder="e.g., sun_medicose"
                    value={formData.schemaName}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            schemaName: e.target.value.toLowerCase(),
                        })
                    }
                    required
                    disabled={isEditMode} // Usually schema name is immutable after creation
                />
                {errors.schemaName && (
                    <p className="text-red-500 text-xs mt-1 pl-1">
                        {errors.schemaName}
                    </p>
                )}
                <p className="text-primary/50 text-xs mt-1 pl-1">
                    Lowercase letters, numbers, and underscores only.
                    {!isEditMode && ' Auto-generated from tenant name.'}
                </p>
            </div>

            <div>
                <InputField
                    id="client-email"
                    label="Contact Email"
                    placeholder="e.g., contact@acmecorp.com"
                    value={formData.email || ''}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            email: e.target.value,
                        })
                    }
                    type="email"
                />
            </div>

            <div>
                <InputField
                    id="client-phone"
                    label="Client Phone"
                    placeholder="e.g., +1-555-123-4567"
                    value={formData.phone || ''}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            phone: e.target.value,
                        })
                    }
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <InputField
                        id="client-fiscal-year"
                        label="Client Fiscal Year Start"
                        placeholder="YYYY-MM-DD"
                        value={formData.fiscalYear || ''}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                fiscalYear: e.target.value,
                            })
                        }
                        type="date"
                    />
                </div>
                <div>
                    <InputField
                        id="client-incorporation-date"
                        label="Client Incorporation Date"
                        placeholder="YYYY-MM-DD"
                        value={formData.dateOfIncorporation || ''}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                dateOfIncorporation: e.target.value,
                            })
                        }
                        type="date"
                    />
                </div>
            </div>

            <div>
                <TextareaField
                    id="client-address"
                    label="Client Address"
                    placeholder="e.g., 123 Main St, City, State 12345"
                    value={formData.address || ''}
                    onChange={(e) =>
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
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 sm:flex-initial"
                    loading={isPending}
                >
                    {isEditMode ? 'Update Client' : 'Create Client'}
                </Button>
            </div>
        </form>
    );
};

export default TenantForm;
