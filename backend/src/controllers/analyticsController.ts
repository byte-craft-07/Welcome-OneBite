import mongoose from 'mongoose';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { BusinessLink } from '../models/BusinessLink';
import { Business } from '../models/Business';
import { AuthRequest } from '../middleware/auth';

const getDeviceType = (userAgent = ''): 'mobile' | 'desktop' | 'tablet' => {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    return 'mobile';
  }
  return 'desktop';
};

const hashIp = (ip = ''): string => {
  return crypto.createHash('sha256').update(ip + 'salt_2026').digest('hex').substring(0, 16);
};

export const trackPageView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const business = await Business.findOne({ slug: slug.toLowerCase() });

    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }

    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || (req.body.referrer as string) || '';
    const ip = req.ip || req.socket.remoteAddress || '';

    await AnalyticsEvent.create({
      businessId: business._id,
      eventType: 'page_view',
      deviceType: getDeviceType(userAgent),
      referrer,
      userAgent,
      ipHash: hashIp(ip),
    });

    res.json({ success: true, message: 'View tracked' });
  } catch (error) {
    // Non-blocking error response
    res.status(200).json({ success: false, message: 'Tracking failed quietly' });
  }
};

export const trackLinkClick = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, linkId } = req.params;
    const business = await Business.findOne({ slug: slug.toLowerCase() });

    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }

    // Increment clickCount on the link
    const link = await BusinessLink.findByIdAndUpdate(
      linkId,
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || (req.body.referrer as string) || '';
    const ip = req.ip || req.socket.remoteAddress || '';

    await AnalyticsEvent.create({
      businessId: business._id,
      linkId: link?._id,
      eventType: 'link_click',
      deviceType: getDeviceType(userAgent),
      referrer,
      userAgent,
      ipHash: hashIp(ip),
    });

    res.json({ success: true, message: 'Click tracked', clickCount: link?.clickCount || 0 });
  } catch (error) {
    // Return 200 so navigation never breaks
    res.status(200).json({ success: false, message: 'Tracking failed quietly' });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = (req.query.businessId as string) || req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business ID is required' });
      return;
    }

    const { days = '30' } = req.query;
    const daysCount = parseInt(days as string, 10) || 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysCount);

    const bizObjId = new mongoose.Types.ObjectId(businessId as string);

    // Total page views
    const totalViews = await AnalyticsEvent.countDocuments({
      businessId: bizObjId,
      eventType: 'page_view',
      timestamp: { $gte: sinceDate },
    });

    // Total link clicks
    const totalClicks = await AnalyticsEvent.countDocuments({
      businessId: bizObjId,
      eventType: 'link_click',
      timestamp: { $gte: sinceDate },
    });

    // Unique visitors (distinct ipHash)
    const uniqueVisitors = (
      await AnalyticsEvent.distinct('ipHash', {
        businessId: bizObjId,
        eventType: 'page_view',
        timestamp: { $gte: sinceDate },
      })
    ).length;

    // Real click count per link for the period
    const allLinks = await BusinessLink.find({ businessId: bizObjId })
      .select('title type clickCount url isFeatured')
      .lean();

    const linkClicksAgg = await AnalyticsEvent.aggregate([
      {
        $match: {
          businessId: bizObjId,
          eventType: 'link_click',
          timestamp: { $gte: sinceDate },
          linkId: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$linkId',
          count: { $sum: 1 },
        },
      },
    ]);

    const realClicksMap: Record<string, number> = {};
    linkClicksAgg.forEach((item) => {
      if (item._id) {
        realClicksMap[item._id.toString()] = item.count;
      }
    });

    const topLinks = allLinks
      .map((l) => {
        const idStr = l._id.toString();
        const periodClicks = realClicksMap[idStr] !== undefined ? realClicksMap[idStr] : 0;
        return {
          id: idStr,
          title: l.title,
          type: l.type,
          url: l.url,
          isFeatured: l.isFeatured,
          clickCount: periodClicks,
          totalAllTimeClicks: l.clickCount || periodClicks,
        };
      })
      .sort((a, b) => b.clickCount - a.clickCount);

    // Device breakdown
    const devices = await AnalyticsEvent.aggregate([
      {
        $match: {
          businessId: bizObjId,
          timestamp: { $gte: sinceDate },
        },
      },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
    ]);

    const deviceMap = { mobile: 0, desktop: 0, tablet: 0 };
    devices.forEach((d) => {
      if (d._id in deviceMap) {
        deviceMap[d._id as keyof typeof deviceMap] = d.count;
      }
    });

    // Click-through rate
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

    // Prior period comparison for real trends
    const prevSinceDate = new Date(sinceDate);
    prevSinceDate.setDate(prevSinceDate.getDate() - daysCount);

    const prevViews = await AnalyticsEvent.countDocuments({
      businessId: bizObjId,
      eventType: 'page_view',
      timestamp: { $gte: prevSinceDate, $lt: sinceDate },
    });

    const prevClicks = await AnalyticsEvent.countDocuments({
      businessId: bizObjId,
      eventType: 'link_click',
      timestamp: { $gte: prevSinceDate, $lt: sinceDate },
    });

    const prevUnique = (
      await AnalyticsEvent.distinct('ipHash', {
        businessId: bizObjId,
        eventType: 'page_view',
        timestamp: { $gte: prevSinceDate, $lt: sinceDate },
      })
    ).length;

    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const diff = Math.round(((curr - prev) / prev) * 100);
      return diff >= 0 ? `+${diff}%` : `${diff}%`;
    };

    const trends = {
      viewsTrend: calcTrend(totalViews, prevViews),
      clicksTrend: calcTrend(totalClicks, prevClicks),
      uniqueTrend: calcTrend(uniqueVisitors, prevUnique),
    };

    // Daily breakdown for graph
    const dailyEvents = await AnalyticsEvent.aggregate([
      {
        $match: {
          businessId: bizObjId,
          timestamp: { $gte: sinceDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            type: '$eventType',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalViews,
        totalClicks,
        uniqueVisitors,
        ctr: `${ctr}%`,
        deviceMap,
        topLinks,
        dailyEvents,
        trends,
      },
    });
  } catch (error: any) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics' });
  }
};
