import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String, default: null },
  referralCode: { type: String, required: true, unique: true, index: true },
  referralPoints: { type: Number, default: 0, min: 0 },
  role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user', index: true },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
