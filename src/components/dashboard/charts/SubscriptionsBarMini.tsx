import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getThemeColor } from '../../../utils/themeColors';
import {
    ChartContainer,
    ChartTooltip,
    type TooltipPayloadItem,
} from '../../ui/chart';

type SubscriptionsBarMiniProps = {
    data: { label: string; current: number; previous: number }[];
    height?: number;
};

export default function SubscriptionsBarMini({
    data,
    height = 180,
}: SubscriptionsBarMiniProps) {
    const destructiveColor = getThemeColor('--color-destructive');
    const secondaryColor = getThemeColor('--color-secondary');
    const borderColor = getThemeColor('--color-border');
    const textColor = getThemeColor('--color-foreground');

    const chartConfig = {
        previous: {
            label: 'Previous',
            color: destructiveColor,
        },
        current: {
            label: 'Current',
            color: secondaryColor,
        },
    };

    return (
        <ChartContainer
            config={chartConfig}
            className="w-full"
            style={{ height: `${height}px` }}
        >
            <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={borderColor}
                    vertical={false}
                />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: textColor }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: textColor }}
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
                                                    ?.label as string
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
                                                                    'previous'
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
                <Bar
                    dataKey="previous"
                    fill={destructiveColor}
                    radius={[6, 6, 0, 0]}
                />
                <Bar
                    dataKey="current"
                    fill={secondaryColor}
                    radius={[6, 6, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    );
}
