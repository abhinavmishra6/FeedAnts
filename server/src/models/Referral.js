import mongoose from 'mongoose';
const referralSchema = new mongoose.Schema({
  referralCode: { type: String, required: true, index: true },
  referrerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  status: { type: String, enum: ['attributed', 'rewarded'], default: 'attributed' }, rewardPoints: { type: Number, default: 10 },
}, { timestamps: true });
export const Referral = mongoose.model('Referral', referralSchema);
