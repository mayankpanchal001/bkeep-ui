import { cn } from '@/utils/cn';
import { getThemeColor } from '@/utils/themeColors';
import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

// Chart Container
export interface ChartContainerProps
    extends React.HTMLAttributes<HTMLDivElement> {
    config: Record<string, { label?: React.ReactNode; color?: string }>;
    children: React.ComponentProps<
        typeof RechartsPrimitive.ResponsiveContainer
    >['children'];
    className?: string;
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
    ({ id, className, children, config, ...props }, ref) => {
        const uniqueId = React.useId();
        const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

        return (
            <div
                data-chart={chartId}
                ref={ref}
                className={cn(
                    'flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke="#ccc"]]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke="#fff"]]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke="#ccc"]]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector[stroke="#fff"]]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none',
                    className
                )}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <RechartsPrimitive.ResponsiveContainer>
                    {children}
                </RechartsPrimitive.ResponsiveContainer>
            </div>
        );
    }
);
ChartContainer.displayName = 'Chart';

// Chart Style - injects CSS variables for colors
function ChartStyle({
    id,
    config,
}: {
    id: string;
    config: ChartContainerProps['config'];
}) {
    const colorConfig = Object.entries(config).filter(
        ([, config]) => config.color
    );

    if (!colorConfig.length) {
        return null;
    }

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: Object.entries(config)
                    .map(([key, item]) => {
                        const color =
                            item.color || getThemeColor('--color-primary');
                        return `[data-chart=${id}] .color-${key} { color: ${color}; }`;
                    })
                    .join('\n'),
            }}
        />
    );
}

// Chart Tooltip
export interface TooltipPayloadItem {
    name?: string;
    value?: number | string;
    dataKey?: string;
    color?: string;
    payload?: Record<string, unknown>;
    fill?: string;
    stroke?: string;
}

export interface ChartTooltipProps
    extends Omit<RechartsPrimitive.TooltipProps<number, string>, 'content'> {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
    className?: string;
    active?: boolean;
    payload?: Array<TooltipPayloadItem>;
    label?: string | number | React.ReactNode;
    content?: (props: {
        active?: boolean;
        payload?: Array<TooltipPayloadItem>;
    }) => React.ReactNode | null;
}

