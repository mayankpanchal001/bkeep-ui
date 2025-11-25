import { useDisableMFA, useEnableMFA } from '../../services/apis/authApi';
import { useAuth } from '../../stores/auth/authSelectore';
import Button from '../typography/Button';

const SecurityTab = () => {
    const { mfaEnabled } = useAuth();
    const { mutate: enableMFA, isPending: isEnabling } = useEnableMFA();
    const { mutate: disableMFA, isPending: isDisabling } = useDisableMFA();

    const handleMfaToggle = () => {
        if (mfaEnabled) {
            disableMFA();
            return;
        }
        enableMFA();
    };

    const mfaButtonLabel = mfaEnabled
        ? isDisabling
            ? 'Disabling...'
            : 'Disable 2FA'
        : isEnabling
          ? 'Enabling...'
          : 'Enable 2FA';

    return (
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
                                Update your password to keep your account secure
                            </div>
                        </div>
                        <Button variant="outline" size="sm">
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
                                Add an extra layer of security to your account
                            </div>
                            <div className="text-xs text-primary-40 mt-2">
                                Status:{' '}
                                <span
                                    className={
                                        mfaEnabled
                                            ? 'text-green-600'
                                            : 'text-red-500'
                                    }
                                >
                                    {mfaEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMfaToggle}
                            loading={isEnabling || isDisabling}
                            disabled={isEnabling || isDisabling}
                        >
                            {mfaButtonLabel}
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
                                Manage your active login sessions
                            </div>
                        </div>
                        <Button variant="outline" size="sm">
                            View Sessions
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityTab;
