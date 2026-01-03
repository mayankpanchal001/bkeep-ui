import { useState } from 'react';
import { useAuth } from '../../stores/auth/authSelectore';
import { Icons } from '../shared/Icons';
import Button from '../typography/Button';
import { InputField } from '../typography/InputFields';
import { SettingsFormData } from './types';

interface ProfileTabProps {
    formData: SettingsFormData;
    onFormDataChange: (data: SettingsFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    roleDisplayName?: string;
}

const ProfileTab = ({
    formData,
    onFormDataChange,
    onSubmit,
    roleDisplayName,
}: ProfileTabProps) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        onSubmit(e);
        setIsEditing(false);
    };

    // Get user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Profile Header Card */}
            <div className="bg-white rounded-lg p-6 border border-primary/10 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border border-primary/10">
                            {getInitials(formData.name || 'User')}
                        </div>
                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 space-y-2">
                        <div>
                            <h2 className="text-xl font-bold text-primary mb-1">
                                {formData.name || 'User Name'}
                            </h2>
                            <p className="text-sm text-primary/50">
                                Manage your personal information and account
                                settings
                            </p>
                        </div>

                        {/* Contact Badges */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            {formData.company && (
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-xs text-primary/70 border border-primary/10">
                                    <Icons.MapPin className="w-3.5 h-3.5 text-primary/50" />
                                    {formData.company}
                                </div>
                            )}
                            {formData.phone && (
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-xs text-primary/70 border border-primary/10">
                                    <Icons.Phone className="w-3.5 h-3.5 text-primary/50" />
                                    {formData.phone}
                                </div>
                            )}
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-xs text-primary/70 border border-primary/10">
                                <Icons.Mail className="w-3.5 h-3.5 text-primary/50" />
                                {formData.email}
                            </div>
                        </div>
                    </div>

                    {/* Edit Button */}
                    {!isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            type="button"
                        >
                            <Icons.Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            {/* Information Grid */}
            {isEditing ? (
                /* Edit Mode - Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-lg border border-primary/10 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
                            <Icons.Profile className="w-5 h-5 text-primary/50" />
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                id="name"
                                label="Full Name"
                                value={formData.name}
                                onChange={(e) =>
                                    onFormDataChange({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputField
                                id="email"
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    onFormDataChange({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputField
                                id="phone"
                                label="Phone Number"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) =>
                                    onFormDataChange({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                            />
                            <InputField
                                id="company"
                                label="Company / Location"
                                value={formData.company}
                                onChange={(e) =>
                                    onFormDataChange({
                                        ...formData,
                                        company: e.target.value,
                                    })
                                }
                            />
                            <InputField
                                id="timezone"
                                label="Timezone"
                                value={formData.timezone}
                                onChange={(e) =>
                                    onFormDataChange({
                                        ...formData,
                                        timezone: e.target.value,
                                    })
                                }
                            />
                            <InputField
                                id="currency"
                                label="Currency"
                                value={formData.currency}
                                onChange={(e) =>
                                    onFormDataChange({
                                        ...formData,
                                        currency: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            <Icons.Save className="mr-2 w-4 h-4" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            ) : (
                /* View Mode - Display */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column: Contact & Preferences */}
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                                <Icons.UserCircle className="w-4 h-4 text-primary/70" />
                                Contact Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                                        <Icons.Mail className="w-4 h-4 text-primary/60" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-primary/50 uppercase tracking-wide">
                                            Email Address
                                        </div>
                                        <div className="text-sm font-medium text-primary break-all">
                                            {formData.email ||
                                                user?.email ||
                                                '—'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                                        <Icons.Phone className="w-4 h-4 text-primary/60" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-primary/50 uppercase tracking-wide">
                                            Phone Number
                                        </div>
                                        <div className="text-sm font-medium text-primary">
                                            {formData.phone || '—'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                                        <Icons.Building className="w-4 h-4 text-primary/60" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-primary/50 uppercase tracking-wide">
                                            Company / Location
                                        </div>
                                        <div className="text-sm font-medium text-primary">
                                            {formData.company || '—'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                                <Icons.Settings className="w-4 h-4 text-primary/70" />
                                Regional Preferences
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs font-medium text-primary/50 uppercase tracking-wide mb-1">
                                        Timezone
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                        <Icons.MapPin className="w-3.5 h-3.5 text-primary/40" />
                                        {formData.timezone || '—'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-primary/50 uppercase tracking-wide mb-1">
                                        Currency
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                        <Icons.Billing className="w-3.5 h-3.5 text-primary/40" />
                                        {formData.currency || '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Security & Organizations */}
                    <div className="space-y-6">
                        {/* Access & Role */}
                        <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                                    <Icons.Shield className="w-4 h-4 text-primary/70" />
                                    Access & Permissions
                                </h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {roleDisplayName ||
                                        user?.role?.displayName ||
                                        user?.role?.name ||
                                        '—'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="text-xs text-primary/50">
                                    Granted Capabilities:
                                </div>
                                {user?.permissions &&
                                user.permissions.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {user.permissions.map((perm) => (
                                            <span
                                                key={perm.id}
                                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white border border-primary/10 text-primary/70 shadow-sm"
                                            >
                                                <Icons.Check className="w-3 h-3 mr-1 text-green-500" />
                                                {perm.displayName}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-primary/40 italic">
                                        No specific permissions assigned
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Organizations */}
                        <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                                    <Icons.Users className="w-4 h-4 text-primary/70" />
                                    Organizations
                                </h3>
                                {user?.tenants && (
                                    <span className="text-xs text-primary/50 bg-primary/5 px-2 py-1 rounded-md">
                                        {user.tenants.length} Active
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                {user?.tenants && user.tenants.length > 0 ? (
                                    user.tenants.map((tenant) => {
                                        const isPrimary = tenant.isPrimary;
                                        const isSelected =
                                            user.selectedTenantId === tenant.id;
                                        return (
                                            <div
                                                key={tenant.id}
                                                className={`
                                                    flex items-center justify-between rounded-lg border p-3 transition-all
                                                    ${
                                                        isSelected
                                                            ? 'bg-primary/5 border-primary/20 shadow-sm'
                                                            : 'bg-white border-primary/10 hover:border-primary/20 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                <div className="min-w-0">
                                                    <div className="font-medium text-sm text-primary truncate">
                                                        {tenant.name}
                                                    </div>
                                                    <div className="text-[10px] text-primary/40 truncate font-mono mt-0.5">
                                                        ID: {tenant.id}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    {isPrimary && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                            Primary
                                                        </span>
                                                    )}
                                                    {isSelected && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-primary/40 text-sm">
                                        No organizations found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileTab;
