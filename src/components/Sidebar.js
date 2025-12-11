import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
const LinkItem = ({ to, children }) => (_jsx(NavLink, { to: to, className: ({ isActive }) => `block px-4 py-2 rounded-md text-sm ${isActive
        ? "bg-sky-100 text-sky-700 font-semibold"
        : "text-gray-700 hover:bg-gray-100"}`, children: children }));
export default function Sidebar() {
    return (_jsxs("aside", { className: "w-64 bg-white border-r hidden md:block", children: [_jsx("div", { className: "p-4 border-b", children: _jsx("div", { className: "text-lg font-bold text-sky-600", children: "SmartHome" }) }), _jsxs("nav", { className: "p-4 space-y-1", children: [_jsx(LinkItem, { to: "/", children: "Dashboard" }), _jsx(LinkItem, { to: "/devices", children: "Devices" }), _jsx(LinkItem, { to: "/sensors", children: "Sensors" }), _jsx(LinkItem, { to: "/history", children: "History" }), _jsx(LinkItem, { to: "/settings", children: "Settings" })] })] }));
}
