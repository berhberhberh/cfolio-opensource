'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Wallet, Lock, User, Key } from 'lucide-react';

export default function SignIn() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [betaKey, setBetaKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [betaKeyValid, setBetaKeyValid] = useState(false);

  const validateBetaKey = async () => {
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/validate-beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betaKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid beta key');
        return;
      }

      setBetaKeyValid(true);
    } catch (err) {
      setError('Failed to validate beta key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, betaKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Registration successful, but login failed. Please try signing in.');
        setMode('signin');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Wallet size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white">Cryptfolio</h1>
          </div>
          <p className="text-gray-400">Cross-Chain Portfolio Tracker</p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode('signin');
                setError('');
                setBetaKeyValid(false);
              }}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError('');
                setBetaKeyValid(false);
              }}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                mode === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Register
            </button>
          </div>

          {mode === 'register' && !betaKeyValid ? (
            // Beta Key Validation Step
            <div>
              <p className="text-sm text-gray-400 mb-4">
                Enter your beta key to get started
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Beta Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={betaKey}
                      onChange={(e) => setBetaKey(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter beta key"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  onClick={validateBetaKey}
                  disabled={!betaKey || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Validating...' : 'Continue'}
                </button>
              </div>
            </div>
          ) : (
            // Sign In or Registration Form
            <form onSubmit={mode === 'signin' ? handleSignIn : handleRegister}>
              <div className="space-y-4">
                {mode === 'register' && (
                  <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-sm text-green-400">
                    Beta key validated! Create your account below.
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter username"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {mode === 'register' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 6 characters
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? mode === 'signin'
                      ? 'Signing in...'
                      : 'Creating account...'
                    : mode === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
