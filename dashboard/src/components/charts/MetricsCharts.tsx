import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricData {
    timestamp: string;
    cpu: number;
    ram: number;
}

interface Props {
    data: MetricData[];
}

export function CPUChart({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                    dataKey="timestamp"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    domain={[0, 100]}
                    unit="%"
                />
                <Tooltip
                    contentStyle={{
                        background: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '10px',
                        padding: '12px',
                        backdropFilter: 'blur(16px)',
                    }}
                    labelStyle={{ color: '#F9FAFB', fontWeight: 600 }}
                    itemStyle={{ color: '#00D9FF' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'CPU']}
                    labelFormatter={(label) => new Date(label).toLocaleString('pt-PT')}
                />
                <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#00D9FF"
                    strokeWidth={2}
                    fill="url(#cpuGradient)"
                    dot={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export function RAMChart({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <defs>
                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0084FF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0084FF" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                    dataKey="timestamp"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    domain={[0, 100]}
                    unit="%"
                />
                <Tooltip
                    contentStyle={{
                        background: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(0, 132, 255, 0.3)',
                        borderRadius: '10px',
                        padding: '12px',
                    }}
                    labelStyle={{ color: '#F9FAFB', fontWeight: 600 }}
                    itemStyle={{ color: '#0084FF' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'RAM']}
                    labelFormatter={(label) => new Date(label).toLocaleString('pt-PT')}
                />
                <Line
                    type="monotone"
                    dataKey="ram"
                    stroke="#0084FF"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#0084FF' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}