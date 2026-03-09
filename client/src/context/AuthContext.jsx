import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { roleFromEmail } from '../config/roleEmailRules';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        const resolvedRole = roleFromEmail(res.data.user?.email);
        setUser(res.data.user ? { ...res.data.user, role: resolvedRole } : null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const resolvedRole = roleFromEmail(res.data.data?.email ?? email);
    setUser(res.data.data ? { ...res.data.data, role: resolvedRole } : null);
    return res.data;
  };

  const logout = async () => {
    await api.get('/auth/logout');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);