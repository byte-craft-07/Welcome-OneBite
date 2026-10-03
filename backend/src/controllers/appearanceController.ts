import { Response } from 'express';
import { BusinessAppearance } from '../models/BusinessAppearance';
import { AuditLog } from '../models/AuditLog';
import { appearanceUpdateSchema } from '../validators';
import { AuthRequest } from '../middleware/auth';
import { clearPublicBusinessCache } from './businessController';

export const getAppearance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.query.businessId as string || req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business ID is required' });
      return;
    }

    let appearance = await BusinessAppearance.findOne({ businessId });

    if (!appearance) {
      appearance = await BusinessAppearance.create({
        businessId,
        theme: 'bakery',
        primaryColor: '#f97316',
        secondaryColor: '#c2410c',
        backgroundColor: '#fff7ed',
        cardBackgroundColor: '#ffffff',
        textColor: '#1f2937',
        cardStyle: 'rounded-glass',
        buttonStyle: 'pill',
        borderRadius: 'xl',
        fontFamily: 'sans',
        profileLayout: 'banner-avatar',
        backgroundPattern: 'mesh',
        showVerifiedBadge: true,
        showShareButton: true,
        showQrButton: true,
        showHoursCard: true,
        showAboutCard: true,
        showContactCard: true,
      });
    }

    res.json({ success: true, appearance });
  } catch (error: any) {
    console.error('getAppearance error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve appearance' });
  }
};

export const updateAppearance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.body.businessId || req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business ID is required' });
      return;
    }

    const parsed = appearanceUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.format(),
      });
      return;
    }

    let appearance = await BusinessAppearance.findOne({ businessId });
    if (!appearance) {
      appearance = new BusinessAppearance({ businessId, ...parsed.data });
    } else {
      Object.assign(appearance, parsed.data);
    }

    await appearance.save();

    await AuditLog.create({
      businessId,
      userId: req.user?._id,
      action: 'update_appearance',
      entity: 'appearance',
      entityId: appearance._id.toString(),
      details: { theme: appearance.theme, primaryColor: appearance.primaryColor },
    });

    clearPublicBusinessCache();
    res.json({ success: true, message: 'Appearance updated successfully', appearance });
  } catch (error: any) {
    console.error('updateAppearance error:', error);
    res.status(500).json({ success: false, message: 'Failed to update appearance' });
  }
};
