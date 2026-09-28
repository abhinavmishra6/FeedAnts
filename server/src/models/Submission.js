import mongoose from 'mongoose';
const submissionSchema = new mongoose.Schema({
  competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', default: null },
  fileName: { type: String, required: true }, fileType: { type: String, required: true }, fileSize: { type: Number, required: true }, filePath: { type: String, required: true },
  status: { type: String, enum: ['submitted', 'under_review', 'accepted', 'rejected'], default: 'submitted' },
}, { timestamps: true });
submissionSchema.index({ competition: 1, user: 1 }, { unique: true });
export const Submission = mongoose.model('Submission', submissionSchema);
