require('dotenv').config();

module.exports = {
  PORT: Number(process.env.PORT) || 8080,
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  SEED_ON_START: process.env.SEED_ON_START === 'true'
};
