
import React from "react";

interface Props {
    title: string;
    value: number | string;
    unit?: string;
    color?: string;
    icon?: React.ReactNode;
}

const SensorWidget: React.FC<Props> = ({ title, value, unit, icon }) => (
    <div className="p-4 text-center bg-white rounded-lg shadow">
        {icon && <div className="mb-2">{icon}</div>}
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">
            {value} {unit ?? ""}
        </p>
    </div>
);

export default SensorWidget;