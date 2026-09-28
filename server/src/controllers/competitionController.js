import mongoose from 'mongoose';
import { Competition } from '../models/Competition.js';
import { Registration } from '../models/Registration.js';
import { Participant } from '../models/Participant.js';
import { Submission } from '../models/Submission.js';
import { registerForCompetition } from '../services/registrationService.js';
import { User } from '../models/User.js';
import { z } from 'zod';

const person = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email(), phone: z.string().trim().regex(/^[+0-9 ()-]{7,20}$/, 'Enter a valid phone number'), institution: z.string().trim().min(2).max(160).optional(), course: z.string().trim().min(2).max(120).optional(), yearSemester: z.string().trim().min(1).max(40).optional(), city: z.string().trim().min(2).max(80).optional() });
const registrationInput = z.object({ fullName: z.string().trim().min(2).max(80), email: z.string().trim().email(), phone: z.string().trim().regex(/^[+0-9 ()-]{7,20}$/, 'Enter a valid phone number'), institution: z.string().trim().min(2).max(160), course: z.string().trim().min(2).max(120), yearSemester: z.string().trim().min(1).max(40), city: z.string().trim().min(2).max(80), teamName: z.string().trim().max(80).optional().default(''), referralCode: z.string().trim().max(40).optional().default(''), members: z.array(person).max(19).default([]) }).transform((x) => ({ ...x, referralCode: x.referralCode.toUpperCase() }));

function lifecycle(competition, now = new Date()) {
  if (now < competition.registrationClosesAt) return 'registration_open';
  if (now < competition.submissionStartsAt) return 'registration_closed';
  if (now < competition.submissionEndsAt) return 'submission_open';
  if (now < competition.resultAt) return 'awaiting_results';
  return 'completed';
}
export async function details(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid competition ID.' });
  const competition = await Competition.findById(req.params.id).lean();
  if (!competition) return res.status(404).json({ error: 'Competition not found.' });
  const registration = await Registration.findOne({ competition: competition._id, user: req.user.sub }).lean();
  res.json({ ...competition, remainingSpots: Math.max(0, competition.capacity - competition.registeredCount), lifecycle: lifecycle(competition), registration: registration ? { status: registration.status, id: registration._id } : null, serverTime: new Date().toISOString() });
}
export async function featured(req, res) {
  const competition = await Competition.findOne({ registrationClosesAt: { $gt: new Date() } }).sort({ registrationClosesAt: 1 }).select('_id').lean();
  if (!competition) return res.status(404).json({ error: 'No active competitions found.' });
  res.json({ id: competition._id });
}
export async function list(req, res) {
  const { q = '', category, lifecycle: state, maxFee, sort = 'closing' } = req.query; const now = new Date(); const filter = {};
  if (q) filter.$text = { $search: q }; if (category) filter.category = category; if (maxFee !== undefined) filter.entryFee = { $lte: Number(maxFee) };
  if (state === 'registration_open') filter.registrationClosesAt = { $gt: now }; if (state === 'upcoming') filter.submissionStartsAt = { $gt: now }; if (state === 'completed') filter.resultAt = { $lte: now };
  const ordering = { fee_low: { entryFee: 1 }, prize_high: { prizePool: -1 }, newest: { createdAt: -1 }, closing: { registrationClosesAt: 1 } };
  const rows = await Competition.find(filter).sort(ordering[sort] || ordering.closing).limit(50).lean();
  res.json(rows.map((c) => ({ ...c, remainingSpots: Math.max(0, c.capacity - c.registeredCount), lifecycle: lifecycle(c) })));
}
export async function home(req, res) {
  const now = new Date(); const [featuredCompetition, upcoming, joined] = await Promise.all([Competition.findOne({ registrationClosesAt: { $gt: now } }).sort({ registrationClosesAt: 1 }).lean(), Competition.find({ submissionStartsAt: { $gt: now } }).sort({ submissionStartsAt: 1 }).limit(6).lean(), Registration.find({ user: req.user.sub }).populate('competition').sort({ createdAt: -1 }).limit(6).lean()]);
  const decorate = (c) => c && ({ ...c, remainingSpots: Math.max(0, c.capacity - c.registeredCount), lifecycle: lifecycle(c) });
  res.json({ featured: decorate(featuredCompetition), upcoming: upcoming.map(decorate), joined: joined.map((r) => ({ ...r, competition: decorate(r.competition) })) });
}
export async function createRegistration(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid competition ID.' });
  try { const data = registrationInput.parse(req.body); const competition = await Competition.findById(req.params.id).select('maxParticipantsPerRegistration'); if (!competition) return res.status(404).json({ error: 'Competition not found.' }); if (data.members.length + 1 > competition.maxParticipantsPerRegistration) return res.status(400).json({ error: `A team can have at most ${competition.maxParticipantsPerRegistration} participants.` }); const registration = await registerForCompetition(req.params.id, req.user.sub, data); res.status(201).json({ registration }); }
  catch (error) { if (error.status) return res.status(error.status).json({ error: error.message }); next(error); }
}
export async function myRegistration(req, res) {
  const row = await Registration.findOne({ competition: req.params.id, user: req.user.sub }).lean();
  if (!row) return res.status(404).json({ error: 'No registration found.' });
  const [teamMembers, submission] = await Promise.all([
    Participant.find({ registration: row._id }).sort({ role: 1, createdAt: 1 }).lean(),
    Submission.findOne({ competition: req.params.id, user: req.user.sub }).lean(),
  ]);
  res.json({ ...row, teamMembers, submission: submission ? { id: submission._id, status: submission.status, submittedAt: submission.updatedAt } : null });
}
export async function registrations(req, res) {
  const user = await User.findById(req.user.sub).select('role').lean();
  if (!user || !['admin', 'organizer'].includes(user.role)) return res.status(403).json({ error: 'Organizer access is required.' });
  const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const q = String(req.query.q || '').trim(); const status = String(req.query.status || '').trim();
  const filter = { competition: req.params.id, ...(status ? { status } : {}), ...(q ? { $or: [{ fullName: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { teamName: new RegExp(q, 'i') }] } : {}) };
  const [rows, total] = await Promise.all([Registration.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Registration.countDocuments(filter)]);
  const participants = await Participant.find({ registration: { $in: rows.map((row) => row._id) } }).lean();
  const teams = new Map(); for (const person of participants) teams.set(person.registration.toString(), [...(teams.get(person.registration.toString()) || []), person]);
  res.json({ rows: rows.map((row) => ({ ...row, teamMembers: teams.get(row._id.toString()) || [] })), page, limit, total, pages: Math.ceil(total / limit) });
}
