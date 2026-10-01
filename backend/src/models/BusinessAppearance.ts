import mongoose, { Schema, Document } from 'mongoose';

export type ThemePreset =
  | 'classic'
  | 'minimal'
  | 'elegant'
  | 'modern'
  | 'dark'
  | 'soft'
  | 'bakery'
  | 'neon';

export interface IBusinessAppearance extends Document {
  businessId: mongoose.Types.ObjectId;
  theme: ThemePreset;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  textColor: string;
  cardStyle: string;
  buttonStyle: string;
  borderRadius: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  profileLayout: 'centered' | 'banner-avatar' | 'clean-compact';
  backgroundPattern: 'none' | 'dots' | 'grid' | 'mesh';
  showVerifiedBadge: boolean;
  showShareButton: boolean;
  showQrButton: boolean;
  showHoursCard: boolean;
  showAboutCard: boolean;
  showContactCard: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appearanceSchema = new Schema<IBusinessAppearance>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      unique: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ['classic', 'minimal', 'elegant', 'modern', 'dark', 'soft', 'bakery', 'neon'],
      default: 'bakery',
    },
    primaryColor: {
      type: String,
      default: '#f97316',
    },
    secondaryColor: {
      type: String,
      default: '#c2410c',
    },
    backgroundColor: {
      type: String,
      default: '#fff7ed',
    },
    cardBackgroundColor: {
      type: String,
      default: '#ffffff',
    },
    textColor: {
      type: String,
      default: '#1f2937',
    },
    cardStyle: {
      type: String,
      default: 'rounded-glass',
    },
    buttonStyle: {
      type: String,
      default: 'pill',
    },
    borderRadius: {
      type: String,
      default: 'xl',
    },
    fontFamily: {
      type: String,
      enum: ['sans', 'serif', 'mono'],
      default: 'sans',
    },
    profileLayout: {
      type: String,
      enum: ['centered', 'banner-avatar', 'clean-compact'],
      default: 'banner-avatar',
    },
    backgroundPattern: {
      type: String,
      enum: ['none', 'dots', 'grid', 'mesh'],
      default: 'mesh',
    },
    showVerifiedBadge: {
      type: Boolean,
      default: true,
    },
    showShareButton: {
      type: Boolean,
      default: true,
    },
    showQrButton: {
      type: Boolean,
      default: true,
    },
    showHoursCard: {
      type: Boolean,
      default: true,
    },
    showAboutCard: {
      type: Boolean,
      default: true,
    },
    showContactCard: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BusinessAppearance = mongoose.model<IBusinessAppearance>(
  'BusinessAppearance',
  appearanceSchema
);
