import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');

      console.log('AuthCallback - token:', token ? 'present' : 'missing');
      console.log('AuthCallback - user:', userParam ? 'present' : 'missing');

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          console.log('Parsed user:', user);
          login(token, user);
          navigate('/dashboard');
        } catch (error) {
          console.error('Error parsing user data:', error);
          navigate('/login?error=auth_failed&message=' + encodeURIComponent('Failed to parse user data'));
        }
      } else {
        console.error('Missing token or user param');
        navigate('/login?error=no_token');
      }
    };

    handleCallback();
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
