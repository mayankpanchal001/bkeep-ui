import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getThemeColor } from '../../../utils/themeColors';
import {
    ChartContainer,
    ChartTooltip,
    type TooltipPayloadItem,
} from '../../ui/chart';

type SalesActivityAreaChartProps = {
    data: { month: string; sales: number; subscriptions: number }[];
    height?: number;
};

export default function SalesActivityAreaChart({
    data,
    height = 260,
}: SalesActivityAreaChartProps) {
    const destructiveColor = getThemeColor('--color-destructive');
    const secondaryColor = getThemeColor('--color-secondary');
    const borderColor = getThemeColor('--color-border');
    const textColor = getThemeColor('--color-foreground');

    const chartConfig = {
        sales: {
            label: 'Sales',
            color: destructiveColor,
        },
        subscriptions: {
            label: 'Subscriptions',
            color: secondaryColor,
        },
    };

    return (
        <ChartContainer
            config={chartConfig}
            className="w-full"
            style={{ height: `${height}px` }}
        >
            <AreaChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={destructiveColor}
                            stopOpacity={0.4}
                        />
                        <stop
                            offset="95%"
                            stopColor={destructiveColor}
                            stopOpacity={0.05}
                        />
                    </linearGradient>
                    <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={secondaryColor}
                            stopOpacity={0.4}
                        />
                        <stop
                            offset="95%"
                            stopColor={secondaryColor}
                            stopOpacity={0.05}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={borderColor}
                    vertical={false}
                />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: textColor }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    tick={{ fontSize: 12, fill: textColor }}
                    tickLine={false}
                    axisLine={false}
                />
                <ChartTooltip
                    content={({
                        active,
                        payload,
                    }: {
                        active?: boolean;
                        payload?: Array<TooltipPayloadItem>;
                    }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border border-border/50 bg-card p-2 ">
                                    <div className="grid gap-2">
                                        <div className="font-medium">
                                            {
                                                payload[0].payload
                                                    ?.month as string
                                            }
                                        </div>
                                        {payload.map(
                                            (
                                                item: TooltipPayloadItem,
                                                index: number
                                            ) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                item.color ||
                                                                (item.dataKey ===
                                                                    'sales'
                                                                    ? destructiveColor
                                                                    : secondaryColor),
                                                        }}
                                                    />
                                                    <span className="text-muted-foreground">
                                                        {item.name}:
                                                    </span>
                                                    <span className="font-mono font-medium tabular-nums">
                                                        {item.value?.toLocaleString()}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="sales"
                    stroke={destructiveColor}
                    fill="url(#colorSales)"
                    strokeWidth={2}
                />
                <Area
                    type="monotone"
                    dataKey="subscriptions"
                    stroke={secondaryColor}
                    fill="url(#colorSubs)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ChartContainer>
    );
}
