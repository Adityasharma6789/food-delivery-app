import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '..', '..', 'database');

const isVercel = !!process.env.VERCEL;

// Ensure DB directory exists
if (!isVercel && !fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Global in-memory storage for serverless environments
if (isVercel && !global._inMemoryDb) {
  global._inMemoryDb = {};
}

const getFilePath = (collection) => path.join(DB_DIR, `${collection}.json`);

const readData = (collection) => {
  if (isVercel) {
    return global._inMemoryDb[collection] || [];
  }
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error(`Error reading ${collection}.json:`, error);
    return [];
  }
};

const writeData = (collection, data) => {
  if (isVercel) {
    global._inMemoryDb[collection] = data;
    return true;
  }
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${collection}.json:`, error);
    return false;
  }
};

export const jsonDb = {
  find: (collection, query = {}) => {
    const items = readData(collection);
    return items.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findOne: (collection, query = {}) => {
    const items = readData(collection);
    return items.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },

  findById: (collection, id) => {
    const items = readData(collection);
    return items.find(item => item._id === id || item.id === id) || null;
  },

  create: (collection, data) => {
    const items = readData(collection);
    const newItem = {
      _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    writeData(collection, items);
    return newItem;
  },

  findByIdAndUpdate: (collection, id, updateData) => {
    const items = readData(collection);
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeData(collection, items);
    return items[index];
  },

  delete: (collection, id) => {
    const items = readData(collection);
    const filtered = items.filter(item => item._id !== id && item.id !== id);
    writeData(collection, filtered);
    return true;
  },

  saveAll: (collection, items) => {
    writeData(collection, items);
  }
};
