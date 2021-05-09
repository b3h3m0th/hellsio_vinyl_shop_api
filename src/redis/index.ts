import redis from "redis";

const client = redis.createClient({
  port: process.env.REDISPORT || 6379,
} as redis.ClientOpts);

export default client;
