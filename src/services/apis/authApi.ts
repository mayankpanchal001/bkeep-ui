import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useAuth } from '../../stores/auth/authSelectore';
import { LoginResponse } from '../../types';
import { showErrorToast } from '../../utills/toast';
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
            }
            console.log('Login Successful: Store Updated');
        },
        onError: (error) => {
            console.error('Login Failed:', error);
        },
    });
};
