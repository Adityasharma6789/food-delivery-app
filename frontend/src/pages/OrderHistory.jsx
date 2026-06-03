import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Package, ClipboardCheck, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import api from '../services/api.js';
import { orderStart, orderListSuccess, orderFail } from '../redux/orderSlice.js';

const OrderHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orders, loading, error } = useSelector((state) => state.orders);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/orders');
      return;
    }

    const fetchMyOrders = async () => {
      dispatch(orderStart());
      try {
        const { data } = await api.get('/orders/myorders');
        dispatch(orderListSuccess(data));
      } catch (err) {
        dispatch(orderFail(err.response?.data?.message || err.message || 'Failed to load order history'));
      }
    };

    fetchMyOrders();
  }, [userInfo, navigate, dispatch]);

  if (loading) {
    return (
      <div className="page-layout container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
          <p style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Retrieving your order history...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
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
          <Package size={40} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>No Orders Yet</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '340px', fontSize: '14px' }}>
          You haven't placed any orders with SwiftBite yet. Start ordering delicious hot meals today!
        </p>
        <Link to="/" className="gradient-btn" style={{
          padding: '12px 28px',
          borderRadius: 'var(--radius-full)',
          fontWeight: '600'
        }}>
          Browse the Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="page-layout container animate-fade-in">
      <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '30px' }}>Your Order History</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
        {orders.map((order) => (
          <div key={order._id || order.id} className="premium-card animate-fade-in-up" style={{ padding: '24px' }}>
            
            {/* Header info row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '16px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Order ID</span>
                  <p style={{ fontSize: '14px', fontWeight: '800' }}>
                    #{order._id?.substr(-8).toUpperCase() || order.id?.substr(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Date Placed</span>
                  <p style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                    <Calendar size={13} />
                    <span>{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Total Price</span>
                  <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
                    ₹{order.totalPrice?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <div style={{
                backgroundColor: order.status === 'Delivered' ? 'rgba(34, 197, 94, 0.08)' : 'var(--primary-glow)',
                color: order.status === 'Delivered' ? '#22c55e' : 'var(--primary)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontWeight: '700',
                fontSize: '12px'
              }}>
                {order.status}
              </div>
            </div>

            {/* Thumbnail items list row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', flexGrow: 1 }}>
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover',
                        border: '1px solid var(--border)'
                      }}
                      title={item.name}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: '-6px',
                      right: '-6px',
                      backgroundColor: 'var(--text-main)',
                      color: 'var(--bg-card)',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '10px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.qty}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action track button */}
              <Link
                to={`/orders/${order._id || order.id}`}
                className="gradient-btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'none'
                }}
              >
                <span>Track Order</span>
                <ArrowRight size={12} />
              </Link>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
