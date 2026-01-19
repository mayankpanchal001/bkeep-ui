import { useEffect, useState } from 'react';
import {
    useCreateTax,
    useUpdateTax,
    type CreateTaxPayload,
    type UpdateTaxPayload,
} from '../../services/apis/taxApi';
import { Tax } from '../../types/tax';
import { Icons } from '../shared/Icons';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import Input from '../ui/input';
import { Textarea } from '../ui/textarea';
interface TaxFormProps {
    onClose: () => void;
    initialData?: Tax;
}

const TaxForm = ({ onClose, initialData }: TaxFormProps) => {
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState<{
        name: string;
        code?: string;
        ratePercent: string;
        description?: string;
        isActive: boolean;
    }>({
        name: '',
        code: '',
        ratePercent: '',
        description: '',
        isActive: true,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                code: initialData.code || '',
                ratePercent: ((initialData.rate || 0) * 100).toString(),
                description: initialData.description || '',
                isActive: !!initialData.isActive,
            });
        }
    }, [initialData]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const { mutateAsync: createTax, isPending: isCreating } = useCreateTax();
    const { mutateAsync: updateTax, isPending: isUpdating } = useUpdateTax();

    const isPending = isCreating || isUpdating;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tax name is required';
        }

        const rateNum = Number(formData.ratePercent);
        if (isNaN(rateNum) || rateNum < 0) {
            newErrors.ratePercent = 'Enter a valid percentage (e.g., 13)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const ratePercentNum = Number(formData.ratePercent);
            const payload: CreateTaxPayload = {
                name: formData.name.trim(),
                code: formData.code?.trim() || undefined,
                description: formData.description?.trim() || undefined,
                isActive: formData.isActive,
                rate: ratePercentNum / 100,
            };

            if (isEditMode && initialData) {
                await updateTax({
                    id: initialData.id,
                    payload: payload as UpdateTaxPayload,
                });
            } else {
                await createTax(payload);
            }

            onClose();
        } catch (error) {
            console.error('Save tax error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Input
                        id="tax-name"
                        placeholder="e.g., HST"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
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
                        id="tax-code"
                        placeholder="e.g., HST-ON"
                        value={formData.code || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData({ ...formData, code: e.target.value })
                        }
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Input
                        id="tax-rate"
                        placeholder="e.g., 13"
                        value={formData.ratePercent}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData({
                                ...formData,
                                ratePercent: e.target.value,
                            })
                        }
                        type="number"
                        required
                    />
                    {errors.ratePercent && (
                        <p className="text-destructive text-xs mt-1 pl-1">
                            {errors.ratePercent}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 pt-6">
                    <Checkbox
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                            setFormData({
                                ...formData,
                                isActive: !!checked,
                            })
                        }
                        id="tax-active"
                    />
                    <label
                        htmlFor="tax-active"
                        className="text-sm text-primary"
                    >
                        Active
                    </label>
                </div>
            </div>

            <div>
                <Textarea
                    id="tax-description"
                    placeholder="Optional description"
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({
                            ...formData,
                            description: e.target.value,
                        })
                    }
                />
            </div>

            <div className="flex items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isPending}
                    startIcon={<Icons.Close className="w-4 h-4" />}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isPending}
                    loading={isPending}
                    variant="default"
                    startIcon={<Icons.Save className="w-4 h-4" />}
                >
                    Save
                </Button>
            </div>
        </form>
    );
};

export default TaxForm;
