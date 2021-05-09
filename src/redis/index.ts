import * as redis from "redis";

export const redisHellsioPrefix = "hellsio-" as const;

const client = redis.createClient({
  port: process.env.REDISPORT || 6379,
} as redis.ClientOpts);

export default client;
