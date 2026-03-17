import authApi from "@/api/authApi";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

const AuthContext = createContext();

const AUTH_CHANNEL_NAME = "auth_channel";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  const performLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const logout = useCallback(() => {
    performLogout();

    if (channelRef.current) {
      channelRef.current.postMessage({ type: "LOGOUT" });
    }

    localStorage.setItem("logout_event", Date.now().toString());
    localStorage.removeItem("logout_event");
  }, [performLogout]);

  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel(AUTH_CHANNEL_NAME);

      channelRef.current.onmessage = (event) => {
        if (event.data?.type === "LOGOUT") {
          console.log("Nhận logout event từ tab khác");
          performLogout();
        } else if (event.data?.type === "LOGIN") {
          checkLogin();
        }
      };
    } catch (error) {
      console.log("BroadcastChannel không được hỗ trợ:", error);
    }

    const handleStorageChange = (event) => {
      if (event.key === "accessToken") {
        if (!event.newValue) {
          console.log("Token bị xóa từ tab khác");
          performLogout();
        } else if (event.newValue && !isAuthenticated) {
          checkLogin();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const checkLogin = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        // Optimistic UI: Lấy user từ localStorage nếu có
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
           try {
              setUser(JSON.parse(storedUser));
              setIsAuthenticated(true);
           } catch (e) {
              console.log("Failed to parse stored user", e);
           }
        }
        
        try {
          const response = await authApi.getMe();
          if (response.data?.success) {
            const userData = response.data.data.user;
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.log("Token invalid:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLogin();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [performLogout, isAuthenticated]);

  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      const token = localStorage.getItem("accessToken");
      if (!token && isAuthenticated) {
        console.log("Token không còn trong localStorage");
        performLogout();
      }
    }, 1000);

    return () => clearInterval(checkTokenInterval);
  }, [isAuthenticated, performLogout]);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    if (response.data?.success) {
      const userData = response.data.data.user;
      localStorage.setItem("accessToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      if (channelRef.current) {
        channelRef.current.postMessage({ type: "LOGIN" });
      }

      return { success: true, user: userData };
    }
    throw new Error("Đăng nhập thất bại");
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      if (response.data?.success) {
        const userData = response.data.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
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
