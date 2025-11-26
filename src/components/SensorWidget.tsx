// src/components/SensorWidget.tsx
import React from "react";

type Props = {
    title?: string;
    value?: string | number;
    unit?: string;
};

export default function SensorWidget({ title = "Sensor", value = "-", unit = "" }: Props) {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-400">{title}</div>
            <div className="mt-2 text-2xl font-semibold text-gray-800">
                {value} <span className="text-sm text-gray-500">{unit}</span>
            </div>
        </div>
    );
}