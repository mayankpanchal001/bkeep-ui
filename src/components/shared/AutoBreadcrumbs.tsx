import { useMemo } from 'react';
import { Link, useLocation } from 'react-router';
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

export default function AutoBreadcrumbs({
    className,
}: {
    className?: string;
}) {
    const location = useLocation();
    const flat = useMemo(() => flattenSidebar(), []);

    const segments = location.pathname
        .split('/')
        .filter(Boolean)
        .slice(0, 6); // safety cap

    const parts = useMemo(() => {
        const acc: { path: string; label: string; isMatch: boolean }[] = [];
        let currentPath = '';

        // Always begin with Home
        acc.push({ path: '/', label: 'Home', isMatch: true });

        segments.forEach((seg) => {
            currentPath = currentPath + '/' + seg;
            const match =
                flat.find((f) => f.path === currentPath) ||
                flat.find((f) => currentPath.startsWith(f.path));

            const label = match?.label ?? titleize(seg);
            acc.push({
                path: currentPath,
                label,
                isMatch: !!match,
            });
        });
        return acc;
    }, [segments, flat]);

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
                        <div key={p.path} className="flex items-center">
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
