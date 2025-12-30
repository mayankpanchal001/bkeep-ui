import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type SubscriptionsBarMiniProps = {
    data: { label: string; current: number; previous: number }[];
    height?: number;
};

export default function SubscriptionsBarMini({
    data,
    height = 180,
}: SubscriptionsBarMiniProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#374151' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#374151' }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 12,
                    }}
                />
                <Bar
                    dataKey="previous"
                    fill="#ef4444"
                    radius={[6, 6, 0, 0]}
                    name="Previous"
                />
                <Bar
                    dataKey="current"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    name="Current"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
