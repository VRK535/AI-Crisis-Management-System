import dotenv from "dotenv";

dotenv.config();

const env = {
    nodeEnv: process.env.NODE_ENV || "development",

    port: Number(process.env.PORT) || 5000,

    mongoUri: process.env.MONGO_URI,

    jwtSecret: process.env.JWT_SECRET,

    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

    logLevel: process.env.LOG_LEVEL || "info"
};

export default env;