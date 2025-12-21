// src/components/SensorDataTable.tsx
import React from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { CombinedSensorData } from "../api/sensorApi";
import { format } from "date-fns";

interface SensorDataTableProps {
    data: CombinedSensorData[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onExport: () => void;
    isDark: boolean;
    loading: boolean;
}

const SensorDataTable: React.FC<SensorDataTableProps> = ({
    data,
    currentPage,
    totalPages,
    onPageChange,
    onExport,
    isDark,
    loading,
}) => {
    return (
        <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}">
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Sensor Data
                </h3>
                <button
                    onClick={onExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className={isDark ? "bg-slate-700" : "bg-slate-50"}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"} uppercase tracking-wider`}>
                                Timestamp
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"} uppercase tracking-wider`}>
                                Temperature
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"} uppercase tracking-wider`}>
                                Humidity
                            </th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-slate-700" : "divide-slate-200"}`}>
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-t-blue-600 border-slate-300 rounded-full animate-spin"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={3} className={`px-6 py-8 text-center ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr key={index} className={isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? "text-slate-300" : "text-slate-900"}`}>
                                        {format(new Date(row.timestamp), "MMM dd, yyyy HH:mm:ss")}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                        {row.temperature.toFixed(1)}°C
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${isDark ? "text-green-400" : "text-green-600"}`}>
                                        {row.humidity.toFixed(1)}%
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && data.length > 0 && (
                <div className={`flex items-center justify-between px-6 py-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg ${currentPage === 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : isDark
                                        ? "bg-slate-700 hover:bg-slate-600"
                                        : "bg-slate-200 hover:bg-slate-300"
                                } ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg ${currentPage === totalPages
                                    ? "opacity-50 cursor-not-allowed"
                                    : isDark
                                        ? "bg-slate-700 hover:bg-slate-600"
                                        : "bg-slate-200 hover:bg-slate-300"
                                } ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SensorDataTable;
