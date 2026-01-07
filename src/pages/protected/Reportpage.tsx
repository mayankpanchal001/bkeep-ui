import PageHeader from '@/components/shared/PageHeader';
import { cn } from '@/utils/cn';
import { ChevronDown, ChevronRight, FileText, Search, Star, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
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
        icon: <TrendingUp className="w-4 h-4" />,
        reports: [
            { key: 'balance-sheet', title: 'Balance Sheet', description: 'Assets, liabilities, and equity snapshot' },
            { key: 'balance-sheet-comparison', title: 'Balance Sheet Comparison', description: 'Compare across periods' },
            { key: 'balance-sheet-detail', title: 'Balance Sheet Detail', description: 'Line-by-line breakdown' },
            { key: 'balance-sheet-summary', title: 'Balance Sheet Summary', description: 'High-level overview' },
            { key: 'statement-of-cash-flows', title: 'Statement of Cash Flows', description: 'Cash inflows and outflows' },
            { key: 'profit-and-loss', title: 'Profit and Loss', description: 'Income and expenses' },
            { key: 'profit-and-loss-by-customer', title: 'Profit and Loss by Customer', description: 'Breakdown by customer' },
            { key: 'profit-and-loss-by-month', title: 'Profit and Loss by Month', description: 'Monthly trends' },
            { key: 'profit-and-loss-comparison', title: 'Profit and Loss Comparison', description: 'Period over period' },
            { key: 'profit-and-loss-detail', title: 'Profit and Loss Detail', description: 'Detailed transactions' },
        ],
    },
    {
        key: 'accounting',
        title: 'Accounting',
        icon: <FileText className="w-4 h-4" />,
        reports: [
            { key: 'general-ledger', title: 'General Ledger', description: 'All account transactions' },
            { key: 'audit-log', title: 'Audit Log', description: 'System activity history' },
            { key: 'unpaid-bills', title: 'Unpaid Bills', description: 'Outstanding payables' },
            { key: 'accounts-payable-aging-summary', title: 'A/P Aging Summary', description: 'Payables by age' },
            { key: 'accounts-payable-aging-detail', title: 'A/P Aging Detail', description: 'Detailed payables aging' },
            { key: 'accounts-receivable-aging-summary', title: 'A/R Aging Summary', description: 'Receivables by age' },
            { key: 'accounts-receivable-aging-detail', title: 'A/R Aging Detail', description: 'Detailed receivables aging' },
        ],
    },
    {
        key: 'sales',
        title: 'Sales',
        icon: <TrendingUp className="w-4 h-4" />,
        reports: [
            { key: 'sales-summary', title: 'Sales Summary', description: 'Total sales overview' },
            { key: 'sales-by-tag', title: 'Sales by Tag Group', description: 'Categorized sales' },
            { key: 'sales-by-month', title: 'Sales by Month', description: 'Monthly sales trends' },
        ],
    },
];

const LS_FAV_KEY = 'bkeep-report-favourites';
const LS_FAV_LABEL_KEY = 'bkeep-report-favourites-labels';

