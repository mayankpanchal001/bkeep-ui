import TabNav from '@/components/shared/TabNav';
import { cn } from '@/utils/cn';
import {
    ChevronRight,
    Files,
    FileText,
    LayoutDashboard,
    Search,
    Star,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

type ReportItem = {
    key: string;
    title: string;
    description?: string;
};

type ReportCategory = {
    key: string;
    title: string;
    icon?: React.ReactNode;
    reports: ReportItem[];
};

const REPORT_CATEGORIES: ReportCategory[] = [
    {
        key: 'business-overview',
        title: 'Business Overview',
        icon: <TrendingUp className="w-5 h-5" />,
        reports: [
            {
                key: 'balance-sheet',
                title: 'Balance Sheet',
                description: 'Assets, liabilities, and equity snapshot',
            },
            {
                key: 'balance-sheet-comparison',
                title: 'Balance Sheet Comparison',
                description: 'Compare across periods',
            },
            {
                key: 'balance-sheet-detail',
                title: 'Balance Sheet Detail',
                description: 'Line-by-line breakdown',
            },
            {
                key: 'balance-sheet-summary',
                title: 'Balance Sheet Summary',
                description: 'High-level overview',
            },
            {
                key: 'statement-of-cash-flows',
                title: 'Statement of Cash Flows',
                description: 'Cash inflows and outflows',
            },
            {
                key: 'profit-and-loss',
                title: 'Profit and Loss',
                description: 'Income and expenses',
            },
            {
                key: 'profit-and-loss-by-customer',
                title: 'Profit and Loss by Customer',
                description: 'Breakdown by customer',
            },
            {
                key: 'profit-and-loss-by-month',
                title: 'Profit and Loss by Month',
                description: 'Monthly trends',
            },
            {
                key: 'profit-and-loss-comparison',
                title: 'Profit and Loss Comparison',
                description: 'Period over period',
            },
            {
                key: 'profit-and-loss-detail',
                title: 'Profit and Loss Detail',
                description: 'Detailed transactions',
            },
        ],
    },
    {
        key: 'accounting',
        title: 'Accounting',
        icon: <Files className="w-5 h-5" />,
        reports: [
            {
                key: 'general-ledger',
                title: 'General Ledger',
                description: 'All account transactions',
            },
            {
                key: 'audit-log',
                title: 'Audit Log',
                description: 'System activity history',
            },
            {
                key: 'unpaid-bills',
                title: 'Unpaid Bills',
                description: 'Outstanding payables',
            },
            {
                key: 'accounts-payable-aging-summary',
                title: 'A/P Aging Summary',
                description: 'Payables by age',
            },
            {
                key: 'accounts-payable-aging-detail',
                title: 'A/P Aging Detail',
                description: 'Detailed payables aging',
            },
            {
                key: 'accounts-receivable-aging-summary',
                title: 'A/R Aging Summary',
                description: 'Receivables by age',
            },
            {
                key: 'accounts-receivable-aging-detail',
                title: 'A/R Aging Detail',
                description: 'Detailed receivables aging',
            },
        ],
    },
    {
        key: 'sales',
        title: 'Sales',
        icon: <LayoutDashboard className="w-5 h-5" />,
        reports: [
            {
                key: 'sales-summary',
                title: 'Sales Summary',
                description: 'Total sales overview',
            },
            {
                key: 'sales-by-tag',
                title: 'Sales by Tag Group',
                description: 'Categorized sales',
            },
            {
                key: 'sales-by-month',
                title: 'Sales by Month',
                description: 'Monthly sales trends',
            },
        ],
    },
];

const LS_FAV_KEY = 'bkeep-report-favourites';
const LS_FAV_LABEL_KEY = 'bkeep-report-favourites-labels';

const Reportpage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [favourites, setFavourites] = useState<string[]>([]);
    const [suggestOpen, setSuggestOpen] = useState(false);
    const [suggestIndex, setSuggestIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const tabItems = useMemo(
        () => [
            {
                id: 'all',
                label: 'All',
                icon: <LayoutDashboard className="w-5 h-5" />,
            },
            ...REPORT_CATEGORIES.map((cat) => ({
                id: cat.key,
                label: cat.title,
                icon: cat.icon,
            })),
        ],
        []
    );

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_FAV_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as string[];
                setFavourites(Array.isArray(parsed) ? parsed : []);
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LS_FAV_KEY, JSON.stringify(favourites));
        } catch {
            // ignore
        }
    }, [favourites]);

    const toggleFavourite = (categoryKey: string, reportKey: string) => {
        const id = `${categoryKey}:${reportKey}`;
        setFavourites((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
        try {
            const rawLabels = localStorage.getItem(LS_FAV_LABEL_KEY);
            const labels: Record<string, string> = rawLabels
                ? JSON.parse(rawLabels)
                : {};
            const cat = REPORT_CATEGORIES.find((c) => c.key === categoryKey);
            const rep = cat?.reports.find((r) => r.key === reportKey);
            if (rep) {
                if (labels[id]) {
                    delete labels[id];
                } else {
                    labels[id] = rep.title;
                }
                localStorage.setItem(LS_FAV_LABEL_KEY, JSON.stringify(labels));
            }
        } catch {
            // ignore
        }
    };

    const filteredCategories = useMemo(() => {
        let cats = REPORT_CATEGORIES;

        if (activeTab !== 'all') {
            cats = cats.filter((c) => c.key === activeTab);
        }

        if (!query.trim()) return cats;
        const q = query.toLowerCase();
        return cats
            .map((cat) => ({
                ...cat,
                reports: cat.reports.filter(
                    (r) =>
                        r.title.toLowerCase().includes(q) ||
                        r.description?.toLowerCase().includes(q) ||
                        cat.title.toLowerCase().includes(q)
                ),
            }))
            .filter((cat) => cat.reports.length > 0);
    }, [query, activeTab]);

    const suggestions = useMemo(() => {
        const favSet = new Set(favourites);
        const base = REPORT_CATEGORIES.flatMap((cat) =>
            cat.reports.map((r) => ({
                id: `${cat.key}:${r.key}`,
                title: r.title,
                description: r.description,
                categoryKey: cat.key,
                categoryTitle: cat.title,
                path: `/reports/${cat.key}/${r.key}`,
                isFav: favSet.has(`${cat.key}:${r.key}`),
            }))
        );
        const q = query.trim().toLowerCase();
        if (q.length > 0) {
            return base
                .filter(
                    (x) =>
                        x.title.toLowerCase().includes(q) ||
                        x.description?.toLowerCase().includes(q) ||
                        x.categoryTitle.toLowerCase().includes(q)
                )
                .slice(0, 8);
        }
        return [];
    }, [query, favourites]);

    useEffect(() => {
        setSuggestIndex(0);
    }, [query, favourites, suggestOpen]);

    const favouriteItems = useMemo(() => {
        const set = new Set(favourites);
        const items: Array<{ category: ReportCategory; report: ReportItem }> =
            [];
        REPORT_CATEGORIES.forEach((cat) =>
            cat.reports.forEach((r) => {
                const id = `${cat.key}:${r.key}`;
                if (set.has(id)) items.push({ category: cat, report: r });
            })
        );
        return items;
    }, [favourites]);

    const goToReport = (categoryKey: string, reportKey: string) => {
        navigate(`/reports/${categoryKey}/${reportKey}`);
    };

    const handleSelectSuggestion = (s: {
        categoryKey: string;
        id: string;
        path: string;
    }) => {
        setSuggestOpen(false);
        const [cat, rep] = s.id.split(':');
        if (cat && rep) {
            goToReport(cat, rep);
        } else {
            navigate(s.path);
        }
    };

    const ReportRow = ({
        categoryKey,
        report,
        isFav,
        onToggleFav,
    }: {
        categoryKey: string;
        report: ReportItem;
        isFav: boolean;
        onToggleFav: () => void;
    }) => {
        return (
            <div
                onClick={() => goToReport(categoryKey, report.key)}
                className="group flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors "
            >
                <div className="shrink-0 text-slate-400 group-hover:text-primary transition-colors">
                    <FileText className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {report.title}
                    </h3>
                    {report.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {report.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFav();
                        }}
                        className={cn(
                            'p-2 rounded-full transition-all',
                            isFav
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
                                : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                        title={
                            isFav
                                ? 'Remove from favourites'
                                : 'Add to favourites'
                        }
                    >
                        {isFav ? (
                            <Star className="w-4 h-4 fill-current" />
                        ) : (
                            <Star className="w-4 h-4" />
                        )}
                    </button>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
            </div>
        );
    };

    return (
        <div className="w-full mx-auto flex flex-col gap-8 pb-12">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold text-foreground">
                    Reports
                </h1>
                <p className="text-sm text-muted-foreground">
                    Access financial statements and business analytics
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSuggestOpen(true);
                        }}
                        onFocus={() => setSuggestOpen(true)}
                        onBlur={() =>
                            setTimeout(() => setSuggestOpen(false), 200)
                        }
                        placeholder="Search for reports..."
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>

                {suggestOpen && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 z-50 overflow-hidden">
                        {suggestions.map((s, idx) => (
                            <div
                                key={s.id}
                                onClick={() => handleSelectSuggestion(s)}
                                onMouseEnter={() => setSuggestIndex(idx)}
                                className={cn(
                                    'px-4 py-3 flex items-center justify-between cursor-pointer border-b last:border-0 border-slate-50 dark:border-slate-800/50',
                                    idx === suggestIndex
                                        ? 'bg-slate-50 dark:bg-slate-800/50'
                                        : ''
                                )}
                            >
                                <div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {s.title}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {s.categoryTitle}
                                    </div>
                                </div>
                                {s.isFav && (
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <TabNav
                items={tabItems}
                value={activeTab}
                onChange={setActiveTab}
                className="w-full"
            />

            {/* Favourites Section */}
            {favouriteItems.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        Favourites
                    </h2>
                    <div className="grid sm:grid-cols-2  gap-4">
                        {favouriteItems.map(({ category, report }) => (
                            <ReportRow
                                key={report.key}
                                categoryKey={category.key}
                                report={report}
                                isFav={true}
                                onToggleFav={() =>
                                    toggleFavourite(category.key, report.key)
                                }
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Categories */}
            <div className="space-y-8">
                {filteredCategories.map((category) => (
                    <div key={category.key} className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                                {category.icon}
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {category.title}
                            </h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.reports.map((report) => (
                                <ReportRow
                                    key={report.key}
                                    categoryKey={category.key}
                                    report={report}
                                    isFav={favourites.includes(
                                        `${category.key}:${report.key}`
                                    )}
                                    onToggleFav={() =>
                                        toggleFavourite(
                                            category.key,
                                            report.key
                                        )
                                    }
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Search className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                            No reports found
                        </h3>
                        <p className="text-slate-500 mt-1">
                            Try adjusting your search query
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reportpage;
