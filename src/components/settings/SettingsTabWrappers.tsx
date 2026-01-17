import { useState, useEffect } from 'react';
import { useAuth } from '../../stores/auth/authSelectore';
import { useUpdateProfile } from '../../services/apis/usersApi';
import {
    NotificationsTab,
    PreferencesTab,
    ProfileTab,
    type SettingsFormData,
} from './index';

export const ProfileTabWrapper = () => {
    const { user, setAuth, accessToken, refreshToken } = useAuth();
    const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
    const [formData, setFormData] = useState<SettingsFormData>({
        name: user?.name || '',
        email: user?.email || '',
        bio: '',
        urls: [],
        phone: '',
        company: '',
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        notifications: {
            email: true,
            push: false,
            sms: false,
        },
    });

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
            }));
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
        };

        const response = await updateProfile(payload);

        // Update auth store with new user data
        if (response.data && user && accessToken && refreshToken) {
            const updatedUser = {
                ...user,
                ...response.data,
            };
            setAuth(updatedUser, accessToken, refreshToken);
        }
    };

    return (
        <ProfileTab
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            isLoading={isPending}
        />
    );
};

export const NotificationsTabWrapper = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<SettingsFormData>({
        name: user?.name || '',
        email: user?.email || '',
        bio: '',
        urls: [],
        phone: '',
        company: '',
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        notifications: {
            email: true,
            push: false,
            sms: false,
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Settings saved:', formData);
    };

    return (
        <NotificationsTab
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
        />
    );
};

export const PreferencesTabWrapper = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<SettingsFormData>({
        name: user?.name || '',
        email: user?.email || '',
        bio: '',
        urls: [],
        phone: '',
        company: '',
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        notifications: {
            email: true,
            push: false,
            sms: false,
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Preferences saved:', formData);
    };

    return (
        <PreferencesTab
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
        />
    );
};
