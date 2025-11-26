// import React from "react";

// export default function ToggleButton({ on = false, onToggle = () => { }, disabled = false }) {
//     return (
//         <button
//             onClick={() => !disabled && onToggle(!on)}
//             disabled={disabled}
//             aria-pressed={on}
//             className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${on ? "bg-sky-500" : "bg-gray-300"
//                 } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
//         >
//             <span
//                 className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-1"
//                     }`}
//             />
//         </button>
//     );
// }

// // ToggleButton.tsx
// interface ToggleButtonProps {
//     on: boolean;
//     onToggle: () => void; // fungsi tanpa parameter
// }

// const ToggleButton: React.FC<ToggleButtonProps> = ({ on, onToggle }) => {
//     return <button onClick={onToggle}>{on ? "ON" : "OFF"}</button>;
// };

// export default ToggleButton;

// src/components/ToggleButton.tsx
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
