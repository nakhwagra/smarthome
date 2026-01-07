// src/components/TimeRangeFilter.tsx
import React from "react";
import { Clock } from "lucide-react";

interface TimeRangeFilterProps {
    value: string;
    onChange: (range: string) => void;
    isDark: boolean;
}

const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({ value, onChange, isDark }) => {
    const ranges = [
        { value: "1h", label: "Last 1 Hour" },
        { value: "6h", label: "Last 6 Hours" },
        { value: "24h", label: "Last 24 Hours" },
        { value: "7d", label: "Last 7 Days" },
    ];

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <Clock className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
            <div className="flex gap-2">
                {ranges.map((range) => (
                    <button
                        key={range.value}
                        onClick={() => onChange(range.value)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${value === range.value
                            ? "bg-blue-600 text-white shadow-lg"
                            : isDark
                                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TimeRangeFilter;
