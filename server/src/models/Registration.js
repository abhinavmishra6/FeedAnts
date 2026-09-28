import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['registered', 'submitted', 'withdrawn'], default: 'registered' },
  paymentStatus: { type: String, enum: ['unavailable', 'pending', 'paid'], default: 'unavailable' },
  fullName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  institution: { type: String, required: true, trim: true, maxlength: 160 },
  course: { type: String, required: true, trim: true, maxlength: 120 },
  yearSemester: { type: String, required: true, trim: true, maxlength: 40 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  teamName: { type: String, trim: true, maxlength: 80, default: '' },
  referralCode: { type: String, trim: true, uppercase: true, default: '' },
}, { timestamps: true });

registrationSchema.index({ competition: 1, user: 1 }, { unique: true });
export const Registration = mongoose.model('Registration', registrationSchema);
