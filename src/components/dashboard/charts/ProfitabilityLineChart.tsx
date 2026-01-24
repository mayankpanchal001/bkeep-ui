import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { getThemeColor } from '../../../utils/themeColors';
import {
    ChartContainer,
    ChartLegend,
    ChartTooltip,
    type TooltipPayloadItem,
} from '../../ui/chart';

type ProfitabilityLineChartProps = {
    data: { month: string; profitMargin: number; target: number }[];
};

const ProfitabilityLineChart = ({ data }: ProfitabilityLineChartProps) => {
    const accentColor = getThemeColor('--color-accent');
    const textColor = getThemeColor('--color-foreground');
    const borderColor = getThemeColor('--color-border');

    const chartConfig = {
        profitMargin: {
            label: 'Profit Margin',
            color: accentColor,
        },
        target: {
            label: 'Target',
            color: textColor,
        },
    };

    return (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={borderColor}
                    vertical={false}
                />
                <XAxis
                    dataKey="month"
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
                            const monthData = payload[0].payload as {
                                month?: string;
                            };
                            return (
                                <div className="rounded-lg border border-border/50 bg-card p-2 ">
                                    <div className="grid gap-2">
                                        <div className="font-medium">
                                            {monthData?.month as string}
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
                                                                    'profitMargin'
                                                                    ? accentColor
                                                                    : textColor),
                                                        }}
                                                    />
                                                    <span className="text-muted-foreground">
                                                        {item.name}:
                                                    </span>
                                                    <span className="font-mono font-medium tabular-nums">
                                                        {item.value}%
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
                <ChartLegend
                    payload={[
                        {
                            value: 'Profit Margin',
                            type: 'line',
                            id: 'profitMargin',
                            color: accentColor,
                        },
                        {
                            value: 'Target',
                            type: 'line',
                            id: 'target',
                            color: textColor,
                        },
                    ]}
                />
                <Line
                    type="monotone"
                    dataKey="profitMargin"
                    stroke={accentColor}
                    strokeWidth={2}
                    dot={{ fill: accentColor, r: 4 }}
                    name="Profit Margin"
                />
                <Line
                    type="monotone"
                    dataKey="target"
                    stroke={textColor}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: textColor, r: 4 }}
                    name="Target"
                />
            </LineChart>
        </ChartContainer>
    );
};

export default ProfitabilityLineChart;
