import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SIDEBAR_ITEMS } from '@/constants';
import { useJournalEntry } from '@/services/apis/journalApi';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router';

type FlatItem = {
    path: string;
    label: string;
    parent?: string | null;
};

function titleize(slug: string) {
    return slug
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
}

function flattenSidebar(): FlatItem[] {
    const out: FlatItem[] = [];
    SIDEBAR_ITEMS.forEach((item) => {
        if (item.path) {
            out.push({ path: item.path, label: item.label, parent: null });
        }
        if (item.children) {
            item.children.forEach((c) => {
                if (c.path) {
                    out.push({
                        path: c.path,
                        label: c.label,
                        parent: item.path || null,
                    });
                }
            });
        }
    });
    return out;
}

export default function AutoBreadcrumbs({ className }: { className?: string }) {
    const location = useLocation();
    const flat = useMemo(() => flattenSidebar(), []);

    const segments = location.pathname.split('/').filter(Boolean).slice(0, 6); // safety cap

    // Check if we're on a journal entry view page and get the entry number
    const journalEntryId = useMemo(() => {
        const lastSegment = segments[segments.length - 1];
        const prevSegment = segments[segments.length - 2];
        if (
            prevSegment === 'journal-entries' &&
            lastSegment?.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            )
        ) {
            return lastSegment;
        }
        return null;
    }, [segments]);

    const { data: journalEntryData } = useJournalEntry(journalEntryId ?? '');

    // Extract journal entry number
    const journalEntryNumber = useMemo(() => {
        if (!journalEntryData) return null;
        const root = journalEntryData as unknown as
            | Record<string, unknown>
            | undefined;
        const firstData = root?.data as Record<string, unknown> | undefined;
        const candidates = [
            firstData?.journalEntry,
            firstData?.data,
            firstData,
            root?.journalEntry,
        ];
        const entry = candidates.find(
            (v) => typeof v === 'object' && v !== null
        ) as Record<string, unknown> | undefined;
        if (!entry) return null;
        const entryNumber = entry.entryNumber;
        return typeof entryNumber === 'string' ? entryNumber : null;
    }, [journalEntryData]);

    const parts = useMemo(() => {
        const acc: { path: string; label: string; isMatch: boolean }[] = [];
        let currentPath = '';

        // Always begin with Home
        acc.push({ path: '/', label: 'Home', isMatch: true });

        segments.forEach((seg, index) => {
            currentPath = currentPath + '/' + seg;
            const match = flat.find((f) => f.path === currentPath);

            let label = match?.label ?? titleize(seg);

            // Check if this is the last segment and needs special handling
            const isLastSegment = index === segments.length - 1;

            // Handle journal entry routes
            if (isLastSegment) {
                // Check if we're on an edit page
                if (seg === 'edit') {
                    label = 'Edit';
                }
                // Check if we're on a view page (UUID pattern)
                else if (
                    seg.match(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                    )
                ) {
                    // Check if the previous segment was 'journal-entries'
                    const prevSeg = segments[index - 1];
                    if (prevSeg === 'journal-entries') {
                        // Append journal entry number if available
                        label = journalEntryNumber
                            ? `${journalEntryNumber}`
                            : 'View';
                    }
                }
                // Check if we're on a create/new page
                else if (seg === 'new') {
                    label = 'Create';
                }
            }

            acc.push({
                path: currentPath,
                label,
                isMatch: !!match,
            });
        });
        return acc;
    }, [segments, flat, journalEntryNumber]);

    const MAX_VISIBLE = 4;
    const needsEllipsis = parts.length > MAX_VISIBLE;
    const visibleParts = needsEllipsis
        ? [
            parts[0],
            parts[parts.length - 3],
            parts[parts.length - 2],
            parts[parts.length - 1],
        ]
        : parts;

    return (
        <Breadcrumb aria-label="Breadcrumb" className={className}>
            <BreadcrumbList>
                {needsEllipsis ? (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to={parts[0].path}>{parts[0].label}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbEllipsis />
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                    </>
                ) : null}

                {visibleParts.map((p, idx) => {
                    const isLast = idx === visibleParts.length - 1;
                    return (
                        <div key={p.path} className="flex items-center gap-2 capitalize">
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{p.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={p.path}>{p.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </div>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
