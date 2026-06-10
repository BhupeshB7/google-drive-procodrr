import redisClient from "../config/redis.js";

export const deleteCacheByPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error("Redis delete pattern error:", error);
  }
};
