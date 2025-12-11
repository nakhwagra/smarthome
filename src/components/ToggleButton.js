import { jsx as _jsx } from "react/jsx-runtime";
const ToggleButton = ({ on, onToggle }) => {
    return (_jsx("button", { onClick: () => onToggle(!on), className: `px-3 py-1 rounded ${on ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}`, children: on ? "ON" : "OFF" }));
};
export default ToggleButton;
