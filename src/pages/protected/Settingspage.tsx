import { useState } from 'react';
import {
    FaBell,
    FaDatabase,
    FaLock,
    FaPalette,
    FaUser,
    FaUsers,
} from 'react-icons/fa';
import {
    DataPrivacyTab,
    NotificationsTab,
    PreferencesTab,
    ProfileTab,
    RolesTab,
    SecurityTab,
    SettingsTabs,
    UsersTab,
    type SettingsFormData,
    type SettingsTab,
} from '../../components/settings';
import { useAuth } from '../../stores/auth/authSelectore';

const Settingspage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<string>('profile');
    const [formData, setFormData] = useState<SettingsFormData>({
        name: user?.name || '',
        email: user?.email || '',
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

    const tabs: SettingsTab[] = [
        { id: 'profile', label: 'Profile', icon: <FaUser /> },
        { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
        { id: 'security', label: 'Security', icon: <FaLock /> },
        { id: 'preferences', label: 'Preferences', icon: <FaPalette /> },
        { id: 'users', label: 'Users', icon: <FaUsers /> },
        { id: 'roles', label: 'Roles', icon: <FaLock /> },
        { id: 'data', label: 'Data & Privacy', icon: <FaDatabase /> },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Settings saved:', formData);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <ProfileTab
                        formData={formData}
                        onFormDataChange={setFormData}
                        onSubmit={handleSubmit}
                        roleDisplayName={
                            user?.role?.displayName || user?.role?.name
                        }
                    />
                );
            case 'notifications':
                return (
                    <NotificationsTab
                        formData={formData}
                        onFormDataChange={setFormData}
                        onSubmit={handleSubmit}
                    />
                );
            case 'security':
                return <SecurityTab />;
            case 'preferences':
                return (
                    <PreferencesTab
                        formData={formData}
                        onFormDataChange={setFormData}
                        onSubmit={handleSubmit}
                    />
                );
            case 'users':
                return <UsersTab />;
            case 'roles':
                return <RolesTab />;
            case 'data':
                return <DataPrivacyTab />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <SettingsTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="bg-white rounded-xl shadow-sm border border-primary-10 p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Settingspage;
