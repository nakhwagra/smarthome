import React, { createContext, useContext, useEffect, useState } from "react";

interface User { [k: string]: any }

interface AuthContextValue {
    user: User | null;
    token: string | null;
    login: (token: string, user?: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
    const [user, setUser] = useState<User | null>(() => {
        const raw = localStorage.getItem("auth_user");
        return raw ? JSON.parse(raw) : null;
    });

    useEffect(() => {
        if (token) localStorage.setItem("auth_token", token);
        else localStorage.removeItem("auth_token");
    }, [token]);

    useEffect(() => {
        if (user) localStorage.setItem("auth_user", JSON.stringify(user));
        else localStorage.removeItem("auth_user");
    }, [user]);

    const login = (t: string, u?: User) => {
        setToken(t);
        if (u) setUser(u);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}