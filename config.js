// External configuration loader
const config = {
    mongodb: {
        uri: process.env.MONGODB_URI || process.env.DATABASE_URL,
    },
    session: {
        secret: process.env.SESSION_SECRET || 'fallback-secret'
    },
    port: process.env.PORT || 3000
};

module.exports = config;