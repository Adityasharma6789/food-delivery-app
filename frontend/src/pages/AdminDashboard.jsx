import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ClipboardList,
  PlusCircle,
  Shield,
  CheckCircle2,
  RotateCw,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Grid,
  Edit,
  Trash2,
  X,
  Users,
  Utensils,
  CreditCard,
  Search,
  Plus
} from 'lucide-react';
import api from '../services/api.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('analytics');
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  // Loading states
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  
  // Feedback status
  const [feedback, setFeedback] = useState(null);

  // Search/Filter states
  const [searchUser, setSearchUser] = useState('');
  const [searchRestaurant, setSearchRestaurant] = useState('');
  const [searchFood, setSearchFood] = useState('');

  // Edit Modal States for Food Item
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);
  
  // Add/Edit Food Form Fields
  const [foodName, setFoodName] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodImage, setFoodImage] = useState('');
  const [foodCategory, setFoodCategory] = useState('Burgers');
  const [foodRestaurant, setFoodRestaurant] = useState('');
  const [foodIsVeg, setFoodIsVeg] = useState(false);
  const [submittingFood, setSubmittingFood] = useState(false);

  // Add Restaurant Form Fields
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantCuisine, setRestaurantCuisine] = useState('');
  const [restaurantImage, setRestaurantImage] = useState('');
  const [restaurantTime, setRestaurantTime] = useState('25-35 mins');
  const [restaurantRating, setRestaurantRating] = useState('4.5');
  const [submittingRestaurant, setSubmittingRestaurant] = useState(false);

  // Auto-clear feedback banner after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Protect Route (must be Admin)
  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  // Fetch foods catalog
  const fetchAllFoods = async () => {
    setLoadingFoods(true);
    try {
      const { data } = await api.get('/foods');
      setFoods(data);
    } catch (err) {
      console.error('Failed to fetch food catalog:', err);
    } finally {
      setLoadingFoods(false);
    }
  };

  // Fetch orders
  const fetchAllOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch users
  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/auth');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch restaurants
  const fetchAllRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const { data } = await api.get('/restaurants');
      setRestaurants(data);
      if (data.length > 0 && !foodRestaurant) {
        setFoodRestaurant(data[0].name);
      }
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // Load everything on mount
  useEffect(() => {
    if (userInfo?.isAdmin) {
      fetchAllRestaurants();
      fetchAllFoods();
      fetchAllOrders();
      fetchAllUsers();
    }
  }, [userInfo]);

  // Unified reload handler
  const handleReloadData = () => {
    setFeedback({ type: 'success', text: 'Refreshed system metrics successfully!' });
    fetchAllRestaurants();
    fetchAllFoods();
    fetchAllOrders();
    fetchAllUsers();
  };

  // ----------------------------------------------------
  // Admin Actions: Users Tab
  // ----------------------------------------------------
  const handleToggleUserRole = async (userId, userName) => {
    if (userId === userInfo._id || userId === userInfo.id || userName === userInfo.name) {
      setFeedback({ type: 'error', text: 'You cannot revoke your own administrator privileges.' });
      return;
    }
    try {
      const { data } = await api.put(`/auth/${userId}/role`);
      setUsers(users.map(user => (user._id === userId || user.id === userId) ? data : user));
      setFeedback({ type: 'success', text: `Successfully updated privileges for user "${userName}".` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === userInfo._id || userId === userInfo.id) {
      setFeedback({ type: 'error', text: 'You cannot delete your own active administrator account.' });
      return;
    }
    if (!window.confirm(`Caution: Are you sure you want to permanently delete user "${userName}"?`)) return;
    try {
      await api.delete(`/auth/${userId}`);
      setUsers(users.filter(user => user._id !== userId && user.id !== userId));
      setFeedback({ type: 'success', text: `User account "${userName}" deleted from database.` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message });
    }
  };

  // ----------------------------------------------------
  // Admin Actions: Restaurants Tab
  // ----------------------------------------------------
  const handleAddRestaurantSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setSubmittingRestaurant(true);
    try {
      const payload = {
        name: restaurantName,
        cuisine: restaurantCuisine,
        image: restaurantImage || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=400',
        time: restaurantTime,
        rating: Number(restaurantRating) || 4.5
      };
      const { data } = await api.post('/restaurants', payload);
      setRestaurants([...restaurants, data]);
      setFeedback({ type: 'success', text: `Restaurant "${restaurantName}" successfully registered!` });
      
      // Reset form
      setRestaurantName('');
      setRestaurantCuisine('');
      setRestaurantImage('');
      setRestaurantTime('25-35 mins');
      setRestaurantRating('4.5');
      
      // Select newly added restaurant as default for food additions
      setFoodRestaurant(restaurantName);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to register restaurant' });
    } finally {
      setSubmittingRestaurant(false);
    }
  };

  const handleDeleteRestaurant = async (resId, resName) => {
    if (!window.confirm(`Warning: Are you sure you want to delete "${resName}"? This will disable menu catalogs linking to this outlet.`)) return;
    try {
      await api.delete(`/restaurants/${resId}`);
      setRestaurants(restaurants.filter(r => r._id !== resId && r.id !== resId));
      setFeedback({ type: 'success', text: `Restaurant "${resName}" removed successfully.` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message });
    }
  };

  // ----------------------------------------------------
  // Admin Actions: Orders Tab
  // ----------------------------------------------------
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order =>
        (order._id === orderId || order.id === orderId) ? { ...order, status: newStatus } : order
      ));
      setFeedback({ type: 'success', text: `Updated status of order #${orderId.substr(-6).toUpperCase()} to "${newStatus}".` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message });
    }
  };

  const handleOrderAdvance = async (orderId) => {
    try {
      const { data } = await api.post(`/orders/${orderId}/advance`);
      setOrders(orders.map(order =>
        (order._id === orderId || order.id === orderId) ? { ...order, status: data.status } : order
      ));
      setFeedback({ type: 'success', text: `Simulated tracking: Order #${orderId.substr(-6).toUpperCase()} transitioned to "${data.status}".` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message });
    }
  };

  // ----------------------------------------------------
  // Admin Actions: Food Catalog & Menu Tabs
  // ----------------------------------------------------
  const handleAddFoodSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setSubmittingFood(true);
    try {
      const foodPayload = {
        name: foodName,
        description: foodDescription,
        price: Number(foodPrice),
        image: foodImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
        category: foodCategory,
        restaurant: foodRestaurant || (restaurants[0]?.name || 'Burger Bistro'),
        isVeg: foodIsVeg
      };
      
      const { data } = await api.post('/foods', foodPayload);
      setFoods([data, ...foods]);
      setFeedback({ type: 'success', text: `Food dish "${foodName}" added to the menu inventory!` });
      
      // Reset form
      setFoodName('');
      setFoodDescription('');
      setFoodPrice('');
      setFoodImage('');
      setFoodIsVeg(false);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to add food item' });
    } finally {
      setSubmittingFood(false);
    }
  };

  const handleOpenEditModal = (food) => {
    setEditingFoodId(food._id || food.id);
    setFoodName(food.name);
    setFoodDescription(food.description);
    setFoodPrice(food.price.toString());
    setFoodImage(food.image);
    setFoodCategory(food.category);
    setFoodRestaurant(food.restaurant || (restaurants[0]?.name || 'Burger Bistro'));
    setFoodIsVeg(food.isVeg);
    
    setFeedback(null);
    setShowEditModal(true);
  };

  const handleUpdateFoodSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setSubmittingFood(true);
    try {
      const foodPayload = {
        name: foodName,
        description: foodDescription,
        price: Number(foodPrice),
        image: foodImage,
        category: foodCategory,
        restaurant: foodRestaurant,
        isVeg: foodIsVeg
      };

      const { data } = await api.put(`/foods/${editingFoodId}`, foodPayload);
      setFoods(foods.map(f => (f._id === editingFoodId || f.id === editingFoodId) ? data : f));
      setFeedback({ type: 'success', text: `Food dish "${foodName}" updated successfully!` });
      
      setTimeout(() => {
        setShowEditModal(false);
        setEditingFoodId(null);
      }, 800);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to update food item' });
    } finally {
      setSubmittingFood(false);
    }
  };

  const handleDeleteFood = async (foodId, dishName) => {
    if (!window.confirm(`Confirm: Delete food item "${dishName}"?`)) return;
    try {
      await api.delete(`/foods/${foodId}`);
      setFoods(foods.filter(f => f._id !== foodId && f.id !== foodId));
      setFeedback({ type: 'success', text: `Deleted "${dishName}" from catalog.` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message });
    }
  };

  // ----------------------------------------------------
  // Analytics Calculations
  // ----------------------------------------------------
  const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const totalOrdersCount = orders.length;
  const aov = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  
  // Calculate restaurant statistics based on active registered outlets
  const restaurantStats = {};
  restaurants.forEach(r => {
    restaurantStats[r.name] = { sales: 0, ordersCount: 0, cuisine: r.cuisine };
  });

  orders.forEach(order => {
    const orderRestaurants = new Set();
    order.orderItems?.forEach(item => {
      // Find food in catalog
      const food = foods.find(f => f.name === item.name || f._id === item.foodItem || f.id === item.foodItem);
      const resName = food?.restaurant || 'Burger Bistro';
      
      if (!restaurantStats[resName]) {
        restaurantStats[resName] = { sales: 0, ordersCount: 0, cuisine: 'General Cuisine' };
      }
      restaurantStats[resName].sales += (item.price || 0) * (item.qty || 0);
      orderRestaurants.add(resName);
    });

    orderRestaurants.forEach(resName => {
      if (restaurantStats[resName]) {
        restaurantStats[resName].ordersCount += 1;
      }
    });
  });

  // Filtered views
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchRestaurant.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchRestaurant.toLowerCase())
  );

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(searchFood.toLowerCase()) ||
    f.restaurant.toLowerCase().includes(searchFood.toLowerCase()) ||
    f.category.toLowerCase().includes(searchFood.toLowerCase())
  );

  return (
    <div className="page-layout container animate-fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* 1. Header Area with Glassmorphism */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 94, 58, 0.08) 0%, rgba(255, 140, 66, 0.04) 100%)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '30px',
        marginBottom: '35px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            backgroundColor: 'var(--primary-glow)',
            color: 'var(--primary)',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(255,94,58,0.15)'
          }}>
            <Shield size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }}>Super Admin Panel</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
              Manage users, outlets, catalog inventories, orders, and payment sheets.
            </p>
          </div>
        </div>

        <button
          onClick={handleReloadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all var(--transition-normal)'
          }}
          className="category-btn"
        >
          <RotateCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Feedback Toast Notification Banner */}
      {feedback && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1.5px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
          color: feedback.type === 'success' ? '#22c55e' : '#ef4444',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '25px',
          fontSize: '14px',
          fontWeight: '600',
          animation: 'fadeInUp var(--transition-normal)'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span style={{ flexGrow: 1 }}>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Top-level Tab Navigation Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1.5px solid var(--border)',
        marginBottom: '35px',
        gap: '20px',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }} className="category-scroll">
        {[
          { id: 'analytics', label: 'Analytics Dashboard', icon: <TrendingUp size={16} /> },
          { id: 'users', label: 'Manage Users', icon: <Users size={16} /> },
          { id: 'restaurants', label: 'Manage Restaurants', icon: <Utensils size={16} /> },
          { id: 'orders', label: 'Manage Orders', icon: <ClipboardList size={16} /> },
          { id: 'payments', label: 'Manage Payments', icon: <CreditCard size={16} /> },
          { id: 'menu', label: 'Update Menu', icon: <Grid size={16} /> },
          { id: 'addFood', label: 'Add Food Item', icon: <PlusCircle size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setFeedback(null);
            }}
            style={{
              padding: '14px 8px',
              fontSize: '14px',
              fontWeight: '700',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)'
            }}
            className="tab-button"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ======================================================================
         TAB: ANALYTICS DASHBOARD
         ====================================================================== */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }} className="animate-fade-in">
          
          {/* KPI Stat Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {/* Total Revenue */}
            <div className="premium-card animate-fade-in-up" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', animationDelay: '0.05s' }}>
              <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '16px', borderRadius: '14px' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sales</span>
                <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '2px', color: 'var(--text-main)' }}>₹{totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            {/* Total Orders */}
            <div className="premium-card animate-fade-in-up" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', animationDelay: '0.1s' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '16px', borderRadius: '14px' }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</span>
                <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '2px', color: 'var(--text-main)' }}>{totalOrdersCount}</p>
              </div>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="premium-card animate-fade-in-up" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', animationDelay: '0.15s' }}>
              <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '16px', borderRadius: '14px' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Order Value (AOV)</span>
                <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '2px', color: 'var(--text-main)' }}>₹{aov.toFixed(2)}</p>
              </div>
            </div>

            {/* Registered Users */}
            <div className="premium-card animate-fade-in-up" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', animationDelay: '0.2s' }}>
              <div style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', padding: '16px', borderRadius: '14px' }}>
                <Users size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered Customers</span>
                <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '2px', color: 'var(--text-main)' }}>{usersCount}</p>
              </div>
            </div>

            {/* Restaurants Count */}
            <div className="premium-card animate-fade-in-up" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', animationDelay: '0.25s' }}>
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '16px', borderRadius: '14px' }}>
                <Utensils size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Outlets</span>
                <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '2px', color: 'var(--text-main)' }}>{restaurantsCount}</p>
              </div>
            </div>

            {/* Menu Size */}
            <div className="premium-card animate-fade-in-up" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', animationDelay: '0.3s' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '16px', borderRadius: '14px' }}>
                <Grid size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dishes catalog</span>
                <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '2px', color: 'var(--text-main)' }}>{menuCatalogCount} items</p>
              </div>
            </div>
          </div>

          {/* Sales Breakdown by Restaurant Outlet */}
          <div className="premium-card" style={{ padding: '30px', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Utensils size={18} style={{ color: 'var(--primary)' }} />
              <span>Revenue Breakdown by Restaurant Brand</span>
            </h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontWeight: '700' }}>
                  <th style={{ padding: '14px' }}>Restaurant Name</th>
                  <th style={{ padding: '14px' }}>Specialty Cuisine</th>
                  <th style={{ padding: '14px' }}>Orders Processed</th>
                  <th style={{ padding: '14px' }}>Total Sales (₹)</th>
                  <th style={{ padding: '14px' }}>Market Share</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(restaurantStats).map((name) => {
                  const stats = restaurantStats[name];
                  const sharePercent = totalRevenue > 0 ? (stats.sales / totalRevenue) * 100 : 0;

                  return (
                    <tr key={name} style={{ borderBottom: '1px solid var(--border)' }} className="table-row">
                      <td style={{ padding: '14px', fontWeight: '800' }}>{name}</td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>{stats.cuisine}</td>
                      <td style={{ padding: '14px' }}>{stats.ordersCount} orders</td>
                      <td style={{ padding: '14px', fontWeight: '800', color: 'var(--primary)', fontSize: '15px' }}>₹{stats.sales.toFixed(2)}</td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flexGrow: 1, backgroundColor: 'var(--border)', height: '6px', borderRadius: '3px', minWidth: '80px', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: 'var(--primary)', height: '100%', width: `${sharePercent}%`, borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontWeight: '700', fontSize: '12px', minWidth: '35px' }}>{sharePercent.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {Object.keys(restaurantStats).length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No restaurants configured. Add them under the "Manage Restaurants" tab.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================
         TAB: MANAGE USERS
         ====================================================================== */}
      {activeTab === 'users' && (
        <div className="premium-card animate-fade-in" style={{ padding: '30px' }}>
          
          {/* Header & Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} />
              <span>Registered User Accounts</span>
            </h3>
            
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                style={{ paddingLeft: '38px', height: '38px', width: '100%' }}
                className="input-field"
              />
            </div>
          </div>

          {loadingUsers ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <RotateCw size={24} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontWeight: '700' }}>
                    <th style={{ padding: '14px' }}>Name</th>
                    <th style={{ padding: '14px' }}>Email Address</th>
                    <th style={{ padding: '14px' }}>Role</th>
                    <th style={{ padding: '14px' }}>Registered At</th>
                    <th style={{ padding: '14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isSelf = user._id === userInfo._id || user.id === userInfo.id;
                    return (
                      <tr key={user._id || user.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row">
                        <td style={{ padding: '14px', fontWeight: '700' }}>{user.name} {isSelf && <span style={{ fontSize: '10px', color: 'var(--primary)', fontStyle: 'italic' }}>(You)</span>}</td>
                        <td style={{ padding: '14px', color: 'var(--text-muted)' }}>{user.email}</td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: user.isAdmin ? 'var(--primary-glow)' : 'var(--border)',
                            color: user.isAdmin ? 'var(--primary)' : 'var(--text-muted)'
                          }}>
                            {user.isAdmin ? 'SUPER ADMIN' : 'CUSTOMER'}
                          </span>
                        </td>
                        <td style={{ padding: '14px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'System Seeded'}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => handleToggleUserRole(user._id || user.id, user.name)}
                              disabled={isSelf}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '700',
                                border: '1.5px solid var(--border)',
                                backgroundColor: isSelf ? 'var(--bg-app)' : 'var(--bg-card)',
                                color: isSelf ? 'var(--text-muted)' : 'var(--text-main)',
                                cursor: isSelf ? 'not-allowed' : 'pointer'
                              }}
                              className="category-btn"
                              title={user.isAdmin ? "Demote to Customer" : "Promote to Admin"}
                            >
                              Toggle Role
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id || user.id, user.name)}
                              disabled={isSelf}
                              style={{
                                padding: '6px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: isSelf ? 'rgba(239, 68, 68, 0.03)' : 'rgba(239, 68, 68, 0.08)',
                                color: isSelf ? '#fda4af' : '#ef4444',
                                cursor: isSelf ? 'not-allowed' : 'pointer'
                              }}
                              title="Delete Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No users found matching your search request.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
         TAB: MANAGE RESTAURANTS
         ====================================================================== */}
      {activeTab === 'restaurants' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="animate-fade-in">
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            
            {/* Left: Add Restaurant Form */}
            <div className="premium-card" style={{ padding: '30px', height: 'fit-content' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={18} style={{ color: 'var(--primary)' }} />
                <span>Register Restaurant Brand</span>
              </h3>

              <form onSubmit={handleAddRestaurantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Restaurant Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deccan Biryani"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Cuisine Specialties</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabadi Biryani & North Indian Kebabs"
                    value={restaurantCuisine}
                    onChange={(e) => setRestaurantCuisine(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Est. Delivery Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 25-35 mins"
                      value={restaurantTime}
                      onChange={(e) => setRestaurantTime(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Rating Score</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min="1"
                      max="5"
                      placeholder="4.5"
                      value={restaurantRating}
                      onChange={(e) => setRestaurantRating(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Image URL (Banner cover)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={restaurantImage}
                    onChange={(e) => setRestaurantImage(e.target.value)}
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRestaurant}
                  className="gradient-btn"
                  style={{ padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: '700', marginTop: '10px' }}
                >
                  {submittingRestaurant ? 'Registering outlet...' : 'Register Restaurant'}
                </button>
              </form>
            </div>

            {/* Right: Existing Outlets List */}
            <div className="premium-card" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Utensils size={18} style={{ color: 'var(--primary)' }} />
                  <span>Outlets Directory</span>
                </h3>
                
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={searchRestaurant}
                  onChange={(e) => setSearchRestaurant(e.target.value)}
                  style={{ height: '32px', width: '100%', maxWidth: '180px', fontSize: '12px' }}
                  className="input-field"
                />
              </div>

              {loadingRestaurants ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <RotateCw size={20} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '5px' }} className="category-scroll">
                  {filteredRestaurants.map(res => (
                    <div
                      key={res._id || res.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-app)',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <img
                          src={res.image}
                          alt={res.name}
                          style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.name}</h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                            {res.cuisine}
                          </p>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', marginTop: '4px', fontWeight: '700' }}>
                            <span style={{ color: '#ffb800' }}>⭐ {Number(res.rating).toFixed(1)}</span>
                            <span style={{ color: 'var(--text-muted)' }}>⏱️ {res.time}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteRestaurant(res._id || res.id, res.name)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'rgba(239,68,68,0.08)',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                        title="Delete Restaurant"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {filteredRestaurants.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px' }}>
                      No registered restaurants found.
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ======================================================================
         TAB: MANAGE ORDERS
         ====================================================================== */}
      {activeTab === 'orders' && (
        <div className="premium-card animate-fade-in" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList size={18} style={{ color: 'var(--primary)' }} />
            <span>Customer Orders Management</span>
          </h3>

          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <RotateCw size={24} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
            </div>
          ) : orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No client orders found on the system.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontWeight: '700' }}>
                    <th style={{ padding: '14px' }}>Order Invoice ID</th>
                    <th style={{ padding: '14px' }}>Customer</th>
                    <th style={{ padding: '14px' }}>Items ordered</th>
                    <th style={{ padding: '14px' }}>Paid Total (₹)</th>
                    <th style={{ padding: '14px' }}>Shipping Address</th>
                    <th style={{ padding: '14px' }}>Order Status</th>
                    <th style={{ padding: '14px' }}>Simulator</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id || order.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row">
                      <td style={{ padding: '14px', fontWeight: '800', fontFamily: 'monospace' }}>
                        #{order._id?.substr(-6).toUpperCase() || order.id?.substr(-6).toUpperCase()}
                      </td>
                      <td style={{ padding: '14px' }}>{order.user?.name || 'Guest User'}</td>
                      <td style={{ padding: '14px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {order.orderItems?.map((item, idx) => (
                            <span key={idx}>{item.name} <strong style={{ color: 'var(--primary)' }}>x{item.qty}</strong></span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '14px', fontWeight: '800', color: 'var(--primary)', fontSize: '15px' }}>
                        ₹{order.totalPrice?.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {order.shippingAddress}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order._id || order.id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1.5px solid var(--border)',
                            backgroundColor: 'var(--bg-app)',
                            color: 'var(--text-main)',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <button
                          onClick={() => handleOrderAdvance(order._id || order.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '700',
                            backgroundColor: 'var(--primary-glow)',
                            color: 'var(--primary)',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Step Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
         TAB: MANAGE PAYMENTS
         ====================================================================== */}
      {activeTab === 'payments' && (
        <div className="premium-card animate-fade-in" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={18} style={{ color: 'var(--primary)' }} />
            <span>Transaction Ledger & Ledgers Sheet</span>
          </h3>

          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <RotateCw size={24} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
            </div>
          ) : orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No payments logged on the ledger.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontWeight: '700' }}>
                    <th style={{ padding: '14px' }}>Invoice ID</th>
                    <th style={{ padding: '14px' }}>Customer name</th>
                    <th style={{ padding: '14px' }}>Payment Method</th>
                    <th style={{ padding: '14px' }}>Date</th>
                    <th style={{ padding: '14px' }}>Amount (₹)</th>
                    <th style={{ padding: '14px' }}>Settlement</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id || order.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row">
                      <td style={{ padding: '14px', fontWeight: '800', fontFamily: 'monospace' }}>
                        #{order._id?.substr(-8).toUpperCase() || order.id?.substr(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: '14px' }}>{order.user?.name || 'Guest Customer'}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: order.paymentMethod === 'Cash on Delivery' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                          color: order.paymentMethod === 'Cash on Delivery' ? '#f59e0b' : '#3b82f6'
                        }}>
                          {order.paymentMethod || 'UPI Payment'}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Just Now'}
                      </td>
                      <td style={{ padding: '14px', fontWeight: '800', color: 'var(--primary)', fontSize: '15px' }}>
                        ₹{order.totalPrice?.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: order.status === 'Delivered' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.04)',
                          color: '#22c55e'
                        }}>
                          {order.status === 'Delivered' ? 'Settled to Vendor' : 'Escrow (Paid)'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
         TAB: UPDATE MENU (DISHE CATALOG)
         ====================================================================== */}
      {activeTab === 'menu' && (
        <div className="premium-card animate-fade-in" style={{ padding: '30px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Grid size={18} style={{ color: 'var(--primary)' }} />
              <span>Menu Dishes Catalog</span>
            </h3>

            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter by dish, category, restaurant..."
                value={searchFood}
                onChange={(e) => setSearchFood(e.target.value)}
                style={{ paddingLeft: '38px', height: '38px', width: '100%' }}
                className="input-field"
              />
            </div>
          </div>

          {loadingFoods ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <RotateCw size={24} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontWeight: '700' }}>
                    <th style={{ padding: '14px' }}>Image</th>
                    <th style={{ padding: '14px' }}>Dish Title</th>
                    <th style={{ padding: '14px' }}>Restaurant Outlet</th>
                    <th style={{ padding: '14px' }}>Category</th>
                    <th style={{ padding: '14px' }}>Price</th>
                    <th style={{ padding: '14px' }}>Diet Type</th>
                    <th style={{ padding: '14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.map((food) => (
                    <tr key={food._id || food.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row">
                      <td style={{ padding: '14px' }}>
                        <img src={food.image} alt={food.name} style={{ width: '50px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                      </td>
                      <td style={{ padding: '14px', fontWeight: '800' }}>{food.name}</td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)' }}>{food.restaurant || 'Burger Bistro'}</td>
                      <td style={{ padding: '14px' }}>{food.category}</td>
                      <td style={{ padding: '14px', fontWeight: '800', color: 'var(--primary)', fontSize: '15px' }}>₹{food.price.toFixed(2)}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: food.isVeg ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                          color: food.isVeg ? '#22c55e' : '#ef4444'
                        }}>
                          {food.isVeg ? 'VEG' : 'NON-VEG'}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleOpenEditModal(food)}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              color: 'var(--primary)',
                              backgroundColor: 'var(--primary-glow)',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            title="Edit Details"
                          >
                            <Edit size={14} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteFood(food._id || food.id, food.name)}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              color: '#ef4444',
                              backgroundColor: 'rgba(239, 68, 68, 0.08)',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            title="Delete Dish"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredFoods.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No food items found matching your catalog search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
         TAB: ADD FOOD ITEM
         ====================================================================== */}
      {activeTab === 'addFood' && (
        <div className="premium-card animate-fade-in-up" style={{ padding: '35px', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={18} style={{ color: 'var(--primary)' }} />
            <span>Enter Food Dish Details</span>
          </h3>

          <form onSubmit={handleAddFoodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Food Title</label>
              <input
                type="text"
                placeholder="e.g. Butter Paneer Masala"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Description</label>
              <textarea
                placeholder="Delicious description of ingredients and spices..."
                value={foodDescription}
                onChange={(e) => setFoodDescription(e.target.value)}
                required
                className="input-field"
                rows={3}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="249.00"
                  value={foodPrice}
                  onChange={(e) => setFoodPrice(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Category</label>
                <select
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value)}
                  className="input-field"
                  style={{ backgroundColor: 'var(--bg-input)' }}
                >
                  <option value="Burgers">Burgers</option>
                  <option value="Pizzas">Pizzas</option>
                  <option value="Sushi">Sushi</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>
            </div>

            {/* Dynamic Restaurant Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Select Restaurant Outlet</label>
              <select
                value={foodRestaurant}
                onChange={(e) => setFoodRestaurant(e.target.value)}
                className="input-field"
                style={{ backgroundColor: 'var(--bg-input)' }}
              >
                {restaurants.map(r => (
                  <option key={r._id || r.id} value={r.name}>{r.name}</option>
                ))}
                {restaurants.length === 0 && (
                  <option value="Burger Bistro">Burger Bistro (Fallback)</option>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Cover Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={foodImage}
                onChange={(e) => setFoodImage(e.target.value)}
                className="input-field"
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={foodIsVeg}
                onChange={(e) => setFoodIsVeg(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span>Is this dish Vegetarian? (VEG tag)</span>
            </label>

            <button
              type="submit"
              disabled={submittingFood}
              className="gradient-btn"
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                fontSize: '15px',
                marginTop: '10px'
              }}
            >
              {submittingFood ? 'Adding dish...' : 'Submit Food Item'}
            </button>
          </form>
        </div>
      )}

      {/* ======================================================================
         MODAL OVERLAY: EDIT FOOD DETAILS
         ====================================================================== */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.25s ease forwards'
        }}>
          <div className="premium-card animate-fade-in-up" style={{
            width: '90%',
            maxWidth: '550px',
            padding: '30px',
            backgroundColor: 'var(--bg-card)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>✏️ Edit Food Dish Details</h3>
              <button onClick={() => setShowEditModal(false)} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateFoodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Food Title</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  required
                  className="input-field"
                  style={{ height: '40px', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  value={foodDescription}
                  onChange={(e) => setFoodDescription(e.target.value)}
                  required
                  className="input-field"
                  rows={3}
                  style={{ fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={foodPrice}
                    onChange={(e) => setFoodPrice(e.target.value)}
                    required
                    className="input-field"
                    style={{ height: '40px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Category</label>
                  <select
                    value={foodCategory}
                    onChange={(e) => setFoodCategory(e.target.value)}
                    className="input-field"
                    style={{ height: '40px', fontSize: '14px', backgroundColor: 'var(--bg-input)' }}
                  >
                    <option value="Burgers">Burgers</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Sushi">Sushi</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Restaurant Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Select Restaurant Outlet</label>
                <select
                  value={foodRestaurant}
                  onChange={(e) => setFoodRestaurant(e.target.value)}
                  className="input-field"
                  style={{ height: '40px', fontSize: '14px', backgroundColor: 'var(--bg-input)' }}
                >
                  {restaurants.map(r => (
                    <option key={r._id || r.id} value={r.name}>{r.name}</option>
                  ))}
                  {restaurants.length === 0 && (
                    <option value="Burger Bistro">Burger Bistro</option>
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Image URL</label>
                <input
                  type="url"
                  value={foodImage}
                  onChange={(e) => setFoodImage(e.target.value)}
                  required
                  className="input-field"
                  style={{ height: '40px', fontSize: '14px' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  checked={foodIsVeg}
                  onChange={(e) => setFoodIsVeg(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span>Is this dish Vegetarian? (VEG tag)</span>
              </label>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={submittingFood}
                  className="gradient-btn"
                  style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', boxShadow: 'none' }}
                >
                  {submittingFood ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ flex: 1, padding: '12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '700', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .table-row:hover {
          background-color: var(--bg-app);
        }
        .tab-button:hover {
          color: var(--primary) !important;
          opacity: 0.95;
        }
        .category-scroll::-webkit-scrollbar {
          height: 0px;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
