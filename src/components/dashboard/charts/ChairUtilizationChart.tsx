import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { getThemeColor } from '../../../utils/themeColors';
import {
    ChartContainer,
    ChartTooltip,
    type TooltipPayloadItem,
} from '../../ui/chart';

type ChairUtilizationChartProps = {
    data: {
        location: string;
        utilization: number;
        revenue: number;
    }[];
};

const ChairUtilizationChart = ({ data }: ChairUtilizationChartProps) => {
    const chartData = data.map((item) => ({
        name: item.location.split(' - ')[1] || item.location,
        utilization: item.utilization,
        revenue: item.revenue,
    }));

    const getColor = (utilization: number) => {
        if (utilization < 50) return getThemeColor('--color-destructive');
        if (utilization < 70) return getThemeColor('--color-accent');
        return getThemeColor('--color-secondary');
    };

    const borderColor = getThemeColor('--color-border');
    const textColor = getThemeColor('--color-foreground');

    const chartConfig = {
        utilization: {
            label: 'Utilization',
            color: getThemeColor('--color-accent'),
        },
    };

    return (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
                    tick={{ fontSize: 11, fill: textColor }}
                    stroke={textColor}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    tick={{ fontSize: 12, fill: textColor }}
                    stroke={textColor}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
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
                            const data = payload[0].payload as {
                                name?: string;
                                utilization?: number;
                                revenue?: number;
                            };
                            if (!data) return null;
                            return (
                                <div className="rounded-lg border border-border/50 bg-card p-2 shadow-sm">
                                    <div className="grid gap-2">
                                        <div className="font-medium">
                                            {data.name as string}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{
                                                    backgroundColor: getColor(
                                                        (data.utilization as number) || 0
                                                    ),
                                                }}
                                            />
                                            <span className="text-muted-foreground">
                                                Utilization:
                                            </span>
                                            <span className="font-mono font-medium tabular-nums">
                                                {data.utilization}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{
                                                    backgroundColor: getColor(
                                                        (data.utilization as number) || 0
                                                    ),
                                                }}
                                            />
                                            <span className="text-muted-foreground">
                                                Revenue/Hour:
                                            </span>
                                            <span className="font-mono font-medium tabular-nums">
                                                ${(data.revenue as number || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar dataKey="utilization" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={getColor(entry.utilization)}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
};

export default ChairUtilizationChart;
