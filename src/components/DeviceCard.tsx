// src/components/DeviceCard.tsx
import React, { useState } from "react";
import ToggleButton from "./ToggleButton";

export interface Device {
    id: number;
    name: string;
    type?: string;
    status?: "on" | "off" | string;
    mqtt_topic?: string;
}

type Props = {
    device: Device;
    onToggleStatus?: (id: number, status: string) => void;
};

export default function DeviceCard({ device, onToggleStatus }: Props) {
    const [status, setStatus] = useState<string>(device.status ?? "off");
    const isOn = status === "on";

    const handleToggle = (nextValue: boolean) => {
        const nextStatus = nextValue ? "on" : "off";
        setStatus(nextStatus);
        onToggleStatus?.(device.id, nextStatus);
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-md bg-sky-50 flex items-center justify-center text-sky-600 text-xl">
                    {device.type === "light" && "💡"}
                    {device.type === "ac" && "❄️"}
                    {device.type === "fan" && "🌀"}
                </div>
                <div>
                    <div className="font-medium text-gray-800">{device.name}</div>
                    <div className="text-xs text-gray-400">Topic: {device.mqtt_topic || "-"}</div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">{isOn ? "ON" : "OFF"}</div>
                <ToggleButton on={isOn} onToggle={handleToggle} />
            </div>
        </div>
    );
}