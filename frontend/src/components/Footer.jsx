import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      padding: '60px 0 30px 0',
      marginTop: 'auto',
      transition: 'background-color var(--transition-normal), border var(--transition-normal)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* About column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #ff8c42 100%)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Utensils size={18} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Swift<span style={{ color: 'var(--primary)' }}>Bite</span>
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Delivering gourmet restaurant meals directly to your doorstep in 30 minutes or less. Experience the premium standard in food delivery.
          </p>
        </div>

        {/* Categories column */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Quick Categories</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <li><Link to="/" style={{ color: 'inherit' }}>Juicy Burgers</Link></li>
            <li><Link to="/" style={{ color: 'inherit' }}>Stone Baked Pizza</Link></li>
            <li><Link to="/" style={{ color: 'inherit' }}>Fresh Sushi Rolls</Link></li>
            <li><Link to="/" style={{ color: 'inherit' }}>Delectable Desserts</Link></li>
          </ul>
        </div>

        {/* Contact column */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Contact SwiftBite</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} />
              <span>+91 9257570348</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} />
              <span>aditya.sharma13804@gmail.com</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14} />
              <span>789 Foodie SwiftBite, jaipur district</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Footer banner */}
      <div className="container" style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '24px',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-muted)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span>&copy; {new Date().getFullYear()} SwiftBite Inc. All rights reserved.</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          Crafted with <Heart size={12} fill="#ef4444" stroke="none" /> for premium taste experiences.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
