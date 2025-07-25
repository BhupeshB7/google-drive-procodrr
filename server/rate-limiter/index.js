import rateLimit from "express-rate-limit";

const getKey = (req) => {
    const ip = req.ip;
    const userId = req.signedCookies?.google_drive_session || "guest";
    return `${ip}_${userId}`;
};

const rateLimitHandler = (req, res, next, options) => {
    const resetTime = req.rateLimit?.resetTime;

    let error = options.message;

    if (resetTime) {
        const retryAfterSeconds = Math.ceil((resetTime - new Date()) / 1000);
        const minutes = Math.floor(retryAfterSeconds / 60);
        const seconds = retryAfterSeconds % 60;

        error += ` (${minutes}m ${seconds}s remaining)`;
    } else {
        error += " (try again later)";
    }

    return res.status(options.statusCode).json({
        success: false,
        status: options.statusCode,
        error, 
    });
};

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getKey,
    handler: (req, res, next, options) =>
        rateLimitHandler(req, res, next, {
            ...options,
            message: "Too many requests, please try again after 15 minutes",
        }),
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getKey,
    handler: (req, res, next, options) =>
        rateLimitHandler(req, res, next, {
            ...options,
            message: "Too many login requests, please try again after 15 minutes",
        }),
});

export const fileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1500,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getKey,
    handler: (req, res, next, options) =>
        rateLimitHandler(req, res, next, {
            ...options,
            message: "Too many file requests, please try again after 15 minutes",
        }),
});

export const directoryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getKey,
    handler: (req, res, next, options) =>
        rateLimitHandler(req, res, next, {
            ...options,
            message: "Too many directory requests, please try again after 15 minutes",
        }),
});