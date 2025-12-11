import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const DeviceCard = ({ device, onToggleStatus }) => {
    const handleClick = () => {
        const nextStatus = device.status === "on" ? "off" : "on";
        onToggleStatus(device.id, nextStatus);
    };
    return (_jsxs("div", { className: "bg-white rounded-lg shadow p-4 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: device.name }), _jsx("p", { className: "text-sm text-gray-500", children: device.type })] }), _jsx("button", { onClick: handleClick, className: `px-3 py-1 rounded ${device.status === "on" ? "bg-green-500 text-white" : "bg-gray-300 text-black"}`, children: device.status })] }));
};
export default DeviceCard;
