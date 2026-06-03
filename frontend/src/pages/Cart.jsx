import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Ticket, Percent, Trash2, ArrowRight, Tag } from 'lucide-react';
import CartItem from '../components/CartItem.jsx';
import { applyPromo, removePromo, clearCart } from '../redux/cartSlice.js';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, promoCode, promoDiscountPercentage } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // 1. Math calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = subtotal * (promoDiscountPercentage / 100);
  
  // Delivery Fee is ₹40, but FREE for orders over ₹300
  const deliveryFee = subtotal > 300 ? 0 : 40;
  const taxAmount = (subtotal - discountAmount) * 0.05; // 5% GST
  const grandTotal = subtotal - discountAmount + deliveryFee + taxAmount;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    if (promoInput.toUpperCase() === 'SWIFT20') {
      dispatch(applyPromo(promoInput));
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code. Try "SWIFT20"');
    }
  };

  const handleCheckout = () => {
    if (!userInfo) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-layout container animate-fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-glow)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShoppingCart size={40} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '340px', fontSize: '14px' }}>
          Looks like you haven't added anything to your cart yet. Head back to the menu to explore gourmet dishes!
        </p>
        <Link to="/" className="gradient-btn" style={{
          padding: '12px 28px',
          borderRadius: 'var(--radius-full)',
          fontWeight: '600'
        }}>
          Explore Delicious Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="page-layout container animate-fade-in">
      <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '30px' }}>Your Cart</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px',
        alignItems: 'flex-start'
      }} className="cart-grid">
        {/* Left Side: Cart Items List */}
        <div className="premium-card" style={{ padding: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '16px',
            marginBottom: '10px'
          }}>
            <span style={{ fontWeight: '700', fontSize: '18px' }}>
              Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
            </span>
            <button
              onClick={() => dispatch(clearCart())}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <Trash2 size={14} />
              <span>Clear Cart</span>
            </button>
          </div>

          <div>
            {cartItems.map((item) => (
              <CartItem key={item._id || item.id} item={item} />
            ))}
          </div>
          
          {/* Back link */}
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--primary)',
            fontWeight: '600',
            fontSize: '14px',
            marginTop: '24px'
          }}>
            &larr; Add more items
          </Link>
        </div>

        {/* Right Side: Bill Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Promo code card */}
          <div className="premium-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket size={18} style={{ color: 'var(--primary)' }} />
              <span>Apply Promo Code</span>
            </h3>

            {promoCode ? (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                border: '1.5px dashed #22c55e',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e' }}>
                  <Tag size={16} />
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '14px' }}>{promoCode} Applied</p>
                    <p style={{ fontSize: '11px' }}>{promoDiscountPercentage}% discount on food subtotal</p>
                  </div>
                </div>
                <button
                  onClick={() => dispatch(removePromo())}
                  style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Enter code e.g. SWIFT20"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="input-field"
                  style={{ textTransform: 'uppercase', height: '42px' }}
                />
                <button type="submit" className="gradient-btn" style={{
                  padding: '0 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  boxShadow: 'none',
                  whiteSpace: 'nowrap'
                }}>
                  Apply
                </button>
              </form>
            )}

            {promoError && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '500' }}>
                {promoError}
              </p>
            )}

            {!promoCode && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-app)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                marginTop: '14px'
              }}>
                <Percent size={14} style={{ color: 'var(--primary)' }} />
                <span>Tip: Use coupon <strong style={{ color: 'var(--text-main)' }}>SWIFT20</strong> for 20% off.</span>
              </div>
            )}
          </div>

          {/* Pricing breakdown card */}
          <div className="premium-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>
              {/* Subtotal */}
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Food Subtotal</span>
                <span style={{ fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Promo Discount */}
              {promoCode && (
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', color: '#22c55e' }}>
                  <span>Discount ({promoDiscountPercentage}%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Delivery Fee */}
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span style={{ color: '#22c55e', fontWeight: '700' }}>FREE</span>
                ) : (
                  <span style={{ fontWeight: '600' }}>₹{deliveryFee.toFixed(2)}</span>
                )}
              </div>
              
              {/* Delivery free tier tips */}
              {deliveryFee > 0 && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '-4px' }}>
                  Add ₹{(300 - subtotal).toFixed(2)} more for FREE delivery!
                </p>
              )}

              {/* Tax */}
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sales Tax (5%)</span>
                <span style={{ fontWeight: '600' }}>₹{taxAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '30px'
            }}>
              <span style={{ fontWeight: '800', fontSize: '18px' }}>Total Price</span>
              <span style={{ fontWeight: '800', fontSize: '24px', color: 'var(--primary)' }}>
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Action button */}
            <button
              onClick={handleCheckout}
              className="gradient-btn"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .cart-grid {
            grid-template-columns: 1.6fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;
