import { RedisPubSub } from 'graphql-redis-subscriptions'
import * as Redis from 'ioredis'

const redisPort: number = process.env.PUBSUB_REDIS_PORT ? Number.parseInt(process.env.PUBSUB_REDIS_PORT) : 6379

const options = {
    host: process.env.PUBSUB_REDIS_URL || 'localhost',
    port: redisPort,
    retryStrategy: options => {
        // reconnect after
        return Math.max(options.attempt * 100, 3000);
    }
}

const pubsub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options)
})

export {
    pubsub
}