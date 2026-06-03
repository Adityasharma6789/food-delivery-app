import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Search, SlidersHorizontal, Leaf, UtensilsCrossed } from 'lucide-react';
import FoodCard from '../components/FoodCard.jsx';
import api from '../services/api.js';
import {
  fetchFoodsStart,
  fetchFoodsSuccess,
  fetchFoodsFail,
  setCategory
} from '../redux/foodSlice.js';

const Home = () => {
  const dispatch = useDispatch();

  const { foods, loading, error, selectedCategory, searchText } = useSelector((state) => state.foods);
  const { userInfo } = useSelector((state) => state.auth);
  
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Fetch restaurants on mount
  useEffect(() => {
    const getRestaurantsData = async () => {
      try {
        const { data } = await api.get('/restaurants');
        setRestaurants(data);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      }
    };
    getRestaurantsData();
  }, []);

  // Fetch recommendations on mount if logged in
  useEffect(() => {
    const getRecommendationsData = async () => {
      if (!userInfo) return;
      try {
        const { data } = await api.get('/foods/recommendations');
        setRecommendations(data);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      }
    };
    getRecommendationsData();
  }, [userInfo]);
  // Category list definitions
  const categories = [
    { name: 'All', emoji: '🍽️', val: '' },
    { name: 'Burgers', emoji: '🍔', val: 'Burgers' },
    { name: 'Pizzas', emoji: '🍕', val: 'Pizzas' },
    { name: 'Sushi', emoji: '🍣', val: 'Sushi' },
    { name: 'Desserts', emoji: '🍰', val: 'Desserts' },
    { name: 'Drinks', emoji: '🥤', val: 'Drinks' }
  ];

  // Fetch food items on query dependencies
  useEffect(() => {
    const getFoodsData = async () => {
      dispatch(fetchFoodsStart());
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (searchText) params.search = searchText;

        const { data } = await api.get('/foods', { params });
        dispatch(fetchFoodsSuccess(data));
      } catch (err) {
        dispatch(fetchFoodsFail(err.response?.data?.message || err.message || 'Failed to fetch menu'));
      }
    };
    
    getFoodsData();
  }, [selectedCategory, searchText, dispatch]);

  // Client-side vegetarian and restaurant filter logic
  let displayedFoods = foods;
  if (vegOnly) {
    displayedFoods = displayedFoods.filter(food => food.isVeg);
  }
  if (selectedRestaurant) {
    displayedFoods = displayedFoods.filter(food => food.restaurant === selectedRestaurant);
  }

  // Handle restaurant card select toggle
  const handleRestaurantSelect = (restaurantName) => {
    if (selectedRestaurant === restaurantName) {
      setSelectedRestaurant(''); // Clear filter
    } else {
      setSelectedRestaurant(restaurantName);
    }
  };

  return (
    <div className="page-layout container animate-fade-in">
      {/* 1. Hero Showcase Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 94, 58, 0.08) 0%, rgba(255, 140, 66, 0.05) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--border)',
        padding: '60px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '40px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          opacity: 0.1,
          filter: 'blur(60px)'
        }} />

        <div style={{ flex: '1 1 500px' }}>
          <span style={{
            backgroundColor: 'var(--primary-glow)',
            color: 'var(--primary)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'inline-block',
            marginBottom: '20px'
          }}>
            ⚡ Lightning Fast Delivery
          </span>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 48px)',
            fontWeight: '800',
            lineHeight: '1.15',
            letterSpacing: '-1px',
            marginBottom: '16px'
          }}>
            Gourmet Meals Delivered To <span className="gradient-text">Your Doorstep</span>
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '16px',
            lineHeight: '1.6',
            maxWidth: '480px',
            marginBottom: '32px'
          }}>
            Satisfy your cravings with premium local menus prepared by top-tier chefs, arriving at your home in under 30 minutes.
          </p>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#menu-catalog" className="gradient-btn" style={{
              padding: '14px 28px',
              borderRadius: 'var(--radius-full)',
              fontWeight: '600'
            }}>
              Order Tasty Food Now
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '20px' }}>⭐</span>
              <span style={{ fontWeight: '700' }}>4.9/5</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>(15k+ Reviews)</span>
            </div>
          </div>
        </div>

        {/* Hero image showcase */}
        <div style={{
          flex: '1 1 300px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }} className="animate-float">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"
            alt="SwiftBite Food Showcase"
            style={{
              width: '100%',
              maxWidth: '380px',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', // Blob shape
              boxShadow: 'var(--shadow-lg)',
              border: '4px solid var(--bg-card)'
            }}
          />
        </div>
      </div>

      {/* Recommended For You Section */}
      {userInfo && recommendations.length > 0 && (
        <div style={{ marginBottom: '45px' }} className="animate-fade-in-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontSize: '24px' }}>✨</span>
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Recommended For You</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '30px',
            marginBottom: '15px'
          }}>
            {recommendations.map((food) => (
              <div key={food._id || food.id}>
                <FoodCard food={food} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW: 2. Browse Restaurants Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px' }}>Featured Restaurants</h2>
        <div style={{
          display: 'flex',
          gap: '20px',
          overflowX: 'auto',
          paddingBottom: '16px',
          scrollbarWidth: 'thin'
        }} className="category-scroll">
          {restaurants.map((res, index) => {
            const isSelected = selectedRestaurant === res.name;
            return (
              <div
                key={index}
                onClick={() => handleRestaurantSelect(res.name)}
                style={{
                  flex: '0 0 240px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: isSelected ? '0 8px 20px rgba(255, 94, 58, 0.15)' : 'var(--shadow-sm)',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                  transition: 'all var(--transition-normal)',
                  overflow: 'hidden'
                }}
                className="restaurant-card"
              >
                {/* Photo */}
                <div style={{ width: '100%', height: '110px', overflow: 'hidden' }}>
                  <img src={res.image} alt={res.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {/* Details */}
                <div style={{ padding: '12px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '2px' }}>{res.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {res.cuisine}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '700' }}>
                    <span style={{ color: '#ffb800' }}>⭐ {res.rating.toFixed(1)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>⏱️ {res.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Menu Catalog Segment */}
      <div id="menu-catalog" style={{ scrollMarginTop: '100px' }}>
        {/* Section Title */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>
              {selectedRestaurant ? `${selectedRestaurant} Menu` : 'Explore Our Menu'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Browse categories and filter dietary preferences</p>
          </div>
          
          {/* Veg Only Toggle switch */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${vegOnly ? '#22c55e' : 'var(--border)'}`,
              backgroundColor: vegOnly ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-card)',
              color: vegOnly ? '#22c55e' : 'var(--text-main)',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            <Leaf size={16} fill={vegOnly ? '#22c55e' : 'none'} />
            <span>Veg Only</span>
          </button>
        </div>

        {/* 3. Category Horizontal Row */}
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '30px',
          scrollbarWidth: 'thin'
        }} className="category-scroll">
          {categories.map((cat, index) => {
            const isSelected = selectedCategory === cat.val;
            return (
              <button
                key={index}
                onClick={() => dispatch(setCategory(cat.val))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--primary-glow)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: '700',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 4px 10px rgba(255, 94, 58, 0.1)' : 'var(--shadow-sm)'
                }}
                className="category-btn"
              >
                <span style={{ fontSize: '18px' }}>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Food Cards Grid catalog */}
        {loading ? (
          /* Loading indicator skeletons */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '30px',
            marginTop: '20px'
          }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="premium-card" style={{ height: '380px', opacity: 0.6, position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--border)' }} />
                <div style={{ padding: '18px' }}>
                  <div style={{ width: '70%', height: '20px', backgroundColor: 'var(--border)', borderRadius: '4px', marginBottom: '12px' }} />
                  <div style={{ width: '90%', height: '14px', backgroundColor: 'var(--border)', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ width: '50%', height: '14px', backgroundColor: 'var(--border)', borderRadius: '4px', marginBottom: '24px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: '60px', height: '24px', backgroundColor: 'var(--border)', borderRadius: '4px' }} />
                    <div style={{ width: '80px', height: '32px', backgroundColor: 'var(--border)', borderRadius: '16px' }} />
                  </div>
                </div>
                {/* Shimmer animation */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  transform: 'translateX(-100%)',
                  animation: 'shimmer 1.5s infinite'
                }} />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error display panel */
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#ef4444',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <RefreshCw size={36} className="animate-spin" />
            <p style={{ fontWeight: '600' }}>{error}</p>
          </div>
        ) : displayedFoods.length === 0 ? (
          /* Empty Menu results */
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <UtensilsCrossed size={48} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>No Dishes Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '360px' }}>
              We couldn't find any dishes matching your filters. Try resetting the filters or modifying your search query!
            </p>
            <button
              onClick={() => {
                dispatch(setCategory(''));
                setVegOnly(false);
              }}
              className="gradient-btn"
              style={{ padding: '10px 24px', borderRadius: 'var(--radius-full)', fontSize: '14px' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Loaded Food catalog grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {displayedFoods.map((food) => (
              <div key={food._id || food.id} className="animate-fade-in-up">
                <FoodCard food={food} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Styles for Shimmer Loading */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .category-scroll::-webkit-scrollbar {
          height: 5px;
        }
        .category-scroll::-webkit-scrollbar-thumb {
          background-color: var(--border);
        }
        .category-btn:hover {
          transform: scale(1.02);
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default Home;
