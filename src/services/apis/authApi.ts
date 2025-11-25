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

    return useMutation({
        mutationFn: (payload: LoginPayload) => loginRequest(payload),

        onSuccess: (data) => {
            const authData = data?.data;
            if (
                authData?.user &&
                authData?.accessToken &&
                authData?.refreshToken
            ) {
                setAuth(
                    authData.user,
                    authData.accessToken,
                    authData.refreshToken
                );

                const tenants = buildTenantsFromLogin(authData.user.tenant);
                setTenants(tenants, {
                    selectTenantId: authData.user.tenant.id,
                });
            }
            console.log('Login Successful: Store Updated');
        },
        onError: (error) => {
            console.error('Login Failed:', error);
        },
    });
};

const buildTenantsFromLogin = (primaryTenant?: Tenant): Tenant[] => {
    const mockTenants: Tenant[] = [
        primaryTenant,
        {
            id: 'demo-ops',
            name: 'Demo Operations 1',
            schemaName: 'ops1',
        },
        {
            id: 'demo-research',
            name: 'Demo Operations 2',
            schemaName: 'ops',
        },
        {
            id: 'demo-research',
            name: 'Demo Operations 3',
            schemaName: 'ops3',
        },
    ].filter(Boolean) as Tenant[];

    const uniqueTenants = new Map<string, Tenant>();
    mockTenants.forEach((tenant) => {
        uniqueTenants.set(tenant.id, tenant);
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
