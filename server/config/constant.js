const config = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/google_drive",
  ORIGIN: "http://localhost:5173",
  COOKIE_SECRET: "secret",
  jwtSecret: "secret",
  jwtExpiration: 60 * 60 * 24 * 7,
};

export default config;
