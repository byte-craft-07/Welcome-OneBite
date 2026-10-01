import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { Business } from '../models/Business';
import { BusinessAppearance } from '../models/BusinessAppearance';

export const getBusinessQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { format = 'png', color, bgcolor } = req.query;

    const business = await Business.findOne({ slug: slug.toLowerCase() });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }

    const appearance = await BusinessAppearance.findOne({ businessId: business._id });

    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const publicUrl = `${clientBaseUrl}/${business.slug}`;

    const darkColor = (color as string) || (appearance?.primaryColor || '#000000');
    const lightColor = (bgcolor as string) || '#ffffff';

    if (format === 'svg') {
      const svg = await QRCode.toString(publicUrl, {
        type: 'svg',
        color: {
          dark: darkColor,
          light: lightColor,
        },
        margin: 2,
        width: 380,
      });

      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svg);
      return;
    }

    // Default: base64 Data URL or PNG download
    const qrDataUrl = await QRCode.toDataURL(publicUrl, {
      color: {
        dark: darkColor,
        light: lightColor,
      },
      margin: 2,
      width: 400,
      errorCorrectionLevel: 'H',
    });

    res.json({
      success: true,
      publicUrl,
      qrDataUrl,
      businessName: business.name,
      slug: business.slug,
    });
  } catch (error: any) {
    console.error('getBusinessQR error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR code' });
  }
};
