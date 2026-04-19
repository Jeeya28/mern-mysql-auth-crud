import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmail } from '../api/authApi';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('Verifying your email...');
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyEmail(token);
        setStatus(res.data.message || 'Email verified successfully. You can now log in.');
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed. Please try again later.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verification</h2>
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {status}
          </div>
        )}
        <Link to="/login" className="inline-block mt-4 text-blue-600 hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
