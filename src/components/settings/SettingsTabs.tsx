import { SettingsTab } from './types';

interface SettingsTabsProps {
    tabs: SettingsTab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const SettingsTabs = ({ tabs, activeTab, onTabChange }: SettingsTabsProps) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-primary-10 p-2">
            <nav className="flex flex-wrap gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-primary-75 hover:bg-primary-10 hover:text-primary'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default SettingsTabs;

