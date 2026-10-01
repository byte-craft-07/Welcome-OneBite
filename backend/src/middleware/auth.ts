import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  businessId?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Check cookie fallback (2-month persistent session cookie)
    if (!token && (req as any).cookies?.hub_auth_token) {
      token = (req as any).cookies.hub_auth_token;
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_business_link_hub_2026_standalone';
    const decoded = jwt.verify(token, secret) as { userId: string; role: string };

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid or inactive user account.' });
      return;
    }

    req.user = user;

    // Check optional business ID requested
    const customBusinessId = req.headers['x-business-id'] as string;
    if (customBusinessId) {
      req.businessId = customBusinessId;
    } else if (user.businessIds && user.businessIds.length > 0) {
      req.businessId = user.businessIds[0].toString();
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
};
