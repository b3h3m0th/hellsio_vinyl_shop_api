import * as redis from "redis";

export const redisHellsioPrefix = "hellsio-" as const;

const client = redis.createClient({
  port: process.env.REDISPORT || 6379,
} as redis.ClientOpts);

client.on("error", (err: redis.RedisError) => {
  console.log(err);
});

client.on("message", (channel, message) => {
  console.log(channel, message);
});

export default client;
