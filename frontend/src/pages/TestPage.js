import React, { useState } from 'react';
import { prAPI } from '../services/api';

const TestPage = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test with a known public repo
      const response = await prAPI.getRepoPRs('facebook', 'react', 'open', 10);
      setResult(response.data);
      console.log('API Response:', response.data);
    } catch (err) {
      setError(err.response?.data || err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-2xl mb-4">API Test Page</h1>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Testing...' : 'Test Facebook/React API'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-900 text-red-200 rounded">
            <h2 className="font-bold">Error:</h2>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-900 text-green-200 rounded">
            <h2 className="font-bold">Success!</h2>
            <p>Found {result.count} PRs</p>
            <pre className="mt-2 text-xs overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
