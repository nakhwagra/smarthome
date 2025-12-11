import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("auth_user");
        return raw ? JSON.parse(raw) : null;
    });
    useEffect(() => {
        if (token)
            localStorage.setItem("auth_token", token);
        else
            localStorage.removeItem("auth_token");
    }, [token]);
    useEffect(() => {
        if (user)
            localStorage.setItem("auth_user", JSON.stringify(user));
        else
            localStorage.removeItem("auth_user");
    }, [user]);
    const login = (t, u) => {
        setToken(t);
        if (u)
            setUser(u);
    };
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    };
    return (_jsx(AuthContext.Provider, { value: { user, token, login, logout, isAuthenticated: !!token }, children: children }));
};
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
