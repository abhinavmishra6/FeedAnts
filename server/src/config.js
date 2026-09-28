import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET'];
for (const name of required) if (!process.env[name]) console.warn(`Missing ${name}; configure server/.env before starting.`);

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  publicAppUrl: process.env.PUBLIC_APP_URL || '',
};
