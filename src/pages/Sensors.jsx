import { useEffect, useMemo, useState } from "react";
import { Thermometer, Droplets, Flame, SunMedium, RefreshCw } from "lucide-react";
import sensorApi from "../api/sensorApi";

const DEFAULT_AUTO_REFRESH_MS = 5000;

function formatTimestamp(ts) {
    if (!ts) return "-";
    const date = new Date(ts);
    return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "short",
    }).format(date);
}

function MiniSparkline({ values, color, yMin, yMax, yTicks }) {
    if (!values || values.length < 2) {
        return <div className="text-xs text-slate-400">Insufficient data</div>;
    }

    const width = 160;
    const height = 80;
    const padding = 6;
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const tickMin = yTicks?.length ? Math.min(...yTicks) : undefined;
    const tickMax = yTicks?.length ? Math.max(...yTicks) : undefined;
    const min = yMin !== undefined ? yMin : (tickMin !== undefined ? tickMin : dataMin);
    const max = yMax !== undefined ? yMax : (tickMax !== undefined ? tickMax : dataMax);
    const range = Math.max(max - min, 1);

    const labelValues = yTicks?.length
        ? [...yTicks].sort((a, b) => b - a)
        : [max, min];

    const path = values
        .map((v, i) => {
            const x = padding + ((width - padding * 2) * i) / (values.length - 1);
            const y = height - padding - ((v - min) / range) * (height - padding * 2);
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ");

    return (
        <div className="flex items-start gap-2">
            <div className="flex h-20 min-w-[36px] flex-col justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {labelValues.map((v) => (
                    <span key={v}>{v}</span>
                ))}
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
                    fill="url(#spark)"
                    stroke="none"
                    opacity="0.6"
                />
                <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        </div>
    );
}

