import mongoose, { Schema, Document } from 'mongoose';

export type EventType = 'page_view' | 'link_click';

export interface IAnalyticsEvent extends Document {
  businessId: mongoose.Types.ObjectId;
  linkId?: mongoose.Types.ObjectId;
  eventType: EventType;
  timestamp: Date;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  referrer?: string;
  userAgent?: string;
  ipHash?: string;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    linkId: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessLink',
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ['page_view', 'link_click'],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet'],
      default: 'mobile',
    },
    referrer: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    ipHash: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

analyticsEventSchema.index({ businessId: 1, timestamp: -1 });
analyticsEventSchema.index({ businessId: 1, eventType: 1, timestamp: -1 });

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>(
  'AnalyticsEvent',
  analyticsEventSchema
);
