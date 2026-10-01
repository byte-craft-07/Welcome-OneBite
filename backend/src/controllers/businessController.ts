import { Request, Response } from 'express';
import { Business } from '../models/Business';
import { BusinessLink } from '../models/BusinessLink';
import { BusinessHours } from '../models/BusinessHours';
import { BusinessAppearance } from '../models/BusinessAppearance';
import { AuditLog } from '../models/AuditLog';
import { calculateOpenStatus } from '../utils/businessHoursHelper';
import { businessUpdateSchema } from '../validators';
import { AuthRequest } from '../middleware/auth';

export const getPublicBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    let query: any = { isPublished: true };

    if (slug && slug !== 'default' && slug !== 'primary') {
      query.slug = slug.toLowerCase().trim();
    }

    let business = await Business.findOne(query);

    // If specific slug not found or default requested, fallback to first available
    if (!business) {
      business = await Business.findOne({ isPublished: true });
    }

    if (!business) {
      res.status(404).json({ success: false, message: 'Business profile not found.' });
      return;
    }

    // Get active links sorted by sortOrder
    const links = await BusinessLink.find({
      businessId: business._id,
      isActive: true,
    }).sort({ sortOrder: 1, createdAt: 1 });

    // Format links: ensure proper protocol and handling for all types
    const processedLinks = links.map((link) => {
      let finalUrl = (link.url || '').trim();

      if (link.type === 'whatsapp') {
        const rawPhone = finalUrl || business?.whatsapp || '';
        if (
          rawPhone.startsWith('https://wa.me/') ||
          rawPhone.startsWith('http://wa.me/') ||
          rawPhone.startsWith('https://api.whatsapp.com/')
        ) {
          finalUrl = rawPhone;
        } else {
          const cleanNumber = rawPhone.replace(/[^0-9]/g, '');
          if (cleanNumber) {
            const phoneWithCode = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
            const msg = encodeURIComponent(business?.whatsappDefaultMessage || 'Hello! I would like to order.');
            finalUrl = `https://wa.me/${phoneWithCode}?text=${msg}`;
          }
        }
      } else if (link.type === 'phone') {
        let rawPhone = (finalUrl || business?.phone || '').trim();
        rawPhone = rawPhone.replace(/^(tel:)+/i, '').trim();
        if (/^91\+/i.test(rawPhone)) {
          rawPhone = '+' + rawPhone.replace(/^91\+/i, '91');
        }
        const digits = rawPhone.replace(/[^0-9]/g, '');
        if (digits) {
          const formatted =
            digits.length === 10
              ? `+91${digits}`
              : digits.length === 12 && digits.startsWith('91')
              ? `+${digits}`
              : rawPhone.startsWith('+')
              ? `+${digits}`
              : digits;
          finalUrl = `tel:${formatted}`;
        }
      } else if (link.type === 'email') {
        const email = finalUrl || business?.email || '';
        if (email) {
          finalUrl = email.startsWith('mailto:') ? email : `mailto:${email}`;
        }
      } else if (link.type === 'map') {
        finalUrl = finalUrl || business?.mapUrl || '';
      }

      // If URL is not an anchor, phone, mail, or protocol, prepend https://
      if (
        finalUrl &&
        !finalUrl.startsWith('#') &&
        !finalUrl.startsWith('http://') &&
        !finalUrl.startsWith('https://') &&
        !finalUrl.startsWith('tel:') &&
        !finalUrl.startsWith('mailto:')
      ) {
        finalUrl = `https://${finalUrl}`;
      }

      return {
        id: link._id,
        title: link.title,
        description: link.description,
        type: link.type,
        url: finalUrl,
        icon: link.icon,
        imageUrl: link.imageUrl,
        isFeatured: link.isFeatured,
        openInNewTab: link.openInNewTab,
        customBadge: link.customBadge,
        highlightColor: link.highlightColor,
      };
    });

    // Get hours & calculate open status
    const hours = await BusinessHours.findOne({ businessId: business._id });
    const openStatus = hours ? calculateOpenStatus(hours.days, hours.timezone || business.timezone) : null;

    // Get appearance
    let appearance = await BusinessAppearance.findOne({ businessId: business._id });
    if (!appearance) {
      appearance = new BusinessAppearance({ businessId: business._id });
    }

    // Build WhatsApp direct link
    let directWhatsAppUrl = '';
    if (business.whatsapp) {
      let cleanNumber = business.whatsapp.replace(/[^0-9]/g, '');
      if (cleanNumber.length === 10) {
        cleanNumber = `91${cleanNumber}`;
      }
      const msg = encodeURIComponent(business.whatsappDefaultMessage || 'Hello! I found your profile online.');
      directWhatsAppUrl = `https://wa.me/${cleanNumber}?text=${msg}`;
    }

    res.json({
      success: true,
      business: {
        id: business._id,
        name: business.name,
        slug: business.slug,
        tagline: business.tagline,
        shortDescription: business.shortDescription,
        description: business.description,
        category: business.category,
        logoUrl: business.logoUrl,
        coverImageUrl: business.coverImageUrl,
        profileImageUrl: business.profileImageUrl,
        phone: business.phone,
        whatsapp: business.whatsapp,
        directWhatsAppUrl,
        email: business.email,
        websiteUrl: business.websiteUrl,
        address: business.address,
        mapUrl: business.mapUrl,
        instagramUrl: business.instagramUrl,
        facebookUrl: business.facebookUrl,
        youtubeUrl: business.youtubeUrl,
        twitterUrl: business.twitterUrl,
        linkedinUrl: business.linkedinUrl,
        timezone: business.timezone,
        isVerified: business.isVerified,
        aboutSection: business.aboutSection,
        seo: business.seo,
      },
      links: processedLinks,
      hours: hours
        ? {
            timezone: hours.timezone,
            days: hours.days,
            specialNotes: hours.specialNotes,
          }
        : null,
      openStatus,
      appearance,
    });
  } catch (error: any) {
    console.error('getPublicBusiness error:', error);
    res.status(500).json({ success: false, message: 'Failed to load business profile' });
  }
};

