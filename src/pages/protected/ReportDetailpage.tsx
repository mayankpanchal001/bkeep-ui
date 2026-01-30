import { ArrowLeft, Calendar, FileText, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

const LS_FAV_KEY = 'bkeep-report-favourites';
const LS_FAV_LABEL_KEY = 'bkeep-report-favourites-labels';

type ReportItem = { key: string; title: string };
type ReportCategory = { key: string; title: string; reports: ReportItem[] };

const REPORT_CATEGORIES: ReportCategory[] = [
    {
        key: 'business-overview',
        title: 'Business overview',
        reports: [
            { key: 'balance-sheet', title: 'Balance Sheet' },
            {
                key: 'statement-of-cash-flows',
                title: 'Statement of Cash Flows',
            },
            { key: 'profit-and-loss', title: 'Profit and Loss' },
        ],
    },
    {
        key: 'accounting',
        title: 'Accounting',
        reports: [
            { key: 'general-ledger', title: 'General Ledger' },
            { key: 'audit-log', title: 'Audit Log' },
            { key: 'unpaid-bills', title: 'Unpaid Bills' },
        ],
    },
];

const ReportDetailpage = () => {
    const navigate = useNavigate();
    const params = useParams();
    const categoryKey = params.category || '';
    const reportKey = params.report || '';

    const [favourites, setFavourites] = useState<string[]>(() => {
        try {
            const raw = localStorage.getItem(LS_FAV_KEY);
            const parsed = raw ? (JSON.parse(raw) as string[]) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const category = useMemo(
        () => REPORT_CATEGORIES.find((c) => c.key === categoryKey),
        [categoryKey]
    );
    const report = useMemo(
        () => category?.reports.find((r) => r.key === reportKey),
        [category, reportKey]
    );

    const id = `${categoryKey}:${reportKey}`;
    const isFav = favourites.includes(id);
    const toggleFavourite = () => {
        setFavourites((prev) => {
            const next = prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id];
            try {
                localStorage.setItem(LS_FAV_KEY, JSON.stringify(next));
                const rawLabels = localStorage.getItem(LS_FAV_LABEL_KEY);
                const labels: Record<string, string> = rawLabels
                    ? JSON.parse(rawLabels)
                    : {};
                if (labels[id]) {
                    delete labels[id];
                } else if (report?.title) {
                    labels[id] = report.title;
                }
                localStorage.setItem(LS_FAV_LABEL_KEY, JSON.stringify(labels));
            } catch {
                // ignore
            }
            return next;
        });
    };

    const title = report?.title || 'Report';
    const subtitle = category ? `Category: ${category.title}` : 'Report detail';

    return (
        <div className="flex flex-col gap-4 w-full lg:mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold text-foreground">
                    {title}
                </h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/reports')}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-card border border-primary/10 text-primary hover:bg-primary/5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Reports</span>
                </button>
                <button
                    onClick={toggleFavourite}
                    aria-label={
                        isFav ? 'Remove from favourites' : 'Add to favourites'
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-card border border-primary/10 text-primary hover:bg-primary/5"
                >
                    {isFav ? (
                        <Star className="w-4 h-4 text-green-600 fill-current" />
                    ) : (
                        <Star className="w-4 h-4 text-primary/50" />
                    )}
                    <span className="text-sm">
                        {isFav ? 'Favourited' : 'Add to favourites'}
                    </span>
                </button>
            </div>

            <div className="bg-card border border-primary/10 rounded p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary/60" />
                    <span className="text-sm text-primary/70">
                        {title} — interactive report
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        <input
                            type="date"
                            className="w-full bg-card border border-primary/10 rounded px-2 py-1 text-sm"
                            aria-label="Start date"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        <input
                            type="date"
                            className="w-full bg-card border border-primary/10 rounded px-2 py-1 text-sm"
                            aria-label="End date"
                        />
                    </div>
                    <button className="px-3 py-2 rounded bg-primary text-white text-sm">
                        Run report
                    </button>
                </div>

                <div className="border border-primary/10 rounded p-8 text-center text-primary/60">
                    Report content coming soon.
                </div>
            </div>
        </div>
    );
};

export default ReportDetailpage;
