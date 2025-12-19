import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Github, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [error, setError] = React.useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    if (errorParam) {
      const errorMessages = {
        no_code: 'Authorization code not received from GitHub',
        no_token: 'Failed to obtain access token',
        auth_failed: messageParam || 'Authentication failed. Please try again.',
      };
      setError(errorMessages[errorParam] || 'Authentication error occurred');
    }
  }, [searchParams]);

  const handleLogin = () => {
    // Redirect directly to backend OAuth initiation endpoint
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    window.location.href = `${backendUrl}/api/auth/github`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-2xl">
              <TrendingUp size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">PRLens</h1>
          <p className="text-gray-400 text-lg">
            Pull Request Quality & Risk Analyzer
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-400 mb-6">
            Sign in with GitHub to analyze your pull requests
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            <Github size={20} />
            <span>Sign in with GitHub</span>
          </button>

          <p className="text-gray-500 text-sm text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-blue-400 font-semibold text-lg">Risk Score</div>
            <div className="text-gray-400 text-sm">Heuristic-based</div>
          </div>
          <div>
            <div className="text-blue-400 font-semibold text-lg">Analytics</div>
            <div className="text-gray-400 text-sm">Repo insights</div>
          </div>
          <div>
            <div className="text-blue-400 font-semibold text-lg">Real-time</div>
            <div className="text-gray-400 text-sm">GitHub data</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