const Reportpage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [favourites, setFavourites] = useState<string[]>([]);
    const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        REPORT_CATEGORIES.forEach((c) => (initial[c.key] = true));
        return initial;
    });
    const [suggestOpen, setSuggestOpen] = useState(false);
    const [suggestIndex, setSuggestIndex] = useState(0);

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
        if (!query.trim()) return REPORT_CATEGORIES;
        const q = query.toLowerCase();
        return REPORT_CATEGORIES.map((cat) => ({
            ...cat,
            reports: cat.reports.filter(
                (r) =>
                    r.title.toLowerCase().includes(q) ||
                    r.description?.toLowerCase().includes(q) ||
                    cat.title.toLowerCase().includes(q)
            ),
        })).filter((cat) => cat.reports.length > 0);
    }, [query]);

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
        const favs = base.filter((x) => x.isFav).slice(0, 8);
        const others = base.filter((x) => !x.isFav).slice(0, 8 - favs.length);
        return [...favs, ...others];
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

    const highlight = (title: string) => {
        const q = query.trim();
        if (!q) return title;
        const idx = title.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return title;
        const before = title.slice(0, idx);
        const match = title.slice(idx, idx + q.length);
        const after = title.slice(idx + q.length);
        return (
            <>
                {before}
                <span className="text-primary font-semibold">{match}</span>
                {after}
            </>
        );
    };

    // Modern Report Tile Component
    const ReportTile = ({
        categoryKey,
        report,
        isFav,
        onOpen,
        onToggleFav,
    }: {
        categoryKey: string;
        report: ReportItem;
        isFav: boolean;
        onOpen: () => void;
        onToggleFav: () => void;
    }) => {
        return (
            <button
                onClick={onOpen}
                className={cn(
                    'group relative bg-white dark:bg-slate-900 rounded-xl p-4 text-left transition-all duration-200',
                    'border border-slate-200/80 dark:border-slate-700/80',
                    'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/30',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
                aria-label={`Open ${report.title}`}
            >
                {/* Favorite button */}
                <button
                    aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFav();
                    }}
                    className={cn(
                        'absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200',
                        isFav
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
                            : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 opacity-0 group-hover:opacity-100'
                    )}
                >
                    {isFav ? (
                        <FaStar className="w-3.5 h-3.5" />
                    ) : (
                        <FaRegStar className="w-3.5 h-3.5" />
                    )}
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary mb-3">
                    <FileText className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="pr-6">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">
                        {report.title}
                    </h3>
                    {report.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {report.description}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                        {categoryKey.replace(/-/g, ' ')}
                    </span>
                    <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Open →
                    </span>
                </div>
            </button>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Reports"
                subtitle="Browse and favourite reports by category"
            />

            {/* Search Section */}
            <div className="relative">
                <div
                    className={cn(
                        'flex items-center gap-3 rounded-xl border bg-white dark:bg-slate-900 px-4 py-3 transition-all duration-200',
                        'border-slate-200/80 dark:border-slate-700/80',
                        'focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40',
                        'shadow-sm focus-within:shadow-lg'
                    )}
                    onClick={() => setSuggestOpen(true)}
                >
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSuggestOpen(true);
                        }}
                        onFocus={() => setSuggestOpen(true)}
                        onBlur={() => setTimeout(() => setSuggestOpen(false), 120)}
                        onKeyDown={(e) => {
                            if (!suggestions.length) return;
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setSuggestIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setSuggestIndex((i) => (i > 0 ? i - 1 : 0));
                            } else if (e.key === 'Enter') {
                                e.preventDefault();
                                const s = suggestions[suggestIndex];
                                if (s) handleSelectSuggestion(s);
                            } else if (e.key === 'Escape') {
                                e.preventDefault();
                                setSuggestOpen(false);
                            }
                        }}
                        placeholder="Search reports..."
                        className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
                        aria-label="Search reports"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="sr-only">Clear</span>
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {suggestOpen && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xl overflow-hidden">
                        <div role="listbox" className="max-h-80 overflow-auto py-1">
                            {suggestions.map((s, idx) => (
                                <button
                                    key={s.id}
                                    role="option"
                                    aria-selected={idx === suggestIndex}
                                    onMouseEnter={() => setSuggestIndex(idx)}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelectSuggestion(s);
                                    }}
                                    className={cn(
                                        'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
                                        idx === suggestIndex
                                            ? 'bg-primary/5 dark:bg-primary/10'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'flex items-center justify-center w-8 h-8 rounded-lg',
                                            idx === suggestIndex
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        )}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                'text-sm font-medium',
                                                idx === suggestIndex ? 'text-primary' : 'text-slate-700 dark:text-slate-300'
                                            )}>
                                                {highlight(s.title)}
                                            </span>
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                {s.categoryTitle}
                                            </span>
                                        </div>
                                    </div>
                                    {s.isFav && (
                                        <FaStar className="w-3.5 h-3.5 text-amber-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {REPORT_CATEGORIES.map((cat) => (
                    <button
                        key={`chip-${cat.key}`}
                        onClick={() => {
                            const el = document.getElementById(`section-${cat.key}`);
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                            setOpenMap((m) => ({ ...m, [cat.key]: true }));
                        }}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                            openMap[cat.key]
                                ? 'bg-primary text-white shadow-md shadow-primary/25'
                                : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-primary/40 hover:text-primary'
                        )}
                        aria-label={`Jump to ${cat.title}`}
                    >
                        {cat.icon}
                        {cat.title}
                        <span className={cn(
                            'text-xs px-1.5 py-0.5 rounded-full',
                            openMap[cat.key]
                                ? 'bg-white/20'
                                : 'bg-slate-100 dark:bg-slate-800'
                        )}>
                            {cat.reports.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Favourites Section */}
            {favouriteItems.length > 0 && (
                <div className="rounded-xl border border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-500/5 dark:to-orange-500/5 overflow-hidden">
                    <div className="px-5 py-4 border-b border-amber-200/50 dark:border-amber-500/20">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Favourites
                            </h2>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                ({favouriteItems.length})
                            </span>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {favouriteItems.map(({ category, report }) => {
                                const id = `${category.key}:${report.key}`;
                                const isFav = favourites.includes(id);
                                return (
                                    <ReportTile
                                        key={id}
                                        categoryKey={category.key}
                                        report={report}
                                        isFav={isFav}
                                        onOpen={() => goToReport(category.key, report.key)}
                                        onToggleFav={() => toggleFavourite(category.key, report.key)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Category Sections */}
            {filteredCategories.map((cat) => (
                <div key={cat.key} id={`section-${cat.key}`} className="space-y-4">
                    <button
                        onClick={() => setOpenMap((m) => ({ ...m, [cat.key]: !m[cat.key] }))}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 hover:border-primary/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                                {cat.icon || <FileText className="w-4 h-4" />}
                            </div>
                            <div className="text-left">
                                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {cat.title}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {cat.reports.length} reports
                                </p>
                            </div>
                        </div>
                        <div className={cn(
                            'flex items-center justify-center w-6 h-6 rounded-full transition-colors',
                            openMap[cat.key] ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        )}>
                            {openMap[cat.key] ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </div>
                    </button>

                    {openMap[cat.key] && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                            {cat.reports.map((r) => {
                                const id = `${cat.key}:${r.key}`;
                                const isFav = favourites.includes(id);
                                return (
                                    <ReportTile
                                        key={id}
                                        categoryKey={cat.key}
                                        report={r}
                                        isFav={isFav}
                                        onOpen={() => goToReport(cat.key, r.key)}
                                        onToggleFav={() => toggleFavourite(cat.key, r.key)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}

            {/* Empty State */}
            {filteredCategories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        No reports found
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
                        Try adjusting your search query or browse the categories above.
                    </p>
                    <button
                        onClick={() => setQuery('')}
                        className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        Clear search
                    </button>
                </div>
            )}
        </div>
    );
};

export default Reportpage;
