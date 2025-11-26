import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useAuth } from '../../stores/auth/authSelectore';
import { useTenant } from '../../stores/tenant/tenantSelectore';
import { LoginResponse, Tenant } from '../../types';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import axiosInstance from '../axiosClient';

type LoginPayload = {
    email: string;
    password: string;
};

export async function loginRequest({
    email,
    password,
}: LoginPayload): Promise<LoginResponse> {
    console.log({ email, password });
    const response = await axiosInstance.post('/auth/login', {
        email,
        password,
    });
    console.log(response);
    return response.data;
}

export async function logoutRequest(): Promise<void> {
    await axiosInstance.post('/auth/logout');
}

export async function forgotPasswordRequest(
    email: string
): Promise<{ message: string }> {
    const response = await axiosInstance.post('/auth/forgot-password', {
        email,
    });
    return response.data;
}

type ResetPasswordPayload = {
    token: string;
    email: string;
    password: string;
};

type VerifyMfaPayload = {
    email: string;
    code: string;
};

export async function resetPasswordRequest(
    payload: ResetPasswordPayload
): Promise<{ message: string }> {
    const response = await axiosInstance.post('/auth/reset-password', {
        email: payload.email,
        token: payload.token,
        password: payload.password,
    });
    return response.data;
}

export async function verifyMfaRequest(
    payload: VerifyMfaPayload
): Promise<LoginResponse> {
    const response = await axiosInstance.post('/auth/mfa/verify', payload);
    return response.data;
}

type MFASettingsResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        mfaEnabled: boolean;
    };
};

export async function enableMFA(): Promise<MFASettingsResponse> {
    const response = await axiosInstance.post('/auth/mfa/enable');
    return response.data;
}

export async function disableMFA(): Promise<MFASettingsResponse> {
    const response = await axiosInstance.post('/auth/mfa/disable');
    return response.data;
}

export const useEnableMFA = () => {
    const { setMfaEnabled } = useAuth();
    return useMutation({
        mutationFn: enableMFA,
        onSuccess: (data) => {
            setMfaEnabled(true);
            showSuccessToast(
                data?.message || 'Two-factor authentication enabled'
            );
        },
        onError: (error) => {
            console.error('Enable MFA Failed:', error);
            showErrorToast('Enable MFA Failed: ' + error.message);
        },
    });
};

export const useDisableMFA = () => {
    const { setMfaEnabled } = useAuth();
    return useMutation({
        mutationFn: disableMFA,
        onSuccess: (data) => {
            setMfaEnabled(false);
            showSuccessToast(
                data?.message || 'Two-factor authentication disabled'
            );
        },
        onError: (error) => {
            console.error('Disable MFA Failed:', error);
            showErrorToast('Disable MFA Failed: ' + error.message);
        },
    });
};

export const useLogout = () => {
    const { clearAuth } = useAuth();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: logoutRequest,
        onSuccess: () => {
            clearAuth();
            navigate('/login');
        },
        onError: (error) => {
            showErrorToast('Logout Failed: ' + error.message);
        },
    });
};

export const useLogin = () => {
    const { setAuth } = useAuth();
    const { setTenants } = useTenant();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (payload: LoginPayload) => loginRequest(payload),

        onSuccess: (data) => {
            const payload = data?.data;

            // If backend says MFA is required, route to OTP page
            if (payload?.requiresMfa) {
                showSuccessToast(
                    data?.message ||
                        'Verification code sent. Please enter the code to continue.'
                );
                navigate('/enter-otp', {
                    state: {
                        email: payload.email,
                        mfaType: payload.mfaType,
                    },
                });
                return;
            }

            // Normal login flow with tokens + user
            if (
                payload?.user &&
                payload?.accessToken &&
                payload?.refreshToken
            ) {
                setAuth(
                    payload.user,
                    payload.accessToken,
                    payload.refreshToken
                );

                const tenants = buildTenantsFromLogin(payload.user.tenants);
                setTenants(tenants, {
                    selectTenantId: payload.user.selectedTenantId,
                });

                navigate('/dashboard');
                console.log('Login Successful: Store Updated');
            }
        },
        onError: (error) => {
            console.error('Login Failed:', error);
        },
    });
};

const buildTenantsFromLogin = (tenantsFromApi?: Tenant[]): Tenant[] => {
    if (!tenantsFromApi) return [];

    const uniqueTenants = new Map<string, Tenant>();
    tenantsFromApi.forEach((tenant) => {
        if (tenant && tenant.id) {
            uniqueTenants.set(tenant.id, tenant);
        }
    });

    return Array.from(uniqueTenants.values());
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (email: string) => forgotPasswordRequest(email),
        onSuccess: () => {
            // Success is handled in the component
        },
        onError: (error) => {
            console.error('Forgot Password Failed:', error);
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: (payload: ResetPasswordPayload) =>
            resetPasswordRequest(payload),
        onSuccess: () => {
            // Success is handled in the component
        },
        onError: (error) => {
            console.error('Reset Password Failed:', error);
        },
    });
};

export const useVerifyMfa = () => {
    const { setAuth } = useAuth();
    const { setTenants } = useTenant();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (payload: VerifyMfaPayload) => verifyMfaRequest(payload),
        onSuccess: (data) => {
            const payload = data?.data;

            if (
                payload?.user &&
                payload?.accessToken &&
                payload?.refreshToken
            ) {
                setAuth(
                    payload.user,
                    payload.accessToken,
                    payload.refreshToken
                );

                const tenants = buildTenantsFromLogin(payload.user.tenants);
                setTenants(tenants, {
                    selectTenantId: payload.user.selectedTenantId,
                });

                showSuccessToast(
                    data?.message || 'Successfully verified. Welcome back!'
                );
                navigate('/dashboard');
            } else {
                showErrorToast('Verification failed. Please try again.');
            }
        },
        onError: (error) => {
            console.error('Verify MFA Failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Invalid or expired code. Please try again.';
            showErrorToast(message);
        },
    });
};
