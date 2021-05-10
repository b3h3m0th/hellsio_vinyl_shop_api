import * as redis from "redis";

export const redisHellsioPrefix = "hellsio-" as const;

const client = redis.createClient({
  port: process.env.REDISPORT || 6379,
  auth_pass: process.env.REDIS_AUTH || "",
} as redis.ClientOpts);

export default client;
