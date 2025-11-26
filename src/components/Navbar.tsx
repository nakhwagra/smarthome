import React from "react";

export default function Navbar({ user = { name: "Guest" } }) {
    return (
        <header className="w-full bg-white/80 backdrop-blur-sm shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl font-bold text-sky-600">SmartHome</div>
                        <div className="text-sm text-gray-500">Dashboard</div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-sm font-medium text-gray-700">{user.name}</span>
                            <span className="text-xs text-gray-400">Administrator</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center">
                            {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}