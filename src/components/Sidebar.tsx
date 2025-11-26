import React from "react";
import { NavLink } from "react-router-dom";

// const LinkItem = ({ to, children }) => (
//     <NavLink
//         to={to}
//         className={({ isActive }) =>
//             `block px-4 py-2 rounded-md text-sm ${isActive ? "bg-sky-100 text-sky-700 font-semibold" : "text-gray-700 hover:bg-gray-100"
//             }`
//         }
//     >
//         {children}
//     </NavLink>
// );

// export default function Sidebar() {
//     return (
//         <aside className="w-64 bg-white border-r hidden md:block">
//             <div className="p-4 border-b">
//                 <div className="text-lg font-bold text-sky-600">SmartHome</div>
//             </div>

//             <nav className="p-4 space-y-1">
//                 <LinkItem to="/">Dashboard</LinkItem>
//                 <LinkItem to="/devices">Devices</LinkItem>
//                 <LinkItem to="/sensors">Sensors</LinkItem>
//                 <LinkItem to="/history">History</LinkItem>
//                 <LinkItem to="/settings">Settings</LinkItem>
//             </nav>
//         </aside>
//     );
// }

interface LinkItemProps {
    to: string;
    children: React.ReactNode;
}

const LinkItem: React.FC<LinkItemProps> = ({ to, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `block px-4 py-2 rounded-md text-sm ${isActive
                ? "bg-sky-100 text-sky-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`
        }
    >
        {children}
    </NavLink>
);

export default function Sidebar() {
    return (
        <aside className="w-64 bg-white border-r hidden md:block">
            <div className="p-4 border-b">
                <div className="text-lg font-bold text-sky-600">SmartHome</div>
            </div>

            <nav className="p-4 space-y-1">
                <LinkItem to="/">Dashboard</LinkItem>
                <LinkItem to="/devices">Devices</LinkItem>
                <LinkItem to="/sensors">Sensors</LinkItem>
                <LinkItem to="/history">History</LinkItem>
                <LinkItem to="/settings">Settings</LinkItem>
            </nav>
        </aside>
    );
}