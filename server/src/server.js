import mongoose from 'mongoose';
import { app } from './app.js';
import { config } from './config.js';

if (!config.mongoUri || !config.jwtSecret) process.exitCode = 1;
else mongoose.connect(config.mongoUri).then(() => app.listen(config.port, () => console.log(`API listening on :${config.port}`))).catch((error) => { console.error('MongoDB connection failed', error); process.exit(1); });