const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
    (
        {
            active,
            payload,
            className,
            indicator = 'dot',
            label,
            labelFormatter,
            labelClassName,
            formatter,
            hideLabel = false,
            hideIndicator = false,
            nameKey,
            labelKey,
            content,
            ...props
        },
        ref
    ) => {
        const tooltipLabel = React.useMemo(() => {
            if (hideLabel || !payload?.length) {
                return null;
            }

            const [item] = payload;
            const key = `${labelKey || item.dataKey || item.name || 'value'}`;
            const itemConfig = (
                item.payload?.payload as Record<string, unknown>
            )?.[key] as React.ReactNode;

            if (
                labelFormatter === undefined &&
                typeof label === 'string' &&
                itemConfig !== undefined
            ) {
                return itemConfig;
            }

            if (labelFormatter !== undefined && label !== undefined) {
                return (
                    <div className={cn('font-medium', labelClassName)}>
                        {labelFormatter(
                            label,
                            payload as unknown as Array<
                                RechartsPrimitive.TooltipProps<
                                    number,
                                    string
                                > extends { payload?: (infer U)[] }
                                    ? U
                                    : never
                            >
                        )}
                    </div>
                );
            }

            if (label !== undefined) {
                return (
                    <div className={cn('font-medium', labelClassName)}>
                        {label}
                    </div>
                );
            }

            return null;
        }, [
            label,
            labelFormatter,
            payload,
            labelClassName,
            hideLabel,
            labelKey,
        ]);

        // If custom content is provided, use it
        if (content) {
            return (
                <div ref={ref} {...props}>
                    {content({ active, payload })}
                </div>
            );
        }

        if (!active || !payload?.length) {
            return null;
        }

        const nestLabel = payload.length === 1 && indicator !== 'dot';

        return (
            <div
                ref={ref}
                className={cn(
                    'grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-card px-2.5 py-1.5 text-xs ',
                    className
                )}
                {...props}
            >
                {!nestLabel ? tooltipLabel : null}
                <div className="grid gap-1.5">
                    {payload.map((item: TooltipPayloadItem) => {
                        const key = `${nameKey || item.name || item.dataKey || 'value'}`;
                        const itemConfig = (
                            item.payload?.payload as Record<string, unknown>
                        )?.[key] as { label?: string } | undefined;
                        const indicatorColor =
                            item.payload?.fill ||
                            item.payload?.stroke ||
                            item.color;

                        return (
                            <div
                                key={item.dataKey || item.name || key}
                                className={cn(
                                    'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                                    indicator === 'dot' && 'items-center'
                                )}
                            >
                                {formatter !== undefined &&
                                item?.value !== undefined ? (
                                    typeof formatter === 'function' ? (
                                        (
                                            formatter as unknown as (
                                                value: number,
                                                name: string,
                                                props: {
                                                    payload?: Record<
                                                        string,
                                                        unknown
                                                    >;
                                                    dataKey?: string;
                                                    color?: string;
                                                },
                                                index: number,
                                                payload: TooltipPayloadItem
                                            ) => React.ReactNode
                                        )(
                                            typeof item.value === 'number'
                                                ? item.value
                                                : Number(item.value) || 0,
                                            item.name || '',
                                            {
                                                payload: item.payload,
                                                dataKey: item.dataKey,
                                                color: indicatorColor as
                                                    | string
                                                    | undefined,
                                            },
                                            0,
                                            item
                                        )
                                    ) : (
                                        formatter
                                    )
                                ) : (
                                    <>
                                        {!hideIndicator && (
                                            <div
                                                className={cn(
                                                    'shrink-0 rounded border-[--color-border] bg-[--color-bg]',
                                                    {
                                                        'h-2.5 w-2.5':
                                                            indicator === 'dot',
                                                        'w-1':
                                                            indicator ===
                                                            'line',
                                                        'w-0 border-[1.5px] border-dashed bg-transparent':
                                                            indicator ===
                                                            'dashed',
                                                        'my-0.5':
                                                            nestLabel &&
                                                            indicator ===
                                                                'dashed',
                                                    }
                                                )}
                                                style={
                                                    {
                                                        '--color-bg':
                                                            indicatorColor,
                                                        '--color-border':
                                                            indicatorColor,
                                                    } as React.CSSProperties
                                                }
                                            />
                                        )}
                                        <div
                                            className={cn(
                                                'flex flex-1 justify-between leading-none',
                                                nestLabel
                                                    ? 'items-end'
                                                    : 'items-center'
                                            )}
                                        >
                                            <div className="grid gap-1.5">
                                                {nestLabel ? (
                                                    <div
                                                        className={cn(
                                                            'font-medium',
                                                            labelClassName
                                                        )}
                                                    >
                                                        {labelFormatter !==
                                                            undefined &&
                                                        label !== undefined
                                                            ? labelFormatter(
                                                                  label,
                                                                  payload as unknown as Array<
                                                                      RechartsPrimitive.TooltipProps<
                                                                          number,
                                                                          string
                                                                      > extends {
                                                                          payload?: (infer U)[];
                                                                      }
                                                                          ? U
                                                                          : never
                                                                  >
                                                              )
                                                            : label}
                                                    </div>
                                                ) : null}
                                                <span className="text-muted-foreground">
                                                    {(itemConfig?.label as string) ??
                                                        item.name}
                                                </span>
                                            </div>
                                            {item.value !== undefined && (
                                                <span className="font-mono font-medium tabular-nums text-foreground">
                                                    {typeof item.value ===
                                                    'number'
                                                        ? item.value.toLocaleString()
                                                        : String(item.value)}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
);
ChartTooltip.displayName = 'ChartTooltip';

// Chart Legend
export interface ChartLegendProps {
    payload?: Array<{
        value: string;
        type?: string;
        id?: string;
        color?: string;
    }>;
    nameKey?: string;
    className?: string;
}

const ChartLegend = React.forwardRef<HTMLDivElement, ChartLegendProps>(
    ({ payload, className }, ref) => {
        if (!payload?.length) {
            return null;
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'flex items-center justify-center gap-4',
                    className
                )}
            >
                {payload.map((item) => {
                    return (
                        <div
                            key={item.id ?? item.value}
                            className={cn(
                                'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground'
                            )}
                        >
                            <div
                                className="h-2 w-2 shrink-0 rounded"
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />
                            <span className="text-muted-foreground">
                                {item.value}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }
);
ChartLegend.displayName = 'ChartLegend';

export { ChartContainer, ChartLegend, ChartTooltip };
