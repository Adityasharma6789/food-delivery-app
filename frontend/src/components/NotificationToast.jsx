import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Bell, X, CheckCircle, ShieldAlert, Sparkles, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationToast = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [activeToast, setActiveToast] = useState(null);
  const navigate = useNavigate();

  // Play a browser-synthesized chime using AudioContext
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Friendly chime pitches: G5 and C6
      osc1.frequency.setValueAtTime(783.99, ctx.currentTime);
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc1.start();
      osc2.start(ctx.currentTime + 0.1);
      osc1.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (err) {
      console.warn('AudioContext sound blocked or unsupported by browser:', err);
    }
  };

  useEffect(() => {
    if (!userInfo) return;

    const socketUrl = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://food-delivery-app-backend.onrender.com');
    const socket = io(socketUrl);

    console.log('📡 Client push-notifications listening on socket:', socketUrl);

    socket.on('globalOrderStatusUpdate', (data) => {
      const currentUserId = userInfo._id || userInfo.id;
      
      // Match the updated order with the active user
      if (data.userId?.toString() === currentUserId?.toString()) {
        playNotificationChime();
        setActiveToast({
          orderId: data.orderId,
          status: data.status,
          message: `Your Order #${data.orderId.substr(-6).toUpperCase()} is now ${data.status}! 🍕`
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userInfo]);

  // Auto-dismiss toast
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  if (!activeToast) return null;

  return (
    <div
      onClick={() => {
        navigate(`/orders/${activeToast.orderId}`);
        setActiveToast(null);
      }}
      style={{
        position: 'fixed',
        top: '25px',
        right: '25px',
        width: '90%',
        maxWidth: '350px',
        backgroundColor: 'rgba(25, 25, 35, 0.85)',
        backdropFilter: 'blur(16px)',
        borderLeft: '4px solid var(--primary)',
        borderTop: '1.5px solid var(--border)',
        borderBottom: '1.5px solid var(--border)',
        borderRight: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        zIndex: 1001,
        animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <div style={{
        backgroundColor: 'var(--primary-glow)',
        color: 'var(--primary)',
        padding: '10px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Bell size={20} className="animate-float" />
      </div>

      <div style={{ flexGrow: 1 }}>
        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>Order Updated! 🛵</h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.3' }}>
          {activeToast.message}
        </p>
        <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700', marginTop: '6px', display: 'inline-block' }}>
          Click to Track order status &rarr;
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation(); // Avoid navigating
          setActiveToast(null);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px',
          alignSelf: 'flex-start'
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