export const getAdminBusinesses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 });
    res.json({ success: true, businesses });
  } catch (error: any) {
    console.error('getAdminBusinesses error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve businesses' });
  }
};

export const getAdminBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let businessId = req.query.businessId as string || req.businessId;

    let business;
    if (businessId) {
      business = await Business.findById(businessId);
    }
    if (!business) {
      business = await Business.findOne().sort({ createdAt: 1 });
    }

    if (!business) {
      res.status(404).json({ success: false, message: 'No business found. Please create one.' });
      return;
    }

    res.json({ success: true, business });
  } catch (error: any) {
    console.error('getAdminBusiness error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve business' });
  }
};

export const updateBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = businessUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.format(),
      });
      return;
    }

    const { businessId } = req.body;
    let targetId = businessId || req.businessId;

    let business = targetId ? await Business.findById(targetId) : await Business.findOne();

    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }

    // Check slug collision if slug changed
    if (parsed.data.slug !== business.slug) {
      const existing = await Business.findOne({ slug: parsed.data.slug, _id: { $ne: business._id } });
      if (existing) {
        res.status(400).json({ success: false, message: 'Slug is already in use by another business' });
        return;
      }
    }

    const dataToSave = { ...parsed.data };
    if (dataToSave.phone && /^91\+/i.test(dataToSave.phone)) {
      dataToSave.phone = '+91 ' + dataToSave.phone.replace(/^91\+\s*/i, '');
    }
    if (dataToSave.whatsapp && /^91\+/i.test(dataToSave.whatsapp)) {
      dataToSave.whatsapp = '+91 ' + dataToSave.whatsapp.replace(/^91\+\s*/i, '');
    }

    Object.assign(business, dataToSave);
    await business.save();

    // Log audit
    await AuditLog.create({
      businessId: business._id,
      userId: req.user?._id,
      action: 'update_business',
      entity: 'business',
      entityId: business._id.toString(),
      details: { name: business.name, slug: business.slug },
    });

    res.json({ success: true, message: 'Business updated successfully', business });
  } catch (error: any) {
    console.error('updateBusiness error:', error);
    res.status(500).json({ success: false, message: 'Failed to update business profile' });
  }
};

export const createBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = businessUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.format(),
      });
      return;
    }

    // Check if slug exists
    const existing = await Business.findOne({ slug: parsed.data.slug });
    if (existing) {
      res.status(400).json({ success: false, message: 'A business with this slug already exists' });
      return;
    }

    const business = await Business.create(parsed.data);

    // Create default hours
    const defaultDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
      (day) => ({
        day: day as any,
        isOpen: true,
        openTime: '09:00',
        closeTime: '21:00',
      })
    );

    await BusinessHours.create({
      businessId: business._id,
      timezone: business.timezone || 'Asia/Kolkata',
      days: defaultDays,
    });

    // Create default appearance
    await BusinessAppearance.create({
      businessId: business._id,
      theme: 'bakery',
      primaryColor: '#f97316',
      secondaryColor: '#c2410c',
      backgroundColor: '#fff7ed',
    });

    // Attach to user if authenticated
    if (req.user) {
      req.user.businessIds.push(business._id as any);
      await req.user.save();
    }

    res.status(201).json({ success: true, message: 'Business created successfully', business });
  } catch (error: any) {
    console.error('createBusiness error:', error);
    res.status(500).json({ success: false, message: 'Failed to create business' });
  }
};
