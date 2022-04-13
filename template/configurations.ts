export const opts = {
  PRODUCTION: process.env.NODE_ENV === 'production',
  DEBUG: process.env.NODE_ENV !== 'production',
  'ifdef-verbose': true,
};

export const fileName = 'remoteEntry.js';
