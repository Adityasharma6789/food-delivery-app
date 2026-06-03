import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogIn, Mail, Lock, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import api from '../services/api.js';
import { authStart, authSuccess, authFail, clearAuthError } from '../redux/authSlice.js';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Redirect location path
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  // If already logged in, redirect away
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
    return () => {
      dispatch(clearAuthError());
    };
  }, [userInfo, navigate, redirect, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    dispatch(authStart());
    try {
      const { data } = await api.post('/auth/login', { email, password });
      dispatch(authSuccess(data));
    } catch (err) {
      dispatch(authFail(err.response?.data?.message || err.message || 'Login failed'));
    }
  };

  // Demo account helper
  const handleQuickLogin = (demoType) => {
    if (demoType === 'user') {
      setEmail('user@example.com');
      setPassword('password123');
    } else {
      setEmail('admin@example.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="page-layout container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh'
    }}>
      <div className="premium-card animate-fade-in-up" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '40px 30px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sign in to continue ordering tasty meals</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="gradient-btn"
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '10px'
            }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Toggle option */}
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--text-muted)',
          marginTop: '24px'
        }}>
          New to SwiftBite?{' '}
          <Link to={`/register?redirect=${redirect}`} style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Create an Account
          </Link>
        </p>

        {/* Separator Line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '24px 0'
        }}>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quick Demo Login</span>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border)' }} />
        </div>

        {/* Demo Fast Login Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            type="button"
            onClick={() => handleQuickLogin('user')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border)',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: 'var(--bg-app)'
            }}
            className="demo-btn"
          >
            <UserCheck size={14} style={{ color: 'var(--primary)' }} />
            <span>Standard User</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border)',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: 'var(--bg-app)'
            }}
            className="demo-btn"
          >
            <ShieldCheck size={14} style={{ color: '#8b5cf6' }} />
            <span>Admin Account</span>
          </button>
        </div>
      </div>
      
      <style>{`
        .demo-btn:hover {
          background-color: var(--bg-card);
          border-color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Login;
