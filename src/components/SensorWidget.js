import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SensorWidget = ({ title, value, unit, color, icon }) => (_jsxs("div", { className: "bg-white rounded-lg shadow p-4 text-center", children: [icon && _jsx("div", { className: "mb-2", children: icon }), _jsx("h3", { className: "text-sm text-gray-500", children: title }), _jsxs("p", { className: "text-2xl font-bold", children: [value, " ", unit !== null && unit !== void 0 ? unit : ""] })] }));
export default SensorWidget;
