import { useState } from 'react';
import {
    useDisableMFA,
    useEnableMFA,
    useMfaStatus,
} from '../../services/apis/authApi';
import { useAuth } from '../../stores/auth/authSelectore';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import Button from '../typography/Button';
import ChangePasswordModal from './ChangePasswordModal';
import { useState } from 'react';

const SecurityTab = () => {
    const { mfaEnabled, setMfaEnabled } = useAuth();
    const { mutate: enableMFA, isPending: isEnabling } = useEnableMFA();
    const { mutate: disableMFA, isPending: isDisabling } = useDisableMFA();
    const { data: mfaStatusData, isLoading: isStatusLoading } = useMfaStatus();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<
        'enable' | 'disable' | null
    >(null);

    if (!isStatusLoading && mfaStatusData?.data?.mfaEnabled !== undefined) {
        const enabled = !!mfaStatusData.data.mfaEnabled;
        if (enabled !== mfaEnabled) {
            setMfaEnabled(enabled);
        }
    }

    const statusLabel = isStatusLoading
        ? 'Checking...'
        : mfaEnabled
          ? 'Enabled'
          : 'Disabled';

    const statusClass = isStatusLoading
        ? 'text-primary-50'
        : mfaEnabled
          ? 'text-green-600'
          : 'text-red-500';

    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const handleMfaToggle = () => {
        if (mfaEnabled) {
            setPendingAction('disable');
            setShowConfirmDialog(true);
        } else {
            setPendingAction('enable');
            setShowConfirmDialog(true);
        }
    };

    const handleConfirmMfa = () => {
        if (pendingAction === 'enable') {
            enableMFA();
        } else if (pendingAction === 'disable') {
            disableMFA();
        }
        setShowConfirmDialog(false);
        setPendingAction(null);
    };

    const handleCancelMfa = () => {
        setShowConfirmDialog(false);
        setPendingAction(null);
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
                        <Button variant="outline" size="sm"
                        onClick={() => setIsChangePasswordModalOpen(true)}>
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
                                <span className={statusClass}>
                                    {statusLabel}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMfaToggle}
                            loading={isEnabling || isDisabling}
                            disabled={
                                isEnabling || isDisabling || isStatusLoading
                            }
                        >
                            {mfaButtonLabel}
                        </Button>
                    </div>
                </div>
            </div>




            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
            {/* MFA Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelMfa}
                onConfirm={handleConfirmMfa}
                title={
                    pendingAction === 'enable'
                        ? 'Enable Two-Factor Authentication'
                        : 'Disable Two-Factor Authentication'
                }
                message={
                    pendingAction === 'enable'
                        ? 'Are you sure you want to enable two-factor authentication? You will need to verify your identity with a code sent to your email when logging in.'
                        : 'Are you sure you want to disable two-factor authentication? This will reduce the security of your account.'
                }
                confirmText={
                    pendingAction === 'enable' ? 'Enable 2FA' : 'Disable 2FA'
                }
                cancelText="Cancel"
                confirmVariant={
                    pendingAction === 'disable' ? 'danger' : 'primary'
                }
                loading={isEnabling || isDisabling}
            />
        </div>
    );
};

export default SecurityTab;
