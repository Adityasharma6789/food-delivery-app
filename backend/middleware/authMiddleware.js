import jwt from 'jsonwebtoken';
import { getDbMode } from '../utils/db.js';
import { jsonDb } from '../utils/dbStore.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'swiftbite_super_secret_jwt_key_987654321');

      if (getDbMode()) {
        const user = jsonDb.findById('users', decoded.id);
        if (!user) {
          res.status(401);
          return next(new Error('Not authorized, user not found'));
        }
        // Exclude password
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    next(new Error('Not authorized as an admin'));
  }
};
