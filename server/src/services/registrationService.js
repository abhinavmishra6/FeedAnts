import mongoose from 'mongoose';
import { Competition } from '../models/Competition.js';
import { Registration } from '../models/Registration.js';
import { Participant } from '../models/Participant.js';
import { User } from '../models/User.js';
import { Referral } from '../models/Referral.js';

export async function registerForCompetition(competitionId, userId, data) {
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!hello.setName) return registerOnStandalone(competitionId, userId, data);
  const session = await mongoose.startSession();
  try {
    let registration;
    await session.withTransaction(async () => {
      const now = new Date();
      // Conditional increment is the capacity gate: only one competing request can consume a final place.
      const competition = await Competition.findOneAndUpdate(
        { _id: competitionId, registrationClosesAt: { $gt: now }, $expr: { $lt: ['$registeredCount', '$capacity'] } },
        { $inc: { registeredCount: 1 } }, { new: true, session }
      );
      if (!competition) {
        const existing = await Competition.findById(competitionId).session(session);
        if (!existing) throw Object.assign(new Error('Competition not found.'), { status: 404 });
        if (existing.registrationClosesAt <= now) throw Object.assign(new Error('Registration has closed.'), { status: 422 });
        throw Object.assign(new Error('This competition is full.'), { status: 409 });
      }
      try {
        [registration] = await Registration.create([{ competition: competition._id, user: userId, ...data }], { session });
        await Participant.create([{ registration: registration._id, name: data.fullName, email: data.email, phone: data.phone, institution: data.institution, course: data.course, yearSemester: data.yearSemester, city: data.city, role: 'primary' }, ...data.members.map(({ name, email, phone, institution = '', course = '', yearSemester = '', city = '' }) => ({ registration: registration._id, name, email, phone, institution, course, yearSemester, city, role: 'participant' }))], { session });
        if (data.referralCode) {
          const referrer = await User.findOne({ referralCode: data.referralCode }).session(session);
          if (!referrer) throw Object.assign(new Error('Referral code is invalid.'), { status: 422 });
          if (referrer._id.toString() === userId) throw Object.assign(new Error('You cannot use your own referral code.'), { status: 422 });
          if (await Referral.exists({ referredUser: userId }).session(session)) throw Object.assign(new Error('A referral is already attributed to you.'), { status: 409 });
          await Referral.create([{ referralCode: data.referralCode, referrerUser: referrer._id, referredUser: userId }], { session });
          await User.updateOne({ _id: referrer._id }, { $inc: { referralPoints: 10 } }, { session });
        }
      } catch (error) {
        if (error.code === 11000) throw Object.assign(new Error('You are already registered.'), { status: 409 });
        throw error;
      }
    });
    return registration;
  } finally { await session.endSession(); }
}

// Local MongoDB installations are commonly standalone and therefore reject
// transactions.  The capacity update remains atomic; later failures are
// explicitly compensated so the development path has the same user-visible
// guarantees as the replica-set transaction above.
async function registerOnStandalone(competitionId, userId, data) {
  const now = new Date();
  const competition = await Competition.findById(competitionId);
  if (!competition) throw Object.assign(new Error('Competition not found.'), { status: 404 });
  if (competition.registrationClosesAt <= now) throw Object.assign(new Error('Registration has closed.'), { status: 422 });

  let registration;
  let referral;
  let capacityClaimed = false;
  try {
    if (data.referralCode) {
      const referrer = await User.findOne({ referralCode: data.referralCode });
      if (!referrer) throw Object.assign(new Error('Referral code is invalid.'), { status: 422 });
      if (referrer._id.toString() === userId) throw Object.assign(new Error('You cannot use your own referral code.'), { status: 422 });
      if (await Referral.exists({ referredUser: userId })) throw Object.assign(new Error('A referral is already attributed to you.'), { status: 409 });
      referral = await Referral.create({ referralCode: data.referralCode, referrerUser: referrer._id, referredUser: userId });
    }
    registration = await Registration.create({ competition: competition._id, user: userId, ...data });
    await Participant.create([
      { registration: registration._id, name: data.fullName, email: data.email, phone: data.phone, institution: data.institution, course: data.course, yearSemester: data.yearSemester, city: data.city, role: 'primary' },
      ...data.members.map(({ name, email, phone, institution = '', course = '', yearSemester = '', city = '' }) => ({ registration: registration._id, name, email, phone, institution, course, yearSemester, city, role: 'participant' })),
    ]);
    const claimed = await Competition.findOneAndUpdate(
      { _id: competitionId, registrationClosesAt: { $gt: now }, $expr: { $lt: ['$registeredCount', '$capacity'] } },
      { $inc: { registeredCount: 1 } }, { new: true }
    );
    if (!claimed) {
      const current = await Competition.findById(competitionId);
      throw Object.assign(new Error(current?.registrationClosesAt <= now ? 'Registration has closed.' : 'This competition is full.'), { status: current?.registrationClosesAt <= now ? 422 : 409 });
    }
    capacityClaimed = true;
    if (referral) await User.updateOne({ _id: referral.referrerUser }, { $inc: { referralPoints: 10 } });
    return registration;
  } catch (error) {
    if (capacityClaimed) await Competition.updateOne({ _id: competitionId, registeredCount: { $gt: 0 } }, { $inc: { registeredCount: -1 } });
    if (registration) {
      await Participant.deleteMany({ registration: registration._id });
      await Registration.deleteOne({ _id: registration._id });
    }
    if (referral) await Referral.deleteOne({ _id: referral._id });
    if (error.code === 11000) throw Object.assign(new Error('You are already registered or referral attribution already exists.'), { status: 409 });
    throw error;
  }
}
