import { useState } from 'react';
import {
    FaBell,
    FaDatabase,
    FaLock,
    FaPalette,
    FaSave,
    FaUser,
} from 'react-icons/fa';
import Button from '../../components/typography/Button';
import { InputField } from '../../components/typography/InputFields';
import { useAuth } from '../../stores/auth/authSelectore';

const Settingspage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
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

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <FaUser /> },
        { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
        { id: 'security', label: 'Security', icon: <FaLock /> },
        { id: 'preferences', label: 'Preferences', icon: <FaPalette /> },
        { id: 'data', label: 'Data & Privacy', icon: <FaDatabase /> },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Settings saved:', formData);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-primary">Settings</h2>
                <p className="text-sm text-primary-50 mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-primary-10 p-4">
                        <nav className="space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-primary text-white'
                                            : 'text-primary-75 hover:bg-primary-10 hover:text-primary'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-primary-10 p-6">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-primary mb-4">
                                        Profile Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField
                                            id="name"
                                            label="Name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        <InputField
                                            id="name"
                                            label="Name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        <InputField
                                            id="email"
                                            label="Email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        <InputField
                                            id="phone"
                                            label="Phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phone: e.target.value,
                                                })
                                            }
                                        />
                                        <InputField
                                            id="company"
                                            label="Company"
                                            value={formData.company}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    company: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-primary-10">
                                    <Button type="submit" variant="primary">
                                        <FaSave className="mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-primary mb-4">
                                    Notification Preferences
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(formData.notifications).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between p-4 border border-primary-10 rounded-xl"
                                            >
                                                <div>
                                                    <div className="font-medium text-primary capitalize">
                                                        {key} Notifications
                                                    </div>
                                                    <div className="text-sm text-primary-50">
                                                        Receive notifications
                                                        via {key}
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={value}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                notifications: {
                                                                    ...formData.notifications,
                                                                    [key]: e
                                                                        .target
                                                                        .checked,
                                                                },
                                                            })
                                                        }
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-primary-10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-primary after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="flex justify-end pt-4 border-t border-primary-10">
                                    <Button
                                        onClick={handleSubmit}
                                        variant="primary"
                                    >
                                        <FaSave className="mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-primary mb-4">
                                    Security Settings
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 border border-primary-10 rounded-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <div className="font-medium text-primary">
                                                    Change Password
                                                </div>
                                                <div className="text-sm text-primary-50">
                                                    Update your password to keep
                                                    your account secure
                                                </div>
                                            </div>
                                            <Button variant="outline">
                                                Change Password
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 border border-primary-10 rounded-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <div className="font-medium text-primary">
                                                    Two-Factor Authentication
                                                </div>
                                                <div className="text-sm text-primary-50">
                                                    Add an extra layer of
                                                    security to your account
                                                </div>
                                            </div>
                                            <Button variant="outline">
                                                Enable 2FA
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 border border-primary-10 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-primary">
                                                    Active Sessions
                                                </div>
                                                <div className="text-sm text-primary-50">
                                                    Manage your active login
                                                    sessions
                                                </div>
                                            </div>
                                            <Button variant="outline">
                                                View Sessions
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="text-lg font-semibold text-primary mb-4">
                                    Preferences
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">
                                            Timezone
                                        </label>
                                        <select
                                            value={formData.timezone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    timezone: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-primary-10 rounded-xl text-sm text-primary focus:outline-none focus:border-primary"
                                        >
                                            <option value="America/New_York">
                                                Eastern Time (ET)
                                            </option>
                                            <option value="America/Chicago">
                                                Central Time (CT)
                                            </option>
                                            <option value="America/Denver">
                                                Mountain Time (MT)
                                            </option>
                                            <option value="America/Los_Angeles">
                                                Pacific Time (PT)
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">
                                            Currency
                                        </label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    currency: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-primary-10 rounded-xl text-sm text-primary focus:outline-none focus:border-primary"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="CAD">
                                                CAD (C$)
                                            </option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">
                                            Date Format
                                        </label>
                                        <select
                                            value={formData.dateFormat}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    dateFormat: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-primary-10 rounded-xl text-sm text-primary focus:outline-none focus:border-primary"
                                        >
                                            <option value="MM/DD/YYYY">
                                                MM/DD/YYYY
                                            </option>
                                            <option value="DD/MM/YYYY">
                                                DD/MM/YYYY
                                            </option>
                                            <option value="YYYY-MM-DD">
                                                YYYY-MM-DD
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-primary-10">
                                    <Button type="submit" variant="primary">
                                        <FaSave className="mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'data' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-primary mb-4">
                                    Data & Privacy
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 border border-primary-10 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="font-medium text-primary">
                                                    Export Data
                                                </div>
                                                <div className="text-sm text-primary-50">
                                                    Download a copy of your data
                                                </div>
                                            </div>
                                            <Button variant="outline">
                                                Export
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-red-700">
                                                    Delete Account
                                                </div>
                                                <div className="text-sm text-red-600">
                                                    Permanently delete your
                                                    account and all data
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="border-red-300 text-red-700 hover:bg-red-100"
                                            >
                                                Delete Account
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settingspage;
