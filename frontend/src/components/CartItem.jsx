import React from 'react';
import { useDispatch } from 'react-redux';
import { Trash2, Plus, Minus } from 'lucide-react';
import { updateQuantity, removeFromCart } from '../redux/cartSlice.js';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleIncrement = () => {
    dispatch(updateQuantity({ id: item._id || item.id, qty: item.qty + 1 }));
  };

  const handleDecrement = () => {
    if (item.qty === 1) {
      dispatch(removeFromCart(item._id || item.id));
    } else {
      dispatch(updateQuantity({ id: item._id || item.id, qty: item.qty - 1 }));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item._id || item.id));
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 0',
      borderBottom: '1px solid var(--border)'
    }}>
      {/* Item Image */}
      <img
        src={item.image}
        alt={item.name}
        style={{
          width: '70px',
          height: '70px',
          borderRadius: 'var(--radius-md)',
          objectFit: 'cover'
        }}
      />

      {/* Details (Name / Category) */}
      <div style={{ flexGrow: 1 }}>
        <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
          {item.name}
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {item.category}
        </p>
        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', display: 'block', marginTop: '6px' }}>
          ₹{item.price.toFixed(2)} each
        </span>
      </div>

      {/* Adjusters (Quantity widget & Delete button) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Quantity Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          padding: '2px',
          backgroundColor: 'var(--bg-app)'
        }}>
          <button
            onClick={handleDecrement}
            style={{
              color: 'var(--text-muted)',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="qty-btn-subtle"
          >
            <Minus size={12} strokeWidth={2.5} />
          </button>
          
          <span style={{
            fontWeight: '700',
            fontSize: '13px',
            padding: '0 8px',
            minWidth: '18px',
            textAlign: 'center'
          }}>
            {item.qty}
          </span>

          <button
            onClick={handleIncrement}
            style={{
              color: 'var(--text-muted)',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="qty-btn-subtle"
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>
        </div>

        {/* Price total for item */}
        <span style={{ fontSize: '15px', fontWeight: '800', minWidth: '60px', textAlign: 'right' }}>
          ₹{(item.price * item.qty).toFixed(2)}
        </span>

        {/* Delete Button */}
        <button
          onClick={handleRemove}
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center'
          }}
          className="delete-item-btn"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <style>{`
        .qty-btn-subtle:hover {
          background-color: var(--border);
          color: var(--text-main);
        }
        .delete-item-btn:hover {
          background-color: rgba(239, 68, 68, 0.08);
        }
      `}</style>
    </div>
  );
};

export default CartItem;
