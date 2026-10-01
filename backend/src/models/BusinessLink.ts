import mongoose, { Schema, Document } from 'mongoose';

export type LinkType =
  | 'website'
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'map'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'custom'
  | 'product'
  | 'category'
  | 'booking'
  | 'about';

export interface IBusinessLink extends Document {
  businessId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: LinkType;
  url?: string;
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  openInNewTab: boolean;
  sortOrder: number;
  clickCount: number;
  customBadge?: string;
  highlightColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const businessLinkSchema = new Schema<IBusinessLink>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'website',
        'whatsapp',
        'phone',
        'email',
        'map',
        'instagram',
        'facebook',
        'youtube',
        'custom',
        'product',
        'category',
        'booking',
        'about',
      ],
      default: 'website',
    },
    url: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Globe',
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    openInNewTab: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    customBadge: {
      type: String,
      trim: true,
    },
    highlightColor: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

businessLinkSchema.index({ businessId: 1, sortOrder: 1 });

export const BusinessLink = mongoose.model<IBusinessLink>('BusinessLink', businessLinkSchema);
