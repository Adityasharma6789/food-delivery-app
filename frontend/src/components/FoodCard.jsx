import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Plus, Minus, Heart } from 'lucide-react';
import { addToCart, updateQuantity, removeFromCart } from '../redux/cartSlice.js';
import { toggleWishlist } from '../redux/wishlistSlice.js';

const FoodCard = ({ food }) => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // Check if item is wishlisted
  const isWishlisted = wishlistItems.some((item) => item._id === food._id || item.id === food._id);

  // Find if this item is already in the cart
  const cartItem = cartItems.find((item) => item._id === food._id || item.id === food._id);
  const quantity = cartItem ? cartItem.qty : 0;

  const handleAdd = () => {
    dispatch(addToCart({ ...food, qty: 1 }));
  };

  const handleIncrement = () => {
    dispatch(updateQuantity({ id: food._id || food.id, qty: quantity + 1 }));
  };

  const handleDecrement = () => {
    if (quantity === 1) {
      dispatch(removeFromCart(food._id || food.id));
    } else {
      dispatch(updateQuantity({ id: food._id || food.id, qty: quantity - 1 }));
    }
  };

  return (
    <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Food Image Wrapper */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '68%', overflow: 'hidden' }}>
        <img
          src={food.image}
          alt={food.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-slow)'
          }}
          className="food-card-img"
        />

        {/* Dietary Veg/Non-Veg Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 2
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: food.isVeg ? '#22c55e' : '#ef4444'
          }} />
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#1f2937' }}>
            {food.isVeg ? 'VEG' : 'NON-VEG'}
          </span>
        </div>

        {/* Star Rating Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(4px)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#fff',
          zIndex: 2
        }}>
          <Star size={12} fill="#ffb800" stroke="none" />
          <span style={{ fontSize: '11px', fontWeight: '700' }}>{food.rating.toFixed(1)}</span>
        </div>

        {/* Floating Heart Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dispatch(toggleWishlist(food));
          }}
          style={{
            position: 'absolute',
            top: '46px',
            right: '12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 2,
            transition: 'transform var(--transition-fast)'
          }}
          className="wishlist-heart-btn"
        >
          <Heart
            size={14}
            fill={isWishlisted ? '#ef4444' : 'none'}
            stroke={isWishlisted ? 'none' : 'var(--text-main)'}
          />
        </button>
      </div>

      {/* Card Content details */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px', lineHeight: '1.3' }}>
          {food.name}
        </h3>
        
        <p style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          lineHeight: '1.5',
          marginBottom: '20px',
          flexGrow: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {food.description}
        </p>

        {/* Price & Action button footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          <span style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-main)' }}>
            ₹{food.price.toFixed(2)}
          </span>

          {quantity > 0 ? (
            /* Quantity Adjuster Widget */
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--radius-full)',
              color: '#fff',
              padding: '4px',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <button
                onClick={handleDecrement}
                style={{
                  color: '#fff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                className="qty-btn"
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              
              <span style={{
                fontWeight: '700',
                fontSize: '14px',
                padding: '0 8px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {quantity}
              </span>

              <button
                onClick={handleIncrement}
                style={{
                  color: '#fff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                className="qty-btn"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            /* Default add button */
            <button
              onClick={handleAdd}
              className="gradient-btn"
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: 'none'
              }}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Inject custom card zoom style rule */}
      <style>{`
        .premium-card:hover .food-card-img {
          transform: scale(1.05);
        }
        .qty-btn:hover {
          background-color: rgba(255,255,255,0.15);
        }
      `}</style>
    </div>
  );
};

export default FoodCard;
