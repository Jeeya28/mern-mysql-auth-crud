import { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // login stores token and merges user data (supports profile updates)
  const login = (data) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    // merge: if only user is passed (e.g. after profile update), preserve token
    setUser((prev) => ({ ...prev, ...data.user }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        setUser(res.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);