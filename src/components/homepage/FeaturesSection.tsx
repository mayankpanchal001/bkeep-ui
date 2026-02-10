import {
    Activity,
    BarChart3,
    BookOpen,
    Building2,
    CheckCircle2,
    FileText,
    Zap,
} from 'lucide-react';
import { Button } from '../ui/button';

const FEATURES = [
    {
        tag: 'Automated Categorization',
        title: 'AI-powered transaction matching',
        description:
            'Automatically categorize thousands of transactions with industry-leading accuracy. Our AI learns from your chart of accounts and improves over time, reducing manual work by 90%.',
        icon: Zap,
        benefits: [
            'Smart pattern recognition',
            'Custom rule engine',
            'Vendor name matching',
            'Multi-company support',
        ],
        imagePosition: 'right' as const,
    },
    {
        tag: 'Journal Entries',
        title: 'Smart journal entries with validation',
        description:
            'Create multi-line journal entries with built-in validations, attachments, and approval workflows. Track every change with immutable audit trails.',
        icon: BookOpen,
        benefits: [
            'Automatic balance checking',
            'Approval workflows',
            'Attachment support',
            'Template library',
        ],
        imagePosition: 'left' as const,
    },
    {
        tag: 'Real-time Reporting',
        title: 'Financial statements that update live',
        description:
            'Generate income statements, balance sheets, and custom reports in real-time. No more waiting for month-end close to see your financial position.',
        icon: BarChart3,
        benefits: [
            'P&L and Balance Sheet',
            'Custom KPI dashboards',
            'Export to Excel/PDF',
            'Comparative analysis',
        ],
        imagePosition: 'right' as const,
    },
    {
        tag: 'Multi-Company',
        title: 'Manage multiple companies effortlessly',
        description:
            'Handle multiple entities with strict data isolation, consolidated reporting, and role-based access. Perfect for firms managing multiple clients.',
        icon: Building2,
        benefits: [
            'Data isolation',
            'Consolidated views',
            'Role-based permissions',
            'Cross-company reporting',
        ],
        imagePosition: 'left' as const,
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section header */}
                <div className="mx-auto max-w-2xl text-center">
                    <p className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
                        Features
                    </p>
                    <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                        Everything you need to automate your accounting
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        From bank feeds to financial statements, BKeep
                        streamlines every step of your accounting workflow.
                    </p>
                </div>

                {/* Feature sections - alternating layout like Double */}
                <div className="mt-20 space-y-32 md:mt-32">
                    {FEATURES.map((feature, index) => {
                        const Icon = feature.icon;
                        const isImageRight = feature.imagePosition === 'right';

                        return (
                            <div
                                key={feature.title}
                                className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
                            >
                                {/* Content */}
                                <div
                                    className={`space-y-6 ${isImageRight ? 'lg:order-1' : 'lg:order-2'}`}
                                >
                                    {/* Tag */}
                                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground">
                                        <Icon className="h-4 w-4 text-primary" />
                                        {feature.tag}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        {feature.description}
                                    </p>

                                    {/* Benefits list */}
                                    <ul className="space-y-3">
                                        {feature.benefits.map((benefit) => (
                                            <li
                                                key={benefit}
                                                className="flex items-start gap-3"
                                            >
                                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                                <span className="text-base text-foreground">
                                                    {benefit}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <div className="pt-2">
                                        <Button
                                            variant="outline"
                                            className="group gap-2"
                                        >
                                            Learn more
                                            <span className="transition-transform group-hover:translate-x-1">
                                                →
                                            </span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Visual/Mockup */}
                                <div
                                    className={`relative ${isImageRight ? 'lg:order-2' : 'lg:order-1'}`}
                                >
                                    <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-muted/50 to-muted/30 p-8 shadow-xl">
                                        {/* Decorative gradient */}
                                        <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 to-transparent" />

                                        {/* Mock interface based on feature type */}
                                        {index === 0 && <TransactionMockup />}
                                        {index === 1 && <JournalMockup />}
                                        {index === 2 && <ReportMockup />}
                                        {index === 3 && <MultiCompanyMockup />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Additional features grid */}
                <div className="mt-32">
                    <h3 className="mb-12 text-center text-2xl font-bold text-foreground">
                        And so much more
                    </h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: Activity,
                                title: 'Bank Reconciliation',
                                description: 'Match transactions automatically',
                            },
                            {
                                icon: FileText,
                                title: 'Document Management',
                                description: 'Attach files to any transaction',
                            },
                            {
                                icon: CheckCircle2,
                                title: 'Audit Trails',
                                description: 'Immutable change history',
                            },
                            {
                                icon: Building2,
                                title: 'Client Portal',
                                description: 'Secure client collaboration',
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="group rounded-xl border border-border bg-background p-6 transition-all hover:border-primary/50 hover:shadow-md"
                                >
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h4 className="mb-2 font-medium text-foreground">
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Mock UI components for visual demonstrations
function TransactionMockup() {
    return (
        <div className="space-y-3">
            {[
                {
                    name: 'Amazon Web Services',
                    amount: '-$247.50',
                    category: 'Cloud Services',
                    status: 'Auto-categorized',
                },
                {
                    name: 'Acme Corp',
                    amount: '+$5,240.00',
                    category: 'Revenue',
                    status: 'Auto-categorized',
                },
                {
                    name: 'Office Supplies Inc',
                    amount: '-$156.80',
                    category: 'Office Expenses',
                    status: 'Auto-categorized',
                },
            ].map((tx, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                >
                    <div className="flex-1">
                        <p className="font-medium text-foreground">{tx.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {tx.category}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-foreground">
                            {tx.amount}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            {tx.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function JournalMockup() {
    return (
        <div className="space-y-4 rounded-lg border border-border bg-background p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="font-medium text-foreground">
                    Journal Entry #1024
                </h4>
                <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                    Approved
                </span>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Debit:</span>
                    <span className="font-medium text-foreground">
                        Accounts Receivable
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit:</span>
                    <span className="font-medium text-foreground">Revenue</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-2">
                    <span className="font-medium text-foreground">Amount:</span>
                    <span className="font-bold text-foreground">$5,240.00</span>
                </div>
            </div>
        </div>
    );
}

function ReportMockup() {
    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-border bg-background p-6">
                <h4 className="mb-4 text-lg font-medium text-foreground">
                    Income Statement
                </h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium text-foreground">
                            $145,200
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Expenses</span>
                        <span className="font-medium text-foreground">
                            $92,450
                        </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3">
                        <span className="font-medium text-foreground">
                            Net Income
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                            $52,750
                        </span>
                    </div>
                </div>
            </div>
            <div className="h-24 overflow-hidden rounded-lg border border-border bg-background p-4">
                <svg viewBox="0 0 100 20" className="h-full w-full" fill="none">
                    <path
                        d="M0 15 L20 12 L40 14 L60 8 L80 10 L100 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-primary"
                    />
                </svg>
            </div>
        </div>
    );
}

function MultiCompanyMockup() {
    return (
        <div className="space-y-3">
            {[
                { name: 'Acme Corp', balance: '$245K', status: 'Active' },
                { name: 'Beta LLC', balance: '$156K', status: 'Active' },
                { name: 'Gamma Inc', balance: '$389K', status: 'Active' },
            ].map((company, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                            {company.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                {company.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {company.status}
                            </p>
                        </div>
                    </div>
                    <p className="font-medium text-foreground">
                        {company.balance}
                    </p>
                </div>
            ))}
        </div>
    );
}
