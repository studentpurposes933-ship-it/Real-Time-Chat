import { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

export default function Login({ onLoginSuccess, configError }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState(configError?.message || '');
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (configError?.isValid === false) {
      setError(configError.message);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Validation for registration
        if (!username.trim()) throw new Error('Username is required.');
        if (!email.trim()) throw new Error('Email is required.');
        if (!password) throw new Error('Password is required.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');

        const user = await registerUser(username, email, password);
        onLoginSuccess(user);
      } else {
        // Validation for login
        if (!email.trim()) throw new Error('Email is required.');
        if (!password) throw new Error('Password is required.');

        const user = await loginUser(email, password);
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      let friendlyMsg = err.message || 'Authentication failed.';

      // Map Firebase Auth codes to friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        friendlyMsg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMsg = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMsg = 'Password must be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMsg = 'Please enter a valid email address.';
      }

      setError(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-badge">
            <span className="logo-icon">💬</span>
          </div>
          <h1>Real-Time Chat</h1>
          <p>{isRegisterMode ? 'Create a new account' : 'Sign in to your account'}</p>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegisterMode && (
            <div className="input-group">
              <label htmlFor="username-input">Username</label>
              <input
                id="username-input"
                type="text"
                placeholder="e.g. Prajesh"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || configError?.isValid === false}
                maxLength={25}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email-input">Email</label>
            <input
              id="email-input"
              type="email"
              placeholder="e.g. prajesh@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || configError?.isValid === false}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password-input">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || configError?.isValid === false}
                required
              />
              <button
                type="button"
                className="btn-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {isRegisterMode && (
            <div className="input-group">
              <label htmlFor="confirm-password-input">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirm-password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || configError?.isValid === false}
                  required
                />
                <button
                  type="button"
                  className="btn-eye-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={isLoading || configError?.isValid === false}
          >
            {isLoading ? (
              <span className="spinner-loader">{isRegisterMode ? 'Creating Account...' : 'Signing In...'}</span>
            ) : isRegisterMode ? (
              'Register'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-toggle-row">
          {isRegisterMode ? (
            <span>
              Already have an account?{' '}
              <button type="button" className="btn-link" onClick={toggleMode}>
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button type="button" className="btn-link" onClick={toggleMode}>
                Register
              </button>
            </span>
          )}
        </div>

        <div className="login-footer">
          <span>Powered by React, Vite & Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
}
