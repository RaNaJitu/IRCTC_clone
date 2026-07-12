import Redis from "ioredis"
import { env } from "./env"
import { LOGGER } from "./logger"
/**
 * SINGALTOON DESIGN PATTERN
 */
export class RedisClient {
    static instance: Redis | null = null;
    static isConnected = false;

    constructor(){

    }

    static getInstance(): Redis{
        if(!RedisClient.instance){
            RedisClient.instance = new Redis(env.REDIS_URL, {
                retryStrategy:(times: number) => {
                    const delay = Math.min(times * 50, 200);
                    return delay
                },
                maxRetriesPerRequest: 3
            });
            RedisClient.setupEventListners();
        }
        return RedisClient.instance
    }

    static setupEventListners(){
        if (!RedisClient.instance) return;

        RedisClient.instance.on("error", () => {});

    RedisClient.instance.on('close', ()=>{
        RedisClient.isConnected = false;
        LOGGER.warn("Redis Connection Close")
    })

    RedisClient.instance.on('reconnecting', ()=>{
        LOGGER.warn(" Re-Connection To Redis...")
    })

    RedisClient.instance.on('ready', ()=>{
        LOGGER.warn(" Re-Connection To Redis...")
    })

    RedisClient.instance.on('ready', ()=>{
        LOGGER.warn(" Re-Connection To Redis...")
    })
    }
}

// Create a single shared Redis instance
export const redis = RedisClient.getInstance();

export default redis;
