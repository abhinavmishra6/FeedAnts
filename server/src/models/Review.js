import mongoose from 'mongoose';
const reviewSchema = new mongoose.Schema({
  competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, rating: { type: Number, required: true, min: 1, max: 5 }, text: { type: String, required: true, trim: true, maxlength: 500 },
}, { timestamps: true });
reviewSchema.index({ competition: 1, user: 1 }, { unique: true });
export const Review = mongoose.model('Review', reviewSchema);
