import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type SalesActivityAreaChartProps = {
    data: { month: string; sales: number; subscriptions: number }[];
    height?: number;
};

export default function SalesActivityAreaChart({
    data,
    height = 260,
}: SalesActivityAreaChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#374151' }} />
                <YAxis tick={{ fontSize: 12, fill: '#374151' }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 12,
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#ef4444"
                    fill="url(#colorSales)"
                    strokeWidth={2}
                />
                <Area
                    type="monotone"
                    dataKey="subscriptions"
                    stroke="#10b981"
                    fill="url(#colorSubs)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
