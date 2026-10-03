import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Business } from '../models/Business';
import { AuthRequest } from '../middleware/auth';

const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_business_link_hub_2026_standalone';
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: '60d' }
  );
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        businessIds: user.businessIds,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const pinLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pin } = req.body;
    const defaultPin = process.env.ADMIN_PIN || '753753';

    if (!pin) {
      res.status(400).json({ success: false, message: 'PIN code is required' });
      return;
    }

    const trimmedPin = String(pin).trim();

    // Check against configured ADMIN_PIN or find admin user
    let user = await User.findOne({ role: 'super_admin' });

    const isDefaultPinMatch = trimmedPin === defaultPin;
    let isUserPinMatch = false;

    if (user && user.pinHash) {
      isUserPinMatch = await user.comparePin(trimmedPin);
    }

    if (!isDefaultPinMatch && !isUserPinMatch) {
      res.status(401).json({ success: false, message: 'Incorrect PIN code' });
      return;
    }

    // If no user exists yet, create default admin user on the fly
    if (!user) {
      const defaultPasswordHash = await bcrypt.hash('admin123456', 10);
      const defaultPinHash = await bcrypt.hash(defaultPin, 10);
      user = await User.create({
        email: 'admin@businesslinkhub.local',
        passwordHash: defaultPasswordHash,
        pinHash: defaultPinHash,
        role: 'super_admin',
        isActive: true,
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Admin access granted via PIN',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        businessIds: user.businessIds,
      },
    });
  } catch (error: any) {
    console.error('PIN Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const businesses = await Business.find(
      req.user.role === 'super_admin' ? {} : { _id: { $in: req.user.businessIds } }
    ).select('name slug logoUrl isPublished');

    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        businessIds: req.user.businessIds,
        businesses,
      },
    });
  } catch (error: any) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updatePin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { newPin } = req.body;
    if (!newPin || String(newPin).trim().length < 4) {
      res.status(400).json({ success: false, message: 'PIN must be at least 4 digits' });
      return;
    }

    const pinHash = await bcrypt.hash(String(newPin).trim(), 10);
    if (req.user) {
      req.user.pinHash = pinHash;
      await req.user.save();
    }

    res.json({ success: true, message: 'PIN updated successfully' });
  } catch (error: any) {
    console.error('updatePin error:', error);
    res.status(500).json({ success: false, message: 'Failed to update PIN' });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Logged out successfully' });
};
