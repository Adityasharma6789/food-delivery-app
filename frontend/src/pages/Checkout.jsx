import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ShoppingBag, ShieldCheck, CreditCard as CardIcon } from 'lucide-react';
import api from '../services/api.js';
import { clearCart } from '../redux/cartSlice.js';
import { orderStart, orderCreateSuccess, orderFail } from '../redux/orderSlice.js';
import { updateAddressSuccess } from '../redux/authSlice.js';
import AddressPickerMap from '../components/AddressPickerMap.jsx';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, promoDiscountPercentage } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.orders);

  // Form Fields
  const [address, setAddress] = useState(userInfo?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  
  // Card mock details
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [saveAddress, setSaveAddress] = useState(true);

  // Interactive Mock Payment Modals
  const [showCardOtpModal, setShowCardOtpModal] = useState(false);
  const [showUpiQrModal, setShowUpiQrModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Calculation parameters
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = subtotal * (promoDiscountPercentage / 100);
  const deliveryFee = subtotal > 300 ? 0 : 40;
  const taxAmount = (subtotal - discountAmount) * 0.05;
  const grandTotal = subtotal - discountAmount + deliveryFee + taxAmount;

  // Protect path: must be logged in and have items in the cart
  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/checkout');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [userInfo, cartItems, navigate]);

  // Unified final order submit method
  const executeOrderPlacement = async () => {
    dispatch(orderStart());
    try {
      // 1. Save user address if requested
      if (saveAddress && address !== userInfo.address) {
        await api.put('/auth/profile/address', { address });
        dispatch(updateAddressSuccess(address));
      }

      // 2. Submit order to backend
      const orderPayload = {
        orderItems: cartItems,
        shippingAddress: address,
        paymentMethod,
        itemsPrice: subtotal - discountAmount,
        taxPrice: taxAmount,
        deliveryFee,
        totalPrice: grandTotal
      };

      const { data } = await api.post('/orders', orderPayload);
      
      // 3. Clear cart and dispatch order creation success
      dispatch(orderCreateSuccess(data));
      dispatch(clearCart());
      
      // 4. Hide active payment modals
      setShowCardOtpModal(false);
      setShowUpiQrModal(false);
      
      // 5. Navigate to order status tracking page
      navigate(`/orders/${data._id || data.id}`);
    } catch (err) {
      dispatch(orderFail(err.response?.data?.message || err.message || 'Failed to place order'));
      setShowCardOtpModal(false);
      setShowUpiQrModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address) return;

    // Trigger appropriate payment flow
    if (paymentMethod === 'Card') {
      setOtpCode('');
      setOtpError('');
      setShowCardOtpModal(true);
    } else if (paymentMethod === 'UPI') {
      setShowUpiQrModal(true);
    } else {
      // COD places order directly
      executeOrderPlacement();
    }
  };

  return (
    <div className="page-layout container animate-fade-in">
      <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '30px' }}>Checkout</h2>

      <form onSubmit={handleSubmit} style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px',
        alignItems: 'flex-start'
      }} className="checkout-grid">
        {/* Left column: Checkout inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Shipping Address panel */}
          <div className="premium-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} style={{ color: 'var(--primary)' }} />
              <span>1. Delivery Address</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <textarea
                placeholder="Enter complete shipping address (building, street, city, postal code)..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="input-field"
                rows={3}
                style={{ resize: 'vertical' }}
              />

              <AddressPickerMap onAddressSelect={(addr) => setAddress(addr)} defaultAddress={address} />
              
              {/* Optional save address checkbox */}
              {address !== userInfo?.address && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                  />
                  <span>Save this as my default delivery address</span>
                </label>
              )}
            </div>
          </div>

          {/* Payment Method Selector panel */}
          <div className="premium-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} style={{ color: 'var(--primary)' }} />
              <span>2. Payment Method</span>
            </h3>

            {/* Selector Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {['Card', 'UPI', 'COD'].map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--primary-glow)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}
                  >
                    {method === 'Card' && '💳 Card'}
                    {method === 'UPI' && '📱 UPI'}
                    {method === 'COD' && '💵 Cash on Delivery'}
                  </button>
                );
              })}
            </div>

            {/* Conditional Mock Payment fields */}
            {paymentMethod === 'Card' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '20px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)'
              }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mock Card Details</p>
                
                {/* Card Number */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Card Number</label>
                  <div style={{ position: 'relative' }}>
                    <CardIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '38px', height: '40px', fontSize: '14px', backgroundColor: 'var(--bg-card)' }}
                      required
                    />
                  </div>
                </div>

                {/* Expiry / CVV Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="input-field"
                      style={{ height: '40px', fontSize: '14px', backgroundColor: 'var(--bg-card)' }}
                      required
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="input-field"
                      style={{ height: '40px', fontSize: '14px', backgroundColor: 'var(--bg-card)' }}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                You will be prompted to pay via your default UPI application on your device.
              </p>
            )}

            {paymentMethod === 'COD' && (
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                Please keep cash handy upon delivery. Additional fees do not apply.
              </p>
            )}
          </div>
        </div>

        {/* Right column: Items & Price breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Order Details list */}
          <div className="premium-card" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <ShoppingBag size={18} style={{ color: 'var(--primary)' }} />
              <span>Review Your Items</span>
            </h3>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <div key={item._id || item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <p style={{ fontWeight: '700' }}>{item.name}</p>
                      <p style={{ color: 'var(--text-muted)' }}>Qty: {item.qty} &bull; ₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: '700' }}>₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              {promoDiscountPercentage > 0 && (
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', color: '#22c55e' }}>
                  <span>Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>

              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Tax (5%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <span style={{ fontWeight: '800', fontSize: '16px' }}>Total Price</span>
              <span style={{ fontWeight: '800', fontSize: '20px', color: 'var(--primary)' }}>₹{grandTotal.toFixed(2)}</span>
            </div>

            {/* Secure Checkmark note */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              color: '#22c55e',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              marginBottom: '20px',
              fontWeight: '600'
            }}>
              <ShieldCheck size={16} />
              <span>Secure Checkout Mock Guarantee</span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                fontSize: '15px'
              }}
            >
              {loading ? 'Processing Order...' : `Place Order - ₹${grandTotal.toFixed(2)}`}
            </button>
            
            {error && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '10px', textAlign: 'center', fontWeight: '500' }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </form>

      {/* UPI QR Payment Modal */}
      {showUpiQrModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease forwards'
        }}>
          <div className="premium-card" style={{
            width: '90%',
            maxWidth: '380px',
            padding: '30px',
            backgroundColor: 'var(--bg-card)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>📱 UPI Instant Pay</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
              Scan the QR Code using Google Pay, PhonePe, Paytm, or BHIM to authorize this transaction.
            </p>

            {/* QR Code Container */}
            <div style={{
              backgroundColor: '#fff',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <svg width="160" height="160" viewBox="0 0 29 29" style={{ display: 'block' }}>
                <path fill="#000" d="M0 0h7v7H0zm1 1v5h5V1zm8 0h3v1h-3zm4 0h1v1h-1zm2 0h1v3h-1zm2 0h3v1h-3zm4 0h3v7h-7V0zm1 1v5h5V1zm-13 2h2v1h-2zm2 0h1v1h-1zm6 0h1v1h-1zm-6 2h1v1h-1zm2 0h1v1h-1zm3 0h1v2h-1zm-9 3h7v7H0zm1 1v5h5V9zm8 0h1v1h-1zm2 0h1v1h-1zm4 0h3v1h-3zm-5 2h1v1h-1zm2 0h2v1h-2zm4 0h1v3h-1zm-9 1h1v1h-1zm3 0h1v1h-1zm-7 2h2v1H9zm2 0h1v1h-1zm2 0h1v2h-1zm5 0h2v1h-2zm-9 2h1v1H9zm6 0h2v1h-2zm3 0h1v1h-1zm5 0h1v1h-1zm-11 2h3v1h-3zm4 0h1v1h-1zm2 0h3v1h-3z" />
              </svg>
            </div>

            <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>
              Amount to Pay: <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              UPI ID: <strong style={{ color: 'var(--text-main)' }}>swiftbite@upi</strong>
            </p>

            <button
              onClick={executeOrderPlacement}
              className="gradient-btn"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: '700'
              }}
            >
              Simulate Payment Success
            </button>

            <button
              type="button"
              onClick={() => setShowUpiQrModal(false)}
              style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '14px', textDecoration: 'underline' }}
            >
              Cancel Payment
            </button>
          </div>
        </div>
      )}

      {/* Card OTP Verification Modal */}
      {showCardOtpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease forwards'
        }}>
          <div className="premium-card" style={{
            width: '90%',
            maxWidth: '380px',
            padding: '30px',
            backgroundColor: 'var(--bg-card)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>🔒 3D Secure Verification</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
              A mock One-Time Password (OTP) has been sent to your phone. Enter the code to authorize transaction of <strong>₹{grandTotal.toFixed(2)}</strong>.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (otpCode === '123456' || otpCode === '1234') {
                executeOrderPlacement();
              } else {
                setOtpError('Invalid OTP. Use demo code "123456"');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Enter OTP (e.g. 123456)"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="input-field"
                style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px', fontWeight: '700', height: '44px' }}
                required
                maxLength={6}
              />

              {otpError && (
                <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600' }}>{otpError}</p>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setOtpCode('123456')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: 'var(--bg-app)'
                  }}
                >
                  Auto-fill OTP
                </button>
                <button
                  type="submit"
                  className="gradient-btn"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    boxShadow: 'none'
                  }}
                >
                  Verify & Pay
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => setShowCardOtpModal(false)}
                style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '14px', textDecoration: 'underline' }}
              >
                Cancel Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1.6fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