function StatCard({ title, icon: Icon, value, unit, trendLabel, lastUpdated, color, chartValues, yMin, yMax, yTicks }) {
    return (
        <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${color.bg}`}>
                        <Icon className={`h-5 w-5 ${color.icon}`} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                        <p className="text-3xl font-semibold text-slate-900 dark:text-white">
                            {value ?? "-"}
                            {unit && <span className="ml-1 text-base font-medium text-slate-500 dark:text-slate-400">{unit}</span>}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 text-right leading-tight min-w-[90px]">{lastUpdated}</div>
            </div>
            <div className="mt-auto flex items-center justify-between gap-3">
                <div className="w-2/3">
                    <MiniSparkline values={chartValues} color={color.stroke} yMin={yMin} yMax={yMax} yTicks={yTicks} />
                </div>
                <div className="w-1/3 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                    {trendLabel}
                </div>
            </div>
        </div>
    );
}

export default function Sensors() {
    const [temperature, setTemperature] = useState([]);
    const [humidity, setHumidity] = useState([]);
    const [gas, setGas] = useState([]);
    const [light, setLight] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [limit, setLimit] = useState(40);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [autoRefreshMs, setAutoRefreshMs] = useState(DEFAULT_AUTO_REFRESH_MS);

    const latestTemp = temperature?.[0];
    const latestHumid = humidity?.[0];
    const latestGas = gas?.[0];
    const latestLight = light?.[0];

    const chartData = useMemo(() => ({
        temp: [...(temperature || [])].reverse().map((d) => d.temperature),
        humid: [...(humidity || [])].reverse().map((d) => d.humidity),
        gas: [...(gas || [])].reverse().map((d) => d.ppm_value),
        light: [...(light || [])].reverse().map((d) => d.lux),
    }), [temperature, humidity, gas, light]);

    const fetchSensors = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        try {
            const [tRes, hRes, gRes, lRes] = await Promise.all([
                sensorApi.getTemperature(limit),
                sensorApi.getHumidity(limit),
                sensorApi.getGas(limit),
                sensorApi.getLight(limit),
            ]);

            setTemperature(tRes.data?.data || []);
            setHumidity(hRes.data?.data || []);
            setGas(gRes.data?.data || []);
            setLight(lRes.data?.data || []);
        } catch (err) {
            console.error("Failed to load sensors", err);
            setError("Gagal memuat data sensor");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchSensors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit]);

    useEffect(() => {
        if (!autoRefresh) return undefined;
        const id = setInterval(() => fetchSensors(false), autoRefreshMs);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit, autoRefresh, autoRefreshMs]);

    const gasStatusColor = {
        normal: "text-green-600 dark:text-green-400",
        warning: "text-amber-600 dark:text-amber-400",
        danger: "text-red-600 dark:text-red-400",
    }[latestGas?.status] || "text-slate-500 dark:text-slate-400";

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sensor Monitoring</h1>
                    <p className="text-slate-500 dark:text-slate-400">Grafik realtime per sensor (last {limit} data points)</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>Points</span>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        >
                            {[20, 40, 80, 120].map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>Auto refresh</span>
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>Interval</span>
                        <select
                            value={autoRefreshMs}
                            onChange={(e) => setAutoRefreshMs(Number(e.target.value))}
                            disabled={!autoRefresh}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:disabled:bg-slate-700"
                        >
                            {[5000, 10000, 30000, 60000].map((opt) => (
                                <option key={opt} value={opt}>{Math.round(opt / 1000)}s</option>
                            ))}
                        </select>
                    </label>
                    <button
                        onClick={() => fetchSensors()}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500"
                    >
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    Loading sensor data...
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Temperature"
                        icon={Thermometer}
                        value={latestTemp?.temperature?.toFixed(1)}
                        unit="°C"
                        trendLabel={`Terakhir: ${formatTimestamp(latestTemp?.timestamp)}`}
                        lastUpdated={formatTimestamp(latestTemp?.timestamp)}
                        color={{ bg: "bg-rose-50", icon: "text-rose-600", stroke: "#f43f5e" }}
                        chartValues={chartData.temp}
                        yMin={0}
                        yMax={50}
                        yTicks={[0, 10, 20, 30, 40, 50]}
                    />

                    <StatCard
                        title="Humidity"
                        icon={Droplets}
                        value={latestHumid?.humidity?.toFixed(1)}
                        unit="%"
                        trendLabel={`Terakhir: ${formatTimestamp(latestHumid?.timestamp)}`}
                        lastUpdated={formatTimestamp(latestHumid?.timestamp)}
                        color={{ bg: "bg-sky-50", icon: "text-sky-600", stroke: "#0284c7" }}
                        chartValues={chartData.humid}
                        yMin={0}
                        yMax={100}
                        yTicks={[0, 25, 50, 75, 100]}
                    />

                    <StatCard
                        title="Gas (PPM)"
                        icon={Flame}
                        value={latestGas?.ppm_value}
                        unit="ppm"
                        trendLabel={<span className={gasStatusColor}>Status: {latestGas?.status || "-"}</span>}
                        lastUpdated={formatTimestamp(latestGas?.timestamp)}
                        color={{ bg: "bg-amber-50", icon: "text-amber-600", stroke: "#d97706" }}
                        chartValues={chartData.gas}
                        yMin={0}
                        yMax={1000}
                        yTicks={[0, 250, 500, 750, 1000]}
                    />

                    <StatCard
                        title="Light"
                        icon={SunMedium}
                        value={latestLight?.lux}
                        unit="lux"
                        trendLabel={`Terakhir: ${formatTimestamp(latestLight?.timestamp)}`}
                        lastUpdated={formatTimestamp(latestLight?.timestamp)}
                        color={{ bg: "bg-violet-50", icon: "text-violet-600", stroke: "#7c3aed" }}
                        chartValues={chartData.light}
                        yMin={0}
                        yMax={1000}
                        yTicks={[0, 250, 500, 750, 1000]}
                    />
                </div>
            )}

            {/* Tables per sensor */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {[{
                    title: "Temperature",
                    rows: temperature,
                    headers: ["temperature", "timestamp"],
                    formatter: (r) => ({ value: `${r.temperature?.toFixed?.(1) ?? "-"} °C`, time: formatTimestamp(r.timestamp) }),
                    icon: Thermometer,
                    color: "text-rose-600",
                    file: "temperature.csv",
                }, {
                    title: "Humidity",
                    rows: humidity,
                    headers: ["humidity", "timestamp"],
                    formatter: (r) => ({ value: `${r.humidity?.toFixed?.(1) ?? "-"} %`, time: formatTimestamp(r.timestamp) }),
                    icon: Droplets,
                    color: "text-sky-600",
                    file: "humidity.csv",
                }, {
                    title: "Gas (PPM)",
                    rows: gas,
                    headers: ["ppm_value", "status", "timestamp"],
                    formatter: (r) => ({ value: `${r.ppm_value ?? "-"} ppm`, status: r.status, time: formatTimestamp(r.timestamp) }),
                    icon: Flame,
                    color: "text-amber-600",
                    file: "gas.csv",
                }, {
                    title: "Light",
                    rows: light,
                    headers: ["lux", "timestamp"],
                    formatter: (r) => ({ value: `${r.lux ?? "-"} lux`, time: formatTimestamp(r.timestamp) }),
                    icon: SunMedium,
                    color: "text-violet-600",
                    file: "light.csv",
                }].map((item) => (
                    <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                                <item.icon className={`h-5 w-5 ${item.color}`} />
                                <span className="font-semibold">{item.title}</span>
                            </div>
                            <button
                                onClick={() => downloadCSV(item.file, item.rows, item.headers)}
                                className="text-xs font-medium text-indigo-600 hover:underline"
                            >
                                Export CSV
                            </button>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Value</th>
                                        {item.headers.includes("status") && <th className="px-3 py-2 text-left">Status</th>}
                                        <th className="px-3 py-2 text-left">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {(item.rows || []).slice(0, 8).map((row, idx) => {
                                        const f = item.formatter(row);
                                        return (
                                            <tr key={idx} className="bg-white dark:bg-slate-800">
                                                <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{f.value}</td>
                                                {item.headers.includes("status") && (
                                                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{f.status || "-"}</td>
                                                )}
                                                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{f.time}</td>
                                            </tr>
                                        );
                                    })}
                                    {(item.rows || []).length === 0 && (
                                        <tr>
                                            <td colSpan={item.headers.includes("status") ? 3 : 2} className="px-3 py-2 text-center text-slate-500 dark:text-slate-400">No data</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function downloadCSV(filename, rows, headers) {
    if (!rows || !rows.length) return;
    const headerLine = headers.join(",");
    const body = rows
        .map((r) => headers.map((h) => (r[h] !== undefined && r[h] !== null ? String(r[h]).replace(/,/g, " ") : "")).join(","))
        .join("\n");
    const csv = `${headerLine}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}