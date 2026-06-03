import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import { getDbMode } from '../utils/db.js';
import { jsonDb } from '../utils/dbStore.js';
import User from '../models/User.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    let user;
    if (getDbMode()) {
      user = jsonDb.findOne('users', { email });
    } else {
      user = await User.findOne({ email });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        address: user.address || '',
        isAdmin: user.isAdmin,
        token: generateToken(user._id || user.id)
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, email, password, address, isAdmin } = req.body;

  try {
    let userExists;
    if (getDbMode()) {
      userExists = jsonDb.findOne('users', { email });
    } else {
      userExists = await User.findOne({ email });
    }

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    const userData = {
      name,
      email,
      password: hashedPassword,
      address: address || '',
      isAdmin: isAdmin || false
    };

    if (getDbMode()) {
      newUser = jsonDb.create('users', userData);
    } else {
      newUser = await User.create(userData);
    }

    if (newUser) {
      res.status(201).json({
        _id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address || '',
        isAdmin: newUser.isAdmin,
        token: generateToken(newUser._id || newUser.id)
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    let user;
    const userId = req.user._id || req.user.id;

    if (getDbMode()) {
      user = jsonDb.findById('users', userId);
    } else {
      user = await User.findById(userId);
    }

    if (user) {
      res.json({
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        address: user.address || '',
        isAdmin: user.isAdmin
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile address
// @route   PUT /api/auth/profile/address
// @access  Private
export const updateUserAddress = async (req, res, next) => {
  const { address } = req.body;
  try {
    let updatedUser;
    const userId = req.user._id || req.user.id;

    if (getDbMode()) {
      updatedUser = jsonDb.findByIdAndUpdate('users', userId, { address });
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { address },
        { new: true }
      );
    }

    if (updatedUser) {
      res.json({
        _id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address || '',
        isAdmin: updatedUser.isAdmin
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    let users;
    if (getDbMode()) {
      users = jsonDb.find('users');
      // Remove password fields for security
      users = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
    } else {
      users = await User.find({}).select('-password');
    }
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user admin role (Admin only)
// @route   PUT /api/auth/:id/role
// @access  Private/Admin
export const toggleUserRole = async (req, res, next) => {
  const { id } = req.params;
  try {
    let user;
    if (getDbMode()) {
      user = jsonDb.findById('users', id);
    } else {
      user = await User.findById(id);
    }

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const updatedData = { isAdmin: !user.isAdmin };
    let updatedUser;

    if (getDbMode()) {
      updatedUser = jsonDb.findByIdAndUpdate('users', id, updatedData);
    } else {
      updatedUser = await User.findByIdAndUpdate(
        id,
        updatedData,
        { new: true }
      ).select('-password');
    }

    res.json({
      _id: updatedUser._id || updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address || '',
      isAdmin: updatedUser.isAdmin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/auth/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    let success = false;
    if (getDbMode()) {
      success = jsonDb.delete('users', id);
    } else {
      const result = await User.findByIdAndDelete(id);
      success = !!result;
    }

    if (success) {
      res.json({ message: 'User account deleted successfully' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

