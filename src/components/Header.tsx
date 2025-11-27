import React from "react";
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    return (
        <header className="flex items-center justify-between p-4 bg-white shadow">
            <div className="text-lg font-bold">SmartHome Dashboard</div>
            <div className="flex items-center gap-4">
                {user && <div className="text-sm text-gray-600">Hi, {user.name ?? user.email}</div>}
                <button onClick={() => logout()} className="text-sm px-3 py-1 border rounded">Logout</button>
            </div>
        </header>
    );
};

export default Header;
