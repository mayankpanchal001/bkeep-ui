import { FaLaptopCode, FaShieldAlt } from 'react-icons/fa';
import {
    FaChartLine,
    FaCircleNodes,
    FaCreditCard,
    FaGlobe,
    FaMoneyBillTrendUp,
    FaUsers,
} from 'react-icons/fa6';
import { APP_TITLE } from '../../constants';

export const SOLUTION_FEATURES = [
    {
        title: 'AI-Automated Accounting',
        description:
            'Automate bank reconciliation, categorisation and reporting so your team stays focused on clients and growth.',
        icon: <FaCircleNodes className="text-primary" />,
        gradient: 'from-blue-500/10 to-primary-10',
    },
    {
        title: 'Global Invoicing & Payments',
        description:
            'Bill, collect, and reconcile in 150+ currencies with beautiful invoices and consolidated cash-flow visibility.',
        icon: <FaCreditCard className="text-primary" />,
        gradient: 'from-green-500/10 to-primary-10',
    },
    {
        title: 'Real-time Spend Control',
        description:
            'Sync every card swipe and vendor bill automatically, approve expenses on the go, and keep budgets on track.',
        icon: <FaMoneyBillTrendUp className="text-primary" />,
        gradient: 'from-purple-500/10 to-primary-10',
    },
];

export const STATS = [
    { label: 'Currencies Supported', value: '150+', icon: <FaGlobe /> },
    { label: 'Countries Using BKeep', value: '200+', icon: <FaUsers /> },
    { label: 'Languages for Invoicing', value: '60+', icon: <FaChartLine /> },
    { label: 'Bank Connections', value: '25k+', icon: <FaShieldAlt /> },
];

export const INDUSTRIES = [
    { name: 'Consulting', icon: <FaLaptopCode /> },
    { name: 'Startups', icon: <FaChartLine /> },
    { name: 'Creators & Freelancers', icon: <FaUsers /> },
    { name: 'Real Estate', icon: <FaCircleNodes /> },
    { name: 'Construction', icon: <FaShieldAlt /> },
    { name: 'Professional Services', icon: <FaCreditCard /> },
];

export const VALUE_LIST = [
    'Native multi-currency ledger & FX translation',
    'AI-assisted cash flow forecasting & alerts',
    'Instant bank feed reconciliation with 90% accuracy',
    'Client billing, quotes, and recurring invoices in one workspace',
];

export const TESTIMONIAL = {
    quote: `${APP_TITLE} takes the headache out of multi-entity accounting. We closed the month 3× faster once we automated reconciliation and billing in one place.`,
    author: 'Jan Kutscher',
    role: 'CEO at True Brew Birdie Ltd.',
    avatar: '👤',
};
