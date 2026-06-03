import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { connectDB, getDbMode } from './utils/db.js';
import { jsonDb } from './utils/dbStore.js';
import FoodItem from './models/FoodItem.js';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import { seedFoods } from './utils/seedData.js';

import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('socketio', io);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket.io: ${socket.id}`);
  
  socket.on('joinOrder', (orderId) => {
    socket.join(orderId);
    console.log(`👤 Client joined room for order: ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected from Socket.io: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json());

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SwiftBite Food Delivery API is running...' });
});

// Post routes error handlers
app.use(notFound);
app.use(errorHandler);

// Helper function to auto-seed database
const autoSeed = async () => {
  try {
    const isFallback = getDbMode();
    const testUsers = [
      {
        name: 'Alex Smith',
        email: 'user@example.com',
        password: 'password123',
        address: '123 Main St, New York, NY',
        isAdmin: false
      },
      {
        name: 'Admin Owner',
        email: 'admin@example.com',
        password: 'admin123',
        address: 'Headquarters, New York, NY',
        isAdmin: true
      }
    ];

    const defaultRestaurants = [
      {
        name: "Burger Bistro",
        cuisine: "Gourmet Burgers & Crispy Fries",
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400",
        rating: 4.7,
        time: "20-30 mins"
      },
      {
        name: "Pizzeria Italia",
        cuisine: "Authentic Stone Baked Pizzas",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400",
        rating: 4.8,
        time: "25-35 mins"
      },
      {
        name: "Tokyo Sushi",
        cuisine: "Premium Fresh Sushi Rolls",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400",
        rating: 4.9,
        time: "30-40 mins"
      },
      {
        name: "Sweet Delights",
        cuisine: "Molten Lava Cakes & Cheesecakes",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400",
        rating: 4.6,
        time: "15-25 mins"
      },
      {
        name: "Matcha & Co",
        cuisine: "Coffee, Matcha & Refreshing Coolers",
        image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=400",
        rating: 4.7,
        time: "15-20 mins"
      }
    ];

    if (isFallback) {
      // 1. Seed restaurants
      const existingRestaurants = jsonDb.find('restaurants');
      if (existingRestaurants.length === 0) {
        console.log('Seeding local JSON database with initial restaurants...');
        const formattedRestaurants = defaultRestaurants.map((item, index) => ({
          _id: `restaurant_${index + 1}`,
          ...item
        }));
        jsonDb.saveAll('restaurants', formattedRestaurants);
      }

      // 2. Seed food catalog
      const existingFoods = jsonDb.find('foods');
      if (existingFoods.length === 0) {
        console.log('Seeding local JSON database with initial food items...');
        // Map food items to include string IDs
        const formattedFoods = seedFoods.map((item, index) => ({
          _id: `food_${index + 1}`,
          ...item
        }));
        jsonDb.saveAll('foods', formattedFoods);
      }

      // 3. Seed test users
      const existingUsers = jsonDb.find('users');
      if (existingUsers.length === 0) {
        console.log('Seeding local JSON database with default user accounts...');
        const seededUsers = [];
        for (const user of testUsers) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          seededUsers.push({
            _id: user.isAdmin ? 'user_admin' : 'user_standard',
            name: user.name,
            email: user.email,
            password: hashedPassword,
            address: user.address,
            isAdmin: user.isAdmin,
            createdAt: new Date().toISOString()
          });
        }
        jsonDb.saveAll('users', seededUsers);
      }
    } else {
      // Mongoose Mode
      // 1. Seed restaurants
      const restaurantCount = await Restaurant.countDocuments();
      if (restaurantCount === 0) {
        console.log('Seeding MongoDB with initial restaurants...');
        await Restaurant.insertMany(defaultRestaurants);
      }

      // 2. Seed food catalog
      const foodCount = await FoodItem.countDocuments();
      if (foodCount === 0) {
        console.log('Seeding MongoDB with initial food items...');
        await FoodItem.insertMany(seedFoods);
      }

      // 3. Seed test users
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('Seeding MongoDB with default user accounts...');
        const seededUsers = [];
        for (const user of testUsers) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          seededUsers.push({
            ...user,
            password: hashedPassword
          });
        }
        await User.insertMany(seededUsers);
      }
    }
    console.log('✅ Auto-seeding check complete!');
  } catch (error) {
    console.error('❌ Database auto-seeding failed:', error);
  }
};

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await connectDB();
  await autoSeed();
});
