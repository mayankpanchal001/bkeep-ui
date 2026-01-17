import { useState } from 'react';
import {
    FaBell,
    FaChartLine,
    FaFileAlt,
    FaFileInvoiceDollar,
    FaMoneyBillWave,
    FaPiggyBank,
    FaRegEye
} from 'react-icons/fa';
import { Icons } from '../shared/Icons';
import TabNav from '../shared/TabNav';
import { Button } from '../ui/button';
import SummaryCard from './SummaryCard';
import SalesActivityAreaChart from './charts/SalesActivityAreaChart';
import SubscriptionsBarMini from './charts/SubscriptionsBarMini';

export default function AdminDashboardKit() {
    const [tab, setTab] = useState('overview');
    const totals = {
        totalCollections: {
            value: '$124,580',
            trend: { value: 8, direction: 'up' as const, period: 'last month' },
            breakdown: [
                { label: 'Insurance payments', value: '$89,200' },
                { label: 'Patient payments', value: '$35,380' },
            ],
            aiNotes: [
                'Collections are tracking 8% above average this month',
                'Insurance payments increased by 12% from last month',
            ],
        },
        outstandingReceivables: {
            value: '$45,230',
            breakdown: [
                { label: '0-30 days', value: '$18,500' },
                { label: '31-60 days', value: '$15,200' },
                { label: '61-90 days', value: '$8,400' },
                { label: '90+ days', value: '$3,130' },
            ],
            aiNotes: ['$12,400 in claims are 60+ days overdue'],
        },
        cashOnHand: {
            value: '$89,450',
            indicator: 'green' as const,
            aiNotes: [
                'Forecast shows a cash dip in 2 weeks due to pending lab bills',
            ],
        },
        expenseSummary: {
            value: '$62,300',
            trend: { value: 5, direction: 'up' as const, period: 'last month' },
            breakdown: [
                { label: 'Supplies', value: '$22,100' },
                { label: 'Lab Fees', value: '$18,500' },
                { label: 'Rent', value: '$12,700' },
            ],
            aiNotes: [
                'Lab costs are 18% above average — check vendor invoices',
            ],
        },
        profitability: {
            value: '42%',
            trend: {
                value: 3,
                direction: 'up' as const,
                period: '3 months avg',
            },
        },
    };

    const salesActivity = [
        { month: 'Jan', sales: 1200, subscriptions: 800 },
        { month: 'Feb', sales: 2100, subscriptions: 1200 },
        { month: 'Mar', sales: 1800, subscriptions: 1000 },
        { month: 'Apr', sales: 1600, subscriptions: 900 },
        { month: 'May', sales: 2200, subscriptions: 1300 },
        { month: 'Jun', sales: 2400, subscriptions: 1400 },
    ];

    const subscriptionsMini = [
        { label: 'Jan', previous: 600, current: 900 },
        { label: 'Feb', previous: 1100, current: 700 },
        { label: 'Mar', previous: 800, current: 1500 },
        { label: 'Apr', previous: 1200, current: 1300 },
        { label: 'May', previous: 700, current: 900 },
        { label: 'Jun', previous: 1000, current: 1800 },
        { label: 'Jul', previous: 1200, current: 900 },
        { label: 'Aug', previous: 600, current: 700 },
        { label: 'Sep', previous: 800, current: 1200 },
        { label: 'Oct', previous: 1100, current: 1600 },
        { label: 'Nov', previous: 700, current: 900 },
        { label: 'Dec', previous: 900, current: 1200 },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <TabNav
                    items={[
                        {
                            id: 'overview',
                            label: 'Overview',
                            icon: <FaRegEye />,
                        },
                        {
                            id: 'analytics',
                            label: 'Analytics',
                            icon: <FaChartLine />,
                        },
                        {
                            id: 'reports',
                            label: 'Reports',
                            icon: <FaFileAlt />,
                        },
                        {
                            id: 'notifications',
                            label: 'Notifications',
                            icon: <FaBell />,
                        },
                    ]}
                    value={tab}
                    onChange={setTab}
                />
                <div className="flex items-center gap-2">
                    <Button variant="default" >
                        <Icons.Download />
                        Download
                    </Button>
                    <Button variant="outline">Pick a date</Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="flex flex-col gap-4">
                        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <SummaryCard
                                title="TOTAL COLLECTIONS"
                                value={totals.totalCollections.value}
                                trend={totals.totalCollections.trend}
                                breakdown={totals.totalCollections.breakdown}
                                aiNotes={totals.totalCollections.aiNotes}
                                icon={<FaMoneyBillWave />}
                            />
                            <SummaryCard
                                title="OUTSTANDING RECEIVABLES"
                                value={totals.outstandingReceivables.value}
                                breakdown={
                                    totals.outstandingReceivables.breakdown
                                }
                                aiNotes={totals.outstandingReceivables.aiNotes}
                                icon={<FaFileInvoiceDollar />}
                            />
                            <SummaryCard
                                title="CASH ON HAND"
                                value={totals.cashOnHand.value}
                                indicator={totals.cashOnHand.indicator}
                                aiNotes={totals.cashOnHand.aiNotes}
                                icon={<FaPiggyBank />}
                            />
                            <SummaryCard
                                title="PROFITABILITY"
                                value={totals.profitability.value}
                                trend={totals.profitability.trend}
                                icon={<FaChartLine />}
                            />
                        </div>
                        <div className="card">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="text-sm font-semibold text-primary">
                                        Sale Activity - Monthly
                                    </div>
                                    <div className="text-xs text-primary/50">
                                        Showing total sales for the last 6
                                        months
                                    </div>
                                </div>
                            </div>
                            <SalesActivityAreaChart data={salesActivity} />
                        </div>
                    </div>
                </div>
                <div className="sm:max-w-[350px]">
                    <div className="flex flex-col gap-4 sticky top-0">
                        <SummaryCard
                            title="EXPENSE SUMMARY"
                            value={totals.expenseSummary.value}
                            trend={totals.expenseSummary.trend}
                            breakdown={totals.expenseSummary.breakdown}
                            aiNotes={totals.expenseSummary.aiNotes}
                            icon={<FaChartLine />}
                        />
                        <div className="card">
                            <div className="text-sm font-semibold text-primary mb-2">
                                Subscriptions
                            </div>
                            <div className="text-2xl font-bold text-primary">
                                +2350
                            </div>
                            <div className="text-xs text-secondary">
                                +180.1% from last month
                            </div>
                            <div className="mt-3">
                                <SubscriptionsBarMini
                                    data={subscriptionsMini}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card">
                    <div className="text-sm font-semibold text-primary mb-2">
                        Payments
                    </div>
                    <div className="text-xs text-primary/50 mb-4">
                        Manage your payments.
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded border border-primary/10">
                            <div>
                                <div className="text-sm font-medium text-primary">
                                    Stripe
                                </div>
                                <div className="text-xs text-primary/50">
                                    Connected
                                </div>
                            </div>
                            <button className="text-xs text-primary/50 hover:text-primary">
                                Manage
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded border border-primary/10">
                            <div>
                                <div className="text-sm font-medium text-primary">
                                    PayPal
                                </div>
                                <div className="text-xs text-primary/50">
                                    Not connected
                                </div>
                            </div>
                            <button className="text-xs text-primary/50 hover:text-primary">
                                Connect
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="text-sm font-semibold text-primary mb-2">
                        Team Members
                    </div>
                    <div className="text-xs text-primary/50 mb-4">
                        Invite your team members to collaborate.
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded border border-primary/10">
                            <div>
                                <div className="text-sm font-medium text-primary">
                                    Alex Johnson
                                </div>
                                <div className="text-xs text-primary/50">
                                    Admin
                                </div>
                            </div>
                            <button className="text-xs text-primary/50 hover:text-primary">
                                Invite
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded border border-primary/10">
                            <div>
                                <div className="text-sm font-medium text-primary">
                                    Maria Lopez
                                </div>
                                <div className="text-xs text-primary/50">
                                    Editor
                                </div>
                            </div>
                            <button className="text-xs text-primary/50 hover:text-primary">
                                Invite
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
