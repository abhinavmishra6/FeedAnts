import { z } from 'zod';
import { User } from '../models/User.js';
import { Registration } from '../models/Registration.js';
import { Submission } from '../models/Submission.js';
const profile = z.object({ name: z.string().min(2).max(80) });
export async function me(req, res) { const user = await User.findById(req.user.sub).select('-passwordHash').lean(); if (!user) return res.status(404).json({ error: 'User not found.' }); const [joined, submissions] = await Promise.all([Registration.countDocuments({ user: user._id }), Submission.countDocuments({ user: user._id })]); res.json({ ...user, stats: { joined, submissions, wins: 0 } }); }
export async function updateMe(req, res) { const data = profile.parse(req.body); const user = await User.findByIdAndUpdate(req.user.sub, data, { new: true }).select('-passwordHash'); res.json(user); }
export async function avatar(req, res) { if (!req.file) return res.status(400).json({ error: 'Select an image first.' }); const user = await User.findByIdAndUpdate(req.user.sub, { avatarUrl: `/uploads/avatars/${req.file.filename}` }, { new: true }).select('-passwordHash'); res.json(user); }
