import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/utils/cn';
import { ChevronDown, ChevronRight, FileText, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { Badge } from '../../components/ui/badge';

type ReportItem = {
    key: string;
    title: string;
    description?: string;
};

type ReportCategory = {
    key: string;
    title: string;
    reports: ReportItem[];
};

const REPORT_CATEGORIES: ReportCategory[] = [
    {
        key: 'business-overview',
        title: 'Business overview',
        reports: [
            { key: 'balance-sheet', title: 'Balance Sheet' },
            {
                key: 'balance-sheet-comparison',
                title: 'Balance Sheet Comparison',
            },
            { key: 'balance-sheet-detail', title: 'Balance Sheet Detail' },
            { key: 'balance-sheet-summary', title: 'Balance Sheet Summary' },
            {
                key: 'statement-of-cash-flows',
                title: 'Statement of Cash Flows',
            },
            { key: 'profit-and-loss', title: 'Profit and Loss' },
            {
                key: 'profit-and-loss-by-customer',
                title: 'Profit and Loss by Customer',
            },
            {
                key: 'profit-and-loss-by-month',
                title: 'Profit and Loss by Month',
            },
            {
                key: 'profit-and-loss-comparison',
                title: 'Profit and Loss Comparison',
            },
            { key: 'profit-and-loss-detail', title: 'Profit and Loss Detail' },
        ],
    },
    {
        key: 'accounting',
        title: 'Accounting',
        reports: [
            { key: 'general-ledger', title: 'General Ledger' },
            { key: 'audit-log', title: 'Audit Log' },
            { key: 'unpaid-bills', title: 'Unpaid Bills' },
            {
                key: 'accounts-payable-aging-summary',
                title: 'Accounts payable aging summary',
            },
            {
                key: 'accounts-payable-aging-detail',
                title: 'Accounts payable aging detail',
            },
            {
                key: 'accounts-receivable-aging-summary',
                title: 'Accounts receivable aging summary',
            },
            {
                key: 'accounts-receivable-aging-detail',
                title: 'Accounts receivable aging detail',
            },
        ],
    },
    {
        key: 'sales',
        title: 'Sales',
        reports: [
            { key: 'sales-summary', title: 'Sales Summary' },
            { key: 'sales-by-tag', title: 'Sales by Tag Group' },
            { key: 'sales-by-month', title: 'Sales by Month' },
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
                // toggle label entry in map to keep in sync
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

    const ReportTile = ({
        categoryKey,
        report,
        isFav,
        onOpen,
        onToggleFav,
        className,
    }: {
        categoryKey: string;
        report: ReportItem;
        isFav: boolean;
        onOpen: () => void;
        onToggleFav: () => void;
        className?: string;
    }) => {
        return (
            <button
                onClick={onOpen}
                className={cn(
                    'group bg-white border border-primary/10 rounded-xl p-3 text-left transition-all hover:shadow-md hover:-translate-y-0.5',
                    className
                )}
                aria-label={`Open ${report.title}`}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex size-4 sm:size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <FileText className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-primary">
                                {report.title}
                            </span>
                            {report.description && (
                                <span className="text-xs text-primary/50">
                                    {report.description}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Badge variant="outline">
                            {categoryKey.replace(/-/g, ' ')}
                        </Badge>
                        <span className="inline-flex">
                            <button
                                aria-label={
                                    isFav
                                        ? 'Remove from favourites'
                                        : 'Add to favourites'
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFav();
                                }}
                                className="p-1 rounded-full hover:bg-primary/10"
                            >
                                {isFav ? (
                                    <FaStar className="w-4 h-4 text-green-600" />
                                ) : (
                                    <FaRegStar className="w-4 h-4 text-primary/50" />
                                )}
                            </button>
                        </span>
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-primary/50">
                        Click to open report
                    </div>
                    <div className="text-primary/60 group-hover:text-primary text-xs">
                        Open
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="flex flex-col gap-4 w-full lg:max-w-5xl lg:mx-auto">
            <PageHeader
                title="Reports"
                subtitle="Browse and favourite reports by category"
            />

            <div className="relative">
                <div
                    className={cn(
                        'flex items-center gap-2 rounded-lg border border-primary/10 bg-white px-3 py-2 shadow-sm transition',
                        'focus-within:ring-2 focus-within:ring-primary/20'
                    )}
                    onClick={() => setSuggestOpen(true)}
                >
                    <Search className="w-4 h-4 text-primary/40" />
                    <input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSuggestOpen(true);
                        }}
                        onFocus={() => setSuggestOpen(true)}
                        onBlur={() => {
                            setTimeout(() => setSuggestOpen(false), 120);
                        }}
                        onKeyDown={(e) => {
                            if (!suggestions.length) return;
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setSuggestIndex((i) =>
                                    i < suggestions.length - 1 ? i + 1 : i
                                );
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
                        placeholder="Search reports"
                        className="flex-1 bg-transparent outline-none text-sm text-primary placeholder-primary/50"
                        aria-label="Search reports"
                    />
                </div>

                {suggestOpen && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-xl border border-primary/10 shadow-2xl p-1">
                        <div role="listbox" className="max-h-64 overflow-auto">
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
                                        'w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors',
                                        idx === suggestIndex
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-primary/70 hover:bg-white'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-primary/40">
                                            <FileText className="w-4 h-4" />
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {highlight(s.title)}
                                            </span>
                                            <span className="text-[11px] text-primary/40 uppercase tracking-wide">
                                                {s.categoryTitle}
                                            </span>
                                        </div>
                                    </div>
                                    {s.isFav && (
                                        <FaStar className="w-3.5 h-3.5 text-green-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {REPORT_CATEGORIES.map((cat) => (
                    <button
                        key={`chip-${cat.key}`}
                        onClick={() => {
                            const el = document.getElementById(
                                `section-${cat.key}`
                            );
                            if (el) {
                                el.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start',
                                });
                            }
                            setOpenMap((m) => ({
                                ...m,
                                [cat.key]: true,
                            }));
                        }}
                        className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                            openMap[cat.key]
                                ? 'bg-primary/10 border-primary/20 text-primary'
                                : 'bg-white border-primary/10 text-primary/60 hover:text-primary'
                        }`}
                        aria-label={`Jump to ${cat.title}`}
                    >
                        {cat.title}
                    </button>
                ))}
            </div>

            {favouriteItems.length > 0 && (
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-primary text-base">
                            Favourites
                        </CardTitle>
                    </CardHeader>
                    <CardContent className={`p-2`}>
                        <div className="grid px-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {favouriteItems.map(({ category, report }) => {
                                const id = `${category.key}:${report.key}`;
                                const isFav = favourites.includes(id);
                                return (
                                    <ReportTile
                                        key={id}
                                        categoryKey={category.key}
                                        report={report}
                                        isFav={isFav}
                                        onOpen={() =>
                                            goToReport(category.key, report.key)
                                        }
                                        onToggleFav={() =>
                                            toggleFavourite(
                                                category.key,
                                                report.key
                                            )
                                        }
                                    />
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {filteredCategories.map((cat) => (
                <div key={cat.key} id={`section-${cat.key}`}>
                    <Collapsible
                        open={openMap[cat.key]}
                        onOpenChange={(open) =>
                            setOpenMap((m) => ({ ...m, [cat.key]: open }))
                        }
                    >
                        <Card>
                            <CardHeader className="px-3 py-2">
                                <CollapsibleTrigger asChild>
                                    <button className="w-full flex items-center justify-between px-1 py-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-primary">
                                                {cat.title}
                                            </span>
                                        </div>
                                        <span className="text-primary/50">
                                            {openMap[cat.key] ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </span>
                                    </button>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent className="p-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {cat.reports.map((r) => {
                                            const id = `${cat.key}:${r.key}`;
                                            const isFav =
                                                favourites.includes(id);
                                            return (
                                                <ReportTile
                                                    key={id}
                                                    categoryKey={cat.key}
                                                    report={r}
                                                    isFav={isFav}
                                                    onOpen={() =>
                                                        goToReport(
                                                            cat.key,
                                                            r.key
                                                        )
                                                    }
                                                    onToggleFav={() =>
                                                        toggleFavourite(
                                                            cat.key,
                                                            r.key
                                                        )
                                                    }
                                                />
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                </div>
            ))}
        </div>
    );
};

export default Reportpage;
