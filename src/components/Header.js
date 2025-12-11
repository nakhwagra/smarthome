import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../context/AuthContext";
const Header = () => {
    var _a;
    const { user, logout } = useAuth();
    return (_jsxs("header", { className: "flex items-center justify-between p-4 bg-white shadow", children: [_jsx("div", { className: "text-lg font-bold", children: "SmartHome Dashboard" }), _jsxs("div", { className: "flex items-center gap-4", children: [user && _jsxs("div", { className: "text-sm text-gray-600", children: ["Hi, ", (_a = user.name) !== null && _a !== void 0 ? _a : user.email] }), _jsx("button", { onClick: () => logout(), className: "text-sm px-3 py-1 border rounded", children: "Logout" })] })] }));
};
export default Header;
