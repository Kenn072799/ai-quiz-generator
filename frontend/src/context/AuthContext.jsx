import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

function decodeUser(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name ?? "",
      role: payload.role,
      language: payload.language ?? "English",
      educationLevel: payload.educationLevel ?? "College",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("token");
    return t ? decodeUser(t) : null;
  });

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(decodeUser(newToken));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Called after a successful PUT /api/auth/settings — swaps to new token
  const updateSettings = (newToken) => {
    login(newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateSettings,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
