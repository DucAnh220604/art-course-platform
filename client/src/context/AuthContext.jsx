import authApi from "@/api/authApi";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.data?.success) {
            setUser(response.data.data.user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.log("Token invalid:", error);
          localStorage.removeItem("accessToken");
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLogin();
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    if (response.data?.success) {
      localStorage.setItem("accessToken", response.data.token);
      setUser(response.data.data.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    throw new Error("Đăng nhập thất bại");
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      if (response.data?.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.log("Refresh user failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
