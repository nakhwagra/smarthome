import React from "react";

interface ToggleButtonProps {
    on: boolean;
    onToggle: (nextValue: boolean) => void; // harus menerima boolean
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ on, onToggle }) => {
    return (
        <button
            onClick={() => onToggle(!on)} // toggle saat diklik
            className={`px-3 py-1 rounded ${on ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"
                }`}
        >
            {on ? "ON" : "OFF"}
        </button>
    );
};

export default ToggleButton;
