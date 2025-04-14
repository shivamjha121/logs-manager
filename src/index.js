import winston from "winston";
import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    appName: { type: String, required: true },
    level: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    method: { type: String },
    url: { type: String },
    statusCode: { type: Number },
    responseTime: { type: Number },
    requestBody: { type: Object },
    requestHeaders: { type: Object },
    responseBody: { type: Object },
    error: { type: Object },
});

const Log = mongoose.model("Log", logSchema);
const connectMongoDB = async (mongoUrl) => {
    try {
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        throw err;
    }
};

const createLogger = () => {
    return winston.createLogger({
        level: "info", // Minimum log level
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}]: ${message}`;
            })
        ),
        transports: [
            new winston.transports.Console({ format: winston.format.simple() }), // Console log
        ],
    });
};

const apiRequestLogger = (appName) => {
    const logger = createLogger();
    return async (req, res, next) => {
        const start = Date.now();
        const logDetails = {
            appName,
            level: "info",
            message: "API Logs",
            method: req.method,
            url: req.originalUrl,
            requestBody: req.body,
            requestHeaders: req.headers,
            timestamp: new Date(),
        };

        try {
            const originalSend = res.send;
            const originalJson = res.json;

            let responseBody = null;
            res.send = (body) => {
                responseBody = body;
                res.setHeader("Content-Type", "application/json");
                originalSend.call(res, body);
            };
            res.json = (body) => {
                responseBody = body;
                res.setHeader("Content-Type", "application/json");
                originalJson.call(res, body);
            };
            res.on("finish", async () => {
                const end = Date.now();
                const responseTime = end - start;
                const statusCode = res.statusCode;
                const responseLogDetails = {
                    ...logDetails,
                    statusCode,
                    responseTime,
                    responseHeaders: res.getHeaders(),
                    responseBody,
                };
                const responseLog = new Log(responseLogDetails);
                await responseLog.save();
                logger.info(`Response logged to MongoDB`);
            });

            next();
        } catch (error) {
            const end = Date.now();
            const responseTime = end - start;
            const statusCode = res.statusCode;
            const errorLogDetails = {
                ...logDetails,
                statusCode,
                responseTime,
                error: error.message,
                responseHeaders: res.getHeaders(),
                requestBody: req.body,
                requestHeaders: req.headers,
            };
            const errorLog = new Log(errorLogDetails);
            await errorLog.save();
            logger.error(`Error logged to MongoDB: ${error.message}`);
            next(error);
        }
    };
};
const logData = async (appName, level = "info", message, meta = {}) => {
    const logger = createLogger();
    const logEntry = new Log({
        appName,
        level,
        message,
        timestamp: new Date(),
        ...meta,
    });

    try {
        await logEntry.save();
        logger.log(level, message);
    } catch (error) {
        console.error("Error saving log to MongoDB:", error);
    }
};

export { connectMongoDB, apiRequestLogger, logData };
