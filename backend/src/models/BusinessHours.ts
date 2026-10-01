import mongoose, { Schema, Document } from 'mongoose';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface IDaySchedule {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface IBusinessHours extends Document {
  businessId: mongoose.Types.ObjectId;
  timezone: string;
  days: IDaySchedule[];
  specialNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dayScheduleSchema = new Schema<IDaySchedule>(
  {
    day: {
      type: String,
      required: true,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    openTime: {
      type: String,
      default: '09:00',
    },
    closeTime: {
      type: String,
      default: '21:00',
    },
  },
  { _id: false }
);

const businessHoursSchema = new Schema<IBusinessHours>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      unique: true,
      index: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    days: [dayScheduleSchema],
    specialNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BusinessHours = mongoose.model<IBusinessHours>('BusinessHours', businessHoursSchema);
