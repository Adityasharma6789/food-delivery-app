import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingBag,
  User,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Search,
  ClipboardList,
  Shield,
  Utensils,
  Heart
} from 'lucide-react';
import { logout } from '../redux/authSlice.js';
import { setSearch } from '../redux/foodSlice.js';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { searchText } = useSelector((state) => state.foods);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [bumpCart, setBumpCart] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchText);

  // Sync dark/light theme setting
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme handler
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Cart item animation bump effect
  const totalCartQty = cartItems.reduce((acc, item) => acc + item.qty, 0);
  useEffect(() => {
    if (totalCartQty === 0) return;
    setBumpCart(true);
    const timer = setTimeout(() => setBumpCart(false), 300);
    return () => clearTimeout(timer);
  }, [totalCartQty]);

  // Sync search input
  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    dispatch(setSearch(e.target.value));
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar-glass">
      <div className="container navbar-container">
        {/* Left Side: Logo */}
        <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #ff8c42 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Utensils size={22} />
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Swift<span style={{ color: 'var(--primary)' }}>Bite</span>
          </span>
        </Link>

        {/* Center: Search Bar */}
        <div style={{ position: 'relative', width: '35%', maxWidth: '400px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search delicious dishes..."
            value={localSearch}
            onChange={handleSearchChange}
            className="input-field"
            style={{
              paddingLeft: '44px',
              height: '44px',
              borderRadius: 'var(--radius-full)'
            }}
          />
        </div>

        {/* Right Side: Links & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center'
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Wishlist Link */}
          <Link
            to="/profile"
            style={{
              position: 'relative',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center'
            }}
            title="My Wishlist"
          >
            <Heart size={21} />
            {wishlistItems.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '10px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart Icon Link */}
          <Link
            to="/cart"
            className={`nav-cart-btn ${bumpCart ? 'cart-bump' : ''}`}
            style={{
              position: 'relative',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ShoppingBag size={21} />
            {totalCartQty > 0 && (
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '10px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                {totalCartQty}
              </span>
            )}
          </Link>

          {/* Auth/Profile Menu */}
          {userInfo ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'var(--bg-card)'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-glow)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  {userInfo.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: '600', fontSize: '14px', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userInfo.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    onClick={() => setDropdownOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: '8px',
                    width: '220px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden',
                    zIndex: 100,
                    animation: 'fadeInUp 0.2s ease forwards'
                  }}>
                    {/* Header info */}
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{userInfo.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-all' }}>{userInfo.email}</p>
                    </div>

                    {/* Links */}
                    <div style={{ padding: '4px 0' }}>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '14px'
                        }}
                        className="dropdown-item"
                      >
                        <User size={16} style={{ color: 'var(--text-muted)' }} />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '14px'
                        }}
                        className="dropdown-item"
                      >
                        <ClipboardList size={16} style={{ color: 'var(--text-muted)' }} />
                        <span>My Orders</span>
                      </Link>

                      {userInfo.isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 16px',
                            fontSize: '14px',
                            color: 'var(--primary)'
                          }}
                          className="dropdown-item"
                        >
                          <Shield size={16} />
                          <strong>Admin Dashboard</strong>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '14px',
                          color: '#ef4444',
                          borderTop: '1px solid var(--border)',
                          marginTop: '4px'
                        }}
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="gradient-btn"
              style={{
                padding: '10px 24px',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <User size={16} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
