import { Response } from 'express';
import { BusinessLink } from '../models/BusinessLink';
import { AuditLog } from '../models/AuditLog';
import { linkCreateSchema } from '../validators';
import { AuthRequest } from '../middleware/auth';

export const getAdminLinks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.query.businessId as string || req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business ID is required' });
      return;
    }

    const links = await BusinessLink.find({ businessId }).sort({ sortOrder: 1, createdAt: 1 });
    res.json({ success: true, links });
  } catch (error: any) {
    console.error('getAdminLinks error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve links' });
  }
};

const normalizeUrl = (rawUrl?: string, type?: string): string => {
  const url = (rawUrl || '').trim();
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
    return url;
  }
  if (type === 'phone') {
    return url.replace(/\s+/g, '');
  }
  if (type === 'whatsapp') {
    return url.replace(/[^0-9]/g, '');
  }
  if (type === 'email') {
    return `mailto:${url}`;
  }
  return `https://${url}`;
};

export const createLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.body.businessId || req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business ID is required' });
      return;
    }

    const parsed = linkCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.format(),
      });
      return;
    }

    // Determine highest sortOrder
    const highestLink = await BusinessLink.findOne({ businessId }).sort({ sortOrder: -1 });
    const sortOrder = highestLink ? highestLink.sortOrder + 1 : 0;

    const dataToSave = {
      ...parsed.data,
      url: normalizeUrl(parsed.data.url, parsed.data.type),
      businessId,
      sortOrder: parsed.data.sortOrder ?? sortOrder,
    };

    const link = await BusinessLink.create(dataToSave);

    await AuditLog.create({
      businessId,
      userId: req.user?._id,
      action: 'create_link',
      entity: 'link',
      entityId: link._id.toString(),
      details: { title: link.title, type: link.type },
    });

    res.status(201).json({ success: true, message: 'Link created successfully', link });
  } catch (error: any) {
    console.error('createLink error:', error);
    res.status(500).json({ success: false, message: 'Failed to create link' });
  }
};

export const updateLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const link = await BusinessLink.findById(id);

    if (!link) {
      res.status(404).json({ success: false, message: 'Link not found' });
      return;
    }

    const parsed = linkCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.format(),
      });
      return;
    }

    const dataToSave = {
      ...parsed.data,
      url: normalizeUrl(parsed.data.url, parsed.data.type),
    };

    Object.assign(link, dataToSave);
    await link.save();

    await AuditLog.create({
      businessId: link.businessId,
      userId: req.user?._id,
      action: 'update_link',
      entity: 'link',
      entityId: link._id.toString(),
      details: { title: link.title },
    });

    res.json({ success: true, message: 'Link updated successfully', link });
  } catch (error: any) {
    console.error('updateLink error:', error);
    res.status(500).json({ success: false, message: 'Failed to update link' });
  }
};

export const deleteLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const link = await BusinessLink.findByIdAndDelete(id);

    if (!link) {
      res.status(404).json({ success: false, message: 'Link not found' });
      return;
    }

    await AuditLog.create({
      businessId: link.businessId,
      userId: req.user?._id,
      action: 'delete_link',
      entity: 'link',
      entityId: id,
      details: { title: link.title },
    });

    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (error: any) {
    console.error('deleteLink error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete link' });
  }
};

export const duplicateLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const original = await BusinessLink.findById(id);

    if (!original) {
      res.status(404).json({ success: false, message: 'Original link not found' });
      return;
    }

    const highestLink = await BusinessLink.findOne({ businessId: original.businessId }).sort({ sortOrder: -1 });
    const sortOrder = highestLink ? highestLink.sortOrder + 1 : 0;

    const duplicated = await BusinessLink.create({
      businessId: original.businessId,
      title: `${original.title} (Copy)`,
      description: original.description,
      type: original.type,
      url: original.url,
      icon: original.icon,
      imageUrl: original.imageUrl,
      isActive: original.isActive,
      isFeatured: original.isFeatured,
      openInNewTab: original.openInNewTab,
      sortOrder,
      customBadge: original.customBadge,
      highlightColor: original.highlightColor,
    });

    res.status(201).json({ success: true, message: 'Link duplicated successfully', link: duplicated });
  } catch (error: any) {
    console.error('duplicateLink error:', error);
    res.status(500).json({ success: false, message: 'Failed to duplicate link' });
  }
};

export const toggleLinkActive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const link = await BusinessLink.findById(id);

    if (!link) {
      res.status(404).json({ success: false, message: 'Link not found' });
      return;
    }

    link.isActive = !link.isActive;
    await link.save();

    res.json({
      success: true,
      message: `Link ${link.isActive ? 'activated' : 'deactivated'}`,
      link,
    });
  } catch (error: any) {
    console.error('toggleLinkActive error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle link status' });
  }
};

export const reorderLinks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items } = req.body as { items: Array<{ id: string; sortOrder: number }> };

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Items array is required' });
      return;
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortOrder: item.sortOrder } },
      },
    }));

    await BusinessLink.bulkWrite(bulkOps);

    res.json({ success: true, message: 'Links reordered successfully' });
  } catch (error: any) {
    console.error('reorderLinks error:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder links' });
  }
};
