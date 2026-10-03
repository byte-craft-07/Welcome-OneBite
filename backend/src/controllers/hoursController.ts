import { Response } from 'express';
import { BusinessHours } from '../models/BusinessHours';
import { AuditLog } from '../models/AuditLog';
import { hoursUpdateSchema } from '../validators';
import { AuthRequest } from '../middleware/auth';
import { clearPublicBusinessCache } from './businessController';

export const getHours = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.query.businessId as string || req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business ID is required' });
      return;
    }

    let hours = await BusinessHours.findOne({ businessId });

    if (!hours) {
      const defaultDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
        (day) => ({
          day: day as any,
          isOpen: true,
          openTime: '09:00',
          closeTime: '21:00',
        })
      );
      hours = await BusinessHours.create({
        businessId,
        timezone: 'Asia/Kolkata',
        days: defaultDays,
      });
    }

    res.json({ success: true, hours });
  } catch (error: any) {
    console.error('getHours error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve business hours' });
  }
};

export const updateHours = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.body.businessId || req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business ID is required' });
      return;
    }

    const parsed = hoursUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.format(),
      });
      return;
    }

    let hours = await BusinessHours.findOne({ businessId });
    if (!hours) {
      hours = new BusinessHours({ businessId, ...parsed.data });
    } else {
      hours.timezone = parsed.data.timezone;
      hours.days = parsed.data.days as any;
      hours.specialNotes = parsed.data.specialNotes;
    }

    await hours.save();

    await AuditLog.create({
      businessId,
      userId: req.user?._id,
      action: 'update_hours',
      entity: 'hours',
      entityId: hours._id.toString(),
      details: { timezone: hours.timezone },
    });

    clearPublicBusinessCache();
    res.json({ success: true, message: 'Business hours updated successfully', hours });
  } catch (error: any) {
    console.error('updateHours error:', error);
    res.status(500).json({ success: false, message: 'Failed to update business hours' });
  }
};
