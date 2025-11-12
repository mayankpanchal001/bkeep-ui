import { FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import { FaHouse, FaMoneyBillTransfer } from 'react-icons/fa6';
import { SidebarItemProps } from '../types';

export const SIDEBAR_ITEMS: SidebarItemProps[] = [
    {
        label: 'Dashboard',
        icon: <FaHouse />,
        path: '/dashboard',
    },
    {
        label: 'Transactions',
        icon: <FaMoneyBillTransfer />,
        path: '/transactions',
    },
    {
        label: 'Reports',
        icon: <FaFileAlt />,
        path: '/reports',
    },

    // {
    //     label: 'Settings',
    //     icon: <FaCog />,
    //     path: '/settings',
    // },
];

export const LOGOUT_ITEM = {
    label: 'Logout',
    icon: <FaSignOutAlt />,
    path: '/logout',
};

export const APP_TITLE = 'BKeep Accounting';
export const USER_NAME = 'MAyank';
