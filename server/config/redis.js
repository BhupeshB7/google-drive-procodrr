import { createClient } from "redis";

const redisClient = createClient();

redisClient.on("error", (err) => {
    console.log("Redis Client Error", err);
    process.exit(1);
});
 
export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log(" Redis connected");
    } else {
        console.log(" Redis already connected");
    }
};

export default redisClient;
