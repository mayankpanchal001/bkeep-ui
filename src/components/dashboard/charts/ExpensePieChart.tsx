import { Cell, Pie, PieChart } from 'recharts';
import { getThemeColor } from '../../../utils/themeColors';
import {
    ChartContainer,
    ChartLegend,
    ChartTooltip,
    type TooltipPayloadItem,
} from '../../ui/chart';

type ExpensePieChartProps = {
    data: { category: string; amount: number; percentage: number }[];
};

const ExpensePieChart = ({ data }: ExpensePieChartProps) => {
    const chartData = data.map((item) => ({
        name: item.category,
        value: item.amount,
        percentage: item.percentage,
    }));

    const accent = getThemeColor('--color-accent');
    const secondary = getThemeColor('--color-secondary');
    const foreground = getThemeColor('--color-foreground');
    const surfaceMuted = getThemeColor('--color-surface-muted');
    const destructive = getThemeColor('--color-destructive');

    const COLORS = [accent, secondary, foreground, surfaceMuted, destructive];

    const chartConfig = chartData.reduce(
        (acc, item, index) => ({
            ...acc,
            [item.name]: {
                label: item.name,
                color: COLORS[index % COLORS.length],
            },
        }),
        {} as Record<string, { label: string; color: string }>
    );

    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill={accent}
                    dataKey="value"
                >
                    {chartData.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>
                <ChartTooltip
                    content={({
                        active,
                        payload,
                    }: {
                        active?: boolean;
                        payload?: Array<TooltipPayloadItem>;
                    }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload as {
                                name?: string;
                                value?: number;
                                percentage?: number;
                            };
                            if (!data) return null;
                            return (
                                <div className="rounded-lg border border-border/50 bg-card p-3 shadow-sm">
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="font-semibold">
                                                {data.name as string}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        COLORS[
                                                            chartData.findIndex(
                                                                (d) =>
                                                                    d.name ===
                                                                    data.name
                                                            ) % COLORS.length
                                                        ],
                                                }}
                                            />
                                            <span className="text-muted-foreground">
                                                Amount:
                                            </span>
                                            <span className="font-mono font-medium tabular-nums">
                                                ${(data.value as number || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {data.percentage}% of total
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <ChartLegend
                    payload={chartData.map((item, index) => ({
                        value: item.name,
                        type: 'circle',
                        id: item.name,
                        color: COLORS[index % COLORS.length],
                    }))}
                />
            </PieChart>
        </ChartContainer>
    );
};

export default ExpensePieChart;
