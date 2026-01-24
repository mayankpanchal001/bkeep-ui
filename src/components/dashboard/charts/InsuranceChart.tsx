import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getThemeColor } from '../../../utils/themeColors';
import {
    ChartContainer,
    ChartTooltip,
    type TooltipPayloadItem,
} from '../../ui/chart';

type InsuranceChartProps = {
    data: { name: string; volume: number; avgDays: number }[];
};

const InsuranceChart = ({ data }: InsuranceChartProps) => {
    const chartData = data.map((item) => ({
        name: item.name,
        volume: item.volume,
        avgDays: item.avgDays,
    }));

    const accentColor = getThemeColor('--color-accent');
    const borderColor = getThemeColor('--color-border');
    const textColor = getThemeColor('--color-foreground');

    const chartConfig = {
        volume: {
            label: 'Claim Volume',
            color: accentColor,
        },
    };

    return (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
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
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                            const data = payload[0].payload as {
                                name?: string;
                                volume?: number;
                                avgDays?: number;
                            };
                            if (!data) return null;
                            return (
                                <div className="rounded-lg border border-border/50 bg-card p-2 ">
                                    <div className="grid gap-2">
                                        <div className="font-medium">
                                            {data.name as string}
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
                                                Claim Volume:
                                            </span>
                                            <span className="font-mono font-medium tabular-nums">
                                                $
                                                {(
                                                    (data.volume as number) || 0
                                                ).toLocaleString()}
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
                                                Avg Days:
                                            </span>
                                            <span className="font-mono font-medium tabular-nums">
                                                {data.avgDays} days
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
                    dataKey="volume"
                    fill={accentColor}
                    radius={[8, 8, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    );
};

export default InsuranceChart;
