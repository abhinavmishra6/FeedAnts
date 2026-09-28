import mongoose from 'mongoose';
const participantSchema = new mongoose.Schema({
  registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  institution: { type: String, trim: true, maxlength: 160, default: '' },
  course: { type: String, trim: true, maxlength: 120, default: '' },
  yearSemester: { type: String, trim: true, maxlength: 40, default: '' },
  city: { type: String, trim: true, maxlength: 80, default: '' },
  age: { type: Number, min: 3, max: 120 },
  role: { type: String, enum: ['primary', 'participant'], default: 'participant' },
  imageUrl: { type: String, default: null },
}, { timestamps: true });
participantSchema.index({ registration: 1, email: 1 }, { unique: true });
export const Participant = mongoose.model('Participant', participantSchema);
