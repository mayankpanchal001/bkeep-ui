import * as React from 'react';

import { cn } from '@/utils/cn';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
    return (
        <div
            data-slot="table-container"
            className="relative w-full overflow-x-auto"
        >
            <table
                data-slot="table"
                className={cn(
                    'min-w-full w-max caption-bottom text-sm table-fixed border-collapse',
                    className
                )}
                {...props}
            />
        </div>
    );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
    return (
        <thead
            data-slot="table-header"
            className={cn('[&_tr]:border-b overflow-hidden', className)}
            {...props}
        />
    );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
    return (
        <tbody
            data-slot="table-body"
            className={cn('[&_tr:last-child]:border-0', className)}
            {...props}
        />
    );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
                className
            )}
            {...props}
        />
    );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                'hover:bg-surface-muted data-[state=selected]:bg-primary/5 border-b transition-colors',
                className
            )}
            {...props}
        />
    );
}

type TableHeadProps = React.ComponentProps<'th'> & {
    resizable?: boolean;
    minWidth?: number;
    maxWidth?: number;
};

function TableHead({
    className,
    children,
    resizable = true,
    minWidth = 80,
    maxWidth = 600,
    ...props
}: TableHeadProps) {
    const ref = React.useRef<HTMLTableCellElement | null>(null);
    const [width, setWidth] = React.useState<number | undefined>(undefined);
    const dragging = React.useRef(false);
    const startX = React.useRef(0);
    const startWidth = React.useRef(0);

    React.useEffect(() => {
        if (ref.current && width === undefined) {
            setWidth(ref.current.offsetWidth);
        }
    }, [width]);

    const onMouseMove = (e: MouseEvent) => {
        if (!dragging.current || !ref.current) return;
        const delta = e.clientX - startX.current;
        let next = startWidth.current + delta;
        if (next < minWidth) next = minWidth;
        if (maxWidth && next > maxWidth) next = maxWidth;
        ref.current.style.width = `${next}px`;
        setWidth(next);
    };

    const onMouseUp = () => {
        if (!dragging.current) return;
        dragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        if (!resizable || !ref.current) return;
        dragging.current = true;
        startX.current = e.clientX;
        startWidth.current = ref.current.offsetWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const style = React.useMemo<React.CSSProperties>(() => {
        return {
            ...(props.style || {}),
            ...(width !== undefined ? { width } : {}),
        };
    }, [props.style, width]);

    return (
        <th
            ref={ref}
            data-slot="table-head"
            style={style}
            className={cn(
                'relative text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-[2px] bg-primary/10 border-r last:border-r-0 first:border-l border-primary/10',
                className
            )}
            {...props}
        >
            {children}
            {resizable && (
                <span
                    aria-hidden="true"
                    onMouseDown={onMouseDown}
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize select-none"
                />
            )}
        </th>
    );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
    return (
        <td
            data-slot="table-cell"
            className={cn(
                'p-2 align-middle truncate [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-[2px] border-r last:border-r-0 first:border-l border-primary/10',
                className
            )}
            {...props}
        />
    );
}

function TableCaption({
    className,
    ...props
}: React.ComponentProps<'caption'>) {
    return (
        <caption
            data-slot="table-caption"
            className={cn('text-muted-foreground mt-4 text-sm', className)}
            {...props}
        />
    );
}

export {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
};
