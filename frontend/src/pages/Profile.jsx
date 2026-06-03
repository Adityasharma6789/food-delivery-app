import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { User, MapPin, Heart, ShoppingBag, Edit3, CheckCircle2, ClipboardList, Mail } from 'lucide-react';
import api from '../services/api.js';
import { updateAddressSuccess } from '../redux/authSlice.js';
import FoodCard from '../components/FoodCard.jsx';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { orders } = useSelector((state) => state.orders);

  const [address, setAddress] = useState(userInfo?.address || '');
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/profile');
    }
  }, [userInfo, navigate]);

  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      const { data } = await api.put('/auth/profile/address', { address });
      dispatch(updateAddressSuccess(data.address));
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Delivery address updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to update address' });
    } finally {
      setUpdating(false);
    }
  };

  if (!userInfo) return null;

  return (
    <div className="page-layout container animate-fade-in">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px',
        alignItems: 'flex-start'
      }} className="profile-grid">
        
        {/* Left Side: Profile Information Card */}
        <div className="premium-card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '32px',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {userInfo.name.charAt(0).toUpperCase()}
            </div>
            
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{userInfo.name}</h2>
            <p style={{
              backgroundColor: userInfo.isAdmin ? 'rgba(139, 92, 246, 0.1)' : 'var(--primary-glow)',
              color: userInfo.isAdmin ? '#8b5cf6' : 'var(--primary)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              marginTop: '8px',
              letterSpacing: '0.5px'
            }}>
              {userInfo.isAdmin ? '👑 Administrator' : '🍔 Member Customer'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            {/* Email details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Mail size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</p>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{userInfo.email}</p>
              </div>
            </div>

            {/* Address Details */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <MapPin size={18} style={{ color: 'var(--text-muted)', marginTop: '4px' }} />
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Shipping Location</p>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleAddressUpdate} style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="input-field"
                      rows={3}
                      style={{ fontSize: '14px' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="submit"
                        disabled={updating}
                        className="gradient-btn"
                        style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '12px', boxShadow: 'none' }}
                      >
                        {updating ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddress(userInfo.address);
                          setIsEditing(false);
                        }}
                        style={{ padding: '8px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '700' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p style={{ fontSize: '14px', fontWeight: '600', lineHeight: '1.4', marginTop: '4px', color: userInfo.address ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {userInfo.address || 'No default address registered. Edit to add one!'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Quick Messages */}
            {message && (
              <div style={{
                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                color: '#22c55e',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '10px'
              }}>
                <CheckCircle2 size={14} />
                <span>{message.text}</span>
              </div>
            )}
          </div>
          
          {/* Quick shortcuts buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '24px' }}>
            <Link
              to="/orders"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                fontWeight: '700',
                fontSize: '14px'
              }}
              className="profile-btn"
            >
              <ClipboardList size={16} />
              <span>Browse Order History</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Wishlist Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Heart size={22} fill="var(--primary)" stroke="none" />
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>
              Your Wishlist ({wishlistItems.length})
            </h3>
          </div>

          {wishlistItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Heart size={36} style={{ color: 'var(--text-muted)' }} />
              <h4 style={{ fontWeight: '700' }}>Wishlist is Empty</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px' }}>
                Tap the heart button on food menu items to save your favorite dishes here for quick orders!
              </p>
              <Link to="/" className="gradient-btn" style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)', fontSize: '13px' }}>
                Browse Food items
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px'
            }}>
              {wishlistItems.map((food) => (
                <div key={food._id || food.id}>
                  <FoodCard food={food} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      
      <style>{`
        @media (min-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr 2.2fr;
          }
        }
        .profile-btn:hover {
          background-color: var(--border);
        }
      `}</style>
    </div>
  );
};

export default Profile;
