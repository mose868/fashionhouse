import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Configure axios to dynamically pick the backend URL.
// Priority:
// 1. Use REACT_APP_API_BASE if provided (allows manual override / production config).
// 2. If the app is served from an *.ngrok-free.app origin, point to the same origin.
// 3. Otherwise fall back to '' so CRA dev proxy (localhost:3000 -> 5010) is used.
axios.defaults.withCredentials = true;
// Set a sane default timeout so failed requests don't hang the UI forever
axios.defaults.timeout = 10000; // 10s

const detectBaseURL = () => {
  console.log('Detecting baseURL...');
  console.log('REACT_APP_API_BASE:', process.env.REACT_APP_API_BASE);
  if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;
  
  // Use proxy for development
  console.log('Using proxy (empty baseURL)');
  return '';
};

const detectedBaseURL = detectBaseURL();
console.log('Final axios baseURL:', detectedBaseURL);
axios.defaults.baseURL = detectedBaseURL;

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data,
              token,
            },
          });
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password, verificationCode) => {
    try {
      console.log('AuthContext: Starting login for', email);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('AuthContext: Making API request to /api/auth/login');
      const payload = {
        email,
        password,
      };
      if (verificationCode) {
        payload.verificationCode = verificationCode;
      }

      const response = await axios.post('/api/auth/login', payload);

      console.log('AuthContext: Login API response received', response.status);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data,
      });

      toast.success('Login successful!');
      console.log('AuthContext: Login completed successfully');
      return response.data;
    } catch (error) {
      console.error('AuthContext: Login failed', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      dispatch({ type: 'AUTH_ERROR' });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {
      // ignore network errors – cookie will be cleared client-side anyway
    }
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const value = {
    ...state,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 