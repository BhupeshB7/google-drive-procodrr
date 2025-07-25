import express from "express";
import cors from "cors";
import helmet from "helmet";
import xssClean from "xss-clean";
import compression from "compression"
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import config from "./config/constant.js";
import connectDB from "./config/db.js";
import allRoutes from "./routes/index.js";
import { limiter } from "./rate-limiter/index.js";
import   { connectRedis } from "./config/redis.js";

const PORT = config.PORT || 3000;
await connectDB();
const app = express();

app.use(express.json());
// Security Middleware
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                frameAncestors: ["'self'", "http://localhost:5173"],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

app.use(xssClean());
app.use(mongoSanitize());
app.use(compression());
// Core Middlewares
app.use(cookieParser(config.COOKIE_SECRET));
app.use(
    cors({
        origin: [
            config.ORIGIN,
            "http://192.168.139.86:5173",
            "http://192.168.134.107:5173",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Content-Length",
            "X-Requested-With",
            "dirname",
            "filename",
            "filesize",
        ],
    })
);

// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/api", limiter, allRoutes);

//  Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Internal Server Error");
    next();
});

const startServer = async () => {
    try {
        await connectRedis(); 
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};

startServer();
