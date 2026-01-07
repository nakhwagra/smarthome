import React from "react";
import { Device } from "../api/deviceApi";

interface Props {
    device: Device;
    onToggleStatus: (id: number, nextStatus: "on" | "off") => void;
}

const DeviceCard: React.FC<Props> = ({ device, onToggleStatus }) => {
    const handleClick = () => {
        const nextStatus = device.status === "on" ? "off" : "on";
        onToggleStatus(device.id, nextStatus);
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div>
                <h4 className="font-semibold">{device.name}</h4>
                <p className="text-sm text-gray-500">{device.type}</p>
            </div>
            <button
                onClick={handleClick}
                className={`px-3 py-1 rounded ${device.status === "on" ? "bg-green-500 text-white" : "bg-gray-300 text-black"
                    }`}
            >
                {device.status}
            </button>
        </div>
    );
};

export default DeviceCard;