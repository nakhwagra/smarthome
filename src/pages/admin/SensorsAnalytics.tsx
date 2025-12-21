// src/pages/admin/SensorsAnalytics.tsx
import React, { useEffect, useState } from "react";
import { Thermometer, Droplets, RefreshCw, Download } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import sensorApi, { SensorStatsResponse, CombinedSensorData, HourlyData } from "../../api/sensorApi";
import TimeRangeFilter from "../../components/TimeRangeFilter";
import StatisticsCard from "../../components/StatisticsCard";
import SensorDataTable from "../../components/SensorDataTable";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import Papa from "papaparse";

export default function SensorsAnalytics(): JSX.Element {
    const { isDark } = useTheme();
    const [timeRange, setTimeRange] = useState("24h");
    const [stats, setStats] = useState<SensorStatsResponse | null>(null);
    const [sensorData, setSensorData] = useState<CombinedSensorData[]>([]);
    const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            setRefreshing(true);

            // Fetch statistics
            const statsRes = await sensorApi.getStatistics(timeRange);
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            // Fetch paginated data
            const dataRes = await sensorApi.getPaginatedData(timeRange, currentPage, 50);
            if (dataRes.data.success) {
                setSensorData(dataRes.data.data.data);
                setTotalPages(dataRes.data.data.total_pages);
            }

            // Fetch hourly data
            const hourlyRes = await sensorApi.getHourlyData(timeRange);
            if (hourlyRes.data.success) {
                setHourlyData(hourlyRes.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch sensor analytics:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [timeRange, currentPage]);

    const handleExportCSV = () => {
        const csvData = sensorData.map(row => ({
            Timestamp: format(new Date(row.timestamp), "yyyy-MM-dd HH:mm:ss"),
            Temperature: row.temperature.toFixed(2),
            Humidity: row.humidity.toFixed(2),
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `sensor_data_${timeRange}_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
        link.click();
    };

    if (loading && !stats) {
        return (
            <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8 flex items-center justify-center`}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-blue-600 border-slate-300 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`}>
            {/* Header */}
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    📊 Sensor Analytics & Monitoring
                </h1>
                <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Advanced environmental data analysis and insights
                </p>
            </div>

            {/* Time Range Filter & Refresh */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <TimeRangeFilter value={timeRange} onChange={setTimeRange} isDark={isDark} />
                <button
                    onClick={fetchData}
                    disabled={refreshing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${refreshing
                            ? "opacity-50 cursor-not-allowed"
                            : isDark
                                ? "bg-slate-700 hover:bg-slate-600 text-white"
                                : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                        }`}
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <StatisticsCard
                        title="Temperature"
                        icon={<Thermometer className="w-6 h-6 text-white" />}
                        stats={stats.temperature}
                        unit="°C"
                        isDark={isDark}
                        color="bg-gradient-to-br from-orange-500 to-red-600"
                    />
                    <StatisticsCard
                        title="Humidity"
                        icon={<Droplets className="w-6 h-6 text-white" />}
                        stats={stats.humidity}
                        unit="%"
                        isDark={isDark}
                        color="bg-gradient-to-br from-blue-500 to-cyan-600"
                    />
                </div>
            )}

            {/* Line Chart - Trend */}
            <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6 mb-8`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                    📈 Temperature & Humidity Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sensorData.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(ts) => format(new Date(ts), "HH:mm")}
                            stroke={isDark ? "#94a3b8" : "#64748b"}
                        />
                        <YAxis yAxisId="left" stroke={isDark ? "#94a3b8" : "#64748b"} />
                        <YAxis yAxisId="right" orientation="right" stroke={isDark ? "#94a3b8" : "#64748b"} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                                border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                                borderRadius: "8px",
                            }}
                            labelFormatter={(ts) => format(new Date(ts), "MMM dd, HH:mm:ss")}
                        />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} name="Temperature (°C)" />
                        <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} name="Humidity (%)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Area Chart - Comfort Zone */}
            <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6 mb-8`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                    🌡️ Comfort Zone Visualization
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={sensorData.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(ts) => format(new Date(ts), "HH:mm")}
                            stroke={isDark ? "#94a3b8" : "#64748b"}
                        />
                        <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                                border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                                borderRadius: "8px",
                            }}
                            labelFormatter={(ts) => format(new Date(ts), "MMM dd, HH:mm:ss")}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="temperature" stroke="#f97316" fill="#f9731680" name="Temperature (°C)" />
                        <Area type="monotone" dataKey="humidity" stroke="#06b6d4" fill="#06b6d480" name="Humidity (%)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart - Hourly Comparison */}
            {hourlyData.length > 0 && (
                <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6 mb-8`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                        📊 Hourly Averages
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                            <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} stroke={isDark ? "#94a3b8" : "#64748b"} />
                            <YAxis yAxisId="left" stroke={isDark ? "#94a3b8" : "#64748b"} />
                            <YAxis yAxisId="right" orientation="right" stroke={isDark ? "#94a3b8" : "#64748b"} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? "#1e293b" : "#ffffff",
                                    border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                                    borderRadius: "8px",
                                }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="avg_temp" fill="#f97316" name="Avg Temp (°C)" />
                            <Bar yAxisId="right" dataKey="avg_humidity" fill="#06b6d4" name="Avg Humidity (%)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Data Table */}
            <SensorDataTable
                data={sensorData}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onExport={handleExportCSV}
                isDark={isDark}
                loading={refreshing}
            />
        </div>
    );
}
