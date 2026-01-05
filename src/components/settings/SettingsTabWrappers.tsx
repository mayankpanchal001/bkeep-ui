import { useState } from 'react';
import { useAuth } from '../../stores/auth/authSelectore';
import { NotificationsTab, ProfileTab, type SettingsFormData } from './index';

export const ProfileTabWrapper = () => {
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
        <ProfileTab
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
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
