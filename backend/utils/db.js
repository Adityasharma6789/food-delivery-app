import mongoose from 'mongoose';

let isFallbackMode = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/swiftbite';
  try {
    mongoose.set('strictQuery', true);
    // Timeout in 3 seconds to avoid blocking the app start if MongoDB is not running
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    isFallbackMode = false;
    return conn;
  } catch (error) {
    console.log('⚠️ MongoDB Connection Failed. Running SwiftBite in local JSON-file Database Mode.');
    isFallbackMode = true;
    return null;
  }
};

export const getDbMode = () => isFallbackMode;
