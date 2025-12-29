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
        <div className="flex flex-col gap-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-lg p-6 border border-primary-10 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-primary-10 flex items-center justify-center text-primary text-2xl font-bold border border-primary-10">
                            {getInitials(formData.name || 'User')}
                        </div>
                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 space-y-2">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                {formData.name || 'User Name'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Manage your personal information and account
                                settings
                            </p>
                        </div>

                        {/* Contact Badges */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            {formData.company && (
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full text-xs text-gray-700 border border-gray-200">
                                    <Icons.MapPin className="w-3.5 h-3.5 text-gray-500" />
                                    {formData.company}
                                </div>
                            )}
                            {formData.phone && (
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full text-xs text-gray-700 border border-gray-200">
                                    <Icons.Phone className="w-3.5 h-3.5 text-gray-500" />
                                    {formData.phone}
                                </div>
                            )}
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full text-xs text-gray-700 border border-gray-200">
                                <Icons.Mail className="w-3.5 h-3.5 text-gray-500" />
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
                    <div className="bg-white rounded-lg border border-primary-10 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Icons.Profile className="w-5 h-5 text-gray-500" />
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="flex flex-col gap-6">
                    {/* Primary Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg border border-primary-10 p-5 shadow-sm">
                            <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                Full Name
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                                {formData.name || user?.name || '—'}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-primary-10 p-5 shadow-sm">
                            <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                Email Address
                            </div>
                            <div className="text-sm font-semibold text-gray-900 break-all">
                                {formData.email || user?.email || '—'}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-primary-10 p-5 shadow-sm">
                            <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                Phone Number
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                                {formData.phone || '—'}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-primary-10 p-5 shadow-sm">
                            <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                Company / Location
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                                {formData.company || '—'}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-primary-10 p-5 shadow-sm">
                            <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                Role
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-10 text-primary">
                                    {roleDisplayName ||
                                        user?.role?.displayName ||
                                        user?.role?.name ||
                                        '—'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-primary-10 p-5 shadow-sm">
                            <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                Currency
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                                {formData.currency || '—'}
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="bg-white rounded-lg border border-primary-10 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-sm font-semibold text-gray-900">
                                    Permissions
                                </div>
                                <p className="text-xs text-gray-500">
                                    Capabilities granted to this user
                                </p>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                {user?.permissions?.length || 0} permission
                                {user && user.permissions.length !== 1
                                    ? 's'
                                    : ''}
                            </span>
                        </div>
                        {user?.permissions && user.permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {user.permissions.map((perm) => (
                                    <span
                                        key={perm.id}
                                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                                    >
                                        {perm.displayName}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">
                                No permissions assigned
                            </p>
                        )}
                    </div>

                    {/* Tenants / Organizations */}
                    <div className="bg-white rounded-lg border border-primary-10 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-sm font-semibold text-gray-900">
                                    Organizations / Tenants
                                </div>
                                <p className="text-xs text-gray-500">
                                    All organizations this user belongs to
                                </p>
                            </div>
                            {user?.tenants && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                    {user.tenants.length} tenant
                                    {user.tenants.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {user?.tenants && user.tenants.length > 0 ? (
                            <div className="space-y-2">
                                {user.tenants.map((tenant) => {
                                    const isPrimary = tenant.isPrimary;
                                    const isSelected =
                                        user.selectedTenantId === tenant.id;
                                    return (
                                        <div
                                            key={tenant.id}
                                            className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                                        >
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {tenant.name}
                                                </div>
                                                <div className="text-xs text-gray-500 break-all">
                                                    {tenant.id}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {isPrimary && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                                                        Primary
                                                    </span>
                                                )}
                                                {isSelected && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                                                        Selected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">
                                No tenant information available
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileTab;
