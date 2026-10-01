import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  pinHash?: string;
  role: 'super_admin' | 'business_admin';
  businessIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  comparePin(candidatePin: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    pinHash: {
      type: String,
    },
    role: {
      type: String,
      enum: ['super_admin', 'business_admin'],
      default: 'super_admin',
    },
    businessIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Business',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.comparePin = async function (candidatePin: string): Promise<boolean> {
  if (!this.pinHash) return false;
  return bcrypt.compare(candidatePin, this.pinHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
