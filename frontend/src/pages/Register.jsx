import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, User, Mail, Lock, MapPin, AlertCircle } from 'lucide-react';
import api from '../services/api.js';
import { authStart, authSuccess, authFail, clearAuthError } from '../redux/authSlice.js';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

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
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    dispatch(authStart());
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        address
      });
      dispatch(authSuccess(data));
    } catch (err) {
      dispatch(authFail(err.response?.data?.message || err.message || 'Registration failed'));
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
        maxHeight: '90vh',
        maxWidth: '480px',
        padding: '30px 25px',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Join SwiftBite for lightning-fast premium delivery</p>
        </div>

        {/* Display Error Message */}
        {(error || localError) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '18px',
            fontSize: '13px'
          }}>
            <AlertCircle size={16} />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Full Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                placeholder="Alex Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: '44px', paddingRight: '12px', height: '42px' }}
              />
            </div>
          </div>

          {/* Email Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: '44px', paddingRight: '12px', height: '42px' }}
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Default Shipping Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                placeholder="123 Main St, New York, NY"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: '44px', paddingRight: '12px', height: '42px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-field"
                style={{ paddingLeft: '44px', paddingRight: '12px', height: '42px' }}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: '44px', paddingRight: '12px', height: '42px' }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="gradient-btn"
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              height: '44px'
            }}
          >
            <UserPlus size={16} />
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginTop: '20px'
        }}>
          Already have an account?{' '}
          <Link to={`/login?redirect=${redirect}`} style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
