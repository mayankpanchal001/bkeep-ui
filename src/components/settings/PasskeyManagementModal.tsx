import { startRegistration } from '@simplewebauthn/browser';
import { SaveIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    FaCheck,
    FaEdit,
    FaFingerprint,
    FaPlus,
    FaSave,
    FaTimes,
    FaTrash,
} from 'react-icons/fa';
import {
    Passkey,
    useDeletePasskey,
    useDisablePasskey,
    useEnablePasskey,
    usePasskeyRegistrationOptions,
    usePasskeyRegistrationVerify,
    usePasskeysList,
    useRenamePasskey,
} from '../../services/apis/passkeyApi';
import {
    getInsecureContextMessage,
    getPasskeyUnavailableReason,
    isSecureContext,
    isWebAuthnSupported,
} from '../../utills/passkey';
import { showErrorToast } from '../../utills/toast';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { Button } from '../ui/button';
import Input from '../ui/input';

type PasskeyManagementModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type ModalStep =
    | 'list'
    | 'register'
    | 'rename'
    | 'confirm-delete'
    | 'confirm-disable';

const PasskeyManagementModal = ({
    isOpen,
    onClose,
}: PasskeyManagementModalProps) => {
    const [currentStep, setCurrentStep] = useState<ModalStep>('list');
    const [friendlyName, setFriendlyName] = useState('');
    const [selectedPasskey, setSelectedPasskey] = useState<Passkey | null>(
        null
    );
    const [isRegistering, setIsRegistering] = useState(false);
    const [webAuthnSupported, setWebAuthnSupported] = useState(true);

    // API hooks
    const { data: passkeysData, isLoading: isLoadingPasskeys } =
        usePasskeysList();
    const { mutateAsync: getRegistrationOptions } =
        usePasskeyRegistrationOptions();
    const { mutateAsync: verifyRegistration } = usePasskeyRegistrationVerify();
    const { mutate: deletePasskey, isPending: isDeleting } = useDeletePasskey();
    const { mutate: renamePasskey, isPending: isRenaming } = useRenamePasskey();
    const { mutate: enablePasskey, isPending: isEnabling } = useEnablePasskey();
    const { mutate: disablePasskey, isPending: isDisabling } =
        useDisablePasskey();

    const passkeys = passkeysData?.data?.passkeys || [];

    useEffect(() => {
        setWebAuthnSupported(isWebAuthnSupported());
    }, []);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setCurrentStep('list');
            setFriendlyName('');
            setSelectedPasskey(null);
        }
    }, [isOpen]);

    const handleClose = () => {
        if (isRegistering || isDeleting || isRenaming) {
            return; // Don't close while operations are in progress
        }
        onClose();
    };

    const handleStartRegistration = () => {
        setCurrentStep('register');
        setFriendlyName('');
    };

    const handleRegisterPasskey = async () => {
        if (!webAuthnSupported) {
            showErrorToast(
                'WebAuthn is not supported in this browser. Please use a modern browser.'
            );
            return;
        }

        if (!friendlyName.trim()) {
            showErrorToast('Please enter a friendly name for your passkey');
            return;
        }

        if (!isSecureContext()) {
            showErrorToast(getInsecureContextMessage());
            return;
        }

        setIsRegistering(true);

        try {
            // Step 1: Get registration options from server
            const optionsResponse = await getRegistrationOptions();
            const options = optionsResponse.data.options;

            // Step 2: Use SimpleWebAuthn to handle the registration ceremony
            // This handles all base64url <-> ArrayBuffer conversions, RP ID
            // validation, and browser compatibility automatically.
            const credential = await startRegistration({
                optionsJSON: options,
            });

            // Step 3: Send credential to server for verification
            // startRegistration returns a RegistrationResponseJSON with all
            // fields already base64url-encoded, ready for the backend.
            await verifyRegistration({
                name: friendlyName.trim(),
                credential: {
                    id: credential.id,
                    rawId: credential.rawId,
                    response: {
                        attestationObject:
                            credential.response.attestationObject,
                        clientDataJSON: credential.response.clientDataJSON,
                        transports: credential.response
                            .transports as AuthenticatorTransport[],
                    },
                    type: credential.type,
                    clientExtensionResults:
                        credential.clientExtensionResults as Record<
                            string,
                            unknown
                        >,
                    authenticatorAttachment:
                        credential.authenticatorAttachment || undefined,
                },
            });

            // Success - go back to list
            setCurrentStep('list');
            setFriendlyName('');
        } catch (error) {
            console.error('Passkey registration failed:', error);

            if (error instanceof Error) {
                // SimpleWebAuthn wraps WebAuthn errors with descriptive messages
                if (error.name === 'NotAllowedError') {
                    showErrorToast(
                        'Registration was cancelled or not allowed. Please try again.'
                    );
                } else if (error.name === 'SecurityError') {
                    showErrorToast(getInsecureContextMessage());
                } else if (error.name === 'AbortError') {
                    showErrorToast('Registration was aborted.');
                } else if (error.name === 'InvalidStateError') {
                    showErrorToast(
                        'This authenticator is already registered. Please use a different one.'
                    );
                } else if (
                    error.message?.includes('ceremony') ||
                    error.message?.includes('cancelled')
                ) {
                    // User cancelled the registration prompt
                    showErrorToast('Registration was cancelled.');
                } else {
                    showErrorToast(
                        error.message ||
                        'Passkey registration failed. Please try again.'
                    );
                }
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const handleStartRename = (passkey: Passkey) => {
        setSelectedPasskey(passkey);
        setFriendlyName(passkey.name);
        setCurrentStep('rename');
    };

    const handleRenamePasskey = () => {
        if (!selectedPasskey) return;
        if (!friendlyName.trim()) {
            showErrorToast('Please enter a friendly name');
            return;
        }

        renamePasskey(
            {
                passkeyId: selectedPasskey.id,
                name: friendlyName.trim(),
            },
            {
                onSuccess: () => {
                    setCurrentStep('list');
                    setFriendlyName('');
                    setSelectedPasskey(null);
                },
            }
        );
    };

    const handleStartDelete = (passkey: Passkey) => {
        setSelectedPasskey(passkey);
        setCurrentStep('confirm-delete');
    };

    const handleConfirmDelete = () => {
        if (!selectedPasskey) return;

        deletePasskey(selectedPasskey.id, {
            onSuccess: () => {
                setCurrentStep('list');
                setSelectedPasskey(null);
            },
        });
    };

    const handleToggleEnabled = (passkey: Passkey) => {
        if (passkey.isActive) {
            setSelectedPasskey(passkey);
            setCurrentStep('confirm-disable');
        } else {
            enablePasskey(passkey.id);
        }
    };

    const handleConfirmDisable = () => {
        if (!selectedPasskey) return;

        disablePasskey(selectedPasskey.id, {
            onSuccess: () => {
                setCurrentStep('list');
                setSelectedPasskey(null);
            },
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Modal Overlay */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 bg-opacity-50 p-4"
                onClick={(e) =>
                    e.target === e.currentTarget &&
                    !isRegistering &&
                    !isDeleting &&
                    !isRenaming &&
                    handleClose()
                }
            >
                <div className="w-full max-w-2xl rounded bg-card p-4  max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-medium text-primary">
                            {currentStep === 'list' && 'Passkey Management'}
                            {currentStep === 'register' &&
                                'Register New Passkey'}
                            {currentStep === 'rename' && 'Rename Passkey'}
                        </h3>
                        <button
                            onClick={handleClose}
                            disabled={isRegistering || isDeleting || isRenaming}
                            className="text-primary/50 hover:text-primary transition-colors disabled:opacity-50"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Passkeys unavailable: insecure context or unsupported browser */}
                        {(() => {
                            const reason = getPasskeyUnavailableReason();
                            if (reason === null) return null;
                            return (
                                <div className="bg-destructive/10 border border-destructive/20 rounded p-4">
                                    <p className="text-sm text-destructive">
                                        {reason === 'insecure-context'
                                            ? getInsecureContextMessage()
                                            : "Your browser doesn't support passkeys. Please use a modern browser like Chrome, Edge, Safari, or Firefox."}
                                    </p>
                                </div>
                            );
                        })()}

                        {/* List View */}
                        {currentStep === 'list' && (
                            <div className="space-y-6">
                                {/* Info Banner */}
                                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                    <p className="text-sm text-blue-800">
                                        Passkeys are a more secure and
                                        convenient way to sign in. Use your
                                        fingerprint, face, or device PIN instead
                                        of a password.
                                    </p>
                                </div>

                                {/* Add New Passkey Button */}
                                <Button
                                    variant="default"
                                    size="default"
                                    onClick={handleStartRegistration}
                                    disabled={!webAuthnSupported}
                                    startIcon={<FaPlus className="w-4 h-4" />}
                                >
                                    Add New Passkey
                                </Button>

                                {/* Passkeys List */}
                                {isLoadingPasskeys ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                        <p className="text-sm text-primary/50 mt-3">
                                            Loading passkeys...
                                        </p>
                                    </div>
                                ) : passkeys.length === 0 ? (
                                    <div className="bg-card border border-primary/10 rounded p-8 text-center">
                                        <FaFingerprint className="w-12 h-12 text-primary/20 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-primary mb-1">
                                            No passkeys registered yet
                                        </p>
                                        <p className="text-xs text-primary/50">
                                            Add a passkey to enable passwordless
                                            authentication
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {passkeys.map((passkey) => (
                                            <div
                                                key={passkey.id}
                                                className={`border rounded p-4 transition-colors ${passkey.isActive
                                                        ? 'border-primary/10 bg-card'
                                                        : 'border-primary/10 bg-card'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${passkey.isActive
                                                                    ? 'bg-primary/10'
                                                                    : 'bg-gray-200'
                                                                }`}
                                                        >
                                                            <FaFingerprint
                                                                className={`w-5 h-5 ${passkey.isActive
                                                                        ? 'text-primary'
                                                                        : 'text-primary/40'
                                                                    }`}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium text-primary truncate">
                                                                    {
                                                                        passkey.name
                                                                    }
                                                                </h4>
                                                                {passkey.isActive && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                                        <FaCheck className="w-3 h-3" />
                                                                        Active
                                                                    </span>
                                                                )}
                                                                {!passkey.isActive && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-200 text-primary/60 text-xs font-medium">
                                                                        Disabled
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-primary/50 mt-1">
                                                                Created:{' '}
                                                                {formatDate(
                                                                    passkey.createdAt
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-primary/50">
                                                                Last used:{' '}
                                                                {formatDate(
                                                                    passkey.lastUsedAt
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-primary/40">
                                                                Type:{' '}
                                                                {passkey.credentialType ===
                                                                    'platform'
                                                                    ? 'Device'
                                                                    : 'Security Key'}
                                                                {passkey.backupEligible &&
                                                                    ' • Backup enabled'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <button
                                                            onClick={() =>
                                                                handleStartRename(
                                                                    passkey
                                                                )
                                                            }
                                                            className="p-2 text-primary/50 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                            title="Rename"
                                                        >
                                                            <FaEdit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleToggleEnabled(
                                                                    passkey
                                                                )
                                                            }
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${passkey.isActive
                                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                }`}
                                                            disabled={
                                                                isEnabling ||
                                                                isDisabling
                                                            }
                                                        >
                                                            {passkey.isActive
                                                                ? 'Disable'
                                                                : 'Enable'}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleStartDelete(
                                                                    passkey
                                                                )
                                                            }
                                                            className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FaTrash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Register View */}
                        {currentStep === 'register' && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                        <FaFingerprint className="w-4 h-4" />
                                        Biometric Authentication
                                    </h4>
                                    <p className="text-sm text-blue-800">
                                        You'll be prompted to use your device's
                                        biometric authentication (fingerprint,
                                        face recognition) or security key.
                                    </p>
                                </div>

                                <div>
                                    <Input
                                        placeholder="e.g., My iPhone, Touch ID, Work Laptop"
                                        value={friendlyName}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                        ) => setFriendlyName(e.target.value)}
                                        disabled={isRegistering}
                                        required
                                    />
                                    <p className="text-xs text-primary/50 mt-2">
                                        Give this passkey a name to help you
                                        identify it later
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCurrentStep('list')}
                                        disabled={isRegistering}
                                        startIcon={
                                            <FaTimes className="w-4 h-4" />
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="default"
                                        size="default"
                                        onClick={handleRegisterPasskey}
                                        loading={isRegistering}
                                        disabled={isRegistering}
                                        startIcon={
                                            <FaPlus className="w-4 h-4" />
                                        }
                                    >
                                        Register Passkey
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Rename View */}
                        {currentStep === 'rename' && selectedPasskey && (
                            <div className="space-y-6">
                                <div className="bg-card border border-primary/10 rounded p-4">
                                    <p className="text-sm text-primary/75">
                                        Update the name of this passkey to help
                                        you identify it more easily.
                                    </p>
                                </div>

                                <Input
                                    placeholder="e.g., My iPhone, Touch ID, Work Laptop"
                                    value={friendlyName}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => setFriendlyName(e.target.value)}
                                    disabled={isRenaming}
                                    required
                                />

                                <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCurrentStep('list')}
                                        disabled={isRenaming}
                                        startIcon={
                                            <SaveIcon className="w-4 h-4" />
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="default"
                                        size="default"
                                        onClick={handleRenamePasskey}
                                        loading={isRenaming}
                                        disabled={isRenaming}
                                        startIcon={
                                            <FaSave className="w-4 h-4" />
                                        }
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={currentStep === 'confirm-delete' && !!selectedPasskey}
                onClose={() => {
                    setCurrentStep('list');
                    setSelectedPasskey(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Passkey"
                message={`Are you sure you want to delete "${selectedPasskey?.name}"? This action cannot be undone.`}
                confirmText="Delete Passkey"
                cancelText="Cancel"
                confirmVariant="danger"
                loading={isDeleting}
            />

            {/* Disable Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={currentStep === 'confirm-disable' && !!selectedPasskey}
                onClose={() => {
                    setCurrentStep('list');
                    setSelectedPasskey(null);
                }}
                onConfirm={handleConfirmDisable}
                title="Disable Passkey"
                message={`Are you sure you want to disable "${selectedPasskey?.name}"? You can re-enable it later.`}
                confirmText="Disable Passkey"
                cancelText="Cancel"
                confirmVariant="danger"
                loading={isDisabling}
            />
        </>
    );
};

export default PasskeyManagementModal;
