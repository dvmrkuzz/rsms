export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? '',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'rsms_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  },

  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
    model: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5',
  },

  google: {
    // Placeholder values keep passport-google-oauth20's strategy constructor
    // from throwing on boot when OAuth hasn't been configured yet — the
    // Google login button simply won't work until real credentials are set.
    // `||` (not `??`) on purpose: an empty string from an unset .env key
    // should fall back too, not just a missing one.
    clientId: process.env.GOOGLE_CLIENT_ID || 'not-configured',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'not-configured',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/google/callback',
  },

  asksorsuUrl: process.env.ASKSORSU_URL || 'http://localhost:5175',
});