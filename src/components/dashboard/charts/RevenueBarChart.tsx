import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getThemeColor } from '../../../utils/themeColors';
import {
    ChartContainer,
    ChartTooltip,
    type TooltipPayloadItem,
} from '../../ui/chart';

type RevenueBarChartProps = {
    data: { name: string; revenue: number; percentage: number }[];
};

const RevenueBarChart = ({ data }: RevenueBarChartProps) => {
    const chartData = data.map((item) => ({
        name: item.name,
        revenue: item.revenue,
    }));

    const accentColor = getThemeColor('--color-accent');
    const borderColor = getThemeColor('--color-border');
    const textColor = getThemeColor('--color-foreground');

    const chartConfig = {
        revenue: {
            label: 'Revenue',
            color: accentColor,
        },
    };

    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={borderColor}
                    vertical={false}
                />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: textColor }}
                    stroke={textColor}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    tick={{ fontSize: 12, fill: textColor }}
                    stroke={textColor}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
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
                            const nameData = payload[0].payload as {
                                name?: string;
                            };
                            return (
                                <div className="rounded-lg border border-border/50 bg-card p-2 ">
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-muted-foreground">
                                                {nameData?.name as string}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        accentColor,
                                                }}
                                            />
                                            <span className="text-muted-foreground">
                                                Revenue:
                                            </span>
                                            <span className="font-mono font-medium tabular-nums">
                                                $
                                                {payload[0].value?.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar
                    dataKey="revenue"
                    fill={accentColor}
                    radius={[8, 8, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    );
};

export default RevenueBarChart;
