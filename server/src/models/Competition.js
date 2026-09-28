import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({ position: Number, label: String, amount: Number }, { _id: false });
const winnerSchema = new mongoose.Schema({ name: String, rank: String, imageUrl: String }, { _id: false });
const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  mode: { type: String, enum: ['Single-Win', 'Multi-Win'], default: 'Multi-Win' },
  certificateForWinners: { type: Boolean, default: true },
  shortDescription: { type: String, default: '' },
  tags: [{ type: String, trim: true }],
  prizePool: { type: Number, required: true, min: 0 },
  entryFee: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
  registeredCount: { type: Number, default: 0, min: 0 },
  judge: { name: String, title: String, experience: String, avatarUrl: String },
  registrationClosesAt: { type: Date, required: true },
  submissionStartsAt: { type: Date, required: true },
  submissionEndsAt: { type: Date, required: true },
  resultAt: { type: Date, required: true },
  maxParticipantsPerRegistration: { type: Number, default: 1, min: 1, max: 20 },
  introVideoUrl: { type: String, default: null },
  disclaimer: { type: String, default: '' },
  refundPolicy: { type: String, default: 'Refunds are governed by Feedants policy.' },
  paymentInformation: { type: String, default: 'Payment integration is not configured for this environment.' },
  about: { type: String, required: true },
  judgingParameters: [{ type: String }],
  rules: [{ type: String }],
  rewards: [rewardSchema],
  previousWinners: [winnerSchema],
}, { timestamps: true });

competitionSchema.index({ registrationClosesAt: 1 });
competitionSchema.index({ title: 'text', category: 'text', tags: 'text' });
competitionSchema.index({ category: 1, entryFee: 1, registrationClosesAt: 1 });
export const Competition = mongoose.model('Competition', competitionSchema);
