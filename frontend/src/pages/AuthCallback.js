import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  // A login code can only be redeemed once; React StrictMode runs effects
  // twice in development, so make sure we only try once.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const loginCode = searchParams.get('login_code');
    if (!loginCode) {
      navigate('/login?error=no_token');
      return;
    }

    authAPI
      .exchangeLoginCode(loginCode)
      .then(({ data }) => {
        login(data.token, data.user);
        // Drop the code from the address bar and history.
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        navigate('/login?error=auth_failed&message=' + encodeURIComponent('Login link expired. Please sign in again.'));
      });
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
        <p className="text-white text-lg">Completing authentication...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
