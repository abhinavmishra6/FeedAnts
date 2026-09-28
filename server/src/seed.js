import mongoose from 'mongoose';
import { config } from './config.js';
import { Competition } from './models/Competition.js';

if (!config.mongoUri) throw new Error('Set MONGODB_URI in .env before seeding.');
await mongoose.connect(config.mongoUri);
const competition = await Competition.findOneAndUpdate({ title: 'Feedants Classical Dance' }, { $set: {
  title: 'Feedants Classical Dance', category: 'Dance', mode: 'Multi-Win', certificateForWinners: true, shortDescription: 'Showcase your classical dance talent online.', tags: ['Dance', 'Classical'], prizePool: 1500, entryFee: 99, capacity: 20, maxParticipantsPerRegistration: 4, disclaimer: 'Only paid participant contributions are considered for judging.', refundPolicy: 'Refunds may be requested before registration closes.', paymentInformation: 'Payment configuration required for production.',
  judge: { name: 'Manju Dubey', title: 'Professional Kathak Dancer', experience: '12+ Years of Experience', avatarUrl: 'https://i.pravatar.cc/160?img=47' },
  // Reference screenshot demo dates, stored as explicit UTC instants.
  registrationClosesAt: new Date('2026-08-10T18:20:00.000Z'), submissionStartsAt: new Date('2026-08-05T22:30:00.000Z'), submissionEndsAt: new Date('2026-08-30T18:25:00.000Z'), resultAt: new Date('2026-09-01T18:20:00.000Z'),
  about: 'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
  judgingParameters: ['Technique', 'Expression', 'Creativity'], rules: ['One original video submission', 'Follow the submission deadline', 'All age groups welcome'],
  rewards: [{ position: 1, label: '1st Winner', amount: 550 }, { position: 2, label: '2nd Winner', amount: 300 }, { position: 3, label: '3rd Winner', amount: 240 }, { position: 4, label: '4th Winner', amount: 200 }, { position: 5, label: '5th Winner', amount: 130 }, { position: 6, label: '6th Winner', amount: 80 }],
  // Reference/demo winner cards are persisted with the competition, never JSX.
  previousWinners: [{ name: 'Riya Shah', rank: '1st Winner', imageUrl: 'https://i.pravatar.cc/160?img=32' }, { name: 'Aarav Mehta', rank: '1st Winner', imageUrl: 'https://i.pravatar.cc/160?img=12' }, { name: 'Neha Verma', rank: '2nd Winner', imageUrl: 'https://i.pravatar.cc/160?img=44' }, { name: 'Ishita Choudhary', rank: '3rd Winner', imageUrl: 'https://i.pravatar.cc/160?img=49' }]
}, $setOnInsert: { registeredCount: 1 } 
}, { upsert: true, new: true, setDefaultsOnInsert: true });
console.log(`Seeded ${competition.id}`);
// An opt-in, future-dated record lets local API registration tests run after
// the fixed screenshot dates expire. It never replaces the reference record.
if (process.env.SEED_TEST_COMPETITION === 'true') {
  const now = Date.now();
  const testCompetition = await Competition.findOneAndUpdate({ title: 'Feedants Classical Dance (Registration Test)' }, { $set: {
    title: 'Feedants Classical Dance (Registration Test)', category: 'Dance', mode: 'Multi-Win', certificateForWinners: true,
    shortDescription: 'Clearly identified future-dated record for local registration API tests.', tags: ['Dance', 'Test'], prizePool: 1500, entryFee: 99, capacity: 20, maxParticipantsPerRegistration: 4,
    judge: { name: 'Manju Dubey', title: 'Professional Kathak Dancer', experience: '12+ Years of Experience', avatarUrl: 'https://i.pravatar.cc/160?img=47' },
    registrationClosesAt: new Date(now + 7 * 24 * 60 * 60 * 1000), submissionStartsAt: new Date(now + 8 * 24 * 60 * 60 * 1000), submissionEndsAt: new Date(now + 30 * 24 * 60 * 60 * 1000), resultAt: new Date(now + 32 * 24 * 60 * 60 * 1000),
    about: 'A future-dated local test competition. The fixed reference competition remains unchanged.', judgingParameters: ['Technique', 'Expression', 'Creativity'], rules: ['One original video submission'],
    // These are clearly reference/demo fixtures stored with this local test record,
    // so the details UI can exercise database-backed winner and reward sections.
    rewards: [{ position: 1, label: '1st Winner', amount: 550 }, { position: 2, label: '2nd Winner', amount: 300 }, { position: 3, label: '3rd Winner', amount: 240 }, { position: 4, label: '4th Winner', amount: 200 }, { position: 5, label: '5th Winner', amount: 130 }, { position: 6, label: '6th Winner', amount: 80 }],
    previousWinners: [{ name: 'Riya Shah', rank: '1st Winner', imageUrl: 'https://i.pravatar.cc/160?img=32' }, { name: 'Aarav Mehta', rank: '1st Winner', imageUrl: 'https://i.pravatar.cc/160?img=12' }, { name: 'Neha Verma', rank: '2nd Winner', imageUrl: 'https://i.pravatar.cc/160?img=44' }, { name: 'Ishita Choudhary', rank: '3rd Winner', imageUrl: 'https://i.pravatar.cc/160?img=49' }],
  }, $setOnInsert: { registeredCount: 0 },
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log(`Seeded registration test competition ${testCompetition.id}`);
  if (process.env.SEED_TEST_FULL === 'true') {
    await Competition.updateOne({ _id: testCompetition._id }, { $set: { capacity: testCompetition.registeredCount } });
    console.log(`Set registration test competition capacity to ${testCompetition.registeredCount} for a full-capacity API test`);
  }
}
await mongoose.disconnect();
