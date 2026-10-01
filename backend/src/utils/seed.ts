import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from '../models/User';
import { Business } from '../models/Business';
import { BusinessLink } from '../models/BusinessLink';
import { BusinessHours } from '../models/BusinessHours';
import { BusinessAppearance } from '../models/BusinessAppearance';
import { AnalyticsEvent } from '../models/AnalyticsEvent';

export const seedDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/business_link_hub';
  await mongoose.connect(uri);

  console.log('[Seed] Checking existing data...');
  const existingBusiness = await Business.findOne({ slug: 'onebite-bakery' });

  // Always ensure Admin User exists with PIN 753753
  const adminEmail = 'admin@businesslinkhub.local';
  let adminUser = await User.findOne({ email: adminEmail });
  const pinHash = await bcrypt.hash('753753', 10);
  const passwordHash = await bcrypt.hash('admin123456', 10);

  if (!adminUser) {
    adminUser = await User.create({
      email: adminEmail,
      passwordHash,
      pinHash,
      role: 'super_admin',
      isActive: true,
    });
    console.log('[Seed] Created default Admin User (admin@businesslinkhub.local / admin123456 | PIN: 753753)');
  } else {
    // Ensure PIN 753753 is set
    adminUser.pinHash = pinHash;
    await adminUser.save();
    console.log('[Seed] Admin user verified with PIN 753753');
  }

  if (existingBusiness) {
    console.log('[Seed] OneBite Bakery already seeded. Skipping recreation.');
    return;
  }

  // Create OneBite Bakery Business Profile
  const business = await Business.create({
    name: 'OneBite Bakery',
    slug: 'onebite-bakery',
    tagline: 'Freshly made for your moments',
    shortDescription: 'Artisan breads, handcrafted pastries & specialty coffee brewed fresh daily.',
    description:
      'Welcome to OneBite Bakery! We craft small-batch sourdough loaves, golden French viennoiserie, gourmet celebration cakes, and specialty espresso roasted to perfection. Everything is baked fresh each morning using genuine ingredients.',
    category: 'Bakery & Cafe',
    logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80',
    profileImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    whatsappDefaultMessage: 'Hello OneBite Bakery! I would like to place an order from your Link Hub.',
    email: 'orders@onebitebakery.com',
    websiteUrl: 'https://onebitebakery.com',
    mapUrl: 'https://maps.google.com/?q=OneBite+Bakery',
    instagramUrl: 'https://instagram.com/onebitebakery',
    facebookUrl: 'https://facebook.com/onebitebakery',
    youtubeUrl: 'https://youtube.com/@onebitebakery',
    address: {
      street: '14 Bakers Lane, Heritage Square',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400050',
      fullAddress: '14 Bakers Lane, Near Heritage Square, Bandra West, Mumbai 400050',
    },
    timezone: 'Asia/Kolkata',
    isPublished: true,
    isVerified: true,
    aboutSection: {
      enabled: true,
      title: 'About OneBite',
      description:
        'Founded with a passion for slow fermentation and authentic patisserie techniques, OneBite brings European bakery traditions to your neighborhood. Every single loaf undergoes 24 hours of wild yeast sourdough fermentation, and every pastry is laminated by hand with European butter.',
      imageUrl: '',
    },
    seo: {
      title: 'OneBite Bakery | Freshly Made For Your Moments',
      description: 'Order fresh artisan sourdough, croissants, custom cakes & coffee from OneBite Bakery.',
      keywords: ['bakery', 'sourdough', 'croissants', 'pastry', 'coffee', 'mumbai'],
      ogImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    },
  });

  // Assign business to admin
  adminUser.businessIds.push(business._id as any);
  await adminUser.save();

  // Create default starter links
  const linksData = [
    {
      businessId: business._id,
      title: 'ORDER FROM WEBSITE',
      description: 'Browse our full freshly baked menu & order online',
      type: 'website' as const,
      url: 'https://onebitebakery.com/menu',
      icon: 'ShoppingBag',
      isActive: true,
      isFeatured: true,
      openInNewTab: true,
      sortOrder: 0,
      customBadge: 'Fresh Daily',
      highlightColor: '#f97316',
      clickCount: 0,
    },
    {
      businessId: business._id,
      title: 'FIND US ON MAP',
      description: 'Visit our cozy bakery cafe in Bandra West',
      type: 'map' as const,
      url: 'https://maps.google.com/?q=OneBite+Bakery',
      icon: 'MapPin',
      isActive: true,
      isFeatured: false,
      openInNewTab: true,
      sortOrder: 1,
      clickCount: 0,
    },
    {
      businessId: business._id,
      title: 'FOLLOW ON INSTAGRAM',
      description: '@onebitebakery — Daily baking stories & specials',
      type: 'instagram' as const,
      url: 'https://instagram.com/onebitebakery',
      icon: 'Instagram',
      isActive: true,
      isFeatured: false,
      openInNewTab: true,
      sortOrder: 2,
      clickCount: 0,
    },
    {
      businessId: business._id,
      title: 'ORDER ON WHATSAPP',
      description: 'Chat directly with our baker for custom orders',
      type: 'whatsapp' as const,
      url: '',
      icon: 'MessageCircle',
      isActive: true,
      isFeatured: true,
      openInNewTab: true,
      sortOrder: 3,
      customBadge: 'Fast Reply',
      highlightColor: '#22c55e',
      clickCount: 0,
    },
    {
      businessId: business._id,
      title: 'CONTACT US',
      description: 'Give us a call for reservations & catering inquiries',
      type: 'phone' as const,
      url: '',
      icon: 'PhoneCall',
      isActive: true,
      isFeatured: false,
      openInNewTab: false,
      sortOrder: 4,
      clickCount: 0,
    },
    {
      businessId: business._id,
      title: 'ABOUT ONEBITE',
      description: 'Our heritage, ingredients, and craft bakery story',
      type: 'about' as const,
      url: '#about',
      icon: 'Info',
      isActive: true,
      isFeatured: false,
      openInNewTab: false,
      sortOrder: 5,
      clickCount: 0,
    },
  ];

  await BusinessLink.insertMany(linksData);

  // Create Business Hours (Mon-Sat 08:30-22:00, Sun 09:00-21:00)
  const days = [
    { day: 'monday' as const, isOpen: true, openTime: '08:30', closeTime: '22:00' },
    { day: 'tuesday' as const, isOpen: true, openTime: '08:30', closeTime: '22:00' },
    { day: 'wednesday' as const, isOpen: true, openTime: '08:30', closeTime: '22:00' },
    { day: 'thursday' as const, isOpen: true, openTime: '08:30', closeTime: '22:00' },
    { day: 'friday' as const, isOpen: true, openTime: '08:30', closeTime: '22:30' },
    { day: 'saturday' as const, isOpen: true, openTime: '08:30', closeTime: '22:30' },
    { day: 'sunday' as const, isOpen: true, openTime: '09:00', closeTime: '21:00' },
  ];

  await BusinessHours.create({
    businessId: business._id,
    timezone: 'Asia/Kolkata',
    days,
    specialNotes: 'Fresh sourdough loaves come out of the stone deck oven daily at 09:00 AM & 04:00 PM.',
  });

  // Create Business Appearance
  await BusinessAppearance.create({
    businessId: business._id,
    theme: 'bakery',
    primaryColor: '#ea580c',
    secondaryColor: '#9a3412',
    backgroundColor: '#fffbeb',
    cardBackgroundColor: '#ffffff',
    textColor: '#1c1917',
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

  // Seed some initial analytics events for the dashboard
  const sampleEvents = [];
  const now = new Date();
  for (let i = 0; i < 28; i++) {
    const eventDate = new Date(now.getTime() - i * 3600 * 1000 * 6);
    sampleEvents.push({
      businessId: business._id,
      eventType: 'page_view' as const,
      timestamp: eventDate,
      deviceType: i % 3 === 0 ? 'desktop' : 'mobile',
      referrer: i % 2 === 0 ? 'https://instagram.com' : 'Direct / QR',
      userAgent: 'Mozilla/5.0 Mobile',
      ipHash: `ip_hash_${i % 12}`,
    });
  }
  await AnalyticsEvent.insertMany(sampleEvents);

  console.log('[Seed] OneBite Bakery successfully seeded with links, hours, appearance and admin PIN!');
};

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error seeding database:', err);
      process.exit(1);
    });
}
