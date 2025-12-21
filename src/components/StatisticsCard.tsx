// src/components/StatisticsCard.tsx
import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SensorStats } from "../api/sensorApi";

interface StatisticsCardProps {
    title: string;
    icon: React.ReactNode;
    stats: SensorStats;
    unit: string;
    isDark: boolean;
    color: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, icon, stats, unit, isDark, color }) => {
    const getTrend = () => {
        if (stats.avg > stats.median) return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (stats.avg < stats.median) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-slate-500" />;
    };

    return (
        <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${color}`}>
                        {icon}
                    </div>
                    <div>
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{title}</p>
                        <div className="flex items-center gap-2">
                            <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                {stats.avg.toFixed(1)}{unit}
                            </p>
                            {getTrend()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Min</p>
                    <p className={`text-lg font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                        {stats.min.toFixed(1)}{unit}
                    </p>
                </div>
                <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Max</p>
                    <p className={`text-lg font-semibold ${isDark ? "text-red-400" : "text-red-600"}`}>
                        {stats.max.toFixed(1)}{unit}
                    </p>
                </div>
                <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Median</p>
                    <p className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {stats.median.toFixed(1)}{unit}
                    </p>
                </div>
                <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Std Dev</p>
                    <p className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        ±{stats.std_dev.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className={`mt-4 pt-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {stats.count} readings
                </p>
            </div>
        </div>
    );
};

export default StatisticsCard;
