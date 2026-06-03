import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Receipt, ArrowLeft, RefreshCw, Sparkles, Play, ShieldAlert } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../services/api.js';
import OrderProgress from '../components/OrderProgress.jsx';
import RouteMap from '../components/RouteMap.jsx';
import {
  orderStart,
  orderDetailSuccess,
  orderFail,
  updateOrderStatusSuccess
} from '../redux/orderSlice.js';

const OrderTracking = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentOrder, loading, error } = useSelector((state) => state.orders);
  const [advancing, setAdvancing] = useState(false);

  // Fetch order status details on mount or ID changes
  useEffect(() => {
    const fetchOrderDetails = async () => {
      dispatch(orderStart());
      try {
        const { data } = await api.get(`/orders/${id}`);
        dispatch(orderDetailSuccess(data));
      } catch (err) {
        dispatch(orderFail(err.response?.data?.message || err.message || 'Failed to fetch order details'));
      }
    };

    fetchOrderDetails();
  }, [id, dispatch]);

  useEffect(() => {
    if (!id) return;
    const socketUrl = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://food-delivery-app-backend.onrender.com');
    const socket = io(socketUrl);

    console.log(`🔌 OrderTracking connecting to socket: ${socketUrl}`);
    socket.emit('joinOrder', id);

    socket.on('orderStatusUpdated', (updatedOrder) => {
      console.log('⚡ Socket event received: orderStatusUpdated', updatedOrder);
      dispatch(updateOrderStatusSuccess(updatedOrder));
    });

    return () => {
      socket.disconnect();
    };
  }, [id, dispatch]);

  // Handler to simulate status advances
  const handleAdvanceSimulation = async () => {
    setAdvancing(true);
    try {
      const { data } = await api.post(`/orders/${id}/advance`);
      dispatch(updateOrderStatusSuccess(data));
    } catch (err) {
      console.error('Failed to advance order status:', err);
    } finally {
      setAdvancing(false);
    }
  };

  if (loading && !currentOrder) {
    return (
      <div className="page-layout container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
          <p style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Retrieving your order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-layout container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <ShieldAlert size={48} style={{ color: '#ef4444' }} />
        <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Error Loading Order</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{error}</p>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: '600' }}>&larr; Back to menu</Link>
      </div>
    );
  }

  if (!currentOrder) return null;

  return (
    <div className="page-layout container animate-fade-in">
      {/* Back to Home Button */}
      <Link to="/orders" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-muted)',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '24px'
      }}>
        <ArrowLeft size={16} />
        <span>Back to Order History</span>
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px',
        alignItems: 'flex-start'
      }} className="tracking-grid">
        {/* Left Side: Order Status Visualizer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="premium-card" style={{ padding: '30px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '20px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Live Status Tracker
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: '800' }}>
                  Order #{currentOrder._id?.substr(-6).toUpperCase() || currentOrder.id?.substr(-6).toUpperCase()}
                </h2>
              </div>
              <div style={{
                backgroundColor: 'var(--primary-glow)',
                color: 'var(--primary)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                {currentOrder.status}
              </div>
            </div>

            {/* Tracking progress bar */}
            <OrderProgress status={currentOrder.status} />

            {/* Live animated route tracking map */}
            <div style={{ marginTop: '30px', marginBottom: '10px' }}>
              <RouteMap status={currentOrder.status} restaurantName={currentOrder.orderItems?.[0]?.restaurant || 'Partner Outlet'} />
            </div>

            {/* Estimated delivery description */}
            <div style={{
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '30px'
            }}>
              <div style={{ fontSize: '24px' }}>🛵</div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700' }}>
                  {currentOrder.status === 'Delivered' ? 'Delivered successfully!' : 'Estimated Delivery in 20-30 mins'}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {currentOrder.status === 'Placed' && 'Preparing food at the restaurant shortly.'}
                  {currentOrder.status === 'Preparing' && 'Our chef is preparing your fresh meal.'}
                  {currentOrder.status === 'Out for Delivery' && 'Rider is carrying your warm meal.'}
                  {currentOrder.status === 'Delivered' && 'Hope you enjoy your meal! Leave a review.'}
                </p>
              </div>
            </div>
          </div>

          {/* SIMULATOR COMPONENT */}
          <div className="premium-card" style={{
            padding: '24px 30px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(255, 94, 58, 0.05) 100%)',
            border: '1.5px dashed rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', color: '#8b5cf6' }}>
                  <Sparkles size={18} />
                  <span>Developer Testing Simulator</span>
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Click this button to advance delivery status manually and observe dynamic state transitions.
                </p>
              </div>
              
              <button
                onClick={handleAdvanceSimulation}
                disabled={advancing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#8b5cf6',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '600',
                  fontSize: '13px',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                }}
                className="sim-btn"
              >
                <Play size={14} fill="#fff" />
                <span>{advancing ? 'Advancing...' : 'Advance Status'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Order Receipt Receipt Details */}
        <div className="premium-card" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <Receipt size={20} style={{ color: 'var(--primary)' }} />
            <span>Order Summary</span>
          </h3>

          {/* Delivery location info */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: '700', fontSize: '14px' }}>Delivery Address</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                {currentOrder.shippingAddress}
              </p>
            </div>
          </div>

          {/* Items checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Items Ordered</p>
            {currentOrder.orderItems?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span>{item.name} <strong style={{ color: 'var(--text-muted)' }}>x {item.qty}</strong></span>
                <span style={{ fontWeight: '600' }}>₹{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Billing totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery Fee</span>
              <span>{currentOrder.deliveryFee === 0 ? 'FREE' : `₹${currentOrder.deliveryFee.toFixed(2)}`}</span>
            </div>
            
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Sales Tax</span>
              <span>₹{currentOrder.tax?.toFixed(2) || '0.00'}</span>
            </div>

            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Payment Type</span>
              <span>{currentOrder.paymentMethod}</span>
            </div>
          </div>

          {/* Grand Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: '800', fontSize: '16px' }}>Total Amount Paid</span>
            <span style={{ fontWeight: '800', fontSize: '22px', color: 'var(--primary)' }}>
              ₹{currentOrder.totalPrice?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .tracking-grid {
            grid-template-columns: 1.6fr 1fr;
          }
        }
        .sim-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.45);
        }
        .sim-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;
