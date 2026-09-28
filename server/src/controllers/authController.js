import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { config } from '../config.js';

const credentials = z.object({ name: z.string().min(2).max(80).optional(), email: z.string().email(), password: z.string().min(8).max(100) });
const tokenFor = (user) => jwt.sign({ sub: user._id.toString(), name: user.name }, config.jwtSecret, { expiresIn: '7d' });

export async function register(req, res) {
  const data = credentials.extend({ name: z.string().min(2).max(80) }).parse(req.body);
  if (await User.exists({ email: data.email.toLowerCase() })) return res.status(409).json({ error: 'An account already exists for this email.' });
  const referralCode = `${data.name.replace(/[^a-z]/gi, '').slice(0, 5).toUpperCase()}${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const user = await User.create({ name: data.name, email: data.email, passwordHash: await bcrypt.hash(data.password, 12), referralCode });
  res.status(201).json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
}
export async function login(req, res) {
  const data = credentials.pick({ email: true, password: true }).parse(req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password.' });
  res.json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
}
